import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./PlaceMap.module.scss";

const FUKUOKA_CENTER = [33.5902, 130.4017];

function MoveMap({ center, places, fitToPlaces }) {
  const map = useMap();

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
  places,
  fallbackPlaces = [],
  selectedPlace,
  onSelect = () => {},
  fitToPlaces = false,
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
        : FUKUOKA_CENTER;

  return (
    <MapContainer className={styles.map} center={center} zoom={13} scrollWheelZoom={false}>
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
            <Popup>{place.place}</Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
