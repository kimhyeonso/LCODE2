import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Itinerary.module.scss";
import MypageBackLink from "../components/MypageBackLink";
import { useAuth } from "../hooks/useAuth";
import { deletePlan, getPlans } from "../services/firestoreService";
import { resolveImageUrl } from "../utils/imageUtils";

const getImageUrl = (imagePath) => resolveImageUrl(imagePath, "/Mypage-img/trv.png");

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
const getCardTitle = (plan) => `${plan.title?.replace(" 일정", "") || plan.city || "나의 여행"}${plan.duration && !plan.title?.includes(plan.duration) ? ` ${plan.duration}` : ""}`;

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

const getCreatedTime = (plan) => plan.updatedAt?.toMillis?.()
  || plan.updatedAt?.seconds * 1000
  || plan.createdAt?.toMillis?.()
  || plan.createdAt?.seconds * 1000
  || 0;

export default function Itinerary() {
  const { user } = useAuth();
  const [planState, setPlanState] = useState({ userId: null, plans: [] });
  const [slideIndex, setSlideIndex] = useState(0);
  const [deleteState, setDeleteState] = useState({ planId: null, error: "" });

  useEffect(() => {
    if (!user) return undefined;

    let active = true;
    getPlans(user.uid)
      .then((savedPlans) => {
        if (!active) return;
        const sortedPlans = [...savedPlans].sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
        setPlanState({ userId: user.uid, plans: sortedPlans });
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

  const handleDeletePlan = async () => {
    if (!currentPlan || deleteState.planId) return;
    if (!window.confirm(`「${currentPlan.title || currentPlan.city || "선택한 일정"}」을 삭제할까요?`)) return;

    setDeleteState({ planId: currentPlan.id, error: "" });
    try {
      await deletePlan(user.uid, currentPlan.id);
      const remainingPlans = plans.filter((plan) => plan.id !== currentPlan.id);
      setPlanState({ userId: user.uid, plans: remainingPlans });
      window.dispatchEvent(new Event("plans-changed"));
      setSlideIndex((current) => Math.min(current, Math.max(remainingPlans.length - 1, 0)));
      setDeleteState({ planId: null, error: "" });
    } catch (error) {
      console.error("일정 삭제 실패:", error);
      const message = error?.code === "permission-denied"
        ? "일정을 삭제할 권한이 없습니다. Firebase 보안 규칙을 확인해 주세요."
        : "일정을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.";
      setDeleteState({ planId: null, error: message });
    }
  };

  const currentPlan = plans[slideIndex];
  const cardTitle = currentPlan ? getCardTitle(currentPlan) : "아직 일정이 없어요";
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

        </section>

        {loading ? (
          <section className={styles.emptyState} aria-live="polite">일정을 확인하고 있어요.</section>
        ) : currentPlan ? (
          <>
          <section className={styles.tripArea} aria-label="다가오는 여행">
            <button className={`${styles.arrow} ${styles.previous}`} type="button" aria-label="이전 여행" disabled={plans.length < 2} onClick={() => moveSlide(-1)}>&lsaquo;</button>
            <article className={styles.tripCard}>
              <div className={styles.photo} style={{ backgroundImage: `url(${getRepresentativeImage(currentPlan)})` }} aria-hidden="true">
                <span>{getDday(startDate)}</span>
              </div>
              <div className={styles.tripInfo}>
                <p className={styles.planLocation}>{currentPlan.city || "MY TRIP"} · {currentPlan.country || "KOREA"}</p>
                <h2>{cardTitle}</h2>
                <p className={styles.subtitle}>{currentPlan.city || "나만의"} 여행</p>
                <p className={styles.date}>{formatCardDate(startDate)} - {formatCardDate(endDate)}&nbsp; | &nbsp;{getScheduleCount(currentPlan)}개 일정</p>
                <Link className={styles.detailButton} to={`/travel-planner?plan=${encodeURIComponent(currentPlan.id)}`}>일정 상세 보기 / 수정</Link>
                <button className={styles.deleteButton} type="button" onClick={handleDeletePlan} disabled={deleteState.planId === currentPlan.id}>
                  {deleteState.planId === currentPlan.id ? "삭제하고 있어요…" : "일정 삭제"}
                </button>
                {deleteState.error && <p className={styles.deleteError} role="alert">{deleteState.error}</p>}
              </div>
            </article>
            <button className={`${styles.arrow} ${styles.next}`} type="button" aria-label="다음 여행" disabled={plans.length < 2} onClick={() => moveSlide(1)}>&rsaquo;</button>
          </section>
          <section className={styles.mobileTripList} aria-label="저장된 여행 일정 목록">
            {plans.map((plan) => {
              const mobileStartDate = plan.dateRange?.start;
              const mobileEndDate = plan.dateRange?.end;
              return (
                <article className={styles.tripCard} key={plan.id}>
                  <div className={styles.photo} style={{ backgroundImage: `url(${getRepresentativeImage(plan)})` }} aria-hidden="true">
                    <span>{getDday(mobileStartDate)}</span>
                  </div>
                  <div className={styles.tripInfo}>
                    <h2>{getCardTitle(plan)}</h2>
                    <p className={styles.subtitle}>{plan.city || "나만의"} 여행</p>
                    <p className={styles.date}>{formatCardDate(mobileStartDate)} - {formatCardDate(mobileEndDate)} | {getScheduleCount(plan)}개 일정</p>
                    <Link className={styles.detailButton} to={`/travel-planner?trip=${encodeURIComponent(plan.tripId)}`}>일정 상세 보기</Link>
                  </div>
                </article>
              );
            })}
          </section>
          </>
        ) : (
          <section className={`${styles.tripArea} ${styles.emptyState}`} aria-label="다가오는 여행 없음">
            <article className={styles.tripCard}>
              <div className={`${styles.photo} ${styles.emptyPhoto}`} aria-hidden="true">
                <span>NO TRIP</span>
              </div>
              <div className={`${styles.tripInfo} ${styles.emptyInfo}`}>
                <p className={styles.emptyEyebrow}>NO UPCOMING TRIP</p>
                <h2>아직 정해진 일정이 없어요.</h2>
                <p className={styles.emptyDescription}>가고 싶은 도시를 발견하고<br />첫 여행 일정을 만들어 보세요.</p>
                <Link className={styles.detailButton} to="/search">여행지 둘러보기 <b>→</b></Link>
              </div>
            </article>
          </section>
        )}

        <div className={styles.quickCards}>
          <article className={styles.countCard}>
            <h2>D-Day<br />count</h2>
            <p>가장 가까운 일정을<br />쉽게 볼 수 있어요.</p>
            <Link
              className={styles.quickCardAction}
              to={currentPlan ? `/travel-planner?trip=${encodeURIComponent(currentPlan.tripId)}` : "/search"}
              aria-label={currentPlan ? "가장 가까운 일정 상세 보기" : "여행 일정 만들기"}
            >→</Link>
          </article>
          <article className={styles.packingCard}>
            <p>챙길 물건도 빠지지 않게<br />가져갈 수 있어요.</p>
            <h2>Packing<br />List</h2>
            <Link className={styles.quickCardAction} to="/paking" aria-label="패킹 리스트 보기">→</Link>
          </article>
        </div>
      </div>
    </main>
  );
}
