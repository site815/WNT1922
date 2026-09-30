[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$BuildReport,
    [Parameter(Mandatory=$true)][string]$PackageTestReport,
    [Parameter(Mandatory=$true)][string]$ReleaseNotes,
    [string]$NodePath,
    [switch]$DraftOnly
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$publishRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $publishRoot
$build = Get-Content -Raw -LiteralPath $BuildReport | ConvertFrom-Json
$verification = Get-Content -Raw -LiteralPath $PackageTestReport | ConvertFrom-Json
$packageVersion = (Get-Content -Raw -LiteralPath 'package.json' | ConvertFrom-Json).version
if ($build.format -ne 2 -or -not $build.packaged -or -not $build.nativeTestsPassed -or $build.version -ne $packageVersion) { throw 'A successful current native package build report is required.' }
if ($build.configuration -ne 'Shipping') { throw 'Player releases must use Shipping to omit Unreal development profiling listeners.' }
if (-not $NodePath) { $nodeCommand=Get-Command node.exe -ErrorAction SilentlyContinue; if ($nodeCommand) { $NodePath=$nodeCommand.Source } }
if (-not $NodePath) { $NodePath=Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
$currentFingerprint = (& $NodePath tools/native-source-fingerprint.mjs).Trim()
if ($LASTEXITCODE -ne 0 -or $build.sourceSha256 -ne $currentFingerprint) { throw 'Native sources changed since this archive was built. Rebuild and retest before publication.' }
$executable = (Resolve-Path -LiteralPath $build.archive).Path
$downloadName='WNT1922-v'+$packageVersion+'-Unreal-Windows.zip'
if ([IO.Path]::GetFileName($executable) -ne $downloadName) { throw 'Native archive filename must retain its exact version.' }
$archiveBytes=(Get-Item -LiteralPath $executable).Length
# GitHub requires each release asset to be strictly smaller than 2 GiB.
# Reject before creating a draft or uploading; use the actual file size.
if ($archiveBytes -ge 2GB) { throw ('Native archive is '+$archiveBytes+' bytes. GitHub release assets must be smaller than 2 GiB (2147483648 bytes). Repackage and repeat extracted-package verification before publication.') }
$digest = (Get-FileHash -LiteralPath $executable -Algorithm SHA256).Hash.ToLowerInvariant()
if ($digest -ne $build.archiveSha256 -or $archiveBytes -ne $build.archiveBytes) { throw 'The native archive does not match its build metadata.' }
if ($verification.kind -ne 'extracted-native-package' -or $verification.version -ne $packageVersion -or $verification.archiveSha256 -ne $digest -or $verification.passed -ne $true -or $verification.visualVerified -ne $true) { throw 'Successful extracted-package testing and explicit native visual review of this exact archive are required. Editor runtime checks are insufficient.' }
foreach ($check in @('launch','campaignStart','shipSelection','battleWatch','saveReload','offlineAssets','loopbackOnly')) {
    if ($check -notin $verification.checksPassed) { throw ('Missing packaged-game verification: '+$check) }
}
$networkReport=Get-Content -Raw -LiteralPath $verification.networkReport | ConvertFrom-Json
if (-not $networkReport.passed -or $networkReport.processId -ne $verification.processId -or $networkReport.executable -ne $verification.executablePath -or @($networkReport.violations).Count) { throw 'The extracted game and its child processes must pass network verification.' }
$normalNetwork=Get-Content -Raw -LiteralPath $verification.normalNetworkReport | ConvertFrom-Json
if (-not $normalNetwork.passed -or $normalNetwork.automation -ne $false -or $normalNetwork.executable -ne $verification.executablePath -or $normalNetwork.seconds -lt 15 -or [DateTimeOffset]$normalNetwork.processStartedUtc -lt [DateTimeOffset]$build.finished -or @($normalNetwork.violations).Count) { throw 'The same extracted executable also needs a fresh network check during normal play with browser debugging disabled.' }
$runtimeReport=Get-Content -Raw -LiteralPath $verification.nativeRuntimeReport | ConvertFrom-Json
if ($runtimeReport.passed -ne $true -or [DateTimeOffset]$runtimeReport.finishedAt -lt [DateTimeOffset]$build.finished) { throw 'A fresh successful runtime report from the extracted package is required.' }
$extracted=(Resolve-Path -LiteralPath $verification.extractedDirectory).Path.TrimEnd('\','/')
if ($extracted -eq ([IO.Path]::GetFullPath($build.packageDirectory)).TrimEnd('\','/')) { throw 'Test a fresh archive extraction, not the staging directory.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive=[IO.Compression.ZipFile]::OpenRead($executable)
try {
    # Windows PowerShell's .NET Framework ZIP writer can retain backslashes.
    # Match the same single root manifest after normalizing entry separators.
    $entries=@($archive.Entries | Where-Object { $_.FullName.Replace('\','/') -match '^[^/]+/package-manifest\.json$' })
    if ($entries.Count -ne 1) { throw 'The archive must contain one package manifest.' }
    $reader=[IO.StreamReader]::new($entries[0].Open())
    try { $manifestText=$reader.ReadToEnd() } finally { $reader.Dispose() }
} finally { $archive.Dispose() }
if ([IO.File]::ReadAllText((Join-Path $extracted 'package-manifest.json')) -ne $manifestText) { throw 'The tested extraction has a different package manifest.' }
$manifest=$manifestText | ConvertFrom-Json
if ($manifest.gameVersion -ne $packageVersion) { throw 'Package manifest version mismatch.' }
$testedExecutable=[IO.Path]::GetFullPath($verification.executablePath)
if (-not $testedExecutable.StartsWith($extracted+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'The tested executable must be inside the fresh extraction.' }
$testedRelative=$testedExecutable.Substring($extracted.Length+1).Replace('\','/')
if ($testedRelative -notmatch '^WNT1922/Binaries/Win64/WNT1922(?:-Win64-(?:Development|Shipping))?\.exe$') { throw 'Verification must identify the actual packaged game binary, not the editor or bootstrap launcher.' }
$testedEntries=@($manifest.files | Where-Object { $_.path -eq $testedRelative })
if ($testedEntries.Count -ne 1 -or $verification.executableSha256 -ne $testedEntries[0].sha256) { throw 'The tested executable hash does not match the package manifest.' }
$execution=$runtimeReport.packageExecution
if (-not $execution -or $execution.executablePath -ne $testedExecutable -or $execution.executableSha256 -ne $verification.executableSha256 -or $execution.archiveSha256 -ne $digest -or $execution.processId -ne $verification.processId -or $execution.processStartedUtc -ne $verification.processStartedUtc) { throw 'Runtime evidence must identify the same native package executable, archive and launched process.' }
if ($verification.usesPackagedDefaults -ne $true -or $verification.processCommandLine -match '-WNTDataRoot=|-WNTNode=' -or $verification.processCommandLine.IndexOf($testedExecutable,[StringComparison]::OrdinalIgnoreCase) -lt 0) { throw 'The package must be tested using its own data and bundled Node defaults.' }
if ([DateTimeOffset]$verification.processStartedUtc -lt [DateTimeOffset]$build.finished -or [DateTimeOffset]$verification.processStartedUtc -gt [DateTimeOffset]$runtimeReport.startedAt) { throw 'The tested process timestamps do not enclose the package runtime check.' }
foreach ($file in $manifest.files) {
    $candidate=[IO.Path]::GetFullPath((Join-Path $extracted $file.path))
    if (-not $candidate.StartsWith($extracted+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid path in native package manifest.' }
    $info=Get-Item -LiteralPath $candidate
    if ($info.Length -ne $file.bytes -or (Get-FileHash -LiteralPath $candidate -Algorithm SHA256).Hash.ToLowerInvariant() -ne $file.sha256) { throw ('The tested package differs from the archive: '+$file.path) }
}
$checksum=$executable+'.sha256'
if ((Get-Content -Raw -LiteralPath $checksum).Trim() -ne ($digest+'  '+$downloadName)) { throw 'Archive checksum file is invalid.' }
$notes=[IO.File]::ReadAllText((Resolve-Path -LiteralPath $ReleaseNotes).Path)
if (-not $notes.Trim()) { throw 'Provide native preview release notes, including its unfinished asset coverage.' }
$metadata=[pscustomobject]@{version=$packageVersion;tag=('v'+$packageVersion);downloadName=$downloadName}
$status = @(git status --porcelain)
if ($LASTEXITCODE -ne 0 -or $status.Count) { throw 'Commit and manually push the tested source first.' }
$commit = (git rev-parse HEAD).Trim()
$remoteHead = git -c credential.interactive=never ls-remote origin refs/heads/main
if ($LASTEXITCODE -ne 0 -or -not $remoteHead -or $remoteHead.Split()[0] -ne $commit) { throw 'Manually push the current commit to origin/main before publishing.' }
$remote = (git remote get-url origin).Trim()
if ($remote.TrimEnd('/') -notmatch '^https://github\.com/site815/wnt1922(?:\.git)?$') { throw 'Unexpected release repository.' }
$tagRefs=@(git -c credential.interactive=never ls-remote origin ('refs/tags/'+$metadata.tag) ('refs/tags/'+$metadata.tag+'^{}'))
if ($LASTEXITCODE -ne 0) { throw 'Cannot verify the native release tag.' }
if ($tagRefs.Count) {
    $peeled=$tagRefs | Where-Object { $_.EndsWith('^{}') } | Select-Object -First 1
    $tagCommit=if($peeled){$peeled.Split()[0]}else{$tagRefs[0].Split()[0]}
    if ($tagCommit -ne $commit) { throw 'The version tag already points to different source. Choose a new version; an existing release tag will not be overwritten.' }
}

# Use the existing Git credential helper in memory. Never write or print credentials.
$credentialLines = "protocol=https`nhost=github.com`n`n" | git -c credential.interactive=never credential fill
if ($LASTEXITCODE -ne 0) { throw 'Sign in to GitHub through the Git credential manager first.' }
$credentialEntry = $credentialLines | Where-Object { $_.StartsWith('password=') } | Select-Object -First 1
if (-not $credentialEntry) { throw 'No GitHub credential is available.' }
$headers = @{ Authorization = 'Bearer ' + $credentialEntry.Substring(9); Accept = 'application/vnd.github+json'; 'User-Agent' = 'WNT1922-Release'; 'X-GitHub-Api-Version' = '2026-03-10' }
$api = 'https://api.github.com/repos/site815/WNT1922/releases'
$release = $null
$releaseRecord = Join-Path $publishRoot '.build/releases/github-release.json'
New-Item -ItemType Directory -Path (Split-Path -Parent $releaseRecord) -Force | Out-Null
if (Test-Path -LiteralPath $releaseRecord) {
    $record = Get-Content -Raw -LiteralPath $releaseRecord | ConvertFrom-Json
    if ($record.repository -eq 'site815/WNT1922' -and $record.tag -eq $metadata.tag -and $record.id -gt 0) {
        try { $release = Invoke-RestMethod -Uri ($api + '/' + $record.id) -Headers $headers }
        catch { if ([int]$_.Exception.Response.StatusCode -ne 404) { throw } }
        if ($release -and $release.tag_name -ne $metadata.tag) { throw 'The recorded Release ID now has a different version tag.' }
    }
}
if (-not $release) {
    try { $release = Invoke-RestMethod -Uri ($api + '/tags/' + $metadata.tag) -Headers $headers }
    catch { if ([int]$_.Exception.Response.StatusCode -ne 404) { throw } }
}
# GitHub's REST collection/tag views can omit drafts or filtered releases. Resolve IDs through GraphQL.
if (-not $release) {
    $matchingDrafts = @()
    $cursor = $null
    do {
        $query = @{ query = 'query($cursor:String) { repository(owner:"site815",name:"WNT1922") { releases(first:100,after:$cursor,orderBy:{field:CREATED_AT,direction:DESC}) { nodes { databaseId tagName } pageInfo { hasNextPage endCursor } } } }'; variables = @{cursor=$cursor} } | ConvertTo-Json -Depth 5
        $graph = Invoke-RestMethod -Method Post -Uri 'https://api.github.com/graphql' -Headers $headers -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($query))
        if ($graph.errors) { throw ('Cannot inspect existing Releases: ' + ($graph.errors.message -join '; ')) }
        $releasePage = $graph.data.repository.releases
        if (-not $releasePage) { throw 'Cannot read the repository Release index.' }
        foreach ($item in $releasePage.nodes) {
            if ($item.tagName -eq $metadata.tag) { $matchingDrafts += $item }
        }
        $cursor = $releasePage.pageInfo.endCursor
    } while ($releasePage.pageInfo.hasNextPage)
    if ($matchingDrafts.Count -gt 1) { throw 'Multiple drafts have this version tag. Inspect and remove the redundant draft before retrying.' }
    if ($matchingDrafts.Count -eq 1) { $release = Invoke-RestMethod -Uri ($api + '/' + $matchingDrafts[0].databaseId) -Headers $headers }
}
if (-not $release) {
    $body = @{
        tag_name = $metadata.tag
        target_commitish = $commit
        name = 'WNT1922 ' + $metadata.version + ' Unreal preview (' + $build.configuration + ')'
        body = $notes
        draft = $true
        prerelease = $true
    } | ConvertTo-Json
    $release = Invoke-RestMethod -Method Post -Uri $api -Headers $headers -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body))
}
@{repository='site815/WNT1922';tag=$metadata.tag;id=$release.id} | ConvertTo-Json | Set-Content -LiteralPath $releaseRecord -Encoding ascii
Write-Output ('Using Release ID ' + $release.id + ' for ' + $metadata.tag)
$uploadUrl = $release.upload_url -replace '\{.*$', ''
if (-not $uploadUrl.StartsWith('https://uploads.github.com/repos/site815/WNT1922/releases/', [StringComparison]::OrdinalIgnoreCase)) { throw 'Unexpected release upload destination.' }
$assets = @(
    @{ Path = $executable; Name = $metadata.downloadName; Type = 'application/zip' },
    @{ Path = $checksum; Name = $metadata.downloadName + '.sha256'; Type = 'text/plain' }
)
foreach ($asset in $assets) {
    $expectedDigest = 'sha256:' + (Get-FileHash -LiteralPath $asset.Path -Algorithm SHA256).Hash.ToLowerInvariant()
    $expectedSize = (Get-Item -LiteralPath $asset.Path).Length
    $present = $release.assets | Where-Object { $_.name -eq $asset.Name } | Select-Object -First 1
    if (-not $present) {
        Write-Output ('Uploading ' + $asset.Name + ' (' + $expectedSize + ' bytes)')
        $uri = $uploadUrl + '?name=' + [Uri]::EscapeDataString($asset.Name)
        $present = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -ContentType $asset.Type -InFile $asset.Path -TimeoutSec 3600
    }
    if ($present.state -ne 'uploaded' -or $present.size -ne $expectedSize -or $present.digest -ne $expectedDigest) { throw ('Release asset verification failed: ' + $asset.Name + '. No existing asset was overwritten. Inspect the draft before retrying.') }
    Write-Output ('Verified ' + $asset.Name + ': ' + $expectedDigest)
}
if ($release.draft) {
    $releaseFields = @{
        tag_name = $metadata.tag
        name = 'WNT1922 ' + $metadata.version + ' Unreal preview (' + $build.configuration + ')'
        body = $notes
        target_commitish = $commit
        draft = [bool]$DraftOnly
        prerelease = $true
        make_latest = 'false'
    }
    $body = $releaseFields | ConvertTo-Json
    $release = Invoke-RestMethod -Method Patch -Uri ($api + '/' + $release.id) -Headers $headers -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body))
}
if ($DraftOnly) {
    Write-Output ('Release assets verified; publication deferred: ' + $release.html_url)
    exit
}
$published=Invoke-RestMethod -Uri ($api+'/'+$release.id) -Headers $headers
if ($published.draft -or -not $published.prerelease -or $published.tag_name -ne $metadata.tag) { throw 'The native preview was not published with the expected prerelease status.' }
Write-Output ('Published and verified native prerelease: ' + $published.html_url)
