import { useEffect, useMemo, useState } from "react";
import styles from "./MysteryEvent.module.scss";

// REVISION 2026-09-08 / WEB-PASS-03
// 누적 피드백 실제 반영본: 조사 상태/모바일 헤더/판정 연출/RECONSTRUCTION/스토리 위치 보정

/* =========================================================
   ASSETS
========================================================= */

const asset = {
  cover: "/event/event03/background1.webp",

  // PC에서는 새 가로 이미지를 사용하고, Background 컴포넌트가
  // 1024px 이하에서 기존 세로 원본으로 자동 전환한다.
  flight: "/event/event03/background2-web.webp",
  flightMobile: "/event/event03/background2.webp",
  cabin: "/event/event03/SCENE1-web.webp",
  cabinMobile: "/event/event03/SCENE1.webp",

  // 일반 대화용 보조 배경은 더 이상 커피 클로즈업을 반복 사용하지 않는다.
  cabinAlt: "/event/event03/SCENE1-web.webp",

  // 사건 장면
  groupScene: "/event/event03/SCENE2_picture-web.webp",
  groupSceneMobile: "/event/event03/SCENE2_picture.webp",
  airportScene: "/event/event03/SCENE3_picture.webp",
  coffeeCloseup: "/event/event03/SCENE%204.webp",
  drowsyScene: "/event/event03/SCENE4_picture.webp",
  collapseScene: "/event/event03/SCENE5_picture-web.webp",
  collapseSceneMobile: "/event/event03/SCENE5_picture.webp",
  messageScene: "/event/event03/SCENE6_picture.webp",

  // 조사 진입 전환 화면은 1차/2차를 분리한다.
  caseOpenFirstDesktop: "/event/event03/SCENE5_picture-web.webp",
  caseOpenFirstMobile: "/event/event03/SCENE5_picture.webp",
  caseOpenSecondDesktop: "/event/event03/SCENE6_picture.webp",
  caseOpenSecondMobile: "/event/event03/SCENE6_picture-mob.webp",

  // 기존 코드 호환용 별칭
  evidence: "/event/event03/SCENE%204.webp",
  ending: "/event/event03/SCENE5_picture.webp",

  groupPhoto: "/event/event03/picture%20(2).webp",
  dyingMessage: "/event/event03/dying_message%20(2).webp",
  dyingMessageNote: "/event/event03/dying_message%20(2).webp",

  starbucks: "/event/event03/Starbucks.webp",
  criminal: "/event/event03/criminal.webp",
  criminalWeb: "/event/event03/criminal-web.webp",

  hyeonsu: "/event/event03/hyeonsu.webp",
  hyeonsuProfile: "/event/event03/hyeonsu-po1.webp",
  hyeonsuPose2: "/event/event03/hyeonsu-po2.webp",
  hyeonsuFace: "/event/event03/hyeonsu-face.webp",

  jeongeun: "/event/event03/jeongeun.webp",
  jeongeunProfile: "/event/event03/jeongeun-po1.webp",
  jeongeunPose2: "/event/event03/jeongeun-po2.webp",
  jeongeunFace: "/event/event03/jeongeun-face.webp",

  jiyoung: "/event/event03/jiyoung.webp",
  jiyoungProfile: "/event/event03/jiyoung-po1.webp",
  jiyoungPose2: "/event/event03/jiyoung-po2.webp",
  jiyoungFace: "/event/event03/jiyoung-face.webp",

  seunggeun: "/event/event03/seunggeun.webp",
  seunggeunProfile: "/event/event03/seunggeun-po1.webp",
  seunggeunProfileAlt1: "/event/event03/seunggeun-po1-1.webp",
  seunggeunProfileAlt2: "/event/event03/seunggeun-po1-2.webp",

  sohee: "/event/event03/sohee.webp",
  soheeProfile: "/event/event03/sohee-po1.webp",
  soheePose2: "/event/event03/sohee-po2.webp",
  soheeFace: "/event/event03/sohee-face.webp",
  soheePose3: "/event/event03/sohee-po3.webp",
};

/* =========================================================
   SUSPECT DATA
========================================================= */

const suspects = [
  {
    id: "jiyoung",
    number: "01",
    name: "유지영",

    image: asset.jiyoung,
    profile: asset.jiyoungProfile,
    pose2: asset.jiyoungPose2,
    face: asset.jiyoungFace,

    firstMotive: "여행비 정산 문제",

    claimedAlibi:
      "사진 촬영 이후 자신의 자리에서 영화를 보고 있었다.",

    secondSummary:
      "단체사진 뒤 자신의 자리로 돌아갔다고 진술했다. 기내 화면의 재생 기록과 주변 증언을 함께 확인할 필요가 있다.",
  },

  {
    id: "sohee",
    number: "02",
    name: "전소희",

    image: asset.sohee,
    profile: asset.soheeProfile,
    pose2: asset.soheePose2,
    face: asset.soheeFace,

    firstMotive: "가족 사이의 오래된 갈등",

    claimedAlibi:
      "화장실을 다녀오던 중 평소보다 조용한 승근에게 말을 걸었고, 그때 처음 이상을 알아챘다.",

    secondSummary:
      "피해자와 말다툼한 사실을 숨겼다. 사건 전후 기내 뒤쪽으로 이동한 정황과 정확한 시각을 대조할 필요가 있다.",
  },

  {
    id: "jeongeun",
    number: "03",
    name: "최정은",

    image: asset.jeongeun,
    profile: asset.jeongeunProfile,
    pose2: asset.jeongeunPose2,
    face: asset.jeongeunFace,

    firstMotive: "촬영용 액세서리 분실",

    claimedAlibi:
      "커피가 전달될 무렵 승무원에게 따뜻한 물을 받고 있었다.",

    secondSummary:
      "피해자의 컵을 만진 사실을 숨겼다. 컵을 만진 시점과 따뜻한 물을 요청한 시각을 따로 비교해야 한다.",
  },

  {
    id: "hyeonsu",
    number: "04",
    name: "김현수",

    image: asset.hyeonsu,
    profile: asset.hyeonsuProfile,
    pose2: asset.hyeonsuPose2,
    face: asset.hyeonsuFace,

    firstMotive: "피날레 메인 모델 경쟁",

    claimedAlibi:
      "사진 촬영 이후 자신의 자리에서 쉬었으며 피해자 쪽에는 가지 않았다.",

    secondSummary:
      "팔찌 제거 시점과 피해자 접근 여부에 관한 진술이 일부 기록과 맞지 않는다. 정확한 동선 대조가 필요하다.",
  },
];

const suspectMap = Object.fromEntries(
  suspects.map((suspect) => [suspect.id, suspect])
);

const CORRECT_ID = "hyeonsu";


const chapterMeta = {
  prologue: {
    code: "CHAPTER 01",
    title: "RETURN FLIGHT",
    ko: "돌아오는 비행기",
  },
  round1: {
    code: "CHAPTER 02",
    title: "FIRST INVESTIGATION",
    ko: "첫 번째 조사",
  },
  round2: {
    code: "CHAPTER 03",
    title: "SECOND INVESTIGATION",
    ko: "두 번째 조사",
  },
  reconstruction: {
    code: "CHAPTER 04",
    title: "RECONSTRUCTION",
    ko: "사건 재구성",
  },
  truth: {
    code: "CHAPTER 05",
    title: "THE TRUTH",
    ko: "사건의 진실",
  },
};

const chapterSummaries = {
  round1: {
    eyebrow: "INVESTIGATION NOTES",
    title: "첫 번째 조사 정리",
    copy: "네 사람의 첫 진술에서 확인된 핵심만 정리했습니다.",
    items: [
      { label: "유지영", text: "여행비 정산 문제와 쌓인 불만이 있었다.", image: asset.jiyoungPose2 },
      { label: "전소희", text: "가족 사이 오래된 갈등과 사건 전 말다툼이 있었다.", image: asset.soheePose2 },
      { label: "최정은", text: "촬영용 액세서리 문제로 승근에게 불만이 있었다.", image: asset.jeongeunPose2 },
      { label: "김현수", text: "피날레 메인 모델 자리를 두고 승근과 경쟁했다.", image: asset.hyeonsuPose2 },
    ],
  },
  round2: {
    eyebrow: "CONTRADICTION FILE",
    title: "추가 조사 정리",
    copy: "숨긴 사실과 사건 순간의 실제 위치를 비교했습니다.",
    items: [
      { label: "유지영", text: "단체사진 뒤 좌석으로 돌아갔다고 진술했다. 재생 기록의 시간대를 확인해야 한다.", image: asset.jiyoungPose2 },
      { label: "전소희", text: "말다툼을 숨겼고 사건 전후 기내 뒤쪽으로 이동한 정황이 있다.", image: asset.soheePose2 },
      { label: "최정은", text: "컵을 만진 사실을 숨겼다. 컵과 따뜻한 물 기록의 시각을 비교해야 한다.", image: asset.jeongeunPose2 },
      { label: "김현수", text: "팔찌 제거 시점과 피해자 접근 여부에 관한 진술에 모순이 남아 있다.", image: asset.hyeonsuPose2 },
    ],
  },
};

const fullBodyAssets = new Set([
  asset.hyeonsu,
  asset.jeongeun,
  asset.jiyoung,
  asset.seunggeun,
  asset.sohee,
]);

// 일반 스토리에서는 기본 일러스트를 중심으로 유지하고,
// po1은 각 조사 흐름의 핵심 대사에서만 emphasis로 허용한다.
const storyProfileToBase = new Map([
  [asset.hyeonsuProfile, asset.hyeonsu],
  [asset.jeongeunProfile, asset.jeongeun],
  [asset.jiyoungProfile, asset.jiyoung],
  [asset.soheeProfile, asset.sohee],
]);

// po1의 원본 캔버스 높이가 기본 일러스트와 달라 보이는 캐릭터만
// 스토리 화면에서 약간 아래로 보정한다. 소희는 예외.
const loweredStoryProfiles = new Set([
  asset.hyeonsuProfile,
  asset.jeongeunProfile,
  asset.jiyoungProfile,
]);

function getChapterForPhase(phase, hiddenContext, summaryKey) {
  if (phase === "summary") {
    return chapterMeta[summaryKey] ?? chapterMeta.prologue;
  }

  if (phase === "prologue") return chapterMeta.prologue;

  if (
    phase === "caseOpen" ||
    phase === "round1Hub" ||
    phase === "round1Story" ||
    phase === "focus1" ||
    (phase === "hiddenStory" && hiddenContext === "first")
  ) {
    return chapterMeta.round1;
  }

  if (
    phase === "round2Intro" ||
    phase === "round2Hub" ||
    phase === "round2Story" ||
    phase === "focus2" ||
    (phase === "hiddenStory" && hiddenContext === "second")
  ) {
    return chapterMeta.round2;
  }

  if (
    phase === "reconstruction" ||
    phase === "finalChoice" ||
    phase === "wrong"
  ) {
    return chapterMeta.reconstruction;
  }

  return chapterMeta.truth;
}

/* =========================================================
   PROLOGUE
========================================================= */

const prologueScenes = [
  {
    speaker: "내레이션",
    background: asset.flight,
    text: "종강 여행을 마친 다섯 명은 한국으로 돌아가는 비행기에 올랐다.",
  },

  {
    speaker: "내레이션",
    background: asset.cabin,
    text: "긴 일정이 끝났다는 안도감에 기내에는 평소 같은 대화가 이어졌다.",
  },

  // 초반 합류 연출: 소희 단독 → 정은 단독 → 정은+지영 2인 구도
  {
    speaker: "전소희",
    background: asset.cabin,
    character: asset.soheePose2,
    fixedPosition: "center",
    animation: "soft",
    soheePose2Intro: true,
    text: "와, 진짜 끝났다. 한국 도착하면 바로 누울 거야.",
  },

  {
    speaker: "최정은",
    background: asset.cabin,
    character: asset.jeongeun,
    fixedPosition: "left",
    animation: "quickLeft",
    text: "사진부터 정리해야 돼.",
  },

  {
    speaker: "유지영",
    background: asset.cabin,
    characters: [
      { id: "jeongeun", src: asset.jeongeun, slot: "left", animation: "none" },
      { id: "jiyoung", src: asset.jiyoung, slot: "right", animation: "quickRight" },
    ],
    text: "그래도 이번 여행, 다들 고생하긴 했다.",
  },

  // 평소라면 현수가 먼저 사진을 제안했을 법하지만, 이날은 승근이 먼저 운을 뗀다.
  {
    speaker: "전승근",
    background: asset.cabin,
    character: asset.seunggeun,
    fixedPosition: "center",
    animation: "soft",
    text: "야, 우리 사진 한 장 더 찍자. 이번엔 좀 제대로.",
  },

  {
    speaker: "김현수",
    background: asset.cabin,
    character: asset.hyeonsu,
    fixedPosition: "right",
    animation: "soft",
    text: "그래, 찍자.",
  },

  {
    speaker: "내레이션",
    background: asset.groupScene,
    selfieFlash: true,
    text: "그렇게 다섯은 귀국길의 마지막 단체사진을 남겼다.",
  },

  {
    speaker: "내레이션",
    background: asset.cabin,
    text: "비행기가 출발하고 얼마 지나지 않아, 화장실에서 돌아오던 소희가 승근이 유난히 조용한 걸 알아챘다.",
  },

  {
    speaker: "전소희",
    background: asset.cabin,
    character: asset.sohee,
    fixedPosition: "center",
    animation: "soft",
    text: "근데 승근이 왜 이렇게 조용해? 승근아?",
  },

  {
    speaker: "전소희",
    background: asset.cabin,
    character: asset.sohee,
    fixedPosition: "center",
    animation: "none",
    text: "야, 전승근. 자?",
  },

  {
    speaker: "내레이션",
    background: asset.drowsyScene,
    deathDiscovery: true,
    darkness: 0.18,
    text: "소희가 가까이 다가가 승근의 상태를 확인했다.",
  },

  {
    speaker: "내레이션",
    background: asset.drowsyScene,
    text: "승근은 숨을 쉬지 않고 있었다.",
    darkness: 0.22,
  },

  {
    speaker: "전소희",
    background: asset.drowsyScene,
    character: asset.soheeProfile,
    fixedPosition: "center",
    animation: "soft",
    emphasis: true,
    text: "승근아!!",
    darkness: 0.24,
  },

  {
    speaker: "유지영",
    background: asset.drowsyScene,
    character: asset.jiyoung,
    fixedPosition: "right",
    animation: "soft",
    text: "잠깐... 어떡해. 우리 어떡해...?",
    darkness: 0.24,
  },

  {
    speaker: "내레이션",
    background: asset.drowsyScene,
    text: "모두가 얼어붙은 사이, 승근의 손 근처에서 작은 메모가 발견됐다.",
    darkness: 0.25,
  },

  {
    speaker: "내레이션",
    background: asset.drowsyScene,
    text: "급히 남긴 듯 흐트러진 글씨. 죽기 전 남긴 마지막 메시지였다.",
    darkness: 0.25,
  },

  {
    speaker: "",
    background: asset.cabin,
    prop: asset.dyingMessageNote,
    propType: "note",
    text: "",
    imageOnly: true,
    dyingMessageReveal: true,
    darkness: 0.25,
  },

  {
    speaker: "내레이션",
    background: asset.cabin,
    prop: asset.dyingMessageNote,
    propType: "note",
    dyingMessageHold: true,
    text: "메모에는 이렇게 쓰여 있었다.",
    darkness: 0.25,
  },

  {
    speaker: "내레이션",
    background: asset.cabin,
    prop: asset.dyingMessageNote,
    propType: "note",
    dyingMessageHold: true,
    text: "“우리 모두 같았는데.”",
    darkness: 0.28,
  },
];

/* =========================================================
   FIRST INVESTIGATION
========================================================= */

const firstInterviews = {
  jiyoung: [
    {
      speaker: "유지영",
      background: asset.cabin,

      character: asset.jiyoung,
      position: "right",

      text:
        "여행비 때문에 좀 싸운 건 맞아. 정산이 계속 안 맞았거든.",
    },

    {
      speaker: "유지영",
      background: asset.cabin,

      character: asset.jiyoungProfile,
      position: "left",

      text:
        "그래도 그게 끝이야. 사진 찍고 나서는 계속 자리에서 영화 보고 있었고.",
    },

    {
      speaker: "유지영",
      background: asset.cabin,
      character: asset.jiyoungProfile,
      fixedPosition: "left",
      emphasis: true,
      text: "아, 마지막 단체사진. 그때 승근이 표정이 평소랑 조금 달랐어.",
    },

    {
      speaker: "내레이션",
      background: asset.cabin,
      prop: asset.groupPhoto,
      propType: "photoFocus",
      text: "사진을 다시 확인하자, 승근의 표정은 다른 사람들과 미묘하게 달라 보였다.",
    },

    {
      speaker: "유지영",
      background: asset.cabinAlt,

      character: asset.jiyoung,
      position: "right",

      text:
        "사건이 일어날 때까지 거의 자리에서 안 움직였어. 그게 내가 말할 수 있는 전부야.",
    },
  ],

  sohee: [
    {
      speaker: "전소희",
      background: asset.cabin,

      character: asset.sohee,
      position: "left",

      text:
        "집안끼리 오래된 문제 때문에 승근이랑 몇 번 부딪힌 적은 있어.",
    },

    {
      speaker: "전소희",
      background: asset.cabin,

      character: asset.soheeProfile,
      position: "right",

      text:
        "그래도 이번 여행에서 크게 싸우거나 한 건 없어.",
    },

    {
      speaker: "전소희",
      background: asset.collapseScene,
      text: "화장실 다녀오다가 승근이가 너무 조용해서 말을 걸었어.",
      darkness: 0.34,
    },

    {
      speaker: "전소희",
      background: asset.collapseScene,
      text: "아무 대답이 없어서 그때 처음 이상하다는 걸 알았어.",
      darkness: 0.38,
    },
  ],

  jeongeun: [
    {
      speaker: "최정은",
      background: asset.cabin,
      character: asset.jeongeun,
      position: "right",
      text: "액세서리 하나를 빌려줬다가 잃어버린 적은 있어.",
    },

    {
      speaker: "최정은",
      background: asset.cabin,
      character: asset.jeongeunProfile,
      position: "left",
      emphasis: true,
      text: "사진 찍고 난 뒤엔 따뜻한 물 받으러 갔어.",
    },

    {
      speaker: "최정은",
      background: asset.cabinAlt,
      character: asset.jeongeun,
      position: "right",
      text: "승근이 컵은 안 만졌어.",
    },
  ],

  hyeonsu: [
    {
      speaker: "김현수",
      background: asset.cabin,

      character: asset.hyeonsu,
      position: "left",

      text:
        "승근이랑 메인 자리 때문에 조금 경쟁했던 건 맞아. 원래 나도 후보였으니까.",
    },

    {
      speaker: "김현수",
      background: asset.cabin,

      character: asset.hyeonsuProfile,
      position: "right",

      text:
        "기분이 아예 안 나빴다고 하면 거짓말이겠지만, 여행까지 와서 계속 그걸로 싸운 건 아니야.",
    },

    {
      speaker: "김현수",
      background: asset.cabinAlt,

      character: asset.hyeonsu,
      position: "left",

      text:
        "사진 찍고 나서는 내 자리 쪽에서 쉬었어. 승근이 쪽으로는 안 갔고.",
    },
  ],
};

/* =========================================================
   HIDDEN FILE
========================================================= */

const hiddenFiles = {
  jiyoung: [
    {
      speaker: "유지영",
      background: asset.cabin,
      character: asset.jiyoung,
      position: "right",
      text: "사실... 내가 영화 보고 있었다고 했잖아.",
    },
    {
      speaker: "유지영",
      background: asset.cabin,
      character: asset.jiyoung,
      position: "right",
      animation: "none",
      text: "그게 뭐였냐면...",
    },
    {
      speaker: "유지영",
      background: asset.cabin,
      character: asset.jiyoung,
      position: "right",
      animation: "none",
      text: "......",
    },
    {
      speaker: "유지영",
      background: asset.cabin,
      character: asset.jiyoungProfile,
      position: "left",
      emphasis: true,
      text: "뿌이뿌이 모루카였어.",
    },
    {
      speaker: "유지영",
      background: asset.cabin,
      character: asset.jiyoung,
      position: "right",
      text: "기니피그가 자동차가 되는 건데... 아니, 왜 설명하고 있지.",
    },
    {
      speaker: "유지영",
      background: asset.cabinAlt,
      character: asset.jiyoung,
      position: "right",
      text: "승근이가 내 인형 가져가서 장난치는 것도 진짜 싫었어.",
      note: "돈 문제 말고도 오래 쌓인 불만이 있었다.",
    },
  ],

  sohee: [
    {
      speaker: "전소희",
      background: asset.cabin,

      character: asset.sohee,
      position: "left",

      text:
        "사실 입학하기 전에는 무용을 전공했어.",
    },

    {
      speaker: "전소희",
      background: asset.cabin,

      character: asset.soheeProfile,
      position: "right",

      text:
        "근데 그걸 학교에서 굳이 말하고 다니고 싶진 않았거든.",
    },

    {
      speaker: "전소희",
      background: asset.cabinAlt,

      character: asset.sohee,
      position: "left",

      text:
        "같이 수업 들을 때 승근이가 내가 무용 했었다는 걸 되게 자랑스럽게 얘기하고 다녔어.",
    },

    {
      speaker: "전소희",
      background: asset.cabinAlt,

      character: asset.soheeProfile,
      position: "right",

      text:
        "처음엔 좀 곤란했지. 승근아, 그 얘기 굳이 안 해도 된다고 말한 적도 있었고.",
    },

    {
      speaker: "전소희",
      background: asset.cabin,

      character: asset.sohee,
      position: "left",

      text:
        "근데 같이 수업 듣고 지내면서 그런 건 아무렇지 않아졌어. 지금 와서 그걸 원한이라고 하면 나도 억울하지.",
    },
  ],

  jeongeun: [
    {
      speaker: "최정은",
      background: asset.cabin,
      character: asset.jeongeun,
      position: "right",
      text: "승근이는 자기 의견이 센 편이었어.",
    },
    {
      speaker: "최정은",
      background: asset.cabin,
      character: asset.jeongeun,
      position: "right",
      text: "조율할 때 부딪힌 적은 있었고.",
    },
    {
      speaker: "최정은",
      background: asset.cabinAlt,
      character: asset.jeongeunProfile,
      position: "left",
      emphasis: true,
      text: "그래도 내가 팀장이니까 정리해야 했지.",
    },
    {
      speaker: "최정은",
      background: asset.cabin,
      character: asset.jeongeun,
      position: "right",
      text: "승근이도 결국 양보했고. 그 마음은 알고 있었어.",
    },
  ],

  hyeonsu: [
    {
      speaker: "김현수",
      background: asset.cabin,

      character: asset.hyeonsu,
      position: "left",

      text:
        "이번 프로젝트에서 내가 팀장 맡았던 건 맞아. 신경 쓸 게 꽤 많았지.",
    },

    {
      speaker: "김현수",
      background: asset.cabin,

      character: asset.hyeonsuProfile,
      position: "right",

      text:
        "전체 퀄리티 신경 쓴다고 마감 직전까지 수정한 적도 많았고, 승근이가 그런 걸로 놀린 적도 있었어.",
    },

    {
      speaker: "김현수",
      background: asset.cabinAlt,

      character: asset.hyeonsu,
      position: "left",

      text:
        "원래 내가 유력했던 피날레 메인 자리도 결국 승근이한테 갔고.",
    },

    {
      speaker: "김현수",
      background: asset.cabinAlt,

      character: asset.hyeonsuProfile,
      position: "right",

      text:
        "기분이 아예 안 나빴다고 하면 그게 더 거짓말이지.",
    },

    {
      speaker: "김현수",
      background: asset.cabin,

      character: asset.hyeonsu,
      position: "left",

      text:
        "근데 마지막 리허설 끝나고 승근이랑 둘이 쌀국수도 먹으러 갔어.",
    },

    {
      speaker: "김현수",
      background: asset.cabin,

      character: asset.hyeonsuProfile,
      position: "right",

      text:
        "내가 진짜 승근이를 그렇게 싫어했으면 둘이 밥 먹으러 갔겠냐.",
    },

    {
      speaker: "추가 증언",
      background: asset.cabinAlt,

      text:
        "커피가 전달되던 무렵, 피해자 근처 좌석에서는 '승근아, 네 거 여기'라는 말이 들렸다.",

      note:
        "목소리가 들렸다는 사실만 확인됐고, 정확한 화자는 특정되지 않았다.",
    },
  ],
};

/* =========================================================
   SECOND INVESTIGATION
========================================================= */

const secondInterviews = {
  jiyoung: [
    {
      speaker: "유지영",
      background: asset.cabin,
      character: asset.jiyoung,
      position: "left",
      text: "단체사진 찍고 바로 자리로 돌아갔어.",
    },
    {
      speaker: "사건 기록",
      background: asset.cabinAlt,
      text: "단체사진 직후 지영의 좌석 화면에서 영상 재생이 다시 시작됐다.",
    },
    {
      speaker: "사건 기록",
      background: asset.cabinAlt,
      text: "이후 자막과 음량을 조작한 기록이 일정한 간격으로 남아 있다.",
      note: "재생 기록은 지영의 진술과 시간대를 대조할 수 있는 자료다.",
    },
    {
      speaker: "유지영",
      background: asset.cabin,
      character: asset.jiyoungProfile,
      fixedPosition: "right",
      emphasis: true,
      text: "사진 뒤에는 계속 내 자리였어. 재생 기록 시간도 확인해 봐.",
    },
    {
      speaker: "사건 기록",
      background: asset.cabinAlt,
      text: "좌석 화면의 재생·조작 기록은 지영의 진술과 대체로 이어진다. 다만 기록만으로 모든 순간의 위치를 단정할 수는 없다.",
    },
  ],

  sohee: [
    {
      speaker: "사건 기록",
      background: asset.cabinAlt,

      text:
        "사건 전, 소희와 피해자가 짧게 언성을 높이는 것을 들었다는 승객이 나타났다.",
    },

    {
      speaker: "전소희",
      background: asset.cabin,

      character: asset.soheeProfile,
      fixedPosition: "right",
      emphasis: true,

      text:
        "...잠깐 말다툼한 건 맞아. 괜히 이런 상황에서 더 의심받기 싫어서 말 안 했어.",
    },

    {
      speaker: "사건 기록",
      background: asset.cabinAlt,
      text: "사건 전후 소희가 기내 뒤쪽으로 이동하는 모습이 승무원에게 목격됐다.",
    },

    {
      speaker: "사건 기록",
      background: asset.cabinAlt,
      text: "화장실 대기 기록과 승무원 기억에 소희의 이동 흔적이 남아 있다.",
      note: "기록마다 시각에 차이가 있어 다른 진술과 직접 대조해야 한다.",
    },
  ],

  jeongeun: [
    {
      speaker: "사건 기록",
      background: asset.coffeeCloseup,

      text:
        "피해자가 마신 종이컵에서 최정은의 지문이 발견됐다.",

      note:
        "1차 진술에서 정은은 컵을 건드린 적이 없다고 말했다.",
    },

    {
      speaker: "조사 기록",
      background: asset.cabinAlt,

      character: asset.jeongeunProfile,
      position: "left",

      text:
        "컵을 건드린 적 없다고 했죠.",
    },

    {
      speaker: "최정은",
      background: asset.cabin,

      character: asset.jeongeunProfile,
      fixedPosition: "right",

      text: "...",
    },

    {
      speaker: "최정은",
      background: asset.cabin,

      character: asset.jeongeun,
      position: "left",

      text:
        "만진 건 맞아. 통로 쪽으로 떨어질 것 같아서 안쪽으로 밀어놨어. 그게 전부야.",

      note:
        "컵을 만진 사실을 숨긴 것은 사실이었다.",
    },

    {
      speaker: "사건 기록",
      background: asset.cabinAlt,

      text:
        "커피가 전달될 무렵 정은은 기내 뒤쪽에서 승무원에게 따뜻한 물을 요청하고 기다렸다.",

      note:
        "그 순간 정은의 위치는 승무원이 직접 확인했다.",
    },
  ],

  hyeonsu: [
    {
      speaker: "김현수",
      background: asset.cabin,

      character: asset.hyeonsu,
      position: "left",

      text:
        "팔찌? 사진 찍을 때까진 나도 하고 있었어. 찍고 나서 불편해서 뺐어.",
    },

    {
      speaker: "사건 기록",
      background: asset.cabinAlt,

      prop: asset.groupPhoto,
      propType: "photoFocus",

      text:
        "하지만 마지막 단체사진에서 현수의 팔목에는 이미 팔찌가 보이지 않는다.",
    },

    {
      speaker: "사건 기록",
      background: asset.cabinAlt,

      text:
        "'사진 이후에 팔찌를 뺐다'는 현수의 진술은 사진 기록과 일치하지 않는다.",
    },

    {
      speaker: "사건 기록",
      background: asset.cabinAlt,

      text:
        "커피가 전달되던 순간, 현수의 좌석 기록은 없었다. 그를 봤다는 독립적인 증언도 없었다.",
    },

    {
      speaker: "추가 증언",
      background: asset.cabinAlt,

      text:
        "피해자 근처 좌석의 승객은 커피가 전달되던 순간 '승근아, 네 거 여기'라는 말을 들었다고 기억했다.",

      note:
        "이름을 부르는 방식만으로 특정 인물을 단정할 수는 없다.",
    },

    {
      speaker: "김현수",
      background: asset.cabin,

      character: asset.hyeonsuProfile,
      fixedPosition: "left",
      emphasis: true,

      text:
        "난 사진 이후 승근이 자리 쪽으로 안 갔어.",

      note:
        "팔찌 제거 시점뿐 아니라 사건 당시의 행동에서도 설명되지 않는 모순이 남았다.",
    },
  ],
};

/* =========================================================
   TRUTH
========================================================= */

const truthScenes = [
  {
    speaker: "사건 기록",
    background: asset.cabinAlt,

    text:
      "최종 지목이 끝났다. 이제 흩어진 진술과 기록을 실제 시간순으로 다시 놓아본다.",
  },

  {
    speaker: "내레이션",
    background: asset.airportScene,
    text: "김현수는 비행기가 출발하기 전부터 전승근을 죽일 계획을 세우고 있었다.",
    darkness: 0.28,
  },

  {
    speaker: "내레이션",
    background: asset.airportScene,
    text: "모두에게는 평범한 귀국 일정이었지만, 현수에게는 이미 계획된 범행의 시작이었다.",
    darkness: 0.32,
  },

  {
    speaker: "내레이션",
    background: asset.cabin,
    character: asset.hyeonsuProfile,
    fixedPosition: "right",

    text:
      "지영, 소희, 정은이 숨긴 것은 의심받을 만한 감정이나 행동이었다. 현수가 숨긴 것은 사건 당일의 시간과 동선이었다.",
  },

  {
    speaker: "사건 기록",
    background: asset.cabin,
    prop: asset.groupPhoto,
    propType: "photoFocus",

    text:
      "마지막 단체사진에서 현수의 팔목에는 이미 모두가 맞춰 찬 기념 팔찌가 없었다.",

    note:
      "'사진을 찍은 뒤 팔찌를 뺐다'는 현수의 진술은 사진 기록과 일치하지 않는다.",
  },

  {
    speaker: "내레이션",
    background: asset.coffeeCloseup,

    text:
      "음료 서비스가 시작된 뒤, 현수는 승근에게 전달될 커피에 손을 댔다.",
  },

  {
    speaker: "김현수",
    background: asset.coffeeCloseup,
    character: asset.hyeonsuProfile,
    fixedPosition: "right",
    emphasis: true,

    text:
      "승근아, 네 거 여기.",

    note:
      "승근은 휴대폰을 보고 있어 커피를 건넨 사람의 손목을 제대로 확인하지 못했다.",
  },

  {
    speaker: "전승근",
    background: asset.coffeeCloseup,
    character: asset.seunggeunProfile,
    fixedPosition: "left",

    text:
      "어, 고마워.",
  },

  {
    speaker: "내레이션",
    background: asset.cabin,

    text:
      "커피를 마신 뒤에도 당장은 아무 일도 일어나지 않았다. 평소라면 먼저 사진을 찍자고 했을 현수도 그날은 조용했다.",
  },

  {
    speaker: "전승근",
    background: asset.cabin,
    character: asset.seunggeunProfile,
    fixedPosition: "center",

    text:
      "근데 우리 사진 한 장도 안 찍었네. 가기 전에 하나 찍자.",
  },

  {
    speaker: "김현수",
    background: asset.cabin,
    character: asset.hyeonsuProfile,
    fixedPosition: "right",

    text:
      "어, 그래. 찍자.",
  },

  {
    speaker: "내레이션",
    background: asset.groupScene,

    text:
      "그렇게 남은 것이 다섯 사람의 마지막 단체사진이었다. 사진을 찍을 때 승근은 이미 독이 든 커피를 마신 뒤였다.",
  },

  {
    speaker: "유지영",
    background: asset.cabin,
    prop: asset.groupPhoto,
    propType: "photoFocus",
    text: "여기 봐. 승근이 표정 좀 이상하지 않아?",
  },

  {
    speaker: "김현수",
    background: asset.cabin,
    prop: asset.groupPhoto,
    propType: "photoFocus",
    text: "피곤해서 그런 거겠지. 신경 쓰지 마.",
  },

  {
    speaker: "유지영",
    background: asset.cabin,
    prop: asset.groupPhoto,
    propType: "photoFocus",
    text: "…그런가?",
  },

  {
    speaker: "내레이션",
    background: asset.cabin,
    prop: asset.groupPhoto,
    propType: "photoFocus",
    text: "당시에는 누구도 그 표정의 의미를 알지 못했다.",
    note: "사진은 승근이 커피를 마신 뒤, 이상 증세가 나타나기 직전에 촬영됐다.",
  },

  {
    speaker: "전승근",
    background: asset.cabin,
    character: asset.seunggeunProfileAlt1,
    fixedPosition: "center",
    animation: "soft",

    text: "어...?",

    darkness: 0.12,
    blur: 0.2,
  },

  {
    speaker: "전승근",
    background: asset.cabin,
    character: asset.seunggeunProfileAlt2,
    fixedPosition: "center",
    animation: "soft",

    text: "잠깐...",

    darkness: 0.3,
    blur: 0.45,
  },

  {
    speaker: "내레이션",
    background: asset.drowsyScene,
    text: "승근의 몸에서 힘이 빠지기 시작했다.",
    darkness: 0.36,
    blur: 0.5,
  },

  {
    speaker: "내레이션",
    background: asset.drowsyScene,
    text: "결국 승근은 더 이상 몸을 버티지 못했다.",
    darkness: 0.42,
    blur: 0.65,
  },

  {
    speaker: "전승근",
    background: asset.drowsyScene,

    text:
      "우리 모두... 같았는데.",

    note:
      "마지막 순간 승근이 떠올린 것은 모두에게 있어야 했던 팔찌와, 커피를 건넨 사람의 비어 있던 손목이었다.",

    darkness: 0.58,
    blur: 0.8,
  },
];

/* =========================================================
   WRONG RESULT
========================================================= */

const wrongCopy = {
  jiyoung: {
    title: "유지영은 범인이 아니다.",
    reaction: ["아니, 내가 왜 범인이야?", "나 진짜 아니라고."],

    body:
      "지영의 진술에는 숨긴 부분이 있었지만, 좌석 화면 기록과 주변 진술까지 함께 놓으면 그것만으로 범행을 설명하기 어렵다.",
  },

  sohee: {
    title: "전소희는 범인이 아니다.",
    reaction: ["뭐?", "나를 범인으로 찍었다고?"],

    body:
      "소희가 숨긴 말다툼과 기내 뒤쪽 이동만으로는 문제의 커피 전달까지 설명되지 않는다.",
  },

  jeongeun: {
    title: "최정은은 범인이 아니다.",
    reaction: ["…진심이야?", "기분 나쁘네."],

    body:
      "정은의 지문은 중요한 단서였지만, 컵을 만진 시점과 커피가 전달된 시점을 따로 대조하면 하나의 결론으로 바로 이어지지 않는다.",
  },
};

/* =========================================================
   HELPERS
========================================================= */

function useMysteryMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");

    const sync = () => {
      setIsMobile(media.matches);
    };

    sync();

    media.addEventListener?.("change", sync);

    return () => {
      media.removeEventListener?.("change", sync);
    };
  }, []);

  return isMobile;
}

function addUnique(list, value) {
  if (list.includes(value)) {
    return list;
  }

  return [...list, value];
}

/*
 * 한 화면에 대사 + 설명을 같이 넣지 않음.
 *
 * note가 있으면 NEXT 한 장을 추가해서
 * 설명을 별도 화면으로 분리합니다.
 */
function splitStoryText(text = "", maxLength = 42) {
  const normalized = String(text ?? "").trim();

  if (!normalized) {
    return [""];
  }

  /*
   * 글자 수를 맞추기 위해 문장 한가운데를 자르지 않는다.
   * "하지 / 않는다", "가능성이 / 있다", 인용문 중간 분할 같은
   * 기계적인 끊김은 금지.
   *
   * 여러 개의 완결된 문장이 있을 때만 NEXT 단위로 나누며,
   * 한 문장이 길더라도 그 문장은 한 화면에 유지한다.
   */
  const sentences =
    normalized.match(/[^.!?…]+(?:[.!?]+|…+|$)/g)?.map((part) => part.trim()).filter(Boolean) ??
    [normalized];

  if (sentences.length <= 1) {
    return [normalized];
  }

  const chunks = [];
  let current = "";

  sentences.forEach((sentence) => {
    const candidate = current ? `${current} ${sentence}` : sentence;

    if (current && candidate.length > maxLength) {
      chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  });

  if (current) {
    chunks.push(current);
  }

  return chunks.length ? chunks : [normalized];
}

function normalizeStoryScene(scene) {
  if (
    scene?.character &&
    storyProfileToBase.has(scene.character) &&
    !scene.emphasis
  ) {
    return {
      ...scene,
      character: storyProfileToBase.get(scene.character),
    };
  }

  return scene;
}

function expandStoryScenes(scenes = []) {
  return scenes.flatMap((originalScene) => {
    const scene = normalizeStoryScene(originalScene);
    const { note } = scene;
    const dialogueChunks = splitStoryText(scene.text);

    const dialogueScenes = dialogueChunks.map((text, index) => ({
      ...scene,
      note: undefined,
      text,
      animation: index === 0 ? scene.animation : "none",
      deathDiscovery: index === 0 ? scene.deathDiscovery : false,
    }));

    if (!note) {
      return dialogueScenes;
    }

    const {
      character,
      position,
      fixedPosition,
      characters,
      emphasis,
      ...rest
    } = scene;

    const explanationScenes = splitStoryText(note).map((text) => ({
      ...rest,
      note: undefined,
      speaker: "내레이션",
      text,
      character: undefined,
      characters: undefined,
      position: undefined,
      fixedPosition: undefined,
      emphasis: undefined,
      animation: "none",
      deathDiscovery: false,
      prop: scene.prop,
      propType: scene.propType,
      explanation: true,
    }));

    return [...dialogueScenes, ...explanationScenes];
  });
}

/* =========================================================
   MAIN
========================================================= */

const MIN_INVESTIGATED = 2;
const canEnterFocus = (visited) => visited.length >= MIN_INVESTIGATED;

export default function MysteryEvent({ onExit }) {
  const isMobile = useMysteryMobile();

  const [phase, setPhase] = useState("cover");

  const [storyIndex, setStoryIndex] = useState(0);

  const [activeSuspect, setActiveSuspect] =
    useState(null);

  const [visitedRound1, setVisitedRound1] =
    useState([]);

  const [visitedRound2, setVisitedRound2] =
    useState([]);

  const [firstFocus, setFirstFocus] =
    useState(null);

  const [secondFocus, setSecondFocus] =
    useState(null);

  const [hiddenContext, setHiddenContext] =
    useState(null);

  const [wrongSuspect, setWrongSuspect] =
    useState(null);

  const [pendingCulprit, setPendingCulprit] =
    useState(null);

  const [pendingSelection, setPendingSelection] =
    useState(null);

  const [verdictSuspect, setVerdictSuspect] =
    useState(null);

  const [warning, setWarning] =
    useState(null);

  const [homeConfirm, setHomeConfirm] =
    useState(false);

  const [skipConfirm, setSkipConfirm] =
    useState(false);

  const [summaryKey, setSummaryKey] =
    useState(null);

  const [summaryNextPhase, setSummaryNextPhase] =
    useState(null);

  const hiddenUnlocked = useMemo(
    () =>
      [firstFocus, secondFocus].filter(
        Boolean
      ),
    [firstFocus, secondFocus]
  );

  /* =======================================================
     MOBILE BODY LOCK
  ======================================================= */

  useEffect(() => {
    if (!isMobile) {
      return undefined;
    }

    const bodyOverflow =
      document.body.style.overflow;

    const htmlOverflow =
      document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";

    document.documentElement.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        bodyOverflow;

      document.documentElement.style.overflow =
        htmlOverflow;
    };
  }, [isMobile]);

  /* =======================================================
     RESET
  ======================================================= */

  const restart = () => {
    setPhase("cover");

    setStoryIndex(0);

    setActiveSuspect(null);

    setVisitedRound1([]);
    setVisitedRound2([]);

    setFirstFocus(null);
    setSecondFocus(null);

    setHiddenContext(null);

    setWrongSuspect(null);
    setPendingCulprit(null);
    setPendingSelection(null);
    setVerdictSuspect(null);

    setWarning(null);

    setHomeConfirm(false);
    setSkipConfirm(false);
    setSummaryKey(null);
    setSummaryNextPhase(null);
  };

  const currentChapter = getChapterForPhase(
    phase,
    hiddenContext,
    summaryKey
  );

  const openSummary = (key, nextPhase) => {
    setSummaryKey(key);
    setSummaryNextPhase(nextPhase);
    setStoryIndex(0);
    setActiveSuspect(null);
    setPhase("summary");
  };

  const continueFromSummary = () => {
    const next = summaryNextPhase ?? "caseOpen";
    setSummaryKey(null);
    setSummaryNextPhase(null);
    setPhase(next);
  };

  const canSkipChapter = [
    "prologue",
    "round1Hub",
    "round1Story",
    "round2Intro",
    "round2Hub",
    "round2Story",
  ].includes(phase);

  const confirmSkipChapter = () => {
    setSkipConfirm(false);

    if (phase === "prologue") {
      setStoryIndex(0);
      setPhase("caseOpen");
      return;
    }

    if (phase === "round1Hub" || phase === "round1Story") {
      setVisitedRound1(suspects.map((suspect) => suspect.id));
      openSummary("round1", "round2Intro");
      return;
    }

    if (
      phase === "round2Intro" ||
      phase === "round2Hub" ||
      phase === "round2Story"
    ) {
      setVisitedRound2(suspects.map((suspect) => suspect.id));
      openSummary("round2", "reconstruction");
    }
  };

  const requestHome = () => {
    setHomeConfirm(true);
  };

  const leaveToEventHome = () => {
    setHomeConfirm(false);
    onExit?.();
  };

  /* =======================================================
     CURRENT STORY
  ======================================================= */

  const currentStory = useMemo(() => {
    let source = null;

    if (phase === "prologue") {
      source = prologueScenes;
    }

    if (
      phase === "round1Story" &&
      activeSuspect
    ) {
      source =
        firstInterviews[activeSuspect];
    }

    if (
      phase === "round2Story" &&
      activeSuspect
    ) {
      source =
        secondInterviews[activeSuspect];
    }

    if (
      phase === "hiddenStory" &&
      activeSuspect
    ) {
      source =
        hiddenFiles[activeSuspect];
    }

    if (phase === "truth") {
      source = truthScenes;
    }

    if (!source) {
      return null;
    }

    return expandStoryScenes(source);
  }, [phase, activeSuspect]);

  /* =======================================================
     PREV
     = 직전 장면
  ======================================================= */

  const handleStoryPrev = () => {
    if (storyIndex > 0) {
      setStoryIndex(
        (value) => value - 1
      );

      return;
    }

    if (phase === "prologue") {
      setPhase("cover");
      return;
    }

    if (phase === "round1Story") {
      setActiveSuspect(null);
      setPhase("round1Hub");
      return;
    }

    if (phase === "round2Story") {
      setActiveSuspect(null);
      setPhase("round2Hub");
      return;
    }

    if (phase === "hiddenStory") {
      setActiveSuspect(null);

      if (hiddenContext === "first") {
        setPhase("focus1");
      } else {
        setPhase("focus2");
      }

      return;
    }

    if (phase === "truth") {
      if (verdictSuspect) {
        setPhase("verdict");
      } else {
        setPhase("finalChoice");
      }
    }
  };

  /* =======================================================
     NEXT
  ======================================================= */

  const handleStoryNext = () => {
    if (!currentStory) {
      return;
    }

    if (
      storyIndex <
      currentStory.length - 1
    ) {
      setStoryIndex(
        (value) => value + 1
      );

      return;
    }

    if (phase === "prologue") {
      setStoryIndex(0);
      setPhase("caseOpen");
      return;
    }

    if (phase === "round1Story") {
      setVisitedRound1((list) =>
        addUnique(
          list,
          activeSuspect
        )
      );

      setStoryIndex(0);
      setActiveSuspect(null);

      setPhase("round1Hub");

      return;
    }

    if (phase === "round2Story") {
      setVisitedRound2((list) =>
        addUnique(
          list,
          activeSuspect
        )
      );

      setStoryIndex(0);
      setActiveSuspect(null);

      setPhase("round2Hub");

      return;
    }

    if (phase === "hiddenStory") {
      setStoryIndex(0);
      setActiveSuspect(null);

      if (hiddenContext === "first") {
        setHiddenContext(null);
        openSummary("round1", "round2Intro");
      } else {
        setHiddenContext(null);
        openSummary("round2", "reconstruction");
      }

      return;
    }

    if (phase === "truth") {
      setStoryIndex(0);

      setPhase("culprit");
    }
  };

  /* =======================================================
     BACK
     = 직전 장면이 아니라 직전 챕터 시작
  ======================================================= */

  const handleChapterBack = () => {
    /*
     * COVER
     * -> 이벤트 목록
     */
    if (phase === "cover") {
      onExit?.();
      return;
    }

    /*
     * PROLOGUE
     * -> COVER
     */
    if (phase === "prologue") {
      setStoryIndex(0);
      setPhase("cover");

      return;
    }

    /*
     * CASE OPEN
     * -> PROLOGUE 처음
     */
    if (phase === "caseOpen") {
      setStoryIndex(0);
      setPhase("prologue");

      return;
    }

    /*
     * 1차 조사 전체
     * -> CASE OPEN
     */
    if (
      phase === "round1Hub" ||
      phase === "round1Story" ||
      phase === "focus1"
    ) {
      setStoryIndex(0);
      setActiveSuspect(null);

      setPhase("caseOpen");

      return;
    }

    /*
     * HIDDEN 01
     * -> 1차 조사 허브
     */
    if (
      phase === "hiddenStory" &&
      hiddenContext === "first"
    ) {
      setStoryIndex(0);
      setActiveSuspect(null);

      setPhase("round1Hub");

      return;
    }

    /*
     * 2차 조사 전체
     * -> HIDDEN FILE 01 처음
     */
    if (
      phase === "round2Intro" ||
      phase === "round2Hub" ||
      phase === "round2Story" ||
      phase === "focus2"
    ) {
      if (firstFocus) {
        setActiveSuspect(
          firstFocus
        );

        setHiddenContext("first");

        setStoryIndex(0);

        setPhase("hiddenStory");
      } else {
        setPhase("round1Hub");
      }

      return;
    }

    /*
     * HIDDEN 02
     * -> 2차 조사 허브
     */
    if (
      phase === "hiddenStory" &&
      hiddenContext === "second"
    ) {
      setStoryIndex(0);
      setActiveSuspect(null);

      setPhase("round2Hub");

      return;
    }

    /*
     * FINAL RECONSTRUCTION
     * -> HIDDEN FILE 02 처음
     */
    if (phase === "reconstruction") {
      if (secondFocus) {
        setActiveSuspect(
          secondFocus
        );

        setHiddenContext("second");

        setStoryIndex(0);

        setPhase("hiddenStory");
      } else {
        setPhase("round2Hub");
      }

      return;
    }

    /*
     * FINAL ACCUSATION
     * -> FINAL RECONSTRUCTION
     */
    if (phase === "finalChoice") {
      setPhase("reconstruction");
      return;
    }

    /*
     * VERDICT / WRONG
     * -> FINAL ACCUSATION
     */
    if (phase === "verdict" || phase === "wrong") {
      setPendingCulprit(null);
      setVerdictSuspect(null);
      setPhase("finalChoice");
      return;
    }

    /*
     * THE TRUTH
     * -> 정답 판정 화면
     */
    if (phase === "truth") {
      setStoryIndex(0);

      if (verdictSuspect) {
        setPhase("verdict");
      } else {
        setPhase("finalChoice");
      }

      return;
    }

    /*
     * CULPRIT
     * -> THE TRUTH 처음
     */
    if (phase === "culprit") {
      setStoryIndex(0);
      setPhase("truth");

      return;
    }

    /*
     * REWARD
     * -> CULPRIT
     */
    if (phase === "reward") {
      setPhase("culprit");
      return;
    }

    setPhase("cover");
  };

  /* =======================================================
     INVESTIGATION / FOCUS CONFIRMATION
  ======================================================= */

  const requestSelection = (kind, id) => {
    // 일반 1차/2차 조사는 카드 클릭 즉시 진입한다.
    // "한 번 지정하면 변경 불가" 확인창은 집중 조사에만 사용한다.
    if (kind === "round1") {
      openRound1(id);
      return;
    }

    if (kind === "round2") {
      openRound2(id);
      return;
    }

    if (kind === "focus1" || kind === "focus2") {
      setPendingSelection({ kind, id });
    }
  };

  const cancelSelection = () => {
    setPendingSelection(null);
  };

  const confirmSelection = () => {
    if (!pendingSelection) return;

    const { kind, id } = pendingSelection;
    setPendingSelection(null);

    if (kind === "round1") {
      openRound1(id);
      return;
    }

    if (kind === "round2") {
      openRound2(id);
      return;
    }

    if (kind === "focus1") {
      chooseFirstFocus(id);
      return;
    }

    if (kind === "focus2") {
      chooseSecondFocus(id);
    }
  };

  /* =======================================================
     ROUND 1
  ======================================================= */

  const openRound1 = (id) => {
    setActiveSuspect(id);
    setStoryIndex(0);

    setPhase("round1Story");
  };

  const requestFocus1 = () => {
    // 2명 이상 조사하면 즉시 집중 조사 대상 선택 단계로 진행한다.
    // 미조사 인물은 focus 화면에서 "정보 없음"으로 표시되므로
    // 별도의 중간 경고가 진행을 막지 않게 한다.
    if (!canEnterFocus(visitedRound1)) {
      return;
    }

    setWarning(null);
    setPendingSelection(null);
    setPhase("focus1");
  };

  const chooseFirstFocus = (id) => {
    setFirstFocus(id);

    setActiveSuspect(id);

    setStoryIndex(0);

    setHiddenContext("first");

    setPhase("hiddenStory");
  };

  /* =======================================================
     ROUND 2
  ======================================================= */

  const openRound2 = (id) => {
    setActiveSuspect(id);

    setStoryIndex(0);

    setPhase("round2Story");
  };

  const requestFocus2 = () => {
    // 2명 이상 확인하면 즉시 두 번째 집중 조사 대상 선택 단계로 진행한다.
    if (!canEnterFocus(visitedRound2)) {
      return;
    }

    setWarning(null);
    setPendingSelection(null);
    setPhase("focus2");
  };

  const chooseSecondFocus = (id) => {
    setSecondFocus(id);

    setActiveSuspect(id);

    setStoryIndex(0);

    setHiddenContext("second");

    setPhase("hiddenStory");
  };

  /* =======================================================
     WARNING
  ======================================================= */

  const confirmWarning = () => {
    if (
      warning?.type === "round1"
    ) {
      setWarning(null);

      setPhase("focus1");

      return;
    }

    if (
      warning?.type === "round2"
    ) {
      setWarning(null);

      setPhase("focus2");
    }
  };

  /* =======================================================
     FINAL
  ======================================================= */

  const chooseCulprit = (id) => {
    setPendingCulprit(id);
  };

  const cancelCulpritConfirmation = () => {
    setPendingCulprit(null);
  };

  const confirmCulpritChoice = () => {
    if (!pendingCulprit) {
      return;
    }

    setWrongSuspect(
      pendingCulprit === CORRECT_ID ? null : pendingCulprit
    );
    setVerdictSuspect(pendingCulprit);
    setPendingCulprit(null);
    setStoryIndex(0);
    setPhase("verdict");
  };

  const continueFromCorrectVerdict = () => {
    setStoryIndex(0);
    setPhase("truth");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={
        styles.mysteryExperience
      }
      data-phase={phase}
    >
      <button
        className={
          styles.mobileBackButton
        }
        type="button"
        onClick={requestHome}
      >
        ← HOME
      </button>

      <button
        className={styles.desktopHomeButton}
        type="button"
        onClick={requestHome}
      >
        ← HOME
      </button>

      {phase !== "cover" &&
        !["verdict", "culprit", "reward", "wrong"].includes(phase) && (
          <ChapterBanner chapter={currentChapter} />
        )}

      {canSkipChapter && (
        <button
          className={styles.skipChapterButton}
          type="button"
          onClick={() => setSkipConfirm(true)}
        >
          SKIP ↗
        </button>
      )}

      {phase === "cover" && (
        <CoverScreen
          onNext={() => {
            setStoryIndex(0);

            setPhase(
              "prologue"
            );
          }}
        />
      )}

      {currentStory && (
        <StoryScreen
          scene={
            currentStory[
              storyIndex
            ]
          }
          current={
            storyIndex + 1
          }
          total={
            currentStory.length
          }
          onPrev={
            handleStoryPrev
          }
          onNext={handleStoryNext}
        />
      )}


      {phase === "summary" && summaryKey && (
        <ChapterSummary
          chapter={chapterMeta[summaryKey]}
          summary={chapterSummaries[summaryKey]}
          onNext={continueFromSummary}
        />
      )}

      {phase === "caseOpen" && (
        <CaseOpen
          onPrev={() => {
            setStoryIndex(
              Math.max(
                expandStoryScenes(
                  prologueScenes
                ).length - 1,
                0
              )
            );

            setPhase(
              "prologue"
            );
          }}
          onNext={() =>
            setPhase(
              "round1Hub"
            )
          }
        />
      )}

      {phase === "round1Hub" && (
        <InvestigationHub
          round="01"
          title="가장 먼저 조사할 사람을 선택하세요."
          description="범인을 지목하는 단계가 아닙니다. 원하는 인물부터 1차 진술을 확인하세요."
          suspects={suspects}
          visited={
            visitedRound1
          }
          onOpen={(id) => requestSelection("round1", id)}
          proceedLabel="1차 집중 대상 선정"
          proceedEnabled={
            canEnterFocus(visitedRound1)
          }
          onProceed={
            requestFocus1
          }
          firstFocus={
            firstFocus
          }
          hiddenUnlocked={
            hiddenUnlocked
          }
        />
      )}

      {phase === "focus1" && (
        <FocusPick
          round="01"
          title="첫 번째 집중 조사 대상"
          description="조사 기록이 충분한 인물만 집중 조사할 수 있습니다."
          suspects={suspects}
          visited={visitedRound1}
          selectedFocus={firstFocus}
          onPick={(id) => requestSelection("focus1", id)}
          onBack={() => setPhase("round1Hub")}
        />
      )}

      {phase ===
        "round2Intro" && (
        <RoundTwoIntro
          firstFocus={
            suspectMap[
              firstFocus
            ]
          }
          onNext={() =>
            setPhase(
              "round2Hub"
            )
          }
        />
      )}

      {phase === "round2Hub" && (
        <InvestigationHub
          round="02"
          title="진술과 기록을 다시 확인하세요."
          description="2차 조사는 사건 당일의 행동, 물증, 시간 기록을 중심으로 진행됩니다."
          suspects={suspects}
          visited={
            visitedRound2
          }
          onOpen={(id) => requestSelection("round2", id)}
          proceedLabel="2차 집중 대상 선정"
          proceedEnabled={
            canEnterFocus(visitedRound2)
          }
          onProceed={
            requestFocus2
          }
          firstFocus={
            firstFocus
          }
          hiddenUnlocked={
            hiddenUnlocked
          }
        />
      )}

      {phase === "focus2" && (
        <FocusPick
          round="02"
          title="두 번째 집중 조사 대상"
          description="첫 번째 집중 대상과 다른 인물을 선택하세요."
          suspects={suspects}
          visited={visitedRound2}
          firstFocus={firstFocus}
          selectedFocus={secondFocus}
          onPick={(id) => requestSelection("focus2", id)}
          onBack={() => setPhase("round2Hub")}
        />
      )}

      {phase ===
        "reconstruction" && (
        <Reconstruction
          visitedRound2={
            visitedRound2
          }
          firstFocus={
            firstFocus
          }
          secondFocus={
            secondFocus
          }
          onBack={() =>
            setPhase(
              "round2Hub"
            )
          }
          onNext={() =>
            setPhase(
              "finalChoice"
            )
          }
        />
      )}

      {phase ===
        "finalChoice" && (
        <FinalChoice
          suspects={suspects}
          firstFocus={
            firstFocus
          }
          secondFocus={
            secondFocus
          }
          onChoose={
            chooseCulprit
          }
          onBack={() =>
            setPhase(
              "reconstruction"
            )
          }
        />
      )}

      {phase === "verdict" && verdictSuspect && (
        <VerdictScreen
          suspect={suspectMap[verdictSuspect]}
          correct={verdictSuspect === CORRECT_ID}
          onCorrectNext={continueFromCorrectVerdict}
          onRestart={restart}
          onExit={onExit}
        />
      )}

      {phase === "wrong" && (
        <WrongResult
          suspect={
            suspectMap[
              wrongSuspect
            ]
          }
          onRetry={() =>
            setPhase(
              "finalChoice"
            )
          }
          onSecondInvestigation={() =>
            setPhase(
              "round2Hub"
            )
          }
        />
      )}

      {phase === "culprit" && (
        <CulpritScreen
          onNext={() =>
            setPhase("reward")
          }
        />
      )}

      {phase === "reward" && (
        <RewardScreen
          onExit={onExit}
          onRestart={restart}
        />
      )}


      {pendingSelection &&
        (pendingSelection.kind === "focus1" || pendingSelection.kind === "focus2") && (
        <SelectionConfirmModal
          selection={pendingSelection}
          suspect={suspectMap[pendingSelection.id]}
          onCancel={cancelSelection}
          onConfirm={confirmSelection}
        />
      )}

      {pendingCulprit && (
        <CulpritConfirmModal
          suspect={suspectMap[pendingCulprit]}
          onCancel={cancelCulpritConfirmation}
          onConfirm={confirmCulpritChoice}
        />
      )}

      {homeConfirm && (
        <HomeConfirmModal
          onCancel={() => setHomeConfirm(false)}
          onConfirm={leaveToEventHome}
        />
      )}

      {skipConfirm && (
        <SkipConfirmModal
          onCancel={() => setSkipConfirm(false)}
          onConfirm={confirmSkipChapter}
        />
      )}

      {warning && (
        <ConfirmModal
          warning={warning}
          onCancel={() =>
            setWarning(null)
          }
          onConfirm={
            confirmWarning
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   COVER
========================================================= */

function CoverScreen({
  onNext,
}) {
  return (
    <section
      className={`${styles.scene} ${styles.coverScreen}`}
    >
      <Background
        src={asset.cover}
      />

      <div
        className={
          styles.coverShade
        }
      />

      <div
        className={
          styles.coverCopy
        }
      >
        <span>
          INTERACTIVE MYSTERY
        </span>

        <small>
          CASE 01
        </small>

        <h1>
          비행기
          <br />
          살인사건의 진실
        </h1>

        <p>
          종강 여행을 마치고
          돌아오는 비행기.
          <br />
          다섯 명 중 한 명이
          죽었다.
        </p>
      </div>

      <button
        className={
          styles.coverStart
        }
        type="button"
        onClick={onNext}
      >
        <span>
          사건 조사 시작
        </span>

        <b>→</b>
      </button>
    </section>
  );
}

/* =========================================================
   STORY
========================================================= */

function StoryScreen({
  scene,
  current,
  total,
  onPrev,
  onNext,
}) {
  const isMobile = useMysteryMobile();
  const [deathLocked, setDeathLocked] = useState(Boolean(scene.deathDiscovery));
  const [visibleText, setVisibleText] = useState(scene.text ?? "");
  const fullText = scene.text ?? "";
  const isTyping = visibleText.length < fullText.length;

  useEffect(() => {
    if (!scene.deathDiscovery) {
      setDeathLocked(false);
      return undefined;
    }

    setDeathLocked(true);
    const timer = window.setTimeout(() => setDeathLocked(false), 2700);

    return () => window.clearTimeout(timer);
  }, [scene.deathDiscovery]);

  useEffect(() => {
    setVisibleText("");

    if (!fullText) return undefined;

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisibleText(fullText.slice(0, index));

      if (index >= fullText.length) {
        window.clearInterval(timer);
      }
    }, 28);

    return () => window.clearInterval(timer);
  }, [fullText]);

  const revealOrMove = (move) => {
    if (deathLocked) return;

    if (isTyping) {
      setVisibleText(fullText);
      return;
    }

    move?.();
  };

  const sceneCharacters =
    Array.isArray(scene.characters)
      ? scene.characters
      : scene.character
        ? [
            {
              id: scene.character,
              src: scene.character,
              // 좌우 배치를 장면마다 바꾸던 기존 규칙은 폐기.
              // 명시적으로 fixedPosition이 있는 장면만 예외 처리합니다.
              slot: scene.fixedPosition ?? "center",
              animation: scene.animation ?? "soft",
            },
          ]
        : [];

  const hasCharacter =
    sceneCharacters.length > 0;

  const dialogueSide = "left";

  return (
    <section
      className={`${styles.scene} ${styles.storyScreen} ${
        scene.blackout
          ? styles.blackoutScreen
          : ""
      } ${
        scene.explanation
          ? styles.explanationScreen
          : ""
      } ${
        scene.deathDiscovery
          ? styles.deathDiscoveryScreen
          : ""
      } ${
        scene.selfieFlash
          ? styles.selfieMomentScreen
          : ""
      } ${
        scene.dyingMessageReveal
          ? styles.dyingMessageRevealScreen
          : ""
      } ${
        scene.dyingMessageHold
          ? styles.dyingMessageHoldScreen
          : ""
      } ${
        scene.soheePose2Intro
          ? styles.soheePose2IntroScene
          : ""
      }`}
      style={{
        "--scene-darkness":
          scene.darkness ?? 0,

        "--scene-blur":
          `${scene.blur ?? 0}px`,
      }}
      onClick={(event) => {
        if (!isMobile || deathLocked) return;
        if (event.target.closest("button, a, input, textarea, select, [role='button']")) return;
        revealOrMove(onNext);
      }}
    >
      {!scene.blackout &&
        scene.background && (
          <Background
            src={
              scene.background
            }
          />
        )}

      {!isMobile && !deathLocked && (
        <div className={styles.backgroundClickZones} aria-hidden="true">
          <button type="button" tabIndex={-1} aria-label="이전 장면" onClick={() => revealOrMove(onPrev)} />
          <button type="button" tabIndex={-1} aria-label="다음 장면" onClick={() => revealOrMove(onNext)} />
        </div>
      )}

      <div
        className={
          styles.storyShade
        }
      />

      <div
        className={
          styles.progressiveDarkness
        }
      />

      {scene.selfieFlash && (
        <div className={styles.selfieMomentFx} aria-hidden="true">
          <span />
          <b />
        </div>
      )}

      {scene.deathDiscovery && (
        <div className={styles.deathDiscoveryFx} aria-hidden="true">
          <div className={styles.deathDiscoveryNoise} />
          <div className={styles.deathDiscoveryFlash} />
          <div className={styles.deathDiscoveryStamp}>
            <span>INCIDENT DETECTED</span>
            <strong>DEATH<br />CONFIRMED</strong>
            <small>VICTIM · JEON SEUNGGEUN</small>
          </div>
        </div>
      )}

      {sceneCharacters.map((item) => (
        <CharacterVisual
          key={item.id ?? item.src}
          src={item.src}
          position={item.slot ?? "center"}
          animation={item.animation ?? "soft"}
          grouped={sceneCharacters.length > 1}
          fullBody={fullBodyAssets.has(item.src)}
          profilePose={loweredStoryProfiles.has(item.src)}
          characterId={item.id}
        />
      ))}

      {scene.prop && (
        <PropVisual
          src={scene.prop}
          type={
            scene.propType
          }
        />
      )}

      {/*
        스토리 상단:
        왼쪽 = 화자
        오른쪽 = 페이지
        그 외 정보 없음.
      */}
      <header
        className={
          styles.simpleStoryHeader
        }
      >
        <span>
          {String(
            current
          ).padStart(2, "0")}
          {" / "}
          {String(
            total
          ).padStart(2, "0")}
        </span>
      </header>

      {!scene.imageOnly && (
        <div
          className={`${styles.simpleDialogue} ${
            dialogueSide === "right"
              ? styles.simpleDialogueRight
              : styles.simpleDialogueLeft
          } ${scene.explanation ? styles.explanationDialogue : ""}`}
        >
          {scene.speaker && (
            <div className={styles.dialogueSpeaker}>
              <strong>{scene.speaker}</strong>
            </div>
          )}

          <p>{visibleText}</p>
        </div>
      )}

      <StoryNavigation
        onPrev={onPrev}
        onNext={onNext}
        disabled={deathLocked}
      />
    </section>
  );
}

/* =========================================================
   CHARACTER
========================================================= */

function CharacterVisual({
  src,
  position = "center",
  animation = "soft",
  grouped = false,
  fullBody = false,
  profilePose = false,
  characterId,
}) {
  const positionClass =
    position === "left"
      ? styles.characterVisualLeft
      : position === "right"
        ? styles.characterVisualRight
        : styles.characterVisualCenter;

  const animationClass =
    animation === "quickLeft"
      ? styles.characterEnterQuickLeft
      : animation === "quickRight"
        ? styles.characterEnterQuickRight
        : animation === "none"
          ? styles.characterEnterNone
          : styles.characterEnterSoft;

  return (
    <div
      data-character={characterId ?? undefined}
      className={`${styles.characterVisual} ${positionClass} ${
        grouped ? styles.characterVisualGrouped : ""
      } ${fullBody ? styles.characterVisualFullBody : ""} ${
        profilePose ? styles.characterVisualProfilePose : ""
      } ${animationClass}`}
    >
      <img loading="lazy"
        src={src}
        alt=""
      />
    </div>
  );
}

/* =========================================================
   PROP
========================================================= */

function PropVisual({
  src,
  type = "photo",
}) {
  return (
    <div
      className={`${styles.propVisual} ${
        type === "note"
          ? styles.propVisualNote
          : type ===
              "photoFocus"
            ? styles.propVisualFocus
            : type ===
                "blurPhoto"
              ? styles.propVisualBlur
              : styles.propVisualPhoto
      }`}
    >
      <img loading="lazy"
        src={src}
        alt=""
      />
    </div>
  );
}

/* =========================================================
   CASE OPEN
========================================================= */

function CaseOpen({
  onPrev,
  onNext,
}) {
  const isMobile = useMysteryMobile();

  return (
    <section
      className={`${styles.scene} ${styles.caseOpenScreen}`}
      onClick={(event) => {
        if (!isMobile) return;
        if (event.target.closest("button, a, input, textarea, select, [role='button']")) return;
        onNext?.();
      }}
    >
      <Background src={asset.caseOpenFirstDesktop} />

      {!isMobile && (
        <div className={styles.backgroundClickZones} aria-hidden="true">
          <button type="button" tabIndex={-1} aria-label="이전 장면" onClick={onPrev} />
          <button type="button" tabIndex={-1} aria-label="다음 장면" onClick={onNext} />
        </div>
      )}

      <div className={styles.caseOpenShade} />

      <div className={styles.caseOpenContent}>
        <span>INCIDENT DETECTED</span>
        <h2>CASE<br />OPEN</h2>
        <i />
        <p>
          네 명의 진술과 기록 속에서
          <br />
          사건의 진실을 찾아라.
        </p>
      </div>

      <StoryNavigation onPrev={onPrev} onNext={onNext} />
    </section>
  );
}

/* =========================================================
   INVESTIGATION HUB
========================================================= */

function InvestigationHub({
  round,
  title,
  description,
  suspects,
  visited,
  onOpen,
  proceedLabel,
  proceedEnabled,
  onProceed,
  firstFocus,
  hiddenUnlocked = [],
}) {
  const isMobile = useMysteryMobile();

  return (
    <section
      className={`${styles.scene} ${styles.hubScreen}`}
      data-round={round}
    >
      <div
        className={
          styles.hubInner
        }
      >
        <header
          className={
            styles.hubHeader
          }
        >
          <h2>{title}</h2>

          <p>
            {description}
          </p>

          <div
            className={
              styles.hubProgress
            }
          >
            <strong>
              {visited.length} /{" "}
              {suspects.length}
            </strong>

            <span>
              CHECKED
            </span>
          </div>
        </header>

        <div
          className={
            styles.suspectGrid
          }
        >
          {suspects.map(
            (suspect) => {
              const checked =
                visited.includes(
                  suspect.id
                );

              const hidden =
                hiddenUnlocked.includes(
                  suspect.id
                );

              return (
                <button
                  className={`${styles.suspectCard} ${
                    checked
                      ? styles.cardChecked
                      : ""
                  }`}
                  key={
                    suspect.id
                  }
                  type="button"
                  data-suspect={suspect.id}
                  onClick={() =>
                    onOpen(
                      suspect.id
                    )
                  }
                >
                  <div
                    className={
                      styles.cardPortrait
                    }
                  >
                    <img loading="lazy"
                      src={
                        round === "02" && suspect.pose2
                          ? suspect.pose2
                          : suspect.profile
                      }
                      alt=""
                    />
                  </div>

                  {checked && (
                    <div
                      className={styles.investigationCompleteStamp}
                      aria-label={round === "01" ? "조사 완료" : "확인 완료"}
                    >
                      <span>{round === "01" ? "조사" : "확인"}</span>
                      <strong>완료</strong>
                    </div>
                  )}

                  <div
                    className={
                      styles.cardCopy
                    }
                  >
                    <strong>
                      {
                        suspect.name
                      }
                    </strong>

                    <p>
                      {round ===
                      "01"
                        ? suspect.firstMotive
                        : "새로운 진술과 기록 확인"}
                    </p>
                  </div>

                  <div
                    className={
                      styles.cardStatus
                    }
                  >
                    {firstFocus ===
                      suspect.id && (
                      <em>
                        FOCUS 01
                      </em>
                    )}

                    {hidden && (
                      <em>
                        HIDDEN ✓
                      </em>
                    )}

                  </div>
                </button>
              );
            }
          )}
        </div>

        {isMobile && <button
          className={`${styles.proceedButton} ${
            !proceedEnabled ? styles.proceedDisabled : ""
          }`}
          type="button"
          disabled={!proceedEnabled}
          onClick={onProceed}
        >
          <span>
            {isMobile
              ? (proceedEnabled ? proceedLabel : "2명 이상 조사하면 진행할 수 있습니다")
              : (proceedEnabled ? "NEXT →" : "2명 이상 조사하면 진행할 수 있습니다")}
          </span>
          <b>→</b>
        </button>}

        <aside
          className={`${styles.caseProgressHud} ${
            proceedEnabled ? styles.caseProgressHudReady : ""
          }`}
          aria-label="조사 진행 상황"
        >
          <span className={styles.caseProgressRail} />
          <small>CASE PROGRESS</small>
          <strong>
            {String(visited.length).padStart(2, "0")}
            <i>/</i>
            {String(suspects.length).padStart(2, "0")}
          </strong>
          <em>INVESTIGATED</em>
          <div className={styles.caseProgressMeter}>
            <span
              style={{
                height: `${Math.max(8, (visited.length / suspects.length) * 100)}%`,
              }}
            />
          </div>
          <b>
            {proceedEnabled ? "REQUIREMENT CLEARED" : "LOCKED · 2명 이상 조사"}
          </b>

        </aside>
      </div>
      {!isMobile && proceedEnabled && (
        <button
          className={styles.nextPhaseButton}
          type="button"
          aria-label={proceedLabel}
          onClick={onProceed}
        >
          <span>NEXT PHASE</span><b aria-hidden="true">→</b>
        </button>
      )}
    </section>
  );
}

/* =========================================================
   FOCUS PICK
========================================================= */

function FocusPick({
  round,
  title,
  description,
  suspects,
  visited = [],
  firstFocus,
  selectedFocus,
  onPick,
  onBack,
}) {
  const [notice, setNotice] = useState("");
  const roundLabel = round === "01" ? "1차 조사 완료" : "2차 조사 완료";

  const handleLockedPick = () => {
    setNotice("이미 집중조사 대상이 지정되었습니다. 이번 조사에서는 변경할 수 없습니다.");
  };

  return (
    <section className={`${styles.scene} ${styles.focusScreen}`}>
      <div className={styles.focusInner}>
        <header className={styles.focusHeader}>
          <h2>{title}</h2>
          <p>{description}</p>
        </header>

        {notice && (
          <p className={styles.focusLockNotice} role="status">
            {notice}
          </p>
        )}

        <div className={styles.focusGrid}>
          {suspects.map((suspect) => {
            const hasInfo = visited.includes(suspect.id);
            const alreadyFocused = round === "02" && firstFocus === suspect.id;
            const isSelected = selectedFocus === suspect.id;
            const lockedBySelection = Boolean(selectedFocus) && !isSelected;
            const selectable = hasInfo && !alreadyFocused && !lockedBySelection;

            const stampText = !hasInfo
              ? "정보 없음"
              : alreadyFocused
                ? "집중 조사 완료"
                : isSelected
                  ? "집중 조사 고정"
                  : roundLabel;

            const handleClick = () => {
              if (!hasInfo || alreadyFocused) return;
              if (lockedBySelection) {
                handleLockedPick();
                return;
              }
              setNotice("");
              onPick(suspect.id);
            };

            return (
              <button
                key={suspect.id}
                type="button"
                aria-disabled={!selectable && !lockedBySelection}
                className={`${styles.focusCard} ${
                  selectable || isSelected ? styles.focusCardReady : styles.focusCardLocked
                } ${isSelected ? styles.focusCardSelected : ""}`}
                data-suspect={suspect.id}
                onClick={handleClick}
              >
                <div className={styles.focusPortrait}>
                  <img loading="lazy" src={suspect.pose2 ?? suspect.image} alt="" />
                </div>

                <strong>{suspect.name}</strong>

                <div
                  className={`${styles.focusStamp} ${
                    hasInfo ? styles.focusStampRed : styles.focusStampGray
                  }`}
                >
                  {stampText}
                </div>
              </button>
            );
          })}
        </div>

        <button
          className={styles.focusPrevButton}
          type="button"
          onClick={onBack}
        >
          ← PREV
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   ROUND 2 INTRO
========================================================= */

function RoundTwoIntro({
  firstFocus,
  onNext,
}) {
  const isMobile = useMysteryMobile();

  return (
    <section
      className={`${styles.scene} ${styles.caseOpenScreen} ${styles.roundTwoCaseOpen}`}
      onClick={(event) => {
        if (!isMobile) return;
        if (event.target.closest("button, a, input, textarea, select, [role='button']")) return;
        onNext?.();
      }}
    >
      <Background src={asset.caseOpenSecondDesktop} />
      <div className={styles.caseOpenShade} />

      <div className={styles.caseOpenContent}>
        <span>STATEMENT REVIEW</span>
        <h2>CASE<br />REOPEN</h2>
        <i />
        <p>
          진술과 기록을 다시 확인하라.
          {firstFocus ? <><br />FOCUS 01 · {firstFocus.name}</> : null}
        </p>
      </div>

      <StoryNavigation onPrev={undefined} onNext={onNext} />
    </section>
  );
}

const reconstructionSummaries = {
  jiyoung: "단체사진 뒤 자리로 돌아갔다. 재생 기록이 남아 있다.",
  sohee: "사건 전후 기내 뒤쪽으로 이동했다. 정확한 시각은 불분명하다.",
  jeongeun: "피해자의 컵을 만진 사실을 숨겼다.",
  hyeonsu: "팔찌 제거 시점과 동선에 모순이 남아 있다.",
};

const reconstructionWebSummaries = {
  jiyoung: "단체사진 촬영 후 자신의 자리로 돌아갔다고 진술했다. 기내 화면의 재생 기록은 사건 핵심 시간대까지 이어져 있다. 다만 사진 촬영 직후의 이동 시각은 다른 기록과 함께 확인할 필요가 있다.",
  sohee: "사건 전후 기내 뒤쪽으로 이동한 정황이 있다. 화장실에서 돌아오다 평소보다 조용한 승근에게 말을 걸었다고 진술했다. 승근을 확인한 시점과 이동 시간은 주변 진술과 대조해야 한다.",
  jeongeun: "피해자의 컵을 만진 사실은 인정했다. 다만 컵을 만진 시점과 따뜻한 물을 요청한 시각은 서로 다른 행동이라고 진술했다. 컵의 이동 경로와 주변 승객의 기억을 다시 확인할 필요가 있다.",
  hyeonsu: "팔찌 제거 시점과 피해자 접근 여부에 관한 진술에 일부 모순이 남아 있다. 커피 전달 과정과 관련된 기록 역시 완전히 일치하지 않는다. 사건 핵심 시간대의 동선을 다른 인물의 진술과 직접 대조해야 한다.",
};

/* =========================================================
   RECONSTRUCTION
========================================================= */

function Reconstruction({
  visitedRound2,
  firstFocus,
  secondFocus,
  onBack,
  onNext,
}) {
  const isMobile = useMysteryMobile();

  return (
    <section className={`${styles.scene} ${styles.reconstructionScreen}`}>
      <div className={styles.reconstructionInner}>
        <header className={styles.reconstructionHeader}>
          <span>FINAL RECONSTRUCTION</span>
          <h2>모두가 거짓말했다.</h2>
          <p>하지만 모두가 같은 것을 숨긴 것은 아니었다.</p>
        </header>

        <div className={styles.reconstructionList}>
          {suspects.map((suspect) => {
            const confirmed = visitedRound2.includes(suspect.id);
            return (
              <article
                key={suspect.id}
                data-suspect={suspect.id}
                className={`${!confirmed ? styles.reconstructionMissing : ""} ${!isMobile ? styles.reconstructionWebCard : ""}`}
              >
                <div className={styles.reconstructionFace}>
                  <img loading="lazy"
                    src={suspect.face}
                    alt={`${suspect.name} 얼굴`}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = suspect.pose2 ?? suspect.image;
                    }}
                  />
                </div>

                <div className={styles.reconstructionCardHead}>
                  <strong>{suspect.name}</strong>
                </div>

                <p>
                  {confirmed
                    ? (isMobile ? reconstructionSummaries[suspect.id] : reconstructionWebSummaries[suspect.id])
                    : "2차 진술이 아직 확인되지 않았다."}
                </p>

                {(firstFocus === suspect.id || secondFocus === suspect.id) && (
                  <span>FOCUS</span>
                )}
              </article>
            );
          })}
        </div>


        <nav className={styles.bottomActions}>
          <button type="button" onClick={onBack}>← PREV</button>
          <button type="button" onClick={onNext}>최종 지목 →</button>
        </nav>
      </div>
    </section>
  );
}

/* =========================================================
   FINAL CHOICE
========================================================= */

function FinalChoice({
  suspects,
  firstFocus,
  secondFocus,
  onChoose,
  onBack,
}) {
  const isMobile = useMysteryMobile();

  return (
    <section
      className={`${styles.scene} ${styles.finalScreen}`}
    >
      <div
        className={
          styles.finalInner
        }
      >
        <header
          className={
            styles.finalHeader
          }
        >
          <span>
            FINAL ACCUSATION
          </span>

          <h2>
            WHO KILLED
            <br />
            SEUNGGEUN?
          </h2>

        </header>

        <div
          className={
            styles.finalGrid
          }
        >
          {suspects.map(
            (suspect) => (
              <button
                key={
                  suspect.id
                }
                type="button"
                data-suspect={suspect.id}
                onClick={() =>
                  onChoose(
                    suspect.id
                  )
                }
              >
                <div
                  className={
                    styles.finalPortrait
                  }
                >
                  <img loading="lazy"
                    src={isMobile ? suspect.face : (suspect.pose2 ?? suspect.face)}
                    alt={`${suspect.name} ${isMobile ? "얼굴" : "집중 조사 포즈"}`}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = suspect.pose2 ?? suspect.image;
                    }}
                  />
                </div>

                <strong>
                  {
                    suspect.name
                  }
                </strong>

                <div
                  className={
                    styles.finalBadges
                  }
                >
                  {firstFocus ===
                    suspect.id && (
                    <span>
                      FOCUS 01
                    </span>
                  )}

                  {secondFocus ===
                    suspect.id && (
                    <span>
                      FOCUS 02
                    </span>
                  )}
                </div>

              </button>
            )
          )}
        </div>

        <p className={styles.finalPrompt}>범인을 지목해주세요.</p>

        <button
          className={
            styles.finalBack
          }
          type="button"
          onClick={onBack}
        >
          ← PREV
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   FINAL ACCUSATION CONFIRM / VERDICT
========================================================= */

function SelectionConfirmModal({ selection, suspect, onCancel, onConfirm }) {
  if (!selection || !suspect) return null;

  const isSecond = selection.kind === "focus2";
  const label = `${isSecond ? "두 번째" : "첫 번째"} 집중 조사`;

  return (
    <div className={styles.modalOverlay} onMouseDown={onCancel}>
      <section
        className={`${styles.confirmModal} ${styles.selectionConfirmModal}`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span>{label.toUpperCase()}</span>
        <h2>{suspect.name}님을 집중 조사 대상으로 지정하시겠습니까?</h2>
        <p>
          한 번 지정한 대상은 이번 집중 조사에서는 변경할 수 없습니다.
        </p>
        <button type="button" onClick={onConfirm}>집중 조사 시작</button>
        <button type="button" onClick={onCancel}>취소</button>
      </section>
    </div>
  );
}

function CulpritConfirmModal({ suspect, onCancel, onConfirm }) {
  if (!suspect) return null;

  return (
    <div className={styles.modalOverlay} onMouseDown={onCancel}>
      <section
        className={`${styles.confirmModal} ${styles.culpritConfirmModal}`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span>FINAL ACCUSATION</span>
        <h2>정말 {suspect.name}님을 범인으로 지목하시겠습니까?</h2>
        <p>
          최종 지목입니다. 오답일 경우 이번 조사는 실패 처리되며
          처음부터 다시 도전해야 합니다.
        </p>
        <button type="button" onClick={onConfirm}>범인 지목 확정</button>
        <button type="button" onClick={onCancel}>취소</button>
      </section>
    </div>
  );
}

function VerdictScreen({
  suspect,
  correct,
  onCorrectNext,
  onRestart,
  onExit,
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    const timer = window.setTimeout(() => setRevealed(true), 3000);
    return () => window.clearTimeout(timer);
  }, [suspect?.id, correct]);

  if (!suspect) return null;

  const copy = wrongCopy[suspect.id];
  const verdictLetters = correct
    ? ["맞", "습", "니", "다."]
    : ["아", "니", "었", "습", "니", "다."];

  return (
    <section
      className={`${styles.scene} ${styles.verdictScreen} ${
        correct ? styles.verdictCorrect : styles.verdictWrong
      } ${revealed ? styles.verdictRevealed : styles.verdictJudging}`}
    >
      <Background src={asset.cabinAlt} />
      <div className={styles.verdictShade} />

      {!revealed && (
        <div className={styles.verdictFx} aria-hidden="true">
          <div className={styles.verdictNoise} />
          <div className={styles.verdictFlash} />
          <div className={styles.verdictCloseups}>
            {["eyes", "mouth", "hands", "silhouette"].map((part, index) => (
              <div
                key={part}
                className={`${styles.verdictCloseup} ${styles[`verdictCloseup${index + 1}`]}`}
              >
                <img loading="lazy" src={suspect.pose2 ?? suspect.image} alt="" />
              </div>
            ))}
          </div>
          <div className={styles.verdictTarget}>
            <span>FINAL ACCUSATION</span>
            <strong>{suspect.name}님은</strong>
            <small>THE CULPRIT?</small>
          </div>
        </div>
      )}

      {revealed && (
        <div className={styles.verdictResult}>
          <div className={styles.verdictHeadline}>
            <span>{correct ? "FINAL VERDICT · CULPRIT CONFIRMED" : "FINAL VERDICT · ACCUSATION FAILED"}</span>
            <h2 className={correct ? styles.verdictCorrectTitle : styles.verdictWrongTitle}>
              <b>범인이</b>
              <i className={styles.verdictLetterRun}>
                {verdictLetters.map((letter, index) => (
                  <em key={`${letter}-${index}`} style={{ "--letter-index": index }}>
                    {letter}
                  </em>
                ))}
              </i>
            </h2>
          </div>

          <div className={styles.verdictPortrait}>
            <img loading="lazy" src={suspect.pose2 ?? suspect.image} alt="" />
          </div>

          {!correct && copy?.reaction && (
            <div className={styles.verdictReaction}>
              <strong>{suspect.name}</strong>
              {copy.reaction.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          )}

          {correct ? (
            <button
              className={styles.verdictNext}
              type="button"
              onClick={onCorrectNext}
            >
              진실 확인하기
            </button>
          ) : (
            <div className={styles.verdictFailActions}>
              <p>잘못된 최종 지목입니다. 이번 조사는 여기서 종료됩니다.</p>
              <button type="button" onClick={onRestart}>처음부터</button>
              <button type="button" onClick={onExit}>나가기</button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   WRONG · LEGACY FALLBACK
========================================================= */

function WrongResult({
  suspect,
  onRetry,
  onSecondInvestigation,
}) {
  const copy =
    wrongCopy[suspect?.id] ?? {
      title:
        "범인이 아니다.",

      body:
        "확인한 단서만으로는 이 인물을 범인으로 확정할 수 없다.",
    };

  return (
    <section
      className={`${styles.scene} ${styles.wrongScreen}`}
    >
      <div
        className={
          styles.wrongInner
        }
      >
        <span>
          NOT THE CULPRIT
        </span>

        <small>
          YOUR ACCUSATION
        </small>

        <div
          className={
            styles.wrongPortrait
          }
        >
          <img loading="lazy"
            src={
              suspect?.image
            }
            alt=""
          />
        </div>

        <h2>
          {suspect?.name}
        </h2>

        <strong>
          {copy.title}
        </strong>

        <p>
          {copy.body}
        </p>

        <div
          className={
            styles.wrongHint
          }
        >
          <span>
            HINT
          </span>

          <p>
            마지막 단체사진과
            커피가 전달된 시각,
            그리고 각 인물의 거짓말을
            다시 비교하세요.
          </p>
        </div>

        <button
          type="button"
          onClick={onRetry}
        >
          다시 범인 지목하기
        </button>

        <button
          type="button"
          onClick={
            onSecondInvestigation
          }
        >
          2차 조사 다시 보기
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   CULPRIT
========================================================= */

function CulpritScreen({ onNext }) {
  return (
    <section className={`${styles.scene} ${styles.culpritScreen} ${styles.criminalRevealScreen}`}>
      <picture>
        <source media="(min-width: 1025px)" srcSet={asset.criminalWeb} />
      <img loading="lazy"
        className={styles.criminalBackdrop}
        src={asset.criminal}
        alt="김현수 범인 공개"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = asset.hyeonsuProfile;
        }}
      />
      </picture>
      <div className={styles.criminalNoise} aria-hidden="true" />
      <div className={styles.criminalSlash} aria-hidden="true" />

      <div className={styles.culpritInner}>
        <span>THE CULPRIT</span>
        <small>CASE 01 · CRIMINAL REVEAL</small>
        <h2>김현수</h2>
        <i />
        <p>
          흩어진 진술과 기록이 마지막에 가리킨 한 사람.<br />
          승근에게 문제의 커피를 건넨 사람은 김현수였다.
        </p>
      </div>

      <button className={styles.culpritNext} type="button" onClick={onNext}>
        사건 해결 보상 보기 →
      </button>
    </section>
  );
}

/* =========================================================
   REWARD
========================================================= */

function RewardScreen({
  onExit,
  onRestart,
}) {
  return (
    <section
      className={`${styles.scene} ${styles.rewardScreen}`}
    >
      <div
        className={
          styles.rewardInner
        }
      >
        <span>
          CASE 01 · COMPLETE
        </span>

        <h2>
          CASE
          <br />
          COMPLETE
        </h2>

        <p>
          비행기 살인사건의 진실을
          밝혀냈습니다.
        </p>

        <div
          className={
            styles.rewardDivider
          }
        >
          <i />
          <b>REWARD</b>
          <i />
        </div>

        <article
          className={
            styles.rewardCoupon
          }
        >
          <img loading="lazy"
            src={
              asset.starbucks
            }
            alt=""
          />

          <div>
            <small>
              CASE SOLVED REWARD
            </small>

            <strong>
              스타벅스 쿠폰
            </strong>

            <p>
              아메리카노 1잔
            </p>
          </div>
        </article>

        <button
          type="button"
          onClick={() =>
            onExit?.()
          }
        >
          이벤트 목록으로
        </button>

        <button
          type="button"
          onClick={
            onRestart
          }
        >
          사건 다시 플레이
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   CHAPTER UI / SUMMARY
========================================================= */

function ChapterBanner({ chapter }) {
  if (!chapter) return null;

  return (
    <div className={styles.chapterBanner} aria-hidden="true">
      <span>{chapter.code}</span>
      <strong>{chapter.title}</strong>
      <small>{chapter.ko}</small>
    </div>
  );
}

function ChapterSummary({ chapter, summary, onNext }) {
  if (!summary) return null;

  return (
    <section className={`${styles.scene} ${styles.summaryScreen}`}>
      <Background src={asset.cabinAlt} />
      <div className={styles.summaryShade} />

      <div className={styles.summaryInner}>
        <header className={styles.summaryHeader}>
          <span>{summary.eyebrow}</span>
          <h2>{summary.title}</h2>
          <p>{summary.copy}</p>
        </header>

        <div className={styles.summaryGrid}>
          {summary.items.map((item, index) => (
            <article key={`${item.label}-${index}`}>
              {item.image && (
                <div className={styles.summaryVisual}>
                  <img loading="lazy" src={item.image} alt="" />
                </div>
              )}
              <div className={styles.summaryCardCopy}>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <strong>{item.label}</strong>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.summaryFooter}>
          <span>
            {chapter?.code} · {chapter?.title}
          </span>
          <button type="button" onClick={onNext}>
            NEXT CHAPTER →
          </button>
        </div>
      </div>
    </section>
  );
}

function HomeConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className={styles.modalOverlay} onMouseDown={onCancel}>
      <section
        className={`${styles.confirmModal} ${styles.exitConfirmModal}`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span>LEAVE INVESTIGATION</span>
        <h2>이벤트 홈으로 돌아가시겠습니까?</h2>
        <p>
          현재까지 진행한 조사 내용은 저장되지 않습니다.<br />
          이벤트에서 나가면 처음부터 다시 시작해야 합니다.
        </p>
        <button type="button" onClick={onCancel}>계속 조사하기</button>
        <button type="button" onClick={onConfirm}>홈으로 나가기</button>
      </section>
    </div>
  );
}

function SkipConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className={styles.modalOverlay} onMouseDown={onCancel}>
      <section
        className={`${styles.confirmModal} ${styles.skipConfirmModal}`}
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <span>SKIP</span>
        <h2>이 챕터를 건너뛸까요?</h2>
        <p>
          남은 대사와 조사는 건너뛰고 핵심 내용 정리 화면으로 이동합니다.<br />
          중요한 단서는 정리 화면에서 다시 확인할 수 있습니다.
        </p>
        <button type="button" onClick={onConfirm}>스킵하기</button>
        <button type="button" onClick={onCancel}>취소</button>
      </section>
    </div>
  );
}

/* =========================================================
   WARNING MODAL
========================================================= */

function ConfirmModal({
  warning,
  onCancel,
  onConfirm,
}) {
  return (
    <div
      className={
        styles.modalOverlay
      }
    >
      <section
        className={
          styles.confirmModal
        }
        role="dialog"
        aria-modal="true"
      >
        <span>
          INVESTIGATION WARNING
        </span>

        <h2>
          아직 확인하지 않은
          <br />
          용의자가 있습니다.
        </h2>

        <p>
          중요한 진술이나 단서를 놓칠
          수 있습니다. 그래도 다음
          단계로 진행할까요?
        </p>

        <div
          className={
            styles.missingList
          }
        >
          {warning.missing.map(
            (suspect) => (
              <span
                key={
                  suspect.id
                }
              >
                SUSPECT{" "}
                {
                  suspect.number
                }{" "}
                ·{" "}
                {
                  suspect.name
                }
              </span>
            )
          )}
        </div>

        <button
          type="button"
          onClick={onCancel}
        >
          계속 조사하기
        </button>

        <button
          type="button"
          onClick={onConfirm}
        >
          그래도 진행하기
        </button>
      </section>
    </div>
  );
}

/* =========================================================
   STORY NAV
========================================================= */

function StoryNavigation({
  onPrev,
  onNext,
  disabled = false,
}) {
  return (
    <nav
      className={
        styles.storyNav
      }
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={disabled}
      >
        ← PREV
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
      >
        NEXT →
      </button>
    </nav>
  );
}

/* =========================================================
   BACKGROUND
========================================================= */

function Background({ src }) {
  const mobileSrc =
    src === asset.flight
      ? asset.flightMobile
      : src === asset.cabin || src === asset.cabinAlt
        ? asset.cabinMobile
        : src === asset.groupScene
          ? asset.groupSceneMobile
          : src === asset.collapseScene
            ? asset.collapseSceneMobile
            : src === asset.caseOpenFirstDesktop
          ? asset.caseOpenFirstMobile
          : src === asset.caseOpenSecondDesktop
            ? asset.caseOpenSecondMobile
            : null;

  const image = (
    <img loading="lazy"
      className={`${styles.background} ${
        src === asset.flight ? styles.backgroundNaturalFit : ""
      }`}
      src={src}
      alt=""
      aria-hidden="true"
    />
  );

  if (!mobileSrc) {
    return image;
  }

  return (
    <picture>
      <source media="(max-width: 1024px)" srcSet={mobileSrc} />
      {image}
    </picture>
  );
}
// WEB-PASS-01: mobile visuals frozen; web layout, progress HUD, reconstruction, accusation and selection confirmations revised.
