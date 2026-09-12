import { app, BrowserWindow, Menu, dialog, shell } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createGameServer } from "./server.mjs";
import { GAME_VERSION } from "../../mechanics/version.mjs";

app.setName("WNT1922");
const testMode = process.argv.includes("--test-mode");
if (testMode && process.env.WNT_TEST_USER_DATA)
  app.setPath("userData", path.resolve(process.env.WNT_TEST_USER_DATA));
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
let window,
  server,
  closing = false,
  allowClose = false;
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (window) {
      if (window.isMinimized()) window.restore();
      window.show();
      window.focus();
    }
  });
  void start().catch((error) => {
    console.error(error);
    dialog.showErrorBox("WNT1922 could not start", error.message);
    app.exit(1);
  });
}
// Let the ESM entry module finish: Electron emits ready after module loading.
async function start() {
  await app.whenReady();
  Menu.setApplicationMenu(null);
  const saveDir = path.join(app.getPath("userData"), "saves");
  server = await createGameServer({ port: 0, saveDir, publicDirectory: root });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const origin = "http://127.0.0.1:" + server.address().port;
  window = new BrowserWindow({
    title: "WNT1922 · " + GAME_VERSION,
    width: 1600,
    height: 1000,
    minWidth: 1100,
    minHeight: 650,
    show: false,
    backgroundColor: "#111b21",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      backgroundThrottling: false,
    },
  });
  window.webContents.session.setPermissionRequestHandler(
    (_contents, _permission, callback) => callback(false),
  );
  window.webContents.on("will-attach-webview", (event) =>
    event.preventDefault(),
  );
  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(origin + "/")) event.preventDefault();
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    const parsed = new URL(url);
    if (
      parsed.origin === origin &&
      parsed.pathname === "/assets/licenses/third-party-notices.html"
    )
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
          },
        },
      };
    if (
      ["https:", "http:"].includes(parsed.protocol) &&
      parsed.origin !== origin
    )
      void shell.openExternal(url);
    return { action: "deny" };
  });
  window.on("close", (event) => {
    if (allowClose) return;
    event.preventDefault();
    if (closing) return;
    closing = true;
    void (async () => {
      try {
        await window.webContents.executeJavaScript(
          "globalThis.saveForDesktopClose?.()",
        );
        allowClose = true;
        window.close();
      } catch (error) {
        const choice = await dialog.showMessageBox(window, {
          type: "warning",
          title: "Campaign save incomplete",
          message: "The game could not finish saving before closing.",
          detail: error.message,
          buttons: ["Keep game open", "Close without another save"],
          defaultId: 0,
          cancelId: 0,
        });
        closing = false;
        if (choice.response === 1) {
          allowClose = true;
          window.close();
        }
      }
    })();
  });
  await window.loadURL(origin + "/?desktop=1");
  if (!testMode) {
    window.maximize();
    window.show();
  }
  app.on("window-all-closed", () => app.quit());
  app.on("will-quit", () => server?.close());
  await fs.mkdir(app.getPath("userData"), { recursive: true });
  await fs.writeFile(
    path.join(app.getPath("userData"), "last-launch.json"),
    JSON.stringify(
      {
        version: GAME_VERSION,
        runtime: process.versions.electron,
        saveDirectory: saveDir,
      },
      null,
      2,
    ),
  );
}
