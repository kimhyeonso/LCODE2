import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataPath = path.join(root, "src", "data", "trip_road.json");
const cachePath = path.join(root, "scripts", ".geocode-cache.json");
const data = JSON.parse(await fs.readFile(dataPath, "utf8"));

let cache = {};
try {
  cache = JSON.parse(await fs.readFile(cachePath, "utf8"));
} catch {
  cache = {};
}

const countryNames = { korea: "South Korea", japan: "Japan", china: "China" };
const entries = new Map();

for (const trip of data.trips) {
  for (const day of trip.days) {
    for (const item of day.items) {
      if (item.type !== "place") continue;
      const key = `${trip.country}|${trip.city}|${item.place}`;
      if (!entries.has(key)) entries.set(key, { trip, item });
    }
  }
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
let completed = 0;

for (const [key, { trip, item }] of entries) {
  if (!cache[key]) {
    const query = [item.place, trip.city, countryNames[trip.country] || trip.country].join(", ");
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("accept-language", "ko,en");

    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "LCODE-Travel-Planner/1.0 (development geocoder)" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const [result] = await response.json();
      cache[key] = result
        ? { latitude: Number(result.lat), longitude: Number(result.lon), displayName: result.display_name }
        : { latitude: null, longitude: null, displayName: null };
    } catch (error) {
      console.error(`Failed: ${query} (${error.message})`);
      cache[key] = { latitude: null, longitude: null, displayName: null };
    }

    await fs.writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
    await sleep(1100);
  }

  completed += 1;
  if (completed % 25 === 0 || completed === entries.size) {
    console.log(`${completed}/${entries.size}`);
  }
}

for (const trip of data.trips) {
  for (const day of trip.days) {
    for (const item of day.items) {
      if (item.type !== "place") continue;
      const result = cache[`${trip.country}|${trip.city}|${item.place}`];
      item.latitude = result?.latitude ?? null;
      item.longitude = result?.longitude ?? null;
    }
  }
}

await fs.writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
const resolved = Object.values(cache).filter((item) => item.latitude !== null).length;
console.log(`Resolved ${resolved}/${entries.size} unique places.`);
