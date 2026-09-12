import fs from "node:fs/promises";
import path from "node:path";
export const SOURCE_FOLDERS = [
  "ui",
  "catalog",
  "mechanics",
  "worker",
  "assets",
];
export async function listFiles(root, prefix = "") {
  const result = [];
  for (const entry of await fs.readdir(path.join(root, prefix), {
    withFileTypes: true,
  })) {
    if (entry.isSymbolicLink())
      throw Error("Linked files are not allowed in the application payload.");
    const name = prefix + entry.name;
    if (entry.isDirectory())
      result.push(...(await listFiles(root, name + "/")));
    else result.push(name);
  }
  return result.sort();
}
export async function projectFiles(root = process.cwd()) {
  return [
    "package.json",
    ...(
      await Promise.all(SOURCE_FOLDERS.map((f) => listFiles(root, f + "/")))
    ).flat(),
  ].sort();
}
