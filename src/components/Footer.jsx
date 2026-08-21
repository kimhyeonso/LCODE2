import { Link } from "react-router-dom";
import styles from "./Footer.module.scss";
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        <strong>L:CODE</strong>
        <p>
          계획이 틀어져도,
          <br />
          여행은 계속된다.
        </p>
      </div>
      <div className={styles.links}>
        <Link to="/products">여행 찾기</Link>
        <Link to="/travel-planner">AI 플래너</Link>
        <Link to="/plans">나의 일정</Link>
        <Link to="/contact">문의하기</Link>
      </div>
      <div className={styles.note}>
        SEOUL, KOREA
        <br />© 2026 L:CODE
      </div>
    </footer>
  );
}
