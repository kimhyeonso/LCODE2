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
  eventBanner: "/event/event01/gacha_banner.png",
  mysteryBanner: "/event/event01/mystery_banner.png",
  mysteryBg: "/event/event03/background1.png",
  mysteryScene: "/event/event03/background2.png",
  mysteryIntro: "/event/event03/SCENE1.png",
  mysteryEvidence: "/event/event03/SCENE2_picture.png",
  mysteryCabin: "/event/event03/SCENE%204.png",
  mysteryEnding: "/event/event03/SCENE5_picture.png",
  mysteryPhoto: "/event/event03/picture.png",
  dyingMessage: "/event/event03/dying_message.png",
  dyingMessageNote: "/event/event03/dyingmessage.png",
  suspects: {
    hyeonsu: "/event/event03/hyeonsu.png",
    hyeonsuProfile: "/event/event03/hyeonsu-po1.png",
    jeongeun: "/event/event03/jeongeun.png",
    jeongeunProfile: "/event/event03/jeongeun-po1.png",
    jiyoung: "/event/event03/jiyoung.png",
    jiyoungProfile: "/event/event03/jiyoung-po1.png",
    seunggeun: "/event/event03/seunggeun.png",
    seunggeunProfile: "/event/event03/seunggeun-po1.png",
    sohee: "/event/event03/sohee.png",
    soheeProfile: "/event/event03/sohee-po1.png",
    soheeProfileAlt: "/event/event03/sohee-po2.png",
  },
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
  intro: "list",
  mystery: "list",
  draw: "intro",
  capsule: "draw",
  open: "capsule",
  result: "open",
};

const OPEN_AUTO_DELAY = 1000;
const MYSTERY_CORRECT_ID = "hyeonsu";

const victimReport = {
  name: "전승근",
  role: "21 · 여자 · 이젠 대학교 모델학과 학생",
  image: asset.suspects.seunggeun,
  status: "알리바이 미확인",
  before:
    "의상 출전은 발견되지 않았다. 승근이 마신 물병에서 원인 불명의 약물 성분이 발견됐다.",
  report:
    "주변 사람들은 승근이 잠든 것으로 생각해 한동안 사건을 알아차리지 못했다.",
  clues: ["물병", "마지막 위치 좌석", "사진 및 메모지", "비행기록 22:13"],
};

const mysterySuspects = [
  {
    id: "hyeonsu",
    name: "김현수",
    role: "21 · 여자 · 이젠 대학교 모델학과 학생",
    image: asset.suspects.hyeonsu,
    profile: asset.suspects.hyeonsuProfile,
    status: "알리바이 미확인",
    statusTone: "dangerBadge",
    clue: "미인 촬영 자리 경쟁",
    before:
      "승근과 모델 촬영의 메인 자리를 두고 경쟁해왔다. 이번 촬영에서도 원래 현수가 메인 후보였지만 최종적으로 승근이 선정됐다.",
    report: "승근이랑 싸운 건 맞아. 그래도 비행기에서는 화해했어.",
    alibi: "사진 찍을 때까진 나도 함께 사진을 보고 있었어.",
    statement: "사진 찍고 나서 불편해서 혼자 있었어.",
  },
  {
    id: "jeongeun",
    name: "최정은",
    role: "21 · 여자 · 이젠 대학교 모델학과 학생",
    image: asset.suspects.jeongeun,
    profile: asset.suspects.jeongeunProfile,
    status: "알리바이 확인됨",
    statusTone: "safeBadge",
    clue: "촬영장 안내서 문제",
    before:
      "승근이 정은의 촬영용 액세서리를 빌려갔다가 잃어버렸다.",
    report: "진짜 화나긴 했어. 근데 그 시간에는 승무원한테 따뜻한 물을 받고 있었어.",
    alibi: "승무원의 증언과 일치한다.",
    statement: "그 사람이 쓰러진 건 나도 나중에 알았어.",
  },
  {
    id: "sohee",
    name: "전소희",
    role: "21 · 여자 · 이젠 대학교 모델학과 학생",
    image: asset.suspects.sohee,
    profile: asset.suspects.soheeProfile,
    status: "알리바이 의심",
    statusTone: "warnBadge",
    clue: "승근의 사진 공개권 갈등",
    before:
      "승근과 소희는 사촌 관계다. 두 사람의 부모님은 오래전부터 돈 문제로 사이가 좋지 않았다.",
    report: "솔직히 아직도 화나 있었어. 근데 사건 당시에는 화장실에 있었어.",
    alibi: "나오다가 승근이를 발견한 것도 나야.",
    statement: "내가 독을 넣었다는 말은 말도 안 돼.",
  },
  {
    id: "jiyoung",
    name: "유지영",
    role: "21 · 여자 · 이젠 대학교 모델학과 학생",
    image: asset.suspects.jiyoung,
    profile: asset.suspects.jiyoungProfile,
    status: "알리바이 부인됨",
    statusTone: "safeBadge",
    clue: "여행 비용 정산 문제",
    before: "여행 비용 정산 문제로 승근과 다투었다.",
    report: "돈 때문에 싸운 건 맞아. 나는 사진 찍고 나서는 계속 영화 보고 있었어.",
    alibi: "기내 모니터의 영화 재생 기록이 남아 있다.",
    statement: "나는 승근이 자리 근처에 가지 않았어.",
  },
];

const correctTruth = [
  "사진 속 피해자의 손에는 같은 컵이 있었다.",
  "그 컵은 사건 직전 김현수가 가져다준 커피였다.",
  "마지막 말의 시간과 좌석 이동 기록이 같은 방향을 가리킨다.",
  "모든 단서는 한 사람, 김현수에게 모인다.",
];

const mysteryStory = [
  {
    scene: "SCENE 1. 죽음 직전의 밤",
    image: asset.mysteryIntro,
    speaker: "전소희",
    text: "드디어 한국 간다... 빨리 집에 가고 싶다.",
  },
  {
    scene: "SCENE 1. 죽음 직전의 밤",
    image: asset.suspects.jeongeun,
    speaker: "최정은",
    text: "어제 일 때문에 다들 예민해진 것 같아.",
  },
  {
    scene: "SCENE 1. 죽음 직전의 밤",
    image: asset.suspects.jiyoung,
    speaker: "유지영",
    text: "사진 속 승근이 표정, 뭔가 이상하지 않아?",
  },
  {
    scene: "SCENE 1. 죽음 직전의 밤",
    image: asset.suspects.hyeonsu,
    speaker: "김현수",
    text: "괜한 말 하지 마. 이미 끝난 일이야.",
  },
  {
    scene: "SCENE 2. 이상한 냄새",
    image: asset.mysteryCabin,
    speaker: "효과음",
    text: "커피 향 사이로 낯선 약 냄새가 스쳤다.",
  },
  {
    scene: "SCENE 2. 이상한 냄새",
    image: asset.mysteryEvidence,
    speaker: "유지영",
    text: "승근이가 방금 마신 컵... 누가 가져다준 거야?",
  },
  {
    scene: "SCENE 3. 사건 발생",
    image: asset.dyingMessage,
    speaker: "전승근",
    text: "우리 모두... 알고 있잖아...",
  },
  {
    scene: "SCENE 3. 사건 발생",
    image: asset.mysteryPhoto,
    speaker: "전소희",
    text: "이 사진, 사건 전에 찍힌 마지막 사진이야.",
  },
  {
    scene: "SCENE 3. 사건 발생",
    image: asset.mysteryEnding,
    speaker: "기장",
    text: "승객 여러분, 착석해 주십시오. 이 비행기는 곧 착륙합니다.",
  },
];

export default function Event() {
  const [step, setStep] = useState("list");
  const [selectedPrize, setSelectedPrize] = useState(prizes[0]);
  const [mysteryStage, setMysteryStage] = useState("cover");
  const [mysteryIndex, setMysteryIndex] = useState(0);
  const [selectedSuspect, setSelectedSuspect] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [step, mysteryStage, mysteryIndex]);

  useEffect(() => {
    if (step !== "open") return undefined;

    const timer = window.setTimeout(() => {
      setStep("result");
    }, OPEN_AUTO_DELAY);

    return () => window.clearTimeout(timer);
  }, [step]);

  const handleBack = () => {
    if (step === "list") {
      window.history.back();
      return;
    }

    if (step === "mystery") {
      if (mysteryStage === "cover") {
        setStep("list");
        return;
      }

      if (
        (mysteryStage === "story" ||
          mysteryStage === "suspectDetail" ||
          mysteryStage === "truth") &&
        mysteryIndex > 0
      ) {
        setMysteryIndex((currentIndex) => currentIndex - 1);
        return;
      }

      if (mysteryStage === "suspectDetail") {
        setMysteryStage("suspects");
        return;
      }

      if (mysteryStage === "suspects") {
        setMysteryStage("evidence");
        return;
      }

      if (mysteryStage === "choose") {
        setMysteryStage("suspectDetail");
        setMysteryIndex(mysterySuspects.length - 1);
        return;
      }

      if (mysteryStage === "answerReview") {
        setMysteryStage("choose");
        return;
      }

      if (mysteryStage === "truth") {
        setMysteryStage("answerReview");
        return;
      }

      if (mysteryStage === "culprit") {
        setMysteryStage("truth");
        setMysteryIndex(correctTruth.length - 1);
        return;
      }

      if (mysteryStage === "reward" || mysteryStage === "wrongResult") {
        setMysteryStage("choose");
        return;
      }

      setMysteryStage("cover");
      setMysteryIndex(0);
      setSelectedSuspect(null);
      return;
    }

    setStep(previousStep[step] ?? "list");
  };

  const openMysteryEvent = () => {
    setMysteryStage("cover");
    setMysteryIndex(0);
    setSelectedSuspect(null);
    setStep("mystery");
  };

  const handleDraw = () => {
    const randomIndex = Math.floor(Math.random() * prizes.length);

    setSelectedPrize(prizes[randomIndex]);
    setStep("capsule");
  };

  const handleMysteryNext = () => {
    if (mysteryStage === "cover") {
      setMysteryStage("flight");
      return;
    }

    if (mysteryStage === "flight") {
      setMysteryStage("story");
      setMysteryIndex(0);
      return;
    }

    if (mysteryStage === "story") {
      if (mysteryIndex < mysteryStory.length - 1) {
        setMysteryIndex((currentIndex) => currentIndex + 1);
        return;
      }

      setMysteryStage("caseOpen");
      return;
    }

    if (mysteryStage === "caseOpen") {
      setMysteryStage("victim");
      return;
    }

    if (mysteryStage === "victim") {
      setMysteryStage("evidence");
      return;
    }

    if (mysteryStage === "evidence") {
      setMysteryStage("suspects");
      return;
    }

    if (mysteryStage === "suspects") {
      setMysteryStage("choose");
      return;
    }

    if (mysteryStage === "suspectDetail") {
      if (mysteryIndex < mysterySuspects.length - 1) {
        setMysteryIndex((currentIndex) => currentIndex + 1);
        return;
      }

      setMysteryStage("choose");
      return;
    }

    if (mysteryStage === "answerReview") {
      setMysteryStage("truth");
      setMysteryIndex(0);
      return;
    }

    if (mysteryStage === "truth") {
      if (mysteryIndex < correctTruth.length - 1) {
        setMysteryIndex((currentIndex) => currentIndex + 1);
        return;
      }

      setMysteryStage("culprit");
      return;
    }

    if (mysteryStage === "culprit") {
      setMysteryStage("reward");
      return;
    }

    setMysteryStage("cover");
  };

  const handleSuspectSelect = (suspect) => {
    setSelectedSuspect(suspect);
    setMysteryIndex(0);
    setMysteryStage(suspect.id === MYSTERY_CORRECT_ID ? "answerReview" : "wrongResult");
  };

  const handleSuspectInspect = (index) => {
    setMysteryIndex(index);
    setMysteryStage("suspectDetail");
  };

  const handleMysteryChoose = () => {
    setMysteryStage("choose");
  };

  return (
    <main className={styles.eventPage}>
      <section className={styles.stage} aria-label="이벤트 페이지">
        {(step === "intro" || step === "draw" || step === "mystery") && (
          <EventHeader
            label={step === "mystery" ? "RETURN FLIGHT · 21:40" : "COUPON EVENT"}
            onBack={handleBack}
          />
        )}

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
                <p className={styles.groupLabel}>2 EVENTS IN PROGRESS</p>

                <button
                  className={styles.eventCard}
                  type="button"
                  onClick={() => setStep("intro")}
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
                  onClick={openMysteryEvent}
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
              </section>
            </div>
          </section>
        )}

        {step === "mystery" && (
          <MysteryEvent
            stage={mysteryStage}
            storyIndex={mysteryIndex}
            selectedSuspect={selectedSuspect}
            onNext={handleMysteryNext}
            onPrevious={handleBack}
            onInspect={handleSuspectInspect}
            onChoose={handleMysteryChoose}
            onSelect={handleSuspectSelect}
            onRetry={() => {
              setSelectedSuspect(null);
              setMysteryStage("choose");
            }}
            onRestart={openMysteryEvent}
          />
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

            <button className={styles.gachaButton} type="button" onClick={handleDraw}>
              <img src={asset.coin} alt="" />
              <span>
                가차
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

function EventHeader({ label, onBack }) {
  return (
    <header className={styles.eventHeader}>
      <button type="button" onClick={onBack}>
        ← BACK
      </button>
      <span>{label}</span>
    </header>
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

function MysteryEvent({
  stage,
  storyIndex,
  selectedSuspect,
  onNext,
  onPrevious,
  onInspect,
  onChoose,
  onSelect,
  onRetry,
  onRestart,
}) {
  const story = mysteryStory[storyIndex];
  const suspect = mysterySuspects[storyIndex] ?? mysterySuspects[0];
  const correctSuspect = mysterySuspects.find(
    (suspect) => suspect.id === MYSTERY_CORRECT_ID,
  );

  if (stage === "cover") {
    return (
      <button
        className={`${styles.scene} ${styles.mysteryScreen} ${styles.mysteryCover}`}
        type="button"
        onClick={onNext}
      >
        <Background src={asset.mysteryBg} />
        <div className={styles.mysteryCopy}>
          <span>INTERACTIVE MYSTERY</span>
          <p>CASE 01</p>
          <h1>
            비행기 살인사건의
            <br />
            진실
          </h1>
          <small>
            이젠 대학교 모델학과에서 종강 파티 여행을 떠났다.
            <br />
            그런데 귀국 중 비행기 안에서 한 명이 죽었다...
          </small>
        </div>
        <div className={styles.mysteryStart}>사건 조사 시작 →</div>
      </button>
    );
  }

  if (stage === "flight") {
    return (
      <button
        className={`${styles.scene} ${styles.mysteryScreen} ${styles.flightScreen}`}
        type="button"
        onClick={onNext}
      >
        <Background src={asset.mysteryScene} className={styles.fitBackground} />
        <div className={styles.subtitleBox}>
          <strong>[자막]</strong>
          <p>귀국 비행기가 이륙했다. 서울까지는 네 시간.</p>
        </div>
        <span className={styles.tapGuide}>TAP TO CONTINUE</span>
      </button>
    );
  }

  if (stage === "story") {
    return (
      <button
        className={`${styles.scene} ${styles.mysteryScreen} ${styles.storyScreen}`}
        type="button"
        onClick={onNext}
      >
        <Background src={story.image} className={styles.fitBackground} />
        <span className={styles.sceneName}>{story.scene}</span>
        <div className={styles.dialogueBox}>
          <strong>[{story.speaker}]</strong>
          <p>{story.text}</p>
        </div>
        <span className={styles.tapGuide}>TAP TO CONTINUE</span>
      </button>
    );
  }

  if (stage === "caseOpen") {
    return (
      <button
        className={`${styles.scene} ${styles.mysteryScreen} ${styles.caseOpenScreen}`}
        type="button"
        onClick={onNext}
      >
        <Background src={asset.mysteryEnding} className={styles.fitBackground} />
        <div>
          <h2>CASE OPEN</h2>
          <p>기내살인사건의 진실을 찾아라.</p>
        </div>
      </button>
    );
  }

  if (stage === "evidence") {
    return (
      <section
        className={`${styles.scene} ${styles.mysteryScreen} ${styles.evidenceScreen}`}
      >
        <div className={styles.evidenceBoard}>
          <p>DYING MESSAGE : 22시 31분</p>
          <img src={asset.dyingMessageNote} alt="" />
          <span>GROUP PHOTO - EVIDENCE #13</span>
          <img src={asset.mysteryPhoto} alt="" />
          <strong>사진 속에 답이 있을지도 모릅니다.</strong>
          <div className={styles.evidenceActions}>
            <button type="button" onClick={onPrevious}>이전으로 돌아가기</button>
            <button type="button" onClick={onNext}>용의자들의 알리바이 확인하기</button>
          </div>
        </div>
      </section>
    );
  }

  if (stage === "victim") {
    return (
      <section className={`${styles.scene} ${styles.mysteryScreen} ${styles.victimScreen}`}>
        <div className={styles.suspectProfile}>
          <img src={victimReport.image} alt="" />
          <div className={styles.suspectInfo}>
            <h2>{victimReport.name}</h2>
            <p>{victimReport.role}</p>
            <b className={`${styles.statusBadge} ${styles.dangerBadge}`}>
              {victimReport.status}
            </b>
          </div>
          <section className={styles.incidentReport}>
            <h3>[INCIDENT REPORT]</h3>
            <p>{victimReport.before}</p>
            <p>{victimReport.report}</p>
            <dl>
              {victimReport.clues.map((clue, index) => (
                <div key={clue}>
                  <dt>증거 0{index + 1}</dt>
                  <dd>{clue}</dd>
                </div>
              ))}
            </dl>
          </section>
          <button className={styles.fullAction} type="button" onClick={onNext}>
            다잉메시지 확인하기
          </button>
        </div>
      </section>
    );
  }

  if (stage === "suspects") {
    return (
      <section className={`${styles.scene} ${styles.mysteryScreen} ${styles.suspectFileScreen}`}>
        <div className={styles.fileList}>
          <img className={styles.evidencePhoto} src={asset.mysteryPhoto} alt="" />
          <span>EVIDENCE 05 · GROUP PHOTO · 21:46</span>
          <h2>[SUSPECT FILES]</h2>
          <p>사건 당시 비행기에 함께 있던 네 사람의 진술을 확인하세요.</p>
          {mysterySuspects.map((suspect, index) => (
            <button key={suspect.id} type="button" onClick={() => onInspect(index)}>
              <img src={suspect.image} alt="" />
              <div>
                <small>용의자 0{index + 1}</small>
                <strong>{suspect.name}</strong>
                <p>{suspect.clue}</p>
                <b className={`${styles.statusBadge} ${styles[suspect.statusTone]}`}>
                  {suspect.status}
                </b>
              </div>
            </button>
          ))}
          <button type="button" onClick={onNext}>용의자 지목하기</button>
        </div>
      </section>
    );
  }

  if (stage === "suspectDetail") {
    return (
      <section
        className={`${styles.scene} ${styles.mysteryScreen} ${styles.suspectDetailScreen}`}
      >
        <div className={styles.suspectProfile}>
          <img src={suspect.image} alt="" />
          <div className={styles.suspectInfo}>
            <h2>{suspect.name}</h2>
            <p>{suspect.role}</p>
            <b className={`${styles.statusBadge} ${styles[suspect.statusTone]}`}>
              {suspect.status}
            </b>
            <section className={styles.beforeCase}>
              <span>사건 전</span>
              <p>{suspect.before}</p>
            </section>
          </div>
          <section className={styles.incidentReport}>
            <h3>[INCIDENT REPORT]</h3>
            <p>{suspect.report}</p>
            <p>{suspect.statement}</p>
            {suspect.id !== MYSTERY_CORRECT_ID && (
              <strong>{suspect.alibi}</strong>
            )}
          </section>
          <button className={styles.textAction} type="button" onClick={onPrevious}>
            단서사진 다시 보기
          </button>
          <div className={styles.suspectActions}>
            <button type="button" onClick={onPrevious}>← PREV</button>
            <button type="button" onClick={onNext}>
              {storyIndex < mysterySuspects.length - 1
                ? "NEXT SUSPECT →"
                : "SELECT SUSPECT →"}
            </button>
          </div>
          <button className={styles.fullAction} type="button" onClick={onChoose}>
            용의자 지목하기
          </button>
        </div>
      </section>
    );
  }

  if (stage === "choose") {
    return (
      <section className={`${styles.scene} ${styles.mysteryScreen} ${styles.chooseScreen}`}>
        <div className={styles.chooseInner}>
          <h2>WHO KILLED SEUNGGEUN?</h2>
          <p>범인을 선택하세요</p>
          <img src={asset.mysteryPhoto} alt="" />
          <div className={styles.choiceGrid}>
            {mysterySuspects.map((suspect) => (
              <button key={suspect.id} type="button" onClick={() => onSelect(suspect)}>
                <img src={suspect.image} alt="" />
                <span>{suspect.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (stage === "answerReview") {
    return (
      <button
        className={`${styles.scene} ${styles.mysteryScreen} ${styles.answerReviewScreen}`}
        type="button"
        onClick={onNext}
      >
        <div className={styles.answerReview}>
          <p>정답을 확인하는 중...</p>
          <img src={asset.mysteryPhoto} alt="" />
          <section>
            <span>SELECTED SUSPECT</span>
            <h2>{selectedSuspect.name}</h2>
            <strong>사진과 메시지를 다시 대조합니다.</strong>
          </section>
        </div>
        <span className={styles.tapGuide}>증거 다시 보기</span>
      </button>
    );
  }

  if (stage === "truth") {
    return (
      <button
        className={`${styles.scene} ${styles.mysteryScreen} ${styles.truthScreen}`}
        type="button"
        onClick={onNext}
      >
        <p>{correctTruth[storyIndex]}</p>
        <span className={styles.tapGuide}>TAP TO CONTINUE</span>
      </button>
    );
  }

  if (stage === "culprit") {
    return (
      <button
        className={`${styles.scene} ${styles.mysteryScreen} ${styles.culpritScreen}`}
        type="button"
        onClick={onNext}
      >
        <div>
          <span>CULPRIT FOUND</span>
          <img src={correctSuspect.image} alt="" />
          <h2>{correctSuspect.name}</h2>
          <p>피해자의 커피를 건넨 마지막 인물.</p>
        </div>
        <span className={styles.tapGuide}>사건 해결 보상 보기</span>
      </button>
    );
  }

  if (stage === "reward") {
    return (
      <section className={`${styles.scene} ${styles.mysteryScreen} ${styles.correctScreen}`}>
        <div className={styles.resultMystery}>
          <span>CASE COMPLETE</span>
          <h2>사건 해결</h2>
          <p>
            피해자의 커피를 건넨 마지막 인물. 단체 사진과 좌석 이동 기록이
            결정적인 증거가 되었습니다.
          </p>
          <div className={styles.couponStack}>
            <MysteryCoupon brand="다이소" title="다이소 쿠폰" detail="10,000원 쿠폰" />
            <MysteryCoupon brand="N pay" title="네이버페이 쿠폰" detail="아메리카노 1잔" />
          </div>
          <button type="button" onClick={onRestart}>처음으로 돌아가기</button>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${styles.scene} ${styles.mysteryScreen} ${styles.wrongScreen}`}
    >
      <div className={styles.wrongResult}>
        <span>NOT THE CULPRIT</span>
        <img src={selectedSuspect.image} alt="" />
        <h2>{selectedSuspect.name}</h2>
        <section className={styles.wrongReport}>
          <strong>[INCIDENT REPORT]</strong>
          <p>{selectedSuspect.report}</p>
        </section>
        <p>{selectedSuspect.name}은 범인이 아니었습니다. 단서를 다시 확인해보세요.</p>
        <button type="button" onClick={onRetry}>다시 추리하기</button>
        <button type="button" onClick={onRestart}>처음으로</button>
      </div>
    </section>
  );
}

function MysteryCoupon({ brand, title, detail }) {
  return (
    <article className={styles.mysteryCoupon}>
      <strong>{brand}</strong>
      <div>
        <span>사건 해결 보상</span>
        <h3>{title}</h3>
        <p>{detail}</p>
        <b>COFFEE COUPON</b>
      </div>
    </article>
  );
}
