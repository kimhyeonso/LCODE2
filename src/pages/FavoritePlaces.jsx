import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { deleteFavoritePlace, deleteFavoriteTrip, getFavoritePlaces, getFavoriteTrips } from "../services/firestoreService";
import styles from "./FavoritePlaces.module.scss";
import { resolveImageUrl as imageUrl, useImageFallback } from "../utils/imageUtils";
import MypageBackLink from "../components/MypageBackLink";
import DesrinationThumnail from "../components/DesrinationThumnail";
import tripRoad from "../data/trip_road.json";
import { useManagedCollection } from "../hooks/useManagedCollection";

const imageModules = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png,webp}", { eager: true, import: "default" });
const getTripImageUrl = (imagePath) => {
  if (!imagePath) return "";
  const relativePath = imagePath.replace(/^img\//, "../assets/images/");
  const key = Object.keys(imageModules).find((path) => path.toLowerCase() === relativePath.toLowerCase());
  return key ? imageModules[key] : "";
};
const getRepresentativeImage = (trip) => getTripImageUrl(
  trip.days.flatMap((day) => day.items).find((entry) => entry.type === "place" && entry.image)?.image,
);
const getFirstPlace = (trip) => trip.days.flatMap((day) => day.items).find((entry) => entry.type === "place");
const themeNames = { attraction: "ART & WALK", restaurant: "SEA & FOOD", hotel: "STAY & REST", airport: "START A JOURNEY" };

export default function FavoritePlaces() {
  const { user } = useAuth();
  const managedTrips = useManagedCollection("packages", tripRoad.trips);
  const [state, setState] = useState({ loading: true, places: [], tripIds: [], error: "" });

  useEffect(() => {
    let active = true;
    Promise.all([getFavoritePlaces(user.uid), getFavoriteTrips(user.uid)])
      .then(([places, tripIds]) => active && setState({ loading: false, places, tripIds, error: "" }))
      .catch(() => active && setState({ loading: false, places: [], tripIds: [], error: "찜한 목록을 불러오지 못했습니다." }));
    return () => { active = false; };
  }, [user]);

  const remove = async (place) => {
    try {
      await deleteFavoritePlace(user.uid, place.id);
      setState((current) => ({ ...current, places: current.places.filter((item) => item.id !== place.id) }));
      window.dispatchEvent(new Event("favorite-places-changed"));
    } catch {
      setState((current) => ({ ...current, error: "찜한 장소를 삭제하지 못했습니다." }));
    }
  };

  const removeTrip = async (tripId) => {
    try {
      await deleteFavoriteTrip(user.uid, tripId);
      setState((current) => ({
        ...current,
        tripIds: current.tripIds.filter((id) => id !== tripId),
      }));
      window.dispatchEvent(new Event("favorite-trips-changed"));
    } catch {
      setState((current) => ({ ...current, error: "찜한 패키지를 삭제하지 못했습니다." }));
    }
  };

  const favoriteTrips = state.tripIds
    .map((id) => managedTrips.find((trip) => trip.id === id))
    .filter(Boolean);

  return (
    <main className={styles.page}>
      <MypageBackLink />
      <p className={styles.eyebrow}>MY JOURNEY</p>
      <h1>WISH LIST</h1>
      <p className={styles.description}>다음 여행을 위해 저장해둔 장소</p>
      <div className={styles.divider} />
      {state.loading && <p className={styles.empty}>불러오는 중…</p>}
      {state.error && <p className={styles.error} role="alert">{state.error}</p>}
      {!state.loading && !state.places.length && !favoriteTrips.length && <div className={styles.emptyState}><strong>아직 찜한 장소가 없어요!</strong><Link to="/search">여행지 둘러보기 <span aria-hidden="true">→</span></Link></div>}
      {favoriteTrips.length > 0 && (
        <section className={styles.packageGrid} aria-label="찜한 여행 패키지">
          {favoriteTrips.map((trip, index) => {
            const firstPlace = getFirstPlace(trip);
            return (
              <DesrinationThumnail
                key={trip.id}
                trip={trip}
                index={index}
                image={getRepresentativeImage(trip)}
                category={themeNames[firstPlace?.category] || "TRAVEL PACKAGE"}
                to={`/plan?trip=${encodeURIComponent(trip.id)}`}
                isFavorite
                onToggleFavorite={() => removeTrip(trip.id)}
              />
            );
          })}
        </section>
      )}
      <section className={styles.grid}>
        {state.places.map((place) => (
          <article key={place.id}>
            <span className={styles.image}>{imageUrl(place.image) && <img src={imageUrl(place.image)} alt="" onError={useImageFallback} />}</span>
            <div><small>{place.city} · {place.category}</small><h2>{place.name}</h2><p>{place.recommendation || "다음 일정에 추가해 보세요."}</p></div>
            <button type="button" onClick={() => remove(place)}>찜 해제</button>
          </article>
        ))}
      </section>
    </main>
  );
}
