import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./PlaceMap.module.scss";
import { control } from "leaflet";

const FUKUOKA_CENTER = [33.5902, 130.4017];

function MoveMap({ center, places, fitToPlaces }) {
  const map = useMap();
  useEffect(() => {
    const zoom = control.zoom({ zoomInTitle: "지도 확대", zoomOutTitle: "지도 축소" }).addTo(map);
    return () => zoom.remove();
  }, [map]);

  useEffect(() => {
    if (fitToPlaces && places.length > 1) {
      map.fitBounds(
        places.map((place) => [place.latitude, place.longitude]),
        { padding: [32, 32], maxZoom: 13 },
      );
      return;
    }

    map.setView(center, 13, { animate: true });
  }, [center, fitToPlaces, map, places]);

  return null;
}

export default function PlaceMap({
  places = [],
  fallbackPlaces = [],
  selectedPlace,
  onSelect = () => {},
  fitToPlaces = false,
  fallbackCenter,
  requireLocation = false,
}) {
  const availablePlaces = places.filter(
    (place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude),
  );
  const selectedHasCoordinates = selectedPlace
    && Number.isFinite(selectedPlace.latitude)
    && Number.isFinite(selectedPlace.longitude);
  const fallbackPlace = fallbackPlaces.find(
    (place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude),
  );
  const center = selectedHasCoordinates
    ? [selectedPlace.latitude, selectedPlace.longitude]
    : availablePlaces.length
      ? [availablePlaces[0].latitude, availablePlaces[0].longitude]
      : fallbackPlace
        ? [fallbackPlace.latitude, fallbackPlace.longitude]
        : fallbackCenter || FUKUOKA_CENTER;

  if (requireLocation && !availablePlaces.length && !fallbackPlace && !fallbackCenter) {
    return <div className={styles.mapNotice} role="status">지도에 표시할 위치 정보를 확인할 수 없어요.</div>;
  }

  return (
    <div lang="ko">
    {requireLocation && availablePlaces.length < places.length && <p className={styles.mapNotice}>위치 정보가 있는 장소 {availablePlaces.length}개를 표시합니다. 좌표가 없는 장소는 지도에 표시되지 않습니다.</p>}
    <MapContainer className={styles.map} center={center} zoom={13} zoomControl={false} scrollWheelZoom={false}>
      <MoveMap center={center} places={availablePlaces} fitToPlaces={fitToPlaces} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {availablePlaces.map((place, index) => {
        const selected = selectedPlace?.place === place.place;
        return (
          <CircleMarker
            key={`${place.place}-${index}`}
            center={[place.latitude, place.longitude]}
            radius={selected ? 11 : 9}
            pathOptions={{ color: "#fff", weight: 2, fillColor: selected ? "#9e8f58" : "#171717", fillOpacity: 1 }}
            eventHandlers={{ click: () => onSelect(place) }}
          >
            <Popup>{place.nameKo || place.place}</Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
    </div>
  );
}
