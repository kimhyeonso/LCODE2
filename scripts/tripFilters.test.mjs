import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { getTripFilterProfile, matchesTripFilters } from "../src/utils/tripFilters.js";

const defaults = { duration: "all", companion: "all", styles: [], pace: "all", season: "all" };
const trip = (places, extra = {}) => ({ days: [{ items: places.map(([place, category]) => ({ place, category, type: "place" })) }], ...extra });

test("cafe, dining, nature, shopping and relaxation have distinct criteria", () => {
  const cafe = trip([["작은 커피 카페", "restaurant"]]);
  const restaurant = trip([["라멘 전문 식당", "restaurant"]]);
  assert.equal(matchesTripFilters(cafe, { ...defaults, styles: ["카페"] }), true);
  assert.equal(matchesTripFilters(cafe, { ...defaults, styles: ["맛집"] }), false);
  assert.equal(matchesTripFilters(restaurant, { ...defaults, styles: ["카페"] }), false);
  assert.equal(matchesTripFilters(restaurant, { ...defaults, styles: ["맛집"] }), true);
  assert.equal(matchesTripFilters(trip([["백화점", "attraction"]]), { ...defaults, styles: ["자연"] }), false);
  assert.equal(matchesTripFilters(trip([["해변", "attraction"]]), { ...defaults, styles: ["쇼핑"] }), false);
  assert.equal(matchesTripFilters(trip([["비즈니스 호텔", "hotel"]]), { ...defaults, styles: ["휴양"] }), false);
  assert.equal(matchesTripFilters(cafe, { ...defaults, styles: ["카페", "자연"] }), false);
});

test("companion metadata is applied and fallback recommendations affect results", () => {
  const family = trip([["수족관", "attraction"]]);
  assert.equal(matchesTripFilters(family, { ...defaults, companion: "가족" }), true);
  assert.equal(matchesTripFilters(family, { ...defaults, companion: "연인" }), false);
  const curated = trip([], { companions: ["친구"] });
  assert.equal(matchesTripFilters(curated, { ...defaults, companion: "친구" }), true);
  assert.equal(matchesTripFilters(curated, { ...defaults, companion: "혼자" }), false);
});

test("unknown and invalid dates do not match winter; leap years are validated", () => {
  for (const start of [undefined, "", "2026-02-30", "2026-13-01"]) {
    assert.equal(matchesTripFilters(trip([], { dateRange: { start } }), { ...defaults, season: "겨울" }), false);
  }
  assert.equal(matchesTripFilters(trip([], { dateRange: { start: "2028-02-29" } }), { ...defaults, season: "겨울" }), true);
  assert.equal(matchesTripFilters(trip([], { seasons: ["여름"] }), { ...defaults, season: "여름" }), true);
});

test("duration uses actual days and transport stops do not inflate pace", () => {
  const sample = trip([["공항", "airport"], ["역", "station"], ["역", "station"], ["호텔", "hotel"], ["미술관", "attraction"]]);
  assert.equal(getTripFilterProfile(sample).pace, "slow");
  sample.days.push({ items: [] });
  assert.equal(matchesTripFilters(sample, { ...defaults, duration: "1박 2일" }), true);
  assert.equal(matchesTripFilters(sample, { ...defaults, duration: "5박 이상" }), false);
});

test("real catalogue has distinct nonempty result sets for the exposed filters", () => {
  const catalog = JSON.parse(fs.readFileSync(new URL("../src/data/trip_road.json", import.meta.url), "utf8")).trips;
  const ids = (key, value) => catalog.filter((item) => matchesTripFilters(item, { ...defaults, [key]: value })).map((item) => item.id);
  for (const value of ["혼자", "친구", "연인", "가족"]) assert.ok(ids("companion", value).length > 0, value);
  assert.notDeepEqual(ids("styles", ["맛집"]), ids("styles", ["카페"]));
  assert.notDeepEqual(ids("styles", ["자연"]), ids("styles", ["쇼핑"]));
});
