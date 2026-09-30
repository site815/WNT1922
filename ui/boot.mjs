// The browser supplies the native HUD only; all world rendering belongs to Unreal.
if (new URLSearchParams(location.search).get('unreal') === '1') {
  await import('./app.mjs');
} else {
  document.querySelector('#app').innerHTML = '<main class="native-launch-required"><h1>Open WNT1922 in Unreal Engine</h1><p>The map, ships and battles run in the native Unreal game.</p><p>For local testing, open <strong>WNT1922</strong> on your Desktop and double-click <code>Test-Unreal.cmd</code>. The test profile keeps its campaign saves separate.</p><p>After changing C++ code, run <code>Test-Unreal.cmd -BuildFirst</code>.</p></main>';
}
