import { globSync } from "node:fs";
import { unlinkSync, renameSync } from "node:fs";

const tmpFiles = globSync(["src/assets/**/*.webp.tmp", "public/**/*.webp.tmp"]);
console.log(`Found ${tmpFiles.length} pending .webp.tmp files.`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ok = 0;
let failed = [];

for (const tmp of tmpFiles) {
  const dest = tmp.replace(/\.tmp$/, "");
  const original = dest.replace(/\.webp$/, "");
  const jpgOriginal = `${original}.jpg`;
  const jpegOriginal = `${original}.jpeg`;
  const pngOriginal = `${original}.png`;

  let done = false;
  for (let attempt = 0; attempt < 5 && !done; attempt += 1) {
    try {
      for (const candidate of [jpgOriginal, jpegOriginal, pngOriginal]) {
        try {
          unlinkSync(candidate);
        } catch {
          // not this extension
        }
      }
      renameSync(tmp, dest);
      done = true;
      ok += 1;
    } catch (err) {
      if (attempt === 4) failed.push({ tmp, error: err.message });
      else await sleep(500);
    }
  }
}

console.log(`Resolved: ${ok}`);
if (failed.length) {
  console.log(`Still failed: ${failed.length}`);
  for (const f of failed) console.log(` - ${f.tmp}: ${f.error}`);
}
