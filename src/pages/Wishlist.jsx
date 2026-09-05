import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MypageBackLink from "../components/MypageBackLink";
import DesrinationThumnail from "../components/DesrinationThumnail";
import tripRoad from "../data/trip_road.json";
import { useManagedCollection } from "../hooks/useManagedCollection";
import styles from "./Wishlist.module.scss";
import { useAuth } from "../hooks/useAuth";
import { deleteFavoriteTrip, getFavoriteTrips } from "../services/firestoreService";

const themeNames = {
  attraction: "ART & WALK",
  restaurant: "SEA & FOOD",
  hotel: "STAY & REST",
  airport: "START A JOURNEY",
};
const getFavoriteStorageKey = (userId) => `lcode-favorite-trips:${userId}`;

const getStoredFavorites = (userId) => {
  try {
    const value = localStorage.getItem(getFavoriteStorageKey(userId));
    if (value === null) return null;
    const ids = JSON.parse(value);
    return Array.isArray(ids) ? ids : null;
  } catch {
    return null;
  }
};

const storeFavorites = (userId, ids) => {
  try {
    localStorage.setItem(getFavoriteStorageKey(userId), JSON.stringify(ids));
  } catch {
    // Firebase 삭제는 계속 시도합니다.
  }
};

const imageModules = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  const relativePath = imagePath.replace(/^img\//, "../assets/images/");
  const key = Object.keys(imageModules).find(
    (path) => path.toLowerCase() === relativePath.toLowerCase(),
  );
  return key ? imageModules[key] : "";
};

const getRepresentativeImage = (trip) => {
  const item = trip.days
    .flatMap((day) => day.items)
    .find((entry) => entry.type === "place" && entry.image);
  return getImageUrl(item?.image);
};

const getFirstPlace = (trip) => trip.days
  .flatMap((day) => day.items)
  .find((entry) => entry.type === "place");

export default function Wishlist() {
  const managedTrips = useManagedCollection("packages", tripRoad.trips);
  const uniqueTrips = Array.from(
    managedTrips.reduce((map, trip) => {
      if (!map.has(trip.id)) map.set(trip.id, trip);
      return map;
    }, new Map()).values(),
  );
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(
    () => user?.uid ? (getStoredFavorites(user.uid) ?? []) : [],
  );

  useEffect(() => {
    if (!user?.uid) return undefined;
    let active = true;
    const storedIds = getStoredFavorites(user.uid);
    getFavoriteTrips(user.uid)
      .then((ids) => active && setFavoriteIds(storedIds ?? ids))
      .catch((error) => {
        if (active && storedIds !== null) setFavoriteIds(storedIds);
        console.error("찜한 일정을 불러오지 못했습니다.", error);
      });
    return () => { active = false; };
  }, [user?.uid]);

  const favoriteTrips = favoriteIds
    .map((id) => uniqueTrips.find((trip) => trip.id === id))
    .filter(Boolean);

  const removeFavorite = async (tripId) => {
    if (!user?.uid) return;
    const nextIds = favoriteIds.filter((id) => id !== tripId);
    setFavoriteIds(nextIds);
    storeFavorites(user.uid, nextIds);
    try {
      await deleteFavoriteTrip(user.uid, tripId);
      window.dispatchEvent(new Event("favorite-trips-changed"));
    } catch (error) {
      console.error("일정 찜을 삭제하지 못했습니다.", error);
    }
  };

  return (
    <main className={styles.wishlist}>
      <section className={styles.content} aria-labelledby="wish-list-title">
        <MypageBackLink />
        <p className={styles.eyebrow}>MY JOURNEY</p>
        <h1 id="wish-list-title">WISH LIST</h1>
        <p className={styles.description}>다음 여행을 위해 저장해둔 일정</p>
        <div className={styles.divider} />

        {favoriteTrips.length ? (
          <div className={styles.placeGrid}>
            {favoriteTrips.map((trip, index) => {
              const image = getRepresentativeImage(trip);
              const firstPlace = getFirstPlace(trip);
              return (
                <DesrinationThumnail
                  key={trip.id}
                  trip={trip}
                  index={index}
                  image={image}
                  category={themeNames[firstPlace?.category] || "TRAVEL PACKAGE"}
                  to={`/plan?trip=${encodeURIComponent(trip.id)}`}
                  isFavorite
                  onToggleFavorite={() => removeFavorite(trip.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <strong>아직 찜한 일정이 없어요!</strong>
            <Link to="/search">패키지 여행 바로가기 <span aria-hidden="true">→</span></Link>
          </div>
        )}
      </section>
    </main>
  );
}
