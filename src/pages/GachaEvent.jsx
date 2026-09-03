import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { drawEventCoupon } from "../services/eventService";
import styles from "./GachaEvent.module.scss";
import { EventHeader } from "./Event";

const asset = {
  bgIntro: "/event/event02/background01.png",
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

  travelKit: "/event/event02/gift02.png",
  mainPrize: "/event/event02/main.png",
};

const prizes = [
  {
    prizeId: "event-first",
    rank: "1등",
    previewTitle: "10만원 쇼핑 쿠폰",
    previewSub: "+ L:CODE 여행키트",
    resultTitle: "1등 당첨!",
    resultText: "쇼핑 10만원권 + 여행키트 무료 증정",
    image: asset.couponFirst,
    showKit: true,
  },
  {
    prizeId: "event-second",
    rank: "2등",
    previewTitle: "5만원 쇼핑 쿠폰",
    previewSub: "+ L:CODE 여행키트",
    resultTitle: "2등 당첨!",
    resultText: "쇼핑 5만원권 + 여행키트 무료 증정",
    image: asset.couponSecond,
    showKit: true,
  },
  {
    prizeId: "event-third",
    rank: "3등",
    previewTitle: "L:CODE 여행키트",
    previewSub: "여행용 키트 1세트",
    resultTitle: "3등 당첨!",
    resultText: "여행키트 무료 증정",
    image: asset.couponKit,
    showKit: true,
  },
  {
    prizeId: "event-fourth",
    rank: "4등",
    previewTitle: "10% 할인쿠폰",
    previewSub: "L:CODE SHOP 할인",
    resultTitle: "4등 당첨!",
    resultText: "쇼핑 10% 할인쿠폰 증정",
    image: asset.couponSale,
    showKit: false,
  },
];

const noticeItems = [
  "본 이벤트는 L:CODE 회원을 대상으로 진행되며 로그인 후 참여할 수 있습니다.",
  "이벤트 참여 기회는 계정당 1회 제공되며 참여 완료 이후 결과 변경 또는 재추첨은 불가능합니다.",
  "추첨 결과는 이벤트 참여가 정상적으로 완료되는 즉시 확정됩니다.",
  "당첨된 쿠폰은 마이페이지 > 쿠폰함에서 확인할 수 있습니다.",
  "발급된 쿠폰 및 당첨 혜택은 본인 계정에서만 사용할 수 있으며 타인에게 양도하거나 현금으로 교환할 수 없습니다.",
  "쿠폰별 사용 가능 기간, 최소 주문 금액, 할인 한도 및 적용 조건은 쿠폰 상세 안내를 기준으로 합니다.",
  "쿠폰 유효기간 만료 후에는 사용 및 재발급이 불가능하므로 반드시 기간 내 사용해 주세요.",
  "일부 특가 상품, 제휴 상품, 프로모션 상품 및 특정 카테고리는 쿠폰 적용 대상에서 제외될 수 있습니다.",
  "쿠폰 및 다른 프로모션 할인 혜택은 중복 적용되지 않을 수 있습니다.",
  "여행키트 당첨 시 회원정보에 등록된 배송 정보를 기준으로 경품이 발송됩니다.",
  "주소 및 연락처 오기재, 수취인 부재, 장기간 연락 불가 등으로 발생한 반송 건은 재배송이 제한될 수 있습니다.",
  "여행키트의 구성품, 패키지, 색상 및 디자인은 재고 및 운영 상황에 따라 일부 변경될 수 있습니다.",
  "경품 발송 일정은 물류 및 운영 상황에 따라 변경될 수 있습니다.",
  "비정상적인 접근, 자동화된 프로그램 사용, 시스템 오류를 이용한 반복 참여 등이 확인되는 경우 당첨이 취소될 수 있습니다.",
  "시스템 또는 네트워크 장애 발생 시 정상적인 이벤트 진행을 위해 일부 참여 기록을 별도로 확인할 수 있습니다.",
  "이벤트 일정, 경품 구성 및 세부 운영 정책은 운영 상황에 따라 변경될 수 있으며 중요한 변경 사항은 별도로 안내됩니다.",
  "이벤트 및 경품 관련 문의는 L:CODE 고객센터를 통해 접수해 주세요.",
];

const previousStep = {
  capsule: "intro",
  open: "capsule",
  result: "open",
};

const OPEN_AUTO_DELAY = 1000;

export default function GachaEvent({ onExit }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("intro");
  const [machineOpen, setMachineOpen] = useState(false);

  const [selectedPrize, setSelectedPrize] = useState(prizes[0]);
  const [drawing, setDrawing] = useState(false);
  const [drawError, setDrawError] = useState("");

  const [noticeOpen, setNoticeOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [step]);

  useEffect(() => {
    if (step !== "open") return undefined;

    const timer = window.setTimeout(() => {
      setStep("result");
    }, OPEN_AUTO_DELAY);

    return () => window.clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (!noticeOpen && !machineOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      if (noticeOpen) {
        setNoticeOpen(false);
        return;
      }

      if (machineOpen && !drawing) {
        setMachineOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [noticeOpen, machineOpen, drawing]);

  const handleBack = () => {
    if (noticeOpen) {
      setNoticeOpen(false);
      return;
    }

    if (machineOpen) {
      if (!drawing) {
        setMachineOpen(false);
      }
      return;
    }

    if (step === "intro") {
      onExit();
      return;
    }

    setStep(previousStep[step] ?? "intro");
  };

  const handleOpenMachine = () => {
    if (drawing) return;

    setDrawError("");
    setMachineOpen(true);
  };

  const handleCloseMachine = () => {
    if (drawing) return;

    setMachineOpen(false);
    setDrawError("");
  };

  const handleDraw = async () => {
    if (!user) {
      navigate("/login", {
        state: {
          from: "/event",
        },
      });

      return;
    }

    if (drawing) return;

    setDrawing(true);
    setDrawError("");

    try {
      const result = await drawEventCoupon(user.uid);

      const prize = prizes.find(
        (item) => item.prizeId === result.prizeId
      );

      if (!prize) {
        throw new Error("당첨 결과를 확인할 수 없습니다.");
      }

      if (result.alreadyClaimed) {
        window.alert(
          "이미 참여한 이벤트입니다. 발급된 쿠폰은 마이페이지 쿠폰함에서 확인해 주세요."
        );

        return;
      }

      setSelectedPrize(prize);
      setMachineOpen(false);
      setStep("capsule");
    } catch (error) {
      const message =
        error?.code === "permission-denied"
          ? "쿠폰 저장 권한이 없습니다. Firestore 규칙을 확인해 주세요."
          : "쿠폰을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";

      setDrawError(message);
    } finally {
      setDrawing(false);
    }
  };

  return (
    <>
      {step === "intro" && (
        <EventHeader
          label="COUPON EVENT"
          onBack={handleBack}
        />
      )}

      {/* =====================================================
          INTRO
      ===================================================== */}
      {step === "intro" && (
        <section className={`${styles.scene} ${styles.intro}`}>
          <Background src={asset.bgIntro} />

          <div className={styles.introInner}>
            <header className={styles.introCopy}>
              <p className={styles.kicker}>
                꽝 없는 이벤트
              </p>

              <h1>
                가차 돌리고, 쿠폰 받자!
              </h1>
            </header>

            <div className={styles.introHero}>
              <button
                className={styles.heroButton}
                type="button"
                onClick={handleOpenMachine}
                aria-label="선물을 눌러 가차 머신 열기"
              >
                <span
                  className={styles.heroGlow}
                  aria-hidden="true"
                />

                <img
                  className={styles.introMainPrize}
                  src={asset.mainPrize}
                  alt="L:CODE 이벤트 여행 선물 세트"
                />
              </button>

              <p className={styles.heroHint}>
                선물을 눌러 가차를 시작하세요
              </p>
            </div>

            <PrizePreview />
          </div>

          {/* ===============================================
              가차머신 FLOAT OVERLAY
              박스형 팝업 없음
          =============================================== */}
          <div
            className={`${styles.machineOverlay} ${
              machineOpen
                ? styles.machineOverlayOpen
                : ""
            }`}
            aria-hidden={!machineOpen}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                handleCloseMachine();
              }
            }}
          >
            <div className={styles.machineFloat}>
              <button
                className={styles.machineClose}
                type="button"
                onClick={handleCloseMachine}
                disabled={drawing}
                aria-label="가차 머신 닫기"
              >
                ×
              </button>

              <p className={styles.machineGuide}>
                행운의 가차를 돌려보세요
              </p>

              <div
                className={`${styles.drawMachine} ${
                  drawing
                    ? styles.drawMachineActive
                    : ""
                }`}
              >
                <span
                  className={styles.machineGlow}
                  aria-hidden="true"
                />

                <img
                  src={asset.gacha}
                  alt="L:CODE 가차 머신"
                />

                <div
                  className={styles.spinBalls}
                  aria-hidden="true"
                >
                  {Array.from({ length: 12 }).map(
                    (_, index) => (
                      <i key={index} />
                    )
                  )}
                </div>
              </div>

              <button
                className={styles.gachaButton}
                type="button"
                onClick={handleDraw}
                disabled={drawing}
              >
                <img src={asset.coin} alt="" />

                <span>
                  {drawing ? (
                    <>
                      추첨 중
                      <br />
                      잠시만요
                    </>
                  ) : (
                    <>
                      가차
                      <br />
                      돌리기
                    </>
                  )}
                </span>
              </button>

              {drawError && (
                <p
                  className={styles.drawError}
                  role="alert"
                >
                  {drawError}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          CAPSULE
      ===================================================== */}
      {step === "capsule" && (
        <button
          className={`${styles.scene} ${styles.capsuleScene}`}
          type="button"
          onClick={() => setStep("open")}
        >
          <h2>두근두근 결과는?</h2>

          <img
            className={styles.closedCapsule}
            src={asset.capsuleClosed}
            alt="닫힌 가차 캡슐"
          />

          <div className={styles.touchGuide}>
            <img
              src={asset.touch}
              alt=""
              aria-hidden="true"
            />

            <p>
              화면을 터치하면
              <br />
              당첨 결과를 확인할 수 있어요.
            </p>
          </div>
        </button>
      )}

      {/* =====================================================
          OPEN
      ===================================================== */}
      {step === "open" && (
        <section
          className={`${styles.scene} ${styles.openScene}`}
        >
          <Background src={asset.bgResult} />

          <img
            className={styles.openCapsule}
            src={asset.capsuleOpen}
            alt="열린 가차 캡슐"
          />
        </section>
      )}

      {/* =====================================================
          RESULT
      ===================================================== */}
      {step === "result" && (
        <section
          className={`${styles.scene} ${styles.result}`}
        >
          <Background src={asset.bgResult} />

          <div className={styles.ribbonWrap}>
            <img
              className={styles.ribbon}
              src={asset.ribbon}
              alt=""
            />

            <span>
              축하합니다!
            </span>
          </div>

          <h2>
            {selectedPrize.resultTitle}
          </h2>

          <p className={styles.resultText}>
            {selectedPrize.resultText}
          </p>

          <div
            className={`${styles.resultPrize} ${
              selectedPrize.showKit
                ? ""
                : styles.resultSingle
            }`}
          >
            <img
              className={styles.resultCoupon}
              src={selectedPrize.image}
              alt={selectedPrize.previewTitle}
            />

            {selectedPrize.showKit && (
              <img
                className={styles.resultKit}
                src={asset.travelKit}
                alt="L:CODE 여행키트"
              />
            )}
          </div>

          <p className={styles.resultNote}>
            쿠폰은 마이페이지 &gt; 쿠폰함에서
            확인할 수 있어요.
          </p>

          <div className={styles.resultActions}>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() =>
                navigate("/coupon")
              }
            >
              쿠폰함 보러가기 →
            </button>

            <button
              className={styles.secondaryButton}
              type="button"
              onClick={onExit}
            >
              이벤트 목록으로
            </button>
          </div>
        </section>
      )}

      {/* =====================================================
          NOTICE
      ===================================================== */}
      {step === "intro" && (
        <>
          <button
            className={styles.noticeButton}
            type="button"
            onClick={() =>
              setNoticeOpen(true)
            }
          >
            <span>
              NOTICE
            </span>

            <b>
              유의사항
            </b>
          </button>

          <div
            className={`${styles.noticeOverlay} ${
              noticeOpen
                ? styles.noticeOverlayOpen
                : ""
            }`}
            aria-hidden={!noticeOpen}
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setNoticeOpen(false);
              }
            }}
          >
            <aside
              className={styles.noticePanel}
              role="dialog"
              aria-modal="true"
              aria-label="이벤트 유의사항"
            >
              <header>
                <div>
                  <small>
                    EVENT NOTICE
                  </small>

                  <h2>
                    이벤트 유의사항
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setNoticeOpen(false)
                  }
                  aria-label="유의사항 닫기"
                >
                  ×
                </button>
              </header>

              <ul className={styles.noticeList}>
                {noticeItems.map((notice) => (
                  <li key={notice}>
                    {notice}
                  </li>
                ))}
              </ul>

              <button
                className={styles.noticeConfirm}
                type="button"
                onClick={() =>
                  setNoticeOpen(false)
                }
              >
                확인
              </button>
            </aside>
          </div>
        </>
      )}
    </>
  );
}

function PrizePreview() {
  return (
    <section
      className={styles.prizeArea}
      aria-labelledby="gacha-prize-title"
    >
      <div className={styles.sectionTitle}>
        <span />

        <h2 id="gacha-prize-title">
          경품 미리보기
        </h2>

        <span />
      </div>

      <div className={styles.prizeList}>
        {prizes.map((prize) => (
          <article
            className={styles.prizeCard}
            key={prize.prizeId}
          >
            <div className={styles.prizeTop}>
              <span className={styles.prizeRank}>
                {prize.rank}
              </span>
            </div>

            <div className={styles.prizeImageWrap}>
              <img
                src={prize.image}
                alt={prize.previewTitle}
              />
            </div>

            <div className={styles.prizeText}>
              <strong>
                {prize.previewTitle}
              </strong>

              <small>
                {prize.previewSub}
              </small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Background({
  src,
  className = "",
}) {
  return (
    <img
      className={`${styles.background} ${className}`}
      src={src}
      alt=""
      aria-hidden="true"
    />
  );
}