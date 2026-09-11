import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import products from "../data/products.json";
import searchIcon from "../assets/icons/search.svg";
import DesrinationThumnail from "../components/DesrinationThumnail";
import ProductCard from "../components/ProductCard";
import styles from "./Search.module.scss";
import { resolveImageUrl as getImageUrl } from "../utils/imageUtils";
import { useAuth } from "../hooks/useAuth";
import { useManagedCollection } from "../hooks/useManagedCollection";
import { matchesTripFilters } from "../utils/tripFilters";
import {
  deleteFavoriteTrip,
  getFavoriteTrips,
  saveFavoriteTrip,
} from "../services/firestoreService";

const themeNames = {
  attraction: "ART & WALK",
  restaurant: "SEA & FOOD",
  hotel: "STAY & REST",
  airport: "START A JOURNEY",
};
const getFavoriteStorageKey = (userId) => `lcode-favorite-trips:${userId}`;

const getStoredFavoriteTrips = (userId) => {
  try {
    const value = localStorage.getItem(getFavoriteStorageKey(userId));
    if (value === null) return null;
    const ids = JSON.parse(value);
    return Array.isArray(ids) ? ids : null;
  } catch {
    return null;
  }
};

const storeFavoriteTrips = (userId, ids) => {
  try {
    localStorage.setItem(getFavoriteStorageKey(userId), JSON.stringify(ids));
  } catch {
    // Firebase 동기화는 계속 시도합니다.
  }
};
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

const getFirstPlace = (trip) => trip.days
  .flatMap((day) => day.items)
  .find((item) => item.type === "place");

export default function Search() {
  const managedTrips = useManagedCollection("packages", tripRoad.trips);
  const managedProducts = useManagedCollection("products", products);
  const { user } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialQuery = params.get("city") || "";
  const [country, setCountry] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [filterOpen, setFilterOpen] = useState(false);
  const [durationModal, setDurationModal] = useState(null);
  const [selectedDurationId, setSelectedDurationId] = useState("");
  const [favoriteState, setFavoriteState] = useState(() => ({
    userId: user?.uid || null,
    ids: user?.uid ? (getStoredFavoriteTrips(user.uid) ?? []) : [],
  }));
  const favoriteTripIds = user?.uid && favoriteState.userId === user.uid ? favoriteState.ids : [];
  const favoriteMutationRef = useRef(0);
  const favoriteLock = useRef(false);
  const [filters, setFilters] = useState({ duration: "all", companion: "all", styles: [], pace: "all", season: "all" });

  const trips = useMemo(() => {
    const normalizedQuery = (cityAliases[initialQuery.toUpperCase()] || initialQuery)
      .trim()
      .toLowerCase();
    const filtered = managedTrips.filter((trip) => {
      const matchesQuery = !normalizedQuery
        || `${trip.city} ${trip.country} ${trip.title}`.toLowerCase().includes(normalizedQuery);
      return matchesQuery && (country === "all" || trip.country === country) && matchesTripFilters(trip, filters);
    });
    return sort === "name"
      ? [...filtered].sort((a, b) => a.city.localeCompare(b.city, "ko"))
      : filtered;
  }, [country, filters, initialQuery, managedTrips, sort]);

  const cityCards = useMemo(() => Array.from(
    trips.reduce((groups, trip) => {
      const cityKey = `${trip.country}:${trip.city}`;
      const cityTrips = groups.get(cityKey) || [];
      cityTrips.push(trip);
      groups.set(cityKey, cityTrips);
      return groups;
    }, new Map()).values(),
  ).map((cityTrips) => ({
    trip: cityTrips[0],
    variants: [...cityTrips].sort((first, second) => first.days.length - second.days.length),
  })), [trips]);

  const representativeImages = useMemo(
    () => assignRepresentativeImages(cityCards.map(({ trip }) => trip)),
    [cityCards],
  );

  const selectedDurationTrip = durationModal?.trips.find((trip) => trip.id === selectedDurationId) || null;

  const openDurationModal = (cityTrips) => {
    setDurationModal({ city: cityTrips[0].city, trips: cityTrips });
    setSelectedDurationId(cityTrips[0].id);
  };

  useEffect(() => {
    if (!durationModal) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setDurationModal(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [durationModal]);

  useEffect(() => {
    favoriteMutationRef.current += 1;
    favoriteLock.current = false;
    if (!user?.uid) {
      return undefined;
    }

    let active = true;
    const mutationAtStart = favoriteMutationRef.current;
    const storedIds = getStoredFavoriteTrips(user.uid);
    getFavoriteTrips(user.uid)
      .then((firebaseIds) => {
        if (!active || favoriteMutationRef.current !== mutationAtStart) return;
        const ids = firebaseIds;
        setFavoriteState({ userId: user.uid, ids });
        storeFavoriteTrips(user.uid, ids);

      })
      .catch((error) => {
        if (active && storedIds !== null && favoriteMutationRef.current === mutationAtStart) {
          setFavoriteState({ userId: user.uid, ids: storedIds });
        }
        console.error("찜한 일정을 불러오지 못했습니다.", error);
      });
    return () => { active = false; };
  }, [user?.uid]);

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
    const value = String(new FormData(event.currentTarget).get("city") || "").trim();
    navigate(value ? `/search?city=${encodeURIComponent(value)}` : "/search");
  };

  const toggleFavoriteTrip = async (tripId) => {
    if (!user?.uid) {
      navigate("/login");
      return;
    }

    if (favoriteLock.current) return;
    const ownerId = user.uid;
    const wasFavorite = favoriteTripIds.includes(tripId);
    const mutation = ++favoriteMutationRef.current;
    favoriteLock.current = mutation;
    const nextIds = wasFavorite
      ? favoriteTripIds.filter((id) => id !== tripId)
      : [...favoriteTripIds, tripId];
    setFavoriteState({ userId: ownerId, ids: nextIds });
    storeFavoriteTrips(ownerId, nextIds);

    try {
      if (wasFavorite) await deleteFavoriteTrip(ownerId, tripId);
      else await saveFavoriteTrip(ownerId, tripId);
      window.dispatchEvent(new Event("favorite-trips-changed"));
    } catch (error) {
      storeFavoriteTrips(ownerId, favoriteTripIds);
      if (favoriteMutationRef.current === mutation) {
        setFavoriteState((current) => current.userId === ownerId ? { userId: ownerId, ids: favoriteTripIds } : current);
        window.alert("일정 찜을 저장하지 못했습니다. 다시 시도해 주세요.");
      }
      console.error("일정 찜 상태를 저장하지 못했습니다.", error);
    } finally {
      if (favoriteLock.current === mutation) favoriteLock.current = false;
    }
  };

  const travelEssentialsSection = (
    <section className={styles.products} aria-labelledby="search-products-title">
      <h1 id="search-products-title" className="whereToNextTitle">TRAVEL ESSENTIALS</h1>
      <div>
        {managedProducts.slice(0, 3).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );

  return (
    <main className={styles.searchPage}>
      <section className={styles.searchIntro}>
        <form role="search" onSubmit={submitSearch}>
          <img loading="lazy" src={searchIcon} alt="" aria-hidden="true" />
          <SearchQueryInput key={location.key} initialQuery={initialQuery} />
        </form>
        <p>어디로 떠나볼까요?</p>
        <nav className={styles.tabs} aria-label="여행 국가">
          {[["all", "ALL"], ["korea", "KOREA"], ["japan", "JAPAN"], ["china", "CHINA"]].map(([value, label]) => (
            <button className={country === value ? styles.active : ""} type="button" key={value} onClick={() => setCountry(value)}>{label}</button>
          ))}
        </nav>
        <div className={styles.controls}>
          <button type="button" onClick={() => setFilterOpen((open) => !open)}>FILTER</button>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="정렬 방식">
            <option value="recommended">추천순</option>
            <option value="name">이름순</option>
          </select>
        </div>
      </section>

      <Link to="/balance" className={styles.balanceGameCta}>
        밸런스 게임으로 나만의 여행 취향 찾기 &amp; 추천받기
      </Link>

      <section className={styles.archive} aria-labelledby="package-archive-title">
        <h2 id="package-archive-title" className="whereToNextTitle">PACKAGE ARCHIVE</h2>
        <p className={styles.resultCount} role="status">여행지 {cityCards.length}곳 · 일정 {trips.length}개</p>
        <div className={styles.results}>
          {cityCards.map(({ trip, variants }, index) => {
            const image = representativeImages.get(trip.id);
            const firstPlace = getFirstPlace(trip);
            const category = themeNames[firstPlace?.category] || "TRAVEL PACKAGE";
            const hasDurationOptions = variants.length > 1;
            const scheduleSummary = hasDurationOptions
              ? `${variants[0].duration} ~ ${variants[variants.length - 1].duration}까지 총 ${variants.length}개 일정`
              : undefined;
            return (
              <DesrinationThumnail
                key={trip.id}
                trip={trip}
                index={index}
                image={image}
                category={category}
                to={`/plan?trip=${encodeURIComponent(trip.id)}`}
                isFavorite={favoriteTripIds.includes(trip.id)}
                onToggleFavorite={() => toggleFavoriteTrip(trip.id)}
                onTripClick={hasDurationOptions ? (event) => {
                  event.preventDefault();
                  openDurationModal(variants);
                } : undefined}
                actionLabel={hasDurationOptions ? "여행 일수 선택 >" : undefined}
                scheduleSummary={scheduleSummary}
              />
            );
          })}
          {!cityCards.length && (
            <div className={styles.empty}>
              <strong>검색 결과가 없습니다.</strong>
              <p>다른 도시나 국가를 검색해 보세요.</p>
            </div>
          )}
        </div>
      </section>
      {travelEssentialsSection}
      {filterOpen && (
        <div className={styles.filterBackdrop} role="presentation" onMouseDown={() => setFilterOpen(false)}>
          <section className={styles.filterPanel} role="dialog" aria-modal="true" aria-labelledby="filter-title" onMouseDown={(event) => event.stopPropagation()}>
            <header><h2 id="filter-title">FILTER</h2><button type="button" aria-label="필터 닫기" onClick={() => setFilterOpen(false)}>×</button></header>
            <FilterGroup title="여행 지역" values={[["all", "전체"], ["korea", "국내"], ["japan", "일본"], ["china", "중국"]]} selected={country} onSelect={setCountry} />
            <FilterGroup title="여행 기간" values={["all", "1박 2일", "2박 3일", "3박 4일", "4박 5일", "5박 이상"]} selected={filters.duration} onSelect={(value) => selectFilter("duration", value)} allLabel="전체" />
            <p className={styles.filterHelp}>동행과 여행 스타일은 일정에 포함된 장소를 기준으로 추천합니다. 여행 스타일을 여러 개 고르면 모두 포함된 일정을 보여드려요.</p>
            <FilterGroup title="추천 동행 유형" values={["all", "혼자", "친구", "연인", "가족"]} selected={filters.companion} onSelect={(value) => selectFilter("companion", filters.companion === value ? "all" : value)} allLabel="전체" hideAll />
            <FilterGroup title="여행 스타일 다중 선택" values={["유명 관광지", "맛집", "카페", "현지 문화", "쇼핑", "자연", "액티비티", "휴양"]} selected={filters.styles} onSelect={toggleStyle} multiple />
            <div className={styles.filterGroup}><h3>일정 강도</h3><div className={styles.paceOptions}>{[["slow", "SLOW", "여유로운 일정"], ["balance", "BALANCE", "적당한 일정"], ["full", "FULL", "알찬 일정"]].map(([value, label, copy]) => <button className={filters.pace === value ? styles.selected : ""} type="button" key={value} onClick={() => selectFilter("pace", filters.pace === value ? "all" : value)}><b>{label}</b><span>{copy}</span></button>)}</div></div>
            <FilterGroup title="계절" values={["봄", "여름", "가을", "겨울"]} selected={filters.season} onSelect={(value) => selectFilter("season", filters.season === value ? "all" : value)} />
            <p className={styles.filterHelp}>계절은 등록된 계절 정보 또는 일정 시작일을 기준으로 합니다. 날짜·계절 정보가 없는 일정은 계절 선택 시 제외됩니다.</p>
            <footer><button type="button" onClick={resetFilters}>초기화</button><button type="button" onClick={() => setFilterOpen(false)}>여행지 {cityCards.length}곳 · 일정 {trips.length}개 보기</button></footer>
          </section>
        </div>
      )}
      {durationModal && (
        <div className={styles.durationBackdrop} role="presentation" onMouseDown={() => setDurationModal(null)}>
          <section
            className={styles.durationModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="duration-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className={styles.modalHandle} aria-hidden="true" />
            <p className={styles.modalBrand}>L:CODE</p>
            <h2 id="duration-modal-title">여행 일수를<br />선택해 주세요.</h2>
            <p className={styles.modalMessage}>{durationModal.city}에서 원하는 여행 기간을 골라보세요.</p>
            <div className={styles.durationChoices} role="radiogroup" aria-label={`${durationModal.city} 여행 일수 선택`}>
              {durationModal.trips.map((trip) => (
                <button
                  key={trip.id}
                  className={trip.id === selectedDurationId ? styles.durationChoiceActive : ""}
                  type="button"
                  role="radio"
                  aria-checked={trip.id === selectedDurationId}
                  onClick={() => setSelectedDurationId(trip.id)}
                >
                  <strong>{trip.duration}</strong>
                  <span>{trip.days.length} DAYS · {trip.title}</span>
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setDurationModal(null)}>닫기</button>
              {selectedDurationTrip && (
                <Link to={`/plan?trip=${encodeURIComponent(selectedDurationTrip.id)}`}>상세 일정 보기</Link>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function SearchQueryInput({ initialQuery }) {
  const [query, setQuery] = useState(initialQuery);
  return <input name="city" type="search" value={query} onChange={(event) => setQuery(event.target.value)}
    placeholder="여행지 또는 패키지를 검색하세요." aria-label="여행지 또는 패키지 검색" />;
}

function FilterGroup({ title, values, selected, onSelect, multiple = false, allLabel = "", hideAll = false }) {
  return <div className={styles.filterGroup}><h3>{title}</h3><div>{values.map((entry) => {
    const [value, explicitLabel] = Array.isArray(entry) ? entry : [entry, entry === "all" ? allLabel : entry];
    if (hideAll && value === "all") return null;
    const active = multiple ? selected.includes(value) : selected === value;
    return <button className={active ? styles.selected : ""} type="button" key={value} onClick={() => onSelect(value)}>{explicitLabel}</button>;
  })}</div></div>;
}
