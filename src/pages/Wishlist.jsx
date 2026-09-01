import { useState } from "react";
import { Link } from "react-router-dom";
import MypageBackLink from "../components/MypageBackLink";
import tripRoad from "../data/trip_road.json";
import styles from "./Wishlist.module.scss";

const favoriteStorageKey = "lcode-favorite-trips";
const countryLabels = { korea: "KOREA", japan: "JAPAN", china: "CHINA" };

const imageModules = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const getStoredFavorites = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(favoriteStorageKey) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

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

const uniqueTrips = Array.from(
  tripRoad.trips.reduce((map, trip) => {
    if (!map.has(trip.id)) map.set(trip.id, trip);
    return map;
  }, new Map()).values(),
);

export default function Wishlist() {
  const [favoriteIds, setFavoriteIds] = useState(getStoredFavorites);
  const favoriteTrips = favoriteIds
    .map((id) => uniqueTrips.find((trip) => trip.id === id))
    .filter(Boolean);

  const removeFavorite = (tripId) => {
    setFavoriteIds((current) => {
      const next = current.filter((id) => id !== tripId);
      try {
        localStorage.setItem(favoriteStorageKey, JSON.stringify(next));
      } catch {
        // 저장소를 사용할 수 없어도 현재 화면에서는 즉시 삭제합니다.
      }
      return next;
    });
  };

  return (
    <main className={styles.wishlist}>
      <section className={styles.content} aria-labelledby="wish-list-title">
        <MypageBackLink />
        <p className={styles.eyebrow}>MY JOURNEY</p>
        <h1 id="wish-list-title">WISH LIST</h1>
        <p className={styles.description}>다음 여행을 위해 저장해둔 장소</p>
        <div className={styles.divider} />

        {favoriteTrips.length ? (
          <div className={styles.placeGrid}>
            {favoriteTrips.map((trip) => {
              const image = getRepresentativeImage(trip);
              return (
                <article className={styles.placeCard} key={trip.id}>
                  <Link
                    className={styles.imagePlaceholder}
                    to={`/plan?trip=${encodeURIComponent(trip.id)}`}
                    style={image ? { backgroundImage: `url("${image}")` } : undefined}
                    aria-label={`${trip.title} 상세 보기`}
                  />
                  <button
                    className={styles.heartButton}
                    type="button"
                    aria-label={`${trip.title} 위시리스트에서 삭제`}
                    onClick={() => removeFavorite(trip.id)}
                  >
                    <span aria-hidden="true">♥</span>
                  </button>
                  <p className={styles.location}>
                    {trip.city.toUpperCase()} / {countryLabels[trip.country] || trip.country.toUpperCase()}
                  </p>
                  <h2>{trip.title}</h2>
                  <footer>
                    <span>{trip.duration}</span>
                    <Link to={`/plan?trip=${encodeURIComponent(trip.id)}`}>+ 일정에 추가</Link>
                  </footer>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>아직 저장해둔 장소가 없어요!</p>
            <Link to="/search">패키지 여행 바로가기 <span aria-hidden="true">→</span></Link>
          </div>
        )}
      </section>
    </main>
  );
}
