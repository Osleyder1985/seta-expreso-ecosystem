param(
  [int]$Requests = 200,
  [int]$Concurrency = 10,
  [int]$Runs = 5
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$root = Split-Path -Parent $PSScriptRoot
$results = Join-Path $PSScriptRoot "results.jsonl"

if ($Runs -lt 1) { throw "Runs must be >= 1." }
if ($Requests -lt 1) { throw "Requests must be >= 1." }
if ($Concurrency -lt 1) { throw "Concurrency must be >= 1." }

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
    $raw = node (Join-Path $PSScriptRoot "http-benchmark.mjs") $Requests $Concurrency "nestjs" "http://localhost:3000" "aspnet-core" "http://localhost:8081"
    foreach ($line in ($raw -split "\r?\n")) {
      if ([string]::IsNullOrWhiteSpace($line)) { continue }
      $record = $line | ConvertFrom-Json
      $stats = docker stats --no-stream --format "{{.Name}}|{{.MemUsage}}|{{.CPUPerc}}"
      $memoryMb = $null
      $cpuPct = $null
      foreach ($stat in ($stats -split "\r?\n")) {
        if ($stat -like "*api*") {
          $parts = $stat -split "\|"
          if ($parts.Count -ge 3) {
            if ($parts[1] -match "([0-9.]+)MiB") { $memoryMb = [math]::Round([double]$Matches[1], 2) }
            if ($parts[2] -match "([0-9.]+)%") { $cpuPct = [math]::Round([double]$Matches[1], 2) }
          }
        }
      }

      $record | Add-Member -NotePropertyName run -NotePropertyValue $run
      $record | Add-Member -NotePropertyName build_ms -NotePropertyValue $(if ($record.implementation -eq "nestjs") { $nestBuildMs } else { $aspBuildMs })
      $record | Add-Member -NotePropertyName startup_ms -NotePropertyValue $(if ($record.implementation -eq "nestjs") { $nestStartupMs } else { $aspStartupMs })
      $record | Add-Member -NotePropertyName memory_mb -NotePropertyValue $memoryMb
      $record | Add-Member -NotePropertyName cpu_pct -NotePropertyValue $cpuPct
      $record | Add-Member -NotePropertyName image_size_mb -NotePropertyValue $(if ($record.implementation -eq "nestjs") { $nestImageMb } else { $aspImageMb })
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
