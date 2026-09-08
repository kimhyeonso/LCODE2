import tripRoad from "../data/trip_road.json";
import { resolveImageUrl } from "./imageUtils";

const placeImages = new Map();
for (const trip of tripRoad.trips) {
  for (const place of trip.days.flatMap((day) => day.items)) {
    if (place.type === "place" && resolveImageUrl(place.image, "")) {
      placeImages.set(`${trip.city}::${place.place}`, place.image);
    }
  }
}

export function getPlaceImagePath(place, city) {
  if (resolveImageUrl(place.image, "")) return place.image;
  return placeImages.get(`${city}::${place.place || place.name}`) || "";
}
