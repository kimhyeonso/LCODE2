import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Balance.module.scss";
import tripRoad from "../data/trip_road.json";
import { getExchangeRates } from "../services/exchangeRateApi";

const tripImageModules = import.meta.glob("../assets/images/**/*", {
  eager: true,
  import: "default",
  query: "?url",
});

const tripImages = Object.fromEntries(
  Object.entries(tripImageModules).map(([path, url]) => [
    path.replace("../assets/images/", "").toLowerCase(),
    url,
  ]),
);

const cityNames = {
  강릉: "GANGNEUNG",
  거제: "GEOJE",
  부산: "BUSAN",
  서울: "SEOUL",
  여수: "YEOSU",
  제주도: "JEJU",
  오사카: "OSAKA",
  후쿠오카: "FUKUOKA",
  도쿄: "TOKYO",
  "오사카·도쿄": "OSAKA · TOKYO",
  상하이: "SHANGHAI",
  칭다오: "QINGDAO",
  베이징: "BEIJING",
  장가계: "ZHANGJIAJIE",
  청두: "CHENGDU",
  시안: "XI'AN",
  하얼빈: "HARBIN",
  다롄: "DALIAN",
  충칭: "CHONGQING",
  광저우: "GUANGZHOU",
  항저우: "HANGZHOU",
  홋카이도: "HOKKAIDO",
};

const resolveTripImage = (image) => (
  tripImages[image.replace(/^img\//i, "").toLowerCase()]
);

// 선택지에 사진을 넣을 때는 해당 객체에 아래처럼 image와 imageAlt를 추가하세요.
// { title: "선택지", description: "소제목", image: "/BalanceGame/파일명.png", imageAlt: "사진 설명" }
const questions = [
  {
    title: <>돈을 아낄 것인가,<br />시간을 아낄 것인가</>,
    choices: [
      { title: "20시간 경유", description: "항공권 10만 원 · 경유 3번 , 하루를 이동에", image: "/BalanceGame/bal01.png", imageAlt: "경유 여행" },
      { title: "2시간 직항", description: "항공권 80만 원 · 빠르고 편하게", image: "/BalanceGame/bal02.png", imageAlt: "직항 여행" },
    ],
  },
  {
    title: "여행의 속도를 하나만 선택 해야한다면 ?",
    choices: [
      { title: "새벽 6시부터 움직인다", description: "관광지 10곳 정복", image: "/BalanceGame/bal03.png", imageAlt: "이른 아침 여행" },
      { title: "오전 11시까지 늦잠자기", description: "관광지는 하루 두 곳만", image: "/BalanceGame/bal04.png", imageAlt: "느긋한 여행" },
    ],
  },
  {
    title: "여행에서 하나를 완전히 포기해야 한다면?",
    choices: [
      { title: "관광지 전부 포기", description: "관광지는 거둘뿐, 미식 여행", image: "/BalanceGame/bal05.png", imageAlt: "미식 여행" },
      { title: "관광지 전부 정복", description: "관광지는 풀코스로 5곳 이상부터", image: "/BalanceGame/bal06.png", imageAlt: "관광지 여행" },
    ],
  },
  {
    title: "남들과 다른 여행과 실패 없는 여행 중 하나만 고른다면?",
    choices: [
      { title: "핫플만 여행", description: "사람들로 붐비는 대신 모두가 인정하는", image: "/BalanceGame/bal07.png", imageAlt: "인기 여행지" },
      { title: "동네만 여행", description: "검색해도 잘 안 나오고 정보와 후기가 없는", image: "/BalanceGame/bal08.png", imageAlt: "한적한 동네 여행" },
    ],
  },
  {
    title: "완벽한 계획과 예상 밖의 여행 중 하나만 선택한다면?",
    choices: [
      { title: "1분 단위로 완벽하게 여행", description: "갑작스러운 일정 변경이 불가능한", image: "/BalanceGame/bal09.png", imageAlt: "계획적인 여행" },
      { title: "발길 닿는 대로 여행", description: "예약한 맛집과 명소가 하나도 없는", image: "/BalanceGame/bal10.png", imageAlt: "즉흥적인 여행" },
    ],
  },
  {
    title: "완벽한 날씨와 한적한 여행 중 하나만 가질 수 있다면?",
    choices: [
      { title: "일주일 내내 비오는 날씨", description: "모든 여행지에 관광객 0명", image: "/BalanceGame/bal11.png", imageAlt: "비 오는 한적한 여행지" },
      { title: "일주일 내내 완벽한 날씨", description: "모든 여행지에 2시간 기다리는", image: "/BalanceGame/bal12.png", imageAlt: "맑고 붐비는 여행지" },
    ],
  },
];

const analysisItems = [
  { label: "LOCAL", duration: 900 },
  { label: "SLOW", duration: 1200 },
  { label: "FOOD", duration: 1500 },
  { label: "SPONTANEOUS", duration: 1800 },
];

const results = [
  {
    title: "LOCAL", accent: "Flavor", label: "로컬 미식 탐험가",
    summary: "관광지보다 시장과 동네의 맛을 기억하는 사람",
    quote: "한 접시로 도시를 읽는다.",
    description: "관광 명소보다 시장 골목과 노포의 맛에서 그 도시의 진짜 표정을 읽어내는 여행을 좋아해요.",
    tendencies: [["LOCAL", 94], ["FOOD", 90], ["SLOW", 78], ["CURIOUS", 71]],
    image: "/BalanceGame/lo01.jfif",
  },
  {
    title: "ICONIC", accent: "Hunter", label: "아이코닉 스폿 헌터",
    summary: "도시를 대표하는 장면을 놓치지 않는 사람",
    quote: "유명한 데에는 이유가 있다.",
    description: "랜드마크와 대표 명소를 직접 확인하고 가장 상징적인 장면을 사진과 기억으로 남기는 여행을 좋아해요.",
    tendencies: [["ICONIC", 96], ["ACTIVE", 88], ["PHOTO", 84], ["POPULAR", 76]],
    image: "/BalanceGame/lo02.jfif",
  },
  {
    title: "SLOW", accent: "Local", label: "느긋한 로컬 여행자",
    summary: "서두르지 않고 한 동네에 오래 머무는 사람",
    quote: "천천히 걸어야 보이는 것이 있다.",
    description: "많은 곳을 방문하기보다 한 장소의 분위기와 일상을 충분히 느끼며 여유롭게 머무는 여행을 좋아해요.",
    tendencies: [["SLOW", 95], ["LOCAL", 87], ["REST", 82], ["MOOD", 73]],
    image: "/BalanceGame/lo03.jfif",
  },
  {
    title: "PERFECT", accent: "Route", label: "완벽한 루트 설계자",
    summary: "시간과 동선을 빈틈없이 설계하는 사람",
    quote: "좋은 여행은 완벽한 동선에서 시작된다.",
    description: "가고 싶은 장소와 이동 시간을 미리 정리하고 계획한 일정을 차근차근 완성하는 여행을 좋아해요.",
    tendencies: [["PLAN", 97], ["ROUTE", 92], ["ACTIVE", 81], ["DETAIL", 79]],
    image: "/BalanceGame/lo04.jfif",
  },
  {
    title: "NO PLAN", accent: "Just Go", label: "즉흥 여행 모험가",
    summary: "계획보다 그날의 기분을 따라 움직이는 사람",
    quote: "발길이 닿는 곳이 오늘의 목적지.",
    description: "정해진 일정에 얽매이지 않고 우연히 만난 풍경과 예상 밖의 순간을 즐기는 여행을 좋아해요.",
    tendencies: [["FREE", 96], ["CURIOUS", 89], ["ACTIVE", 80], ["LOCAL", 72]],
    image: "/BalanceGame/lo05.jfif",
  },
  {
    title: "CITY", accent: "Comfort", label: "도시의 여유 수집가",
    summary: "편안함과 세련된 도시 여행을 즐기는 사람",
    quote: "여유로운 도시가 가장 좋은 휴식이다.",
    description: "편리한 이동과 쾌적한 공간을 바탕으로 도시의 문화와 휴식을 균형 있게 즐기는 여행을 좋아해요.",
    tendencies: [["COMFORT", 95], ["CITY", 91], ["REST", 83], ["STYLE", 74]],
    image: "/BalanceGame/lo06.jfif",
  },
  {
    title: "SMART", accent: "Value", label: "스마트 밸류 여행자",
    summary: "합리적인 선택으로 만족을 높이는 사람",
    quote: "아낀 만큼 더 오래 여행한다.",
    description: "가격과 시간을 꼼꼼하게 비교하고 꼭 필요한 경험에 집중해 효율과 만족을 모두 챙기는 여행을 좋아해요.",
    tendencies: [["VALUE", 97], ["SMART", 91], ["PLAN", 85], ["FLEXIBLE", 70]],
    image: "/BalanceGame/lo07.jfif",
  },
  {
    title: "CITY", accent: "Gourmet", label: "시티 미식 큐레이터",
    summary: "도시의 새로운 맛과 공간을 찾아다니는 사람",
    quote: "도시의 취향은 테이블 위에 있다.",
    description: "새로운 레스토랑과 카페를 발견하고 도시마다 다른 감각과 미식 문화를 경험하는 여행을 좋아해요.",
    tendencies: [["FOOD", 96], ["CITY", 90], ["TREND", 82], ["CURIOUS", 77]],
    image: "/BalanceGame/lo08.jfif",
  },
];

const createRecommendations = () => {
  const eligibleTrips = tripRoad.trips
    .map((trip) => ({
      ...trip,
      places: trip.days
        .flatMap((day) => day.items)
        .filter((item) => item.type === "place" && item.image && resolveTripImage(item.image)),
    }))
    .filter((trip) => trip.places.length > 0)
    .sort(() => Math.random() - 0.5);

  const uniqueTrips = [];
  const usedCities = new Set();

  eligibleTrips.forEach((trip) => {
    if (uniqueTrips.length < 3 && !usedCities.has(trip.city)) {
      uniqueTrips.push(trip);
      usedCities.add(trip.city);
    }
  });

  return uniqueTrips.map((trip) => {
    const place = trip.places[Math.floor(Math.random() * trip.places.length)];
    return {
      country: trip.country,
      city: trip.city,
      cityEnglish: cityNames[trip.city] || trip.city,
      title: trip.title,
      duration: trip.duration,
      place: place.place,
      image: resolveTripImage(place.image),
      costs: trip.costs || null,
      totalEstimatedCostKRW: trip.totalEstimatedCostKRW || null,
      dayCount: trip.days.length,
    };
  });
};

const formatKRW = (value) => value == null
  ? "가격 정보 준비 중"
  : `약 ₩${Math.round(value).toLocaleString("ko-KR")}`;

const averageCost = (cost) => cost
  ? Math.round((cost.minKRW + cost.maxKRW) / 2)
  : null;

const estimatedCostForTrip = (trip) => trip.totalEstimatedCostKRW
  ? Math.round((trip.totalEstimatedCostKRW.min + trip.totalEstimatedCostKRW.max) / 2)
  : 105000 + (trip.dayCount * 60000);

const exchangeByCountry = {
  japan: { code: "JPY", symbol: "¥", name: "엔화", rate: 920, baseUnit: 100 },
  china: { code: "CNY", symbol: "CN¥", name: "위안화", rate: 190, baseUnit: 1 },
  korea: { code: "KRW", symbol: "₩", name: "원화", rate: 1, baseUnit: 1 },
};

const ExchangeSummary = ({ exchange, estimatedExpense }) => {
  const converted = estimatedExpense == null
    ? null
    : (estimatedExpense * exchange.baseUnit) / exchange.rate;
  const formattedAmount = converted == null
    ? `${exchange.symbol}${exchange.baseUnit.toLocaleString("ko-KR")} ≈ ₩${exchange.rate.toLocaleString("ko-KR")}`
    : `${exchange.symbol}${converted.toLocaleString("ko-KR", {
      minimumFractionDigits: exchange.code === "KRW" ? 0 : 2,
      maximumFractionDigits: exchange.code === "KRW" ? 0 : 2,
    })}`;

  return (
    <div className={styles.exchangeSummary}>
      <div className={styles.exchangeCard}>
        <span>예상 여행 경비 {exchange.name}</span>
        <strong>{formattedAmount}</strong>
        <p>최근 업데이트<small>{exchange.date || new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date())}</small></p>
      </div>
      <Link to={`/destination?currency=${exchange.code}`} className={styles.exchangeMore}>
        환율 자세히 보기 <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
};

const Analysis = ({ onComplete }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const totalDuration = Math.max(...analysisItems.map((item) => item.duration));
    const startTime = performance.now();
    let animationFrame;

    const animate = (now) => {
      const elapsed = Math.min(now - startTime, totalDuration);
      setElapsedTime(elapsed);

      if (elapsed < totalDuration) animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 2000);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <section className={styles.analysis}>
      <div className={styles.analysisIntro}>
        <p className={styles.analysisEyebrow}>ANALYZING YOUR CHOICES</p>
        <h1>
          DECODING
          <br />
          YOUR
          <br />
          TRAVEL CODE...
        </h1>
        <p className={styles.analysisDescription}>
          당신이 고른 6개의 선택에서
          <br />
          여행 취향을 찾고 있어요.
        </p>
      </div>

      <div className={styles.analysisBars}>
        {analysisItems.map((item) => {
          const itemProgress = Math.min(elapsedTime / item.duration, 1);
          const easedProgress = 1 - Math.pow(1 - itemProgress, 3);
          const currentValue = Math.round(easedProgress * 100);

          return (
            <div className={styles.analysisItem} key={item.label}>
              <div className={styles.analysisLabel}>
                <span>{item.label}</span>
                <strong>{currentValue}%</strong>
              </div>
              <div className={styles.analysisTrack}>
                <span style={{ width: `${currentValue}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const Result = ({ result, onPlan }) => (
  <section className={styles.result}>
    <div className={styles.resultVisual}>
      <h1>
        {result.title}
        <br />
        <em>{result.accent}</em>
      </h1>
      <div className={styles.resultSummary}>
        <strong>{result.label}</strong>
        <p>{result.summary}</p>
      </div>
      <img src={result.image} alt={`${result.label} 여행 유형`} />
    </div>

    <div className={styles.resultDetails}>
      <p className={styles.resultEyebrow}>YOUR TRAVEL DNA</p>
      <div className={styles.resultQuote}>
        <h2>“{result.quote}”</h2>
        <p>{result.description}</p>
      </div>

      <p className={styles.resultEyebrow}>TENDENCIES</p>
      <div className={styles.tendencies}>
        {result.tendencies.map(([label, value]) => (
          <div className={styles.tendency} key={label}>
            <div><strong>{label}</strong><span>{value}</span></div>
            <div className={styles.tendencyTrack}><span style={{ width: `${value}%` }} /></div>
          </div>
        ))}
      </div>

      <button type="button" className={styles.planButton} onClick={onPlan}>
        맞춤 일정 보러가기
      </button>
    </div>
  </section>
);

const MatchScreen = ({ recommendations, onItinerary, onHome, onGame }) => {
  const [primary, ...more] = recommendations;
  const defaultExchange = exchangeByCountry[primary?.country] || exchangeByCountry.korea;
  const [exchange, setExchange] = useState(defaultExchange);

  useEffect(() => {
    let active = true;

    if (defaultExchange.code === "KRW") {
      setExchange(defaultExchange);
      return () => { active = false; };
    }

    getExchangeRates()
      .then((rates) => {
        const rate = rates.find((item) => item.code === defaultExchange.code);
        if (active && rate) setExchange({ ...defaultExchange, ...rate });
      })
      .catch(() => {
        if (active) setExchange(defaultExchange);
      });

    return () => { active = false; };
  }, [defaultExchange.code]);

  if (!primary) return null;

  const estimatedExpense = estimatedCostForTrip(primary);
  const dayCount = primary.dayCount;
  const expenseRows = [
    ["교통", averageCost(primary.costs?.transportation) || 40000 + dayCount * 5000],
    ["식비", averageCost(primary.costs?.food) || dayCount * 30000],
    ["카페", dayCount * 10000],
    ["관광 / 입장료", dayCount * 15000],
    ["쇼핑", 50000],
    ["기타", 15000],
  ];
  const quickAmounts = [1000, 5000, 10000];

  return (
    <section className={styles.matches}>
      <nav className={styles.matchNav} aria-label="밸런스게임 결과 이동">
        <button type="button" onClick={onHome}>← HOME</button>
        <button type="button" onClick={onGame}>GAME →</button>
      </nav>

      <header className={styles.matchesHeader}>
        <p>YOUR BEST MATCH</p>
        <h1>당신과 가장 잘 맞는 여행</h1>
      </header>

      <article className={styles.primaryMatch}>
        <img src={primary.image} alt={primary.place} />
        <div className={styles.matchShade} aria-hidden="true" />
        <div className={styles.primaryCopy}>
          <p><strong>89%</strong> <span>MATCH</span></p>
          <h2>{primary.cityEnglish}</h2>
          <p className={styles.matchDescription}>{primary.place} · {primary.title}</p>
          <small>{primary.duration} · TRIP ROAD</small>
          <button type="button" onClick={onItinerary}>경비 설정하기 <span>→</span></button>
        </div>
      </article>

      <div className={styles.desktopExchange}>
        <ExchangeSummary exchange={exchange} estimatedExpense={estimatedExpense} />
      </div>

      <section className={styles.expensePanel} aria-label="예상 여행 경비">
        <p className={styles.expenseEyebrow}>ESTIMATED EXPENSE</p>
        <p className={styles.expenseLabel}>예상 여행 경비</p>
        <strong className={styles.expenseTotal}>{formatKRW(estimatedExpense)}</strong>
        <p className={styles.expenseNotice}>
          항공권 · 숙박비 제외
        </p>

        <ExchangeSummary exchange={exchange} estimatedExpense={estimatedExpense} />

        <p className={styles.expenseEyebrow}>EXPENSE BREAKDOWN</p>
        <div className={styles.expenseBreakdown}>
          {expenseRows.map(([label, amount]) => (
            <div key={label}>
              <span>{label}</span>
              <p>
                <strong>₩{amount.toLocaleString("ko-KR")}</strong>
                <small>≈ ₩{Math.round(amount * 1.08).toLocaleString("ko-KR")}</small>
              </p>
            </div>
          ))}
        </div>

        <div className={styles.quickExpense}>
          <p className={styles.expenseEyebrow}>QUICK CONVERT</p>
          <div>
            {quickAmounts.map((amount) => (
              <span key={amount}>
                <b>{exchange.symbol}{amount / 1000}K</b>
                ₩{Math.round((amount * exchange.rate) / exchange.baseUnit).toLocaleString("ko-KR")}
              </span>
            ))}
          </div>
        </div>
      </section>

      <aside className={styles.moreMatches}>
        <p className={styles.moreLabel}>MORE FOR YOU</p>
        {more.map((trip, index) => (
          <article className={styles.matchRow} key={`${trip.city}-${trip.place}`}>
            <img src={trip.image} alt={trip.place} />
            <div>
              <p className={styles.matchPercent}><strong>{index === 0 ? 83 : 77}%</strong> <span>MATCH</span></p>
              <h2>{trip.cityEnglish}</h2>
              <p>{trip.place} · {trip.title}</p>
              <p className={styles.moreExpense}>
                예상 여행 경비 <strong>{formatKRW(estimatedCostForTrip(trip))}</strong>
              </p>
              <button type="button" onClick={onItinerary}>여행 일정 보기 <span>→</span></button>
            </div>
          </article>
        ))}
      </aside>

      <button type="button" className={styles.retryButton} onClick={onGame}>다시 테스트하기</button>
    </section>
  );
};

const Balance = () => {
  const navigate = useNavigate();
  const [hasStarted, setHasStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultIndex, setResultIndex] = useState(0);
  const [showMatches, setShowMatches] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const question = questions[questionIndex];

  const handleBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex((current) => current - 1);
      return;
    }

    setHasStarted(false);
  };

  const handleChoice = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      return;
    }

    setResultIndex(Math.floor(Math.random() * results.length));
    setShowAnalysis(true);
  };

  if (showAnalysis) {
    return (
      <Analysis
        onComplete={() => {
          setShowAnalysis(false);
          setShowResult(true);
        }}
      />
    );
  }

  if (showResult) {
    if (showMatches) {
      return (
        <MatchScreen
          recommendations={recommendations}
          onItinerary={() => navigate("/itinerary")}
          onHome={() => navigate("/")}
          onGame={() => {
            setShowMatches(false);
            setShowResult(false);
            setShowAnalysis(false);
            setQuestionIndex(0);
            setHasStarted(false);
          }}
        />
      );
    }

    return (
      <Result
        result={results[resultIndex]}
        onPlan={() => {
          setRecommendations(createRecommendations());
          setShowMatches(true);
        }}
      />
    );
  }

  if (hasStarted) {
    return (
      <section className={styles.game}>
        <div className={styles.gameHeader}>
          <button type="button" onClick={handleBack}>
            <span aria-hidden="true">←</span> BACK
          </button>
          <p>
            <strong>{String(questionIndex + 1).padStart(2, "0")}</strong> / 06
          </p>
          <div className={styles.questionProgress} aria-hidden="true">
            {questions.map((_, index) => (
              <span
                className={index <= questionIndex ? styles.questionProgressDone : ""}
                key={index}
              />
            ))}
          </div>
        </div>

        <h1 className={styles.question}>{question.title}</h1>

        <div className={styles.choices}>
          <button className={styles.choice} type="button" onClick={handleChoice}>
            {question.choices[0].image && (
              <img
                className={styles.choiceImage}
                src={question.choices[0].image}
                alt={question.choices[0].imageAlt || ""}
              />
            )}
            <span className={styles.choiceLetter}>A</span>
            <span className={styles.choiceCopy}>
              <strong>{question.choices[0].title}</strong>
              <small>{question.choices[0].description}</small>
            </span>
          </button>

          <span className={styles.versus} aria-hidden="true">VS</span>

          <button className={styles.choice} type="button" onClick={handleChoice}>
            {question.choices[1].image && (
              <img
                className={styles.choiceImage}
                src={question.choices[1].image}
                alt={question.choices[1].imageAlt || ""}
              />
            )}
            <span className={styles.choiceLetter}>B</span>
            <span className={`${styles.choiceCopy} ${styles.choiceCopyRight}`}>
              <strong>{question.choices[1].title}</strong>
              <small>{question.choices[1].description}</small>
            </span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.main}>
      <img
        className={styles.background}
        src="/BalanceGame/p1.png"
        alt="한옥 숙소에서 바라본 서울의 풍경"
      />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.content}>
        <div className={styles.eyebrow}>
          <button type="button" onClick={() => navigate("/")}>
            <span aria-hidden="true">←</span> HOME
          </button>
          <p>TRAVEL TEST</p>
        </div>

        <h1>
          WHAT&apos;S YOUR
          <br />
          TRAVEL
          <br />
          CODE?
        </h1>

        <div className={styles.intro}>
          <p className={styles.lead}>
            당신의 여행 취향은
            <br />
            어느 쪽에 더 가까울까요?
          </p>
          <p className={styles.description}>
            6개의 극단적인 선택을 통해
            <br />
            나도 몰랐던 여행 DNA를 찾아보세요.
          </p>
        </div>

        <button
          className={styles.startButton}
          type="button"
          onClick={() => {
            setQuestionIndex(0);
            setShowAnalysis(false);
            setShowResult(false);
            setShowMatches(false);
            setHasStarted(true);
          }}
        >
          시작하기 <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
};

export default Balance;
