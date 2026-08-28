import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import { useCurrentWeather } from "../hooks/useCurrentWeather";
import travelIcon from "../assets/icons/transportation/travel.svg";
import diningIcon from "../assets/icons/dining.svg";
import carIcon from "../assets/icons/transportation/directions_car.svg";
import styles from "./Plan.module.scss";

const imageModules = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png,webp}", { eager: true, import: "default" });

const categoryNames = { airport: "AIRPORT", station: "STATION", hotel: "HOTEL", attraction: "SIGHTSEEING", restaurant: "RESTAURANT" };

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  const relativePath = imagePath.replace(/^img\//, "../assets/images/");
  const key = Object.keys(imageModules).find((path) => path.toLowerCase() === relativePath.toLowerCase());
  return key ? imageModules[key] : "";
};

const formatDate = (date, fallback) => {
  if (!date) return fallback;
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return fallback;
  const month = value.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const weekday = value.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  return `${month} ${String(value.getDate()).padStart(2, "0")} / ${weekday}`;
};

const getDayPlaces = (day) => day.items.reduce((result, item, index, items) => {
  if (item.type !== "place") return result;
  const transport = items[index + 1]?.type === "transport" ? items[index + 1].transport : "";
  result.push({ ...item, transport, imageUrl: getImageUrl(item.image) });
  return result;
}, []);

export default function Plan() {
  const [params] = useSearchParams();
  const selectedTrip = useMemo(() => {
    const tripId = params.get("trip");
    return tripRoad.trips.find((trip) => trip.id === tripId)
      || tripRoad.trips.find((trip) => trip.city === "후쿠오카")
      || tripRoad.trips[0];
  }, [params]);
  const [activeDay, setActiveDay] = useState(0);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const weather = useCurrentWeather(selectedTrip.city, selectedTrip.country);
  const allPlaces = selectedTrip.days.flatMap(getDayPlaces);
  const activePlaces = getDayPlaces(selectedTrip.days[activeDay]);
  const heroImage = allPlaces.find((place) => place.imageUrl)?.imageUrl;
  const nights = Math.max(selectedTrip.days.length - 1, 1);
  const startDate = selectedTrip.dateRange?.start;
  const endDate = selectedTrip.dateRange?.end;

  return (
    <main className={styles.plan}>
      <section className={styles.hero} style={heroImage ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.7)), url(${heroImage})` } : undefined}>
        <div className={styles.heroTop}><span>TRAVEL PLAN</span><span>{selectedTrip.country.toUpperCase()} / ISSUE 01</span></div>
        <p className={styles.heroTags}>{selectedTrip.duration} · 맛집 · 카페</p>
        <p className={styles.heroWeather}>
          <b>{weather.loading ? "--" : weather.temperature ?? "--"}°C</b><span>·</span>
          <span>{weather.error ? "WEATHER" : weather.label}</span><span>·</span>
          <span>{startDate && endDate ? `${startDate.slice(5).replace("-", "/")}–${endDate.slice(5).replace("-", "/")}` : selectedTrip.duration}</span>
        </p>
      </section>

      <section className={styles.intro}>
        <h1>{selectedTrip.title.replace(" 일정", "").replace(", ", ",\n")}</h1>
        <p>맛집과 카페를 중심으로<br />천천히 걷는 여행</p>
        <dl className={styles.stats}>
          <div><dt>{String(nights).padStart(2, "0")}</dt><dd>NIGHTS</dd></div>
          <div><dt>{String(selectedTrip.days.length).padStart(2, "0")}</dt><dd>DAYS</dd></div>
          <div><dt>{String(allPlaces.length).padStart(2, "0")}</dt><dd>SPOTS</dd></div>
        </dl>
      </section>

      <section className={styles.points}>
        <h2>이 일정의 포인트</h2>
        <div>
          <p><img src={travelIcon} alt="" /><strong>공항 접근성</strong></p>
          <p><img src={diningIcon} alt="" /><strong>맛집 중심</strong></p>
          <p><img src={carIcon} alt="" /><strong>도심 이동 거리</strong></p>
        </div>
      </section>

      <div className={styles.visualBreak} aria-hidden="true" />

      <section className={styles.itinerary}>
        <header className={styles.dayHeader}>
          <h2>DAY {String(activeDay + 1).padStart(2, "0")}</h2>
          <span>{formatDate(selectedTrip.days[activeDay]?.date, `DAY ${activeDay + 1}`)}</span>
          <b>{activePlaces.length}곳</b>
        </header>
        <ol className={styles.timeline}>
          {activePlaces.map((place, index) => (
            <li key={`${place.place}-${index}`}>
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <time>{place.time || "시간 미정"}</time>
              <span className={styles.placeImage}>{place.imageUrl && <img src={place.imageUrl} alt="" />}</span>
              <div className={styles.placeCopy}>
                <small>{categoryNames[place.category] || place.category}</small>
                <strong>{place.place}</strong>
                <p>{place.recommendation || place.place}</p>
              </div>
              <button type="button" aria-label={`${place.place} 메뉴`}>···</button>
              {place.transport && <p className={styles.transport}>{place.transport}</p>}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.otherDays}>
        <p>OTHER DAYS</p>
        {selectedTrip.days.map((day, index) => {
          if (index === activeDay) return null;
          return (
            <button type="button" key={day.day} onClick={() => setActiveDay(index)}>
              <strong>DAY {String(index + 1).padStart(2, "0")}</strong>
              <span>{formatDate(day.date, `DAY ${index + 1}`)}</span>
              <b>{getDayPlaces(day).length}곳　›</b>
            </button>
          );
        })}
      </section>

      <div className={styles.saveArea}>
        <button type="button" onClick={() => setIsSavedOpen(true)}>내 일정에 담기</button>
      </div>

      {isSavedOpen && (
        <div className={styles.savedBackdrop} role="presentation" onMouseDown={() => setIsSavedOpen(false)}>
          <section
            className={styles.savedModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="saved-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsSavedOpen(false);
            }}
          >
            <span className={styles.modalHandle} aria-hidden="true" />
            <p className={styles.modalBrand}>L:CODE</p>
            <h2 id="saved-modal-title">일정 담기 성공!</h2>
            <p className={styles.modalMessage}>추천 일정이<br />내 여행에 저장되었습니다.</p>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setIsSavedOpen(false)}>닫기</button>
              <Link to={`/travel-planner?trip=${encodeURIComponent(selectedTrip.id)}`}>일정 보기</Link>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
