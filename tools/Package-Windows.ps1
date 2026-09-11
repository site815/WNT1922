$ErrorActionPreference = 'Stop'
$releaseRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $releaseRoot
$releaseNode = (Get-Command node.exe -ErrorAction Stop).Source
$releaseVersion = (& $releaseNode --input-type=module -e "import {GAME_VERSION} from './game/src/version.mjs';process.stdout.write(GAME_VERSION)").Trim()
$runtimeLock = Get-Content -Raw -LiteralPath 'desktop/runtime-lock.json' | ConvertFrom-Json
$cacheDirectory = Join-Path $releaseRoot 'tmp/release-inputs'
New-Item -ItemType Directory -Force -Path $cacheDirectory | Out-Null
$runtimeZip = Join-Path $cacheDirectory ('electron-v' + $runtimeLock.version + '-win32-x64.zip')
if (-not (Test-Path -LiteralPath $runtimeZip)) { Invoke-WebRequest -Uri $runtimeLock.url -OutFile $runtimeZip }
if ((Get-FileHash -Algorithm SHA256 -LiteralPath $runtimeZip).Hash.ToLowerInvariant() -ne $runtimeLock.sha256) { throw 'Electron runtime checksum does not match the pinned publisher release.' }
$sourceLock = Get-Content -Raw -LiteralPath 'desktop/source-lock.json' | ConvertFrom-Json
$sourceCache = Join-Path $cacheDirectory 'runtime-sources'
New-Item -ItemType Directory -Force -Path $sourceCache | Out-Null
foreach ($sourceArchive in $sourceLock.archives) {
    $sourcePath = Join-Path $sourceCache $sourceArchive.name
    if (-not (Test-Path -LiteralPath $sourcePath)) { Invoke-WebRequest -Uri $sourceArchive.url -OutFile $sourcePath }
    if ((Get-FileHash -Algorithm SHA256 -LiteralPath $sourcePath).Hash.ToLowerInvariant() -ne $sourceArchive.sha256) { throw ('Runtime source checksum mismatch: ' + $sourceArchive.name) }
}
& $releaseNode tools/build-game.mjs game/public
if ($LASTEXITCODE -ne 0) { throw 'Game build failed.' }
& $releaseNode tools/audit-assets.mjs
if ($LASTEXITCODE -ne 0) { throw 'Asset audit failed.' }
$outputDirectory = Join-Path $releaseRoot ('dist/WNT1922-' + $releaseVersion + '-win-x64')
$expectedDist = [IO.Path]::GetFullPath((Join-Path $releaseRoot 'dist')) + [IO.Path]::DirectorySeparatorChar
$resolvedOutput = [IO.Path]::GetFullPath($outputDirectory)
if (-not $resolvedOutput.StartsWith($expectedDist,[StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe package output directory.' }
if (Test-Path -LiteralPath $resolvedOutput) { Remove-Item -LiteralPath $resolvedOutput -Recurse -Force }
Expand-Archive -LiteralPath $runtimeZip -DestinationPath $resolvedOutput
Move-Item -LiteralPath (Join-Path $resolvedOutput 'electron.exe') -Destination (Join-Path $resolvedOutput 'WNT1922.exe')
& $releaseNode tools/prepare-desktop-app.mjs (Join-Path $resolvedOutput 'resources/app')
if ($LASTEXITCODE -ne 0) { throw 'Application assembly failed.' }
Copy-Item -LiteralPath 'docs/WINDOWS-README.txt' -Destination (Join-Path $resolvedOutput 'READ-ME.txt')
Copy-Item -LiteralPath 'THIRD_PARTY_NOTICES.md' -Destination (Join-Path $resolvedOutput 'THIRD_PARTY_NOTICES.md')
$packagedSources = Join-Path $resolvedOutput 'runtime-sources'
New-Item -ItemType Directory -Force -Path $packagedSources | Out-Null
foreach ($sourceArchive in $sourceLock.archives) { Copy-Item -LiteralPath (Join-Path $sourceCache $sourceArchive.name) -Destination $packagedSources }
Copy-Item -LiteralPath 'desktop/source-lock.json' -Destination $packagedSources
Copy-Item -LiteralPath 'licenses/RUNTIME-SOURCES.md' -Destination $packagedSources
& $releaseNode tools/verify-package.mjs $resolvedOutput --write-manifest
if ($LASTEXITCODE -ne 0) { throw 'Package verification failed.' }
$archivePath = $resolvedOutput + '.zip'
Compress-Archive -LiteralPath $resolvedOutput -DestinationPath $archivePath -Force -CompressionLevel Optimal
$archiveHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content -LiteralPath ($archivePath + '.sha256') -Value ($archiveHash + '  ' + [IO.Path]::GetFileName($archivePath)) -Encoding ascii
Write-Output ('Windows executable package ready: ' + $archivePath)
