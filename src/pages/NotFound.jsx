import { Link } from "react-router-dom";
import styles from "./Page.module.scss";
export default function NotFound() {
  return (
    <main className={styles.notFound}>
      <b>404</b>
      <h1>이 길에는 여행이 없어요.</h1>
      <Link to="/">홈으로 돌아가기 →</Link>
    </main>
  );
}
