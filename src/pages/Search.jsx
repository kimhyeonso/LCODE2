import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import searchIcon from "../assets/icons/search.svg";
import styles from "./Search.module.scss";

const imageModules = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png,webp}", { eager: true, import: "default" });
const countryCodes = { korea: "KR", japan: "JP", china: "CN" };
const categoryLabels = { airport: "공항", station: "교통", hotel: "숙소", attraction: "관광", restaurant: "맛집" };

const getImageUrl = (path) => {
  if (!path) return "";
  const relative = path.replace(/^img\//, "../assets/images/");
  const key = Object.keys(imageModules).find((item) => item.toLowerCase() === relative.toLowerCase());
  return key ? imageModules[key] : "";
};

const packages = tripRoad.trips.map((trip) => {
  const places = trip.days.flatMap((day) => day.items.filter((item) => item.type === "place"));
  const categories = [...new Set(places.map((place) => place.category))];
  return {
    ...trip,
    places,
    image: getImageUrl(places.find((place) => place.image)?.image),
    tags: categories.map((category) => categoryLabels[category] || category),
  };
});

const regions = Object.entries(packages.reduce((result, item) => {
  const code = countryCodes[item.country.toLowerCase()] || item.country.slice(0, 2).toUpperCase();
  if (!result[code]) result[code] = [];
  if (!result[code].includes(item.city)) result[code].push(item.city);
  return result;
}, {}));

export default function Search() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("ALL");
  const [sort, setSort] = useState("추천순");

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const filtered = packages.filter((item) => {
      const matchesRegion = region === "ALL" || item.city === region;
      const text = `${item.city} ${item.country} ${item.title} ${item.tags.join(" ")}`.toLowerCase();
      return matchesRegion && (!keyword || text.includes(keyword));
    });
    return sort === "이름순" ? [...filtered].sort((a, b) => a.city.localeCompare(b.city, "ko")) : filtered;
  }, [query, region, sort]);

  return (
    <main className={styles.searchPage}>
      <section className={styles.searchPanel}>
        <label className={styles.searchField}>
          <img src={searchIcon} alt="" />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="여행지 또는 패키지를 검색하세요." />
        </label>
        <p>어디로 떠나볼까요?</p>
        <div className={styles.regions}>
          {regions.map(([code, cities]) => (
            <div key={code}>
              <b>{code}</b>
              {cities.map((city) => <button className={region === city ? styles.active : ""} type="button" key={city} onClick={() => setRegion(city)}>{city}</button>)}
            </div>
          ))}
        </div>
        <div className={styles.tools}>
          <button type="button" onClick={() => { setQuery(""); setRegion("ALL"); }}>FILTER</button>
          <select value={sort} onChange={(event) => setSort(event.target.value)}><option>추천순</option><option>이름순</option></select>
        </div>
      </section>

      <section className={styles.picks}>
        <h2>L:CODE PICKS</h2>
        <div>{packages.slice(0, 5).map((item) => <Link to={`/plan?trip=${encodeURIComponent(item.id)}`} key={item.id}><span style={item.image ? { backgroundImage: `url(${item.image})` } : undefined} /><b>{item.city}</b><small>{item.days.length}DAYS</small></Link>)}</div>
      </section>

      <section className={styles.archive}>
        <header><span>PACKAGE ARCHIVE</span><b>{String(results.length).padStart(2, "0")}</b></header>
        <div className={styles.list}>
          {results.map((item, index) => (
            <article key={item.id}>
              <Link className={styles.cardImage} to={`/plan?trip=${encodeURIComponent(item.id)}`} style={item.image ? { backgroundImage: `linear-gradient(transparent 35%, rgba(0,0,0,.72)), url(${item.image})` } : undefined}>
                <small>{String(index + 1).padStart(2, "0")}</small><i>♡</i><strong>{item.city.toUpperCase()}</strong>
              </Link>
              <div className={styles.cardCopy}>
                <p>{item.duration}<span>·</span><em>BALANCE · 여행</em></p>
                <h3>{item.title}</h3>
                <small>{item.tags.join(" · ")}</small>
              </div>
            </article>
          ))}
          {!results.length && <p className={styles.empty}>검색 결과가 없습니다.</p>}
        </div>
      </section>
    </main>
  );
}
