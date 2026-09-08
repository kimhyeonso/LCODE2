import { useEffect, useMemo, useState } from "react";
import styles from "./MysteryEvent.module.scss";

/* =========================================================
   ASSETS
========================================================= */

const asset = {
  cover: "/event/event03/background1.png",
  flight: "/event/event03/background2.png",
  cabin: "/event/event03/SCENE1.png",
  evidence: "/event/event03/SCENE2_picture.png",
  cabinAlt: "/event/event03/SCENE%204.png",
  ending: "/event/event03/SCENE5_picture.png",

  groupPhoto: "/event/event03/picture.png",
  dyingMessage: "/event/event03/dying_message.png",
  dyingMessageNote: "/event/event03/dyingmessage.png",

  starbucks: "/event/event03/Starbucks.png",

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

    firstMotive: "여행비 정산 문제",

    claimedAlibi:
      "사진 촬영 이후 자신의 자리에서 영화를 보고 있었다.",

    secondSummary:
      "피해자 자리 방향으로 이동한 사실을 숨겼다. 다만 커피가 전달될 무렵에는 좌석 기록이 남아 있다.",
  },

  {
    id: "sohee",
    number: "02",
    name: "전소희",

    image: asset.sohee,
    profile: asset.soheeProfile,

    firstMotive: "가족 사이의 오래된 갈등",

    claimedAlibi:
      "커피가 전달될 무렵에는 기내 뒤쪽 화장실 부근에 있었다.",

    secondSummary:
      "피해자와 말다툼한 사실을 숨겼다. 다만 커피가 전달될 무렵의 위치는 확인됐다.",
  },

  {
    id: "jeongeun",
    number: "03",
    name: "최정은",

    image: asset.jeongeun,
    profile: asset.jeongeunProfile,

    firstMotive: "촬영용 액세서리 분실",

    claimedAlibi:
      "커피가 전달될 무렵 승무원에게 따뜻한 물을 받고 있었다.",

    secondSummary:
      "피해자의 컵을 만진 사실을 숨겼다. 그러나 커피가 전달될 무렵에는 승무원과 함께 있었다.",
  },

  {
    id: "hyeonsu",
    number: "04",
    name: "김현수",

    image: asset.hyeonsu,
    profile: asset.hyeonsuProfile,

    firstMotive: "피날레 메인 모델 경쟁",

    claimedAlibi:
      "사진 촬영 이후 자신의 자리에서 쉬었으며 피해자 쪽에는 가지 않았다.",

    secondSummary:
      "팔찌 제거 시점과 피해자 접근 여부, 사건 당일 행동에 관한 두 진술이 모두 기록과 충돌한다.",
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
  prologue: {
    eyebrow: "FLIGHT LOG",
    title: "비행기에서 일어난 일",
    copy: "사건의 흐름을 장면 순서대로 다시 확인하세요.",
    items: [
      {
        label: "마지막 단체사진",
        text: "다섯 사람은 귀국 직전 기내에서 마지막 사진을 남겼다.",
        image: asset.groupPhoto,
      },
      {
        label: "누군가 건넨 커피",
        text: "어두운 기내에서 누군가 승근에게 커피를 건넸다.",
        image: asset.starbucks,
      },
      {
        label: "승근이 쓰러짐",
        text: "커피를 마신 뒤 승근은 이상 증세를 보이다 쓰러졌다.",
        image: asset.evidence,
      },
      {
        label: "뒤늦게 발견된 단서",
        text: "주변 사람들이 뒤늦게 상황을 알아챘고, 승근은 마지막 단서를 남겼다.",
        image: asset.dyingMessage,
      },
    ],
  },
  round1: {
    eyebrow: "INVESTIGATION NOTES",
    title: "첫 번째 조사 정리",
    copy: "네 사람의 첫 진술에서 확인된 핵심만 정리했습니다.",
    items: [
      { label: "유지영", text: "여행비 정산 문제와 쌓인 불만이 있었다.", image: asset.jiyoungProfile },
      { label: "전소희", text: "가족 사이 오래된 갈등과 사건 전 말다툼이 있었다.", image: asset.soheeProfile },
      { label: "최정은", text: "촬영용 액세서리 문제로 승근에게 불만이 있었다.", image: asset.jeongeunProfile },
      { label: "김현수", text: "피날레 메인 모델 자리를 두고 승근과 경쟁했다.", image: asset.hyeonsuProfile },
    ],
  },
  round2: {
    eyebrow: "CONTRADICTION FILE",
    title: "추가 조사 정리",
    copy: "숨긴 사실과 사건 순간의 실제 위치를 비교했습니다.",
    items: [
      { label: "유지영", text: "피해자 쪽에 다녀왔지만 핵심 순간에는 좌석에 있었다.", image: asset.jiyoungProfile },
      { label: "전소희", text: "말다툼을 숨겼지만 핵심 순간에는 뒤쪽에 있었다.", image: asset.soheeProfile },
      { label: "최정은", text: "컵을 만졌지만 문제의 커피가 전달될 때는 승무원과 함께 있었다.", image: asset.jeongeunProfile },
      { label: "김현수", text: "팔찌 시점이 사진과 맞지 않고 핵심 순간의 동선도 비어 있다.", image: asset.hyeonsuProfile },
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

    text:
      "학기말 프로젝트와 종강 여행을 끝낸 다섯 명은 한국으로 돌아가는 비행기에 올랐다.",
  },

  {
    speaker: "전소희",
    background: asset.cabin,

    characters: [
      {
        id: "sohee",
        src: asset.sohee,
        slot: "center",
        animation: "soft",
      },
    ],

    text: "드디어 한국 간다.",
  },

  {
    speaker: "전소희",
    background: asset.cabin,

    // 같은 대화 흐름에서는 po1으로 바꾸지 않고 기존 전신 컷 유지
    characters: [
      {
        id: "sohee",
        src: asset.sohee,
        slot: "center",
        animation: "none",
      },
    ],

    text:
      "나 진짜 빨리 집 가서 씻고 누워 있고 싶어.",
  },

  {
    speaker: "최정은",
    background: asset.cabin,

    // 전소희는 그대로, 최정은만 왼쪽에서 빠르게 합류
    characters: [
      {
        id: "sohee",
        src: asset.sohee,
        slot: "center",
        animation: "none",
      },
      {
        id: "jeongeun",
        src: asset.jeongeun,
        slot: "left",
        animation: "quickLeft",
      },
    ],

    text:
      "어제 일 때문에 다들 좀 예민해진 것 같긴 해.",
  },

  {
    speaker: "유지영",
    background: asset.cabin,

    // 유지영이 오른쪽에서 합류해 잠깐 쓰리샷을 완성
    characters: [
      {
        id: "jeongeun",
        src: asset.jeongeun,
        slot: "left",
        animation: "none",
      },
      {
        id: "sohee",
        src: asset.sohee,
        slot: "center",
        animation: "none",
      },
      {
        id: "jiyoung",
        src: asset.jiyoung,
        slot: "right",
        animation: "quickRight",
      },
    ],

    text:
      "우리 사진 한 장 더 찍자. 이번엔 좀 제대로.",
  },

  {
    speaker: "내레이션",
    background: asset.cabin,

    prop: asset.groupPhoto,
    propType: "photo",

    text:
      "한국으로 돌아가기 전, 다섯 명은 마지막 단체사진을 남겼다.",
  },

  {
    speaker: "전승근",
    background: asset.cabin,

    character: asset.seunggeun,
    position: "left",

    text:
      "오, 생각보다 잘 나왔는데? 우리 아직도 팔찌 다 차고 있네.",
  },

  {
    speaker: "내레이션",
    background: asset.cabin,

    prop: asset.groupPhoto,
    propType: "photoFocus",

    text:
      "여행 첫날, 다섯 명은 같은 기념 팔찌를 하나씩 맞춰 찼다.",

    note:
      "여행이 끝나는 날까지 모두 같은 팔찌를 차고 있는 것처럼 보였다.",
  },

  {
    speaker: "김현수",
    background: asset.cabin,

    character: asset.hyeonsu,
    animation: "soft",

    text:
      "잘 나왔다. 이따 단톡에 올려줘.",
  },

  {
    speaker: "유지영",
    background: asset.cabin,

    character: asset.jiyoungProfile,
    fixedPosition: "left",
    animation: "soft",

    text:
      "근데 사진 속 승근이 표정, 뭔가 이상하지 않아?",
  },

  {
    speaker: "내레이션",
    background: asset.cabin,

    text:
      "그 말은 별 의미 없는 농담처럼 지나갔다.",
  },

  {
    speaker: "내레이션",
    background: asset.cabinAlt,

    text:
      "잠시 뒤 기내 조명이 낮아졌고, 다섯 명은 각자의 자리에서 시간을 보내기 시작했다.",
  },

  {
    speaker: "내레이션",
    background: asset.cabinAlt,

    text:
      "음료 서비스가 시작됐다. 다섯 명은 모두 커피를 주문했다.",

    note:
      "같은 비행기, 같은 일행, 같은 종이컵.",
  },

  {
    speaker: "???",
    background: asset.cabinAlt,

    text:
      "승근아, 네 거 여기.",

    note:
      "승근은 휴대폰을 보고 있어 누가 커피를 건넸는지 제대로 확인하지 못했다.",
  },

  {
    speaker: "전승근",
    background: asset.cabinAlt,

    character: asset.seunggeunProfile,
    position: "left",

    text: "어, 고마워.",
  },

  {
    speaker: "내레이션",
    background: asset.cabinAlt,

    text:
      "주변의 모두가 비슷한 종이컵을 들고 있었다. 이상하게 생각할 이유는 없었다.",
  },

  {
    speaker: "전승근",
    background: asset.cabinAlt,

    character: asset.seunggeunProfile,
    position: "right",

    text: "음...",

    darkness: 0.06,
  },

  {
    speaker: "전승근",
    background: asset.cabinAlt,

    character: asset.seunggeunProfile,
    position: "right",

    text: "어...?",

    note:
      "손끝에 힘이 잘 들어가지 않았다.",

    darkness: 0.16,
    blur: 0.25,
  },

  {
    speaker: "전승근",
    background: asset.cabinAlt,

    character: asset.seunggeunProfile,
    position: "left",

    text: "잠깐...",

    note:
      "기내의 목소리가 조금씩 멀어지는 것 같았다.",

    darkness: 0.27,
    blur: 0.45,
  },

  {
    speaker: "내레이션",
    background: asset.ending,

    text:
      "승근의 휴대폰 화면에는 조금 전 찍은 단체사진이 그대로 열려 있었다.",

    darkness: 0.38,
    blur: 0.7,
  },

  {
    speaker: "내레이션",
    background: asset.ending,

    prop: asset.groupPhoto,
    propType: "blurPhoto",

    text:
      "흐릿해지는 시야 속에서 승근은 사진을 바라봤다.",

    darkness: 0.5,
    blur: 1,
  },

  {
    speaker: "전승근",
    background: asset.ending,

    text: "우리 모두...",

    // 이 장면부터 NEXT를 누를 때마다 시야가 조금씩 더 흐려짐
    darkness: 0.62,
    blur: 1.45,
  },

  {
    speaker: "전승근",
    background: asset.ending,

    text: "...같았는데.",

    darkness: 0.84,
    blur: 2.25,
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
      background: asset.cabinAlt,

      character: asset.sohee,
      position: "left",

      text:
        "사건 시간에는 화장실 쪽에 있었어. 나오다가 승근아, 하고 불렀는데 반응이 없어서 이상한 걸 알았고.",
    },
  ],

  jeongeun: [
    {
      speaker: "최정은",
      background: asset.cabin,

      character: asset.jeongeun,
      position: "right",

      text:
        "촬영용으로 가져온 액세서리를 빌려줬다가 잃어버린 적이 있어. 그때는 정말 화났지.",
    },

    {
      speaker: "최정은",
      background: asset.cabin,

      character: asset.jeongeunProfile,
      position: "left",

      text:
        "사진 찍고 난 뒤에는 따뜻한 물 받으러 갔어.",
    },

    {
      speaker: "최정은",
      background: asset.cabinAlt,

      character: asset.jeongeun,
      position: "right",

      text:
        "피해자 컵은 따로 만진 적 없어. 사건 나기 전까지 신경도 안 썼고.",
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

      text:
        "사실... 보고 있던 건 뿌이뿌이 모루카였어.",
    },

    {
      speaker: "유지영",
      background: asset.cabin,

      character: asset.jiyoungProfile,
      position: "left",

      text:
        "기니피그가 자동차가 되는 건데. 아니, 그 설명을 왜 하고 있지.",
    },

    {
      speaker: "유지영",
      background: asset.cabin,

      character: asset.jiyoung,
      position: "right",

      text:
        "내가 원래 인형이나 키링 같은 걸 좋아해.",
    },

    {
      speaker: "유지영",
      background: asset.cabinAlt,

      character: asset.jiyoungProfile,
      position: "left",

      text:
        "그래서 승근이도 맨날 내 인형 가지고 장난쳤어. 가져가고, 숨기고, 바로 안 돌려주고.",
    },

    {
      speaker: "유지영",
      background: asset.cabinAlt,

      character: asset.jiyoungProfile,
      position: "right",

      text:
        "걔는 그냥 웃겼나 본데 나는 진짜 싫었거든.",

      note:
        "돈 문제 말고도 오래 쌓인 불만이 있었다.",
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

      text:
        "예전에 패션 화보 기획 프로젝트를 같이 한 적이 있어.",
    },

    {
      speaker: "최정은",
      background: asset.cabin,

      character: asset.jeongeunProfile,
      position: "left",

      text:
        "그때 내가 팀장이었는데, 솔직히 팀장 입장에서는 꽤 힘들었어.",
    },

    {
      speaker: "최정은",
      background: asset.cabinAlt,

      character: asset.jeongeun,
      position: "right",

      text:
        "포즈 레퍼런스는 늦고, 피팅 끝나고 다른 룩 얘기 나오고, 촬영 당일에는 동선 다시 바꾸자고 하고.",
    },

    {
      speaker: "최정은",
      background: asset.cabinAlt,

      character: asset.jeongeunProfile,
      position: "left",

      text:
        "그때는 진짜 속 많이 썩었지.",
    },

    {
      speaker: "최정은",
      background: asset.cabin,

      character: asset.jeongeun,
      position: "right",

      text:
        "그래도 결과는 잘 나왔고 교수님 피드백도 좋았어. 과제 때문에 예민했던 거지, 끝나고까지 싸우고 그런 사이는 아니었어.",
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
        "목격자는 그 목소리가 김현수의 목소리와 비슷했다고 기억했다.",
    },
  ],
};

/* =========================================================
   SECOND INVESTIGATION
========================================================= */

const secondInterviews = {
  jiyoung: [
    {
      speaker: "사건 기록",
      background: asset.cabinAlt,

      text:
        "기내 엔터테인먼트 기록을 확인한 결과, 지영이 '영화'라고 말한 콘텐츠는 영화 카테고리에 등록된 영상이 아니었다.",

      note:
        "재생 기록은 사건 직전 한 차례 멈춰 있었다.",
    },

    {
      speaker: "사건 기록",
      background: asset.cabinAlt,

      text:
        "사건 전, 지영이 피해자의 좌석 방향에서 돌아오는 모습을 봤다는 증언이 나왔다.",
    },

    {
      speaker: "유지영",
      background: asset.cabin,

      character: asset.jiyoungProfile,
      position: "right",

      text:
        "...한 번 간 건 맞아. 개인적으로 돌려받을 게 있었어.",

      note:
        "1차 진술의 '거의 자리에서 움직이지 않았다'는 말은 사실이 아니었다.",
    },

    {
      speaker: "유지영",
      background: asset.cabin,

      character: asset.jiyoung,
      position: "left",

      text:
        "돈 문제만 있었던 것도 아니야. 내가 밀가루 잘 못 먹는 거 알면서 학교에 있는 과자 가져와서 바로 옆에서 먹고 그랬거든.",

      note:
        "사소해 보이는 행동들이 반복되며 불만이 쌓여 있었다.",
    },

    {
      speaker: "사건 기록",
      background: asset.cabinAlt,

      text:
        "지영이 자리로 돌아온 뒤 영상은 다시 재생됐다.",

      note:
        "이후 자막과 음량을 조작한 기록도 남아 있어, 커피가 전달될 무렵 지영이 좌석에 있었다는 정황이 된다.",
    },

    {
      speaker: "사건 기록",
      background: asset.cabinAlt,

      text:
        "인근 승객 역시 해당 시각 지영이 자신의 좌석에 있었다고 기억했다.",
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
      position: "right",

      text:
        "...잠깐 말다툼한 건 맞아. 괜히 이런 상황에서 더 의심받기 싫어서 말 안 했어.",
    },

    {
      speaker: "사건 기록",
      background: asset.cabinAlt,

      text:
        "담당 승무원은 커피가 전달되기 전부터 소희가 기내 뒤쪽 화장실을 기다리고 있던 것을 기억했다.",
    },

    {
      speaker: "사건 기록",
      background: asset.cabinAlt,

      text:
        "문제의 커피가 전달될 무렵에도 소희는 뒤쪽에 있었다.",

      note:
        "소희의 위치는 승무원의 증언과 일치한다.",
    },
  ],

  jeongeun: [
    {
      speaker: "사건 기록",
      background: asset.evidence,

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
      position: "right",

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
        "커피가 전달되던 핵심 순간, 현수가 자신의 좌석에 있었다는 기록이나 독립적인 목격 증언은 확인되지 않았다.",
    },

    {
      speaker: "추가 증언",
      background: asset.cabinAlt,

      text:
        "피해자 근처 좌석의 승객은 커피가 전달되던 순간 '승근아, 네 거 여기'라는 말을 들었다고 기억했다.",

      note:
        "평소 승근에게 이런 식으로 이름을 부르는 사람은 소희와 현수였다.",
    },

    {
      speaker: "사건 기록",
      background: asset.cabinAlt,

      text:
        "반면 소희는 그 순간 기내 뒤쪽 화장실 앞에 있었음이 이미 확인됐다.",

      note:
        "남은 가능성은 크게 좁혀졌다.",
    },

    {
      speaker: "김현수",
      background: asset.cabin,

      character: asset.hyeonsuProfile,
      position: "left",

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
    speaker: "내레이션",
    background: asset.cabinAlt,

    text:
      "지영도, 소희도, 정은도, 현수도 처음부터 모든 사실을 말하지 않았다.",
  },

  {
    speaker: "내레이션",
    background: asset.cabinAlt,

    text:
      "다른 세 사람이 숨긴 것은 의심받을 만한 감정이나 행동이었다.",

    note:
      "현수가 숨긴 것은 사건 당일의 시간과 행동이었다.",
  },

  {
    speaker: "내레이션",
    background: asset.cabin,

    prop: asset.groupPhoto,
    propType: "photoFocus",

    text:
      "마지막 단체사진을 찍을 당시 현수의 팔목에는 이미 기념 팔찌가 없었다.",
  },

  {
    speaker: "???",
    background: asset.cabinAlt,

    text:
      "승근아, 네 거 여기.",

    note:
      "피해자는 휴대폰을 보고 있어 커피를 건넨 사람을 제대로 확인하지 않았다.",
  },

  {
    speaker: "내레이션",
    background: asset.cabinAlt,

    character: asset.hyeonsu,
    position: "right",

    text:
      "그 핵심 순간 자신의 위치를 설명하지 못한 사람은 현수였다.",

    note:
      "근처 승객의 목소리 기억 역시 현수를 가리켰다.",
  },

  {
    speaker: "내레이션",
    background: asset.ending,

    character: asset.hyeonsuProfile,
    position: "left",

    text:
      "현수는 팔찌를 뺀 시점과 피해자의 자리로 간 사실을 모두 숨겼다.",
  },

  {
    speaker: "내레이션",
    background: asset.ending,

    prop: asset.dyingMessageNote,
    propType: "note",

    text:
      "승근이 마지막 순간 떠올린 것은 모두에게 있어야 했던 팔찌, 그리고 커피를 건넨 사람의 비어 있던 손목이었다.",

    note:
      "다섯 명 중 그 시점에 이미 팔찌가 없던 사람은 김현수였다.",
  },
];

/* =========================================================
   WRONG RESULT
========================================================= */

const wrongCopy = {
  jiyoung: {
    title: "유지영은 범인이 아니다.",

    body:
      "지영은 피해자의 자리로 이동한 사실을 숨겼다. 하지만 커피가 전달될 무렵에는 좌석에서 화면을 조작한 기록과 목격 증언이 남아 있다.",
  },

  sohee: {
    title: "전소희는 범인이 아니다.",

    body:
      "소희는 피해자와 말다툼한 사실을 숨겼다. 그러나 커피가 전달될 무렵에는 기내 뒤쪽 화장실 부근에 있었음이 확인됐다.",
  },

  jeongeun: {
    title: "최정은은 범인이 아니다.",

    body:
      "정은의 지문이 피해자의 컵에서 발견됐지만 컵을 옮긴 순간과 문제의 커피가 전달된 순간은 달랐다. 당시 정은은 승무원과 함께 있었다.",
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
function expandStoryScenes(scenes = []) {
  return scenes.flatMap((scene) => {
    if (!scene.note) {
      return [scene];
    }

    const {
      note,
      character,
      position,
      ...rest
    } = scene;

    return [
      {
        ...scene,
        note: undefined,
      },

      {
        ...rest,

        speaker: "내레이션",
        text: note,

        character: undefined,
        position: undefined,

        /*
         * 사진/증거 장면이라면
         * 설명 페이지에서도 같은 사진만 유지.
         */
        prop: scene.prop,
        propType: scene.propType,

        explanation: true,
      },
    ];
  });
}

/* =========================================================
   MAIN
========================================================= */

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
      openSummary("prologue", "caseOpen");
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
      setPhase("finalChoice");
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
      openSummary("prologue", "caseOpen");
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
     * WRONG
     * -> FINAL ACCUSATION
     */
    if (phase === "wrong") {
      setPhase("finalChoice");
      return;
    }

    /*
     * THE TRUTH
     * -> FINAL ACCUSATION
     */
    if (phase === "truth") {
      setStoryIndex(0);

      setPhase("finalChoice");

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
     ROUND 1
  ======================================================= */

  const openRound1 = (id) => {
    setActiveSuspect(id);
    setStoryIndex(0);

    setPhase("round1Story");
  };

  const requestFocus1 = () => {
    if (visitedRound1.length < 2) {
      return;
    }

    if (
      visitedRound1.length <
      suspects.length
    ) {
      setWarning({
        type: "round1",

        missing: suspects.filter(
          (suspect) =>
            !visitedRound1.includes(
              suspect.id
            )
        ),
      });

      return;
    }

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
    if (visitedRound2.length < 2) {
      return;
    }

    if (
      visitedRound2.length <
      suspects.length
    ) {
      setWarning({
        type: "round2",

        missing: suspects.filter(
          (suspect) =>
            !visitedRound2.includes(
              suspect.id
            )
        ),
      });

      return;
    }

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
    if (id === CORRECT_ID) {
      setWrongSuspect(null);

      setStoryIndex(0);

      setPhase("truth");

      return;
    }

    setWrongSuspect(id);

    setPhase("wrong");
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
        !["round1Hub", "focus1", "focus2"].includes(phase) && (
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
          onOpen={openRound1}
          proceedLabel="1차 집중 대상 선정"
          proceedEnabled={
            visitedRound1.length >=
            2
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
          description="지금까지 본 사람 중 더 자세히 알고 싶은 한 명을 선택하세요."
          candidates={suspects.filter(
            (suspect) =>
              visitedRound1.includes(
                suspect.id
              )
          )}
          onPick={
            chooseFirstFocus
          }
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
          onOpen={openRound2}
          proceedLabel="2차 집중 대상 선정"
          proceedEnabled={
            visitedRound2.length >=
            2
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
          description="첫 번째 집중 대상과 다른 한 명을 선택하세요. 이 인물의 숨겨진 이야기도 확인할 수 있습니다."
          candidates={suspects.filter(
            (suspect) =>
              visitedRound2.includes(
                suspect.id
              ) &&
              suspect.id !==
                firstFocus
          )}
          firstFocus={
            firstFocus
          }
          onPick={
            chooseSecondFocus
          }
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
      }`}
      style={{
        "--scene-darkness":
          scene.darkness ?? 0,

        "--scene-blur":
          `${scene.blur ?? 0}px`,
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

      {sceneCharacters.map((item) => (
        <CharacterVisual
          key={item.id ?? item.src}
          src={item.src}
          position={item.slot ?? "center"}
          animation={item.animation ?? "soft"}
          grouped={sceneCharacters.length > 1}
          fullBody={fullBodyAssets.has(item.src)}
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

      <div
        className={`${styles.simpleDialogue} ${
          dialogueSide ===
          "right"
            ? styles.simpleDialogueRight
            : styles.simpleDialogueLeft
        } ${
          scene.explanation
            ? styles.explanationDialogue
            : ""
        }`}
      >
        <div className={styles.dialogueSpeaker}>
          <strong>{scene.speaker}</strong>
        </div>

        <p>
          {scene.text}
        </p>
      </div>

      <StoryNavigation
        onPrev={onPrev}
        onNext={onNext}
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
      className={`${styles.characterVisual} ${positionClass} ${
        grouped ? styles.characterVisualGrouped : ""
      } ${fullBody ? styles.characterVisualFullBody : ""} ${animationClass}`}
    >
      <img
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
      <img
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
  return (
    <section
      className={`${styles.scene} ${styles.caseOpenScreen}`}
    >
      <Background
        src={asset.ending}
      />

      <div
        className={
          styles.caseOpenShade
        }
      />

      <div
        className={
          styles.caseOpenContent
        }
      >
        <span>
          INCIDENT DETECTED
        </span>

        <h2>
          CASE
          <br />
          OPEN
        </h2>

        <i />

        <p>
          네 명의 진술과 기록
          속에서
          <br />
          사건의 진실을 찾아라.
        </p>
      </div>

      <StoryNavigation
        onPrev={onPrev}
        onNext={onNext}
      />
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
  return (
    <section
      className={`${styles.scene} ${styles.hubScreen}`}
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
                    <img
                      src={
                        suspect.profile
                      }
                      alt=""
                    />
                  </div>

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

        <button
          className={`${styles.proceedButton} ${
            !proceedEnabled ? styles.proceedDisabled : ""
          }`}
          type="button"
          disabled={!proceedEnabled}
          onClick={onProceed}
        >
          <span>
            {proceedEnabled
              ? proceedLabel
              : "2명 이상 조사하면 진행할 수 있습니다"}
          </span>
          <b>→</b>
        </button>

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
          <button
            type="button"
            disabled={!proceedEnabled}
            onClick={onProceed}
          >
            NEXT PHASE →
          </button>
        </aside>
      </div>
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
  candidates,
  firstFocus,
  onPick,
}) {
  return (
    <section
      className={`${styles.scene} ${styles.focusScreen}`}
    >
      <div
        className={
          styles.focusInner
        }
      >
        <header
          className={
            styles.focusHeader
          }
        >
          <h2>{title}</h2>

          <p>
            {description}
          </p>

          {firstFocus && (
            <small>
              FOCUS 01 ·{" "}
              {
                suspectMap[
                  firstFocus
                ]?.name
              }
            </small>
          )}
        </header>

        <div
          className={
            styles.focusGrid
          }
        >
          {candidates.map(
            (suspect) => (
              <button
                key={
                  suspect.id
                }
                type="button"
                onClick={() =>
                  onPick(
                    suspect.id
                  )
                }
              >
                <div
                  className={
                    styles.focusPortrait
                  }
                >
                  <img
                    src={
                      suspect.image
                    }
                    alt=""
                  />
                </div>

                <strong>
                  {
                    suspect.name
                  }
                </strong>

              </button>
            )
          )}
        </div>
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
  return (
    <section
      className={`${styles.scene} ${styles.roundTwoIntro}`}
    >
      <div
        className={
          styles.roundTwoCopy
        }
      >
        <span>
          SECOND INVESTIGATION
        </span>

        {firstFocus && (
          <small>
            FOCUS 01 · {firstFocus.name}
          </small>
        )}

        <h2>
          진술과 기록이
          <br />
          맞지 않는다.
        </h2>

        <p>
          이제부터는 과거의 관계가
          아니라
          <br />
          사건 당일의 시간과 행동을
          확인합니다.
        </p>

        <button
          type="button"
          onClick={onNext}
        >
          2차 조사 시작 →
        </button>
      </div>
    </section>
  );
}

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
  const checked =
    suspects.filter(
      (suspect) =>
        visitedRound2.includes(
          suspect.id
        )
    );

  return (
    <section
      className={`${styles.scene} ${styles.reconstructionScreen}`}
    >
      <div
        className={
          styles.reconstructionInner
        }
      >
        <header
          className={
            styles.reconstructionHeader
          }
        >
          <span>
            FINAL RECONSTRUCTION
          </span>

          <h2>
            모두가 거짓말했다.
          </h2>

          <p>
            하지만 모두가 같은 것을
            숨긴 것은 아니었다.
          </p>
        </header>

        <div
          className={
            styles.reconstructionList
          }
        >
          {checked.map(
            (suspect) => (
              <article
                key={
                  suspect.id
                }
              >
                <div>
                  <small>
                    SUSPECT{" "}
                    {
                      suspect.number
                    }
                  </small>

                  <strong>
                    {
                      suspect.name
                    }
                  </strong>
                </div>

                <p>
                  {
                    suspect.secondSummary
                  }
                </p>

                {(firstFocus ===
                  suspect.id ||
                  secondFocus ===
                    suspect.id) && (
                  <span>
                    FOCUS
                  </span>
                )}
              </article>
            )
          )}

          {checked.length <
            4 && (
            <article
              className={
                styles.reconstructionMissing
              }
            >
              <div>
                <small>
                  WARNING
                </small>

                <strong>
                  미확인 진술
                </strong>
              </div>

              <p>
                아직 확인하지 않은
                2차 진술이 있습니다.
              </p>
            </article>
          )}
        </div>

        <div
          className={
            styles.reconstructionQuote
          }
        >
          <span>
            KEY QUESTION
          </span>

          <strong>
            누가 감정을 숨겼고,
            <br />
            누가 사건 당일의 행동을
            숨겼는가?
          </strong>
        </div>

        <nav
          className={
            styles.bottomActions
          }
        >
          <button
            type="button"
            onClick={onBack}
          >
            ← PREV
          </button>

          <button
            type="button"
            onClick={onNext}
          >
            최종 지목 →
          </button>
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

          <p>
            네 명 모두 다시 선택할 수
            있습니다.
          </p>
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
                  <img
                    src={
                      suspect.image
                    }
                    alt=""
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

                <b>
                  범인으로 지목 →
                </b>
              </button>
            )
          )}
        </div>

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
   WRONG
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
          <img
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

function CulpritScreen({
  onNext,
}) {
  return (
    <section
      className={`${styles.scene} ${styles.culpritScreen}`}
    >
      <div
        className={
          styles.culpritGlow
        }
      />

      <div
        className={
          styles.culpritInner
        }
      >
        <span>
          CULPRIT FOUND
        </span>

        <div
          className={
            styles.culpritPortrait
          }
        >
          <img
            src={
              asset.hyeonsu
            }
            alt=""
          />
        </div>

        <small>
          SUSPECT 04
        </small>

        <h2>
          김현수
        </h2>

        <i />

        <p>
          과거의 감정을 숨긴 사람은
          네 명 모두였다.
          <br />
          그러나 사건 당일 자신의
          행동을 숨긴 사람은 단 한
          명이었다.
        </p>
      </div>

      <button
        className={
          styles.culpritNext
        }
        type="button"
        onClick={onNext}
      >
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
          <img
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
                  <img src={item.image} alt="" />
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
}) {
  return (
    <nav
      className={
        styles.storyNav
      }
    >
      <button
        type="button"
        onClick={onPrev}
      >
        ← PREV
      </button>

      <button
        type="button"
        onClick={onNext}
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
  return (
    <img
      className={`${styles.background} ${
        src === asset.flight ? styles.backgroundNaturalFit : ""
      }`}
      src={src}
      alt=""
      aria-hidden="true"
    />
  );
}