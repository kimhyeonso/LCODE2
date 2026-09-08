import assert from "node:assert/strict";
import { createExpression, validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import { FREE_MAP_STYLE_URL, koreanMapStyle } from "../src/utils/mapStyle.js";

const response = await fetch(FREE_MAP_STYLE_URL);
assert.equal(response.status, 200);
const original = await response.json();
const localized = koreanMapStyle(original);
assert.deepEqual(validateStyleMin(localized), []);
const label = localized.layers.find((layer) => layer.id === "label_city");
const compiled = createExpression(label.layout["text-field"]);
assert.equal(compiled.result, "success");
for (const properties of [
  { "name:ko": "도쿄", name: "東京" },
  { "name:ko": "베이징", name: "北京市" },
  { name: "地元の名前" },
]) {
  assert.equal(compiled.value.evaluate({}, { properties }), properties["name:ko"] ?? properties.name);
}
for (const layer of original.layers.filter((item) => item.id.includes("shield"))) {
  assert.deepEqual(localized.layers.find((item) => item.id === layer.id), layer);
}
assert.notDeepEqual(original.layers.find((layer) => layer.id === "label_city"), label);

const metadata = await fetch(localized.sources.openmaptiles.url).then((r) => r.json());
assert.ok(metadata.vector_layers.find((layer) => layer.id === "place").fields["name:ko"]);
for (const [name, lon, lat] of [["Tokyo", 139.69, 35.68], ["Beijing", 116.4, 39.9]]) {
  const z = 5;
  const x = Math.floor((lon + 180) / 360 * 2 ** z);
  const radians = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2 * 2 ** z);
  const url = metadata.tiles[0].replace("{z}", z).replace("{x}", x).replace("{y}", y);
  const tile = await fetch(url);
  assert.equal(tile.status, 200);
  assert.ok((await tile.arrayBuffer()).byteLength > 0);
  console.log(`${name}: vector tile HTTP 200`);
}
const glyphUrl = localized.glyphs.replace("{fontstack}", "Noto%20Sans%20Regular")
  .replace("{range}", "" + (Math.floor("도".charCodeAt(0) / 256) * 256) + "-" + (Math.floor("도".charCodeAt(0) / 256) * 256 + 255));
assert.equal((await fetch(glyphUrl)).status, 200);
console.log("PASS: style validation, Korean preference, native-name fallback, road shields, live tiles and Korean glyph endpoint");
