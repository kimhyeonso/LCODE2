import { useNavigate } from "react-router-dom";
import styles from "./BackButton.module.scss";

export default function BackButton({ className = "", label = "이전 페이지로 돌아가기", tone = "default", to, ...props }) {
  const navigate = useNavigate();
  const classes = [styles.backButton, tone === "light" ? styles.light : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...props} className={classes} type="button" onClick={() => navigate(to || -1)} aria-label={label}>
      <span aria-hidden="true">←</span>
      BACK
    </button>
  );
}
