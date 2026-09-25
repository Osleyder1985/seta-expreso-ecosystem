[CmdletBinding()]
param(
  [int]$Repetitions = 5,
  [int]$RequestsPerOperation = 200,
  [int]$Concurrency = 16,
  [int]$WarmupRequests = 100,
  [switch]$AllowUnlockedDependencies
)
$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$runner = Join-Path $PSScriptRoot "run-benchmark.mjs"
$args = @("--repetitions=$Repetitions","--requests=$RequestsPerOperation","--concurrency=$Concurrency","--warmup=$WarmupRequests")
if ($AllowUnlockedDependencies) { $args += "--allow-unlocked-dependencies" }
node $runner @args
