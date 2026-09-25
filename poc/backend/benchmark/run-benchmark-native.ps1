param(
  [int]$Requests = 1000,
  [int]$Concurrency = 20,
  [int]$Runs = 5,
  [int]$WarmupRequests = 20,
  [string]$DatabaseUrl = $env:DATABASE_URL,
  [ValidateSet("create","list","get","update","delete")]
  [string]$Operation = "list"
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
$results = Join-Path $benchmarkDir ("native-results-{0}.jsonl" -f $Operation)
$metadata = Join-Path $benchmarkDir ("native-run-metadata-{0}.json" -f $Operation)
if (Test-Path $results) { Remove-Item $results -Force }

function Get-CommandVersion([string]$Command, [string[]]$Arguments) {
  try { return (& $Command @Arguments 2>&1 | Select-Object -First 1).ToString().Trim() }
  catch { return "unavailable" }
}

function Start-NativeProcess([string]$FilePath, [string[]]$ArgumentList, [string]$WorkingDirectory, [string]$StdOut, [string]$StdErr) {
  return Start-Process -FilePath $FilePath -ArgumentList $ArgumentList -WorkingDirectory $WorkingDirectory -RedirectStandardOutput $StdOut -RedirectStandardError $StdErr -PassThru -WindowStyle Hidden
}

function Wait-Health([string]$Url, [System.Diagnostics.Process]$Process, [string]$StdOut, [string]$StdErr) {
  $started = [System.Diagnostics.Stopwatch]::StartNew()
  for ($i = 0; $i -lt 60; $i++) {
    $Process.Refresh()
    if ($Process.HasExited) {
      $stdoutText = if (Test-Path $StdOut) { Get-Content $StdOut -Raw -ErrorAction SilentlyContinue } else { "" }
      $stderrText = if (Test-Path $StdErr) { Get-Content $StdErr -Raw -ErrorAction SilentlyContinue } else { "" }
      throw ("Native process exited before readiness. URL: {0}; ExitCode: {1}; STDOUT: {2}; STDERR: {3}" -f $Url, $Process.ExitCode, $stdoutText.Trim(), $stderrText.Trim())
    }
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        $started.Stop()
        return [math]::Round($started.Elapsed.TotalMilliseconds, 2)
      }
    } catch {}
    Start-Sleep -Milliseconds 500
  }
  $Process.Refresh()
  $stdoutText = if (Test-Path $StdOut) { Get-Content $StdOut -Raw -ErrorAction SilentlyContinue } else { "" }
  $stderrText = if (Test-Path $StdErr) { Get-Content $StdErr -Raw -ErrorAction SilentlyContinue } else { "" }
  throw ("Health endpoint did not become ready: {0}; process_exited={1}; exit_code={2}; STDOUT: {3}; STDERR: {4}" -f $Url, $Process.HasExited, ($(if ($Process.HasExited) { $Process.ExitCode } else { "running" })), $stdoutText.Trim(), $stderrText.Trim())
}

function Stop-NativeProcess([System.Diagnostics.Process]$Process) {
  if ($null -eq $Process) { return }
  if (-not $Process.HasExited) {
    try { $Process.Kill($true) } catch {}
    try { $Process.WaitForExit(5000) | Out-Null } catch {}
  }
}

function Convert-ToNpgsqlConnectionString([string]$ConnectionUri) {
  try {
    $uri = [System.Uri]$ConnectionUri
  } catch {
    throw "DATABASE_URL must be a valid PostgreSQL URI for the native benchmark, e.g. postgresql://user:password@host:port/database."
  }

  if ($uri.Scheme -notin @("postgresql", "postgres")) {
    throw "DATABASE_URL must use postgresql:// or postgres:// for the native benchmark."
  }

  $user = [System.Uri]::UnescapeDataString($uri.UserInfo.Split(":", 2)[0])
  $password = if ($uri.UserInfo.Contains(":")) {
    [System.Uri]::UnescapeDataString($uri.UserInfo.Split(":", 2)[1])
  } else {
    ""
  }
  $database = [System.Uri]::UnescapeDataString($uri.AbsolutePath.TrimStart("/"))
  if (-not $user -or -not $database) {
    throw "DATABASE_URL must include username and database."
  }

  function Quote-NpgsqlValue([string]$Value) {
    return '"' + $Value.Replace('"', '""') + '"'
  }

  $serverHost = if ($uri.HostNameType -eq [System.UriHostNameType]::IPv6) {
    "[" + $uri.Host + "]"
  } else {
    $uri.Host
  }
  $port = if ($uri.IsDefaultPort) { 5432 } else { $uri.Port }

  return "Host=$serverHost;Port=$port;Database=$(Quote-NpgsqlValue $database);Username=$(Quote-NpgsqlValue $user);Password=$(Quote-NpgsqlValue $password)"
}

function Reset-Database {
  $env:DATABASE_URL = $DatabaseUrl
  & node (Join-Path $benchmarkDir "reset-database.mjs")
  if ($LASTEXITCODE -ne 0) { throw "Database reset failed with exit code $LASTEXITCODE." }
}

function Invoke-HttpBenchmark([string]$Name, [string]$BaseUrl, [string]$BenchmarkOperation, [string[]]$Ids) {
  $idsArg = if ($Ids.Count -gt 0) { $Ids -join "," } else { "" }
  $output = node (Join-Path $benchmarkDir "http-benchmark.mjs") $Requests $Concurrency $WarmupRequests $Name $BaseUrl $BenchmarkOperation $idsArg
  if ($LASTEXITCODE -ne 0) { throw "HTTP benchmark failed for $Name." }
  return $output | ConvertFrom-Json
}

$aspDatabaseUrl = Convert-ToNpgsqlConnectionString $DatabaseUrl

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
  operation = $Operation
  command = ".\\run-benchmark-native.ps1 -Operation $Operation -Requests $Requests -Concurrency $Concurrency -Runs $Runs -WarmupRequests $WarmupRequests"
  postgres_container = try { (docker inspect seta-expreso-benchmark-postgres --format "{{.Config.Image}}|{{.Image}}|{{.State.Status}}").Trim() } catch { "unavailable" }
  note = "Native Windows measurements. DATABASE_URL uses PostgreSQL URI syntax for the Node.js candidate; the runner derives an equivalent ADO.NET/Npgsql connection string for ASP.NET Core. CPU is process CPU seconds consumed during the measured HTTP load; memory values are process snapshots after the measured load. Do not compare these resource metrics directly with Docker container snapshots."
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
# Clean up stale benchmark listeners before compiling. A previous interrupted run can leave
# a .NET/Node process holding bin artifacts open, causing MSB3021/MSB3027 during build.
Stop-ProcessOnPort 3000
Stop-ProcessOnPort 8081
Push-Location $nestDir
try { $nestBuild = Measure-Command { npm run build | Out-Host } } finally { Pop-Location }
if ($LASTEXITCODE -ne 0) { throw "NestJS build failed." }

Push-Location $aspDir
try { $aspBuild = Measure-Command { dotnet build (Join-Path $aspDir "SetaExpreso.Poc.csproj") --configuration Release | Out-Host } } finally { Pop-Location }
if ($LASTEXITCODE -ne 0) { throw "ASP.NET Core project build failed." }

$aspDll = Join-Path $aspDir "bin/Release/net10.0/SetaExpreso.Poc.dll"
if (-not (Test-Path $aspDll)) {
  throw "ASP.NET Core build completed without producing expected artifact: $aspDll"
}

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
    arguments = @("exec", $aspDll, "--urls", "http://127.0.0.1:8081")
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

    $seedCount = if ($Operation -eq "create") { 0 } elseif ($Operation -eq "delete") { $Requests + $WarmupRequests } else { $Requests }
    $seedIds = @()
    if ($seedCount -gt 0) {
      $seedJson = node (Join-Path $benchmarkDir "seed-packages.mjs") $seedCount $DatabaseUrl
      if ($LASTEXITCODE -ne 0) { throw "Database seed failed with exit code $LASTEXITCODE." }
      $seedIds = @($seedJson | ConvertFrom-Json | ForEach-Object { [string]$_ })
      if ($seedIds.Count -lt $seedCount) { throw "Database seed returned fewer IDs than requested." }
    }

    $stdoutBase = if ($target.name -eq "nestjs") { $nestStdOut } else { $aspStdOut }
    $stderrBase = if ($target.name -eq "nestjs") { $nestStdErr } else { $aspStdErr }
    $stdout = "$stdoutBase.$run.log"
    $stderr = "$stderrBase.$run.log"
    $port = if ($target.name -eq "nestjs") { 3000 } else { 8081 }

    # El runner puede haber quedado interrumpido en una ejecución anterior.
    # Los puertos 3000/8081 están reservados para este benchmark.
    Stop-ProcessOnPort $port

    if ($target.name -eq "nestjs") {
      $env:DATABASE_URL = $DatabaseUrl
    } else {
      $env:DATABASE_URL = $aspDatabaseUrl
    }
    $process = $null
    try {
      $process = Start-NativeProcess $target.command $target.arguments $target.working_directory $stdout $stderr
      $startupMs = Wait-Health $target.health_url $process $stdout $stderr
      $process.Refresh()
      $cpuBefore = $process.TotalProcessorTime.TotalSeconds
      $benchmark = Invoke-HttpBenchmark $target.name $target.url $Operation $seedIds
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
