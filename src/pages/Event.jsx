import { useEffect, useState } from "react";
import styles from "./Event.module.scss";
import GachaEvent from "./GachaEvent";
import MysteryEvent from "./MysteryEvent";
import MagazineEvent from "./MagazineEvent";

const asset = {
  eventBanner: "/event/event01/gacha_banner.png",
  mysteryBanner: "/event/event01/mystery_banner.png",
};

export default function Event() {
  const [step, setStep] = useState("list");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [step]);

  const goList = () => setStep("list");

  return (
    <main className={`${styles.eventPage} eventPageRoot`}>
      <section className={styles.stage} aria-label="이벤트 페이지">
        {step === "list" && (
          <section className={styles.eventList}>
            <div className={styles.eventListInner}>
              <header className={styles.listHeader}>
                <span>EVENT</span>
                <h1>EVENT</h1>
                <p>
                  여행을 더 즐겁게 만드는
                  <br />
                  L:CODE 이벤트
                </p>
              </header>

              <section className={styles.eventGroup} aria-label="진행 중인 이벤트">
                <p className={styles.groupLabel}>3 EVENTS IN PROGRESS</p>

                <button
                  className={styles.eventCard}
                  type="button"
                  onClick={() => setStep("gacha")}
                >
                  <img src={asset.eventBanner} alt="" />
                  <div className={styles.cardText}>
                    <h2>여행 운세 뽑기</h2>
                    <p>오늘의 여행 운세와 랜덤 쿠폰을 뽑아보세요.</p>
                    <div>
                      <span>2026. 08. 01 - 10. 31</span>
                      <b>이벤트 보기 →</b>
                    </div>
                  </div>
                </button>

                <button
                  className={styles.eventCard}
                  type="button"
                  onClick={() => setStep("mystery")}
                >
                  <img src={asset.mysteryBanner} alt="" />
                  <div className={styles.cardText}>
                    <h2>비행기 살인사건</h2>
                    <p>기내에서 벌어진 사건의 범인을 찾아보세요.</p>
                    <div>
                      <span>2026. 08. 15 - 12. 15</span>
                      <b>이벤트 보기 →</b>
                    </div>
                  </div>
                </button>

                <button
                  className={styles.eventCard}
                  type="button"
                  onClick={() => setStep("magazine")}
                >
                  <div className={styles.magazineCardVisual} />
                  <div className={styles.cardText}>
                    <h2>리뷰쓰고 잡지 받자!</h2>
                    <p>여행의 기록을 한 권의 매거진으로 남겨보세요</p>
                    <div>
                      <span>2026. 05. 15 - 2027. 08. 15</span>
                      <b>이벤트 보기 →</b>
                    </div>
                  </div>
                </button>
              </section>
            </div>
          </section>
        )}

        {step === "gacha" && <GachaEvent onExit={goList} />}
        {step === "mystery" && <MysteryEvent onExit={goList} />}
        {step === "magazine" && <MagazineEvent onExit={goList} />}
      </section>
    </main>
  );
}

export function EventHeader({ label, onBack, light = false }) {
  return (
    <header
      className={`${styles.eventHeader} ${light ? styles.eventHeaderLight : ""}`}
    >
      <button type="button" onClick={onBack}>
        ← BACK
      </button>
      {label && <span>{label}</span>}
    </header>
  );
}
