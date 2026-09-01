import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { deletePlan, getPlans } from "../services/firestoreService";
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
const updatedTime = (plan) => plan.updatedAt?.toMillis?.()
  || (plan.updatedAt?.seconds || 0) * 1000
  || plan.createdAt?.toMillis?.()
  || (plan.createdAt?.seconds || 0) * 1000
  || 0;
const dday = (date) => {
  if (!date) return "D-DAY";
  const diff = Math.ceil((new Date(`${date}T00:00:00`) - new Date().setHours(0, 0, 0, 0)) / 86400000);
  return diff > 0 ? `D-${diff}` : diff === 0 ? "D-DAY" : `D+${Math.abs(diff)}`;
};

const trendingCities = ["서울", "부산", "제주도", "도쿄", "오사카", "후쿠오카", "상하이", "베이징"];
const cityMeta = {
  서울: { english: "SEOUL", tag: "ART & WALK", copy: "건축과 예술이 만나는 도심 여행", image: "img/destinations/pexels/seoul.jpg" },
  부산: { english: "BUSAN", tag: "SEA & FOOD", copy: "바다와 시장을 함께 즐기는 여행", image: "img/destinations/pexels/busan.jpg" },
  제주도: { english: "JEJU", tag: "ISLAND & REST", copy: "오름과 해안을 천천히 걷는 여행", image: "img/destinations/pexels/jeju.jpg" },
  도쿄: { english: "TOKYO", tag: "CITY & TASTE", copy: "골목과 미식으로 만나는 대도시", image: "img/destinations/pexels/tokyo.jpg" },
  오사카: { english: "OSAKA", tag: "FOOD & NIGHT", copy: "맛과 야경이 이어지는 활기찬 여행", image: "img/destinations/pexels/osaka.jpg" },
  후쿠오카: { english: "FUKUOKA", tag: "CAFE & LOCAL", copy: "카페와 로컬 맛집 중심의 짧은 여행", image: "img/destinations/pexels/fukuoka.jpg" },
  상하이: { english: "SHANGHAI", tag: "CITY & RIVER", copy: "강변 야경과 오래된 골목을 걷는 여행", image: "img/destinations/pexels/shanghai.jpg" },
  베이징: { english: "BEIJING", tag: "HISTORY & CITY", copy: "역사와 현대 건축을 함께 만나는 여행", image: "img/destinations/pexels/beijing.jpg" },
};

export default function SavedPlan() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const savedId = params.get("id");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    if (!user) return;
    setLoadError("");
    getPlans(user.uid)
      .then((items) => setPlans([...items].sort((a, b) => updatedTime(b) - updatedTime(a))))
      .catch(() => setLoadError("저장한 일정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."))
      .finally(() => setLoading(false));
  }, [user]);
  const saved = plans.find((plan) => plan.id === savedId) || plans[0];
  const others = plans.filter((plan) => plan.id !== saved?.id);
  const trending = useMemo(() => {
    const savedCities = new Set(plans.map((plan) => plan.city));
    return trendingCities
      .filter((city) => !savedCities.has(city))
      .map((city) => tripRoad.trips.find((trip) => trip.city === city))
      .filter(Boolean)
      .slice(0, 4);
  }, [plans]);

  const removeDraft = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deletePlan(user.uid, deleteTarget.id);
      setPlans((current) => current.filter((plan) => plan.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleting(false);
      window.dispatchEvent(new Event("plans-changed"));
    } catch {
      setDeleting(false);
      setDeleteError("임시저장 일정을 삭제하지 못했습니다.");
    }
  };

  if (loading) return <main className={styles.status}>저장한 일정을 불러오고 있어요.</main>;
  if (loadError) return <main className={styles.status}><div><strong>일정을 불러올 수 없어요.</strong><p>{loadError}</p><Link to="/search">일정 검색으로 이동 →</Link></div></main>;
  if (!saved) return <main className={styles.status}><div><strong>저장된 일정이 없습니다.</strong><p>새로운 여행 일정을 찾아보세요.</p><Link to="/search">새 일정 만들기 →</Link></div></main>;

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>MY PLAN</p>
      <h1>SAVED<br />PLAN</h1>
      <article className={styles.heroCard} style={{ backgroundImage: `linear-gradient(180deg, transparent 30%, rgba(0,0,0,.78)), url(${planImage(saved)})` }}>
        <b>{dday(saved.dateRange?.start)}</b>
        <div><small>{formatDate(saved.dateRange?.start)} — {formatDate(saved.dateRange?.end).slice(5)}{saved.status === "draft" ? " · 작성 중" : ""}</small><h2>{saved.city?.toUpperCase()}</h2><p>{Math.max((saved.days?.length || 1) - 1, 0)} NIGHTS　·　{saved.days?.length || 0} DAYS　·　{countSpots(saved)} SPOTS</p></div>
        <footer><span>{saved.title}</span><nav>{saved.status === "draft" ? <><Link to={`/travel-planner?plan=${encodeURIComponent(saved.id)}`}>이어서 작성</Link><button type="button" onClick={() => setDeleteTarget(saved)}>삭제</button></> : <><Link to={`/plan?trip=${encodeURIComponent(saved.tripId)}&saved=${encodeURIComponent(saved.id)}`}>일정 확인</Link><Link to={`/travel-planner?plan=${encodeURIComponent(saved.id)}`}>수정하기 →</Link></>}</nav></footer>
      </article>

      {others.length > 0 && <section className={styles.others}><p className={styles.eyebrow}>OTHER JOURNEYS</p>{others.map((plan) => <article key={plan.id}><span style={{ backgroundImage: `url(${planImage(plan)})` }} /><div><h2>{plan.title || `${plan.city} 여행`}{plan.status === "draft" && <em>작성 중</em>}</h2><p>나만의 여행</p><small>{formatDate(plan.dateRange?.start)} - {formatDate(plan.dateRange?.end).slice(5)} | {countSpots(plan)}개 일정</small><nav>{plan.status === "draft" ? <><Link to={`/travel-planner?plan=${encodeURIComponent(plan.id)}`}>이어서 작성</Link><button type="button" onClick={() => setDeleteTarget(plan)}>삭제</button></> : <><Link to={`/plan?trip=${encodeURIComponent(plan.tripId)}&saved=${encodeURIComponent(plan.id)}`}>일정 확인</Link><Link to={`/travel-planner?plan=${encodeURIComponent(plan.id)}`}>수정하기 →</Link></>}</nav></div></article>)}</section>}

      <p className={styles.notice}>ⓘ　삭제한 일정은 복구할 수 없습니다.</p>
      <Link className={styles.newPlan} to="/search">＋　새로운 여행 일정 만들기</Link>

      {trending.length > 0 && <section className={styles.trending}><h2>요즘 뜨고 있는</h2><div>{trending.map((trip) => {
        const meta = cityMeta[trip.city];
        return <Link to={`/plan?trip=${encodeURIComponent(trip.id)}`} key={trip.id}><span style={{ backgroundImage: `url(${imageUrl(meta?.image || trip.days.flatMap((day) => day.items).find((item) => item.image)?.image)})` }} /><small>CITY · {meta?.tag || "LOCAL"}</small><strong>{meta?.english || trip.city} <em>{trip.city}</em></strong><p>{meta?.copy || trip.title}</p><b>{trip.duration} · {trip.country.toUpperCase()}</b></Link>;
      })}</div></section>}
      {deleteTarget && <div className={styles.deleteBackdrop} role="presentation" onMouseDown={() => !deleting && setDeleteTarget(null)}><section className={styles.deleteModal} role="dialog" aria-modal="true" aria-labelledby="draft-delete-title" onMouseDown={(event) => event.stopPropagation()}><p>DELETE DRAFT</p><h2 id="draft-delete-title">임시저장 일정을 삭제할까요?</h2><span>삭제한 일정은 복구할 수 없습니다.</span>{deleteError && <small role="alert">{deleteError}</small>}<div><button type="button" disabled={deleting} onClick={() => setDeleteTarget(null)}>취소</button><button type="button" disabled={deleting} onClick={removeDraft}>{deleting ? "삭제 중…" : "삭제하기"}</button></div></section></div>}
    </main>
  );
}
