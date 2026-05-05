$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$deployRoot = Join-Path $root ".deploy"
$deployDir = Join-Path $deployRoot "rumahweb"
$zipPath = Join-Path $deployRoot "humas-rumahweb-standalone.zip"
$standaloneDir = Join-Path $root ".next\standalone"
$staticDir = Join-Path $root ".next\static"
$publicDir = Join-Path $root "public"
$databaseDir = Join-Path $root "database"

if (-not (Test-Path $standaloneDir)) {
    throw "Missing .next\standalone. Run npm run build first."
}

if (Test-Path $deployDir) {
    Remove-Item -LiteralPath $deployDir -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $deployDir | Out-Null

Copy-Item -Path (Join-Path $standaloneDir "*") -Destination $deployDir -Recurse -Force

New-Item -ItemType Directory -Force -Path (Join-Path $deployDir ".next") | Out-Null
Copy-Item -Path $staticDir -Destination (Join-Path $deployDir ".next\static") -Recurse -Force

if (Test-Path $publicDir) {
    Copy-Item -Path $publicDir -Destination (Join-Path $deployDir "public") -Recurse -Force
}

if (Test-Path $databaseDir) {
    Copy-Item -Path $databaseDir -Destination (Join-Path $deployDir "database") -Recurse -Force
}

Copy-Item -Path (Join-Path $root "DEPLOY_RUMAHWEB.md") -Destination $deployDir -Force

if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $deployDir "*") -DestinationPath $zipPath -Force

Write-Host "Created $zipPath"
