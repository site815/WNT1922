; A self-contained launcher, without installation, registry entries or elevation.
; NSIS owns and removes its unique $PLUGINSDIR after the game exits.
Unicode true
RequestExecutionLevel user
ManifestDPIAware true
SetCompressor /FINAL zlib
CRCCheck force
Name "WNT1922 Portable"
Caption "Starting WNT1922 ${GAME_VERSION}"
OutFile "${PORTABLE_OUTPUT}"
VIProductVersion "${GAME_VERSION}.0"
VIAddVersionKey "ProductName" "WNT1922 Portable"
VIAddVersionKey "FileDescription" "WNT1922 self-contained portable game"
VIAddVersionKey "FileVersion" "${GAME_VERSION}"
VIAddVersionKey "LegalCopyright" "WNT1922 contributors; NSIS launcher (C) 1999-2026 Contributors"
BrandingText "WNT1922 portable - no installation required"
InstallButtonText "Start"
ShowInstDetails nevershow
AutoCloseWindow true
InstProgressFlags smooth
Page instfiles
!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"
!include "WinVer.nsh"

Function .onInit
  ${IfNot} ${RunningX64}
    MessageBox MB_OK|MB_ICONSTOP "WNT1922 requires 64-bit Windows 10 or newer."
    SetErrorLevel 1
    Quit
  ${EndIf}
  ${IfNot} ${AtLeastWin10}
    MessageBox MB_OK|MB_ICONSTOP "WNT1922 requires Windows 10 or newer."
    SetErrorLevel 1
    Quit
  ${EndIf}
FunctionEnd

Section
  InitPluginsDir
  SetOutPath "$PLUGINSDIR"
  File /oname=NSIS-LICENSE.txt "${NSIS_LICENSE}"
  SetOutPath "$PLUGINSDIR\WNT1922"
  SetDetailsPrint textonly
  DetailPrint "Preparing the bundled game. This may take a moment..."
  SetDetailsPrint none
  File /r "${PACKAGE_DIRECTORY}\*"
  SetDetailsPrint textonly
  DetailPrint "Starting WNT1922..."
  HideWindow
  ${GetParameters} $0
  ClearErrors
  ExecWait '"$OUTDIR\WNT1922.exe" $0' $1
  ${If} ${Errors}
    MessageBox MB_OK|MB_ICONSTOP "WNT1922 could not start. Check that your temporary folder has enough free space, then try again."
    SetErrorLevel 1
  ${Else}
    SetErrorLevel $1
  ${EndIf}
  ; Release our working directory before NSIS removes the temporary payload.
  SetOutPath "$TEMP"
SectionEnd
