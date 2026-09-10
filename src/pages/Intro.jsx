import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Intro.module.scss";
import introVideo from "../assets/images/intro/introPC.mp4";
import bookImage from "../assets/images/intro/background02.png";
import resultBackground from "../assets/images/intro/background03.png";
import IntroRunawayButton from "../components/IntroRunawayButton";

export default function Intro({ onComplete }) {
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const headingRef = useRef(null);
  const [runawayDisappeared, setRunawayDisappeared] = useState(false);
  const [stage, setStage] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "choose" : "video",
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (stage !== "video") {
      headingRef.current?.focus({ preventScroll: true });
      return;
    }
    let active = true;
    const playback = videoRef.current?.play();
    playback?.catch(() => { if (active) setStage("choose"); });
    return () => { active = false; };
  }, [stage]);

  const enter = (path) => {
    navigate(path);
    onComplete?.();
  };

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.intro} ${stage === "choose" ? styles.magazineStage : ""}`}
      aria-label="L:CODE 여행 시작"
      onCancel={(event) => {
        event.preventDefault();
        if (stage === "video") setStage("choose");
        else onComplete?.();
      }}
    >
      {stage === "video" ? (
        <>
          <video
            ref={videoRef}
            className={styles.video}
            src={introVideo}
            autoPlay muted playsInline preload="auto"
            aria-label="L:CODE 인트로 영상"
            onEnded={() => setStage("choose")}
            onError={() => setStage("choose")}
          />
          <button className={styles.skip} type="button" onClick={() => setStage("choose")}>
            영상 건너뛰기 →
          </button>
        </>
      ) : stage === "choose" ? (
        <>
          <div className={styles.book}>
            <img className={styles.bookImage} src={bookImage} alt="해안 여행 사진으로 꾸며진 L:CODE 여행 매거진" />
            <div className={styles.copy}>
              <h1 ref={headingRef} tabIndex={-1}>이번 여행,<br />어떻게 시작할까요?</h1>
              <div className={styles.imageChoices}>
                <button className={styles.plan} aria-label="계획부터 세워볼래" type="button" onClick={() => setStage("planned")}>
                  <span className={styles.planLabel}>계획부터 세워볼래</span>
                </button>
                <IntroRunawayButton onDisappear={() => setRunawayDisappeared(true)} />
              </div>
            </div>
          </div>
          <button className={styles.close} type="button" onClick={() => onComplete?.()}>닫기 ×</button>
        </>
      ) : (
        <>
          <div className={styles.result}>
            <img className={styles.resultBackground} src={resultBackground} alt="" aria-hidden="true" />
            <div className={styles.resultCopy}>
              <h1 ref={headingRef} tabIndex={-1}>
                {!runawayDisappeared && <>역시,<br /></>}
                {runawayDisappeared ? "역시 계획이시군요." : "계획적인 분이시네요."}
              </h1>
              <p>{runawayDisappeared
                ? "처음부터 그러실 줄 알았어요."
                : "충분히 고민하고 선택하신 취향을 존중합니다."}</p>
              <small className={styles.resultAside}>다른 선택지는 자유를 찾아 떠났습니다.</small>
              <button
                className={styles.resultButton}
                type="button"
                onClick={() => enter("/")}
              >
                직접 고르신 계획, 시작해볼까요? <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
          <button className={styles.close} type="button" onClick={() => onComplete?.()}>닫기 ×</button>
        </>
      )}
    </dialog>
  );
}
