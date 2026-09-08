import sources from "../data/place-image-sources.json";
import { getPlaceImagePath } from "../utils/placeImageUtils";

export default function PlaceImageCredits({ trip }) {
  const paths = new Set(trip.days.flatMap((day) => day.items)
    .filter((place) => place.type === "place")
    .map((place) => getPlaceImagePath(place, trip.city)));
  const credits = sources.filter((source) => paths.has(source.image));
  if (!credits.length) return null;
  return <details style={{ marginBlock: "24px", fontSize: "12px", lineHeight: 1.7 }}>
    <summary>사진 출처</summary>
    <ul>{credits.map((source) => <li key={source.image}>
      <a href={source.sourceUrl} target="_blank" rel="noreferrer">{source.names[0]}</a>
      {" · "}{(source.author || source.publisher || "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").trim()}
      {" · "}{source.licenseUrl
        ? <a href={source.licenseUrl} target="_blank" rel="noreferrer">{source.license}</a>
        : source.license}
    </li>)}</ul>
  </details>;
}
