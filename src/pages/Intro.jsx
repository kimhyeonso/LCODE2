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
                <IntroRunawayButton onChoose={() => setStage("spontaneous")} />
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
                좋아요.<br />
                {stage === "planned" ? "나만의 여행 코드를 만들어볼까요?" : "계획 없이 떠나는 것도 여행이니까요."}
              </h1>
              <p>{stage === "planned"
                ? "취향에 맞는 여행을 고르고, 내 방식대로 일정을 완성해보세요."
                : "지금 끌리는 장소부터 가볍게 찾아볼까요?"}</p>
              <button
                className={styles.resultButton}
                type="button"
                onClick={() => enter("/")}
              >
                {stage === "planned" ? "여행 계획 시작하기" : "지금 여행 시작하기"} <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
          <button className={styles.close} type="button" onClick={() => onComplete?.()}>닫기 ×</button>
        </>
      )}
    </dialog>
  );
}
