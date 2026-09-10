import AiButton from "./AiButton";
import { useEffect, useState } from "react";
import styles from "./TopButton.module.scss";

const SHOW_AFTER_Y = 300;

const TopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SHOW_AFTER_Y);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
    <AiButton topVisible={isVisible} />
    <button
      type="button"
      className={`${styles.topButton} ${isVisible ? styles.visible : ""}`}
      onClick={scrollToTop}
      aria-label="맨 위로 이동"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M12 5l-7 7h4v7h6v-7h4z"
          fill="currentColor"
        />
      </svg>
    </button>
    </>
  );
};

export default TopButton;
