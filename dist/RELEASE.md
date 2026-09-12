# Portable releases

- [Latest portable build folder and release assets](https://github.com/site815/WNT1922/releases/latest)
- [Latest portable executable](https://github.com/site815/WNT1922/releases/latest/download/WNT1922-portable-win-x64.exe)
- [Latest SHA-256 checksum](https://github.com/site815/WNT1922/releases/latest/download/WNT1922-portable-win-x64.exe.sha256)

The executable is self-contained for Windows 10/11 x64. Download the single EXE and double-click it. No installer, browser, Node.js or internet connection is required to play. Saves remain in `%APPDATA%\WNT1922\saves`.

## Version 0.26.1

- Yards, sailors, aviators and aircraft show `total(+reserve)`. Negative personnel reserves indicate a staffing deficit. Yard values are tons per year.
- Catalog ships and aircraft become usable automatically on 1 January of their listed year. No separate unlock project or fee is required. Construction and production still consume resources; player-designed drafts retain their registration fee.
- Future plans retain their countdown, and obsolete ship lines remain closed. These rules apply equally to the player and AI.

Start a new campaign for this version. The beta executable is unsigned.

This tracked `dist` folder contains release information and checksums. Executable assets are stored in GitHub Releases, following GitHub Support's guidance and the ordinary Git file-size limit. [Build metadata](latest.json) records the version, size and checksum of the latest local build.
