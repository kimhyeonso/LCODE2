import { Link } from "react-router-dom";
import styles from "./MypageBackLink.module.scss";

export default function MypageBackLink({ to = "/my", label = "마이페이지로 돌아가기" }) {
  return <Link className={styles.backLink} to={to} aria-label={label}><span aria-hidden="true">←</span></Link>;
}
