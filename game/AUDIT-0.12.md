# v0.12 — horizontal command desk and smooth map movement

This release includes the complete [v0.11 update](AUDIT-0.11.md) and the subsequent interface requests.

## Command Map

The world chart occupies the upper panel; a horizontal command desk sits below. The fleet list uses two rows with columns sized to the window. Selecting a force opens its overview, mission controls and optional ship manifest across the desk. Ports, capitals, territories, convoys, contacts and land fronts use the same lower panel. The chart keeps its single bottom legend and no header controls. Individual ship and full class inspections retain their detailed overlays.

| Target | Hover | Click |
| --- | --- | --- |
| Fleet command card | Training, morale, supply, condition, endurance, speed and engagement policy | Center the map and show orders below |
| Friendly fleet marker | Fleet composition | Show orders below |
| Enemy contact | Observed strength, confidence, source, report time and search radius | Last reported position and intelligence details |
| Convoy | Hulls, speed and next arrival | Convoy information below |
| Port | Supply, trade, condition and coast defenses | Port information below |
| Capital | Government and relationship state | Government information below |
| Territory or land front | Territory/front identity | Administration or campaign details below |
| Individual ship | Class specifications | Current ship state |
| Class name | Class specifications | Complete class reference |
| Diplomatic action | Cost, effect, restrictions and cooldown | Review or send the action |

Custom map tooltips replace duplicate native SVG tooltips on those markers. Click areas are transparent and larger than the visible icons; national outlines and labels remain visible at every zoom. Port statistics and explanatory notes use separate columns to reduce unnecessary scrolling. Long manifests and detailed reports keep their required scroll containers. Temporary order receipts are compact, ignore pointer events and sit above the lower command desk, so they cannot block its buttons.

## Movement rendering

The previous general interface refresh was about once per second, with worker snapshots arriving approximately every 350 ms. Friendly fleet and convoy markers now use a lightweight animation loop targeting **60 fps**, bounded by the screen refresh rate. Only marker transforms and the selected route update in that loop; political geography and the whole interface are not rebuilt each frame.

Animation interpolates between received simulation minutes, follows known sailing routes and stops at the latest received state if the worker falls behind. It does not invent future combat or extrapolate hidden enemy positions. Enemy markers stay at their last observation until a new report arrives. New orders immediately replace the plotted route. Pause displays the latest actual position and stops the animation loop. Hidden tabs and other menus do not keep animating the map. The animation clock never modifies game state or saves.

The simulation still processes every crossed game minute in its separate worker. Requested game speed and display frame rate remain independent. Very fast simulation can advance below its requested ceiling on busy hardware while the map remains responsive.

## Production, records and alerts

Fighter, strike and scout production selectors now sit above Aircraft models, with equal widths and the current funded factory capacity. Factory funding and expansion remain in Facilities; the production strip links directly there. The four facility cards retain equal dimensions and stable expansion buttons.

Future ships and aircraft show an **Under development** calendar countdown and availability date in a fixed action slot. Procurement costs and inactive purchase/development buttons are hidden until the date arrives. The countdown describes catalog availability; it does not spend funds or silently complete the ministry's later qualification project. The date gate is still enforced by the simulation. Obsolete and superseded hull lines remain hidden, while future lines can be inspected for planning. Research continues to show its next funding date and shared level instructions.

The oversized 1950 banner has been removed from Naval record. A single compact line gives the next archived review; no empty reviews panel appears before the first review. Personal naval and merchant-loss totals share one compact row. Completed reviews remain available when they exist.

Contact alerts are limited to governments **currently at war** with the player. Peacetime intelligence remains visible on the chart. Making peace removes the contact alert, including an open one, without erasing the observation. Clearing optional alerts dismisses currently eligible wartime contact notices rather than silently dismissing peacetime intelligence. Existing 48-hour staleness and seven-day map expiration remain.

All diplomatic action and cooldown slots have the same **42-pixel height**, including visit, cooperation, insult and provocation. Costs and restrictions stay on hover. No balance formulas or opening inventories changed in this interface release. Save format remains 6.

## Next improvements to consider

Alert filters for battles, diplomacy and wartime intelligence could help during busy wars, while mandatory demands always remain visible. A pinned-fleet row would help recurring command work. For the technology tree, naval medicine and survivor recovery remains the strongest distinct addition; communications should wait until command delays are modeled.

[Validation](VALIDATION-0.12.md) · [Complete technology tree](../docs/tech-tree.md) · [Support and ceasefire mechanics](AUDIT-0.11.md).
