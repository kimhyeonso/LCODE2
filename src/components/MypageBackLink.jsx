import { useNavigate } from "react-router-dom";
import styles from "./MypageBackLink.module.scss";

export default function MypageBackLink({ to = "/my", label = "마이페이지로 돌아가기" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate(to, { replace: true });
  };

  return (
    <button className={styles.backLink} type="button" onClick={handleBack} aria-label={label}>
      <span aria-hidden="true">←</span>
      BACK
    </button>
  );
}
