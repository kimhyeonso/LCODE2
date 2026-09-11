import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { getCityPlaces, getRecommendedPlaces, isVisitTime, updateRouteInformation, validateVisitTimes } from "../src/utils/itineraryEditing.js";

test("visit times must be valid, explicit and distinct from existing and added stops", () => {
  assert.equal(isVisitTime("23:59"), true);
  for (const time of ["24:00", "10:60", "", undefined]) assert.equal(isVisitTime(time), false);
  assert.notEqual(validateVisitTimes([], [{ time: "" }]), "");
  assert.notEqual(validateVisitTimes([{ time: "10:00" }], [{ time: "10:00" }]), "");
  assert.notEqual(validateVisitTimes([], [{ time: "23:30" }, { time: "23:30" }]), "");
  assert.equal(validateVisitTimes([{ time: "23:30" }], [{ time: "23:45" }, { time: "23:59" }]), "");
});

test("route information is retained only for unchanged adjacent places", () => {
  const stops = [{ id: "a", travel: "15 min" }, { id: "b", travel: "20 min" }, { id: "c", travel: "" }];
  assert.deepEqual(updateRouteInformation(stops, stops), stops);
  const inserted = updateRouteInformation(stops, [stops[0], { id: "new" }, ...stops.slice(1)]);
  assert.notEqual(inserted[0].travel, "15 min");
  assert.equal(inserted[2].travel, "20 min");
  assert.equal(inserted[3].travel, "");
  assert.notEqual(updateRouteInformation(stops, [stops[0], stops[2]])[0].travel, "15 min");
  assert.equal(stops[0].travel, "15 min");
});

test("city search includes other itineraries, removes duplicates and excludes other cities", () => {
  const trip = (city, items) => ({ city, country: "japan", days: [{ items }] });
  const place = (name, image = "") => ({ type: "place", place: name, image });
  const current = trip("Tokyo", [place("A"), { type: "transport" }]);
  const catalog = [trip("Tokyo", [place("A", "a.webp"), place("B")]), trip("Osaka", [place("C")]), trip("Tokyo·Osaka", [place("D")])];
  const result = getCityPlaces(catalog, current);
  assert.deepEqual(result.map((item) => item.place), ["A", "B"]);
  assert.equal(result[0].image, "a.webp");
  assert.equal(result[1].city, "Tokyo");
  assert.equal(current.days[0].items[0].image, "");
  assert.equal(getCityPlaces(catalog, trip("Tokyo·Osaka", [])).length, 4);
});

test("recommendations exclude all scheduled places, transit, hotels and free meals, and are capped at four", () => {
  const place = (name, category = "attraction", extra = {}) => ({ place: name, category, ...extra });
  const candidates = [place("airport", "airport"), place("hotel", "hotel"), place("station", "station"),
    place("meal", "restaurant", { isFreeMeal: true }), place("already on another day"),
    place("A"), place("A"), place("B", "restaurant"), place("C"), place("D"), place("E")];
  const original = JSON.stringify(candidates);
  assert.deepEqual(getRecommendedPlaces(candidates, [{ name: "already on another day" }]).map((item) => item.place), ["A", "B", "C", "D"]);
  assert.deepEqual(getRecommendedPlaces([place("A")], [{ name: "A" }]), []);
  assert.equal(JSON.stringify(candidates), original);
});

test("recommendations prefer new places and label places scheduled on other days", () => {
  const places = ["today", "other day", "new"].map((place) => ({ place, category: "attraction" }));
  const days = [[{ name: "today" }], [{ name: "other day" }]];
  const result = getRecommendedPlaces(places, days[0], 4, days);
  assert.deepEqual(result.map((place) => [place.place, place.scheduledDays]), [["new", []], ["other day", [2]]]);
  assert.deepEqual(getRecommendedPlaces(places, days[1], 4, days).map((place) => place.place), ["new", "today"]);
});

test("single-itinerary cities still offer recommendations for the selected day", () => {
  const { trips } = JSON.parse(readFileSync(new URL("../src/data/trip_road.json", import.meta.url), "utf8"));
  for (const city of ["강릉", "서울", "상하이"]) {
    const trip = trips.find((item) => item.city === city);
    const days = trip.days.map((day) => day.items);
    const places = getCityPlaces(trips, trip);
    assert.equal(getRecommendedPlaces(places, days.flat()).length, 0);
    let daysWithRecommendations = 0;
    for (const stops of days) {
      const result = getRecommendedPlaces(places, stops, 4, days);
      if (result.length > 0) daysWithRecommendations += 1;
      assert.ok(result.every((place) => !stops.some((stop) => stop.place === place.place)));
    }
    assert.ok(daysWithRecommendations > 0, city);
  }
});
