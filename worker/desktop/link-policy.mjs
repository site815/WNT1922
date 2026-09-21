// Reference links are opened by the OS browser; untrusted URL text must never
// throw out of Electron's synchronous window-open callback.
export function referenceDestination(value, origin) {
  try {
    const url = new URL(value);
    if (url.username || url.password || !['https:', 'http:'].includes(url.protocol)) return 'deny';
    if (url.origin === origin)
      return url.pathname === '/assets/licenses/third-party-notices.html' ? 'credits' : 'deny';
    return 'external';
  } catch {
    return 'deny';
  }
}

export async function openReference(value, { open, report }) {
  try {
    await open(value);
    return true;
  } catch (error) {
    // A missing/default-blocked browser is recoverable, including a failed
    // warning dialog during shutdown. Neither should crash the running game.
    try { await report(error instanceof Error ? error.message : String(error)); } catch {}
    return false;
  }
}
