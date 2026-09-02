import { Link, useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import styles from "./Desrination.module.scss";

const thumbnailModules = import.meta.glob("../assets/images/Thumbnail/Thumbnail-image/**/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const thumbnails = Object.entries(thumbnailModules).reduce((list, [path, image]) => {
  const parts = path.split("/");
  const country = parts[parts.length - 2];
  const fileName = parts[parts.length - 1].replace(/\.[^.]+$/, "");
  list[`${country}/${fileName}`] = image;
  return list;
}, {});

const getThumbnailImage = (imagePath) => {
  if (!imagePath) return "";
  const assetPath = imagePath.replace(/^img\//, "../assets/images/");
  return thumbnailModules[assetPath] || "";
};

const cityThumbnail = {
  "거제": "geoje",
  "부산": "busan",
  "경주": "gyeongju",
  "제주도": "jeju",
  "도쿄": "tokyo",
  "오사카": "osaka",
  "후쿠오카": "fukuoka",
  "홋카이도": "hokkaido",
  "상하이": "shanghai",
  "칭다오": "qingdao",
  "베이징": "beijing",
  "장가계": "zhangjiajie",
  "청두": "chengdu",
  "하얼빈": "harbin",
  "다롄": "dalian",
  "충칭": "chongqing",
  "항저우": "hangzhou",
};

const countryThumbnail = {
  korea: ["geoje", "busan", "gyeongju", "jeju"],
  japan: ["tokyo", "osaka", "kyoto", "hokkaido", "fukuoka"],
  china: ["zhangjiajie", "shanghai", "qingdao", "harbin", "hangzhou", "dalian", "chongqing", "chengdu", "beijing"],
};

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

const getFirstPlace = (trip) => trip.days
  .flatMap((day) => day.items)
  .find((item) => item.type === "place");

const getTripImage = (trip, index) => {
  const thumbnailPath = tripRoad.thumbnailMap?.[trip.country]?.[trip.city];
  const jsonThumbnail = getThumbnailImage(thumbnailPath);
  if (jsonThumbnail) return jsonThumbnail;

  const thumbnailNames = countryThumbnail[trip.country];
  const cityName = cityThumbnail[trip.city];
  const imageName = cityName || thumbnailNames[index % thumbnailNames.length];
  return thumbnails[`${trip.country}/${imageName}`];
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
            const image = getTripImage(trip, index);
            const category = themeNames[firstPlace?.category] || "TRAVEL PACKAGE";

            return (
              <Link to={`/plan?trip=${encodeURIComponent(trip.id)}`} className={styles.tripCard} key={trip.id}>
                <div className={styles.tripImage} style={{ backgroundImage: `url(${image})` }} />
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
