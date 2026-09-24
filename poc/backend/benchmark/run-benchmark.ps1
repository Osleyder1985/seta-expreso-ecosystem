param(
  [int]$Requests = 200,
  [int]$Concurrency = 10
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$root = Split-Path -Parent $PSScriptRoot
$results = Join-Path $PSScriptRoot "results.jsonl"

function Wait-Health([string]$Url) {
  for ($i=0; $i -lt 60; $i++) {
    try {
      $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
      if ($r.StatusCode -eq 200) { return }
    } catch {}
    Start-Sleep -Milliseconds 500
  }
  throw "Health endpoint did not become ready: $Url"
}

Write-Host "Building and starting NestJS..."
Push-Location (Join-Path $root "nestjs")
$nestBuild = Measure-Command { docker compose build api | Out-Host }
docker compose up -d --wait
Pop-Location

Write-Host "Building and starting ASP.NET Core..."
Push-Location (Join-Path $root "aspnet-core")
$aspBuild = Measure-Command { docker compose build api | Out-Host }
docker compose up -d
Pop-Location

try {
  Wait-Health "http://localhost:3000/health"
  Wait-Health "http://localhost:8081/health"

  node (Join-Path $PSScriptRoot "http-benchmark.mjs") $Requests $Concurrency "nestjs" "http://localhost:3000" "aspnet-core" "http://localhost:8081" | Tee-Object -FilePath $results

  Write-Host ""
  Write-Host "Build times:"
  Write-Host ("nestjs_ms={0}" -f [math]::Round($nestBuild.TotalMilliseconds))
  Write-Host ("aspnet_core_ms={0}" -f [math]::Round($aspBuild.TotalMilliseconds))
  Write-Host ""
  Write-Host "Container memory snapshot:"
  docker stats --no-stream --format "{{.Name}},{{.MemUsage}},{{.CPUPerc}}"
}
finally {
  Push-Location (Join-Path $root "nestjs"); docker compose down -v; Pop-Location
  Push-Location (Join-Path $root "aspnet-core"); docker compose down -v; Pop-Location
}