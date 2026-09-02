import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { drawEventCoupon } from "../services/eventService";
import styles from "./GachaEvent.module.scss";
import { EventHeader } from "./Event";

const asset = {
  bgIntro: "/event/event02/background01.png",
  bgDraw: "/event/event02/background02.png",
  bgResult: "/event/event02/background03.png",
  gacha: "/event/event02/gacha01.png",
  capsuleClosed: "/event/event02/capsule01.png",
  capsuleOpen: "/event/event02/capsule02.png",
  couponFirst: "/event/event02/coupon01.svg",
  couponSecond: "/event/event02/coupon02.png",
  couponKit: "/event/event02/coupon03.png",
  couponSale: "/event/event02/coupon04.png",
  ribbon: "/event/event02/decoration01.png",
  coin: "/event/event02/decoration02.png",
  touch: "/event/event02/decoration03.png",
  giftBox: "/event/event02/gift01.png",
  travelKit: "/event/event02/gift02.png",
};

const prizes = [
  {
    prizeId: "event-first",
    rank: "1등",
    title: "10만원 쿠폰 + 여행키트증정",
    resultTitle: "1등 당첨!",
    resultText: "쇼핑 10만원권 + 여행키트 무료 증정",
    image: asset.couponFirst,
    showKit: true,
  },
  {
    prizeId: "event-second",
    rank: "2등",
    title: "5만원 쿠폰 + 여행키트증정",
    resultTitle: "2등 당첨!",
    resultText: "쇼핑 5만원권 + 여행키트 무료 증정",
    image: asset.couponSecond,
    showKit: true,
  },
  {
    prizeId: "event-third",
    rank: "3등",
    title: "여행키트증정",
    resultTitle: "3등 당첨!",
    resultText: "여행키트 무료 증정",
    image: asset.couponKit,
    showKit: true,
  },
  {
    prizeId: "event-fourth",
    rank: "4등",
    title: "쇼핑 10% 할인쿠폰",
    resultTitle: "4등 당첨!",
    resultText: "쇼핑 10% 할인쿠폰 증정",
    image: asset.couponSale,
    showKit: false,
  },
];

const previousStep = {
  draw: "intro",
  capsule: "draw",
  open: "capsule",
  result: "open",
};

const OPEN_AUTO_DELAY = 1000;

export default function GachaEvent({ onExit }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("intro");
  const [selectedPrize, setSelectedPrize] = useState(prizes[0]);
  const [drawing, setDrawing] = useState(false);
  const [drawError, setDrawError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [step]);

  useEffect(() => {
    if (step !== "open") return undefined;

    const timer = window.setTimeout(() => {
      setStep("result");
    }, OPEN_AUTO_DELAY);

    return () => window.clearTimeout(timer);
  }, [step]);

  const handleBack = () => {
    if (step === "intro") {
      onExit();
      return;
    }

    setStep(previousStep[step] ?? "intro");
  };

  const handleDraw = async () => {
    if (!user) {
      navigate("/login", { state: { from: "/event" } });
      return;
    }
    setDrawing(true);
    setDrawError("");
    try {
      const result = await drawEventCoupon(user.uid);
      const prize = prizes.find((item) => item.prizeId === result.prizeId);
      if (!prize) throw new Error("당첨 결과를 확인할 수 없습니다.");
      if (result.alreadyClaimed) {
        window.alert("이미 참여한 이벤트입니다. 발급된 쿠폰은 마이페이지 쿠폰함에서 확인해 주세요.");
        return;
      }
      setSelectedPrize(prize);
      setStep("capsule");
    } catch (error) {
      const message = error?.code === "permission-denied"
        ? "쿠폰 저장 권한이 없습니다. Firestore 규칙을 확인해 주세요."
        : "쿠폰을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
      setDrawError(message);
      window.alert(message);
    } finally {
      setDrawing(false);
    }
  };

  return (
    <>
      {(step === "intro" || step === "draw") && (
        <EventHeader label="COUPON EVENT" onBack={handleBack} />
      )}

      {step === "intro" && (
        <section className={`${styles.scene} ${styles.intro}`}>
          <Background src={asset.bgIntro} />

          <div className={styles.introCopy}>
            <p className={styles.kicker}>꽝 없는 이벤트</p>
            <h1>
              가차 돌리고,
              <br />
              쿠폰 받자!
            </h1>
            <p className={styles.description}>
              랜덤 당첨으로 쇼핑 쿠폰과
              <br />
              여행키트를 받아보세요
            </p>
          </div>

          <img className={styles.introGacha} src={asset.gacha} alt="" />

          <div className={styles.prizeArea}>
            <h2>경품 미리보기</h2>
            <div className={styles.prizeList}>
              {prizes.map((prize) => (
                <article key={prize.rank}>
                  <div>
                    <span>{prize.rank}</span>
                    <strong>{prize.title}</strong>
                  </div>
                  <img src={prize.image} alt="" />
                </article>
              ))}
            </div>
          </div>

          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => setStep("draw")}
          >
            이벤트 참여하기
          </button>
        </section>
      )}

      {step === "draw" && (
        <section className={`${styles.scene} ${styles.draw}`}>
          <Background src={asset.bgDraw} />
          <p className={styles.drawGuide}>버튼을 눌러 랜덤 경품을 확인하세요</p>

          <img className={styles.drawGift} src={asset.giftBox} alt="" />

          <div className={styles.drawMachine}>
            <img src={asset.gacha} alt="" />
          </div>

          <button className={styles.gachaButton} type="button" onClick={handleDraw} disabled={drawing}>
            <img src={asset.coin} alt="" />
            <span>
              {drawing ? "추첨 중" : "가차"}
              <br />
              {drawing ? "잠시만요" : "돌리기"}
            </span>
          </button>
          {drawError && <p role="alert">{drawError}</p>}
        </section>
      )}

      {step === "capsule" && (
        <button
          className={`${styles.scene} ${styles.capsuleScene}`}
          type="button"
          onClick={() => setStep("open")}
        >
          <h2>두근두근 결과는?</h2>
          <img className={styles.closedCapsule} src={asset.capsuleClosed} alt="" />
          <div className={styles.touchGuide}>
            <img src={asset.touch} alt="" />
            <p>
              화면을 터치하면
              <br />
              당첨 결과를 확인할 수 있어요.
            </p>
          </div>
        </button>
      )}

      {step === "open" && (
        <section className={`${styles.scene} ${styles.openScene}`}>
          <Background src={asset.bgResult} />
          <img src={asset.capsuleOpen} alt="" />
        </section>
      )}

      {step === "result" && (
        <section className={`${styles.scene} ${styles.result}`}>
          <Background src={asset.bgResult} />

          <div className={styles.ribbonWrap}>
            <img className={styles.ribbon} src={asset.ribbon} alt="" />
            <span>축하합니다!</span>
          </div>
          <h2>{selectedPrize.resultTitle}</h2>
          <p className={styles.resultText}>{selectedPrize.resultText}</p>
          <div
            className={`${styles.resultPrize} ${
              selectedPrize.showKit ? "" : styles.resultSingle
            }`}
          >
            <img className={styles.resultCoupon} src={selectedPrize.image} alt="" />
            {selectedPrize.showKit && (
              <img className={styles.resultKit} src={asset.travelKit} alt="" />
            )}
          </div>
          <p className={styles.resultNote}>
            쿠폰은 마이페이지 &gt; 쿠폰함에서 확인할 수 있어요.
          </p>

          <div className={styles.resultActions}>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => navigate("/coupon")}
            >
              쿠폰함 보러가기 →
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={onExit}
            >
              홈으로
            </button>
          </div>
        </section>
      )}
    </>
  );
}

function Background({ src, className = "" }) {
  return (
    <img
      className={`${styles.background} ${className}`}
      src={src}
      alt=""
      aria-hidden="true"
    />
  );
}
