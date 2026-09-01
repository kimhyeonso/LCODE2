import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import searchIcon from "../assets/icons/search.svg";
import travelKitImage from "../assets/images/travel_kit.webp";
import travelPouchImage from "../assets/images/travel_pouch.webp";
import travelAdapterImage from "../assets/images/travel_adapter.webp";
import styles from "./Search.module.scss";

const imageModules = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const countryLabels = { korea: "KR", japan: "JP", china: "CN" };
const cityAliases = {
  FUKUOKA: "후쿠오카",
  TOKYO: "도쿄",
  OSAKA: "오사카",
  SEOUL: "서울",
  JEJU: "제주도",
  SHANGHAI: "상하이",
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

const countPlaces = (trip) => trip.days.reduce(
  (total, day) => total + day.items.filter((item) => item.type === "place").length,
  0,
);

const favoriteStorageKey = "lcode-favorite-trips";

const getStoredFavorites = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(favoriteStorageKey) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

export default function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = params.get("city") || "";
  const [query, setQuery] = useState(initialQuery);
  const [country, setCountry] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [filterOpen, setFilterOpen] = useState(false);
  const [favorites, setFavorites] = useState(getStoredFavorites);

  const trips = useMemo(() => {
    const uniqueTrips = Array.from(
      tripRoad.trips.reduce((map, trip) => {
        if (!map.has(trip.city)) map.set(trip.city, trip);
        return map;
      }, new Map()).values(),
    );
    const normalizedQuery = (cityAliases[initialQuery.toUpperCase()] || initialQuery)
      .trim()
      .toLowerCase();
    const filtered = uniqueTrips.filter((trip) => {
      const matchesQuery = !normalizedQuery
        || `${trip.city} ${trip.country} ${trip.title}`.toLowerCase().includes(normalizedQuery);
      return matchesQuery && (country === "all" || trip.country === country);
    });
    return sort === "name"
      ? [...filtered].sort((a, b) => a.city.localeCompare(b.city, "ko"))
      : filtered;
  }, [country, initialQuery, sort]);

  const submitSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/search?city=${encodeURIComponent(value)}` : "/search");
  };

  const chooseKeyword = (city) => {
    setQuery(city);
    navigate(`/search?city=${encodeURIComponent(city)}`);
  };

  const toggleFavorite = (tripId) => {
    setFavorites((current) => {
      const next = current.includes(tripId)
        ? current.filter((id) => id !== tripId)
        : [...current, tripId];
      try {
        localStorage.setItem(favoriteStorageKey, JSON.stringify(next));
      } catch {
        // 저장소를 사용할 수 없어도 현재 화면의 찜 상태는 유지합니다.
      }
      return next;
    });
  };

  return (
    <main className={styles.searchPage}>
      <section className={styles.searchIntro}>
        <form role="search" onSubmit={submitSearch}>
          <img src={searchIcon} alt="" aria-hidden="true" />
          <input
            type="search"
            value={query}
            placeholder="여행지 또는 패키지를 검색하세요."
            aria-label="여행지 또는 패키지 검색"
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>
        <p>어디로 떠나볼까요?</p>
        <div className={styles.keywords}>
          <span>KR</span>
          {['서울', '부산', '제주도'].map((city) => (
            <button type="button" key={city} onClick={() => chooseKeyword(city)}>{city}</button>
          ))}
          <span>JP</span>
          {['도쿄', '오사카', '후쿠오카'].map((city) => (
            <button type="button" key={city} onClick={() => chooseKeyword(city)}>{city}</button>
          ))}
          <span>CN</span>
          {['상하이', '베이징'].map((city) => (
            <button type="button" key={city} onClick={() => chooseKeyword(city)}>{city}</button>
          ))}
        </div>
      </section>

      <section className={styles.products} aria-labelledby="search-products-title">
        <h1 id="search-products-title">TRAVEL ESSENTIALS</h1>
        <div>
          {[
            ["TRAVEL KIT", travelKitImage],
            ["TRAVEL POUCH", travelPouchImage],
            ["ADAPTER", travelAdapterImage],
          ].map(([name, image]) => (
            <Link to="/shop" key={name}>
              <img src={image} alt="" />
              <strong>{name}</strong>
              <span>SHOP NOW</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.archive} aria-labelledby="package-archive-title">
        <div className={styles.controls}>
          <button type="button" onClick={() => setFilterOpen((open) => !open)}>FILTER</button>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="정렬 방식">
            <option value="recommended">추천순</option>
            <option value="name">이름순</option>
          </select>
        </div>
        {filterOpen && (
          <div className={styles.filters} aria-label="국가 필터">
            {[["all", "ALL"], ["korea", "KOREA"], ["japan", "JAPAN"], ["china", "CHINA"]].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={country === value ? styles.selected : ""}
                onClick={() => setCountry(value)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <h2 id="package-archive-title">PACKAGE ARCHIVE <b>{trips.length}</b></h2>
        <div className={styles.results}>
          {trips.map((trip, index) => {
            const image = getRepresentativeImage(trip);
            const favorite = favorites.includes(trip.id);
            return (
              <article className={styles.tripCard} key={trip.id}>
                <Link to={`/plan?trip=${encodeURIComponent(trip.id)}`} className={styles.cardLink}>
                  <div className={styles.cardImage} style={image ? { backgroundImage: `url(${image})` } : undefined}>
                    <small>{String(index + 1).padStart(2, "0")}</small>
                    <strong>{trip.city.toUpperCase()}</strong>
                  </div>
                  <div className={styles.cardCopy}>
                    <p>{trip.duration}　—　{countryLabels[trip.country] || trip.country.toUpperCase()}</p>
                    <h3>{trip.title}</h3>
                    <small>{trip.city} 추천 여행 · {countPlaces(trip)}개 일정</small>
                  </div>
                </Link>
                <button
                  className={`${styles.favoriteButton} ${favorite ? styles.favorite : ""}`}
                  type="button"
                  aria-label={favorite ? `${trip.title} 찜 해제` : `${trip.title} 찜하기`}
                  aria-pressed={favorite}
                  onClick={() => toggleFavorite(trip.id)}
                >
                  {favorite ? "♥" : "♡"}
                </button>
              </article>
            );
          })}
          {!trips.length && (
            <div className={styles.empty}>
              <strong>검색 결과가 없습니다.</strong>
              <p>다른 도시나 국가를 검색해 보세요.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
