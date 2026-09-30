[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][int]$ProcessId,
    [Parameter(Mandatory=$true)][DateTime]$ProcessStartedUtc,
    [Parameter(Mandatory=$true)][string]$ExecutablePath,
    [Parameter(Mandatory=$true)][string]$SaveDirectory,
    [Parameter(Mandatory=$true)][string]$RuntimeReport,
    [Parameter(Mandatory=$true)][string]$NodePath
)
$ErrorActionPreference='Stop'
$repo=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$save=[IO.Path]::GetFullPath($SaveDirectory).TrimEnd('\','/')
if (-not $save.StartsWith((Join-Path $repo '.build')+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Only isolated repository test profiles may be stopped.' }
function Get-OwnedProcess {
    $p=Get-Process -Id $ProcessId -ErrorAction Stop
    if ($p.StartTime.ToUniversalTime() -ne $ProcessStartedUtc.ToUniversalTime() -or $p.Path -ne $ExecutablePath) { throw 'Test process identity changed; refusing shutdown.' }
    $command=(Get-CimInstance Win32_Process -Filter ('ProcessId='+$ProcessId)).CommandLine
    if (-not $command.Contains('-WNTAutomation') -or -not $command.Contains('-RenderOffscreen') -or -not $command.Contains('-WNTSaveDir='+$save)) { throw 'The process is not the owned offscreen test profile.' }
    return $p
}
$game=Get-OwnedProcess
$cleanup=Join-Path (Split-Path -Parent $RuntimeReport) 'shutdown.json'
& $NodePath (Join-Path $PSScriptRoot 'prepare-unreal-test-exit.mjs') ('--runtime-report='+$RuntimeReport) ('--save-dir='+$save) ('--output='+$cleanup)
if ($LASTEXITCODE -ne 0) { throw 'Save verification failed. The test process was left running.' }
$saved=Get-Content -Raw -LiteralPath $cleanup | ConvertFrom-Json
if ($saved.saved -ne $true -or $saved.paused -ne $true) { throw 'Missing successful save verification. No process was stopped.' }
$game=Get-OwnedProcess
$method='normal-window-close'
if (-not $game.CloseMainWindow() -or -not $game.WaitForExit(10000)) {
    # Offscreen Unreal has no closable HWND. Its campaign has now been saved,
    # re-read from disk and compared with the successful test snapshot.
    $game=Get-OwnedProcess
    Stop-Process -Id $game.Id -ErrorAction Stop
    if (-not $game.WaitForExit(10000)) { throw 'The owned test process did not exit.' }
    $method='owned-offscreen-process-terminated-after-verified-save'
}
$saved | Add-Member -NotePropertyName processId -NotePropertyValue $ProcessId
$saved | Add-Member -NotePropertyName shutdownMethod -NotePropertyValue $method
$saved | Add-Member -NotePropertyName stopped -NotePropertyValue $true
$saved | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $cleanup -Encoding UTF8
$saved
