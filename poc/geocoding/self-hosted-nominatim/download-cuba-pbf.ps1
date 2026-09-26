[CmdletBinding()]
param(
  [string]$Url = "https://download.geofabrik.de/central-america/cuba-latest.osm.pbf",
  [string]$Output = ".\data\cuba-latest.osm.pbf",
  [string]$ExpectedSha256 = ""
)
$ErrorActionPreference = "Stop"
$directory = Split-Path -Parent $Output
if ($directory -and -not (Test-Path $directory)) { New-Item -ItemType Directory -Path $directory | Out-Null }
Invoke-WebRequest -Uri $Url -OutFile $Output
$hash = (Get-FileHash -Algorithm SHA256 -Path $Output).Hash.ToLowerInvariant()
Write-Host "SHA256=$hash"
if ($ExpectedSha256) {
  if ($hash -ne $ExpectedSha256.ToLowerInvariant()) { throw "SHA-256 mismatch." }
  Write-Host "SHA-256 verified."
} else {
  Write-Warning "No expected SHA-256 supplied; local hash is recorded only."
}