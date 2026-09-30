[CmdletBinding()]
param([string]$EngineRoot, [string]$NodePath, [switch]$BuildFirst, [switch]$Game)
$ErrorActionPreference='Stop'
if ($Game) {
    # Interactive testing uses the offline Shipping binary. Editor -game retains
    # Unreal's development network services even for a single-player project.
    & (Join-Path $PSScriptRoot 'Test-Unreal.ps1') -EngineRoot $EngineRoot -NodePath $NodePath -BuildFirst:$BuildFirst
    return
}
$setup=& (Join-Path $PSScriptRoot 'Check-Unreal.ps1') -EngineRoot $EngineRoot -NodePath $NodePath -PassThru -RequireReady
if ($BuildFirst) { & (Join-Path $PSScriptRoot 'Build-Unreal.ps1') -EngineRoot $setup.Engine.Root -NodePath $setup.Node }
$module=Join-Path $setup.Repository 'unreal\Binaries\Win64\UnrealEditor-WNT1922.dll'
$map=Join-Path $setup.Repository 'unreal\Content\Maps\WNTWorld.umap'
if (-not (Test-Path -LiteralPath $module) -or -not (Test-Path -LiteralPath $map)) { throw 'The native editor module/map is not ready. Run tools/Build-Unreal.ps1 first, or use -BuildFirst.' }
$arguments=@(('"'+$setup.Project+'"'),('"-WNTDataRoot='+$setup.Repository+'"'),('"-WNTNode='+$setup.Node+'"'))
if ($Game) { $arguments+=@('-game','-windowed','-ForceRes','-ResX=1800','-ResY=1000') }
# This command explicitly opens an interactive editor/game, not a background helper.
$process=Start-Process -FilePath $setup.Engine.Editor -ArgumentList $arguments -WorkingDirectory $setup.Repository -PassThru
Write-Host ('Opened native Unreal ' + $(if($Game){'game'}else{'editor'}) + ' (PID ' + $process.Id + ').')
