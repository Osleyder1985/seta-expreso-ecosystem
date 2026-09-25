param(
  [int]$Requests = 1000,
  [int]$Concurrency = 20,
  [int]$Runs = 5,
  [int]$WarmupRequests = 20
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if ($Requests -lt 1 -or $Concurrency -lt 1 -or $Runs -lt 1 -or $WarmupRequests -lt 0) {
  throw "Requests, Concurrency and Runs must be >= 1; WarmupRequests must be >= 0."
}

$root = Split-Path -Parent $PSScriptRoot
$results = Join-Path $PSScriptRoot "results.jsonl"
$metadata = Join-Path $PSScriptRoot "run-metadata.json"
if (Test-Path $results) { Remove-Item $results -Force }

function Get-CommandVersion([string]$Command, [string[]]$Arguments) {
  try { return (& $Command @Arguments 2>&1 | Select-Object -First 1).ToString().Trim() }
  catch { return "unavailable" }
}

function Wait-Health([string]$Url) {
  $started = [System.Diagnostics.Stopwatch]::StartNew()
  for ($i = 0; $i -lt 60; $i++) {
    try {
      $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
      if ($r.StatusCode -eq 200) {
        $started.Stop()
        return [math]::Round($started.Elapsed.TotalMilliseconds, 2)
      }
    } catch {}
    Start-Sleep -Milliseconds 500
  }
  throw "Health endpoint did not become ready: $Url"
}

function Get-ContainerSnapshot([string]$ComposeDir, [string]$Service) {
  Push-Location $ComposeDir
  try {
    $line = docker compose ps -q $Service
    if (-not $line) { throw "Container for service '$Service' was not found." }
    $stats = docker stats $line --no-stream --format "{{.MemUsage}}|{{.CPUPerc}}"
    $parts = $stats -split "|"
    return @{ memory = $parts[0]; cpu_pct = $parts[1] }
  } finally { Pop-Location }
}

$repoDir = Split-Path -Parent (Split-Path -Parent $root)
$metadataObject = [ordered]@{
  timestamp_utc = (Get-Date).ToUniversalTime().ToString("o")
  commit_sha = (git -C $repoDir rev-parse HEAD).Trim()
  operating_system = (Get-CimInstance Win32_OperatingSystem).Caption
  os_version = [Environment]::OSVersion.VersionString
  os_build = (Get-CimInstance Win32_OperatingSystem).BuildNumber
  cpu = (Get-CimInstance Win32_Processor | Select-Object -First 1 -ExpandProperty Name)
  logical_processors = [Environment]::ProcessorCount
  physical_memory_gb = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
  docker_version = Get-CommandVersion "docker" @("--version")
  docker_compose_version = Get-CommandVersion "docker" @("compose","version")
  node_version = Get-CommandVersion "node" @("--version")
  dotnet_version = Get-CommandVersion "dotnet" @("--version")
  requests = $Requests
  concurrency = $Concurrency
  runs = $Runs
  warmup_requests = $WarmupRequests
  endpoint = "/packages"
  note = "Each candidate is measured in isolation. memory and CPU are post-run container snapshots, not workload averages."
}
$metadataObject | ConvertTo-Json | Set-Content -Encoding UTF8 $metadata

function Build-Target([string]$ComposeDir) {
  Push-Location $ComposeDir
  try {
    $timer = Measure-Command { docker compose build api | Out-Host }
    return [math]::Round($timer.TotalMilliseconds)
  } finally { Pop-Location }
}

function Run-Target([string]$Name, [string]$Url, [string]$HealthUrl, [string]$ComposeDir, [int]$BuildMs) {
  Push-Location $ComposeDir
  try {
    docker compose up -d
    $startupMs = Wait-Health $HealthUrl
  } finally { Pop-Location }

  try {
    $output = node (Join-Path $PSScriptRoot "http-benchmark.mjs") $Requests $Concurrency $WarmupRequests $Name $Url
    $result = $output | ConvertFrom-Json
    $snapshot = Get-ContainerSnapshot $ComposeDir "api"
    $result | Add-Member -NotePropertyName build_ms -NotePropertyValue $BuildMs
    $result | Add-Member -NotePropertyName startup_ms -NotePropertyValue $startupMs
    $result | Add-Member -NotePropertyName memory_snapshot -NotePropertyValue $snapshot.memory
    $result | Add-Member -NotePropertyName cpu_pct_snapshot -NotePropertyValue $snapshot.cpu_pct
    $result | ConvertTo-Json -Compress | Add-Content -Encoding UTF8 $results
  } finally {
    Push-Location $ComposeDir
    try { docker compose down -v } finally { Pop-Location }
  }
}

$nestDir = Join-Path $root "nestjs"
$aspDir = Join-Path $root "aspnet-core"
$nestBuildMs = Build-Target $nestDir
$aspBuildMs = Build-Target $aspDir

for ($run = 1; $run -le $Runs; $run++) {
  Write-Host "=== Run $run/$Runs ==="
  if ($run % 2 -eq 1) {
    Run-Target "nestjs" "http://localhost:3000" "http://localhost:3000/health" $nestDir $nestBuildMs
    Run-Target "aspnet-core" "http://localhost:8081" "http://localhost:8081/health" $aspDir $aspBuildMs
  } else {
    Run-Target "aspnet-core" "http://localhost:8081" "http://localhost:8081/health" $aspDir $aspBuildMs
    Run-Target "nestjs" "http://localhost:3000" "http://localhost:3000/health" $nestDir $nestBuildMs
  }
}
