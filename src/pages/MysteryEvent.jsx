import { useEffect, useState } from "react";
import styles from "./MysteryEvent.module.scss";
import { EventHeader } from "./Event";

const asset = {
  mysteryBg: "/event/event03/background1.png",
  mysteryScene: "/event/event03/background2.png",
  mysteryIntro: "/event/event03/SCENE1.png",
  mysteryEvidence: "/event/event03/SCENE2_picture.png",
  mysteryCabin: "/event/event03/SCENE%204.png",
  mysteryEnding: "/event/event03/SCENE5_picture.png",
  mysteryPhoto: "/event/event03/picture.png",
  dyingMessage: "/event/event03/dying_message.png",
  dyingMessageNote: "/event/event03/dyingmessage.png",
  starbucks: "/event/event03/Starbucks.png",
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

const MYSTERY_CORRECT_ID = "Kimhyeonsu";

const victimReport = {
  name: "전승근",
  role: "21 · 여자 · 이젠 대학교 모델학과 학생",
  image: asset.suspects.seunggeun,
  before:
    "외상 흔적은 발견되지 않았다. 승근이 마신 음료에서 원인 불명의 약물 성분이 발견됐다.",
  report:
    "주변 사람들은 승근이 잠든 것으로 생각해 한동안 사건을 알아차리지 못했다.",
  clues: ["음료 컵", "마지막 위치 좌석", "사진 및 메모지", "비행기록 22:13"],
};

const mysterySuspects = [
  {
    id: "Kimhyeonsu",
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
    id: "Choigeun",
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
    id: "jeonsohee",
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
    id: "Yoojiyoung",
    name: "유지영",
    role: "21 · 여자 · 이젠 대학교 모델학과 학생",
    image: asset.suspects.jiyoung,
    profile: asset.suspects.jiyoungProfile,
    status: "알리바이 확인됨",
    statusTone: "safeBadge",
    clue: "여행 비용 정산 문제",
    before: "여행 비용 정산 문제로 승근과 다투었다.",
    report: "돈 때문에 싸운 건 맞아. 나는 사진 찍고 나서는 계속 영화 보고 있었어.",
    alibi: "기내 모니터의 영화 재생 기록이 남아 있다.",
    statement: "나는 승근이 자리 근처에 가지 않았어.",
  },
];

const wrongResultCopy = {
  Choigeun: {
    body:
      "정은에게는 승근을 미워할 이유가 있었다. 하지만 사건이 발생한 시간, 정은은 승무원에게 물을 받고 있었다. 승무원의 증언과 일치한다.",
    hint: "승근의 마지막 말을 다시 생각해보세요. \"우리 모두 같았는데.\"",
  },
  jeonsohee: {
    body:
      "승근과 소희는 사촌이었다. 부모님들의 금전 문제가 얽혀 있었고, 사건 직전 두 사람은 크게 싸웠다. 충분한 동기는 있었다. 하지만 사건 당시 소희는 화장실에 있었다. 그리고 승근을 처음 발견한 사람도 소희였다.",
    emphasis: "가장 큰 원한을 가진 사람이 반드시 범인은 아니다.",
    hint: "사진 속 작은 차이를 확인해보세요.",
  },
  Yoojiyoung: {
    body:
      "지영은 여행 비용 문제로 승근과 다퉜다. 하지만 사건이 발생한 시간 동안 지영은 기내 영화를 보고 있었다. 모니터에는 해당 시간의 재생 기록이 남아 있다.",
    hint: "범인의 말 중 사진과 맞지 않는 부분이 있습니다.",
  },
};

const correctTruth = [
  {
    text: "사진을 찍은 후 현수는 승근에게 접근했다.",
  },
  {
    speaker: "현수",
    text: "촬영때는 미안했어 우리 화해하자\n그리고 메인 후보자리 축하해",
  },
  {
    image: "drink",
    text: "현수는 화해의 의미로\n승근에게 음료를 건넸다.",
  },
  {
    text: "승근은 아무런 의심 없이\n음료를 마셨다.",
  },
  {
    text: "잠시 뒤 몸에 이상을 느낀 승근.\n주변 사람들은 그저 승근이\n잠든 것으로 생각했다.",
  },
  {
    text: "승근은 자신에게 무슨 일이 생긴 것을\n알아차렸다. 그리고 현수가 자신에게\n접근했던 순간을 떠올렸다.",
  },
  {
    text: "승근은 그 순간 현수의 팔찌가\n이미 없었던 것을 기억했다.",
  },
  {
    note: "우리 모두 같았는데.",
    text:
      "마지막 단체사진에서도 현수만 팔찌를\n착용하지 않고 있었다. 현수는 자신의\n행동을 숨기기 위해 사진 찍고 나서\n팔찌를 뺐다. 그는 거짓말했다.\n하지만 사진이 그 거짓말을 밝혀냈다.",
    action: "범인 확인",
  },
];

const mysteryStory = [
  {
    scene: "SCENE 1. 죽음 직전의 밤",
    background: asset.mysteryIntro,
    character: asset.suspects.sohee,
    speaker: "전소희",
    text: "드디어 한국 간다... 빨리 집에 가고 싶다.",
  },
  {
    scene: "SCENE 1. 죽음 직전의 밤",
    background: asset.mysteryIntro,
    character: asset.suspects.jeongeun,
    speaker: "최정은",
    text: "어제 일 때문에 다들 예민해진 것 같아.",
  },
  {
    scene: "SCENE 1. 죽음 직전의 밤",
    background: asset.mysteryIntro,
    character: asset.suspects.jiyoung,
    speaker: "유지영",
    text: "사진 속 승근이 표정, 뭔가 이상하지 않아?",
  },
  {
    scene: "SCENE 1. 죽음 직전의 밤",
    background: asset.mysteryIntro,
    character: asset.suspects.hyeonsu,
    speaker: "김현수",
    text: "괜한 말 하지 마. 이미 끝난 일이야.",
  },
  {
    scene: "SCENE 2. 이상한 냄새",
    background: asset.mysteryCabin,
    speaker: "효과음",
    text: "커피 향 사이로 낯선 약 냄새가 스쳤다.",
  },
  {
    scene: "SCENE 2. 이상한 냄새",
    background: asset.mysteryCabin,
    character: asset.suspects.jiyoung,
    speaker: "유지영",
    text: "승근이가 방금 마신 컵... 누가 가져다준 거야?",
  },
  {
    scene: "SCENE 3. 사건 발생",
    background: asset.mysteryEnding,
    character: asset.suspects.seunggeun,
    prop: asset.dyingMessage,
    speaker: "전승근",
    text: "우리 모두... 알고 있잖아...",
  },
  {
    scene: "SCENE 3. 사건 발생",
    background: asset.mysteryEnding,
    character: asset.suspects.sohee,
    prop: asset.mysteryPhoto,
    speaker: "전소희",
    text: "이 사진, 사건 전에 찍힌 마지막 사진이야.",
  },
  {
    scene: "SCENE 3. 사건 발생",
    background: asset.mysteryEnding,
    speaker: "기장",
    text: "승객 여러분, 착석해 주십시오. 이 비행기는 곧 착륙합니다.",
  },
];

export default function MysteryEvent({ onExit }) {
  const [mysteryStage, setMysteryStage] = useState("cover");
  const [mysteryIndex, setMysteryIndex] = useState(0);
  const [selectedSuspect, setSelectedSuspect] = useState(null);
  const [evidenceOrigin, setEvidenceOrigin] = useState("victim");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [mysteryStage, mysteryIndex]);

  const restartMystery = () => {
    setMysteryStage("cover");
    setMysteryIndex(0);
    setSelectedSuspect(null);
    setEvidenceOrigin("victim");
  };

  const handleBack = () => {
    if (mysteryStage === "cover") {
      onExit();
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

    if (mysteryStage === "evidence") {
      setMysteryStage(evidenceOrigin);
      return;
    }

    if (mysteryStage === "suspects") {
      setEvidenceOrigin("victim");
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

    if (mysteryStage === "statementAnalysis") {
      setMysteryStage("answerReview");
      return;
    }

    if (mysteryStage === "truth") {
      setMysteryStage("statementAnalysis");
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
      setEvidenceOrigin("victim");
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
      setMysteryStage("statementAnalysis");
      return;
    }

    if (mysteryStage === "statementAnalysis") {
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

  const handleViewEvidence = () => {
    setEvidenceOrigin("suspectDetail");
    setMysteryStage("evidence");
  };

  return (
    <>
      <EventHeader
        label={mysteryStage === "cover" ? "RETURN FLIGHT · 21:40" : ""}
        onBack={handleBack}
      />
      <MysteryStage
        stage={mysteryStage}
        storyIndex={mysteryIndex}
        selectedSuspect={selectedSuspect}
        onNext={handleMysteryNext}
        onPrevious={handleBack}
        onInspect={handleSuspectInspect}
        onChoose={handleMysteryChoose}
        onSelect={handleSuspectSelect}
        onViewEvidence={handleViewEvidence}
        onSkipTruth={() => setMysteryStage("culprit")}
        onRetry={() => {
          setSelectedSuspect(null);
          setMysteryStage("choose");
        }}
        onEventList={onExit}
        onRestart={restartMystery}
      />
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

function MysteryStage({
  stage,
  storyIndex,
  selectedSuspect,
  onNext,
  onPrevious,
  onInspect,
  onChoose,
  onSelect,
  onSkipTruth,
  onRetry,
  onEventList,
  onRestart,
  onViewEvidence,
}) {
  const story = mysteryStory[storyIndex];
  const suspect = mysterySuspects[storyIndex] ?? mysterySuspects[0];
  const wrongSuspect = selectedSuspect ?? mysterySuspects[1];
  const wrongCopy = wrongResultCopy[wrongSuspect.id] ?? {
    body: `${wrongSuspect.name}은 범인이 아니었습니다. 단서를 다시 확인해보세요.`,
    hint: "범인의 말 중 사진과 맞지 않는 부분이 있습니다.",
  };
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
        <Background src={story.background} className={styles.fitBackground} />
        {story.character && (
          <img className={styles.storyCharacter} src={story.character} alt="" />
        )}
        {story.prop && (
          <img className={styles.storyProp} src={story.prop} alt="" />
        )}
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
          <button className={styles.textAction} type="button" onClick={onViewEvidence}>
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
      <section
        className={`${styles.scene} ${styles.mysteryScreen} ${styles.answerReviewScreen}`}
      >
        <div className={styles.answerReview}>
          <h2>EVIDENCE RECHECK</h2>
          <img src={asset.mysteryPhoto} alt="" />
          <div className={styles.recheckList}>
            {mysterySuspects.map((suspect) => (
              <article
                className={
                  suspect.id === MYSTERY_CORRECT_ID ? styles.missingBand : ""
                }
                key={suspect.id}
              >
                <span>{suspect.name}</span>
                <b>
                  {suspect.id === MYSTERY_CORRECT_ID
                    ? "팔찌 미착용 · X"
                    : "팔찌 착용 · ✓"}
                </b>
              </article>
            ))}
          </div>
          <button className={styles.fullAction} type="button" onClick={onNext}>
            진술 분석하기
          </button>
        </div>
      </section>
    );
  }

  if (stage === "statementAnalysis") {
    return (
      <section
        className={`${styles.scene} ${styles.mysteryScreen} ${styles.answerReviewScreen}`}
      >
        <div className={`${styles.answerReview} ${styles.statementAnalysis}`}>
          <h2>STATEMENT ANALYSIS</h2>
          <img src={asset.mysteryPhoto} alt="" />
          <section>
            <span>용의자 01 · 김현수 · 진술</span>
            <p>“사진 찍을 때까진 나도 팔찌 차고 있었어.”</p>
            <p>“사진 찍고 나서 불편해서 뺐어.”</p>
          </section>
          <div className={styles.statementFacts}>
            <article>
              <span>사진 시간</span>
              <b>21:46</b>
            </article>
            <article>
              <span>팔찌 착용</span>
              <b>팔찌 미착용</b>
            </article>
          </div>
          <strong>거짓말 확인 완료</strong>
          <p>사진과 현수의 진술이 일치하지 않는다.</p>
          <button className={styles.fullAction} type="button" onClick={onNext}>
            사건의 진실 확인하기
          </button>
        </div>
      </section>
    );
  }

  if (stage === "truth") {
    const truth = correctTruth[storyIndex];

    return (
      <section
        className={`${styles.scene} ${styles.mysteryScreen} ${styles.truthScreen}`}
      >
        <div className={styles.truthProgress}>
          <span>
            {String(storyIndex + 1).padStart(2, "0")} / {String(correctTruth.length).padStart(2, "0")}
          </span>
          <div>
            {correctTruth.map((_, index) => (
              <i
                className={index <= storyIndex ? styles.activeTruthStep : ""}
                key={index}
              />
            ))}
          </div>
          <button type="button" onClick={onSkipTruth}>SKIP</button>
        </div>
        <button
          className={styles.truthContent}
          type="button"
          onClick={onNext}
        >
          {truth.image === "drink" && <i className={styles.drinkIcon}>DRINK</i>}
          {truth.note && <small>{truth.note}</small>}
          {truth.speaker && <b>[{truth.speaker}]</b>}
          <p>{truth.text}</p>
        </button>
        <button className={styles.tapGuide} type="button" onClick={onNext}>
          {truth.action ?? "TAP TO CONTINUE"} ›
        </button>
      </section>
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
          <h2>CASE COMPLETE</h2>
          <p>사건을 해결했습니다.</p>
          <div className={styles.couponStack}>
            <MysteryCoupon logo={asset.starbucks} title="스타벅스 쿠폰" detail="아메리카노 1잔" />
          </div>
          <aside>당첨자 상품 지급은 이벤트 종료 후 개별 연락드립니다.</aside>
          <button type="button" onClick={onEventList}>이벤트로 돌아가기</button>
          <button type="button" onClick={onRestart}>홈으로</button>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${styles.scene} ${styles.mysteryScreen} ${styles.wrongScreen}`}
    >
      <div className={styles.wrongResult}>
        <div className={styles.wrongTitle}>
          <i />
          <span>NOT THE CULPRIT</span>
          <i />
        </div>
        <small>YOUR CHOICE</small>
        <h2>{wrongSuspect.name}</h2>
        <img src={wrongSuspect.image} alt="" />
        <p>{wrongCopy.body}</p>
        {wrongCopy.emphasis && <b>{wrongCopy.emphasis}</b>}
        <section className={styles.wrongReport}>
          <strong>힌트</strong>
          <p>{wrongCopy.hint}</p>
        </section>
        <button type="button" onClick={onRetry}>다시 추리하기</button>
        <button type="button" onClick={onRestart}>처음으로</button>
      </div>
    </section>
  );
}

function MysteryCoupon({ logo, title, detail }) {
  return (
    <article className={styles.mysteryCoupon}>
      <img src={logo} alt="" />
      <div>
        <span>사건 해결 보상</span>
        <h3>{title}</h3>
        <p>{detail}</p>
        <b>COFFEE COUPON</b>
      </div>
    </article>
  );
}
