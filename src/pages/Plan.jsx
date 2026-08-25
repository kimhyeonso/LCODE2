import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import styles from "./Plan.module.scss";

const imageModules = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const countryCodes = {
  KOREA: "KR",
  JAPAN: "JP",
  CHINA: "CN",
};

const categoryNames = {
  airport: "공항",
  station: "역",
  hotel: "숙소",
  attraction: "관광",
  restaurant: "맛집",
};

const cityImageFolders = {
  오사카: "osaka",
  "오사카·도쿄": "osaka",
  도쿄: "tokyo",
  베이징: "beijing",
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  const relativePath = imagePath.replace(/^img\//, "../assets/images/");
  const matchedKey = Object.keys(imageModules).find(
    (key) => key.toLowerCase() === relativePath.toLowerCase(),
  );
  return matchedKey ? imageModules[matchedKey] : "";
};

const getFallbackImage = (city, country) => {
  const folder = cityImageFolders[city] || city;
  const folderPattern = `/images/${folder.toLowerCase()}/`;
  const cityImageKey = Object.keys(imageModules).find((key) =>
    key.toLowerCase().includes(folderPattern),
  );

  if (cityImageKey) return imageModules[cityImageKey];

  const fileNames = [
    `${folder.toLowerCase()}_china.jpg`,
    `${country.toLowerCase()}.jpg`,
  ];
  const fallbackKey = Object.keys(imageModules).find((key) =>
    fileNames.some((fileName) => key.toLowerCase().endsWith(`/images/${fileName}`)),
  );

  return fallbackKey ? imageModules[fallbackKey] : "";
};

const packages = tripRoad.trips.map((trip) => {
  const places = trip.days.flatMap((day) =>
    day.items.filter((item) => item.type === "place"),
  );
  const categories = [...new Set(places.map((item) => item.category))];
  const imageItem = places.find((item) => item.image);

  return {
    id: trip.id,
    city: trip.city.toUpperCase(),
    country: trip.country.toUpperCase(),
    days: trip.duration,
    type: `${trip.days.length >= 4 ? "FULL" : "BALANCE"} · ${categoryNames[categories[0]] || "여행"}`,
    title: trip.title,
    tags: categories.map((category) => categoryNames[category] || category).join(" · "),
    image: getImageUrl(imageItem?.image) || getFallbackImage(trip.city, trip.country),
    trip,
  };
});

const regions = Object.entries(
  packages.reduce((groups, item) => {
    if (!groups[item.country]) groups[item.country] = new Set();
    groups[item.country].add(item.city);
    return groups;
  }, {}),
).map(([country, cities]) => [countryCodes[country] || country.slice(0, 2), [...cities]]);

export default function Plan() {
  const [params] = useSearchParams();
  const initialCountry = params.get("country")?.toUpperCase() || "ALL";
  const initialCity = params.get("city")?.toUpperCase() || "ALL";
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState(initialCountry);
  const [city, setCity] = useState(initialCity);
  const [sort, setSort] = useState("추천순");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const result = packages.filter((item) => {
      const matchesCountry = country === "ALL" || item.country === country;
      const matchesCity = city === "ALL" || item.city === city;
      const matchesQuery =
        !keyword ||
        `${item.city} ${item.title} ${item.tags}`.toLowerCase().includes(keyword);
      return matchesCountry && matchesCity && matchesQuery;
    });
    return sort === "도시순"
      ? [...result].sort((a, b) => a.city.localeCompare(b.city, "ko"))
      : result;
  }, [city, country, query, sort]);

  const selectCity = (nextCity) => {
    const selected = packages.find((item) => item.city === nextCity);
    setCity(nextCity);
    setCountry(selected?.country || "ALL");
  };

  const resetFilters = () => {
    setQuery("");
    setCountry("ALL");
    setCity("ALL");
  };

  return (
    <main className={styles.plan}>
      <section className={styles.searchArea}>
        <label className={styles.search}>
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="여행지 또는 패키지를 검색하세요."
          />
        </label>
        <p>어디로 떠나볼까요?</p>
        <div className={styles.regions}>
          {regions.map(([code, cities]) => (
            <div key={code}>
              <span>{code}</span>
              {cities.map((item) => (
                <button
                  className={city === item ? styles.active : ""}
                  key={item}
                  onClick={() => selectCity(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.tools}>
          <button onClick={resetFilters}>FILTER</button>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option>추천순</option>
            <option>도시순</option>
          </select>
        </div>
      </section>

      <section className={styles.recommendations}>
        <h2>L:CODE PICKS</h2>
        <div>
          {packages.slice(0, 4).map((item) => (
            <button key={item.id} onClick={() => selectCity(item.city)}>
              <span
                className={styles.thumb}
                style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
              />
              <b>{item.city}</b>
              <small>{item.days}</small>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.archive}>
        <div className={styles.archiveTitle}>
          <span>PACKAGE ARCHIVE</span>
          <b>{String(filtered.length).padStart(2, "0")}</b>
        </div>
        <div className={styles.packageList}>
          {filtered.map((item, index) => (
            <article key={item.id}>
              <div
                className={styles.packageImage}
                style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <button aria-label={`${item.city} 찜하기`}>♡</button>
                <h2>{item.city}</h2>
              </div>
              <div className={styles.packageCopy}>
                <p>
                  {item.days} <span>{item.type}</span>
                </p>
                <h3>{item.title}</h3>
                <small>{item.tags}</small>
                <Link to={`/travel-planner?trip=${encodeURIComponent(item.id)}`}>
                  이 패키지로 일정 만들기 →
                </Link>
              </div>
            </article>
          ))}
          {!filtered.length && (
            <p className={styles.empty}>조건에 맞는 패키지가 없습니다.</p>
          )}
        </div>
      </section>
    </main>
  );
}
