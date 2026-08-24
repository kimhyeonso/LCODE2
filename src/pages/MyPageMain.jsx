import { Link } from "react-router-dom";
import styles from "./MyPageMain.module.scss";

// image 경로를 카드마다 따로 넣습니다. 빈 문자열이면 회색 박스로 표시됩니다.
const completedTrips = [
  { city: "TOKYO", detail: "도쿄 4박 5일 · 골목 탐방", image: "/Mypage-img/1.png" },
  { city: "SEOUL", detail: "서울 2박 3일 · 힙한 골목", image: "/Mypage-img/4.png" },
  { city: "KYOTO", detail: "교토 4박 5일 · 고즈넉한 여행", image: "/Mypage-img/3.png" },
  { city: "BEIJING", detail: "베이징 3박 4일 · 광활한 여행", image: "/Mypage-img/5.png" },
];

// 이미지가 있는 경우에만 backgroundImage 스타일을 만들어 줍니다.
function imageStyle(image) {
  return image ? { backgroundImage: `url("${image}")` } : undefined;
}

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
            <p>3 NIGHTS · 4 DAYS · 07 SPOTS · 2026.08.17 - 08.20</p>
            <footer>
              <span>후쿠오카 · 맛집 · 카페 중심</span>
              <button type="button">일정 보기 →</button>
            </footer>
          </article>
        </section>

        <section className={styles.completed} aria-label="완료한 여행">
          {completedTrips.map((trip) => (
            <article className={styles.completedTrip} key={trip.city}>
              <div
                className={styles.thumbnail}
                style={imageStyle(trip.image)}
                aria-label={`${trip.city} 여행 이미지`}
              />
              <div className={styles.tripText}>
                <span>COMPLETED · MAY 2026</span>
                <h2>{trip.city}</h2>
                <p>{trip.detail}<br />5 DAYS · 12 SPOTS</p>
              </div>
            </article>
          ))}
        </section>
      </div>

      {/* 작업 중인 페이지를 빠르게 확인하기 위한 임시 메뉴입니다. */}
      <nav className={styles.pageSwitcher} aria-label="페이지 미리보기">
        <Link to="/">main</Link>
        <Link to="/my">mypage</Link>
        <Link to="/profile/edit">profile edit</Link>
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
