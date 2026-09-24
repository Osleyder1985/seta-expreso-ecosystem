param(
  [int]$Requests = 200,
  [int]$Concurrency = 10,
  [int]$Runs = 5,
  [int]$WarmupRequests = 20
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$root = Split-Path -Parent $PSScriptRoot
$results = Join-Path $PSScriptRoot "results.jsonl"
$commitSha = (git rev-parse HEAD 2>$null).Trim()
if (-not $commitSha) { $commitSha = $null }


if ($Runs -lt 1) { throw "Runs must be >= 1." }
if ($Requests -lt 1) { throw "Requests must be >= 1." }
if ($Concurrency -lt 1) { throw "Concurrency must be >= 1." }
if ($WarmupRequests -lt 0) { throw "WarmupRequests must be >= 0." }

Remove-Item $results -ErrorAction SilentlyContinue

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

function Get-ImageSizeMb([string]$ComposeDir) {
  Push-Location $ComposeDir
  try {
    $imageId = (docker compose images -q api).Trim()
    if (-not $imageId) { return $null }
    $bytes = [double](docker image inspect $imageId --format "{{.Size}}")
    return [math]::Round($bytes / 1MB, 2)
  } finally {
    Pop-Location
  }
}

function Get-MemoryMb([string]$usage) {
  if ($usage -match "([0-9.]+)GiB") { return [math]::Round([double]$Matches[1] * 1024, 2) }
  if ($usage -match "([0-9.]+)MiB") { return [math]::Round([double]$Matches[1], 2) }
  if ($usage -match "([0-9.]+)KiB") { return [math]::Round([double]$Matches[1] / 1024, 2) }
  if ($usage -match "([0-9.]+)B") { return [math]::Round([double]$Matches[1] / 1MB, 2) }
  return $null
}

function Get-ContainerStats([string]$Implementation) {
  $stats = docker stats --no-stream --format "{{.Name}}|{{.MemUsage}}|{{.CPUPerc}}"
  $targetPattern = if ($Implementation -eq "nestjs") { "*nestjs*api*" } else { "*aspnet-core*api*" }

  foreach ($stat in ($stats -split "?
")) {
    if ($stat -like $targetPattern) {
      $parts = $stat -split "|"
      if ($parts.Count -ge 3) {
        return @{
          memory_mb = Get-MemoryMb $parts[1]
          cpu_pct = if ($parts[2] -match "([0-9.]+)%") { [math]::Round([double]$Matches[1], 2) } else { $null }
        }
      }
    }
  }

  return @{ memory_mb = $null; cpu_pct = $null }
}

function Invoke-TargetBenchmark([string]$Implementation, [string]$Url) {
  $raw = node (Join-Path $PSScriptRoot "http-benchmark.mjs") $Requests $Concurrency $WarmupRequests $Implementation $Url
  if ($LASTEXITCODE -ne 0) { throw "HTTP benchmark failed for $Implementation." }
  $record = $raw | ConvertFrom-Json
  $stats = Get-ContainerStats $Implementation
  $record | Add-Member -NotePropertyName memory_mb -NotePropertyValue $stats.memory_mb
  $record | Add-Member -NotePropertyName cpu_pct -NotePropertyValue $stats.cpu_pct
  return $record
}

$nestDir = Join-Path $root "nestjs"
$aspDir = Join-Path $root "aspnet-core"

try {
  Write-Host "Building NestJS..."
  Push-Location $nestDir
  $nestBuild = Measure-Command { docker compose build api | Out-Host }
  Pop-Location

  Write-Host "Building ASP.NET Core..."
  Push-Location $aspDir
  $aspBuild = Measure-Command { docker compose build api | Out-Host }
  Pop-Location

  $nestBuildMs = [math]::Round($nestBuild.TotalMilliseconds)
  $aspBuildMs = [math]::Round($aspBuild.TotalMilliseconds)
  $nestImageMb = Get-ImageSizeMb $nestDir
  $aspImageMb = Get-ImageSizeMb $aspDir

  Write-Host "Starting NestJS..."
  Push-Location $nestDir
  $nestStartup = Measure-Command { docker compose up -d | Out-Host; Wait-Health "http://localhost:3000/health" }
  Pop-Location

  Write-Host "Starting ASP.NET Core..."
  Push-Location $aspDir
  $aspStartup = Measure-Command { docker compose up -d | Out-Host; Wait-Health "http://localhost:8081/health" }
  Pop-Location

  $nestStartupMs = [math]::Round($nestStartup.TotalMilliseconds)
  $aspStartupMs = [math]::Round($aspStartup.TotalMilliseconds)

  for ($run = 1; $run -le $Runs; $run++) {
    Write-Host "Benchmark run $run/$Runs..."

    $order = if ($run % 2 -eq 1) {
      @(
        @{ implementation = "nestjs"; url = "http://localhost:3000" }
        @{ implementation = "aspnet-core"; url = "http://localhost:8081" }
      )
    } else {
      @(
        @{ implementation = "aspnet-core"; url = "http://localhost:8081" }
        @{ implementation = "nestjs"; url = "http://localhost:3000" }
      )
    }

    foreach ($target in $order) {
      $record = Invoke-TargetBenchmark $target.implementation $target.url
      $record | Add-Member -NotePropertyName run -NotePropertyValue $run
      $record | Add-Member -NotePropertyName build_ms -NotePropertyValue $(if ($target.implementation -eq "nestjs") { $nestBuildMs } else { $aspBuildMs })
      $record | Add-Member -NotePropertyName startup_ms -NotePropertyValue $(if ($target.implementation -eq "nestjs") { $nestStartupMs } else { $aspStartupMs })
      $record | Add-Member -NotePropertyName image_size_mb -NotePropertyValue $(if ($target.implementation -eq "nestjs") { $nestImageMb } else { $aspImageMb })
      ($record | ConvertTo-Json -Compress) | Add-Content -Path $results
    }
  }

  Write-Host ""
  Write-Host "Raw results: $results"
}
finally {
  Push-Location $nestDir; docker compose down -v; Pop-Location
  Push-Location $aspDir; docker compose down -v; Pop-Location
}


function Get-CommandVersion([string]$Command, [string[]]$Arguments) {
  try {
    $output = & $Command @Arguments 2>&1
    if ($LASTEXITCODE -eq 0) { return (($output | Out-String).Trim()) }
  } catch {}
  return $null
}

function Write-RunMetadata([string]$CommitSha) {
  $os = Get-CimInstance Win32_OperatingSystem
  $computer = Get-CimInstance Win32_ComputerSystem
  $processor = Get-CimInstance Win32_Processor | Select-Object -First 1
  $dockerVersion = Get-CommandVersion "docker" @("--version")
  $composeVersion = Get-CommandVersion "docker" @("compose", "version")
  $nodeVersion = Get-CommandVersion "node" @("--version")
  $metadata = [ordered]@{
    timestamp_utc = (Get-Date).ToUniversalTime().ToString("o")
    commit_sha = $CommitSha
    operating_system = $os.Caption
    os_version = $os.Version
    os_build = $os.BuildNumber
    cpu = $processor.Name
    logical_processors = $processor.NumberOfLogicalProcessors
    physical_memory_gb = [math]::Round($computer.TotalPhysicalMemory / 1GB, 2)
    docker_version = $dockerVersion
    docker_compose_version = $composeVersion
    node_version = $nodeVersion
    requests = $Requests
    concurrency = $Concurrency
    runs = $Runs
    warmup_requests = $WarmupRequests
    endpoint = "/packages"
    memory_cpu_note = "memory_mb and cpu_pct are post-run container snapshots, not workload averages."
  }
  $metadata | ConvertTo-Json | Set-Content -Path (Join-Path $PSScriptRoot "run-metadata.json") -Encoding utf8
}

Write-RunMetadata $commitSha
