import BackButton from "./BackButton";
import styles from "./MypageBackLink.module.scss";

export default function MypageBackLink({ label = "이전 페이지로 돌아가기", to }) {
  return <BackButton data-mypage-back className={styles.backLink} label={label} to={to} />;
}
