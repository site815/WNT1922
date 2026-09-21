# Interface module

All screen rendering, controls, map motion, hover details, sound/music playback, browser-side save transport and styles live here. `index.html` is the entry page; `app.mjs` coordinates screens; `styles.css` is the single stylesheet.

The UI sends serializable commands through `simulation-client.mjs`. It displays worker snapshots and read-only mechanics queries. It must not alter resources, inventories or simulation time itself. There is no arbitrary state-edit callback across the worker boundary.

Map animation uses animation frames between simulation snapshots. Pausing or scrolling the interface does not move simulation work onto the UI thread.

The shell keeps one world chart mounted behind the ministry tiles. Command, land and strategic-air pages leave the chart interactive around their right-hand panel; other pages cover it with a scrolling content tile and remove background map controls from keyboard navigation. Top bars and navigation retain their own input surfaces, while only empty chart space passes pointer events through. Dialog bounds follow the clear workspace below the top bars.

`news-ticker.mjs` displays each routine bulletin once and `news-navigation.mjs` resolves its stable report, ship, contact or panel reference. Choices and war announcements use `diplomacy-popup.mjs`; deferral, resumption and deadline effects remain in the mechanics worker. Popup positioning follows the workspace bounds so navigation and resources remain visible.

`diplomatic-offers-view.mjs` shows incoming resource exchanges in Diplomacy and keeps a pending-offer alert beside the ticker. Offers use explicit Yes/No controls, expire after fourteen simulated days with no exchange, and never open a popup or pause on arrival. Both countries' quoted resource changes and current acceptance blockers are visible; the worker owns all settlement and expiry.

For reuse, copy this folder as the presentation layer and adapt the catalog, read-model and command interfaces. Game-specific naval screen layouts are intentionally retained; this is not a separate UI framework or package build.
