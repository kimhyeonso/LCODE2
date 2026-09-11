export const isVisitTime = (time) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time || "");

export function validateVisitTimes(existing, additions) {
  const used = new Set(existing.map((stop) => stop.time).filter(isVisitTime));
  for (const stop of additions) {
    if (!isVisitTime(stop.time)) return "추가할 장소의 방문 시간을 모두 선택해 주세요.";
    if (used.has(stop.time)) return `${stop.time}에 다른 일정이 있어요. 겹치지 않는 시간을 선택해 주세요.`;
    used.add(stop.time);
  }
  return "";
}

// 이동 정보는 장소 쌍에 속하므로, 앞뒤 장소가 바뀐 구간의 기존 값을 재사용하지 않습니다.
export function updateRouteInformation(previous, next) {
  const routes = new Map(previous.map((stop, index) => [stop.id, previous[index + 1]?.id]));
  return next.map((stop, index) => ({
    ...stop,
    travel: !next[index + 1] ? "" : routes.has(stop.id) && routes.get(stop.id) === next[index + 1].id
      ? stop.travel || "이동 정보 미확인" : "이동 정보 미확인",
  }));
}

export function getCityPlaces(trips, selectedTrip) {
  const cities = new Set(String(selectedTrip.city || "").split("·").map((city) => city.trim()));
  const matching = trips.filter((trip) => String(trip.city || "").split("·").every((city) => cities.has(city.trim())));
  const places = new Map();
  for (const trip of [selectedTrip, ...matching]) {
    for (const item of trip.days.flatMap((day) => day.items)) {
      if (item.type !== "place") continue;
      const old = places.get(item.place);
      const place = { ...item, city: item.city || trip.city, country: item.country || trip.country };
      places.set(item.place, old ? { ...place, ...old, image: old.image || item.image } : place);
    }
  }
  return [...places.values()];
}

export function getRecommendedPlaces(places, scheduledStops, limit = 4, stopsByDay = []) {
  const scheduled = new Set(scheduledStops.map((stop) => stop.name || stop.place));
  const seen = new Set();
  return places.filter((place) => {
    if (!place.place || !["attraction", "restaurant"].includes(place.category) || place.isFreeMeal
      || scheduled.has(place.place) || seen.has(place.place)) return false;
    seen.add(place.place);
    return true;
  }).map((place) => ({
    ...place,
    scheduledDays: stopsByDay.flatMap((stops, index) =>
      stops.some((stop) => (stop.name || stop.place) === place.place) ? [index + 1] : []),
  })).sort((a, b) => Number(a.scheduledDays.length > 0) - Number(b.scheduledDays.length > 0))
    .slice(0, limit);
}
