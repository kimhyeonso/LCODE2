import { useEffect, useState } from "react";
import styles from "./Event.module.scss";

const asset = {
  bgIntro: "/event/background01.png",
  bgDraw: "/event/background02.png",
  bgResult: "/event/background03.png",
  gacha: "/event/gacha01.png",
  capsuleClosed: "/event/capsule01.png",
  capsuleOpen: "/event/capsule02.png",
  couponFirst: "/event/coupon01.svg",
  couponSecond: "/event/coupon02.png",
  couponKit: "/event/coupon03.png",
  couponSale: "/event/coupon04.png",
  ribbon: "/event/decoration01.png",
  coin: "/event/decoration02.png",
  touch: "/event/decoration03.png",
  giftBox: "/event/gift01.png",
  travelKit: "/event/gift02.png",
};

const prizes = [
  {
    rank: "1등",
    title: "10만원 쿠폰 + 여행키트증정",
    resultTitle: "1등 당첨!",
    resultText: "쇼핑 10만원권 + 여행키트 무료 증정",
    image: asset.couponFirst,
    showKit: true,
  },
  {
    rank: "2등",
    title: "5만원 쿠폰 + 여행키트증정",
    resultTitle: "2등 당첨!",
    resultText: "쇼핑 5만원권 + 여행키트 무료 증정",
    image: asset.couponSecond,
    showKit: true,
  },
  {
    rank: "3등",
    title: "여행키트증정",
    resultTitle: "3등 당첨!",
    resultText: "여행키트 무료 증정",
    image: asset.couponKit,
    showKit: true,
  },
  {
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

export default function Event() {
  const [step, setStep] = useState("intro");
  const [selectedPrize, setSelectedPrize] = useState(prizes[0]);

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
      window.history.back();
      return;
    }

    setStep(previousStep[step] ?? "intro");
  };

  const handleDraw = () => {
    const randomIndex = Math.floor(Math.random() * prizes.length);

    setSelectedPrize(prizes[randomIndex]);
    setStep("capsule");
  };

  return (
    <main className={styles.eventPage}>
      <section className={styles.stage} aria-label="쿠폰 경품 이벤트">
        {(step === "intro" || step === "draw") && (
          <EventHeader onBack={handleBack} />
        )}

        {step === "intro" && (
          <section className={`${styles.scene} ${styles.intro}`}>
            <Background src={asset.bgIntro} />

            <div className={styles.introCopy}>
              <p className={styles.kicker}>꽝 없는 이벤트</p>
              <h1>
                가챠 돌리고,
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

            <button className={styles.gachaButton} type="button" onClick={handleDraw}>
              <img src={asset.coin} alt="" />
              <span>
                가챠
                <br />
                돌리기
              </span>
            </button>
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
                onClick={() => setStep("intro")}
              >
                쿠폰함 보러가기 →
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => setStep("intro")}
              >
                홈으로
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function EventHeader({ onBack }) {
  return (
    <header className={styles.eventHeader}>
      <button type="button" onClick={onBack}>
        ← BACK
      </button>
      <span>COUPON EVENT</span>
    </header>
  );
}

function Background({ src }) {
  return <img className={styles.background} src={src} alt="" aria-hidden="true" />;
}
