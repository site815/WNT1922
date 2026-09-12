$ErrorActionPreference = 'Stop'
$releaseRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $releaseRoot
$releaseNode = (Get-Command node.exe -ErrorAction Stop).Source
$releaseVersion = (& $releaseNode --input-type=module -e "import {GAME_VERSION} from './mechanics/version.mjs';process.stdout.write(GAME_VERSION)").Trim()
if ($LASTEXITCODE -ne 0 -or $releaseVersion -notmatch '^\d+\.\d+\.\d+$') { throw 'Invalid game version.' }
$runtimeLock = Get-Content -Raw -LiteralPath 'worker/desktop/runtime-lock.json' | ConvertFrom-Json
$cacheDirectory = Join-Path $releaseRoot '.build/cache'
New-Item -ItemType Directory -Force -Path $cacheDirectory | Out-Null
$runtimeZip = Join-Path $cacheDirectory ('electron-v' + $runtimeLock.version + '-win32-x64.zip')
if (-not (Test-Path -LiteralPath $runtimeZip)) { Invoke-WebRequest -Uri $runtimeLock.url -OutFile $runtimeZip }
if ((Get-FileHash -Algorithm SHA256 -LiteralPath $runtimeZip).Hash.ToLowerInvariant() -ne $runtimeLock.sha256) { throw 'Electron runtime checksum does not match the pinned publisher release.' }
$sourceLock = Get-Content -Raw -LiteralPath 'worker/desktop/source-lock.json' | ConvertFrom-Json
$sourceCache = Join-Path $releaseRoot 'assets/licenses/runtime-sources'
foreach ($sourceArchive in $sourceLock.archives) {
    $sourcePath = Join-Path $sourceCache $sourceArchive.name
    if ((Get-FileHash -Algorithm SHA256 -LiteralPath $sourcePath).Hash.ToLowerInvariant() -ne $sourceArchive.sha256) { throw ('Runtime source checksum mismatch: ' + $sourceArchive.name) }
}
& $releaseNode tools/check.mjs
if ($LASTEXITCODE -ne 0) { throw 'Game build failed.' }
& $releaseNode tools/audit-assets.mjs
if ($LASTEXITCODE -ne 0) { throw 'Asset audit failed.' }
$outputDirectory = Join-Path $releaseRoot '.build/portable'
$expectedDist = [IO.Path]::GetFullPath((Join-Path $releaseRoot '.build')) + [IO.Path]::DirectorySeparatorChar
$resolvedOutput = [IO.Path]::GetFullPath($outputDirectory)
if (-not $resolvedOutput.StartsWith($expectedDist,[StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe package output directory.' }
if (Test-Path -LiteralPath $resolvedOutput) {
    for ($buildAttempt = 0; $buildAttempt -lt 5; $buildAttempt++) {
        try { Remove-Item -LiteralPath $resolvedOutput -Recurse -Force -ErrorAction Stop; break }
        catch { if ($buildAttempt -eq 4) { throw }; Start-Sleep -Milliseconds 500 }
    }
}
Add-Type -AssemblyName System.IO.Compression.FileSystem
$runtimeArchive = [IO.Compression.ZipFile]::OpenRead($runtimeZip)
try {
    foreach ($runtimeEntry in $runtimeArchive.Entries) {
        # The Electron welcome/demo application is unused by the packaged game.
        if ($runtimeEntry.FullName -eq 'resources/default_app.asar') { continue }
        $runtimeDestination = [IO.Path]::GetFullPath((Join-Path $resolvedOutput $runtimeEntry.FullName))
        if (-not $runtimeDestination.StartsWith($resolvedOutput + [IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe runtime archive entry.' }
        if ($runtimeEntry.FullName.EndsWith('/')) { New-Item -ItemType Directory -Force -Path $runtimeDestination | Out-Null; continue }
        New-Item -ItemType Directory -Force -Path ([IO.Path]::GetDirectoryName($runtimeDestination)) | Out-Null
        [IO.Compression.ZipFileExtensions]::ExtractToFile($runtimeEntry,$runtimeDestination,$true)
    }
} finally { $runtimeArchive.Dispose() }
Move-Item -LiteralPath (Join-Path $resolvedOutput 'electron.exe') -Destination (Join-Path $resolvedOutput 'WNT1922.exe')
& $releaseNode tools/prepare-desktop-app.mjs (Join-Path $resolvedOutput 'resources/app')
if ($LASTEXITCODE -ne 0) { throw 'Application assembly failed.' }
Copy-Item -LiteralPath 'README.md' -Destination (Join-Path $resolvedOutput 'READ-ME.txt')
& $releaseNode tools/verify-package.mjs $resolvedOutput --write-manifest
if ($LASTEXITCODE -ne 0) { throw 'Package verification failed.' }

$portableLock = Get-Content -Raw -LiteralPath 'worker/desktop/portable-tool-lock.json' | ConvertFrom-Json
$portableCompilerZip = Join-Path $cacheDirectory ('nsis-' + $portableLock.version + '.zip')
if (-not (Test-Path -LiteralPath $portableCompilerZip)) {
    Invoke-WebRequest -Uri $portableLock.url -OutFile $portableCompilerZip
    if ((Get-FileHash -LiteralPath $portableCompilerZip -Algorithm SHA256).Hash.ToLowerInvariant() -ne $portableLock.sha256) {
        # SourceForge sometimes returns its download page instead of an HTTP redirect.
        # Follow only that official archive's signed download link, then require the pinned hash.
        if ((Get-Item -LiteralPath $portableCompilerZip).Length -gt 1048576) { throw 'Unexpected NSIS download.' }
        $portablePage = Get-Content -Raw -LiteralPath $portableCompilerZip
        $portableLink = [regex]::Match($portablePage, 'https://downloads\.sourceforge\.net/project/nsis/NSIS%203/' + [regex]::Escape($portableLock.version) + '/nsis-' + [regex]::Escape($portableLock.version) + '\.zip\?[^"<> ]+')
        if (-not $portableLink.Success) { throw 'Official NSIS download link was not found.' }
        Invoke-WebRequest -Uri ([System.Net.WebUtility]::HtmlDecode($portableLink.Value)) -OutFile $portableCompilerZip
    }
}
if ((Get-Item -LiteralPath $portableCompilerZip).Length -ne $portableLock.bytes -or (Get-FileHash -LiteralPath $portableCompilerZip -Algorithm SHA256).Hash.ToLowerInvariant() -ne $portableLock.sha256) { throw 'NSIS compiler checksum mismatch.' }
$portableToolDirectory = Join-Path $cacheDirectory 'nsis-tool'
Expand-Archive -LiteralPath $portableCompilerZip -DestinationPath $portableToolDirectory -Force
$portableCompilerRoot = Join-Path $portableToolDirectory ('nsis-' + $portableLock.version)
$portableCompiler = Join-Path $portableCompilerRoot 'Bin/makensis.exe'
$portableLicense = Join-Path $releaseRoot 'assets/licenses/NSIS-LICENSE.txt'
$portableLicenseText = [IO.File]::ReadAllText($portableLicense).Replace("`r`n", "`n")
$portableOriginalLicense = [IO.File]::ReadAllText((Join-Path $portableCompilerRoot 'COPYING')).Replace("`r`n", "`n")
if ($portableLicenseText -cne $portableOriginalLicense) { throw 'NSIS license differs from the pinned distribution.' }
New-Item -ItemType Directory -Force -Path (Join-Path $releaseRoot 'dist') | Out-Null
$portableOutput = Join-Path $releaseRoot ('dist/WNT1922-' + $releaseVersion + '-portable-win-x64.exe')
& $portableCompiler /V2 "/DGAME_VERSION=$releaseVersion" "/DPACKAGE_DIRECTORY=$resolvedOutput" "/DPORTABLE_OUTPUT=$portableOutput" "/DNSIS_LICENSE=$portableLicense" (Join-Path $releaseRoot 'worker/desktop/portable.nsi')
if ($LASTEXITCODE -ne 0) { throw 'Portable executable compilation failed.' }
$portableHash = (Get-FileHash -LiteralPath $portableOutput -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content -LiteralPath ($portableOutput + '.sha256') -Value ($portableHash + '  ' + [IO.Path]::GetFileName($portableOutput)) -Encoding ascii
$downloadName = 'WNT1922-portable-win-x64.exe'
Set-Content -LiteralPath (Join-Path $releaseRoot ('dist/' + $downloadName + '.sha256')) -Value ($portableHash + '  ' + $downloadName) -Encoding ascii
$releaseMetadata = [ordered]@{
    version = $releaseVersion
    localFile = [IO.Path]::GetFileName($portableOutput)
    downloadName = $downloadName
    bytes = (Get-Item -LiteralPath $portableOutput).Length
    sha256 = $portableHash
    tag = 'v' + $releaseVersion
    releaseUrl = 'https://github.com/site815/WNT1922/releases/tag/v' + $releaseVersion
    latestReleaseUrl = 'https://github.com/site815/WNT1922/releases/latest'
    downloadUrl = 'https://github.com/site815/WNT1922/releases/latest/download/' + $downloadName
}
$releaseMetadata | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $releaseRoot 'dist/latest.json') -Encoding ascii
foreach ($assemblyDirectory in @($resolvedOutput, $portableToolDirectory)) {
    $assemblyTarget = (Resolve-Path -LiteralPath $assemblyDirectory).Path
    if (-not $assemblyTarget.StartsWith($expectedDist,[StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe assembly cleanup directory.' }
    Remove-Item -LiteralPath $assemblyTarget -Recurse -Force
}
Write-Output ('Self-contained portable executable ready: ' + $portableOutput)
