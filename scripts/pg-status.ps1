$ErrorActionPreference = "Stop"

. "$PSScriptRoot\pg-read-config.ps1"

try {
  $null = Get-PgConfig
} catch {
  Write-Error $_
  exit 1
}

$pidFile = Join-Path $PSScriptRoot "pg.pid"
if (-not (Test-Path $pidFile)) {
  Write-Output "POSTGRES_STOPPED"
  exit 0
}

$pidRaw = Get-Content -Path $pidFile -Raw
$pid = 0
if (-not [int]::TryParse($pidRaw, [ref]$pid)) {
  Write-Output "POSTGRES_STOPPED"
  exit 0
}

$proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
if ($proc) {
  Write-Output "POSTGRES_RUNNING"
} else {
  Write-Output "POSTGRES_STOPPED"
}
