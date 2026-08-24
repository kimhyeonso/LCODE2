import styles from "./MyPageMain.module.scss";
import { Link } from "react-router-dom";

const completedTrips = [
  { city: "TOKYO", detail: "도쿄 4박 5일 · 골목 탐방" },
  { city: "SEOUL", detail: "서울 2박 3일 · 힙한 골목" },
  { city: "KYOTO", detail: "도쿄 4박 5일 · 골목 탐방" },
];

export default function MyPageMain() {
  return (
    <main className={styles.myPageMain}>
      <div className={styles.layout}>
        <section className={styles.upcoming} aria-labelledby="upcoming-title">
          <span className={styles.eyebrow}>MY JOURNEY</span>
          <h1 id="upcoming-title">UPCOMING<br />TRIP</h1>

          <article className={styles.featuredTrip}>
            <strong>D-14</strong>
            <h2>FUKUOKA</h2>
            <p>3 NIGHTS　·　4 DAYS　·　07 SPOTS　2026.08.17 — 08.20</p>
            <footer>
              <span>후쿠오카 · 맛집 · 카페 중심</span>
              <button type="button">일정 보기 →</button>
            </footer>
          </article>
        </section>

        <section className={styles.completed} aria-label="완료된 여행">
          {completedTrips.map((trip) => (
            <article className={styles.completedTrip} key={trip.city}>
              <div className={styles.thumbnail} aria-hidden="true" />
              <div>
                <span>COMPLETED · MAY 2026</span>
                <h2>{trip.city}</h2>
                <p>{trip.detail}<br />5 DAYS　12 SPOTS</p>
              </div>
            </article>
          ))}
        </section>
      </div>
      <nav className={styles.pageSwitcher} aria-label="페이지 미리보기">
        <Link to="/">main</Link>
        <Link to="/my">mypage</Link>
        <Link to="/login">login</Link>
        <Link to="/itinerary">itinerary</Link>
        <Link to="/wishlist">wishlist</Link>
        <Link to="/mystories">mystories</Link>
        <Link to="/coupon">coupon</Link>
        <Link to="/alarm">alarm</Link>
        <Link to="/notice">notice</Link>
        <Link to="/open-guide">open guide</Link>
      </nav>
    </main>
  );
}
