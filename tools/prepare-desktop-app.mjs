import fs from "node:fs/promises";
import path from "node:path";
import { projectFiles } from "./project-files.mjs";
const target = path.resolve(process.argv[2] || ".build/portable/resources/app");
if (!target.startsWith(path.resolve(".build") + path.sep))
  throw Error("Application staging must remain inside .build/.");
const files = await projectFiles();
for (const file of files) {
  const out = path.join(target, file);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.copyFile(file, out);
}
console.log(
  `Packaged ${files.length} source files directly; no generated game data.`,
);
