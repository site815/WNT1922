# Interface module

All screen rendering, controls, map motion, hover details, sound/music playback, browser-side save transport and styles live here. `index.html` is the entry page; `app.mjs` coordinates screens; `styles.css` is the single stylesheet.

The UI sends serializable commands through `simulation-client.mjs`. It displays worker snapshots and read-only mechanics queries. It must not alter resources, inventories or simulation time itself. There is no arbitrary state-edit callback across the worker boundary.

Map animation uses animation frames between simulation snapshots. Pausing or scrolling the interface does not move simulation work onto the UI thread.

`news-ticker.mjs` displays each routine bulletin once and `news-navigation.mjs` resolves its stable report, ship, contact or panel reference. Choices and war announcements use `diplomacy-popup.mjs`; deferral, resumption and deadline effects remain in the mechanics worker. Popup positioning follows the workspace bounds so navigation and resources remain visible.

For reuse, copy this folder as the presentation layer and adapt the catalog, read-model and command interfaces. Game-specific naval screen layouts are intentionally retained; this is not a separate UI framework or package build.
