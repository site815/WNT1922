let framesPerSecond = null;

export function nativeFPSLabel() {
  return framesPerSecond == null ? '— FPS' : Math.round(framesPerSecond) + ' FPS';
}

export function receiveNativePerformance(event, document = globalThis.document) {
  if (!Number.isFinite(event?.fps) || event.fps <= 0 || event.fps > 10000) return false;
  framesPerSecond = event.fps;
  const label = nativeFPSLabel();
  for (const node of document?.querySelectorAll('[data-native-fps]') || []) {
    if (node.textContent !== label) node.textContent = label;
  }
  return true;
}
