$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $projectRoot ".local-postgres\data"
$pgCtl = "C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe"
if (-not (Test-Path -LiteralPath (Join-Path $dataDir "PG_VERSION"))) { Write-Host "Local IRILLIC database is not initialized."; exit 0 }
$client = New-Object Net.Sockets.TcpClient
try { $client.Connect("127.0.0.1", 5433); $running = $true }
catch { $running = $false } finally { $client.Dispose() }
if (-not $running) { Write-Host "IRILLIC PostgreSQL is already stopped."; exit 0 }
& $pgCtl -D $dataDir stop -m fast
if ($LASTEXITCODE -ne 0) { throw "IRILLIC PostgreSQL could not be stopped." }
Write-Host "IRILLIC PostgreSQL stopped."
