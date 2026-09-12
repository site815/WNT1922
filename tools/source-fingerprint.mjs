import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { projectFiles } from './project-files.mjs';
const digest=createHash('sha256');
for(const file of [...await projectFiles(),'README.md'].sort()) {
  const hash=createHash('sha256').update(await fs.readFile(file)).digest('hex');
  digest.update(file+'\0'+hash+'\n');
}
console.log(digest.digest('hex'));
