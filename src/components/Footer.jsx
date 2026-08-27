import { Link, useLocation } from "react-router-dom";
import styles from "./Footer.module.scss";
export default function Footer() {
  const { pathname } = useLocation();

  if (pathname === "/login") return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.desktopBrand}>
        <strong>L:CODE</strong>
        <p>
          계획이 틀어져도,
          <br />
          여행은 계속된다.
        </p>
      </div>
      <div className={`${styles.links} ${styles.desktopLinks}`}>
        <Link to="/plan">여행 찾기</Link>
        <Link to="/travel-planner">AI 플래너</Link>
        <Link to="/plans">나의 일정</Link>
        <Link to="/contact">문의하기</Link>
      </div>
      <div className={`${styles.note} ${styles.desktopNote}`}>
        SEOUL, KOREA
        <br />© 2026 L:CODE
      </div>
      <div className={styles.mobileFooter}>
        <strong>L:CODE</strong>
        <p>당신의 여행 코드를 찾아주는 스마트한 여행 메이트</p>
        <nav aria-label="푸터 바로가기">
          <Link to="/plans">&gt; My Journey</Link>
          <Link to="/contact">&gt; Community</Link>
          <Link to="/saved">&gt; Wishlist</Link>
          <Link to="/my">&gt; My Page</Link>
        </nav>
        <div>
          <span>Team L:CODE</span>
          <small>본 웹 사이트는 학생용 포트폴리오 목적으로 제작되었습니다</small>
        </div>
      </div>
    </footer>
  );
}
