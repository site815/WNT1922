# Editing the game catalogs

Every data document contains exactly one fenced `json game-data` block. The game reads that block directly at startup. Edit it, rebuild the portable EXE, and start a new campaign to test opening-state changes. No export or synchronization step exists.

Use `name`, `description`, `notes`, `body`, `detail` and the other existing text fields for text shown in the game. Prose outside the data block is editing guidance. JSON does not allow comments or trailing commas. Run `node tools/check.mjs` after an edit.

## Where to edit

| Change | Source |
| --- | --- |
| Shared national identities and colors | [common/nations.md](common/nations.md) |
| Initial budgets, industry, yards, staffing, funding, levels, GDP, GTP and strategic resource modifiers | `1922/nations/COUNTRY.md` or `1936hindsight/nations/COUNTRY.md` |
| Opening fleets and ship-name pools | The same national opening document |
| Ship specifications and blurbs | [common/ships.md](common/ships.md), [1922/ships.md](1922/ships.md), [1936hindsight/ships.md](1936hindsight/ships.md) |
| Naval aircraft | The selected campaign's `aircraft/COUNTRY.md` |
| Army, maritime and strategic aircraft | [common/government-aircraft.md](common/government-aircraft.md) |
| Weapons and fittings | [common/equipment.md](common/equipment.md) |
| Program prices and durations | [common/rules/balance.md](common/rules/balance.md) |
| All nine research-level explanations | [common/rules/research-tree.md](common/rules/research-tree.md) |
| Economic growth and historical series | `common/rules/economy.md` and `common/rules/historical-gdp-data.md` |
| Monthly shipping demand and automatic round-trip routes | `common/rules/merchant-routes.md` |
| Naval battle stages, durations and repeated main engagements | `common/rules/battle-stages.md` |
| Ports, lanes, capitals and island campaigns | `common/rules/world.md`, `port-catalog.md`, `land-war.md`; national documents specify opening ports; `task-forces.md` supplies theater allocation and fallback basing |
| Diplomatic exchanges and treaty costs | `common/rules/diplomacy-rules.md` and `treaty-policy.md` |
| 1922 carrier conversions, replacement dispositions and early carrier preferences | [1922/rules.md](1922/rules.md) |
| AI national fleet preferences | `common/rules/ai-planning.md`, with scenario overrides in each nation's opening document |
| Formal campaign review years | [common/rules/engine.md](common/rules/engine.md) |
| Ministry events and decisions | [common/events.md](common/events.md) and each campaign's `events.md` |
| Historical political events | [common/rules/war-politics.md](common/rules/war-politics.md) |
| Map names and territorial ownership | Each campaign's `map.md`; geometry is in `assets/maps/geometry.json` |
| Design features and limits | `common/rules/designer.md` and `aircraft-designer.md` |
| Music, national peace/war playlists, attribution and audio hashes | [common/music.md](common/music.md) |

The [manifest](manifest.md) lists campaign inputs. Shared ships have one definition. Campaign-specific ships must not duplicate shared IDs. References use stable ship, aircraft, nation and port IDs; changing an ID requires changing references to it.

Ship `tons` are standard displacement; merchant GRT is registered volume, not displacement. Displayed ranges are kilometers. Some navigation calculations use nautical miles internally and convert at their boundaries. GDP and GTP are annual ministry bases in kilograms of fine-gold equivalent. Both have authored opening values and grow monthly. GTP changes only through monthly logistics growth: merchant losses reduce shipping capacity and eventual delivery performance, without directly subtracting GTP.

Rules in `common/rules/` contain static tables and balance values. Calculations and state transitions live in the corresponding `mechanics/*.mjs` file. National differences must be authored here, rather than implemented as different rules for the human player.
