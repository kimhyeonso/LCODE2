const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/data/trip_road.json"), "utf8"));
const seen = new Set();
const rows = [];
for (const trip of data.trips) for (const day of trip.days || []) for (const place of day.items || []) {
  if (place.type !== "place" || !["attraction", "restaurant"].includes(place.category) || !place.place) continue;
  const key = `${trip.city}|${place.place}`;
  if (seen.has(key)) continue;
  seen.add(key);
  rows.push({ id: createHash("sha256").update(key).digest("hex").slice(0, 16), city: trip.city,
    place: place.place, category: place.category, image: place.image || null,
    // Conservative seed classification, not live opening/availability verification.
    indoor: /박물관|미술관|수족관|아쿠아리움/.test(place.place) });
}
fs.writeFileSync(path.join(__dirname, "remix-catalog.json"), `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Prepared ${rows.length} catalog places.`);
