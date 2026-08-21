import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./Page.module.scss";
export default function MyPage() {
  const { user, logout } = useAuth();
  return (
    <main className={styles.page}>
      <header className={styles.title}>
        <span>MY / PRIVATE ARCHIVE</span>
        <h1>
          {user.displayName || "여행자"}님의
          <br />
          <i>마이페이지</i>
        </h1>
        <p>
          {user.email}
          <br />
          나만의 여행 기록을 관리하세요.
        </p>
      </header>
      <section className={styles.myGrid}>
        <Link to="/plans">
          <span>01</span>
          <h2>저장된 여행</h2>
          <p>만들고 저장한 여행 일정을 확인합니다.</p>
          <b>열기 →</b>
        </Link>
        <article>
          <span>02</span>
          <h2>찜한 장소</h2>
          <p>마음에 담아 둔 장소가 여기에 모입니다.</p>
          <b>준비 중</b>
        </article>
        <article>
          <span>03</span>
          <h2>주문 내역</h2>
          <p>여행 상품 주문과 결제 기록을 확인합니다.</p>
          <b>준비 중</b>
        </article>
      </section>
      <button className={styles.logout} onClick={logout}>
        로그아웃
      </button>
    </main>
  );
}
