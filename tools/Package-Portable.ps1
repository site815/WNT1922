$ErrorActionPreference = 'Stop'
$portableRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $portableRoot
$portableNode = (Get-Command node.exe -ErrorAction Stop).Source
$portableVersion = (& $portableNode --input-type=module -e "import {GAME_VERSION} from './game/src/version.mjs';process.stdout.write(GAME_VERSION)").Trim()
if ($LASTEXITCODE -ne 0 -or $portableVersion -notmatch '^\d+\.\d+\.\d+$') { throw 'Invalid game version.' }
$portablePackage = Join-Path $portableRoot ('dist/WNT1922-' + $portableVersion + '-win-x64')
& $portableNode tools/verify-package.mjs $portablePackage
if ($LASTEXITCODE -ne 0) { throw 'Build and verify the Windows folder before wrapping it in the portable executable.' }
$portableLock = Get-Content -Raw -LiteralPath 'desktop/portable-tool-lock.json' | ConvertFrom-Json
$portableCache = Join-Path $portableRoot 'tmp/release-inputs'
New-Item -ItemType Directory -Force -Path $portableCache | Out-Null
$portableCompilerZip = Join-Path $portableCache ('nsis-' + $portableLock.version + '.zip')
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
$portableToolDirectory = Join-Path $portableCache 'nsis-tool'
Expand-Archive -LiteralPath $portableCompilerZip -DestinationPath $portableToolDirectory -Force
$portableCompilerRoot = Join-Path $portableToolDirectory ('nsis-' + $portableLock.version)
$portableCompiler = Join-Path $portableCompilerRoot 'Bin/makensis.exe'
$portableLicense = Join-Path $portableRoot 'licenses/NSIS-LICENSE.txt'
$portableLicenseText = [IO.File]::ReadAllText($portableLicense).Replace("`r`n", "`n")
$portableOriginalLicense = [IO.File]::ReadAllText((Join-Path $portableCompilerRoot 'COPYING')).Replace("`r`n", "`n")
if ($portableLicenseText -cne $portableOriginalLicense) { throw 'NSIS license differs from the pinned distribution.' }
$portableOutput = Join-Path $portableRoot ('dist/WNT1922-' + $portableVersion + '-portable-win-x64.exe')
& $portableCompiler /V2 "/DGAME_VERSION=$portableVersion" "/DPACKAGE_DIRECTORY=$portablePackage" "/DPORTABLE_OUTPUT=$portableOutput" "/DNSIS_LICENSE=$portableLicense" (Join-Path $portableRoot 'desktop/portable.nsi')
if ($LASTEXITCODE -ne 0) { throw 'Portable executable compilation failed.' }
$portableHash = (Get-FileHash -LiteralPath $portableOutput -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content -LiteralPath ($portableOutput + '.sha256') -Value ($portableHash + '  ' + [IO.Path]::GetFileName($portableOutput)) -Encoding ascii
Write-Output ('Self-contained portable executable ready: ' + $portableOutput)
