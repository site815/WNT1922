[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][ValidateRange(1,2147483647)][int]$ProcessId,
    [Parameter(Mandatory=$true)][DateTimeOffset]$ProcessStartedUtc,
    [Parameter(Mandatory=$true)][string]$ExecutablePath,
    [Parameter(Mandatory=$true)][string]$SaveDirectory,
    [Parameter(Mandatory=$true)][ValidateRange(1024,65535)][int]$DebugPort,
    [Parameter(Mandatory=$true)][string]$OutputDirectory
)
$ErrorActionPreference='Stop'
$repo=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$buildRoot=[IO.Path]::GetFullPath((Join-Path $repo '.build')).TrimEnd('\','/')
$save=[IO.Path]::GetFullPath($SaveDirectory).TrimEnd('\','/')
$output=[IO.Path]::GetFullPath($OutputDirectory).TrimEnd('\','/')
$expectedExe=[IO.Path]::GetFullPath($ExecutablePath)

function Assert-IsolatedPath([string]$Path) {
    if (-not $Path.StartsWith($buildRoot+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Only an isolated directory inside this repository''s .build folder is allowed.' }
    $ancestor=$Path
    while ($ancestor) {
        if (Test-Path -LiteralPath $ancestor) {
            $item=Get-Item -LiteralPath $ancestor -Force
            if (-not $item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw ('Directory is not a plain local directory: '+$ancestor) }
        }
        $ancestor=Split-Path -Parent $ancestor
    }
}
Assert-IsolatedPath $save
Assert-IsolatedPath $output
if (-not (Test-Path -LiteralPath $save -PathType Container)) { throw 'The explicitly supplied isolated save profile must already exist.' }
if ($output -eq $save -or $output.StartsWith($save+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Window verification reports must be outside the save profile they verify.' }

# This helper has no process-launch, termination, global keyboard/mouse input,
# registry or security-setting APIs. Every mutation targets the supplied HWND.
if (-not ('WNTPhysicalWindowProbe' -as [type])) {
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;
public static class WNTPhysicalWindowProbe {
    [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X,Y; }
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left,Top,Right,Bottom; }
    [StructLayout(LayoutKind.Sequential)] public struct MINMAXINFO { public POINT Reserved,MaxSize,MaxPosition,MinTrackSize,MaxTrackSize; }
    [StructLayout(LayoutKind.Sequential)] struct MONITORINFO { public int Size; public RECT Monitor,Work; public uint Flags; }
    public class Snapshot {
        public long Handle,DpiAwarenessContext; public uint ProcessId,Dpi,Style,ExtendedStyle;
        public int DpiAwareness;
        public string ClassName,Title;
        public int ClientWidth,ClientHeight,ClientLeft,ClientTop,Left,Top,Width,Height,FrameWidth,FrameHeight,ActualFrameWidth,ActualFrameHeight;
        public int WorkLeft,WorkTop,WorkWidth,WorkHeight,MonitorWidth,MonitorHeight;
        public bool Visible,Maximized,Minimized,Caption,Resizable,SystemMenu,MinimizeButton,MaximizeButton,Popup;
        public MINMAXINFO Limits;
    }
    delegate bool EnumWindowCallback(IntPtr hwnd,IntPtr data);
    [DllImport("user32.dll")] static extern bool EnumWindows(EnumWindowCallback callback,IntPtr data);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd,out uint pid);
    [DllImport("user32.dll")] static extern bool IsWindow(IntPtr hwnd);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
    [DllImport("user32.dll")] static extern bool IsZoomed(IntPtr hwnd);
    [DllImport("user32.dll")] static extern bool IsIconic(IntPtr hwnd);
    [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetClassName(IntPtr hwnd,StringBuilder text,int size);
    [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowText(IntPtr hwnd,StringBuilder text,int size);
    [DllImport("user32.dll",EntryPoint="GetWindowLongPtrW")] static extern IntPtr GetWindowLongPtr(IntPtr hwnd,int index);
    [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr hwnd,out RECT rect);
    [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hwnd,out RECT rect);
    [DllImport("user32.dll")] static extern bool ClientToScreen(IntPtr hwnd,ref POINT point);
    [DllImport("user32.dll")] static extern uint GetDpiForWindow(IntPtr hwnd);
    [DllImport("user32.dll")] static extern IntPtr GetWindowDpiAwarenessContext(IntPtr hwnd);
    [DllImport("user32.dll")] static extern int GetAwarenessFromDpiAwarenessContext(IntPtr context);
    [DllImport("user32.dll",SetLastError=true)] static extern bool AdjustWindowRectExForDpi(ref RECT rect,uint style,bool menu,uint exStyle,uint dpi);
    [DllImport("user32.dll")] static extern IntPtr MonitorFromWindow(IntPtr hwnd,uint flags);
    [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern bool GetMonitorInfo(IntPtr monitor,ref MONITORINFO info);
    [DllImport("user32.dll",SetLastError=true)] static extern IntPtr SendMessageTimeout(IntPtr hwnd,uint msg,IntPtr wParam,IntPtr lParam,uint flags,uint timeout,out IntPtr result);
    [DllImport("user32.dll",EntryPoint="SendMessageTimeoutW",SetLastError=true)] static extern IntPtr SendLimits(IntPtr hwnd,uint msg,IntPtr wParam,ref MINMAXINFO limits,uint flags,uint timeout,out IntPtr result);
    [DllImport("user32.dll",SetLastError=true)] static extern bool SetWindowPos(IntPtr hwnd,IntPtr after,int x,int y,int width,int height,uint flags);
    [DllImport("user32.dll",SetLastError=true)] static extern bool AttachThreadInput(uint current,uint target,bool attach);
    [DllImport("user32.dll",SetLastError=true)] static extern bool GetKeyboardState(byte[] state);
    [DllImport("user32.dll",SetLastError=true)] static extern bool SetKeyboardState(byte[] state);
    [DllImport("user32.dll")] static extern short GetKeyState(int key);
    [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId();
    [DllImport("user32.dll",SetLastError=true)] public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
    [DllImport("shell32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern IntPtr CommandLineToArgvW(string line,out int count);
    [DllImport("kernel32.dll")] static extern IntPtr LocalFree(IntPtr memory);
    static void Check(bool success,string operation) { if(!success)throw new Win32Exception(Marshal.GetLastWin32Error(),operation); }
    static void Own(IntPtr hwnd,int pid) { uint actual;GetWindowThreadProcessId(hwnd,out actual);if(!IsWindow(hwnd)||actual!=pid)throw new InvalidOperationException("HWND no longer belongs to the supplied process."); }
    public static string[] Arguments(string line) {
        int count;IntPtr memory=CommandLineToArgvW(line,out count);Check(memory!=IntPtr.Zero,"CommandLineToArgvW");
        try { var args=new string[count];for(int i=0;i<count;i++)args[i]=Marshal.PtrToStringUni(Marshal.ReadIntPtr(memory,i*IntPtr.Size));return args; }
        finally { LocalFree(memory); }
    }
    public static long[] Windows(int pid) {
        var found=new List<long>();
        EnumWindows(delegate(IntPtr hwnd,IntPtr data){uint actual;GetWindowThreadProcessId(hwnd,out actual);if(actual==pid&&IsWindowVisible(hwnd)){var name=new StringBuilder(256);GetClassName(hwnd,name,256);if(name.ToString().StartsWith("UnrealWindow",StringComparison.Ordinal))found.Add(hwnd.ToInt64());}return true;},IntPtr.Zero);
        return found.ToArray();
    }
    public static Snapshot Read(long handle,int pid) {
        IntPtr hwnd=new IntPtr(handle);Own(hwnd,pid);
        var s=new Snapshot();s.Handle=handle;uint actual;GetWindowThreadProcessId(hwnd,out actual);s.ProcessId=actual;
        var text=new StringBuilder(512);GetClassName(hwnd,text,512);s.ClassName=text.ToString();text.Clear();GetWindowText(hwnd,text,512);s.Title=text.ToString();
        s.Style=unchecked((uint)GetWindowLongPtr(hwnd,-16).ToInt64());s.ExtendedStyle=unchecked((uint)GetWindowLongPtr(hwnd,-20).ToInt64());s.Dpi=GetDpiForWindow(hwnd);
        IntPtr awareness=GetWindowDpiAwarenessContext(hwnd);Check(awareness!=IntPtr.Zero,"GetWindowDpiAwarenessContext");s.DpiAwarenessContext=awareness.ToInt64();s.DpiAwareness=GetAwarenessFromDpiAwarenessContext(awareness);
        RECT client,window;Check(GetClientRect(hwnd,out client),"GetClientRect");Check(GetWindowRect(hwnd,out window),"GetWindowRect");
        s.ClientWidth=client.Right-client.Left;s.ClientHeight=client.Bottom-client.Top;s.Left=window.Left;s.Top=window.Top;s.Width=window.Right-window.Left;s.Height=window.Bottom-window.Top;
        var clientOrigin=new POINT();Check(ClientToScreen(hwnd,ref clientOrigin),"ClientToScreen");s.ClientLeft=clientOrigin.X;s.ClientTop=clientOrigin.Y;
        s.ActualFrameWidth=s.Width-s.ClientWidth;s.ActualFrameHeight=s.Height-s.ClientHeight;
        RECT frame=new RECT();Check(AdjustWindowRectExForDpi(ref frame,s.Style,false,s.ExtendedStyle,s.Dpi),"AdjustWindowRectExForDpi");s.FrameWidth=frame.Right-frame.Left;s.FrameHeight=frame.Bottom-frame.Top;
        var monitor=new MONITORINFO();monitor.Size=Marshal.SizeOf(typeof(MONITORINFO));Check(GetMonitorInfo(MonitorFromWindow(hwnd,2),ref monitor),"GetMonitorInfo");
        s.WorkLeft=monitor.Work.Left;s.WorkTop=monitor.Work.Top;s.WorkWidth=monitor.Work.Right-monitor.Work.Left;s.WorkHeight=monitor.Work.Bottom-monitor.Work.Top;s.MonitorWidth=monitor.Monitor.Right-monitor.Monitor.Left;s.MonitorHeight=monitor.Monitor.Bottom-monitor.Monitor.Top;
        s.Visible=IsWindowVisible(hwnd);s.Maximized=IsZoomed(hwnd);s.Minimized=IsIconic(hwnd);
        s.Caption=(s.Style&0x00c00000)==0x00c00000;s.Resizable=(s.Style&0x00040000)!=0;s.SystemMenu=(s.Style&0x00080000)!=0;s.MinimizeButton=(s.Style&0x00020000)!=0;s.MaximizeButton=(s.Style&0x00010000)!=0;s.Popup=(s.Style&0x80000000)!=0;
        // A direct message has zero defaults, unlike a system sizing request.
        // This probes our explicit minimum override only. Actual maximize and
        // larger-resize tests below verify system behavior independently.
        IntPtr result;var limits=new MINMAXINFO();Check(SendLimits(hwnd,0x24,IntPtr.Zero,ref limits,3,3000,out result)!=IntPtr.Zero,"WM_GETMINMAXINFO timeout");s.Limits=limits;return s;
    }
    static void Message(IntPtr hwnd,uint msg,long key,long data) { IntPtr result;Check(SendMessageTimeout(hwnd,msg,new IntPtr(key),new IntPtr(data),3,3000,out result)!=IntPtr.Zero,"Owned HWND message timeout"); }
    public static void ResizeClient(long handle,int pid,int width,int height) { var s=Read(handle,pid);Check(SetWindowPos(new IntPtr(handle),IntPtr.Zero,0,0,width+s.FrameWidth,height+s.FrameHeight,0x0016),"SetWindowPos owned client resize"); }
    public static void SystemCommand(long handle,int pid,bool maximize) { IntPtr hwnd=new IntPtr(handle);Own(hwnd,pid);Message(hwnd,0x112,maximize?0xf030:0xf120,0); }
    public static void RestoreRect(long handle,int pid,int x,int y,int width,int height) { IntPtr hwnd=new IntPtr(handle);Own(hwnd,pid);Check(SetWindowPos(hwnd,IntPtr.Zero,x,y,width,height,0x0014),"Restore owned window rectangle"); }
    public static void F11(long handle,int pid) { IntPtr hwnd=new IntPtr(handle);Own(hwnd,pid);Message(hwnd,0x100,0x7a,0x00570001);Message(hwnd,0x101,0x7a,0xc0570001); }
    public static bool AltEnter(long handle,int pid) {
        IntPtr hwnd=new IntPtr(handle);Own(hwnd,pid);uint actual,target=GetWindowThreadProcessId(hwnd,out actual),current=GetCurrentThreadId();bool attached=false;byte[] original=new byte[256];bool captured=false;
        try {
            // Share key state only with this owned game's UI thread. No global
            // SendInput/keyboard event or foreground-window change is used.
            if(current!=target){Check(AttachThreadInput(current,target,true),"Attach owned game input queue");attached=true;}
            Check(GetKeyboardState(original),"Read attached keyboard state");captured=true;byte[] pressed=(byte[])original.Clone();pressed[0x12]|=0x80;pressed[0xa4]|=0x80;Check(SetKeyboardState(pressed),"Set attached Alt state");
            bool held=(GetKeyState(0x12)&0x8000)!=0;if(!held)throw new InvalidOperationException("Alt state was not established for the owned queue.");
            Message(hwnd,0x104,0x0d,0x201c0001);Message(hwnd,0x105,0x0d,0xe01c0001);return held;
        } finally {if(captured)SetKeyboardState(original);if(attached)AttachThreadInput(current,target,false);}
    }
}
'@
}

function Assert-OwnedProcess {
    $game=Get-Process -Id $ProcessId -ErrorAction Stop
    if ($game.StartTime.ToUniversalTime().Ticks -ne $ProcessStartedUtc.UtcDateTime.Ticks -or -not [string]::Equals($game.Path,$expectedExe,[StringComparison]::OrdinalIgnoreCase)) { throw 'PID, start time or executable differs from the explicitly supplied game process.' }
    $command=(Get-CimInstance Win32_Process -Filter ('ProcessId='+$ProcessId)).CommandLine
    $arguments=[WNTPhysicalWindowProbe]::Arguments($command)
    if ($arguments -notcontains '-WNTAutomation' -or $arguments -contains '-RenderOffscreen' -or $arguments -contains '-nullrhi') { throw 'A real GPU-rendered physical -WNTAutomation window is required; offscreen and null-RHI are rejected.' }
    $saveArgument=@($arguments | Where-Object { $_.StartsWith('-WNTSaveDir=',[StringComparison]::OrdinalIgnoreCase) })
    if ($saveArgument.Count -ne 1 -or -not [string]::Equals([IO.Path]::GetFullPath($saveArgument[0].Substring(12)).TrimEnd('\','/'),$save,[StringComparison]::OrdinalIgnoreCase)) { throw 'The process does not use the exact explicitly supplied disposable save profile.' }
    if ($arguments -notcontains ('-cefdebug='+$DebugPort)) { throw 'Debug port does not match the supplied game process.' }
    if ([IO.Path]::GetFileName($expectedExe) -eq 'UnrealEditor.exe') {
        if ($arguments -notcontains '-game' -or -not ($arguments | Where-Object { $_.EndsWith('WNT1922.uproject',[StringComparison]::OrdinalIgnoreCase) })) { throw 'The supplied editor executable is not running the standalone WNT1922 game.' }
    } elseif ([IO.Path]::GetFileName($expectedExe) -notmatch '^WNT1922(?:-Win64-(?:Development|Shipping))?\.exe$') { throw 'Only the standalone WNT1922 editor game or packaged WNT1922 executable may be tested.' }
    return $game
}
function Assert-OwnedDebugPort {
    [void](Assert-OwnedProcess)
    $listeners=@(Get-NetTCPConnection -State Listen -LocalPort $DebugPort -ErrorAction Stop)
    if ($listeners.Count -eq 0) { throw 'The supplied game debug port is not listening.' }
    foreach ($listener in $listeners) {
        $owner=[int]$listener.OwningProcess;$matched=$owner -eq $ProcessId
        for ($depth=0;$depth -lt 5 -and -not $matched;$depth++) {
            $child=Get-CimInstance Win32_Process -Filter ('ProcessId='+$owner)
            if (-not $child -or $child.CreationDate.ToUniversalTime() -lt $ProcessStartedUtc.UtcDateTime) { break }
            $owner=[int]$child.ParentProcessId;$matched=$owner -eq $ProcessId
        }
        if (-not $matched) { throw 'CEF endpoint belongs to a different process tree; refusing to attach.' }
    }
}
function Get-SaveFingerprint {
    $entries=@(Get-ChildItem -LiteralPath $save -Recurse -Force | Sort-Object FullName | ForEach-Object {
        if ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'A disposable profile contains a reparse point.' }
        if (-not $_.PSIsContainer) { [ordered]@{path=$_.FullName.Substring($save.Length);bytes=$_.Length;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash} }
    })
    return ConvertTo-Json -InputObject $entries -Depth 5 -Compress
}

$socket=$null;$sequence=0;$windowHandle=0L;$original=$null;$windowMutated=$false;$previousDpi=[IntPtr]::Zero
$report=[ordered]@{format=2;passed=$false;startedAt=[DateTime]::UtcNow.ToString('o');processId=$ProcessId;processStartedUtc=$ProcessStartedUtc.ToString('o');executable=$expectedExe;saveDirectory=$save;debugPort=$DebugPort;limitsProbe='WM_GETMINMAXINFO with zero-initialized input; explicit minimum override only, not system-provided tracking maxima';checks=@();samples=@();limitations=@('This verifies a real Win32 HWND at the current monitor DPI, not Unreal FNullWindow behavior.','Keyboard cases target the owned HWND message path; this does not certify every hardware keyboard or display configuration.','A fresh title screen is required; no campaign is created, advanced, saved or closed. The owned game remains running.')}
function Test-Requirement([bool]$Passed,[string]$Description) {
    $report.checks+=@{passed=$Passed;description=$Description}
    if (-not $Passed) { throw $Description }
}
function Invoke-Page([string]$Expression) {
    [void](Assert-OwnedProcess)
    $script:sequence++
    $json=@{id=$script:sequence;method='Runtime.evaluate';params=@{expression=$Expression;awaitPromise=$true;returnByValue=$true}} | ConvertTo-Json -Depth 8 -Compress
    $bytes=[Text.Encoding]::UTF8.GetBytes($json);$timeout=[Threading.CancellationTokenSource]::new(12000)
    try {
        [void]$socket.SendAsync([ArraySegment[byte]]::new($bytes),[Net.WebSockets.WebSocketMessageType]::Text,$true,$timeout.Token).GetAwaiter().GetResult()
        do {
            $stream=[IO.MemoryStream]::new();$buffer=[byte[]]::new(65536)
            try {
                do { $received=$socket.ReceiveAsync([ArraySegment[byte]]::new($buffer),$timeout.Token).GetAwaiter().GetResult();if ($received.MessageType -eq [Net.WebSockets.WebSocketMessageType]::Close) { throw 'Owned CEF endpoint closed.' };$stream.Write($buffer,0,$received.Count) } while (-not $received.EndOfMessage)
                $response=[Text.Encoding]::UTF8.GetString($stream.ToArray()) | ConvertFrom-Json
            } finally { $stream.Dispose() }
        } while ($response.id -ne $script:sequence)
        if ($response.error -or $response.result.exceptionDetails) { throw ('Owned CEF evaluation failed: '+($response | ConvertTo-Json -Depth 10 -Compress)) }
        return $response.result.result.value
    } finally { $timeout.Dispose() }
}
function Get-Diagnostics {
    Invoke-Page @'
(async()=>{
 const e=globalThis.__wntPhysicalWindowProbe;if(!e)throw Error('Window probe hook unavailable');
 const before=e.sequence;await ue.wnt.sceneinput(JSON.stringify({action:'diagnostics',instanceId:''}));
 const deadline=Date.now()+6000;while(Date.now()<deadline){const found=e.events.find(x=>x.sequence>before&&x.event.type==='diagnostics');if(found)return found.event;await new Promise(r=>setTimeout(r,50));}
 throw Error('Native gated diagnostics timed out');
})()
'@
}
function Get-Sample([string]$Label) {
    [void](Assert-OwnedProcess)
    $deadline=[DateTime]::UtcNow.AddSeconds(10)
    do {
        $native=[WNTPhysicalWindowProbe]::Read($windowHandle,$ProcessId)
        $diagnostics=Get-Diagnostics
        if ($diagnostics -is [array] -or $diagnostics.type -ne 'diagnostics') { throw 'Native diagnostics must be exactly one diagnostics object.' }
        if ($native.ClientWidth -eq $diagnostics.viewportWidth -and $native.ClientHeight -eq $diagnostics.viewportHeight) { break }
        Start-Sleep -Milliseconds 100
    } while ([DateTime]::UtcNow -lt $deadline)
    $sample=[ordered]@{label=$Label;at=[DateTime]::UtcNow.ToString('o');window=$native;diagnostics=$diagnostics}
    $report.samples+=,$sample
    Test-Requirement ($native.DpiAwareness -eq 2) ($Label+': the game HWND is per-monitor DPI aware')
    Test-Requirement (-not $diagnostics.renderingOffscreen -and $diagnostics.windowMode -eq 2 -and $diagnostics.configuredWindowMode -eq 2) ($Label+': actual and configured native window modes stay windowed')
    Test-Requirement ($native.Caption -and $native.Resizable -and $native.SystemMenu -and $native.MinimizeButton -and $native.MaximizeButton -and -not $native.Popup) ($Label+': decorated resize/minimize/maximize window styles remain enabled')
    Test-Requirement ($native.ClientWidth -ge 1800 -and $native.ClientHeight -ge 1000) ($Label+': physical client area preserves 1800x1000 minimum')
    Test-Requirement ($native.ClientWidth -eq $diagnostics.viewportWidth -and $native.ClientHeight -eq $diagnostics.viewportHeight) ($Label+': actual HWND client pixels match the Unreal viewport')
    if (-not $native.Maximized -and -not $native.Minimized) {
        Test-Requirement ($native.ActualFrameWidth -eq $native.FrameWidth -and $native.ActualFrameHeight -eq $native.FrameHeight) ($Label+': actual restored frame dimensions match the frame calculated for this DPI')
    }
    return $sample
}
function Test-OnScreenWhenFits($Native,[string]$Label) {
    if ($Native.Width -le $Native.WorkWidth -and $Native.Height -le $Native.WorkHeight) {
        Test-Requirement ($Native.Left -ge $Native.WorkLeft -and $Native.Top -ge $Native.WorkTop -and $Native.Left+$Native.Width -le $Native.WorkLeft+$Native.WorkWidth -and $Native.Top+$Native.Height -le $Native.WorkTop+$Native.WorkHeight) ($Label+': restored window and title bar are inside the work area when the entire window fits')
    }
}
function Wait-Window([scriptblock]$Accept,[string]$Label) {
    $deadline=[DateTime]::UtcNow.AddSeconds(12)
    do { [void](Assert-OwnedProcess);$current=[WNTPhysicalWindowProbe]::Read($windowHandle,$ProcessId);if (& $Accept $current) { Start-Sleep -Milliseconds 200;return };Start-Sleep -Milliseconds 100 } while ([DateTime]::UtcNow -lt $deadline)
    throw ('Timed out waiting for owned physical window: '+$Label)
}

try {
    [void](Assert-OwnedProcess);Assert-OwnedDebugPort
    New-Item -ItemType Directory -Path $output -Force | Out-Null
    $previousDpi=[WNTPhysicalWindowProbe]::SetThreadDpiAwarenessContext([IntPtr]::new(-4))
    if ($previousDpi -eq [IntPtr]::Zero) { throw 'Cannot establish physical-pixel DPI awareness for this verifier thread.' }
    $handles=@([WNTPhysicalWindowProbe]::Windows($ProcessId))
    Test-Requirement ($handles.Count -eq 1) 'Exactly one visible Unreal game HWND belongs to the supplied PID'
    $windowHandle=[long]$handles[0];$original=[WNTPhysicalWindowProbe]::Read($windowHandle,$ProcessId)
    Test-Requirement (-not $original.Minimized -and -not $original.Maximized) 'The explicitly supplied test starts in a restored physical window'
    $pages=@(Invoke-RestMethod -Uri ('http://127.0.0.1:'+$DebugPort+'/json/list') -TimeoutSec 5 | Where-Object { $_.type -eq 'page' -and $_.url -match '^http://127\.0\.0\.1:\d+/.*[?&]unreal=1(?:&|$)' })
    Test-Requirement ($pages.Count -eq 1) 'The owned CEF endpoint exposes exactly one WNT1922 Unreal page'
    $webSocket=[Uri]$pages[0].webSocketDebuggerUrl
    if ($webSocket.Scheme -ne 'ws' -or $webSocket.Host -notin @('127.0.0.1','localhost') -or $webSocket.Port -ne $DebugPort) { throw 'Unexpected non-local CEF debugger URL.' }
    $socket=[Net.WebSockets.ClientWebSocket]::new();$connect=[Threading.CancellationTokenSource]::new(10000)
    try { [void]$socket.ConnectAsync($webSocket,$connect.Token).GetAwaiter().GetResult() } finally { $connect.Dispose() }
    $titleState=Invoke-Page @'
(()=>{
 if(!document.querySelector('.start-screen')||document.querySelector('.native-world-input'))throw Error('Only a fresh title screen may be tested');
 if(!globalThis.WNTUnreal?.receive||!globalThis.ue?.wnt?.sceneinput)throw Error('Native bridge is unavailable');
 if(!globalThis.__wntPhysicalWindowProbe){const e=globalThis.__wntPhysicalWindowProbe={sequence:0,events:[]},old=WNTUnreal.receive;e.original=old;
 WNTUnreal.receive=function(event){e.events.push({sequence:++e.sequence,event:structuredClone(event)});if(e.events.length>100)e.events.shift();return Reflect.apply(old,this,[event]);};}
 return {title:true,url:location.href};
})()
'@
    $beforeSave=Get-SaveFingerprint
    $beforeApi=Invoke-Page "(async()=>{const r=await fetch('/api/save');return {status:r.status,body:await r.text()};})()"
    Test-Requirement ($beforeApi.status -eq 404) 'Disposable title-screen profile has no saved campaign'
    $startup=Get-Sample 'startup'
    Test-Requirement ($startup.window.ClientWidth -eq 1800 -and $startup.window.ClientHeight -eq 1000) 'Startup client size is exactly 1800x1000 physical pixels'
    Test-OnScreenWhenFits $startup.window 'startup'
    $limits=$startup.window.Limits
    Test-Requirement ($limits.MinTrackSize.X -eq 1800+$startup.window.ActualFrameWidth -and $limits.MinTrackSize.Y -eq 1000+$startup.window.ActualFrameHeight) 'Synthetic WM_GETMINMAXINFO probe adds the measured native frame to the exact client minimum'
    Test-Requirement ($limits.MaxTrackSize.X -ge $limits.MinTrackSize.X -and $limits.MaxTrackSize.Y -ge $limits.MinTrackSize.Y -and $limits.MaxSize.X -ge $limits.MinTrackSize.X -and $limits.MaxSize.Y -ge $limits.MinTrackSize.Y) 'Synthetic zero-default limit probe preserves minimum-consistent fallback maxima'

    [void](Assert-OwnedProcess);$windowMutated=$true;[WNTPhysicalWindowProbe]::ResizeClient($windowHandle,$ProcessId,1280,720)
    Wait-Window {param($s) $s.ClientWidth -eq 1800 -and $s.ClientHeight -eq 1000} 'undersized physical resize recovers minimum'
    [void](Get-Sample 'undersized-SetWindowPos')
    [void](Assert-OwnedProcess);[WNTPhysicalWindowProbe]::ResizeClient($windowHandle,$ProcessId,1900,1100)
    Wait-Window {param($s) -not $s.Maximized -and $s.ClientWidth -eq 1900 -and $s.ClientHeight -eq 1100} 'larger physical resize is not clamped to the minimum'
    $larger=Get-Sample 'larger-SetWindowPos'
    Test-Requirement ($larger.window.ClientWidth -eq 1900 -and $larger.window.ClientHeight -eq 1100) 'A real larger resize produces exactly 1900x1100 client pixels'
    [void](Assert-OwnedProcess);[WNTPhysicalWindowProbe]::ResizeClient($windowHandle,$ProcessId,1800,1000)
    Wait-Window {param($s) $s.ClientWidth -eq 1800 -and $s.ClientHeight -eq 1000} 'restore minimum before maximize'
    [void](Assert-OwnedProcess);[WNTPhysicalWindowProbe]::SystemCommand($windowHandle,$ProcessId,$true)
    Wait-Window {param($s) $s.Maximized -and $s.ClientWidth -ge 1800 -and $s.ClientHeight -ge 1000} 'physical maximize preserves minimum'
    $maximized=Get-Sample 'maximize'
    Test-Requirement ($maximized.window.Maximized -and $maximized.diagnostics.windowMaximized) 'Win32 and Slate both report a maximized decorated window'
    $report.monitorTooSmall=$startup.window.WorkWidth -lt $limits.MinTrackSize.X -or $startup.window.WorkHeight -lt $limits.MinTrackSize.Y
    if ($report.monitorTooSmall) { Test-Requirement ($maximized.window.Width -ge $limits.MinTrackSize.X -and $maximized.window.Height -ge $limits.MinTrackSize.Y) 'On this undersized work area, maximize preserves the minimum even when the frame extends beyond the desktop' }
    else {
        $m=$maximized.window
        Test-Requirement ($m.ClientLeft -eq $m.WorkLeft -and $m.ClientWidth -eq $m.WorkWidth -and $m.ClientTop -ge $m.WorkTop -and $m.ClientTop -le $m.WorkTop+$m.FrameHeight -and $m.ClientTop+$m.ClientHeight -eq $m.WorkTop+$m.WorkHeight) 'A real maximize fills the available work area below its title bar'
    }
    [void](Assert-OwnedProcess);[WNTPhysicalWindowProbe]::SystemCommand($windowHandle,$ProcessId,$false)
    Wait-Window {param($s) -not $s.Maximized -and $s.ClientWidth -eq 1800 -and $s.ClientHeight -eq 1000} 'restore original client size'
    $restored=Get-Sample 'restore'
    Test-OnScreenWhenFits $restored.window 'restore'
    foreach ($key in @('F11','AltEnter')) {
        [void](Assert-OwnedProcess)
        if ($key -eq 'F11') { [WNTPhysicalWindowProbe]::F11($windowHandle,$ProcessId) }
        else { Test-Requirement ([WNTPhysicalWindowProbe]::AltEnter($windowHandle,$ProcessId)) 'Alt+Enter was delivered with Alt down in the owned game input queue' }
        Start-Sleep -Milliseconds 500
        $keySample=Get-Sample $key
        Test-Requirement (-not $keySample.window.Maximized -and $keySample.window.ClientWidth -eq 1800 -and $keySample.window.ClientHeight -eq 1000) ($key+': fullscreen shortcut leaves the restored physical window unchanged')
    }
    $afterApi=Invoke-Page "(async()=>{const r=await fetch('/api/save');return {status:r.status,body:await r.text(),title:!!document.querySelector('.start-screen'),campaign:!!document.querySelector('.native-world-input')};})()"
    Test-Requirement ($afterApi.title -and -not $afterApi.campaign -and $afterApi.status -eq $beforeApi.status -and $afterApi.body -ceq $beforeApi.body) 'Window and shortcut tests leave the title screen and campaign-save API unchanged'
    Test-Requirement ((Get-SaveFingerprint) -ceq $beforeSave) 'Disposable campaign profile files remain byte-for-byte unchanged'
    $report.passed=$true
} catch {
    $report.failure=$_.Exception.Message
} finally {
    if ($socket -and $socket.State -eq [Net.WebSockets.WebSocketState]::Open) {
        try { [void](Invoke-Page "(()=>{const e=globalThis.__wntPhysicalWindowProbe;if(e){WNTUnreal.receive=e.original;delete globalThis.__wntPhysicalWindowProbe;}return true;})()") } catch { $report.hookCleanupError=$_.Exception.Message }
    }
    if ($windowMutated -and $original -and $windowHandle) {
        try {
            [void](Assert-OwnedProcess)
            [WNTPhysicalWindowProbe]::SystemCommand($windowHandle,$ProcessId,$false)
            [WNTPhysicalWindowProbe]::RestoreRect($windowHandle,$ProcessId,$original.Left,$original.Top,$original.Width,$original.Height)
            Wait-Window {param($s) -not $s.Maximized -and $s.Left -eq $original.Left -and $s.Top -eq $original.Top -and $s.Width -eq $original.Width -and $s.Height -eq $original.Height} 'original physical rectangle after cleanup'
            $report.originalWindowRectangleRestored=$true
        } catch { $report.restoreError=$_.Exception.Message;$report.passed=$false }
    }
    if ($socket) { $socket.Dispose() }
    if ($previousDpi -ne [IntPtr]::Zero) { [void][WNTPhysicalWindowProbe]::SetThreadDpiAwarenessContext($previousDpi) }
    $report.finishedAt=[DateTime]::UtcNow.ToString('o')
    if (Test-Path -LiteralPath $output -PathType Container) { $report | ConvertTo-Json -Depth 14 | Set-Content -LiteralPath (Join-Path $output 'window-policy.json') -Encoding UTF8 }
}
$report
if (-not $report.passed) { throw ('Physical Windows window verification failed: '+$report.failure) }
