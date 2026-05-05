$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$deployRoot = Join-Path $root ".deploy"
$deployDir = Join-Path $deployRoot "rumahweb-runtime"
$zipPath = Join-Path $deployRoot "humas-rumahweb-runtime.zip"
$nextDir = Join-Path $root ".next"
$publicDir = Join-Path $root "public"
$databaseDir = Join-Path $root "database"
$prismaDir = Join-Path $root "prisma"
$requiredFiles = @("package.json", "package-lock.json", "server.js", "DEPLOY_RUMAHWEB.md")

if (-not (Test-Path $nextDir)) {
    throw "Missing .next. Run npm run build first."
}

if (Test-Path $deployDir) {
    Remove-Item -LiteralPath $deployDir -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $deployDir | Out-Null

Copy-Item -Path $nextDir -Destination (Join-Path $deployDir ".next") -Recurse -Force

$nextCacheDir = Join-Path $deployDir ".next\cache"
if (Test-Path $nextCacheDir) {
    Remove-Item -LiteralPath $nextCacheDir -Recurse -Force
}

$nextDevDir = Join-Path $deployDir ".next\dev"
if (Test-Path $nextDevDir) {
    Remove-Item -LiteralPath $nextDevDir -Recurse -Force
}

$nextStandaloneDir = Join-Path $deployDir ".next\standalone"
if (Test-Path $nextStandaloneDir) {
    Remove-Item -LiteralPath $nextStandaloneDir -Recurse -Force
}

if (Test-Path $publicDir) {
    Copy-Item -Path $publicDir -Destination (Join-Path $deployDir "public") -Recurse -Force
}

if (Test-Path $databaseDir) {
    Copy-Item -Path $databaseDir -Destination (Join-Path $deployDir "database") -Recurse -Force
}

if (Test-Path $prismaDir) {
    Copy-Item -Path $prismaDir -Destination (Join-Path $deployDir "prisma") -Recurse -Force
}

foreach ($file in $requiredFiles) {
    Copy-Item -Path (Join-Path $root $file) -Destination $deployDir -Force
}

if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $deployDir "*") -DestinationPath $zipPath -Force

Write-Host "Created $zipPath"
