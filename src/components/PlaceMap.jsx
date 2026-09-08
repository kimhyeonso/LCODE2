import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, useMap } from "react-leaflet";
import KoreanMapLayer from "./KoreanMapLayer";
import "leaflet/dist/leaflet.css";
import styles from "./PlaceMap.module.scss";
import { control } from "leaflet";

const WORLD_CENTER = [20, 0];

function MoveMap({ center, places, fitToPlaces, zoom }) {
  const map = useMap();
  useEffect(() => {
    const zoom = control.zoom({ zoomInTitle: "지도 확대", zoomOutTitle: "지도 축소" }).addTo(map);
    return () => zoom.remove();
  }, [map]);

  useEffect(() => {
    let frame;
    const resize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => map.invalidateSize({ pan: false, debounceMoveend: true }));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(map.getContainer());
    resize();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [map]);

  useEffect(() => {
    if (fitToPlaces && places.length > 1) {
      map.fitBounds(
        places.map((place) => [place.latitude, place.longitude]),
        { padding: [32, 32], maxZoom: 13 },
      );
      return;
    }

    map.setView(center, zoom, { animate: true });
  }, [center, fitToPlaces, map, places, zoom]);

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
  const hasFallbackCenter = Array.isArray(fallbackCenter) && fallbackCenter.length === 2
    && fallbackCenter.every(Number.isFinite);
  const hasLocation = Boolean(selectedHasCoordinates || availablePlaces.length || fallbackPlace || hasFallbackCenter);
  const zoom = hasLocation ? 13 : 2;
  const center = selectedHasCoordinates
    ? [selectedPlace.latitude, selectedPlace.longitude]
    : availablePlaces.length
      ? [availablePlaces[0].latitude, availablePlaces[0].longitude]
      : fallbackPlace
        ? [fallbackPlace.latitude, fallbackPlace.longitude]
        : hasFallbackCenter ? fallbackCenter : WORLD_CENTER;

  return (
    <div className={styles.root} lang="ko">
    {requireLocation && availablePlaces.length < places.length && <p className={styles.mapNotice} role="status">위치 정보가 있는 장소 {availablePlaces.length}개를 표시합니다. 좌표가 없는 장소는 지도에 표시되지 않습니다.</p>}
    <MapContainer className={styles.map} center={center} zoom={zoom} minZoom={1} maxZoom={19} maxBounds={[[-85, -Infinity], [85, Infinity]]} maxBoundsViscosity={1} zoomControl={false} scrollWheelZoom={false}>
      <MoveMap center={center} places={availablePlaces} fitToPlaces={fitToPlaces} zoom={zoom} />
      <KoreanMapLayer />
      {availablePlaces.map((place, index) => {
        const selected = selectedPlace != null && (place.id != null
          ? selectedPlace.id === place.id
          : selectedPlace.place === place.place);
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
