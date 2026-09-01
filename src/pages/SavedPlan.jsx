import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getPlans } from "../services/firestoreService";
import tripRoad from "../data/trip_road.json";
import styles from "./SavedPlan.module.scss";

const images = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png,webp}", { eager: true, import: "default" });
const imageUrl = (path) => {
  if (!path) return "";
  const target = path.replace(/^img\//, "../assets/images/").toLowerCase();
  const key = Object.keys(images).find((item) => item.toLowerCase() === target);
  return key ? images[key] : "";
};
const planImage = (plan) => imageUrl(plan?.image || plan?.days?.flatMap((day) => day.items || []).find((item) => item.image)?.image);
const countSpots = (plan) => plan?.days?.reduce((sum, day) => sum + (day.items || []).filter((item) => item.type === "place").length, 0) || 0;
const formatDate = (date) => date?.replaceAll("-", ".") || "날짜 미정";
const dday = (date) => {
  if (!date) return "D-DAY";
  const diff = Math.ceil((new Date(`${date}T00:00:00`) - new Date().setHours(0, 0, 0, 0)) / 86400000);
  return diff > 0 ? `D-${diff}` : diff === 0 ? "D-DAY" : `D+${Math.abs(diff)}`;
};

export default function SavedPlan() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const savedId = params.get("id");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    getPlans(user.uid).then(setPlans).finally(() => setLoading(false));
  }, [user]);
  const saved = plans.find((plan) => plan.id === savedId) || plans[0];
  const others = plans.filter((plan) => plan.id !== saved?.id);
  const trending = useMemo(() => ["서울", "부산", "제주"].map((city) => tripRoad.trips.find((trip) => trip.city === city)).filter(Boolean), []);

  if (loading) return <main className={styles.status}>저장한 일정을 불러오고 있어요.</main>;
  if (!saved) return <main className={styles.status}>저장된 일정이 없습니다.</main>;

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>MY PLAN</p>
      <h1>SAVED<br />PLAN</h1>
      <article className={styles.heroCard} style={{ backgroundImage: `linear-gradient(180deg, transparent 30%, rgba(0,0,0,.78)), url(${planImage(saved)})` }}>
        <b>{dday(saved.dateRange?.start)}</b>
        <div><small>{formatDate(saved.dateRange?.start)} — {formatDate(saved.dateRange?.end).slice(5)}</small><h2>{saved.city?.toUpperCase()}</h2><p>{Math.max((saved.days?.length || 1) - 1, 0)} NIGHTS　·　{saved.days?.length || 0} DAYS　·　{countSpots(saved)} SPOTS</p></div>
        <footer><span>{saved.title}</span><Link to={`/travel-planner?plan=${saved.id}`}>일정 보기 →</Link></footer>
      </article>

      {others.length > 0 && <section className={styles.others}><p className={styles.eyebrow}>OTHER JOURNEYS</p>{others.map((plan) => <article key={plan.id}><span style={{ backgroundImage: `url(${planImage(plan)})` }} /><div><h2>{plan.title || `${plan.city} 여행`}</h2><p>나만의 여행</p><small>{formatDate(plan.dateRange?.start)} - {formatDate(plan.dateRange?.end).slice(5)} | {countSpots(plan)}개 일정</small><nav><Link to={`/plan?trip=${plan.tripId}`}>상세 보기</Link><Link to={`/travel-planner?plan=${plan.id}`}>일정 보기 →</Link></nav></div></article>)}</section>}

      <p className={styles.notice}>ⓘ　삭제한 일정은 복구할 수 없습니다.</p>
      <Link className={styles.newPlan} to="/search">＋　새로운 여행 일정 만들기</Link>

      <section className={styles.trending}><h2>요즘 뜨고 있는</h2><div>{trending.map((trip) => <Link to={`/plan?trip=${trip.id}`} key={trip.id}><span style={{ backgroundImage: `url(${imageUrl(trip.days.flatMap((day) => day.items).find((item) => item.image)?.image)})` }} /><small>CITY · ART & WALK</small><strong>{trip.city.toUpperCase()} {trip.city}</strong><p>{trip.title}</p><b>{trip.duration} · CITY</b></Link>)}</div></section>
    </main>
  );
}
