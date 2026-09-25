param(
  [int]$Requests = 1000,
  [int]$Concurrency = 20,
  [int]$Runs = 5,
  [int]$WarmupRequests = 20,
  [string]$DatabaseUrl = $env:DATABASE_URL
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if ($Requests -lt 1 -or $Concurrency -lt 1 -or $Runs -lt 1 -or $WarmupRequests -lt 0) {
  throw "Requests, Concurrency and Runs must be >= 1; WarmupRequests must be >= 0."
}
if (-not $DatabaseUrl) {
  throw "DATABASE_URL is required."
}

$benchmarkDir = $PSScriptRoot
$root = Split-Path -Parent $benchmarkDir
$repoDir = Split-Path -Parent (Split-Path -Parent $root)
$results = Join-Path $benchmarkDir "native-results.jsonl"
$metadata = Join-Path $benchmarkDir "native-run-metadata.json"
if (Test-Path $results) { Remove-Item $results -Force }

function Get-CommandVersion([string]$Command, [string[]]$Arguments) {
  try { return (& $Command @Arguments 2>&1 | Select-Object -First 1).ToString().Trim() }
  catch { return "unavailable" }
}

function Start-NativeProcess([string]$FilePath, [string[]]$ArgumentList, [string]$WorkingDirectory, [string]$StdOut, [string]$StdErr) {
  return Start-Process -FilePath $FilePath -ArgumentList $ArgumentList -WorkingDirectory $WorkingDirectory -RedirectStandardOutput $StdOut -RedirectStandardError $StdErr -PassThru -WindowStyle Hidden
}

function Wait-Health([string]$Url) {
  $started = [System.Diagnostics.Stopwatch]::StartNew()
  for ($i = 0; $i -lt 60; $i++) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        $started.Stop()
        return [math]::Round($started.Elapsed.TotalMilliseconds, 2)
      }
    } catch {}
    Start-Sleep -Milliseconds 500
  }
  throw "Health endpoint did not become ready: $Url"
}

function Stop-NativeProcess([System.Diagnostics.Process]$Process) {
  if ($null -eq $Process) { return }
  if (-not $Process.HasExited) {
    try { $Process.Kill($true) } catch {}
    try { $Process.WaitForExit(5000) | Out-Null } catch {}
  }
}

function Reset-Database {
  $env:DATABASE_URL = $DatabaseUrl
  & node (Join-Path $benchmarkDir "reset-database.mjs")
  if ($LASTEXITCODE -ne 0) { throw "Database reset failed with exit code $LASTEXITCODE." }
}

function Invoke-HttpBenchmark([string]$Name, [string]$BaseUrl) {
  $output = node (Join-Path $benchmarkDir "http-benchmark.mjs") $Requests $Concurrency $WarmupRequests $Name $BaseUrl
  if ($LASTEXITCODE -ne 0) { throw "HTTP benchmark failed for $Name." }
  return $output | ConvertFrom-Json
}

$metadataObject = [ordered]@{
  timestamp_utc = (Get-Date).ToUniversalTime().ToString("o")
  commit_sha = (git -C $repoDir rev-parse HEAD).Trim()
  execution_profile = "native-windows"
  operating_system = (Get-CimInstance Win32_OperatingSystem).Caption
  os_version = [Environment]::OSVersion.VersionString
  os_build = (Get-CimInstance Win32_OperatingSystem).BuildNumber
  cpu = (Get-CimInstance Win32_Processor | Select-Object -First 1 -ExpandProperty Name)
  logical_processors = [Environment]::ProcessorCount
  physical_memory_gb = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
  node_version = Get-CommandVersion "node" @("--version")
  npm_version = Get-CommandVersion "npm" @("--version")
  dotnet_version = Get-CommandVersion "dotnet" @("--version")
  requests = $Requests
  concurrency = $Concurrency
  runs = $Runs
  warmup_requests = $WarmupRequests
  endpoint = "/packages"
  note = "Native Windows measurements. CPU is process CPU seconds consumed during the measured HTTP load; memory values are process snapshots after the measured load. Do not compare these resource metrics directly with Docker container snapshots."
}
$metadataObject | ConvertTo-Json | Set-Content -Encoding UTF8 $metadata

$nestDir = Join-Path $root "nestjs"
$aspDir = Join-Path $root "aspnet-core"
$nestStdOut = Join-Path $benchmarkDir "native-nestjs.stdout.log"
$nestStdErr = Join-Path $benchmarkDir "native-nestjs.stderr.log"
$aspStdOut = Join-Path $benchmarkDir "native-aspnet.stdout.log"
$aspStdErr = Join-Path $benchmarkDir "native-aspnet.stderr.log"

function Stop-ProcessOnPort([int]$Port) {
  try {
    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($connection in $connections) {
      if ($connection.OwningProcess -gt 0) {
        try { Stop-Process -Id $connection.OwningProcess -Force -ErrorAction Stop } catch {}
      }
    }
  } catch {}
}

Write-Host "=== Native build ==="
Push-Location $nestDir
try { $nestBuild = Measure-Command { npm run build | Out-Host } } finally { Pop-Location }
if ($LASTEXITCODE -ne 0) { throw "NestJS build failed." }

Push-Location $aspDir
try { $aspBuild = Measure-Command { dotnet build --configuration Release | Out-Host } } finally { Pop-Location }
if ($LASTEXITCODE -ne 0) { throw "ASP.NET Core build failed." }

$nestBuildMs = [math]::Round($nestBuild.TotalMilliseconds, 2)
$aspBuildMs = [math]::Round($aspBuild.TotalMilliseconds, 2)

$targets = @(
  [ordered]@{
    name = "nestjs"
    command = "node"
    arguments = @((Join-Path $nestDir "dist/main.js"))
    working_directory = $nestDir
    url = "http://127.0.0.1:3000"
    health_url = "http://127.0.0.1:3000/health"
    build_ms = $nestBuildMs
  },
  [ordered]@{
    name = "aspnet-core"
    command = "dotnet"
    arguments = @("exec", (Join-Path $aspDir "bin/Release/net10.0/SetaExpreso.Poc.dll"), "--urls", "http://127.0.0.1:8081")
    working_directory = $aspDir
    url = "http://127.0.0.1:8081"
    health_url = "http://127.0.0.1:8081/health"
    build_ms = $aspBuildMs
  }
)

for ($run = 1; $run -le $Runs; $run++) {
  Write-Host "=== Native run $run/$Runs ==="
  $orderedTargets = if ($run % 2 -eq 1) { $targets } else { @($targets[1], $targets[0]) }

  foreach ($target in $orderedTargets) {
    Write-Host "--- $($target.name) ---"
    Reset-Database

    $stdoutBase = if ($target.name -eq "nestjs") { $nestStdOut } else { $aspStdOut }
    $stderrBase = if ($target.name -eq "nestjs") { $nestStdErr } else { $aspStdErr }
    $stdout = "$stdoutBase.$run.log"
    $stderr = "$stderrBase.$run.log"
    $port = if ($target.name -eq "nestjs") { 3000 } else { 8081 }

    # El runner puede haber quedado interrumpido en una ejecución anterior.
    # Los puertos 3000/8081 están reservados para este benchmark.
    Stop-ProcessOnPort $port

    $env:DATABASE_URL = $DatabaseUrl
    $process = $null
    try {
      $process = Start-NativeProcess $target.command $target.arguments $target.working_directory $stdout $stderr
      $startupMs = Wait-Health $target.health_url
      $process.Refresh()
      $cpuBefore = $process.TotalProcessorTime.TotalSeconds
      $benchmark = Invoke-HttpBenchmark $target.name $target.url
      $process.Refresh()
      $cpuAfter = $process.TotalProcessorTime.TotalSeconds
      $result = [ordered]@{
        implementation = $benchmark.implementation
        requests = $benchmark.requests
        concurrency = $benchmark.concurrency
        warmup_requests = $benchmark.warmup_requests
        elapsed_ms = $benchmark.elapsed_ms
        throughput_rps = $benchmark.throughput_rps
        p50_ms = $benchmark.p50_ms
        p95_ms = $benchmark.p95_ms
        error_rate = $benchmark.error_rate
        build_ms_native = $target.build_ms
        startup_ms = $startupMs
        cpu_seconds_delta = [math]::Round(($cpuAfter - $cpuBefore), 4)
        memory_working_set_mb = [math]::Round($process.WorkingSet64 / 1MB, 2)
        private_memory_mb = [math]::Round($process.PrivateMemorySize64 / 1MB, 2)
        execution_profile = "native-windows"
        run = $run
      }
      $result | ConvertTo-Json -Compress | Add-Content -Encoding UTF8 $results
    } finally {
      Stop-NativeProcess $process
    }
  }
}
Write-Host "Native benchmark completed. Results: $results"
