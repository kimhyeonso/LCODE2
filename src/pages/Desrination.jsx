import { Link, useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import styles from "./Desrination.module.scss";

const imageModules = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const countries = [
  ["all", "ALL"],
  ["korea", "KOREA"],
  ["japan", "JAPAN"],
  ["china", "CHINA"],
];

const themeNames = {
  attraction: "ART & WALK",
  restaurant: "SEA & FOOD",
  hotel: "STAY & REST",
  airport: "START A JOURNEY",
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  const assetPath = imagePath.replace(/^img\//, "../assets/images/");
  const matchedPath = Object.keys(imageModules).find(
    (path) => path.toLowerCase() === assetPath.toLowerCase(),
  );
  return matchedPath ? imageModules[matchedPath] : "";
};

const getFirstPlace = (trip) => trip.days
  .flatMap((day) => day.items)
  .find((item) => item.type === "place");

const getTripImage = (trip) => {
  const place = trip.days
    .flatMap((day) => day.items)
    .find((item) => item.type === "place" && item.image);
  return getImageUrl(place?.image);
};

const Desrination = () => {
  const [params] = useSearchParams();
  const requestedCountry = params.get("country")?.toLowerCase();
  const selectedCountry = countries.some(([value]) => value === requestedCountry)
    ? requestedCountry
    : "all";
  const filteredTrips = tripRoad.trips.filter(
    (trip) => selectedCountry === "all" || trip.country === selectedCountry,
  );

  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>← BACK</Link>

      <header className={styles.intro}>
        <p>DESTINATIONS</p>
        <h1>WHERE SHOULD<br />WE TRAVEL?</h1>
        <span>어디로 떠나실 건가요?</span>
      </header>

      <section className={styles.packageSection}>
        <p className={styles.question}>어디로 떠나볼까요?</p>
        <nav className={styles.tabs} aria-label="국가 선택">
          {countries.map(([value, label]) => (
            <Link
              key={value}
              to={value === "all" ? "/desrination" : `/desrination?country=${value}`}
              className={selectedCountry === value ? styles.active : ""}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className={styles.cardList}>
          {filteredTrips.map((trip, index) => {
            const firstPlace = getFirstPlace(trip);
            const image = getTripImage(trip);
            const category = themeNames[firstPlace?.category] || "TRAVEL PACKAGE";

            return (
              <Link to={`/plan?trip=${encodeURIComponent(trip.id)}`} className={styles.tripCard} key={trip.id}>
                <div className={styles.tripImage} style={image ? { backgroundImage: `url(${image})` } : undefined}>
                  {!image && <span>IMAGE</span>}
                </div>
                <div className={styles.tripCopy}>
                  <small>CITY {String(index + 1).padStart(2, "0")} · {category}</small>
                  <h2>{trip.city}</h2>
                  <p>{trip.title}</p>
                  <strong>{trip.duration} · {trip.country.toUpperCase()}</strong>
                  <em>일정에 추가 &gt;</em>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Desrination;
