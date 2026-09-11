# v0.10 — map and command interface

The map fills the central workspace. All map selections open information or orders in the right panel; map selection never opens a modal. Friendly fleet composition is available on hover. The bottom legend contains symbols, seven national colors and the CShapes credit link in one row. The credit link opens attribution and chart controls in the same right panel. Pan and zoom retain wraparound and 64× magnification; keyboard +/− zoom and Home reset replace the removed header buttons.

Command no longer has Intelligence, Land campaigns or Admiralty submenus. Capitals, territories and fronts are inspectable on the map. Per-fleet missions remain authoritative for the player, including fleets that previously inherited a national directive. War announcements point to those missions rather than offering a global directive. Suggested design fits use the most common assigned mission among ships of the selected type; the old hidden global setting no longer affects them. AI governments keep their internal strategic priorities.

Contact alerts are derived from actual reports, with one stable identifier per contact. Strength remains an estimate; coordinates remain the last observation. Updated sightings refresh an alert without creating a history entry on every simulation tick. Alerts disappear when their report becomes stale, after 48 hours, while fading map positions remain until seven days. An open contact alert expires too. Dismissal survives ordinary tracking and saving; a sighting after a stale gap can alert again. Clear-all retains mandatory demands. Battle reports remain immutable while being read.

The left menu uses 15-pixel text, with 13-pixel submenus and consistent heading, body and secondary-text sizes. The full ship register is grouped into main fleet followed by legacy/reserve, with active legacy ships still explicitly marked active. Research and battle report lists also scroll normally. The command list remains paged to leave its column within the viewport; the selected fleet's manifest expands only when requested. The four production panels retain equal dimensions and equal aircraft selector widths.

Consistency fixes:

- Focused fields no longer freeze the live clock, map and alert updates. DOM reconciliation preserves active inputs and native dropdown state.
- Navigation identity includes its destination, so opening a submenu cannot reuse the focused button as a different menu item.
- Time and audio controls remain accessible while reading battle reports; expanded calculations and scroll position survive simulation updates.
- Missing ceasefire cooldowns use no date restriction instead of Unix day zero, fixing an erroneous 1970 date for wars before 1970.
- Large resource numbers use k, m and bn to fit their columns, with exact totals in hover descriptions. Logistics, training and morale consistently show percent units.
- Build copying and the local HTTP server share one browser-source manifest, avoiding missing modules when interface files are added.
- Removed obsolete map/modal handlers and duplicate submenu scaffolding; updated both readmes and current validation references.

Save format stays at 6; existing v0.9 campaigns can continue. This release changes presentation and player mission authority; it does not alter ship specifications, aircraft catalogs or the existing balance coefficients.

Proposed next improvements, not implemented:

1. Pin frequently used forces at the top of the command list.
2. Add alert filters for contacts, battles and diplomacy, while always retaining mandatory demands.
3. Give unnamed production hulls unique pennant numbers across their national register, so identical classes in different fleets are easier to recognize.
