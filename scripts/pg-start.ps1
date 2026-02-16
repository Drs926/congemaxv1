$ErrorActionPreference = "Stop"

. "$PSScriptRoot\pg-read-config.ps1"

try {
  $pg = Get-PgConfig
} catch {
  Write-Error $_
  exit 1
}

$pidFile = Join-Path $PSScriptRoot "pg.pid"
if (Test-Path $pidFile) {
  $existingPidRaw = Get-Content -Path $pidFile -Raw
  $existingPid = 0
  if ([int]::TryParse($existingPidRaw, [ref]$existingPid)) {
    $existing = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
    if ($existing) {
      Write-Output "POSTGRES_STARTED_PID=$existingPid"
      exit 0
    }
  }
}

$proc = Start-Process $pg.PostgresExe `
  -ArgumentList "-D `"$($pg.DataDir)`" -p 5432" `
  -PassThru -WindowStyle Hidden

Set-Content -Path $pidFile -Value $proc.Id
Write-Output "POSTGRES_STARTED_PID=$($proc.Id)"
