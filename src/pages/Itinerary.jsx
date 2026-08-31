import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Itinerary.module.scss";
import MypageBackLink from "../components/MypageBackLink";
import { useAuth } from "../hooks/useAuth";
import { getPlans } from "../services/firestoreService";

const imageModules = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/Mypage-img/trv.png";
  const relativePath = imagePath.replace(/^img\//, "../assets/images/");
  const key = Object.keys(imageModules).find(
    (path) => path.toLowerCase() === relativePath.toLowerCase(),
  );
  return key ? imageModules[key] : "/Mypage-img/trv.png";
};

const getRepresentativeImage = (plan) => {
  const imagePath = plan.image || plan.days
    ?.flatMap((day) => day.items || [])
    .find((item) => item.type === "place" && item.image)
    ?.image;
  return getImageUrl(imagePath);
};

const getScheduleCount = (plan) => plan.days?.reduce(
  (total, day) => total + (day.items || []).filter((item) => item.type === "place").length,
  0,
) || 0;

const formatCardDate = (value) => value?.replaceAll("-", ".") || "날짜 미정";

const getDday = (startDate) => {
  if (!startDate) return "D-DAY";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return "D-DAY";
  const days = Math.ceil((start - today) / 86400000);
  if (days === 0) return "D-DAY";
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
};

export default function Itinerary() {
  const { user } = useAuth();
  const [planState, setPlanState] = useState({ userId: null, plans: [] });
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (!user) return undefined;

    let active = true;
    getPlans(user.uid)
      .then((savedPlans) => {
        if (!active) return;
        setPlanState({ userId: user.uid, plans: savedPlans });
        setSlideIndex(0);
      })
      .catch(() => active && setPlanState({ userId: user.uid, plans: [] }));

    return () => {
      active = false;
    };
  }, [user]);

  const loading = Boolean(user && planState.userId !== user.uid);
  const plans = user && planState.userId === user.uid ? planState.plans : [];
  const moveSlide = (direction) => {
    if (plans.length < 2) return;
    setSlideIndex((current) => (current + direction + plans.length) % plans.length);
  };

  const currentPlan = plans[slideIndex];
  const cardTitle = currentPlan
    ? `${currentPlan.title?.replace(" 일정", "") || currentPlan.city || "나의 여행"}${currentPlan.duration && !currentPlan.title?.includes(currentPlan.duration) ? ` ${currentPlan.duration}` : ""}`
    : "아직 일정이 없어요";
  const startDate = currentPlan?.dateRange?.start;
  const endDate = currentPlan?.dateRange?.end;

  return (
    <main className={styles.itinerary}>
      <div className={styles.content}>
        <section className={styles.intro} aria-labelledby="upcoming-trip-title">
          <MypageBackLink />
          <p className={styles.eyebrow}>MY JOURNEY</p>
          <div className={styles.titleRow}>
            <h1 id="upcoming-trip-title">UPCOMING<br />TRIP</h1>
          </div>
          <div className={styles.divider} />
          <p className={styles.description}>다음 여행을 위해 저장해둔 장소</p>

          <div className={styles.quickCards}>
            <article className={styles.countCard}>
              <h2>D-Day<br />count</h2>
              <p>가장 가까운 일정을<br />쉽게 볼 수 있어요.</p>
            </article>
            <article className={styles.packingCard}>
              <p>챙길 물건도 빠지지 않게<br />가져갈 수 있어요.</p>
              <h2>Packing<br />List</h2>
            </article>
          </div>
        </section>

        {loading ? (
          <section className={styles.emptyState} aria-live="polite">일정을 확인하고 있어요.</section>
        ) : currentPlan ? (
          <section className={styles.tripArea} aria-label="다가오는 여행">
            {plans.length > 1 && <button className={`${styles.arrow} ${styles.previous}`} type="button" aria-label="이전 여행" onClick={() => moveSlide(-1)}>&lsaquo;</button>}
            <article className={styles.tripCard}>
              <div className={styles.photo} style={{ backgroundImage: `url(${getRepresentativeImage(currentPlan)})` }} aria-hidden="true">
                <span>{getDday(startDate)}</span>
              </div>
              <div className={styles.tripInfo}>
                <h2>{cardTitle}</h2>
                <p className={styles.subtitle}>{currentPlan.city || "나만의"} 여행</p>
                <p className={styles.date}>{formatCardDate(startDate)} - {formatCardDate(endDate)}&nbsp; | &nbsp;{getScheduleCount(currentPlan)}개 일정</p>
                <Link className={styles.detailButton} to={`/travel-planner?trip=${encodeURIComponent(currentPlan.tripId)}`}>일정 상세 보기</Link>
              </div>
            </article>
            {plans.length > 1 && <button className={`${styles.arrow} ${styles.next}`} type="button" aria-label="다음 여행" onClick={() => moveSlide(1)}>&rsaquo;</button>}
          </section>
        ) : (
          <section className={styles.emptyState}>
            <span>NO UPCOMING TRIP</span>
            <h2>아직 정해진 일정이 없어요.</h2>
            <p>가고 싶은 도시를 발견하고<br />첫 여행 일정을 만들어 보세요.</p>
            <Link to="/search">여행지 둘러보기 <b>→</b></Link>
          </section>
        )}
      </div>
    </main>
  );
}
