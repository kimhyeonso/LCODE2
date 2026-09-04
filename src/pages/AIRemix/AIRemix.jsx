import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import tripRoad from "../../data/trip_road.json";
import { useAuth } from "../../hooks/useAuth";
import { getPlan, getPlans } from "../../services/firestoreService";
import { resolveImageUrl } from "../../utils/imageUtils";
import styles from "./AIRemix.module.scss";

const reasons = [
  { id: "rain", no: "01", icon: "⠿", title: "RAIN", desc: "비가 와요" },
  { id: "delay", no: "02", icon: "◷", title: "DELAY", desc: "일정이 늦어졌어요" },
  { id: "traffic", no: "03", icon: "→", title: "TRAFFIC", desc: "교통이 지연됐어요" },
  { id: "closed", no: "04", icon: "×", title: "CLOSED", desc: "방문 장소가 문을 닫았어요" },
  { id: "tired", no: "05", icon: "−", title: "TIRED", desc: "조금 피곤해요" },
  { id: "cost", no: "06", icon: "↓", title: "CUT COSTS", desc: "경비 절감" },
  { id: "auto", no: "07", icon: "↻", title: "AUTO", desc: "알아서 최적화" },
];

const analyzeSteps = ["현재 위치 확인", "날씨 정보 수집", "실내 장소 탐색", "이동 경로 계산", "일정 재구성"];

const resultCopy = {
  rain: { title: "야외 일정을\n실내로 바꿔드렸어요.", desc: "현재 상황을 고려해 이동 부담을 줄이고, 방문하기 좋은 대체 장소를 골랐어요.", type: "compare" },
  delay: { title: "오늘 일정이\n조금 더 가벼워졌어요.", desc: "늦어진 시간을 반영해 핵심 장소 위주로 다시 정리했어요.", type: "timeline" },
  traffic: { title: "막히는 길을 피해\n동선을 다시 잡았어요.", desc: "현재 이동 부담을 줄일 수 있도록 가까운 장소 순서로 재배치했어요.", type: "timeline" },
  closed: { title: "문이 닫힌 곳을\n대신할 장소를 찾았어요.", desc: "방문 예정 장소 대신 같은 지역에서 이어가기 좋은 장소를 추천했어요.", type: "closed" },
  tired: { title: "여유로운 일정으로\n조정했어요.", desc: "휴식 시간을 확보하고 무리한 이동을 줄이는 방향으로 다시 구성했어요.", type: "timeline" },
  cost: { title: "이동 비용을 줄이는\n일정으로 바꿨어요.", desc: "도보 이동과 가까운 장소를 우선해 전체 경비 부담을 낮췄어요.", type: "timeline" },
  auto: { title: "오늘 일정에 맞게\n자동으로 최적화했어요.", desc: "날씨, 거리, 운영 시간을 함께 계산해 무리 없는 순서로 정리했어요.", type: "timeline" },
};

const cityAliases = {
  SEOUL: "서울",
  TOKYO: "도쿄",
  FUKUOKA: "후쿠오카",
  OSAKA: "오사카",
  SHANGHAI: "상하이",
};

const createdTime = (plan) =>
  plan?.updatedAt?.toMillis?.()
  || (plan?.updatedAt?.seconds || 0) * 1000
  || plan?.createdAt?.toMillis?.()
  || (plan?.createdAt?.seconds || 0) * 1000
  || 0;

const formatDayTitle = (index) => `DAY ${String(index + 1).padStart(2, "0")}`;

const addMinutes = (time, amount) => {
  if (!/^\d{2}:\d{2}$/.test(time || "")) return time || "--:--";
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date(2026, 0, 1, hour, minute + amount);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const placeItems = (trip) =>
  (trip?.days || [])
    .flatMap((day, dayIndex) =>
      (day.items || [])
        .filter((item) => item.type === "place")
        .map((item) => ({ ...item, dayIndex })),
    );

const placesForDay = (trip, dayIndex) =>
  (trip?.days?.[dayIndex]?.items || []).filter((item) => item.type === "place");

const placeRowsForDay = (trip, dayIndex) =>
  (trip?.days?.[dayIndex]?.items || []).reduce((rows, item, index, items) => {
    if (item.type !== "place") return rows;
    const nextTransport = items[index + 1]?.type === "transport" ? items[index + 1] : null;
    rows.push({ ...item, transport: nextTransport?.transport || "" });
    return rows;
  }, []);

const minutesFromTransport = (transport) => {
  const text = String(transport || "");
  const hour = text.match(/(\d+)\s*시간/);
  const minute = text.match(/(\d+)\s*분/);
  if (hour || minute) {
    return (Number(hour?.[1] || 0) * 60) + Number(minute?.[1] || 0);
  }
  const fallback = text.match(/(\d+)/);
  return fallback ? Number(fallback[1]) : 12;
};

const routeLabel = (transport, minutes) => {
  const mode = String(transport || "")
    .replace(/·/g, " ")
    .replace(/약/g, "")
    .replace(/\d+\s*시간/g, "")
    .replace(/\d+\s*분/g, "")
    .replace(/\s+/g, " ")
    .trim() || "도보";

  return `${mode} ${Math.max(1, minutes)}분`;
};

const pickDayIndex = (trip) => {
  const found = (trip?.days || []).findIndex((day) => (day.items || []).filter((item) => item.type === "place").length >= 2);
  if (found >= 0) return found;
  return 0;
};

const findReplacement = (trip, target) => {
  const places = placeItems(trip);
  return places.find((place) => place.place !== target?.place && ["restaurant", "hotel", "station"].includes(place.category))
    || places.find((place) => place.place !== target?.place)
    || target;
};

const normalizeTitle = (trip) => trip?.title || `${trip?.city || "여행지"} 여행`;

const editorPath = ({ planId, trip }) =>
  planId ? `/travel-planner?plan=${encodeURIComponent(planId)}` : `/travel-planner?trip=${encodeURIComponent(trip?.id || "")}`;

function createRemix(trip, reason) {
  const dayIndex = pickDayIndex(trip);
  const beforePlaces = placeRowsForDay(trip, dayIndex);
  const target = beforePlaces.find((place) => place.category === "attraction") || beforePlaces[0] || placeItems(trip)[0];
  const replacement = findReplacement(trip, target);
  const targetRoute = target?.transport || beforePlaces.find((place) => place.transport)?.transport || "";
  const routeBeforeMinutes = minutesFromTransport(targetRoute);
  const routeReduction = reason.id === "traffic" ? 6 : reason.id === "cost" ? 5 : reason.id === "tired" ? 4 : 7;
  const routeAfterMinutes = Math.max(1, routeBeforeMinutes - routeReduction);
  const beforeRows = beforePlaces.slice(0, 4).map((place) => [place.time || "--:--", place.place, ""]);
  const adjustedRows = beforePlaces.slice(0, 4).map((place, index) => {
    const minutes = reason.id === "delay" ? -20 : reason.id === "traffic" ? index * 10 : 0;
    const tag = index === 0 ? "SAME" : reason.id === "tired" && index === beforePlaces.length - 1 ? "REMOVED" : "";
    return [addMinutes(place.time, minutes), place.place, tag];
  });
  const replacedRows = beforePlaces.slice(0, 4).map((place, index) => {
    if (place.place !== target?.place) return [place.time || "--:--", place.place, index === 0 ? "SAME" : ""];
    return [place.time || "--:--", replacement?.place || place.place, reason.id === "closed" ? "ADDED" : "INDOOR"];
  });

  return {
    dayIndex,
    target,
    replacement,
    beforeRows,
    afterRows: ["rain", "closed"].includes(reason.id) ? replacedRows : adjustedRows,
    savedKm: reason.id === "cost" ? "3.4" : ((routeBeforeMinutes - routeAfterMinutes) * 0.18).toFixed(1),
    routeBefore: routeLabel(targetRoute, routeBeforeMinutes),
    routeAfter: routeLabel(targetRoute, routeAfterMinutes),
    beforeTime: beforeRows.at(-1)?.[0] || "21:10",
    afterTime: addMinutes(beforeRows.at(-1)?.[0], reason.id === "delay" ? -30 : -20),
  };
}

export default function AIRemix() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [stage, setStage] = useState("select");
  const [reason, setReason] = useState(reasons[0]);
  const [progress, setProgress] = useState(0);
  const [loadedPlan, setLoadedPlan] = useState(null);
  const [loadDone, setLoadDone] = useState(false);
  const [sourcePlan, setSourcePlan] = useState(null);
  const [planError, setPlanError] = useState("");

  const requestedPlanId = params.get("plan") || params.get("saved") || "";
  const requestedTripId = params.get("trip") || "";
  const requestedCity = cityAliases[params.get("city")?.toUpperCase()] || params.get("city") || "";

  useEffect(() => {
    let active = true;

    const loadPlan = async () => {
      setLoadDone(false);
      try {
        if (requestedPlanId) {
          const plan = await getPlan(requestedPlanId);
          if (active) setLoadedPlan(plan);
          return;
        }
        if (!authLoading && user) {
          const plans = await getPlans(user.uid);
          const latest = [...plans].sort((a, b) => createdTime(b) - createdTime(a))[0] || null;
          if (active) setLoadedPlan(latest);
          return;
        }
        if (active) setLoadedPlan(null);
      } finally {
        if (active) setLoadDone(true);
      }
    };

    loadPlan();
    return () => { active = false; };
  }, [authLoading, requestedPlanId, user]);

  const selectedTrip = useMemo(() => {
    if (loadedPlan) return loadedPlan;
    const defaultTrip = tripRoad.trips.find((trip) => trip.city === cityAliases.SEOUL) || tripRoad.trips[0];
    return tripRoad.trips.find((trip) => trip.id === requestedTripId)
      || tripRoad.trips.find((trip) => trip.city === requestedCity)
      || defaultTrip;
  }, [loadedPlan, requestedCity, requestedTripId]);

  const result = useMemo(() => ({ ...resultCopy[reason.id], tag: reason.title, reasonId: reason.id }), [reason]);
  const remix = useMemo(() => createRemix(selectedTrip, reason), [reason, selectedTrip]);
  const planId = loadedPlan?.id || requestedPlanId;
  const editUrl = editorPath({ planId, trip: selectedTrip });

  useEffect(() => {
    if (!planId || !user?.uid) return undefined;
    let active = true;
    getPlan(planId)
      .then((plan) => {
        if (!active) return;
        if (!plan || plan.userId !== user.uid) {
          setPlanError("리믹스할 저장 일정을 찾을 수 없습니다.");
          return;
        }
        setSourcePlan(plan);
        setPlanError("");
      })
      .catch(() => active && setPlanError("저장 일정을 불러오지 못했습니다."));
    return () => { active = false; };
  }, [planId, user?.uid]);

  useEffect(() => {
    if (stage !== "analyzing") return undefined;

    const timer = window.setInterval(() => {
      setProgress((value) => {
        const next = Math.min(value + 12, 100);
        if (next >= 100) {
          window.clearInterval(timer);
          window.setTimeout(() => setStage("result"), 260);
        }
        return next;
      });
    }, 180);

    return () => window.clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== "complete") return undefined;

    const timer = window.setTimeout(() => setStage("edit"), 1000);
    return () => window.clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [stage]);

  const selectReason = (item) => {
    setReason(item);
    setProgress(0);
    setStage("analyzing");
  };

  const reset = () => {
    setStage("select");
    setProgress(0);
  };

  if (!loadDone) {
    return (
      <main className={`${styles.page} aiRemixPageRoot`}>
        <section className={styles.analyzing}>
          <p className={styles.meta}>L:CODE AI REMIX</p>
          <h1>일정을 불러오고 있어요.</h1>
        </section>
      </main>
    );
  }

  return (
    <main className={`${styles.page} aiRemixPageRoot`}>
      {stage === "select" && (
        <section className={styles.selectPanel}>
          <header className={styles.selectHeader}>
            <span>L:CODE AI REMIX</span>
            <button type="button" onClick={() => navigate(-1)}>CLOSE ×</button>
          </header>
          <div className={styles.intro}>
            <h1>오늘 일정,<br />다시 맞춰볼까요?</h1>
            <p>{sourcePlan ? `${sourcePlan.title || sourcePlan.city || "저장된 일정"}을 기준으로` : `${selectedTrip.city} 일정에서 생긴 돌발상황을 선택하면`}<br />남은 일정을 다시 구성해드려요.</p>
            {planError && <p role="alert">{planError}</p>}
          </div>
          <ul className={styles.reasonList}>
            {reasons.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => selectReason(item)}>
                  <span>{item.no}</span>
                  <i className={item.id === "rain" ? styles.rainMark : ""}>{item.id === "rain" ? "" : item.icon}</i>
                  <strong>{item.title}</strong>
                  <em>{item.desc}</em>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {stage === "analyzing" && (
        <section className={styles.analyzing}>
          <p className={styles.meta}>L:CODE AI REMIX — {reason.title}</p>
          <h1>남은 일정을<br />다시 계산하고 있어요.</h1>
          <ol>
            {analyzeSteps.map((step, index) => {
              const done = progress >= (index + 1) * 20;
              return (
                <li className={done ? styles.done : ""} key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                  <b>{done ? "✓" : "•"}</b>
                </li>
              );
            })}
          </ol>
          <div className={styles.progress}>
            <span>ANALYZING</span>
            <strong>{progress}%</strong>
            <i style={{ width: `${progress}%` }} />
          </div>
        </section>
      )}

      {stage === "result" && (
        <ResultView result={result} remix={remix} onBack={reset} onApply={() => setStage("complete")} />
      )}

      {stage === "complete" && (
        <section className={styles.complete}>
          <span>REMIX COMPLETE</span>
          <h1>새 일정이<br />적용되었습니다.</h1>
          <i />
        </section>
      )}

      {stage === "edit" && <EditView trip={selectedTrip} remix={remix} editUrl={editUrl} onBack={reset} />}
    </main>
  );
}

function ResultView({ result, remix, onBack, onApply }) {
  const resultClass = `${styles.result} ${styles[`${result.reasonId}Result`] || ""}`;

  return (
    <section className={resultClass}>
      <header className={styles.resultHeader}>
        <span>REMIX RESULT</span>
        <em>{result.tag}</em>
      </header>
      <h1>{result.title}</h1>
      <p>{result.desc}</p>
      {result.type === "compare" && <RainCompare remix={remix} />}
      {result.type === "closed" && <ClosedChange remix={remix} />}
      {result.type === "timeline" && <TimelineChange remix={remix} variant={result.reasonId} />}
      <div className={styles.actions}>
        <button type="button" onClick={onBack}>기존 일정 유지</button>
        <button type="button" onClick={onApply}>변경 일정 적용</button>
      </div>
    </section>
  );
}

function RainCompare({ remix }) {
  const beforeStyle = {
    "--compare-image": remix.target?.image ? `url(${resolveImageUrl(remix.target.image)})` : "linear-gradient(#aaa, #aaa)",
  };
  const afterStyle = {
    "--compare-image": remix.replacement?.image ? `url(${resolveImageUrl(remix.replacement.image)})` : "linear-gradient(#aaa, #aaa)",
  };

  return (
    <>
      <div className={styles.compare}>
        <article style={beforeStyle}>
          <span>BEFORE</span>
          <div />
          <h2>{remix.target?.place || "기존 장소"}</h2>
          <p>OUTDOOR</p>
        </article>
        <article style={afterStyle}>
          <span>AFTER</span>
          <div />
          <h2>{remix.replacement?.place || "대체 장소"}</h2>
          <p>INDOOR / NEARBY</p>
        </article>
      </div>
      <aside className={styles.summaryNote}>현재 상황을 고려해 {remix.target?.place || "기존 장소"} 대신 {remix.replacement?.place || "대체 장소"}로 변경했어요.</aside>
      <ChangeDetails remix={remix} />
    </>
  );
}

function ClosedChange({ remix }) {
  return (
    <>
      <section className={styles.placeChange}>
        <article>
          <span>ORIGINAL</span>
          <h2>{remix.target?.place || "기존 장소"}</h2>
          <p>CLOSED</p>
        </article>
        <b>↓</b>
        <article className={styles.darkPlace}>
          <span>REPLACEMENT</span>
          <h2>{remix.replacement?.place || "대체 장소"}</h2>
          <p>NEARBY · AVAILABLE TODAY</p>
        </article>
      </section>
      <p className={styles.softText}>방문 예정 장소 대신 같은 일정 안에서 이어가기 좋은 장소를 추천했어요.</p>
      <ChangeDetails remix={remix} closed />
    </>
  );
}

const timelineTheme = {
  traffic: {
    eyebrow: "ROUTE CONTROL",
    title: "막히는 구간을 피해 가까운 순서로 정리했어요.",
    left: "BYPASS",
    right: "LESS WAIT",
  },
  tired: {
    eyebrow: "REST MODE",
    title: "무리한 이동을 줄이고 쉴 시간을 확보했어요.",
    left: "REST ADDED",
    right: "LIGHT PLAN",
  },
  cost: {
    eyebrow: "BUDGET SAVE",
    title: "택시/장거리 이동을 줄여 비용 부담을 낮췄어요.",
    left: "LOW COST",
    right: "SHORT ROUTE",
  },
};

function TimelineChange({ remix, variant }) {
  const theme = timelineTheme[variant];

  return (
    <>
      {theme && (
        <section className={styles.themePanel}>
          <span>{theme.eyebrow}</span>
          <h2>{theme.title}</h2>
          <div>
            <b>{theme.left}</b>
            <i />
            <b>{theme.right}</b>
          </div>
        </section>
      )}
      <section className={styles.summaryGrid}>
        <article>
          <span>DISTANCE SAVED</span>
          <strong>{remix.savedKm}</strong>
          <p>KM LESS</p>
        </article>
        <article>
          <span>TIME ADJUSTED</span>
          <del>{remix.beforeTime}</del>
          <strong>{remix.afterTime}</strong>
        </article>
      </section>
      <section className={styles.timeline}>
        <h2>BEFORE / AFTER</h2>
        <Timeline title="BEFORE" count={`${remix.beforeRows.length} SPOTS`} rows={remix.beforeRows} />
        <Timeline title="AFTER" count={`${remix.afterRows.length} SPOTS`} rows={remix.afterRows} dark />
      </section>
      <aside className={styles.summaryNote}>선택한 돌발상황에 맞춰 남은 일정의 순서와 시간을 다시 정리했어요.</aside>
    </>
  );
}

function Timeline({ title, count, rows, dark = false }) {
  return (
    <article className={`${styles.timelineCard} ${dark ? styles.timelineDark : ""}`}>
      <header><span>{title}</span><em>{count}</em></header>
      {rows.map(([time, place, tag]) => (
        <div key={`${title}-${time}-${place}`}>
          <span>{time}</span>
          <p>{place}</p>
          {tag && <b>{tag}</b>}
        </div>
      ))}
    </article>
  );
}

function ChangeDetails({ remix, closed = false }) {
  return (
    <section className={styles.details}>
      <h2>CHANGES DETAIL</h2>
      <article>
        <span>01 / PLACE</span>
        <em>{closed ? "REPLACED" : "OUTDOOR → INDOOR"}</em>
        <div><del>{remix.target?.place || "기존 장소"}</del><b>→</b><strong>{remix.replacement?.place || "대체 장소"}</strong></div>
      </article>
      <article>
        <span>02 / ROUTE</span>
        <em>SHORTER WALK</em>
        <div><del>{remix.routeBefore}</del><b>→</b><strong>{remix.routeAfter}</strong></div>
      </article>
      <article>
        <span>03 / TIME</span>
        <em>{closed ? "UNCHANGED" : "20 MIN EARLIER"}</em>
        <div><del>{remix.beforeTime}</del><b>→</b><strong>{closed ? remix.beforeTime : remix.afterTime}</strong></div>
      </article>
    </section>
  );
}

function EditView({ trip, remix, editUrl, onBack }) {
  const initialDayIndex = remix.dayIndex || 0;
  const days = trip.days || [];
  const [selectedDayIndex, setSelectedDayIndex] = useState(initialDayIndex);
  const dayIndex = days[selectedDayIndex] ? selectedDayIndex : 0;
  const activeDay = days[dayIndex] || days[0] || { items: [] };
  const heroImage = placeItems(trip).find((place) => place.image)?.image;
  const heroStyle = heroImage
    ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.55)), url(${resolveImageUrl(heroImage)})` }
    : undefined;

  useEffect(() => {
    setSelectedDayIndex(initialDayIndex);
  }, [initialDayIndex, trip?.id]);

  return (
    <section className={styles.edit}>
      <div className={styles.editHero} style={heroStyle}>
        <span>PERSONAL TRAVEL PLAN</span>
        <h1>{trip.city || "TRIP"}</h1>
        <p>{normalizeTitle(trip)}</p>
        <button type="button" onClick={onBack}>EDIT</button>
      </div>
      <nav className={styles.dayTabs}>
        {days.map((day, index) => (
          <button
            className={index === dayIndex ? styles.activeDay : ""}
            type="button"
            key={day.label || index}
            onClick={() => setSelectedDayIndex(index)}
          >
            {day.label || formatDayTitle(index)}
          </button>
        ))}
      </nav>
      <section className={styles.dayPlan}>
        <header><strong>{activeDay.label || formatDayTitle(dayIndex)}</strong><span>{activeDay.date || normalizeTitle(trip)}</span></header>
        {placesForDay(trip, dayIndex).map((place, index) => {
          const changedName = place.place === remix.target?.place ? remix.replacement?.place : place.place;
          return (
            <article key={`${place.place}-${index}`}>
              <label><input type="checkbox" /> <span>{changedName}</span></label>
              <em>{place.time || "--:--"} - {addMinutes(place.time, 40)}</em>
              <button type="button" onClick={() => window.location.assign(editUrl)}>×</button>
            </article>
          );
        })}
        <button className={styles.addSpot} type="button" onClick={() => window.location.assign(editUrl)}>+ 장소 추가</button>
      </section>
      <button className={styles.saveEdit} type="button" onClick={() => window.location.assign(editUrl)}>일정 수정</button>
    </section>
  );
}
