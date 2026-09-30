[CmdletBinding()]
param([switch]$Package)
$ErrorActionPreference='Stop'
& (Join-Path $PSScriptRoot 'Build-Unreal.ps1') -Package:$Package
