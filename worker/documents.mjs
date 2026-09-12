// Documentation is the runtime database. Works in the simulation worker and Node.
const catalogRoot = new URL("../catalog/", import.meta.url);
const cache = new Map();

export function parseDataDocument(text, label = "document") {
  const blocks = [
    ...text.matchAll(/^```json game-data\s*\r?\n([\s\S]*?)^```\s*$/gm),
  ];
  if (blocks.length !== 1)
    throw Error(`${label}: expected exactly one json game-data block.`);
  try {
    const value = JSON.parse(blocks[0][1]);
    function check(v) {
      if (v && typeof v === "object")
        for (const [key, child] of Object.entries(v)) {
          if (["__proto__", "prototype", "constructor", "$ref"].includes(key))
            throw Error(`Unsupported data key: ${key}`);
          check(child);
        }
      if (v && typeof v === "object") Object.freeze(v);
    }
    check(value);
    return value;
  } catch (error) {
    throw Error(`${label}: ${error.message}`);
  }
}

export async function readText(url) {
  if (url.protocol === "file:")
    return (await import("node:fs/promises")).readFile(url, "utf8");
  const response = await fetch(url);
  if (!response.ok)
    throw Error(`Cannot read ${url.pathname}: ${response.status}`);
  return response.text();
}

export function readDocument(relative) {
  if (
    !/^(?:common|1922|1936hindsight)\/[\w/.-]+\.md$/.test(relative) &&
    relative !== "manifest.md"
  )
    throw Error(`Invalid catalog path: ${relative}`);
  if (relative.includes(".."))
    throw Error("Catalog paths must remain inside catalog/.");
  if (!cache.has(relative))
    cache.set(
      relative,
      readText(new URL(relative, catalogRoot)).then((text) =>
        parseDataDocument(text, relative),
      ),
    );
  return cache.get(relative);
}
