import { GAME_VERSION, SAVE_VERSION } from "../../mechanics/version.mjs";
import { CATALOG } from "../catalog-loader.mjs";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateSave } from "../../mechanics/state-io.mjs";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const publicDir = root;
export async function createGameServer({
  port = 0,
  saveDir = path.join(root, ".build", "saves"),
  publicDirectory = publicDir,
  recognitionDirectory = null,
} = {}) {
  const publicRoot = await fs.realpath(publicDirectory);
  // Only the explicitly supplied recognition tree may come from the live repo.
  // A standalone executable always falls back to its packaged assets.
  const recognitionRoot = recognitionDirectory ? await fs.realpath(recognitionDirectory) : null;
  if (recognitionRoot && !(await fs.stat(recognitionRoot)).isDirectory())
    throw Error("Recognition root must be a directory.");
  const catalog = CATALOG;
  let saveQueue = Promise.resolve();
  const server = http.createServer(async (req, res) => {
    try {
      const actualPort = server.address()?.port || port;
      const origin = `http://127.0.0.1:${actualPort}`;
      const url = new URL(req.url, origin);
      if (
        req.headers.host !== `127.0.0.1:${actualPort}` &&
        req.headers.host !== `localhost:${actualPort}`
      ) {
        res.writeHead(403);
        res.end();
        return;
      }
      if (
        req.headers.origin &&
        ![origin, `http://localhost:${actualPort}`].includes(req.headers.origin)
      ) {
        res.writeHead(403);
        res.end();
        return;
      }
      res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      );
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Referrer-Policy", "no-referrer");
      if (url.pathname === "/health") {
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            game: "WNT1922",
            version: SAVE_VERSION,
            build: GAME_VERSION,
          }),
        );
        return;
      }
      if (url.pathname === "/api/save") {
        res.setHeader("Content-Type", "application/json");
        if (req.method === "GET") {
          try {
            const saved = await fs.readFile(
              path.join(
                saveDir,
                url.searchParams.get("backup") === "1"
                  ? "campaign.backup.json"
                  : "campaign.json",
              ),
              "utf8",
            );
            let loaded;
            try {
              loaded = validateSave(JSON.parse(saved), catalog);
            } catch {
              res.writeHead(409);
              res.end(
                JSON.stringify({
                  error:
                    "This release uses new campaigns. Your older save is still on disk. Start a new campaign.",
                }),
              );
              return;
            }
            res.end(JSON.stringify(loaded));
          } catch (e) {
            if (e.code !== "ENOENT") throw e;
            res.writeHead(404);
            res.end(JSON.stringify({ error: "No saved campaign." }));
          }
          return;
        }
        if (req.method === "POST") {
          let body = "";
          for await (const chunk of req) {
            body += chunk;
            if (body.length > 8_000_000) {
              res.writeHead(413);
              res.end();
              return;
            }
          }
          let save;
          try {
            save = JSON.parse(body);
          } catch {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid save JSON." }));
            return;
          }
          try {
            save = validateSave(save, catalog);
          } catch {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid campaign." }));
            return;
          }
          saveQueue = saveQueue
            .catch(() => {})
            .then(async () => {
              await fs.mkdir(saveDir, { recursive: true });
              await fs.writeFile(
                path.join(saveDir, "campaign.tmp"),
                JSON.stringify(save),
              );
              try {
                const previous = await fs.readFile(
                  path.join(saveDir, "campaign.json"),
                  "utf8",
                );
                let valid = true;
                try {
                  validateSave(JSON.parse(previous), catalog);
                } catch {
                  valid = false;
                }
                if (valid)
                  await fs.copyFile(
                    path.join(saveDir, "campaign.json"),
                    path.join(saveDir, "campaign.backup.json"),
                  );
              } catch (e) {
                if (e.code !== "ENOENT") throw e;
              }
              await fs.rename(
                path.join(saveDir, "campaign.tmp"),
                path.join(saveDir, "campaign.json"),
              );
            });
          await saveQueue;
          res.end(JSON.stringify({ saved: true }));
          return;
        }
        res.writeHead(405);
        res.end();
        return;
      }
      if (!["GET", "HEAD"].includes(req.method)) {
        res.writeHead(405);
        res.end();
        return;
      }
      let decodedPath;
      try { decodedPath = decodeURIComponent(req.url.split("?")[0]); }
      catch { res.writeHead(400); res.end("Invalid path"); return; }
      if (decodedPath.split(/[\\/]/).includes("..") || decodedPath.includes("\\")) {
        res.writeHead(404); res.end("Not found"); return;
      }
      const name =
        url.pathname === "/"
          ? "ui/index.html"
          : decodeURIComponent(url.pathname.slice(1));
      if (
        !(
          name === "package.json" ||
          /^(ui|mechanics|worker|catalog|assets)\/[\w./-]+\.(?:mjs|css|html|json|md|mp3)$/.test(
            name,
          ) || /^assets\/recognition\/[\w/-]+\.(?:png|jpe?g|svg)$/.test(name)
        ) ||
        name.includes("..") ||
        name.startsWith("worker/desktop/")
      ) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const liveRecognition = recognitionRoot && name.startsWith("assets/recognition/");
      if (liveRecognition && !/\.(?:json|md|png|jpe?g|svg)$/.test(name)) {
        res.writeHead(404); res.end("Not found"); return;
      }
      const fileRoot = liveRecognition ? recognitionRoot : publicRoot;
      const file = await fs.realpath(path.join(fileRoot, liveRecognition ? name.slice("assets/recognition/".length) : name));
      const relative = path.relative(fileRoot, file);
      if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
        res.writeHead(404); res.end("Not found"); return;
      }
      const body = await fs.readFile(file);
      if (name.endsWith(".svg"))
        res.setHeader("Content-Security-Policy", "sandbox; default-src 'none'; style-src 'unsafe-inline'");
      res.setHeader(
        "Content-Type",
        {
          html: "text/html; charset=utf-8",
          css: "text/css; charset=utf-8",
          mjs: "text/javascript; charset=utf-8",
          json: "application/json; charset=utf-8",
          md: "text/plain; charset=utf-8",
          mp3: "audio/mpeg",
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          svg: "image/svg+xml",
        }[name.split(".").pop()],
      );
      res.end(req.method === "HEAD" ? undefined : body);
    } catch (error) {
      if (error.code === "ENOENT") {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      console.error(error.message);
      if (!res.headersSent) res.writeHead(500);
      res.end("The local game could not complete this request.");
    }
  });
  return server;
}
