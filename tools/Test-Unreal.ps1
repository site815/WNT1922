[CmdletBinding()]
param(
    [string]$EngineRoot,
    [string]$NodePath,
    [string]$SaveDirectory,
    [switch]$BuildFirst,
    [switch]$Automation,
    [switch]$KeepRunning,
    [ValidateRange(1024,65535)][int]$DebugPort=9333,
    [switch]$CheckOnly
)
$ErrorActionPreference='Stop'
# Explorer does not inherit Codex's temporary PATH. Reuse its installed Node
# runtime when there is no system Node, without editing the user's PATH.
if (-not $NodePath -and -not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
    $bundledNode=Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    if (Test-Path -LiteralPath $bundledNode -PathType Leaf) { $NodePath=$bundledNode }
}
$setup=& (Join-Path $PSScriptRoot 'Check-Unreal.ps1') -EngineRoot $EngineRoot -NodePath $NodePath -PassThru
$repo=$setup.Repository
$testRoot=[IO.Path]::GetFullPath((Join-Path $repo '.build'))
$run=Join-Path $testRoot ('native-test-'+[DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff')+'-'+[Guid]::NewGuid().ToString('N').Substring(0,6))
$userDir=Join-Path $run 'userdata'
if ($Automation -and $SaveDirectory) { throw '-Automation always uses a fresh isolated save folder. Omit -SaveDirectory.' }
if (-not $Automation -and $PSBoundParameters.ContainsKey('DebugPort')) { throw '-DebugPort is only available with explicit -Automation. Normal testing has no browser debug port.' }
if (-not $Automation -and $KeepRunning) { throw '-KeepRunning applies only to automation; normal interactive games are already left open.' }
if ($Automation) { $SaveDirectory=Join-Path $run 'saves' }
elseif (-not $SaveDirectory) { $SaveDirectory=Join-Path $testRoot 'native-test\saves' }
elseif (-not [IO.Path]::IsPathRooted($SaveDirectory)) { $SaveDirectory=Join-Path $repo $SaveDirectory }
$SaveDirectory=[IO.Path]::GetFullPath($SaveDirectory).TrimEnd('\','/')

function Assert-IsolatedDirectory([string]$Path) {
    $full=[IO.Path]::GetFullPath($Path).TrimEnd('\','/')
    if (-not $full.StartsWith($testRoot+'\',[StringComparison]::OrdinalIgnoreCase)) {
        throw 'Test saves and reports must be inside this repository''s .build folder. Production saves cannot be selected.'
    }
    # Reject junctions/symlinks all the way up, including a redirected .build.
    $ancestor=$full
    while ($ancestor) {
        if (Test-Path -LiteralPath $ancestor) {
            $item=Get-Item -LiteralPath $ancestor -Force
            if (-not $item.PSIsContainer) { throw ('Expected a directory: '+$ancestor) }
            if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw ('Test directories cannot pass through a junction or symbolic link: '+$ancestor) }
        }
        $ancestor=Split-Path -Parent $ancestor
    }
}
Assert-IsolatedDirectory $SaveDirectory
Assert-IsolatedDirectory $run
Assert-IsolatedDirectory $userDir

$version=(Get-Content -Raw -LiteralPath (Join-Path $repo 'package.json') | ConvertFrom-Json).version
$nativeVersion=[regex]::Match((Get-Content -Raw -LiteralPath (Join-Path $repo 'unreal\Config\DefaultGame.ini')),'(?m)^ProjectVersion=([^\r\n]+)').Groups[1].Value.Trim()
if (-not $version -or $version -ne $nativeVersion) { throw 'package.json and native ProjectVersion must match before selecting a test build.' }

function Find-ShippingPackage {
    $candidates=@(Get-ChildItem -LiteralPath $testRoot -Directory -Filter 'unreal-*' -ErrorAction SilentlyContinue | ForEach-Object {
        $report=Join-Path $_.FullName 'result.json'
        if (Test-Path -LiteralPath $report -PathType Leaf) {
            try {
                $build=Get-Content -Raw -LiteralPath $report | ConvertFrom-Json
                if ($build.format -eq 2 -and $build.version -eq $version -and $build.configuration -eq 'Shipping' -and
                    $build.editorCompiled -eq $true -and $build.assetsPrepared -eq $true -and
                    $build.nativeTestsPassed -eq $true -and $build.packaged -eq $true -and $build.finished -and -not $build.error) {
                    [pscustomobject]@{Report=$report;Directory=$_.FullName;Build=$build;Finished=[DateTimeOffset]::Parse($build.finished)}
                }
            } catch { Write-Verbose ('Ignoring unreadable native build report: '+$report) }
        }
    } | Sort-Object Finished -Descending)
    foreach ($candidate in $candidates) {
        try {
            $build=$candidate.Build
            $directory=[IO.Path]::GetFullPath($build.packageDirectory).TrimEnd('\','/')
            $archiveRoot=[IO.Path]::GetFullPath((Join-Path $candidate.Directory 'archive'))
            if (-not $directory.StartsWith($archiveRoot+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Package directory is outside this build report''s archive.' }
            Assert-IsolatedDirectory $directory
            $manifestPath=Join-Path $directory 'package-manifest.json'
            $manifestItem=Get-Item -LiteralPath $manifestPath -Force
            if ($manifestItem.PSIsContainer -or ($manifestItem.Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Package manifest is not an ordinary file.' }
            $manifest=Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
            if ($manifest.format -ne 1 -or $manifest.gameVersion -ne $version) { throw 'Package manifest does not match the current game version.' }
            # Use the actual game, never the root bootstrap EXE or UnrealEditor.
            $native=@($manifest.files | Where-Object { $_.path -match '^WNT1922/Binaries/Win64/WNT1922(?:-Win64-Shipping)?\.exe$' })
            if ($native.Count -ne 1) { throw 'Expected exactly one packaged Shipping game executable.' }
            $executable=[IO.Path]::GetFullPath((Join-Path $directory $native[0].path))
            Assert-IsolatedDirectory (Split-Path -Parent $executable)
            $file=Get-Item -LiteralPath $executable -Force
            if ($file.PSIsContainer -or ($file.Attributes -band [IO.FileAttributes]::ReparsePoint) -or
                $file.Length -ne $native[0].bytes -or (Get-FileHash -LiteralPath $executable -Algorithm SHA256).Hash.ToLowerInvariant() -ne $native[0].sha256) {
                throw 'The native game executable does not match its completed package manifest.'
            }
            # Do not compare the entire source fingerprint: live UI and artwork
            # edits are intentionally consumed directly through -WNTDataRoot.
            return [pscustomobject]@{Report=$candidate.Report;Directory=$directory;Executable=$executable;ExecutableSha256=$native[0].sha256;Version=$version;Finished=$candidate.Finished.ToString('o')}
        } catch { Write-Warning ('Ignoring invalid Shipping package '+$candidate.Report+': '+$_.Exception.Message) }
    }
    return $null
}

function Get-CodeIntegrityState([string]$Executable) {
    $state=$null; $block=$null; $blocked=$false
    try {
        $state=(Get-ItemProperty -LiteralPath 'HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy' -Name VerifiedAndReputablePolicyState -ErrorAction Stop).VerifiedAndReputablePolicyState
    } catch { Write-Verbose 'Smart App Control status could not be read.' }
    if ($Executable) {
        try {
            # CI uses device-volume paths; compare the complete drive-relative path.
            $suffix=if ($Executable -match '^[A-Za-z]:\\') { $Executable.Substring(2) } else { $Executable }
            $block=Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-CodeIntegrity/Operational';Id=3077;StartTime=(Get-Date).AddDays(-7)} -MaxEvents 128 -ErrorAction Stop |
                Where-Object { $_.ToXml().IndexOf($suffix,[StringComparison]::OrdinalIgnoreCase) -ge 0 } | Select-Object -First 1
        } catch { Write-Verbose 'No readable recent WNT1922 Code Integrity block was found.' }
        if ($state -eq 1 -and $block) {
            $signature=Get-AuthenticodeSignature -LiteralPath $Executable
            $blocked=$signature.Status -eq 'NotSigned' -and $block.TimeCreated.ToUniversalTime() -ge (Get-Item -LiteralPath $Executable).LastWriteTimeUtc
        }
    }
    return [pscustomobject]@{State=$state;RecentBlock=if($block){$block.TimeCreated}else{$null};Blocked=$blocked}
}
$package=Find-ShippingPackage
$integrity=Get-CodeIntegrityState $package.Executable
$missingPackage='No validated Shipping package exists for WNT1922 '+$version+'. Use Test-Unreal.cmd -BuildFirst to compile, test and package Shipping; older versions, Development builds and UnrealEditor are not launched.'
Write-Host ('Test saves: '+$SaveDirectory)
Write-Host 'The normal WNT1922 save directory is not used. This launcher uses a Shipping game with live workspace UI and artwork.'
if ($CheckOnly) {
    $problems=@()
    if (-not $setup.NodeVersion) { $problems+='A working Windows x64 Node.js 24+ runtime is required; use -NodePath.' }
    if (-not $package) { $problems+=$missingPackage }
    if ($integrity.Blocked) { $problems+='Windows Code Integrity blocked the current Shipping executable.' }
    [pscustomobject]@{LaunchReady=($problems.Count -eq 0);PrerequisitesReady=$setup.Ready;BuildPrerequisitesReady=$setup.Ready;Repository=$repo;Version=$version;BuildReport=$package.Report;ExecutablePath=$package.Executable;ExecutableSha256=$package.ExecutableSha256;Configuration='Shipping';SaveDirectory=$SaveDirectory;UserDirectory=$userDir;Automation=[bool]$Automation;DebugPort=if($Automation){$DebugPort}else{$null};SmartAppControlState=$integrity.State;CurrentUnsignedExecutableBlocked=$integrity.Blocked;RecentExecutableBlock=$integrity.RecentBlock;Problems=$problems;BuildProblems=$setup.Problems}
    return
}
if (-not $setup.NodeVersion) { throw 'A working Windows x64 Node.js 24+ runtime is required; use -NodePath.' }
if ($BuildFirst -and -not $setup.Ready) { throw ($setup.Problems -join [Environment]::NewLine) }
if (-not $BuildFirst -and -not $package) { throw $missingPackage }
if (-not $BuildFirst -and $integrity.Blocked) { throw 'Windows has blocked the current unsigned Shipping executable and Smart App Control still reports enforcement. No launch was attempted. See unreal/BUILDING.md.' }
New-Item -ItemType Directory -Path $run -Force | Out-Null
$status=[ordered]@{format=2;started=[DateTime]::UtcNow.ToString('o');mode=if($Automation){'automation'}else{'interactive'};version=$version;configuration='Shipping';liveDataRoot=$repo;nodePath=$setup.Node;saveDirectory=$SaveDirectory;userDirectory=$userDir;smartAppControlState=$integrity.State;launched=$false;automationPassed=$false}
$log=Join-Path $run 'unreal.log'
function Assert-LaunchLog {
    if ((Test-Path -LiteralPath $log) -and (Select-String -LiteralPath $log -SimpleMatch 'GetLastError=4551' -Quiet)) {
        throw ('Windows Code Integrity blocked a native module (4551). The launcher cannot grant a trust exemption. See '+$log)
    }
    if (Test-Path -LiteralPath $log) {
        $startupError=Select-String -LiteralPath $log -SimpleMatch 'LogTemp: Error: WNT Unreal:' | Select-Object -Last 1
        if ($startupError) { throw ('Native startup failed: '+$startupError.Line+' See '+$log) }
        $shaderError=Select-String -LiteralPath $log -Pattern 'Failed to compile Material|LogShaderCompilers: Error|LogMaterial: Error|LogGLTFRuntime: Error|LogTexture: Error' | Select-Object -Last 1
        if ($shaderError) { throw ('Native material failed; a default shader would hide the problem: '+$shaderError.Line+' See '+$log) }
    }
}
try {
    if ($BuildFirst) {
        & (Join-Path $PSScriptRoot 'Build-Unreal.ps1') -EngineRoot $setup.Engine.Root -NodePath $setup.Node -Package -Configuration Shipping
        $package=Find-ShippingPackage
        if (-not $package) { throw $missingPackage }
        $integrity=Get-CodeIntegrityState $package.Executable
        $status.smartAppControlState=$integrity.State
    }
    if ($integrity.Blocked) { throw 'Windows has blocked the current unsigned Shipping executable and Smart App Control still reports enforcement. No launch was attempted. See unreal/BUILDING.md.' }
    $executable=$package.Executable
    $status.buildReport=$package.Report; $status.executablePath=$executable; $status.executableSha256=$package.ExecutableSha256
    Write-Host ('Shipping package: '+$package.Report)
    if ($Automation) {
        $listener=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,$DebugPort)
        try { $listener.Start() } catch { throw ('Debug port '+$DebugPort+' is already in use. Close the earlier test instance or specify another -DebugPort; no existing browser will be attached.') }
        finally { $listener.Stop() }
    }
    Assert-IsolatedDirectory $SaveDirectory
    Assert-IsolatedDirectory $userDir
    New-Item -ItemType Directory -Path $SaveDirectory,$userDir -Force | Out-Null
    # Start-Process joins ArgumentList into one Windows command line. Quote every
    # path explicitly; reject quote injection in caller-provided locations.
    function Quote-Argument([string]$Value) {
        if ($Value.Contains('"') -or $Value.Contains("`r") -or $Value.Contains("`n")) { throw 'Native launch paths cannot contain quotes or line breaks.' }
        return '"'+$Value+'"'
    }
    $arguments=@((Quote-Argument ('-WNTDataRoot='+$repo)),(Quote-Argument ('-WNTNode='+$setup.Node)),(Quote-Argument ('-WNTSaveDir='+$SaveDirectory)),(Quote-Argument ('-UserDir='+$userDir)),(Quote-Argument ('-abslog='+$log)),'-windowed','-ForceRes','-ResX=1800','-ResY=1000','-nosplash')
    # Render on the GPU without accepting the desktop cursor. Otherwise Slate's
    # physical mouse updates race the CEF automation pointer and cancel hovers.
    if ($Automation) { $arguments+=@('-WNTAutomation','-RenderOffscreen',('-cefdebug='+$DebugPort)) }
    if ($Automation) { $game=Start-Process -FilePath $executable -ArgumentList $arguments -WorkingDirectory $package.Directory -WindowStyle Hidden -PassThru }
    else { $game=Start-Process -FilePath $executable -ArgumentList $arguments -WorkingDirectory $package.Directory -PassThru }
    $gameStartedUtc=$game.StartTime.ToUniversalTime()
    $status.launched=$true; $status.processId=$game.Id
    $process=Get-CimInstance Win32_Process -Filter ('ProcessId='+$game.Id)
    if ($process.ExecutablePath -ne $executable -or -not $process.CommandLine -or -not $process.CommandLine.Contains('-UserDir='+$userDir)) { throw 'Could not verify the launched Shipping executable and isolated profile identity.' }
    $status.processStartedUtc=$gameStartedUtc.ToString('o'); $status.processCommandLine=$process.CommandLine
    Write-Host ('Opened native test game (PID '+$game.Id+'). Close its window normally to save and exit.')
    Write-Host ('Test profile: '+$userDir+'. Shipping omits the Unreal development log; the launch report is stored in '+$run)
    if ($Automation) {
        $status.debugPort=$DebugPort
        $ready=$false; $deadline=[DateTime]::UtcNow.AddMinutes(2)
        do {
            $game.Refresh()
            Assert-LaunchLog
            if ($game.HasExited) { Assert-LaunchLog; throw ('Unreal exited before automation connected; exit code '+$game.ExitCode+'. See '+$log) }
            try { $pages=Invoke-RestMethod -Uri ('http://127.0.0.1:'+$DebugPort+'/json/list') -TimeoutSec 2; $ready=@($pages | Where-Object { $_.url -match '^http://127\.0\.0\.1:\d+/.*[?&]unreal=1(?:&|$)' }).Count -gt 0 } catch { }
            if (-not $ready) { Start-Sleep -Milliseconds 500 }
        } while (-not $ready -and [DateTime]::UtcNow -lt $deadline)
        Assert-LaunchLog
        if (-not $ready) { throw ('The native game did not expose its opted-in test page within two minutes. See '+$log) }
        $output=Join-Path $run 'runtime'
        & $setup.Node (Join-Path $repo 'tools\verify-unreal-runtime.mjs') "--debug-port=$DebugPort" "--output=$output" ('--capture-dir='+(Join-Path $userDir 'Saved\Screenshots'))
        if ($LASTEXITCODE -ne 0) { throw ('Native runtime verification failed. The owned game is cleaned up unless -KeepRunning was selected. See '+(Join-Path $output 'result.json')) }
        Assert-LaunchLog
        $status.automationPassed=$true
        if (-not $KeepRunning) {
            $status.shutdown=& (Join-Path $PSScriptRoot 'Stop-UnrealTest.ps1') -ProcessId $game.Id -ProcessStartedUtc $gameStartedUtc -ExecutablePath $executable -SaveDirectory $SaveDirectory -RuntimeReport (Join-Path $output 'result.json') -NodePath $setup.Node
            $runtime=Get-Content -Raw -LiteralPath (Join-Path $output 'result.json') | ConvertFrom-Json
            $runtime.gameLeftRunning=$false
            $runtime | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath (Join-Path $output 'result.json') -Encoding UTF8
            Write-Host 'Native runtime checks passed. The isolated test game was stopped after verifying its paused save.'
        } else { Write-Host 'Native runtime checks passed. The opted-in offscreen test remains running for inspection (-KeepRunning).' }
    } else {
        Start-Sleep -Seconds 2
        $game.Refresh(); Assert-LaunchLog
        if ($game.HasExited) { throw ('Unreal exited during startup; exit code '+$game.ExitCode+'. See '+$log) }
        Write-Host 'Interactive launch requested; this does not certify that native rendering or gameplay tests passed.'
    }
} catch {
    $status.error=$_.Exception.Message
    throw
} finally {
    if ($Automation -and -not $KeepRunning -and $game) {
        $game.Refresh()
        if (-not $game.HasExited) {
            # A failed automation owns only this newly created disposable profile.
            # Never enumerate or terminate another Unreal session.
            $owned=Get-Process -Id $game.Id -ErrorAction SilentlyContinue
            if ($owned -and $owned.StartTime.ToUniversalTime() -eq $gameStartedUtc -and $owned.Path -eq $executable) {
                $command=(Get-CimInstance Win32_Process -Filter ('ProcessId='+$owned.Id)).CommandLine
                if ($command -and $command.Contains('-WNTAutomation') -and $command.Contains('-RenderOffscreen') -and $command.Contains('-WNTSaveDir='+$SaveDirectory) -and $command.Contains('-UserDir='+$userDir)) {
                    Stop-Process -Id $owned.Id
                    [void]$owned.WaitForExit(10000)
                    $status.cleanup='Stopped only the launched offscreen process for this disposable failed test.'
                    if ($output -and (Test-Path -LiteralPath (Join-Path $output 'result.json'))) {
                        $runtime=Get-Content -Raw -LiteralPath (Join-Path $output 'result.json') | ConvertFrom-Json
                        $runtime.gameLeftRunning=$false
                        $runtime | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath (Join-Path $output 'result.json') -Encoding UTF8
                    }
                }
            }
        }
    }
    $status.finished=[DateTime]::UtcNow.ToString('o')
    $status | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $run 'launch-result.json') -Encoding UTF8
    Write-Host ('Test report: '+$run)
}
