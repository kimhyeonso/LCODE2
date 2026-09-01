import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getPlans } from "../services/firestoreService";
import styles from "./MypageUser.module.scss";

const menuItems = [
  ["여행 주문 내역", "/itinerary"],
  ["상품 주문 내역", "/buy"],
  ["나의 리뷰", "/mystories"],
  ["찜한 상품", "/wishlist"],
  ["쿠폰함", "/coupon"],
  ["알림 설정", "/alarm"],
  ["고객센터", "/notice"],
];

const getCreatedTime = (plan) => plan.createdAt?.toMillis?.()
  || plan.createdAt?.seconds * 1000
  || 0;

const getDday = (startDate) => {
  if (!startDate) return "NEW";
  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return "NEW";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((start - today) / 86400000);
  if (days === 0) return "D-DAY";
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
};

export default function MypageUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [planState, setPlanState] = useState({ userId: null, plans: [] });
  const displayName = user.displayName || user.email?.split("@")[0] || "여행자";

  useEffect(() => {
    if (!user) return undefined;
    let active = true;

    getPlans(user.uid)
      .then((plans) => {
        if (!active) return;
        const sortedPlans = [...plans].sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
        setPlanState({ userId: user.uid, plans: sortedPlans });
      })
      .catch(() => active && setPlanState({ userId: user.uid, plans: [] }));

    return () => {
      active = false;
    };
  }, [user]);

  const plans = planState.userId === user.uid ? planState.plans : [];
  const latestPlan = plans[0];
  const planTitle = latestPlan?.title?.replace(" 일정", "") || latestPlan?.city || "추가한 일정 없음";
  const planPeriod = latestPlan?.dateRange?.start && latestPlan?.dateRange?.end
    ? `${latestPlan.dateRange.start} — ${latestPlan.dateRange.end}`
    : latestPlan?.duration || "여행 일정을 추가해 보세요";

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <main className={styles.mypageUser}>
      <div className={styles.content}>
        <section className={styles.profile} aria-labelledby="user-name">
          {/* <MypageBackLink /> */}
          <p className={styles.eyebrow}>MY L:CODE</p>
          <p className={styles.greeting}>안녕하세요,</p>
          <h1 id="user-name">{displayName} 님.</h1>
          <p className={styles.email}>{user.email}</p>
          <Link className={styles.edit} to="/profile/edit">회원정보 수정</Link>

          <nav className={styles.menuList} aria-label="마이페이지 메뉴">
            {menuItems.map(([label, to]) => (
              <Link key={label} to={to}>{label}<span aria-hidden="true">→</span></Link>
            ))}
            <button type="button" onClick={handleLogout}>로그아웃</button>
          </nav>
        </section>

        <section className={styles.summary} aria-label="나의 여행 요약">
          <article className={styles.upcoming}>
            <small>01</small>
            <strong>{latestPlan ? getDday(latestPlan.dateRange?.start) : "—"}</strong>
            <span>{latestPlan ? "MY TRIP" : "NO TRIP"}</span>
            <Link className={styles.cardLink} to={latestPlan ? "/itinerary" : "/search"} aria-label={latestPlan ? `${planTitle} 일정 보기` : "일정 검색하기"} />
          </article>
          <article className={styles.recent}>
            <small>02</small>
            <span>{latestPlan ? "RECENT PLAN" : "PLAN"}</span>
            <h2>{planTitle}</h2>
            <p>{planPeriod}</p>
            <Link className={styles.cardLink} to={latestPlan ? "/itinerary" : "/search"} aria-label={latestPlan ? `${planTitle} 일정 보기` : "일정 검색하기"} />
          </article>
          <article className={styles.saved}>
            <small>03</small>
            <span>PLACES SAVED</span>
            <strong>♥ 12</strong>
          </article>
          <article className={styles.stories}>
            <small>04</small>
            <span>STORIES</span>
            <strong>★ ★ ★ ★ ★<br />05</strong>
          </article>
        </section>
      </div>
    </main>
  );
}
