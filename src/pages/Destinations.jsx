import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import styles from "./Destinations.module.scss";
import { resolveImageUrl as imageUrl } from "../utils/imageUtils";

const countryMap = { KOREA: "korea", JAPAN: "japan", CHINA: "china" };
const cityEnglish = {
  강릉: "GANGNEUNG", 거제: "GEOJE", 광저우: "GUANGZHOU", 다롄: "DALIAN",
  도쿄: "TOKYO", 베이징: "BEIJING", 부산: "BUSAN", 상하이: "SHANGHAI",
  서울: "SEOUL", 시안: "XI'AN", 여수: "YEOSU", 오사카: "OSAKA",
  "오사카·도쿄": "OSAKA · TOKYO", 장가계: "ZHANGJIAJIE", 제주도: "JEJU",
  청두: "CHENGDU", 충칭: "CHONGQING", 칭다오: "QINGDAO", 하얼빈: "HARBIN",
  항저우: "HANGZHOU", 홋카이도: "HOKKAIDO", 후쿠오카: "FUKUOKA",
};
const themes = {
  korea: ["CITY 01 · ART & WALK", "CITY"],
  japan: ["CITY 02 · TASTE & STREET", "LOCAL"],
  china: ["CITY 03 · RIVER & NATURE", "NATURE"],
};

const destinationImageFiles = {
  "\uAC15\uB989": "gangneung.jpg",
  "\uAC70\uC81C": "geoje.jpg",
  "\uAD11\uC800\uC6B0": "guangzhou.jpg",
  "\uB2E4\uB840": "dalian.jpg",
  "\uB3C4\uCFC4": "tokyo.jpg",
  "\uBCA0\uC774\uC9D5": "beijing.jpg",
  "\uBD80\uC0B0": "busan.jpg",
  "\uC0C1\uD558\uC774": "shanghai.jpg",
  "\uC11C\uC6B8": "seoul.jpg",
  "\uC2DC\uC548": "xian.jpg",
  "\uC5EC\uC218": "yeosu.jpg",
  "\uC624\uC0AC\uCE74": "osaka.jpg",
  "\uC624\uC0AC\uCE74\u00B7\uB3C4\uCFC4": "osaka-tokyo.jpg",
  "\uC7A5\uAC00\uACC4": "zhangjiajie.jpg",
  "\uC81C\uC8FC\uB3C4": "jeju.jpg",
  "\uCCAD\uB450": "chengdu.jpg",
  "\uCDA9\uCE6D": "chongqing.jpg",
  "\uCE6D\uB2E4\uC624": "qingdao.jpg",
  "\uD558\uC5BC\uBE48": "harbin.jpg",
  "\uD56D\uC800\uC6B0": "hangzhou.jpg",
  "\uD64B\uCE74\uC774\uB3C4": "hokkaido.jpg",
  "\uD6C4\uCFE0\uC624\uCE74": "fukuoka.jpg",
};

const tripImage = (trip) => imageUrl(trip.days
  .flatMap((day) => day.items)
  .find((item) => item.type === "place" && item.image)?.image);

const destinationImage = (trip) => {
  const fileName = destinationImageFiles[trip.city];
  return fileName
    ? imageUrl(`img/destinations/pexels/${fileName}`)
    : tripImage(trip);
};

const cityLabel = (city) => cityEnglish[city] ? `${cityEnglish[city]} ${city}` : city;
const tripDescription = (trip) => trip.title
  .replace(new RegExp(`^${trip.city}\\s*`), "")
  .replace(/\s*일정$/, "")
  .trim() || `${trip.city}에서 만나는 특별한 하루.`;

export default function Destinations() {
  const [params] = useSearchParams();
  const initial = countryMap[(params.get("country") || "").toUpperCase()] || "all";
  const [country, setCountry] = useState(initial);
  const trips = useMemo(() => {
    const unique = Array.from(tripRoad.trips.reduce((map, trip) => {
      if (!map.has(trip.city)) map.set(trip.city, trip);
      return map;
    }, new Map()).values());
    return country === "all" ? unique : unique.filter((trip) => trip.country === country);
  }, [country]);
  const feature = trips.find((trip) => trip.city === "구이린") || trips[4];

  return (
    <main className={styles.page}>
      <Link className={styles.back} to="/">← BACK</Link>
      <p className={styles.eyebrow}>DESTINATIONS</p>
      <h1>WHERE SHOULD<br />WE TRAVEL?</h1>
      <p className={styles.description}>어디로 떠나실 건가요?</p>
      <div className={styles.rule} />
      <p className={styles.prompt}>어디로 떠나볼까요?</p>
      <nav className={styles.tabs} aria-label="여행 국가">
        {[["all", "ALL"], ["korea", "KOREA"], ["japan", "JAPAN"], ["china", "CHINA"]].map(([value, label]) => (
          <button className={country === value ? styles.active : ""} type="button" key={value} onClick={() => setCountry(value)}>{label}</button>
        ))}
      </nav>
      <section className={styles.grid} aria-live="polite">
        {trips.map((trip, index) => (
          <div className={styles.cardSlot} key={trip.id}>
            {index === 4 && feature && (
              <Link className={styles.feature} to={`/plan?trip=${encodeURIComponent(feature.id)}`} style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.48), rgba(0,0,0,.08)), url(${destinationImage(feature)})` }}>
                <small>RIVER · KARST · 안개</small>
                <strong>{cityLabel(feature.city)}</strong>
                <p>{tripDescription(feature)}</p>
                <b>{feature.duration} · NATURE</b>
              </Link>
            )}
            <article className={styles.card}>
              <Link to={`/plan?trip=${encodeURIComponent(trip.id)}`}>
                <span className={styles.image} style={{ backgroundImage: `url(${destinationImage(trip)})` }} />
                <div>
                  <small>{themes[trip.country]?.[0]}</small>
                  <h2>{cityLabel(trip.city)}</h2>
                  <p>{tripDescription(trip)}</p>
                  <strong>{trip.duration} · {themes[trip.country]?.[1]}</strong>
                </div>
              </Link>
              <Link className={styles.add} to={`/plan?trip=${encodeURIComponent(trip.id)}`}>일정에 추가 &gt;</Link>
            </article>
          </div>
        ))}
      </section>
    </main>
  );
}
