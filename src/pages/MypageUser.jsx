import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useShop } from "../hooks/useShop";
import { getFavoriteTrips, getPlans } from "../services/firestoreService";
import MypageBackLink from "../components/MypageBackLink";
import styles from "./MypageUser.module.scss";

const menuItems = [
  ["여행 주문 내역", "/itinerary"], ["상품 주문 내역", "/buy"],
  ["내 일정", "/plan/saved"], ["나의 리뷰", "/mystories"],
  ["찜한 상품", "/saved"], ["찜한 일정", "/wishlist"], ["찜한 장소", "/favorite-places"],
  ["쿠폰함", "/coupon"], ["알림 설정", "/alarm"], ["고객센터", "/notice"],
];
const slideshowImages = ["3.png", "4.png", "5.png", "6.png"];

const getCreatedTime = (plan) => plan.updatedAt?.toMillis?.()
  || plan.updatedAt?.seconds * 1000 || plan.createdAt?.toMillis?.()
  || plan.createdAt?.seconds * 1000 || 0;

const getDday = (startDate) => {
  if (!startDate) return "D-DAY";
  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return "D-DAY";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((start - today) / 86400000);
  if (days === 0) return "D-DAY";
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
};

export default function MypageUser() {
  const { user, logout } = useAuth();
  const { saved: savedProducts } = useShop();
  const navigate = useNavigate();
  const [planState, setPlanState] = useState({ userId: null, plans: [] });
  const [slideIndex, setSlideIndex] = useState(0);
  const [favoriteTripCount, setFavoriteTripCount] = useState(0);
  const displayName = user.displayName || user.email?.split("@")[0] || "여행자";

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    getPlans(user.uid).then((plans) => {
      if (!active) return;
      const sortedPlans = [...plans].sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
      setPlanState({ userId: user.uid, plans: sortedPlans });
    }).catch(() => active && setPlanState({ userId: user.uid, plans: [] }));
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    const loadFavoriteTrips = () => getFavoriteTrips(user.uid)
      .then((ids) => active && setFavoriteTripCount(ids.length))
      .catch(() => active && setFavoriteTripCount(0));
    loadFavoriteTrips();
    window.addEventListener("favorite-trips-changed", loadFavoriteTrips);
    return () => {
      active = false;
      window.removeEventListener("favorite-trips-changed", loadFavoriteTrips);
    };
  }, [user]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % slideshowImages.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  const plans = planState.userId === user.uid ? planState.plans : [];
  const latestPlan = plans[0];
  const planTitle = latestPlan?.title?.replace(" 일정", "") || latestPlan?.city || "NO UPCOMING TRIP";
  const planPeriod = latestPlan?.dateRange?.start && latestPlan?.dateRange?.end
    ? `${latestPlan.dateRange.start} — ${latestPlan.dateRange.end}`
    : latestPlan?.duration || "여행 일정을 추가해 보세요";
  const latestPlanLink = latestPlan?.status === "draft"
    ? `/travel-planner?plan=${encodeURIComponent(latestPlan.id)}`
    : latestPlan
      ? `/plan?trip=${encodeURIComponent(latestPlan.tripId || "")}&saved=${encodeURIComponent(latestPlan.id)}`
      : "/search";
  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <main className={styles.mypageUser}>
      <div className={styles.content}>
        <section className={styles.profile} aria-labelledby="user-name">
          <p className={styles.greeting}>안녕하세요,</p>
          <h1 id="user-name">{displayName}</h1>
          <p className={styles.email}>{user.email}</p>
          <Link className={styles.edit} to="/profile/edit">회원정보 수정</Link>
        </section>

        <section className={styles.dashboard} aria-label="나의 여행 대시보드">
          <div className={styles.heroVisual}><p>We meet again,<br />traveler.</p></div>
          <div className={styles.summary} aria-label="나의 여행 요약">
            <article className={styles.upcoming}>
              <div className={styles.upcomingSlideshow} aria-hidden="true">
                {slideshowImages.map((image, index) => (
                  <img className={index === slideIndex ? styles.activeSlide : ""} key={image}
                    src={`/Mypage-img/${image}`} alt="" decoding="async" />
                ))}
              </div>
              <small>01</small>
              <strong>{latestPlan ? getDday(latestPlan.dateRange?.start) : "—"}</strong>
              <span>{latestPlan ? "MY TRIP" : "NO TRIP"}</span>
              <Link className={styles.cardLink} to={latestPlanLink}
                aria-label={latestPlan ? `${planTitle} 일정 보기` : "일정 검색하기"} />
            </article>
            <article className={styles.recent}>
              <small>02</small><span>{latestPlan ? "RECENT PLAN" : "PLAN"}</span>
              <h2>{planTitle}</h2><p>{planPeriod}</p>
              <Link className={styles.cardLink} to={latestPlanLink}
                aria-label={latestPlan ? `${planTitle} 일정 보기` : "일정 검색하기"} />
            </article>
            <article className={styles.saved}>
              <small>03</small><span>PRODUCTS SAVED</span><strong>♥ {savedProducts.length}</strong>
              <Link className={styles.cardLink} to="/saved" aria-label="찜한 상품 보기" />
            </article>
            <article className={styles.stories}>
              <small>04</small><span>TRIPS SAVED</span><strong>♥ {favoriteTripCount}</strong>
              <Link className={styles.cardLink} to="/wishlist" aria-label="찜한 일정 보기" />
            </article>
          </div>
        </section>

        <nav className={styles.menuList} aria-label="마이페이지 메뉴">
          {menuItems.map(([label, to]) => (
            <Link key={label} to={to}>{label}<span aria-hidden="true">→</span></Link>
          ))}
          <button type="button" onClick={handleLogout}>로그아웃</button>
        </nav>
      </div>
    </main>
  );
}
