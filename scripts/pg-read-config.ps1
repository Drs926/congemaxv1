function Get-PgConfig {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  $configPath = Join-Path $scriptDir "local.dev.json"

  if (-not (Test-Path $configPath)) {
    throw "Missing scripts/local.dev.json. Copy scripts/local.dev.example.json to scripts/local.dev.json and set pg_base."
  }

  try {
    $config = Get-Content -Path $configPath -Raw | ConvertFrom-Json
  } catch {
    throw "Invalid scripts/local.dev.json. Ensure it is valid JSON with { `"pg_base`": `"C:/path/to/_pg`" }."
  }

  $pgBase = [string]$config.pg_base
  if ([string]::IsNullOrWhiteSpace($pgBase)) {
    throw "Missing pg_base in scripts/local.dev.json. Example: { `"pg_base`": `"C:/path/to/_pg`" }."
  }

  $postgresExe = Join-Path $pgBase "pgsql/bin/postgres.exe"
  $psqlExe = Join-Path $pgBase "pgsql/bin/psql.exe"
  $dataDir = Join-Path $pgBase "data_local"

  if (-not (Test-Path $postgresExe)) {
    throw "Missing postgres.exe at $postgresExe."
  }
  if (-not (Test-Path $psqlExe)) {
    throw "Missing psql.exe at $psqlExe."
  }
  if (-not (Test-Path $dataDir)) {
    throw "Missing data directory at $dataDir."
  }

  return [PSCustomObject]@{
    PgBase = $pgBase
    PostgresExe = $postgresExe
    PsqlExe = $psqlExe
    DataDir = $dataDir
  }
}
