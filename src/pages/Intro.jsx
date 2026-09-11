import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Intro.module.scss";
import bookImage from "../assets/images/intro/background02.png";
import resultBackground from "../assets/images/intro/background03.png";

const BUTTON_REACTIONS = [
  "계획 없이 떠나볼래",
  "잠깐만요!",
  "어디 가세요?",
  "진짜 무계획?",
  "으에엥?!",
  "안돼요!",
];

const HERO_REACTIONS = [
  "WANDER",
  "WANDER?",
  "ROUTE?",
  "REALLY?",
  "NO PLAN?",
  "SERIOUSLY?",
];

const ROUTE_REACTIONS = [
  ["FIND YOUR ROUTE", "A SMALL GUIDE TO WONDER"],
  ["오늘의 루트", "어디로 가시게요?"],
  ["ROUTE, PLEASE.", "정해둔 일정은요?"],
  ["NO ROUTE?", "계획이… 없다고요?"],
  ["WITHOUT A PLAN?", "진심이세요?"],
  ["COME BACK.", "일단 계획부터요"],
];

const MICRO_REACTIONS = [
  ["COLLECT MOMENTS", "NOT THINGS"],
  ["WHERE TO?", "THE PAGE IS CURIOUS"],
  ["ONE SECOND", "YOU HAVE NO ROUTE?"],
  ["WAIT, WHAT?", "THIS WAS NOT THE PLAN"],
  ["NO PLAN, REALLY?", "WE NEED TO TALK"],
  ["PLAN FIRST", "THEN GO ANYWHERE"],
];

const EDITION_REACTIONS = [
  ["COASTAL STORIES", "해안의 기록"],
  ["COASTAL STORIES", "오늘은 어디까지?"],
  ["WHERE TO?", "DESTINATION, PLEASE"],
  ["WHERE TO?", "목적지가 없다고요?"],
  ["NO PLAN?", "이쯤 되면 좀 수상해요"],
  ["PLAN FIRST.", "그렇게는 못 보내요"],
];

const SLOW_REACTIONS = [
  ["SLOW DAYS", "천천히 머무는 법"],
  ["SLOW DAYS?", "잠깐만요"],
  ["WAIT A SECOND", "정말 그냥 가요?"],
  ["REALLY?", "아무 계획도 없이요?"],
  ["SERIOUSLY?", "조금 걱정되는데요"],
  ["COME BACK.", "계획부터 세워요"],
];

const POSTCARD_REACTIONS = [
  ["POSTCARD", "기억하고 싶은 장면"],
  ["POSTCARD", "다음 장면은 어디죠?"],
  ["NEXT STOP?", "정해둔 곳은요?"],
  ["NO ROUTE?", "진짜 무계획?"],
  ["WHAT??", "목적지는요?"],
  ["HOLD ON.", "일단 계획부터요"],
];

const NEXT_REACTIONS = [
  ["NEXT STOP", "다음 장면을 향해"],
  ["NEXT STOP?", "어디로 가는 중이죠?"],
  ["ROUTE NOTE", "경로 확인 중"],
  ["ROUTE?", "경로가 안 보여요"],
  ["NO PLAN?", "이건 예상 밖인데요"],
  ["PLAN FIRST", "그리고 어디든 떠나요"],
];

const DEPARTURE_REACTIONS = [
  ["DEPARTURE", "새로운 장면의 시작"],
  ["DEPARTURE?", "첫 루트는 어디죠?"],
  ["CHECK THE MAP", "경로를 찾는 중"],
  ["WAIT.", "정말 그냥 가요?"],
  ["NO PLAN?", "잠깐만요"],
  ["PLAN FIRST", "그리고 떠나요"],
];

const OPEN_ROAD_REACTIONS = [
  ["OPEN ROAD", "조금 더 멀리"],
  ["OPEN ROAD?", "목적지는 어디죠?"],
  ["WHERE NEXT?", "다음 장면은요?"],
  ["REALLY?", "아무 데나요?"],
  ["SERIOUSLY?", "계획은요?"],
  ["COME BACK", "한 번만 생각해요"],
];

const MEMORY_REACTIONS = [
  ["MEMORY LOG", "기억하고 싶은 장면"],
  ["MEMORY LOG", "다음 장면은 어디죠?"],
  ["NEXT SCENE?", "정해둔 곳은요?"],
  ["NO ROUTE?", "그냥 떠난다고요?"],
  ["WAIT, WHAT?", "진짜 무계획?"],
  ["PLAN FIRST", "좋아요, 다시 생각해요"],
];

const BREEZE_REACTIONS = [
  ["COASTAL BREEZE", "지중해의 오후"],
  ["COASTAL BREEZE", "어디까지 가볼까요?"],
  ["WHERE TO?", "행선지를 정해볼까요?"],
  ["NO PLAN?", "조금 수상한데요"],
  ["REALLY?", "아무 데나 가는 건가요?"],
  ["PLAN FIRST.", "그 다음은 자유롭게"],
];

// Desktop chase: several clear dodges in/around the book, then a clean
// off-screen whip. No vertical rotation and no book-tuck disappearance.
const DESKTOP_ESCAPE_ROUTE = {
  // 1) first dodge: still feels like a normal choice on the right page.
  1: [
    { bookX: 0.80, bookY: 0.52, rotate: 0 },
    { bookX: 0.73, bookY: 0.60, rotate: 0 },
  ],
  // 2) cross the spread so the user has to actually chase it.
  2: [
    { bookX: 0.58, bookY: 0.67, rotate: 0 },
    { bookX: 0.42, bookY: 0.31, rotate: 0 },
  ],
  // 3) escape the physical book but stay visible in the surrounding canvas.
  3: [
    { bookX: 1.035, bookY: 0.52, rotate: 0 },
    { bookX: -0.035, bookY: 0.47, rotate: 0 },
  ],
  // 4) one more broad dodge outside the book. No rotation / no tuck.
  4: [
    { bookX: -0.055, bookY: 0.69, rotate: 0 },
    { bookX: 1.045, bookY: 0.68, rotate: 0 },
  ],
  // 5) final joke: keep the button shape and WHIP it fully out of the viewport.
  5: [
    { flyOutX: "left", bookY: 0.58, rotate: 0 },
    { flyOutX: "right", bookY: 0.58, rotate: 0 },
  ],
};

// Mobile has its own touch chase. The first tap changes the copy and nudges
// the whole button upward, then later taps continue through the existing route.
// Keep one tap = one movement and never cross the plan CTA.
const MOBILE_ESCAPE_ROUTE = {
  // 1) First tap: copy changes to "잠깐만요!" and the whole button dodges slightly upward.
  // Keep the offset modest so it moves visibly without colliding with the plan CTA.
  1: [{ areaOffsetX: 24, areaOffsetY: -52, rotate: 0 }],
  // 2) DOWN + RIGHT — well below the plan CTA.
  2: [{ areaOffsetX: 34, areaOffsetY: 152, rotate: 0 }],
  // 3) UP + LEFT — visibly rises from step 2, but stays below the plan CTA.
  3: [{ areaOffsetX: -30, areaOffsetY: 64, rotate: 0 }],
  // 4) DOWN + LEFT — another large dodge across the page.
  4: [{ areaOffsetX: -38, areaOffsetY: 218, rotate: 0 }],
  // 5) Final tap: sweep toward the right while flying completely off-screen.
  5: [{ flyOutY: "bottom", areaOffsetX: 42, rotate: 0 }],
};

export default function Intro({ onComplete }) {
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const headingRef = useRef(null);
  const bookRef = useRef(null);
  const runawayAreaRef = useRef(null);
  const runawayButtonRef = useRef(null);
  const openingTimerRef = useRef(null);
  const runawayTimerRef = useRef(null);
  const escapeUnlockTimerRef = useRef(null);
  const resultTimerRef = useRef(null);
  const escapeLockRef = useRef(false);
  const lastTriggerPointRef = useRef(null);

  const [stage, setStage] = useState("choose");
  const [introReady, setIntroReady] = useState(false);
  const [runawayStep, setRunawayStep] = useState(0);
  const [runawayGone, setRunawayGone] = useState(false);
  const [runawayPosition, setRunawayPosition] = useState({ x: 0, y: 0, rotate: 0 });

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    document.body.style.overflow = "hidden";
    if (dialog && !dialog.open) dialog.showModal();

    const mobileIntro = window.matchMedia?.("(max-width: 767px)")?.matches;

    openingTimerRef.current = window.setTimeout(
      () => setIntroReady(true),
      reducedMotion ? 80 : mobileIntro ? 1220 : 1680,
    );

    return () => {
      window.clearTimeout(openingTimerRef.current);
      window.clearTimeout(runawayTimerRef.current);
      window.clearTimeout(escapeUnlockTimerRef.current);
      window.clearTimeout(resultTimerRef.current);
      if (dialog?.open) dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (stage === "choose" && !introReady) return undefined;

    const timer = window.setTimeout(() => {
      headingRef.current?.focus({ preventScroll: true });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [stage, introReady]);

  useEffect(() => {
    if (runawayStep < 5 || runawayGone) return undefined;

    runawayTimerRef.current = window.setTimeout(() => {
      setRunawayGone(true);
    }, 920);

    return () => window.clearTimeout(runawayTimerRef.current);
  }, [runawayStep, runawayGone]);

  useEffect(() => {
    if (stage !== "planned") return undefined;

    resultTimerRef.current = window.setTimeout(() => {
      navigate("/");
      onComplete?.();
    }, 1850);

    return () => window.clearTimeout(resultTimerRef.current);
  }, [stage, navigate, onComplete]);

  const isMobileLayout = () =>
    window.matchMedia?.("(max-width: 767px)")?.matches ?? window.innerWidth <= 767;

  const chooseEscapePosition = (event, nextStep) => {
    const area = runawayAreaRef.current;
    const button = runawayButtonRef.current;
    const book = bookRef.current;
    const mobileLayout = isMobileLayout();
    const isDesktop = !mobileLayout && window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;

    if (!area || !book) return { x: 0, y: 0, rotate: 0 };

    const areaRect = area.getBoundingClientRect();
    const buttonRect = button?.getBoundingClientRect();
    const bookRect = book.getBoundingClientRect();
    const pointerX = event?.clientX ?? areaRect.left + areaRect.width / 2;
    const pointerY = event?.clientY ?? areaRect.top + 32;
    const baseX = areaRect.left + areaRect.width / 2;
    const baseY = areaRect.top + (buttonRect?.height || 64) / 2;
    const halfW = (buttonRect?.width || 300) / 2;
    const halfH = (buttonRect?.height || 64) / 2;
    const viewportPad = isDesktop ? 14 : 8;
    const route = isDesktop ? DESKTOP_ESCAPE_ROUTE : MOBILE_ESCAPE_ROUTE;
    const candidates = route[nextStep] || route[1];

    return [...candidates]
      .map((candidate) => {
        if (!isDesktop && candidate.keepPosition) {
          return { x: 0, y: 0, rotate: candidate.rotate || 0, distance: 99999 };
        }

        let targetX;
        let targetY;

        if (Number.isFinite(candidate.areaOffsetX) || Number.isFinite(candidate.areaOffsetY)) {
          targetX = baseX + (candidate.areaOffsetX || 0);
          targetY = baseY + (candidate.areaOffsetY || 0);
        } else {
          targetX = bookRect.left + bookRect.width * candidate.bookX;
          targetY = bookRect.top + bookRect.height * candidate.bookY;
        }
        const radians = ((candidate.rotate || 0) * Math.PI) / 180;
        const projectedHalfW = Math.abs(Math.cos(radians)) * halfW + Math.abs(Math.sin(radians)) * halfH;
        const projectedHalfH = Math.abs(Math.sin(radians)) * halfW + Math.abs(Math.cos(radians)) * halfH;

        // Clamp normal dodge positions by the button's visual bounds.
        // Final fly-out candidates intentionally bypass the viewport edge.
        if (candidate.flyOutX === "right") {
          targetX = window.innerWidth + projectedHalfW + 72;
        } else if (candidate.flyOutX === "left") {
          targetX = -projectedHalfW - 72;
        } else {
          targetX = Math.max(
            projectedHalfW + viewportPad,
            Math.min(window.innerWidth - projectedHalfW - viewportPad, targetX),
          );
        }

        if (candidate.flyOutY === "bottom") {
          targetY = window.innerHeight + projectedHalfH + 64;
        } else if (candidate.flyOutY === "top") {
          targetY = -projectedHalfH - 64;
        } else {
          targetY = Math.max(
            projectedHalfH + viewportPad,
            Math.min(window.innerHeight - projectedHalfH - viewportPad, targetY),
          );
        }

        const distance = Math.hypot(pointerX - targetX, pointerY - targetY);
        return {
          x: targetX - baseX,
          y: targetY - baseY,
          rotate: candidate.rotate,
          distance,
        };
      })
      .sort((a, b) => b.distance - a.distance)[0];
  };

  const triggerRunaway = (event) => {
    if (!introReady || runawayGone || runawayStep >= 5 || escapeLockRef.current) return;

    const mobileLayout = isMobileLayout();
    const isDesktop = !mobileLayout && window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;
    if (isDesktop && event) {
      const point = { x: event.clientX, y: event.clientY };
      const last = lastTriggerPointRef.current;

      // A button moving underneath a stationary cursor can fire pointerenter again.
      // Require the actual pointer to have travelled before another chase step is allowed.
      if (last && Math.hypot(point.x - last.x, point.y - last.y) < 34) return;
      lastTriggerPointRef.current = point;
    }

    const nextStep = Math.min(runawayStep + 1, 5);
    const nextPosition = chooseEscapePosition(event, nextStep);

    escapeLockRef.current = true;
    setRunawayPosition(nextPosition);
    setRunawayStep(nextStep);

    window.clearTimeout(escapeUnlockTimerRef.current);
    escapeUnlockTimerRef.current = window.setTimeout(() => {
      escapeLockRef.current = false;
    }, nextStep === 5 ? 760 : mobileLayout ? 500 : 540);
  };

  const handleBookPointerMove = (event) => {
    if (!introReady || event.pointerType === "touch") return;

    const target = bookRef.current;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    target.style.setProperty("--tilt-y", `${(x * 0.7).toFixed(2)}deg`);
    target.style.setProperty("--tilt-x", `${(-y * 0.45).toFixed(2)}deg`);
  };

  const resetBookTilt = () => {
    const target = bookRef.current;
    if (!target) return;
    target.style.setProperty("--tilt-y", "0deg");
    target.style.setProperty("--tilt-x", "0deg");
  };

  const routeCopy = ROUTE_REACTIONS[runawayStep];
  const microCopy = MICRO_REACTIONS[runawayStep];
  const editionCopy = EDITION_REACTIONS[runawayStep];
  const slowCopy = SLOW_REACTIONS[runawayStep];
  const postcardCopy = POSTCARD_REACTIONS[runawayStep];
  const nextCopy = NEXT_REACTIONS[runawayStep];
  const departureCopy = DEPARTURE_REACTIONS[runawayStep];
  const openRoadCopy = OPEN_ROAD_REACTIONS[runawayStep];
  const memoryCopy = MEMORY_REACTIONS[runawayStep];
  const breezeCopy = BREEZE_REACTIONS[runawayStep];

  return (
    <dialog
      ref={dialogRef}
      className={styles.intro}
      aria-label="L:CODE 여행 시작"
      onCancel={(event) => {
        event.preventDefault();
        onComplete?.();
      }}
    >
      {stage === "choose" ? (
        <>
          <section
            ref={bookRef}
            className={`${styles.book} ${introReady ? styles.bookReady : ""}`}
            aria-labelledby="intro-title"
            onPointerMove={handleBookPointerMove}
            onPointerLeave={resetBookTilt}
          >
            <div className={styles.depthBackdrop} aria-hidden="true">
              <span className={styles.depthLogo}>L:CODE</span>
              <span className={styles.depthJourney}>JOURNEY</span>
              <span className={styles.depthRemixed}>TRAVEL, REMIXED</span>
            </div>

            <div className={styles.bookTilt}>
              <img
                className={styles.bookImage}
                src={bookImage}
                alt="해안 여행 사진으로 꾸며진 L:CODE 여행 매거진"
              />

              <div className={styles.pageOpening} aria-hidden="true">
                <div className={`${styles.openPage} ${styles.openPageLeft}`} />
                <div className={`${styles.openPage} ${styles.openPageRight}`} />
                <span className={styles.openingSpine} />
              </div>

              <div className={styles.mobileCover} aria-hidden="true">
                <span className={styles.mobileCoverIssue}>TRAVEL EDIT / 01</span>
                <strong>L:CODE</strong>
                <em>TRAVEL, REMIXED</em>
                <span className={styles.mobileCoverLine}>A DIFFERENT JOURNEY</span>
                <span className={styles.mobileCoverPhoto} />
                <span className={styles.mobileCoverCorner}>2026<br />JOURNAL</span>
              </div>

              <div className={`${styles.magazineDecor} ${styles[`magStep${runawayStep}`] || ""}`} aria-hidden="true">
                <span className={`${styles.magText} ${styles.magChapter}`}>
                  ISSUE 01<br /><b>COASTLINE EDIT</b>
                </span>

                <span className={`${styles.magText} ${styles.magEscape}`}>
                  ESCAPE<br /><b>THE ORDINARY</b>
                </span>

                <span className={`${styles.magText} ${styles.magIssue}`}>
                  THE TRAVEL EDIT<br /><b>VOL. 01</b>
                </span>

                <span
                  key={`edition-${runawayStep}`}
                  className={`${styles.magText} ${styles.magEdition} ${runawayStep >= 2 ? styles.magChanged : ""}`}
                >
                  {editionCopy[0]}<br /><b>{editionCopy[1]}</b>
                </span>

                <span className={`${styles.magText} ${styles.magMicro}`}>
                  {microCopy[0]}<br /><b>{microCopy[1]}</b>
                </span>

                <span
                  key={`hero-${runawayStep}`}
                  className={`${styles.magText} ${styles.magHero} ${runawayStep > 0 ? styles.magChangedStrong : ""}`}
                >
                  {HERO_REACTIONS[runawayStep]}
                </span>

                <span
                  key={`slow-${runawayStep}`}
                  className={`${styles.magText} ${styles.magSlowDays} ${runawayStep >= 1 ? styles.magChanged : ""}`}
                >
                  {slowCopy[0]}<br /><b>{slowCopy[1]}</b>
                </span>

                <span
                  key={`postcard-${runawayStep}`}
                  className={`${styles.magText} ${styles.magPostcardNote} ${runawayStep >= 3 ? styles.magChanged : ""}`}
                >
                  {postcardCopy[0]}<br /><b>{postcardCopy[1]}</b>
                </span>

                <span
                  key={`route-${runawayStep}`}
                  className={`${styles.magText} ${styles.magRoute} ${runawayStep > 0 ? styles.magChanged : ""}`}
                >
                  {routeCopy[0]}<br /><b>{routeCopy[1]}</b>
                </span>

                <span className={`${styles.magText} ${styles.magKorean}`}>
                  여행의 첫 페이지<br /><b>작은 선택이 만드는 큰 장면</b>
                </span>

                <span className={`${styles.magText} ${styles.magOuter}`}>
                  JOURNEY NOTES · 2026 · L:CODE
                </span>

                <span
                  key={`next-${runawayStep}`}
                  className={`${styles.magText} ${styles.magNextStop} ${runawayStep >= 4 ? styles.magChanged : ""}`}
                >
                  {nextCopy[0]}<br /><b>{nextCopy[1]}</b>
                </span>

                <span
                  key={`departure-${runawayStep}`}
                  className={`${styles.magText} ${styles.magDeparture} ${runawayStep >= 1 ? styles.magChanged : ""}`}
                >
                  {departureCopy[0]}<br /><b>{departureCopy[1]}</b>
                </span>

                <span
                  key={`open-road-${runawayStep}`}
                  className={`${styles.magText} ${styles.magOpenRoad} ${runawayStep >= 2 ? styles.magChanged : ""}`}
                >
                  {openRoadCopy[0]}<br /><b>{openRoadCopy[1]}</b>
                </span>

                <span
                  key={`memory-${runawayStep}`}
                  className={`${styles.magText} ${styles.magMemory} ${runawayStep >= 3 ? styles.magChanged : ""}`}
                >
                  {memoryCopy[0]}<br /><b>{memoryCopy[1]}</b>
                </span>

                <span
                  key={`breeze-${runawayStep}`}
                  className={`${styles.magText} ${styles.magBreeze} ${runawayStep >= 4 ? styles.magChanged : ""}`}
                >
                  {breezeCopy[0]}<br /><b>{breezeCopy[1]}</b>
                </span>

                <span className={`${styles.magText} ${styles.magTiny}`}>
                  STAY CURIOUS<br /><b>BETTER DAYS AHEAD</b>
                </span>
              </div>

              <div className={styles.copy}>
                <h1 id="intro-title" ref={headingRef} tabIndex={-1}>
                  이번 여행,<br />
                  <strong>어떻게 시작할까요?</strong>
                </h1>

                <div className={styles.choices}>
                  <button
                    className={`${styles.choiceButton} ${styles.planButton} ${runawayStep > 0 ? styles.planGuided : ""}`}
                    aria-label="계획부터 세워볼래"
                    type="button"
                    onClick={() => setStage("planned")}
                  >
                    <span>계획부터 세워볼래</span>
                    <b aria-hidden="true">→</b>
                  </button>

                  <div
                    ref={runawayAreaRef}
                    className={`${styles.runawayArea} ${runawayGone ? styles.runawayAreaGone : ""}`}
                  >
                    {!runawayGone && (
                      <button
                        ref={runawayButtonRef}
                        className={`${styles.choiceButton} ${styles.runawayButton} ${runawayStep === 5 ? styles.runawayFlyingOut : ""}`}
                        aria-label="계획 없이 떠나볼래"
                        type="button"
                        style={{
                          "--escape-x": `${runawayPosition.x}px`,
                          "--escape-y": `${runawayPosition.y}px`,
                          "--escape-rotate": `${runawayPosition.rotate}deg`,
                        }}
                        onPointerEnter={(event) => {
                          if (!isMobileLayout() && event.pointerType !== "touch") {
                            triggerRunaway(event);
                          }
                        }}
                        onClick={(event) => {
                          event.preventDefault();
                          // Mobile uses click/tap as the single source of truth.
                          // Triggering on pointer-down while the button itself moves can
                          // leave some mobile browsers/emulators stuck on the moved slot.
                          if (isMobileLayout()) {
                            triggerRunaway(event);
                          }
                        }}
                      >
                        <span>{BUTTON_REACTIONS[runawayStep]}</span>
                        <b aria-hidden="true">→</b>
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>

            <div className={styles.depthForeground} aria-hidden="true">
              <span>MORE THAN A TRIP</span>
            </div>
          </section>

          <button className={styles.close} type="button" onClick={() => onComplete?.()}>
            닫기 ×
          </button>
        </>
      ) : (
        <>
          <section className={styles.result} aria-labelledby="result-title">
            <img className={styles.resultBackground} src={resultBackground} alt="" aria-hidden="true" />
            <div className={styles.resultCopy}>
              <h1 id="result-title" ref={headingRef} tabIndex={-1}>
                역시, 계획부터 세우실 줄 알았어요.
              </h1>
              <p>좋은 여행은 방향을 정하는 순간부터 시작되니까요.</p>
              <div className={styles.resultProgress} aria-hidden="true">
                <span />
              </div>
            </div>
          </section>

          <button className={styles.close} type="button" onClick={() => onComplete?.()}>
            닫기 ×
          </button>
        </>
      )}
    </dialog>
  );
}
