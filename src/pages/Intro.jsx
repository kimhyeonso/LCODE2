import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Intro.module.scss";
import logoWhite from "../assets/images/logo-white.png";

export default function Intro({ onComplete }) {
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef(null);
  const completeTimerRef = useRef(null);

  const finishIntro = useCallback(() => {
    window.clearTimeout(closeTimerRef.current);
    window.clearTimeout(completeTimerRef.current);
    setClosing(true);
    completeTimerRef.current = window.setTimeout(() => onComplete?.(), 800);
  }, [onComplete]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeTimerRef.current = window.setTimeout(() => setClosing(true), 2600);
    completeTimerRef.current = window.setTimeout(() => onComplete?.(), 3400);

    return () => {
      window.clearTimeout(closeTimerRef.current);
      window.clearTimeout(completeTimerRef.current);
      document.body.style.overflow = previousOverflow;
    };
  }, [onComplete]);

  return (
    <main className={`${styles.intro} ${closing ? styles.introClosing : ""}`}>
      <video
        className={styles.backgroundVideo}
        src="/Mypage-img/train.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <span className={styles.overlay} aria-hidden="true" />
      <div className={styles.introContent}>
        <p className={styles.topCopy}>TRAVEL,<br />CURATED.</p>
        <img className={styles.logo} src={logoWhite} alt="L:CODE" />
        <span className={styles.line} aria-hidden="true" />
        <p className={styles.bottomCopy}>FIND YOUR NEXT JOURNEY.</p>
      </div>
      <button className={styles.skipButton} type="button" onClick={finishIntro}>
        SKIP
      </button>
    </main>
  );
}
