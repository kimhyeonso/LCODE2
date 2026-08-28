import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./MypageUser.module.scss";

const menuItems = [
  ["주문 내역", "/itinerary"],
  ["나의 리뷰", "/mystories"],
  ["찜한 상품", "/wishlist"],
  ["쿠폰함", "/coupon"],
  ["알림 설정", "/alarm"],
  ["고객센터", "/notice"],
];

export default function MypageUser() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user.displayName || user.email?.split("@")[0] || "여행자";

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <main className={styles.mypageUser}>
      <div className={styles.content}>
        <section className={styles.profile} aria-labelledby="user-name">
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
            <strong>D-14</strong>
            <span>MY TRIP</span>
          </article>
          <article className={styles.recent}>
            <small>02</small>
            <span>RECENT</span>
            <h2>TOKYO<br /><em>KYOTO</em></h2>
            <p>MAY 2026</p>
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
