[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][ValidateRange(1,2147483647)][int]$ProcessId,
    [Parameter(Mandatory=$true)][DateTimeOffset]$ProcessStartedUtc,
    [Parameter(Mandatory=$true)][string]$ExecutablePath,
    [Parameter(Mandatory=$true)][string]$OutputFile,
    [ValidateRange(2,120)][int]$Seconds=15,
    [switch]$AllowAutomation
)
$ErrorActionPreference='Stop'
# Read-only OS endpoint inspection. No firewall rules, network probes, packet
# transmission, process termination or changes to the user's security settings.
$expected=[IO.Path]::GetFullPath($ExecutablePath)
$root=Get-Process -Id $ProcessId -ErrorAction Stop
if ($root.Path -ne $expected -or $root.StartTime.ToUniversalTime() -ne $ProcessStartedUtc.UtcDateTime) { throw 'The supplied native process identity does not match.' }
$owned=@{}; $observed=@{}; $violations=@{}; $samples=0
$deadline=[DateTime]::UtcNow.AddSeconds($Seconds)
function Is-Loopback([string]$Address) {
    $ip=$null
    if (-not [Net.IPAddress]::TryParse($Address,[ref]$ip)) { return $false }
    if ($ip.IsIPv4MappedToIPv6) { $ip=$ip.MapToIPv4() }
    return [Net.IPAddress]::IsLoopback($ip)
}
function Get-CreationTicks($Process) { return $Process.CreationDate.ToUniversalTime().Ticks }
function Get-OwnedFamily($CurrentRoot,[array]$Processes,[hashtable]$Known) {
    $family=@{}; $byId=@{}
    foreach ($item in $Processes) { $byId[[string]$item.ProcessId]=$item }
    $family[[string]$CurrentRoot.ProcessId]=$CurrentRoot
    # Retain observed orphans, but never a reused PID or an older child whose
    # recorded parent PID now belongs to a different process instance.
    foreach ($record in $Known.Values) {
        $item=$byId[[string]$record.id]
        if ($item -and (Get-CreationTicks $item) -eq $record.creationTicks) { $family[[string]$item.ProcessId]=$item }
    }
    do {
        $added=$false
        foreach ($item in $Processes) {
            $parent=$family[[string]$item.ParentProcessId]
            if (-not $family.ContainsKey([string]$item.ProcessId) -and $parent -and (Get-CreationTicks $item) -ge (Get-CreationTicks $parent)) {
                $family[[string]$item.ProcessId]=$item; $added=$true
            }
        }
    } while ($added)
    return @($family.Values)
}
function Is-CampaignSidecar($Member,[int]$RootId) {
    if ($Member.ParentProcessId -ne $RootId -or $Member.Name -ne 'node.exe') { return $false }
    # Our native host starts node with exactly the campaign script as its first
    # argument. A different node child must not inherit the listener exemption.
    return $Member.CommandLine -match '^\s*(?:"[^"]*node\.exe"|\S*node\.exe)\s+(?:"[^"]*[\\/]worker[\\/]unreal-server\.mjs"|\S*[\\/]worker[\\/]unreal-server\.mjs)(?:\s|$)'
}
$startedAt=[DateTime]::UtcNow; $firstSample=$null; $lastSample=$null; $campaignObserved=$false; $failure=$null
try {
do {
    $root.Refresh()
    if ($root.HasExited) { throw 'The native game exited during network verification.' }
    $processes=@(Get-CimInstance Win32_Process)
    $current=$processes | Where-Object { $_.ProcessId -eq $ProcessId }
    if (-not $current -or $current.ExecutablePath -ne $expected -or [Math]::Abs(($current.CreationDate.ToUniversalTime()-$ProcessStartedUtc.UtcDateTime).TotalMilliseconds) -ge 1) { throw 'The native process changed during verification.' }
    if (-not $AllowAutomation -and $current.CommandLine -match '-WNTAutomation|-cefdebug=') { throw 'Normal-launch verification cannot use the automation/debug flags.' }
    $family=@(Get-OwnedFamily $current $processes $owned)
    $ids=@($family.ProcessId)
    $active=@{}
    foreach ($member in $family) {
        $ticks=Get-CreationTicks $member
        $record=[ordered]@{id=$member.ProcessId;parentId=$member.ParentProcessId;name=$member.Name;executable=$member.ExecutablePath;creationTicks=$ticks;startedUtc=$member.CreationDate.ToUniversalTime().ToString('o');campaignSidecar=(Is-CampaignSidecar $member $ProcessId)}
        $owned[([string]$member.ProcessId)+':'+$ticks]=$record
        $active[[string]$member.ProcessId]=$record
    }
    $tcp=@(Get-NetTCPConnection -ErrorAction Stop | Where-Object { $_.OwningProcess -in $ids })
    $udp=@(Get-NetUDPEndpoint -ErrorAction Stop | Where-Object { $_.OwningProcess -in $ids })
    # Recheck identities after collecting sockets; never attribute a socket to
    # a stale PID. A race is inconclusive and requires another observation.
    $after=@{}
    foreach ($item in @(Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -in $ids })) { $after[[string]$item.ProcessId]=$item }
    foreach ($connection in @($tcp)+@($udp)) {
        $before=$active[[string]$connection.OwningProcess]; $now=$after[[string]$connection.OwningProcess]
        if (-not $now -or (Get-CreationTicks $now) -ne $before.creationTicks) { throw 'A socket owner exited or changed during sampling; repeat this inconclusive observation.' }
    }
    foreach ($connection in $tcp) {
        # Windows reports socket reservations as Bound/100. They are neither
        # listening sockets nor a connection to a remote computer.
        $listenerOwner=$active[[string]$connection.OwningProcess]
        $entry=[ordered]@{protocol='TCP';processId=$connection.OwningProcess;processStartedUtc=$listenerOwner.startedUtc;state=[string]$connection.State;stateValue=[int]$connection.State;localAddress=$connection.LocalAddress;localPort=$connection.LocalPort;remoteAddress=$connection.RemoteAddress;remotePort=$connection.RemotePort}
        $key=$entry | ConvertTo-Json -Compress
        $observed[$key]=$entry
        if ([int]$connection.State -eq 100) { continue }
        $debugPort=0
        if ($AllowAutomation -and $current.CommandLine -match '(?i)(?:^|\s)-cefdebug=(\d+)(?:\s|$)') { $debugPort=[int]$Matches[1] }
        $allowedDebug=$AllowAutomation -and $debugPort -ge 1024 -and $debugPort -le 65535 -and $connection.LocalPort -eq $debugPort -and ($listenerOwner.id -eq $ProcessId -or $listenerOwner.name -eq 'UnrealCEFSubProcess.exe')
        if ([int]$connection.State -eq 2 -and (Is-Loopback $connection.LocalAddress) -and $listenerOwner.campaignSidecar) { $campaignObserved=$true }
        if (([int]$connection.State -eq 2 -and (-not (Is-Loopback $connection.LocalAddress) -or (-not $listenerOwner.campaignSidecar -and -not $allowedDebug))) -or ($connection.RemotePort -ne 0 -and -not (Is-Loopback $connection.RemoteAddress))) { $violations[$key]=$entry }
    }
    foreach ($connection in $udp) {
        $entry=[ordered]@{protocol='UDP';processId=$connection.OwningProcess;processStartedUtc=$active[[string]$connection.OwningProcess].startedUtc;localAddress=$connection.LocalAddress;localPort=$connection.LocalPort}
        $key=$entry | ConvertTo-Json -Compress
        $observed[$key]=$entry
        # Local campaign HTTP and opt-in CEF debugging need no UDP at all.
        $violations[$key]=$entry
    }
    $sampledAt=[DateTime]::UtcNow
    if (-not $firstSample) { $firstSample=$sampledAt.ToString('o') }
    $lastSample=$sampledAt.ToString('o')
    $samples++
    Start-Sleep -Milliseconds 250
} while ([DateTime]::UtcNow -lt $deadline)
if (-not $campaignObserved) { throw 'The expected campaign sidecar loopback listener was never observed; the game may not have reached startup.' }
} catch { $failure=$_.Exception.Message }
$report=[ordered]@{format=2;kind='native-process-family-network-observation';passed=$null -eq $failure -and $samples -gt 0 -and $campaignObserved -and $violations.Count -eq 0;processId=$ProcessId;processStartedUtc=$ProcessStartedUtc.ToString('o');executable=$expected;automation=[bool]$AllowAutomation;seconds=$Seconds;elapsedSeconds=([DateTime]::UtcNow-$startedAt).TotalSeconds;samples=$samples;firstSampleAt=$firstSample;lastSampleAt=$lastSample;campaignListenerObserved=$campaignObserved;processCount=$owned.Count;endpointCount=$observed.Count;violationCount=$violations.Count;processes=@($owned.Values);endpoints=@($observed.Values);violations=@($violations.Values);failure=$failure;finishedAt=[DateTime]::UtcNow.ToString('o');limitation='Sampled Windows TCP/UDP endpoints for exact observed game and descendant identities. A descendant created and reparented between samples, or a connection shorter than a sample interval, can be missed; this is not a packet capture or a guarantee about other software.'}
$destination=[IO.Path]::GetFullPath($OutputFile)
[void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($destination))
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $destination -Encoding UTF8
if (-not $report.passed) { throw ('Offline game network verification failed. See '+$destination) }
Write-Host ('Offline network check passed ('+$samples+' samples; '+$owned.Count+' process identities; '+$observed.Count+' endpoints): '+$destination)
