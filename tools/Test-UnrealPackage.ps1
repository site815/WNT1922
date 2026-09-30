[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$BuildReport,
    [string]$NodePath,
    [ValidateRange(1024,65535)][int]$DebugPort=9333,
    [switch]$KeepRunning
)
$ErrorActionPreference='Stop'
$repo=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$build=Get-Content -Raw -LiteralPath $BuildReport | ConvertFrom-Json
if ($build.format -ne 2 -or $build.packaged -ne $true -or $build.nativeTestsPassed -ne $true -or $build.configuration -ne 'Development') { throw 'A successful Development native package report is required for opt-in instrumentation.' }
$zip=(Resolve-Path -LiteralPath $build.archive).Path
if ((Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant() -ne $build.archiveSha256 -or (Get-Item -LiteralPath $zip).Length -ne $build.archiveBytes) { throw 'The archive does not match its build report.' }
if (-not $NodePath) { $node=Get-Command node.exe -ErrorAction SilentlyContinue; if ($node) { $NodePath=$node.Source } }
if (-not $NodePath) { $NodePath=Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (-not (Test-Path -LiteralPath $NodePath -PathType Leaf)) { throw 'Node is required to run the verification driver.' }
$testRoot=Join-Path $repo '.build'
for ($ancestor=$testRoot; $ancestor; $ancestor=Split-Path -Parent $ancestor) {
    if ((Test-Path -LiteralPath $ancestor) -and ((Get-Item -LiteralPath $ancestor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Package test paths cannot pass through a reparse point.' }
}
$run=Join-Path $testRoot ('native-package-test-'+[DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff')+'-'+[Guid]::NewGuid().ToString('N').Substring(0,6))
$destination=Join-Path $run 'extracted'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
$status=[ordered]@{format=1;kind='extracted-native-package';version=$build.version;archiveSha256=$build.archiveSha256;configuration=$build.configuration;started=[DateTime]::UtcNow.ToString('o');passed=$false;visualVerified=$false;checksPassed=@();usesPackagedDefaults=$true}
$report=Join-Path $run 'package-test.json'
try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive=[IO.Compression.ZipFile]::OpenRead($zip)
    try {
        foreach ($entry in $archive.Entries) {
            $target=[IO.Path]::GetFullPath((Join-Path $destination $entry.FullName))
            if (-not $target.StartsWith($destination+'\',[StringComparison]::OrdinalIgnoreCase) -or $entry.FullName.Contains(':') -or (($entry.ExternalAttributes -shr 16) -band 0xF000) -eq 0xA000) { throw 'Unsafe path or symbolic link in package archive.' }
        }
    } finally { $archive.Dispose() }
    [IO.Compression.ZipFile]::ExtractToDirectory($zip,$destination)
    $manifests=@(Get-ChildItem -LiteralPath $destination -Filter 'package-manifest.json' -Recurse -File)
    if ($manifests.Count -ne 1) { throw 'Expected one extracted package manifest.' }
    $extracted=$manifests[0].Directory.FullName
    $manifest=Get-Content -Raw -LiteralPath $manifests[0].FullName | ConvertFrom-Json
    if ($manifest.gameVersion -ne $build.version) { throw 'Extracted version does not match the build.' }
    foreach ($file in $manifest.files) {
        $target=[IO.Path]::GetFullPath((Join-Path $extracted $file.path))
        if (-not $target.StartsWith($extracted+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid manifest path.' }
        if ((Get-Item -LiteralPath $target).Length -ne $file.bytes -or (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant() -ne $file.sha256) { throw ('Extracted payload mismatch: '+$file.path) }
    }
    $native=@($manifest.files | Where-Object { $_.path -match '^WNT1922/Binaries/Win64/WNT1922(?:-Win64-Development)?\.exe$' })
    if ($native.Count -ne 1) { throw 'Cannot identify one packaged Development game executable.' }
    $exe=Join-Path $extracted $native[0].path
    $listener=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,$DebugPort)
    try { $listener.Start() } catch { throw 'The requested debug port is occupied; no existing game will be attached.' } finally { $listener.Stop() }
    $saves=Join-Path $run 'saves'; $userDir=Join-Path $run 'userdata'; $output=Join-Path $run 'runtime'; $log=Join-Path $run 'unreal.log'
    New-Item -ItemType Directory -Path $saves,$userDir -Force | Out-Null
    function Quote-Argument([string]$Value) { if ($Value.Contains('"') -or $Value.Contains("`n") -or $Value.Contains("`r")) { throw 'Invalid launch path.' }; return '"'+$Value+'"' }
    # UE Paths.cpp maps -UserDir to ProjectUserDir/Saved. Data and Node have NO
    # overrides: the packaged game must locate its own GameData and runtime.
    $arguments=@('-WNTAutomation','-RenderOffscreen','-ForceRes','-windowed','-ResX=1440','-ResY=1000','-nosplash',('-cefdebug='+$DebugPort),(Quote-Argument ('-WNTSaveDir='+$saves)),(Quote-Argument ('-UserDir='+$userDir)),(Quote-Argument ('-abslog='+$log)))
    $game=Start-Process -FilePath $exe -ArgumentList $arguments -WorkingDirectory $extracted -WindowStyle Hidden -PassThru
    $process=Get-CimInstance Win32_Process -Filter ('ProcessId='+$game.Id)
    $gameStartedUtc=$game.StartTime.ToUniversalTime()
    if ($process.ExecutablePath -ne $exe -or -not $process.CommandLine) { throw 'Could not verify the launched native executable identity.' }
    $status.extractedDirectory=$extracted; $status.executablePath=$exe; $status.executableSha256=$native[0].sha256; $status.processId=$game.Id; $status.processStartedUtc=$game.StartTime.ToUniversalTime().ToString('o'); $status.processCommandLine=$process.CommandLine; $status.saveDirectory=$saves
    $status.nativeRuntimeReport=Join-Path $output 'result.json'
    & $NodePath (Join-Path $PSScriptRoot 'verify-unreal-runtime.mjs') ('--debug-port='+$DebugPort) ('--output='+$output) ('--capture-dir='+(Join-Path $userDir 'Saved\Screenshots'))
    if ($LASTEXITCODE -ne 0) { throw 'Extracted native package interaction verification failed; the owned process remains available for inspection.' }
    $runtime=Get-Content -Raw -LiteralPath $status.nativeRuntimeReport | ConvertFrom-Json
    if ($runtime.passed -ne $true) { throw 'Runtime verification did not pass.' }
    if (Select-String -LiteralPath $log -Pattern 'GetLastError=4551|LogTemp: Error: WNT Unreal:|Failed to compile Material|LogShaderCompilers: Error|LogMaterial: Error|LogGLTFRuntime: Error|LogTexture: Error' -Quiet) { throw 'The extracted package logged a native asset, shader or startup failure.' }
    $runtime | Add-Member -Force -NotePropertyName packageExecution -NotePropertyValue ([pscustomobject]@{executablePath=$exe;executableSha256=$native[0].sha256;processId=$game.Id;processStartedUtc=$status.processStartedUtc;archiveSha256=$build.archiveSha256})
    $runtime.limitations=@($runtime.limitations | Where-Object { $_ -notlike '*editor-game smoke test*' })+@('This run tests a Development package extracted from the recorded archive; it does not certify Shipping performance or complete fleet artwork.')
    $runtime | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $status.nativeRuntimeReport -Encoding UTF8
    $status.checksPassed=@('launch','campaignStart','shipSelection','battleWatch','saveReload','offlineAssets')
    if (-not $KeepRunning) {
        $shutdown=& (Join-Path $PSScriptRoot 'Stop-UnrealTest.ps1') -ProcessId $game.Id -ProcessStartedUtc $game.StartTime.ToUniversalTime() -ExecutablePath $exe -SaveDirectory $saves -RuntimeReport $status.nativeRuntimeReport -NodePath $NodePath
        $status.shutdown=$shutdown; $runtime.gameLeftRunning=$false
        $runtime | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $status.nativeRuntimeReport -Encoding UTF8
    }
    $status.passed=$true
    Write-Host 'Extracted native package checks passed. Review its native GPU captures before setting visualVerified true.'
} catch { $status.error=$_.Exception.Message; throw }
finally {
    if (-not $KeepRunning -and $game) {
        $game.Refresh()
        if (-not $game.HasExited) {
            $owned=Get-Process -Id $game.Id -ErrorAction SilentlyContinue
            if ($owned -and $owned.StartTime.ToUniversalTime() -eq $gameStartedUtc -and $owned.Path -eq $exe) {
                $command=(Get-CimInstance Win32_Process -Filter ('ProcessId='+$owned.Id)).CommandLine
                if ($command.Contains('-WNTAutomation') -and $command.Contains('-RenderOffscreen') -and $command.Contains('-WNTSaveDir='+$saves)) {
                    Stop-Process -Id $owned.Id
                    [void]$owned.WaitForExit(10000)
                    $status.cleanup='Stopped only the launched offscreen process for this disposable failed test.'
                    if ($status.nativeRuntimeReport -and (Test-Path -LiteralPath $status.nativeRuntimeReport)) {
                        $runtime=Get-Content -Raw -LiteralPath $status.nativeRuntimeReport | ConvertFrom-Json
                        $runtime.gameLeftRunning=$false
                        $runtime | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $status.nativeRuntimeReport -Encoding UTF8
                    }
                }
            }
        }
    }
    $status.finished=[DateTime]::UtcNow.ToString('o')
    $status | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $report -Encoding UTF8
    Write-Host ('Package test report: '+$report)
}
