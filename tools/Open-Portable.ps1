[CmdletBinding()]
param([switch]$BuildFirst)
$ErrorActionPreference='Stop'
& (Join-Path $PSScriptRoot 'Test-Unreal.ps1') -BuildFirst:$BuildFirst
