# Portable releases

[Latest release](https://github.com/site815/WNT1922/releases/latest) · [Release index](https://github.com/site815/WNT1922/releases)

Open the latest release and download **WNT1922-portable-win-x64.exe** from Assets. This is the only game distribution: one self-contained executable for Windows 10/11 x64, with the browser engine, catalogs, maps and music included. No installation or internet connection is required to play. Its SHA-256 checksum is provided alongside it. Saves remain in `%APPDATA%\WNT1922\saves`. The beta executable is unsigned.

## Version 0.27.0

- 33 licensed music tracks, with distinct national selections and separate peace/war playlists. Changes fade smoothly; paused music remains at one-third volume.
- Separate workers for authoritative simulation and read-only display summaries, alongside the UI thread. Geographic lookup optimization reduces repeated navigation work without skipping ticks.
- Warships apply blockade pressure according to crew, damage and strategic readiness. Support hulls no longer supply combat power through their tonnage alone.
- Aircraft modernization at anchorages without shore storage retains the existing air wing and safely handles the arriving replacement flight.
- Soundtrack records, air-war tuning, opening theater allocation, national mission preferences and historical territorial changes are read directly from editable catalog documents. Duplicate music metadata, credits lists and unused port specifications have been removed. Validation checks that all 84 data documents are actually loaded.
- Portable output and build metadata stay in ignored `.build/releases/`. No `dist` folder is tracked or maintained. Source pushes and Release publication remain manual.

Use a new campaign for beta testing. Report the version, campaign, nation and a save with any issue. Large gameplay changes remain proposals until approved.

## Verification

- 245 regression checks pass; all 14 opening states validate. Moving the remaining opening deployment rules into catalogs preserved all 14 states exactly.
- The portable includes 33 playable audio files, approximately 117 minutes in total, with track-by-track attribution.
- A visible portable-window check on the development computer sustained 60 FPS map movement while scrolling at the 100,000× simulation setting. The largest observed UI frame gap was about 33 ms. This is a measured opening-campaign result, not a minimum hardware guarantee.
- A 30-day headless opening-campaign benchmark improved from 19.6 to 8.8 seconds. A separate seven-day wartime route-cache comparison improved from 6.64 to 5.94 seconds and produced an identical final saved state. Fifteen-minute ticks are preserved; overloaded machines run more slowly.

## Balance proposals from the audit

These are proposals, not changes to the selected economic rules:

- Add a small civilian shipping reconstruction mechanism after severe merchant losses. Percentage growth alone cannot rebuild a merchant fleet once it reaches zero hulls.
- Scale national morale and campaign credit by the significance of an engagement. A small air or convoy action currently uses the same fixed morale change as a major fleet battle.
- Define how occupation and national defeat affect productive GDP and continued naval resistance. Port occupation already affects shipping access; national economic growth currently follows the chosen growth and bombing rules even after extensive land losses.
