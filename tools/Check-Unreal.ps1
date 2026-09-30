[CmdletBinding()]
param([string]$EngineRoot, [string]$NodePath, [switch]$PassThru, [switch]$RequireReady)
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$problems = [Collections.Generic.List[string]]::new()
$candidates = [Collections.Generic.List[string]]::new()
if ($EngineRoot) { $candidates.Add($EngineRoot) }
elseif ($env:WNT_UNREAL_ROOT) { $candidates.Add($env:WNT_UNREAL_ROOT) }
else {
    foreach ($key in @('HKLM:\SOFTWARE\EpicGames\Unreal Engine', 'HKLM:\SOFTWARE\WOW6432Node\EpicGames\Unreal Engine')) {
        if (Test-Path $key) { Get-ChildItem $key | ForEach-Object { $entry = Get-ItemProperty $_.PSPath; if ($entry.InstalledDirectory) { $candidates.Add($entry.InstalledDirectory) } } }
    }
    $builds = Get-ItemProperty 'HKCU:\SOFTWARE\Epic Games\Unreal Engine\Builds' -ErrorAction SilentlyContinue
    if ($builds) { $builds.PSObject.Properties | Where-Object { $_.Name -notlike 'PS*' -and $_.Value -is [string] } | ForEach-Object { $candidates.Add($_.Value) } }
    $launcher = Join-Path $env:ProgramData 'Epic\UnrealEngineLauncher\LauncherInstalled.dat'
    if (Test-Path -LiteralPath $launcher) {
        try { (Get-Content -Raw -LiteralPath $launcher | ConvertFrom-Json).InstallationList | Where-Object { $_.AppName -like 'UE_*' } | ForEach-Object { $candidates.Add($_.InstallLocation) } } catch { Write-Verbose 'Epic installation inventory is not readable yet.' }
    }
    $epic = Join-Path $env:ProgramFiles 'Epic Games'
    if (Test-Path -LiteralPath $epic) { Get-ChildItem -LiteralPath $epic -Directory -Filter 'UE_*' | ForEach-Object { $candidates.Add($_.FullName) } }
}
$engines = @($candidates | Select-Object -Unique | ForEach-Object {
    $location = [IO.Path]::GetFullPath($_)
    $versionPath = Join-Path $location 'Engine\Build\Build.version'
    if (Test-Path -LiteralPath $versionPath) {
        try {
            $v = Get-Content -Raw -LiteralPath $versionPath | ConvertFrom-Json
            $version = [version]::new([int]$v.MajorVersion, [int]$v.MinorVersion, [int]$v.PatchVersion)
            if ($version -ge [version]'5.8' -and $version.Major -eq 5) {
                $editor = Join-Path $location 'Engine\Binaries\Win64\UnrealEditor.exe'
                $command = Join-Path $location 'Engine\Binaries\Win64\UnrealEditor-Cmd.exe'
                $build = Join-Path $location 'Engine\Build\BatchFiles\Build.bat'
                $uat = Join-Path $location 'Engine\Build\BatchFiles\RunUAT.bat'
                if ((Test-Path -LiteralPath $editor) -and (Test-Path -LiteralPath $command) -and (Test-Path -LiteralPath $build) -and (Test-Path -LiteralPath $uat)) {
                    [pscustomobject]@{Root=$location;Version=$version;Editor=$editor;Command=$command;Build=$build;UAT=$uat}
                }
            }
        } catch { Write-Verbose ('Incomplete engine installation: ' + $location) }
    }
} | Sort-Object Version -Descending)
$engine = $engines | Select-Object -First 1
if (-not $engine) { $problems.Add('Unreal Engine 5.8+ for Windows is absent or still installing. Use -EngineRoot for a custom installation.') }
$vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
$visualStudio = $null; $compiler = $null
if (Test-Path -LiteralPath $vswhere) {
    $installations = @((& $vswhere -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -format json -utf8 | ConvertFrom-Json) | Sort-Object { [version]$_.installationVersion } -Descending)
    foreach ($installation in $installations) {
        if ([version]$installation.installationVersion -lt [version]'17.14') { continue }
        $toolsPath = Join-Path $installation.installationPath 'VC\Tools\MSVC'
        $versions = @(Get-ChildItem -LiteralPath $toolsPath -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -match '^\d+\.\d+\.\d+$' -and [version]$_.Name -ge [version]'14.38' } | Sort-Object { [version]$_.Name } -Descending)
        foreach ($toolset in $versions) {
            $cl = Join-Path $toolset.FullName 'bin\Hostx64\x64\cl.exe'
            if (Test-Path -LiteralPath $cl) { $visualStudio=$installation; $compiler=$cl; break }
        }
        if ($compiler) { break }
    }
}
if (-not $compiler) { $problems.Add('Visual Studio 2022 17.14+ or 2026 with C++ x64 tools (MSVC 14.38+) is required.') }
$sdkRoots=@((Join-Path ${env:ProgramFiles(x86)} 'Windows Kits\10'),(Join-Path $env:ProgramFiles 'Windows Kits\10'))
foreach ($key in @('HKLM:\SOFTWARE\Microsoft\Windows Kits\Installed Roots','HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows Kits\Installed Roots')) {
    $kits=Get-ItemProperty $key -ErrorAction SilentlyContinue
    if ($kits -and $kits.KitsRoot10) { $sdkRoots+=@($kits.KitsRoot10) }
}
$sdk = @($sdkRoots | Select-Object -Unique | ForEach-Object {
    $sdkCandidate=$_
    Get-ChildItem -LiteralPath (Join-Path $sdkCandidate 'Include') -Directory -ErrorAction SilentlyContinue | Where-Object {
        $_.Name -match '^10\.0\.\d+\.0$' -and [version]$_.Name -ge [version]'10.0.22621.0' -and
        (Test-Path -LiteralPath (Join-Path $_.FullName 'um\Windows.h')) -and
        (Test-Path -LiteralPath (Join-Path $sdkCandidate ('Lib\' + $_.Name + '\um\x64\kernel32.lib'))) -and
        (Test-Path -LiteralPath (Join-Path $sdkCandidate ('bin\' + $_.Name + '\x64\rc.exe')))
    } | ForEach-Object { [pscustomobject]@{Name=$_.Name;Root=$sdkCandidate} }
} | Sort-Object { [version]$_.Name } -Descending) | Select-Object -First 1
if (-not $sdk) { $problems.Add('Windows SDK 10.0.22621.0+ with x64 libraries and resource compiler is required.') }
if (-not $NodePath) { $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue; if ($nodeCommand) { $NodePath=$nodeCommand.Source } }
if (-not $NodePath) {
    $localRuntime=Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    if (Test-Path -LiteralPath $localRuntime -PathType Leaf) { $NodePath=$localRuntime }
}
$nodeVersion = $null
if ($NodePath -and (Test-Path -LiteralPath $NodePath)) {
    $nodeInfo = & $NodePath -p 'JSON.stringify({version:process.versions.node,arch:process.arch,platform:process.platform})' 2>$null | ConvertFrom-Json
    if ($LASTEXITCODE -eq 0 -and $nodeInfo.platform -eq 'win32' -and $nodeInfo.arch -eq 'x64' -and [version]$nodeInfo.version -ge [version]'24.0') { $nodeVersion=$nodeInfo.version }
}
if (-not $nodeVersion) { $problems.Add('A working Windows x64 Node.js 24+ executable is required for the campaign worker; use -NodePath if it is not on PATH.') }
$result = [pscustomobject]@{
    Ready=($problems.Count -eq 0); Engine=$engine; VisualStudio=$visualStudio; Compiler=$compiler
    WindowsSDK=if($sdk){$sdk.Name}else{$null}; WindowsSDKRoot=if($sdk){$sdk.Root}else{$null}; Node=$NodePath; NodeVersion=$nodeVersion
    Project=(Join-Path $repo 'unreal\WNT1922.uproject'); Repository=$repo; Problems=@($problems)
}
if ($PassThru) { $result }
else {
    Write-Host ('Native Unreal prerequisites ready: ' + $result.Ready)
    if ($engine) { Write-Host ('Unreal ' + $engine.Version + ': ' + $engine.Root) }
    if ($compiler) { Write-Host ('MSVC: ' + $compiler) }
    if ($sdk) { Write-Host ('Windows SDK: ' + $sdk.Name) }
    if ($nodeVersion) { Write-Host ('Node ' + $nodeVersion + ': ' + $NodePath) }
    foreach ($problem in $problems) { Write-Host ('- ' + $problem) }
    Write-Host 'This is a prerequisite check, not a native compile or visual test.'
}
if ($RequireReady -and -not $result.Ready) { throw ($problems -join [Environment]::NewLine) }
