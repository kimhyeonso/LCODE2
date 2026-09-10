import { globSync } from "node:fs";
import { unlinkSync, renameSync } from "node:fs";
import sharp from "sharp";

const roots = ["src/assets", "public"];
const patterns = roots.flatMap((root) => [
  `${root}/**/*.png`,
  `${root}/**/*.jpg`,
  `${root}/**/*.jpeg`,
  `${root}/**/*.PNG`,
  `${root}/**/*.JPG`,
  `${root}/**/*.JPEG`,
]);

const files = [...new Set(globSync(patterns))];
console.log(`Found ${files.length} images to convert.`);

let ok = 0;
let failed = [];

for (const file of files) {
  const dest = file.replace(/\.(png|jpe?g)$/i, ".webp");
  try {
    await sharp(file).webp({ quality: 82 }).toFile(`${dest}.tmp`);
    unlinkSync(file);
    renameSync(`${dest}.tmp`, dest);
    ok += 1;
  } catch (err) {
    failed.push({ file, error: err.message });
  }
}

console.log(`Converted: ${ok}`);
if (failed.length) {
  console.log(`Failed: ${failed.length}`);
  for (const f of failed) console.log(` - ${f.file}: ${f.error}`);
}
