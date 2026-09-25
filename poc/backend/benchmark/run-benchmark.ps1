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
  for ($i = 0; $i -lt 60; $i++) {
    try {
      $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
      if ($r.StatusCode -eq 200) { return }
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

$timestamp = (Get-Date).ToUniversalTime().ToString("o")
$metadataObject = [ordered]@{
  timestamp_utc = $timestamp
  commit_sha = (git -C (Split-Path -Parent (Split-Path -Parent $root)) rev-parse HEAD).Trim()
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
  note = "memory and CPU are post-run container snapshots, not workload averages."
}
$metadataObject | ConvertTo-Json | Set-Content -Encoding UTF8 $metadata

function Run-Target([string]$Name, [string]$Url, [string]$ComposeDir, [string]$Service) {
  $output = node (Join-Path $PSScriptRoot "http-benchmark.mjs") $Requests $Concurrency $WarmupRequests $Name $Url
  $result = $output | ConvertFrom-Json
  $snapshot = Get-ContainerSnapshot $ComposeDir $Service
  $result | Add-Member -NotePropertyName memory_snapshot -NotePropertyValue $snapshot.memory
  $result | Add-Member -NotePropertyName cpu_pct_snapshot -NotePropertyValue $snapshot.cpu_pct
  $result | ConvertTo-Json -Compress | Tee-Object -FilePath $results -Append
}

$nestDir = Join-Path $root "nestjs"
$aspDir = Join-Path $root "aspnet-core"

try {
  Push-Location $nestDir
  $nestBuildTimer = Measure-Command { docker compose build api | Out-Host }
  $nestBuildMs = [math]::Round($nestBuildTimer.TotalMilliseconds)
  Pop-Location

  Push-Location $aspDir
  $aspBuildTimer = Measure-Command { docker compose build api | Out-Host }
  $aspBuildMs = [math]::Round($aspBuildTimer.TotalMilliseconds)
  Pop-Location

  for ($run = 1; $run -le $Runs; $run++) {
    Write-Host "=== Run $run/$Runs ==="

    Push-Location $nestDir; docker compose up -d --wait; Pop-Location
    Push-Location $aspDir; docker compose up -d; Pop-Location

    try {
      Wait-Health "http://localhost:3000/health"
      Wait-Health "http://localhost:8081/health"

      if ($run % 2 -eq 1) {
        Run-Target "nestjs" "http://localhost:3000" $nestDir "api"
        Run-Target "aspnet-core" "http://localhost:8081" $aspDir "api"
      } else {
        Run-Target "aspnet-core" "http://localhost:8081" $aspDir "api"
        Run-Target "nestjs" "http://localhost:3000" $nestDir "api"
      }
    } finally {
      Push-Location $nestDir; docker compose down -v; Pop-Location
      Push-Location $aspDir; docker compose down -v; Pop-Location
    }
  }

  $buildRecord = [ordered]@{
    type = "build"
    nestjs_build_ms = $nestBuildMs
    aspnet_core_build_ms = $aspBuildMs
  }
  $buildRecord | ConvertTo-Json -Compress | Add-Content -Encoding UTF8 $results
} finally {
  Push-Location $nestDir; docker compose down -v 2>$null; Pop-Location
  Push-Location $aspDir; docker compose down -v 2>$null; Pop-Location
}
