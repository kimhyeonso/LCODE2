import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BackButton from "../components/BackButton";
import tripRoad from "../data/trip_road.json";
import { useManagedCollection } from "../hooks/useManagedCollection";
import DesrinationThumnail from "../components/DesrinationThumnail";
import styles from "./DesrinationAll.module.scss";
import { resolveImageUrl } from "../utils/imageUtils";

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

// Plan.jsx의 대표 썸네일과 동일하게 assets/images 전체에서 찾는다 (Thumbnail-image 폴더 밖의 경로도 포함).
const getThumbnailImage = (imagePath) => resolveImageUrl(imagePath, "");

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

const DesrinationAll = () => {
  const managedTrips = useManagedCollection("packages", tripRoad.trips);
  const [params] = useSearchParams();
  const [durationModal, setDurationModal] = useState(null);
  const [selectedDurationId, setSelectedDurationId] = useState("");
  const requestedCountry = params.get("country")?.toLowerCase();
  const selectedCountry = countries.some(([value]) => value === requestedCountry)
    ? requestedCountry
    : "all";
  const filteredTrips = managedTrips.filter(
    (trip) => selectedCountry === "all" || trip.country === selectedCountry,
  );
  const cityCards = useMemo(() => Array.from(
    filteredTrips.reduce((groups, trip) => {
      const cityKey = `${trip.country}:${trip.city}`;
      const cityTrips = groups.get(cityKey) || [];
      cityTrips.push(trip);
      groups.set(cityKey, cityTrips);
      return groups;
    }, new Map()).values(),
  ).map((cityTrips) => ({
    trip: cityTrips[0],
    variants: [...cityTrips].sort((first, second) => first.days.length - second.days.length),
  })), [filteredTrips]);
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

  return (
    <main className={styles.page}>
      <BackButton className={styles.back} />

      <header className={styles.intro}>
        <p>DESTINATIONS</p>
        <h1>WHERE SHOULD<br />WE TRAVEL?</h1>
      </header>

      <section className={styles.packageSection}>
        <p className={styles.question}>어디로 떠나볼까요?</p>
        <nav className={styles.tabs} aria-label="국가 선택">
          {countries.map(([value, label]) => (
            <Link
              key={value}
              to={value === "all" ? "/desrinationAll" : `/desrinationAll?country=${value}`}
              className={selectedCountry === value ? styles.active : ""}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className={styles.cardList}>
          {cityCards.map(({ trip, variants }, index) => {
            const firstPlace = getFirstPlace(trip);
            const image = getTripImage(trip, index);
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
                onTripClick={hasDurationOptions ? (event) => {
                  event.preventDefault();
                  openDurationModal(variants);
                } : undefined}
                actionLabel={hasDurationOptions ? "여행 일수 선택 >" : undefined}
                scheduleSummary={scheduleSummary}
              />
            );
          })}
        </div>
      </section>
      {durationModal && (
        <div className={styles.durationBackdrop} role="presentation" onMouseDown={() => setDurationModal(null)}>
          <section
            className={styles.durationModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="destination-duration-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className={styles.modalHandle} aria-hidden="true" />
            <p className={styles.modalBrand}>L:CODE</p>
            <h2 id="destination-duration-modal-title">여행 일수를<br />선택해 주세요.</h2>
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
};

export default DesrinationAll;
