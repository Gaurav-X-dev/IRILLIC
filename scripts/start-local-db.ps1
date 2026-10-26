$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $projectRoot ".local-postgres\data"
$logFile = Join-Path $projectRoot ".local-postgres\postgres.log"
$pgCtl = "C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe"

if (-not (Test-Path -LiteralPath $pgCtl)) { throw "PostgreSQL 16 is not installed at $pgCtl" }
if (-not (Test-Path -LiteralPath (Join-Path $dataDir "PG_VERSION"))) { throw "Local IRILLIC database is not initialized. Run scripts\bootstrap-local-db.ps1 first." }

$client = New-Object Net.Sockets.TcpClient
try { $client.Connect("127.0.0.1", 5433); Write-Host "IRILLIC PostgreSQL is already running on port 5433."; exit 0 }
catch { } finally { $client.Dispose() }
& $pgCtl -D $dataDir -l $logFile -o '"-p 5433 -h 127.0.0.1"' start
if ($LASTEXITCODE -ne 0) { throw "IRILLIC PostgreSQL could not be started. See $logFile" }
Write-Host "IRILLIC PostgreSQL started on 127.0.0.1:5433."
