[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$EngineRoot)
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$source = Join-Path $EngineRoot 'Engine\Source\Runtime\WebBrowser'
$destination = Join-Path $repo 'unreal\Source\WNTWebBrowser'
if (-not (Test-Path -LiteralPath (Join-Path $source 'WebBrowser.Build.cs'))) { throw 'Installed Unreal WebBrowser source is required for the offline browser module.' }
# The generated engine source is private, ignored by git, and never copied into
# GameData or a source release. Only this original transformation is published.
function Rename-BrowserSymbols([string]$value) {
    $value=$value.Replace('WEBBROWSER_API','WNTWEBBROWSER_API').Replace('WebBrowser','WNTWebBrowser').Replace('WebJS','WNTWebJS')
    $value=$value.Replace('FCEF','FWNTCEF').Replace('FCef','FWNTCef').Replace('ICef','IWNTCef').Replace('LogCEFBrowser','LogWNTCEFBrowser')
    $value=$value.Replace('FMobileJS','FWNTMobileJS').Replace('FNativeJS','FWNTNativeJS').Replace('LogMobileJS','LogWNTMobileJS')
    foreach ($symbol in @('FWebNavigationRequest','EWebTransitionSourceQualifier','EWebTransitionSource','FBrowserContextSettings','FCreateBrowserWindowSettings','FBrowserBufferedVideo','FHandlerHeaderSetter','FContextRequestHeaders','FOnBeforePopupDelegate','FOnCreateWindowDelegate','FOnCloseWindowDelegate','FOnCreateToolTip','FOnConsoleMessageDelegate','FOnFloatingCloseButtonPressedDelegate','FOnBeforeContextResourceLoadDelegate','FOnSuppressContextMenu')) {
        $renamed=$symbol.Substring(0,1)+'WNT'+$symbol.Substring(1)
        $value=[regex]::Replace($value,'\b'+[regex]::Escape($symbol)+'\b',$renamed)
    }
    # Engine assets and the unrelated mobile texture module keep their names.
    return $value.Replace('/Engine/WNTWebBrowser/','/Engine/WebBrowser/').Replace('WNTWebBrowserTexture','WebBrowserTexture').Replace('r.CEFGPUAcceleration','r.WNTCEFGPUAcceleration')
}
function Replace-Exactly([string]$text,[string]$from,[string]$to,[string]$label) {
    if ([regex]::Matches($text,[regex]::Escape($from)).Count -ne 1) { throw ('Installed UE source changed at '+$label+'; review the offline patch before building.') }
    return $text.Replace($from,$to)
}
$encoding=[Text.UTF8Encoding]::new($false)
$count=0
$sourceFiles=@(Get-ChildItem -LiteralPath $source -File -Recurse)
$renamedBasenames=@{}
foreach ($file in $sourceFiles) {
    # UHT also rejects duplicate header basenames across modules, even where
    # every C++ type is private or has already been renamed.
    if ((Rename-BrowserSymbols $file.Name) -ceq $file.Name) { $renamedBasenames[$file.Name]='WNT'+$file.Name }
}
$expected=[Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($file in $sourceFiles) {
    $relative=$file.FullName.Substring($source.Length+1)
    $target=Join-Path $destination (Rename-BrowserSymbols $relative)
    $originalText=[IO.File]::ReadAllText($file.FullName)
    foreach ($basename in $renamedBasenames.Keys) {
        # Only filenames, never CEF SDK class/function names.
        $originalText=$originalText.Replace($basename,$renamedBasenames[$basename])
        if ([IO.Path]::GetExtension($basename) -eq '.h') {
            $generated=[IO.Path]::GetFileNameWithoutExtension($basename)+'.generated.h'
            $renamedGenerated=[IO.Path]::GetFileNameWithoutExtension($renamedBasenames[$basename])+'.generated.h'
            $originalText=$originalText.Replace($generated,$renamedGenerated)
        }
    }
    if ($renamedBasenames.ContainsKey($file.Name)) { $target=Join-Path (Split-Path -Parent $target) $renamedBasenames[$file.Name] }
    [void]$expected.Add([IO.Path]::GetFullPath($target))
    $text=Rename-BrowserSymbols $originalText
    if ($relative -eq 'WebBrowser.Build.cs') {
        $anchor='bRequiresPlatformSDK = true;'
        $text=Replace-Exactly $text $anchor ($anchor+"`n"+'        if (Target.Platform != UnrealTargetPlatform.Win64) throw new BuildException("WNT offline browser currently supports Windows only.");') 'Windows target'
    }
    elseif ($relative -eq 'Public\WebBrowserModule.h') {
        $text=Replace-Exactly $text 'FString ProductVersion;' ('FString ProductVersion;'+"`n"+'    FString OfflineProxy = TEXT("http://127.0.0.1:9");') 'offline initialization field'
    }
    elseif ($relative -eq 'Private\CEF\CEFBrowserApp.h') {
        $text=Replace-Exactly $text 'FWNTCEFBrowserApp();' 'explicit FWNTCEFBrowserApp(const FString& InOfflineProxy);' 'CEF constructor declaration'
        $text=Replace-Exactly $text 'int64 MessagePumpCountdown;' "int64 MessagePumpCountdown;`n    FString OfflineProxy;" 'CEF proxy state'
    }
    elseif ($relative -eq 'Private\CEF\CEFBrowserApp.cpp') {
        $text=Replace-Exactly $text 'FWNTCEFBrowserApp::FWNTCEFBrowserApp()' 'FWNTCEFBrowserApp::FWNTCEFBrowserApp(const FString& InOfflineProxy)' 'CEF constructor'
        $text=Replace-Exactly $text ': MessagePumpCountdown(0)' ': MessagePumpCountdown(0), OfflineProxy(InOfflineProxy)' 'CEF proxy initialization'
        $anchor='CommandLine->AppendSwitch("disable-background-networking");'
        $patch=@'
    // WNT single-player: disable Cast/mDNS discovery before Chromium initializes.
    CommandLine->AppendSwitchWithValue("disable-features", "MediaRouter,DialMediaRouteProvider,CastMediaRouteProvider,OptimizationHints,AutofillServerCommunication");
    CommandLine->AppendSwitch("disable-quic");
    CommandLine->AppendSwitch("disable-dns-prefetch");
    CommandLine->AppendSwitchWithValue("host-resolver-rules", "MAP * ~NOTFOUND, EXCLUDE 127.0.0.1");
    // No DIRECT fallback. Non-loopback HTTP(S) can only reach our local server,
    // which rejects foreign Host headers and unsupported CONNECT requests.
    CommandLine->AppendSwitchWithValue("proxy-server", TCHAR_TO_UTF8(*OfflineProxy));
    CommandLine->AppendSwitchWithValue("proxy-bypass-list", "127.0.0.1");
'@
        $text=Replace-Exactly $text $anchor ($anchor+"`n"+$patch) 'offline CEF switches'
    }
    elseif ($relative -eq 'Private\WebBrowserSingleton.cpp') {
        $text=Replace-Exactly $text 'new FWNTCEFBrowserApp;' 'new FWNTCEFBrowserApp(WNTWebBrowserInitSettings.OfflineProxy);' 'custom initialization handoff'
        $text=Replace-Exactly $text 'uint16 DebugPort;' "Settings.remote_debugging_port = 0;`n        uint16 DebugPort;`n        FString AutomationSaveDirectory;" 'no default debug listener'
        $anchor='if(FParse::Value(FCommandLine::Get(), TEXT("cefdebug="), DebugPort))'
        $replacement=@'
if(FParse::Param(FCommandLine::Get(), TEXT("WNTAutomation"))
            && FParse::Value(FCommandLine::Get(), TEXT("WNTSaveDir="), AutomationSaveDirectory)
            && !AutomationSaveDirectory.IsEmpty() && !FPaths::IsRelative(AutomationSaveDirectory)
            && FParse::Value(FCommandLine::Get(), TEXT("cefdebug="), DebugPort) && DebugPort >= 1024)
'@
        $text=Replace-Exactly $text $anchor $replacement 'explicit isolated debug gate'
    }
    $parent=Split-Path -Parent $target
    [void][IO.Directory]::CreateDirectory($parent)
    if (-not (Test-Path -LiteralPath $target) -or [IO.File]::ReadAllText($target) -cne $text) { [IO.File]::WriteAllText($target,$text,$encoding) }
    $count++
}
# Remove only stale files in this exact generated module, never engine sources
# or sibling project files. This also makes filename-renaming upgrades safe.
$generatedRoot=[IO.Path]::GetFullPath((Join-Path $repo 'unreal\Source\WNTWebBrowser')).TrimEnd('\')
if ([IO.Path]::GetFullPath($destination).TrimEnd('\') -cne $generatedRoot) { throw 'Unexpected generated browser destination.' }
foreach ($obsolete in Get-ChildItem -LiteralPath $generatedRoot -File -Recurse) {
    if (-not $obsolete.FullName.StartsWith($generatedRoot+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Generated cleanup escaped its module directory.' }
    if (-not $expected.Contains($obsolete.FullName)) { Remove-Item -LiteralPath $obsolete.FullName -Force }
}
Write-Host ('Prepared '+$count+' private offline browser source files. Engine installation unchanged.')
