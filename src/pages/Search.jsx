import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import searchIcon from "../assets/icons/search.svg";
import travelKitImage from "../assets/images/travel_kit.webp";
import travelPouchImage from "../assets/images/travel_pouch.webp";
import travelAdapterImage from "../assets/images/travel_adapter.webp";
import styles from "./Search.module.scss";
import { resolveImageUrl as getImageUrl } from "../utils/imageUtils";

const countryLabels = { korea: "KR", japan: "JP", china: "CN" };
const cityAliases = {
  FUKUOKA: "후쿠오카",
  TOKYO: "도쿄",
  OSAKA: "오사카",
  SEOUL: "서울",
  JEJU: "제주도",
  SHANGHAI: "상하이",
};

const getTripImages = (trip) => {
  const cityThumbnail = getImageUrl(
    tripRoad.thumbnailMap?.[trip.country]?.[trip.city],
    "",
  );
  const placeImages = trip.days
    .flatMap((day) => day.items)
    .filter((entry) => entry.type === "place" && entry.image)
    .map((entry) => getImageUrl(entry.image, ""))
    .filter(Boolean);

  return Array.from(new Set([cityThumbnail, ...placeImages].filter(Boolean)));
};

const assignRepresentativeImages = (trips) => {
  const usedImages = new Set();

  return new Map(trips.map((trip) => {
    const candidates = getTripImages(trip);
    const image = candidates.find((candidate) => !usedImages.has(candidate))
      || candidates[0]
      || "";

    if (image) usedImages.add(image);
    return [trip.id, image];
  }));
};

const countPlaces = (trip) => trip.days.reduce(
  (total, day) => total + day.items.filter((item) => item.type === "place").length,
  0,
);

export default function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = params.get("city") || "";
  const [query, setQuery] = useState(initialQuery);
  const [country, setCountry] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ duration: "all", companion: "all", styles: [], pace: "all", season: "all" });

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
      const matchesDuration = filters.duration === "all"
        || (filters.duration === "5박 이상" ? trip.days.length >= 6 : trip.duration === filters.duration);
      const categories = new Set(trip.days.flatMap((day) => day.items).map((item) => item.category));
      const styleMap = { "유명 관광지": "attraction", "맛집": "restaurant", "카페": "restaurant", "현지 문화": "attraction", "쇼핑": "attraction", "자연": "attraction", "액티비티": "attraction", "휴양": "hotel" };
      const matchesStyles = !filters.styles.length || filters.styles.every((item) => categories.has(styleMap[item]));
      const spotsPerDay = countPlaces(trip) / Math.max(trip.days.length, 1);
      const pace = spotsPerDay <= 3 ? "slow" : spotsPerDay <= 5 ? "balance" : "full";
      const matchesPace = filters.pace === "all" || filters.pace === pace;
      const month = Number(trip.dateRange?.start?.slice(5, 7));
      const season = [3, 4, 5].includes(month) ? "봄" : [6, 7, 8].includes(month) ? "여름" : [9, 10, 11].includes(month) ? "가을" : "겨울";
      const matchesSeason = filters.season === "all" || filters.season === season;
      return matchesQuery && (country === "all" || trip.country === country) && matchesDuration && matchesStyles && matchesPace && matchesSeason;
    });
    return sort === "name"
      ? [...filtered].sort((a, b) => a.city.localeCompare(b.city, "ko"))
      : filtered;
  }, [country, filters, initialQuery, sort]);

  const representativeImages = useMemo(
    () => assignRepresentativeImages(trips),
    [trips],
  );

  const selectFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const toggleStyle = (value) => setFilters((current) => ({
    ...current,
    styles: current.styles.includes(value) ? current.styles.filter((item) => item !== value) : [...current.styles, value],
  }));
  const resetFilters = () => {
    setCountry("all");
    setFilters({ duration: "all", companion: "all", styles: [], pace: "all", season: "all" });
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/search?city=${encodeURIComponent(value)}` : "/search");
  };

  const chooseKeyword = (city) => {
    setQuery(city);
    navigate(`/search?city=${encodeURIComponent(city)}`);
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
        <h2 id="package-archive-title">PACKAGE ARCHIVE <b>{trips.length}</b></h2>
        <div className={styles.results}>
          {trips.map((trip, index) => {
            const image = representativeImages.get(trip.id);
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
      {filterOpen && (
        <div className={styles.filterBackdrop} role="presentation" onMouseDown={() => setFilterOpen(false)}>
          <section className={styles.filterPanel} role="dialog" aria-modal="true" aria-labelledby="filter-title" onMouseDown={(event) => event.stopPropagation()}>
            <header><h2 id="filter-title">FILTER</h2><button type="button" aria-label="필터 닫기" onClick={() => setFilterOpen(false)}>×</button></header>
            <FilterGroup title="여행 지역" values={[["all", "전체"], ["korea", "국내"], ["japan", "일본"], ["china", "중국"]]} selected={country} onSelect={setCountry} />
            <FilterGroup title="여행 기간" values={["all", "1박 2일", "2박 3일", "3박 4일", "4박 5일", "5박 이상"]} selected={filters.duration} onSelect={(value) => selectFilter("duration", value)} allLabel="전체" />
            <FilterGroup title="동행 유형" values={["all", "혼자", "친구", "연인", "가족"]} selected={filters.companion} onSelect={(value) => selectFilter("companion", filters.companion === value ? "all" : value)} allLabel="전체" hideAll />
            <FilterGroup title="여행 스타일 다중 선택" values={["유명 관광지", "맛집", "카페", "현지 문화", "쇼핑", "자연", "액티비티", "휴양"]} selected={filters.styles} onSelect={toggleStyle} multiple />
            <div className={styles.filterGroup}><h3>일정 강도</h3><div className={styles.paceOptions}>{[["slow", "SLOW", "여유로운 일정"], ["balance", "BALANCE", "적당한 일정"], ["full", "FULL", "알찬 일정"]].map(([value, label, copy]) => <button className={filters.pace === value ? styles.selected : ""} type="button" key={value} onClick={() => selectFilter("pace", filters.pace === value ? "all" : value)}><b>{label}</b><span>{copy}</span></button>)}</div></div>
            <FilterGroup title="계절" values={["봄", "여름", "가을", "겨울"]} selected={filters.season} onSelect={(value) => selectFilter("season", filters.season === value ? "all" : value)} />
            <footer><button type="button" onClick={resetFilters}>초기화</button><button type="button" onClick={() => setFilterOpen(false)}>{trips.length}개의 패키지 보기</button></footer>
          </section>
        </div>
      )}
    </main>
  );
}

function FilterGroup({ title, values, selected, onSelect, multiple = false, allLabel = "", hideAll = false }) {
  return <div className={styles.filterGroup}><h3>{title}</h3><div>{values.map((entry) => {
    const [value, explicitLabel] = Array.isArray(entry) ? entry : [entry, entry === "all" ? allLabel : entry];
    if (hideAll && value === "all") return null;
    const active = multiple ? selected.includes(value) : selected === value;
    return <button className={active ? styles.selected : ""} type="button" key={value} onClick={() => onSelect(value)}>{explicitLabel}</button>;
  })}</div></div>;
}
