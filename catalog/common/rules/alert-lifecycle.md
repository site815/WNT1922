# alert lifecycle — data and balance

War announcements and events requiring a choice open mandatory dispatches and pause play when Autopause is enabled. Other information, including political developments, commissioning, research, campaign reviews and battle reports, passes once through a clickable news ticker. Hover or keyboard focus holds the message. Clicking opens the relevant report, ship, map location or ministry panel and marks the message read. Reading is saved by the simulation worker. An ongoing battle or assault notice and its later resolution are separate read receipts. Battle reports remain in the campaign record.

Return to ministry acknowledges a war announcement. For a choice, it defers the decision without spending resources or applying an option immediately. The pending choice stays accessible beside the ticker, showing its deadline and default outcome. The default is applied after 14 game days unless the event supplies an explicit deadline. Deferring or answering every open dispatch resumes play only if a dispatch interrupted a running game; an already paused game stays paused. Reopening a pending decision pauses again when Autopause is enabled. The deadline is never extended by opening or dismissing the popup. Popup envelopes are centered within the workspace below the resource and news bars, with no blur and consistent footer positions.

The time limit below bounds optional result notices still awaiting display; mandatory dispatches are not discarded.

```json game-data
{
  "RESULT_ALERT_MINUTES": 2880,
  "DECISION_DEFAULT_DAYS": 14
}
```

Autopause starts enabled. With it unchecked, simulation mode never pauses for a game event or loss of window focus. Incoming choices and war dispatches remain available in the pending strip without opening a blocking popup. Choices retain their deadlines and defaults. Reopening a dispatch does not pause in simulation mode. Turning Autopause off dismisses open dispatches to the pending strip and resumes an event-paused game, preserving a manual pause. Invalid simulation state still invokes the checkpoint error safeguard.
