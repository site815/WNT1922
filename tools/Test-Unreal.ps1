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
$setup=& (Join-Path $PSScriptRoot 'Check-Unreal.ps1') -EngineRoot $EngineRoot -NodePath $NodePath -PassThru -RequireReady
$repo=$setup.Repository
$testRoot=[IO.Path]::GetFullPath((Join-Path $repo '.build'))
$run=Join-Path $testRoot ('native-test-'+[DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss-fff')+'-'+[Guid]::NewGuid().ToString('N').Substring(0,6))
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

$module=Join-Path $repo 'unreal\Binaries\Win64\UnrealEditor-WNT1922.dll'
$sacState=$null; $recentBlock=$null; $knownBlocked=$false
try {
    $sacState=(Get-ItemProperty -LiteralPath 'HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy' -Name VerifiedAndReputablePolicyState -ErrorAction Stop).VerifiedAndReputablePolicyState
} catch { Write-Verbose 'Smart App Control status could not be read.' }
try {
    # CI uses device-volume paths; compare the complete drive-relative path.
    $moduleSuffix=if ($module -match '^[A-Za-z]:\\') { $module.Substring(2) } else { $module }
    $recentBlock=Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-CodeIntegrity/Operational';Id=3077;StartTime=(Get-Date).AddDays(-7)} -MaxEvents 128 -ErrorAction Stop |
        Where-Object { $_.ToXml().IndexOf($moduleSuffix,[StringComparison]::OrdinalIgnoreCase) -ge 0 } | Select-Object -First 1
} catch { Write-Verbose 'No readable recent WNT1922 Code Integrity block was found.' }
if ($sacState -eq 1 -and $recentBlock) {
    if (Test-Path -LiteralPath $module) {
        $signature=Get-AuthenticodeSignature -LiteralPath $module
        $knownBlocked=$signature.Status -eq 'NotSigned' -and $recentBlock.TimeCreated.ToUniversalTime() -ge (Get-Item -LiteralPath $module).LastWriteTimeUtc
    }
    Write-Warning ('Smart App Control reports enforcement and Windows logged a WNT1922 module block at '+$recentBlock.TimeCreated+'. See unreal/BUILDING.md for the manual development setup. This launcher does not change Windows security settings.')
}
Write-Host ('Test saves: '+$SaveDirectory)
Write-Host 'The normal WNT1922 save directory is not used. Other Windows security policies may still block unsigned binaries.'
if ($CheckOnly) {
    [pscustomobject]@{PrerequisitesReady=$setup.Ready;Repository=$repo;SaveDirectory=$SaveDirectory;Automation=[bool]$Automation;DebugPort=if($Automation){$DebugPort}else{$null};SmartAppControlState=$sacState;CurrentUnsignedModuleBlocked=$knownBlocked;RecentModuleBlock=if($recentBlock){$recentBlock.TimeCreated}else{$null}}
    return
}
if ($knownBlocked) { throw 'Windows has blocked the current unsigned game module and Smart App Control still reports enforcement. Resolve the Windows trust/development setting first; no build or launch was attempted. See unreal/BUILDING.md.' }
New-Item -ItemType Directory -Path $run -Force | Out-Null
$status=[ordered]@{format=1;started=[DateTime]::UtcNow.ToString('o');mode=if($Automation){'automation'}else{'interactive'};saveDirectory=$SaveDirectory;smartAppControlState=$sacState;launched=$false;automationPassed=$false}
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
    if ($BuildFirst) { & (Join-Path $PSScriptRoot 'Build-Unreal.ps1') -EngineRoot $setup.Engine.Root -NodePath $setup.Node }
    $map=Join-Path $repo 'unreal\Content\Maps\WNTWorld.umap'
    if (-not (Test-Path -LiteralPath $module) -or -not (Test-Path -LiteralPath $map)) {
        throw 'The native module/map is not ready. Use Test-Unreal.cmd -BuildFirst after resolving any Windows trust block.'
    }
    if ($Automation) {
        $listener=[Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,$DebugPort)
        try { $listener.Start() } catch { throw ('Debug port '+$DebugPort+' is already in use. Close the earlier test instance or specify another -DebugPort; no existing browser will be attached.') }
        finally { $listener.Stop() }
    }
    Assert-IsolatedDirectory $SaveDirectory
    New-Item -ItemType Directory -Path $SaveDirectory -Force | Out-Null
    # Start-Process joins ArgumentList into one Windows command line. Quote every
    # path explicitly; reject quote injection in caller-provided locations.
    function Quote-Argument([string]$Value) {
        if ($Value.Contains('"') -or $Value.Contains("`r") -or $Value.Contains("`n")) { throw 'Native launch paths cannot contain quotes or line breaks.' }
        return '"'+$Value+'"'
    }
    $arguments=@((Quote-Argument $setup.Project),(Quote-Argument ('-WNTDataRoot='+$repo)),(Quote-Argument ('-WNTNode='+$setup.Node)),(Quote-Argument ('-WNTSaveDir='+$SaveDirectory)),(Quote-Argument ('-abslog='+$log)),'-game','-windowed','-ResX=1440','-ResY=1000','-nosplash')
    # Render on the GPU without accepting the desktop cursor. Otherwise Slate's
    # physical mouse updates race the CEF automation pointer and cancel hovers.
    if ($Automation) { $arguments+=@('-WNTAutomation','-RenderOffscreen','-ForceRes',('-cefdebug='+$DebugPort)) }
    if ($Automation) { $game=Start-Process -FilePath $setup.Engine.Editor -ArgumentList $arguments -WorkingDirectory $repo -WindowStyle Hidden -PassThru }
    else { $game=Start-Process -FilePath $setup.Engine.Editor -ArgumentList $arguments -WorkingDirectory $repo -PassThru }
    $gameStartedUtc=$game.StartTime.ToUniversalTime()
    $status.launched=$true; $status.processId=$game.Id
    Write-Host ('Opened native test game (PID '+$game.Id+'). Close its window normally to save and exit.')
    Write-Host ('Unreal log: '+$log)
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
        & $setup.Node (Join-Path $repo 'tools\verify-unreal-runtime.mjs') "--debug-port=$DebugPort" "--output=$output"
        if ($LASTEXITCODE -ne 0) { throw ('Native runtime verification failed. The game remains open for inspection. See '+(Join-Path $output 'result.json')) }
        Assert-LaunchLog
        $status.automationPassed=$true
        if (-not $KeepRunning) {
            $status.shutdown=& (Join-Path $PSScriptRoot 'Stop-UnrealTest.ps1') -ProcessId $game.Id -ProcessStartedUtc $gameStartedUtc -ExecutablePath $setup.Engine.Editor -SaveDirectory $SaveDirectory -RuntimeReport (Join-Path $output 'result.json') -NodePath $setup.Node
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
            if ($owned -and $owned.StartTime.ToUniversalTime() -eq $gameStartedUtc -and $owned.Path -eq $setup.Engine.Editor) {
                $command=(Get-CimInstance Win32_Process -Filter ('ProcessId='+$owned.Id)).CommandLine
                if ($command.Contains('-WNTAutomation') -and $command.Contains('-RenderOffscreen') -and $command.Contains('-WNTSaveDir='+$SaveDirectory)) {
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
