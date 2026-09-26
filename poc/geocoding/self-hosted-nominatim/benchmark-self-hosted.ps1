[CmdletBinding()]
param(
  [string]$Dataset = "..\geocoding-cuba-benchmark-dataset-v0.1.jsonl",
  [string]$Output = ".\results-nominatim-self-hosted.jsonl",
  [string]$Manifest = ".\provenance-nominatim-self-hosted.json",
  [int]$IntervalMs = 100
)
$ErrorActionPreference = "Stop"
$env:GEOCODING_PROVIDER = "nominatim"
$env:NOMINATIM_BASE_URL = "http://localhost:8080/search"
$env:NOMINATIM_USER_AGENT = "SETA-EXPRESO-Nominatim-PoC/0.1"
$env:GEOCODING_INTERVAL_MS = "$IntervalMs"
node "..\runner\run-geocoding-benchmark.mjs" $Dataset $Output $Manifest
