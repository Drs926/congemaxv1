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
  Write-Error "Missing scripts/pg.pid. Start PostgreSQL with scripts/pg-start.ps1 first."
  exit 1
}

$pidRaw = Get-Content -Path $pidFile -Raw
$pid = 0
if (-not [int]::TryParse($pidRaw, [ref]$pid)) {
  Write-Error "Invalid PID in scripts/pg.pid."
  exit 1
}

$proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
if ($proc) {
  Stop-Process -Id $pid -Force
}

Remove-Item -Path $pidFile -ErrorAction SilentlyContinue
Write-Output "POSTGRES_STOPPED_PID=$pid"
