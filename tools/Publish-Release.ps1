param([switch]$DraftOnly)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$publishRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $publishRoot
$metadata = Get-Content -Raw -LiteralPath '.build/releases/latest.json' | ConvertFrom-Json
$packageVersion = (Get-Content -Raw -LiteralPath 'package.json' | ConvertFrom-Json).version
if ($metadata.version -ne $packageVersion) { throw 'Build the current version first.' }
$currentFingerprint = (& node tools/source-fingerprint.mjs).Trim()
if ($LASTEXITCODE -ne 0 -or $metadata.sourceSha256 -ne $currentFingerprint) { throw 'The sources changed since the portable was built. Rebuild and retest before publication.' }
$executable = Join-Path $publishRoot ('.build/releases/' + $metadata.localFile)
$digest = (Get-FileHash -LiteralPath $executable -Algorithm SHA256).Hash.ToLowerInvariant()
if ($digest -ne $metadata.sha256 -or (Get-Item -LiteralPath $executable).Length -ne $metadata.bytes) { throw 'The executable does not match its build metadata.' }
$status = @(git status --porcelain)
if ($LASTEXITCODE -ne 0 -or $status.Count) { throw 'Commit and manually push the tested source first.' }
$commit = (git rev-parse HEAD).Trim()
$remoteHead = git -c credential.interactive=never ls-remote origin refs/heads/main
if ($LASTEXITCODE -ne 0 -or -not $remoteHead -or $remoteHead.Split()[0] -ne $commit) { throw 'Manually push the current commit to origin/main before publishing.' }
$remote = (git remote get-url origin).Trim()
if ($remote -ne 'https://github.com/site815/WNT1922.git') { throw 'Unexpected release repository.' }

# Use the existing Git credential helper in memory. Never write or print credentials.
$credentialLines = "protocol=https`nhost=github.com`n`n" | git -c credential.interactive=never credential fill
if ($LASTEXITCODE -ne 0) { throw 'Sign in to GitHub through the Git credential manager first.' }
$credentialEntry = $credentialLines | Where-Object { $_.StartsWith('password=') } | Select-Object -First 1
if (-not $credentialEntry) { throw 'No GitHub credential is available.' }
$headers = @{ Authorization = 'Bearer ' + $credentialEntry.Substring(9); Accept = 'application/vnd.github+json'; 'User-Agent' = 'WNT1922-Release'; 'X-GitHub-Api-Version' = '2026-03-10' }
$api = 'https://api.github.com/repos/site815/WNT1922/releases'
$release = $null
try { $release = Invoke-RestMethod -Uri ($api + '/tags/' + $metadata.tag) -Headers $headers }
catch { if ([int]$_.Exception.Response.StatusCode -ne 404) { throw } }
if (-not $release) {
    $body = @{
        tag_name = $metadata.tag
        target_commitish = $commit
        name = 'WNT1922 ' + $metadata.version + ' portable beta'
        body = [IO.File]::ReadAllText((Join-Path $publishRoot 'RELEASES.md'))
        draft = $true
        prerelease = $false
    } | ConvertTo-Json
    $release = Invoke-RestMethod -Method Post -Uri $api -Headers $headers -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body))
}
$uploadUrl = $release.upload_url -replace '\{.*$', ''
if (-not $uploadUrl.StartsWith('https://uploads.github.com/repos/site815/WNT1922/releases/')) { throw 'Unexpected release upload destination.' }
$assets = @(
    @{ Path = $executable; Name = $metadata.downloadName; Type = 'application/octet-stream' },
    @{ Path = (Join-Path $publishRoot ('.build/releases/' + $metadata.downloadName + '.sha256')); Name = $metadata.downloadName + '.sha256'; Type = 'text/plain' }
)
foreach ($asset in $assets) {
    $expectedDigest = 'sha256:' + (Get-FileHash -LiteralPath $asset.Path -Algorithm SHA256).Hash.ToLowerInvariant()
    $expectedSize = (Get-Item -LiteralPath $asset.Path).Length
    $present = $release.assets | Where-Object { $_.name -eq $asset.Name } | Select-Object -First 1
    if (-not $present) {
        Write-Output ('Uploading ' + $asset.Name + ' (' + $expectedSize + ' bytes)')
        $uri = $uploadUrl + '?name=' + [Uri]::EscapeDataString($asset.Name)
        $present = Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -ContentType $asset.Type -InFile $asset.Path -TimeoutSec 900
    }
    if ($present.state -ne 'uploaded' -or $present.size -ne $expectedSize -or $present.digest -ne $expectedDigest) { throw ('Release asset verification failed: ' + $asset.Name + '. No existing asset was overwritten. Inspect the draft before retrying.') }
    Write-Output ('Verified ' + $asset.Name + ': ' + $expectedDigest)
}
if ($release.draft) {
    $releaseFields = @{
        body = [IO.File]::ReadAllText((Join-Path $publishRoot 'RELEASES.md'))
        target_commitish = $commit
        draft = [bool]$DraftOnly
    }
    if (-not $DraftOnly) { $releaseFields.make_latest = 'true' }
    $body = $releaseFields | ConvertTo-Json
    $release = Invoke-RestMethod -Method Patch -Uri ($api + '/' + $release.id) -Headers $headers -ContentType 'application/json' -Body $body
}
if ($DraftOnly) {
    Write-Output ('Release assets verified; publication deferred: ' + $release.html_url)
    exit
}
$latest = Invoke-RestMethod -Uri ($api + '/latest') -Headers $headers
if ($latest.id -ne $release.id) { throw 'The release is published, but it is not marked latest. Check the release settings.' }
Write-Output ('Published and verified: ' + $release.html_url)
