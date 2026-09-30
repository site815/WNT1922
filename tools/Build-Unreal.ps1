[CmdletBinding()]
param(
    [string]$EngineRoot,
    [string]$NodePath,
    [string]$NodeLicensePath,
    [switch]$Package,
    [switch]$ForceAssets,
    [ValidateSet('Development','Shipping')][string]$Configuration='Shipping'
)
$ErrorActionPreference = 'Stop'
$setup = & (Join-Path $PSScriptRoot 'Check-Unreal.ps1') -EngineRoot $EngineRoot -NodePath $NodePath -PassThru -RequireReady
$repo=$setup.Repository; $project=$setup.Project; $engine=$setup.Engine
Set-Location -LiteralPath $repo
$projectConfig=Get-Content -Raw -LiteralPath (Join-Path $repo 'unreal\Config\DefaultGame.ini')
$versionMatch=[regex]::Match($projectConfig,'(?m)^ProjectVersion=((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?)\s*$')
if (-not $versionMatch.Success) { throw 'Native DefaultGame.ini ProjectVersion must be a valid semantic version.' }
$version=$versionMatch.Groups[1].Value
$uiVersion=(Get-Content -Raw -LiteralPath (Join-Path $repo 'package.json') | ConvertFrom-Json).version
if ($uiVersion -ne $version) { throw 'package.json and native ProjectVersion must match before building.' }
$sourceFingerprint=(& $setup.Node tools/native-source-fingerprint.mjs).Trim()
if ($LASTEXITCODE -ne 0 -or $sourceFingerprint -notmatch '^[0-9a-f]{64}$') { throw 'Cannot fingerprint native source inputs.' }
$expectedTests=@(Get-ChildItem -LiteralPath (Join-Path $repo 'unreal\Source') -Filter '*.cpp' -Recurse -File | ForEach-Object {
    $source=Get-Content -Raw -LiteralPath $_.FullName
    [regex]::Matches($source,'IMPLEMENT_SIMPLE_AUTOMATION_TEST\s*\([^,]+,\s*"(WNT\.[^"]+)"') | ForEach-Object { $_.Groups[1].Value }
})
if (@($expectedTests | Select-Object -Unique).Count -ne $expectedTests.Count) { throw 'Native WNT automation test paths must be unique.' }
foreach ($group in @('Geography','Camera','World','Ships')) {
    if (@($expectedTests | Where-Object { $_ -like ('WNT.'+$group+'.*') }).Count -eq 0) { throw ('Missing native automation coverage: WNT.'+$group) }
}
$run = [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff')
$report = Join-Path $repo ('.build\unreal-' + $run)
New-Item -ItemType Directory -Path $report | Out-Null
$status = [ordered]@{format=2;version=$version;engine=$engine.Version.ToString();configuration=$Configuration;sourceSha256=$sourceFingerprint;started=[DateTime]::UtcNow.ToString('o');editorCompiled=$false;assetsPrepared=$false;expectedNativeTests=$expectedTests;nativeTestsPassed=$false;packaged=$false;visualVerified=$false}
function Assert-NativeTrust([string]$LogPath) {
    if ((Test-Path -LiteralPath $LogPath) -and (Select-String -LiteralPath $LogPath -SimpleMatch 'GetLastError=4551' -Quiet)) {
        $status['windowsCodeIntegrityBlocked']=$true
        throw ('Windows Code Integrity blocked a native module (4551). Resolve trusted signing/development policy before rerunning; game-code changes cannot grant a signing exemption. See '+$LogPath)
    }
}
try {
    & $setup.Node tools/check-models.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Polygon ship asset audit failed.' }
    & $setup.Node tools/check.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Campaign regression checks failed.' }
    & $engine.Build WNT1922Editor Win64 Development "-Project=$project" -WaitMutex -NoHotReloadFromIDE -NoUBA
    if ($LASTEXITCODE -ne 0) { throw 'Native Unreal editor compilation failed.' }
    $status.editorCompiled=$true
    $preparationStarted=[DateTime]::UtcNow
    $previousForce=$env:WNT_FORCE_ASSETS
    try {
        $env:WNT_FORCE_ASSETS=if($ForceAssets){'1'}else{'0'}
        $prepare=Join-Path $repo 'unreal\Tools\PrepareAssets.py'
        & $engine.Command $project "-ExecutePythonScript=$prepare" -unattended -nosplash -RenderOffscreen "-abslog=$(Join-Path $report 'prepare-assets.log')"
        Assert-NativeTrust (Join-Path $report 'prepare-assets.log')
        if ($LASTEXITCODE -ne 0) { throw 'Unreal material/map preparation failed.' }
    } finally { $env:WNT_FORCE_ASSETS=$previousForce }
    $assetReport=Join-Path $repo 'unreal\Saved\WNTAssetPreparation.json'
    if (-not (Test-Path -LiteralPath $assetReport) -or (Get-Item -LiteralPath $assetReport).LastWriteTimeUtc -lt $preparationStarted.AddSeconds(-2)) { throw 'Unreal did not emit a fresh asset preparation result.' }
    if (-not (Get-Content -Raw -LiteralPath $assetReport | ConvertFrom-Json).success) { throw 'Unreal bootstrap assets are not ready.' }
    $materialErrors=Select-String -LiteralPath (Join-Path $report 'prepare-assets.log') -Pattern 'Failed to compile Material|LogShaderCompilers: Error|LogMaterial: Error' -ErrorAction SilentlyContinue
    if ($materialErrors) { throw ('Native material compilation failed: '+($materialErrors.Line -join [Environment]::NewLine)) }
    $status.assetsPrepared=$true
    $automation=Join-Path $report 'automation'
    & $engine.Command $project '-ExecCmds=Automation RunTests WNT.' '-TestExit=Automation Test Queue Empty' "-ReportExportPath=$automation" "-WNTDataRoot=$repo" "-WNTNode=$($setup.Node)" -unattended -nosplash -nosound -NullRHI "-abslog=$(Join-Path $report 'native-tests.log')"
    Assert-NativeTrust (Join-Path $report 'native-tests.log')
    if ($LASTEXITCODE -ne 0) { throw 'Native Unreal automation failed.' }
    $automationIndex=Join-Path $automation 'index.json'
    if (-not (Test-Path -LiteralPath $automationIndex)) { throw 'Native automation produced no JSON report; packaging is blocked.' }
    $results=Get-Content -Raw -LiteralPath $automationIndex | ConvertFrom-Json
    $tests=@($results.tests | Where-Object { $_.fullTestPath -like 'WNT.*' -or $_.testDisplayName -like 'WNT.*' })
    if ($tests.Count -eq 0 -or @($tests | Where-Object { $_.state -notin @('Success','SuccessWithWarnings') }).Count -gt 0) { throw 'Native WNT tests are absent, incomplete or failed; inspect the automation report.' }
    foreach ($expected in $expectedTests) {
        $testMatches=@($tests | Where-Object { $_.fullTestPath -eq $expected -or $_.testDisplayName -eq $expected })
        if ($testMatches.Count -ne 1) { throw ('Expected exactly one native test result for '+$expected) }
    }
    $status.nativeTestsPassed=$true; $status.nativeTestCount=$tests.Count
    if ($Package) {
        # Node has no --license flag. Keep the complete license, including its
        # bundled dependency notices, from this exact runtime's distribution.
        $nodeFolder=Split-Path -Parent $setup.Node
        $licenseCandidates=@()
        if ($NodeLicensePath) { $licenseCandidates+=@($NodeLicensePath) }
        else {
            $licenseCandidates+=@((Join-Path $nodeFolder 'LICENSE'),(Join-Path $nodeFolder 'LICENSE.txt'),(Join-Path (Split-Path -Parent $nodeFolder) 'LICENSE'))
        }
        $licenseSource=$licenseCandidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
        if ($NodeLicensePath -and -not $licenseSource) { throw 'The explicitly provided Node license file does not exist.' }
        if (-not $licenseSource) {
            $licenseSource=Join-Path $report 'node-LICENSE.txt'
            $licenseUrl='https://raw.githubusercontent.com/nodejs/node/v'+$setup.NodeVersion+'/LICENSE'
            try { Invoke-WebRequest -Uri $licenseUrl -OutFile $licenseSource }
            catch { throw ('The complete Node '+$setup.NodeVersion+' license is required. Supply -NodeLicensePath from that official Node distribution for an offline build. '+$_.Exception.Message) }
        }
        $nodeLicense=Get-Content -Raw -LiteralPath $licenseSource
        if ($nodeLicense.Length -lt 1000 -or $nodeLicense -notmatch 'Node\.js is licensed') { throw 'Node license file is not the complete official distribution license.' }
        $archive=Join-Path $report 'archive'
        & $engine.UAT BuildCookRun "-project=$project" -noP4 -platform=Win64 "-clientconfig=$Configuration" -build -cook -map=/Game/Maps/WNTWorld -stage -pak -archive "-archivedirectory=$archive" -utf8output -unattended
        if ($LASTEXITCODE -ne 0) { throw 'Native Unreal cooking/packaging failed.' }
        $binaries=@(Get-ChildItem -LiteralPath $archive -Filter 'WNT1922*.exe' -Recurse -File | Where-Object { $_.Directory.Name -eq 'Win64' -and $_.Directory.Parent.Name -eq 'Binaries' -and $_.Directory.Parent.Parent.Name -eq 'WNT1922' })
        if ($binaries.Count -ne 1) { throw 'Cannot identify one native packaged WNT1922 binary.' }
        $projectDirectory=$binaries[0].Directory.Parent.Parent.FullName
        $packageDirectory=Split-Path -Parent $projectDirectory
        $data=Join-Path $projectDirectory 'GameData'
        New-Item -ItemType Directory -Path $data | Out-Null
        foreach ($folder in @('ui','mechanics','catalog','worker','assets')) {
            Copy-Item -LiteralPath (Join-Path $repo $folder) -Destination (Join-Path $data $folder) -Recurse
        }
        foreach ($file in @('LICENSE.md','README.md','package.json')) {
            if (Test-Path -LiteralPath (Join-Path $repo $file)) { Copy-Item -LiteralPath (Join-Path $repo $file) -Destination (Join-Path $data $file) }
        }
        $runtime=Join-Path $data 'Runtime'; New-Item -ItemType Directory -Path $runtime | Out-Null
        Copy-Item -LiteralPath $setup.Node -Destination (Join-Path $runtime 'node.exe')
        $nodeLicense | Set-Content -LiteralPath (Join-Path $runtime 'LICENSE.txt') -Encoding UTF8
        $setup.NodeVersion | Set-Content -LiteralPath (Join-Path $runtime 'VERSION.txt') -Encoding ASCII
        # Preserve the installed engine's complete third-party notice collection.
        # Some CEF notices are not staged automatically by BuildCookRun.
        $engineLicenses=Join-Path $engine.Root 'Engine\Source\ThirdParty\Licenses'
        if (-not (Test-Path -LiteralPath $engineLicenses -PathType Container)) { throw 'Unreal third-party license collection is missing.' }
        $licenseDirectory=Join-Path $data 'Licenses'; New-Item -ItemType Directory -Path $licenseDirectory | Out-Null
        Copy-Item -LiteralPath $engineLicenses -Destination (Join-Path $licenseDirectory 'UnrealThirdParty') -Recurse
        Copy-Item -LiteralPath (Join-Path $repo 'unreal\Plugins\glTFRuntime\LICENSE') -Destination (Join-Path $licenseDirectory 'glTFRuntime-LICENSE.txt')
        $entry=Join-Path $data 'worker\unreal-server.mjs'
        & (Join-Path $runtime 'node.exe') --check $entry
        if ($LASTEXITCODE -ne 0) { throw 'Staged campaign worker has invalid syntax.' }
        Push-Location -LiteralPath $data
        try {
            & (Join-Path $runtime 'node.exe') --input-type=module -e "await import('./worker/catalog-loader.mjs');await import('./worker/desktop/server.mjs');console.log('Staged campaign dependencies load.')"
            if ($LASTEXITCODE -ne 0) { throw 'Packaged campaign dependencies are incomplete.' }
        } finally { Pop-Location }
        $cef=@(Get-ChildItem -LiteralPath $packageDirectory -Filter 'libcef.dll' -Recurse -File)
        if ($cef.Count -eq 0) { throw 'The packaged CEF WebBrowser runtime is missing.' }
        $status.packageDirectory=$packageDirectory
        $manifest=[ordered]@{format=1;gameVersion=$version;engineVersion=$engine.Version.ToString();nodeVersion=$setup.NodeVersion;files=@()}
        $manifest.files=@(Get-ChildItem -LiteralPath $packageDirectory -File -Recurse | ForEach-Object {
            [pscustomobject]@{path=$_.FullName.Substring($packageDirectory.Length+1).Replace('\','/');bytes=$_.Length;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}
        })
        $manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $packageDirectory 'package-manifest.json') -Encoding UTF8
        $zip=Join-Path $report ('WNT1922-v' + $version + '-Unreal-Windows.zip')
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [IO.Compression.ZipFile]::CreateFromDirectory($packageDirectory,$zip,[IO.Compression.CompressionLevel]::Optimal,$true)
        $finalFingerprint=(& $setup.Node tools/native-source-fingerprint.mjs).Trim()
        if ($LASTEXITCODE -ne 0 -or $finalFingerprint -ne $sourceFingerprint) { throw 'Native source inputs changed during the build. Rebuild before testing or publishing this archive.' }
        $status.archive=$zip
        $status.archiveSha256=(Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant()
        $status.archiveBytes=(Get-Item -LiteralPath $zip).Length
        ($status.archiveSha256+'  '+[IO.Path]::GetFileName($zip)) | Set-Content -LiteralPath ($zip+'.sha256') -Encoding ASCII
        $status.packaged=$true
        Write-Host ('Native package: ' + $zip)
        Write-Host 'A native visual/interaction smoke test is still required before release. No release was published.'
    } else { Write-Host 'Editor compilation, bootstrap assets and native automation completed. Use -Package to produce a native distribution.' }
} finally {
    $status.finished=[DateTime]::UtcNow.ToString('o')
    $status | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $report 'result.json') -Encoding UTF8
    Write-Host ('Native build report: ' + $report)
}
