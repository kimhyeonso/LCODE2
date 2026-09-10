import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import { useAuth } from "../hooks/useAuth";
import { getPlan, getPlans } from "../services/firestoreService";
import { resolveImageUrl } from "../utils/imageUtils";
import styles from "./AIRemix.module.scss";
import { requestRemix } from "../services/remixService";

const reasons = [
  { id: "rain", no: "01", icon: "⠿", title: "RAIN", desc: "비가 와요" },
  { id: "delay", no: "02", icon: "◷", title: "DELAY", desc: "일정이 늦어졌어요" },
  { id: "traffic", no: "03", icon: "→", title: "TRAFFIC", desc: "교통이 지연됐어요" },
  { id: "closed", no: "04", icon: "×", title: "CLOSED", desc: "방문 장소가 문을 닫았어요" },
  { id: "tired", no: "05", icon: "−", title: "TIRED", desc: "조금 피곤해요" },
  { id: "cost", no: "06", icon: "↓", title: "CUT COSTS", desc: "경비 절감" },
  { id: "auto", no: "07", icon: "↻", title: "AUTO", desc: "알아서 최적화" },
];

const analyzeSteps = ["저장된 일정 확인", "대체 장소 후보 전달", "AI 변경안 요청", "변경안 검증 대기", "일정 재구성"];

const resultCopy = {
  rain: { title: "야외 일정을\n실내로 바꿔드렸어요.", desc: "현재 강수 상황을 고려해\n야외 일정을 가까운 실내 장소로 변경했어요.", type: "compare" },
  delay: { title: "오늘 일정이\n조금 더 가벼워졌어요.", desc: "늦어진 시간을 반영해 핵심 장소 위주로 다시 정리했어요.", type: "timeline" },
  traffic: { title: "막히는 길을 피해\n동선을 다시 잡았어요.", desc: "현재 이동 부담을 줄일 수 있도록 가까운 장소 순서로 재배치했어요.", type: "timeline" },
  closed: { title: "문이 닫힌 곳을\n대신할 장소를 찾았어요.", desc: "방문 예정 장소의 운영이 종료되었어요.\n가까운 대체 장소를 찾았어요.", type: "closed" },
  tired: { title: "무리한 일정을\n여유롭게 바꿨어요.", desc: "휴식 시간을 확보하고 무리한 이동을 줄이는 방향으로 다시 구성했어요.", type: "timeline" },
  cost: { title: "이동 비용을 줄여\n다시 짰어요.", desc: "도보 이동과 가까운 장소를 우선해 전체 경비 부담을 낮췄어요.", type: "timeline" },
  auto: { title: "여유로운 일정으로\n조정했어요.", desc: "방문 장소를 줄이고 휴식 시간을 확보했어요.", type: "timeline" },
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

const buildRemixedPlace = (original, replacement) => ({
  ...original,
  ...replacement,
  type: "place",
  time: original.time,
  place: replacement?.place || original.place,
  category: replacement?.category || original.category,
  recommendation: replacement?.recommendation || original.recommendation || "",
  image: replacement?.image || original.image || null,
});

const updateTransportMinutes = (item, minutes) => {
  if (item.type !== "transport") return item;
  return { ...item, transport: routeLabel(item.transport, minutes) };
};

function createRemixedPlan(trip, reason, remix) {
  const targetName = remix.target?.place;
  const replacement = remix.replacement;

  const days = (trip?.days || []).map((day, dayIndex) => {
    if (dayIndex !== remix.dayIndex) return day;

    let removedOne = false;
    const items = (day.items || [])
      .map((item) => {
        if (item.type === "place") {
          if (["rain", "closed"].includes(reason.id) && item.place === targetName) {
            return buildRemixedPlace(item, replacement);
          }
          if (reason.id === "delay") {
            return { ...item, time: addMinutes(item.time, -20) };
          }
        }

        if (["traffic", "cost"].includes(reason.id)) {
          return updateTransportMinutes(item, remix.routeAfterMinutes);
        }

        return item;
      })
      .filter((item) => {
        if (reason.id !== "tired" || removedOne || item.type !== "place") return true;
        if (item.category === "airport" || item.category === "hotel") return true;
        if (item.place !== targetName) return true;
        removedOne = true;
        return false;
      });

    return { ...day, items };
  });

  return {
    ...trip,
    title: trip?.title || normalizeTitle(trip),
    days,
    aiRemix: {
      status: "preview",
      reason: reason.id,
      reasonTitle: reason.title,
      targetPlace: targetName || "",
      replacementPlace: replacement?.place || "",
      dayIndex: remix.dayIndex,
      createdAt: new Date().toISOString(),
    },
  };
}

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

  const remix = {
    dayIndex,
    target,
    replacement,
    routeAfterMinutes,
    beforeRows,
    afterRows: ["rain", "closed"].includes(reason.id) ? replacedRows : adjustedRows,
    savedKm: reason.id === "cost" ? "3.4" : ((routeBeforeMinutes - routeAfterMinutes) * 0.18).toFixed(1),
    routeBefore: routeLabel(targetRoute, routeBeforeMinutes),
    routeAfter: routeLabel(targetRoute, routeAfterMinutes),
    beforeTime: beforeRows.at(-1)?.[0] || "21:10",
    afterTime: addMinutes(beforeRows.at(-1)?.[0], reason.id === "delay" ? -30 : -20),
  };

  if (reason.id === "auto") {
    const removedIndices = new Set(beforePlaces.flatMap((place, index) =>
      index > 0 && index < beforePlaces.length - 1 && place.category === "attraction" ? [index] : [],
    ).slice(0, 2));
    const hotel = placeItems(trip).find((place) => place.category === "hotel"
      && !beforePlaces.some((current) => current.place === place.place));
    let inserted = false;
    let currentPlaceIndex = -1;
    let skipTransport = false;
    const addedPlace = removedIndices.size ? {
      ...(hotel || {}), type: "place", place: hotel?.place || "휴식 시간",
      category: hotel ? "hotel" : "rest",
      time: beforePlaces[[...removedIndices][0]].time || "",
    } : null;
    const items = (trip.days?.[dayIndex]?.items || []).flatMap((item) => {
      if (item.type !== "place") {
        if (skipTransport && item.type === "transport") { skipTransport = false; return []; }
        return [item];
      }
      currentPlaceIndex += 1;
      skipTransport = removedIndices.has(currentPlaceIndex);
      if (!skipTransport) return [item];
      if (!inserted) { inserted = true; return [addedPlace]; }
      return [];
    });
    const afterPlaces = items.filter((item) => item.type === "place");
    const plan = createRemixedPlan(trip, reason, remix);
    plan.days = plan.days.map((day, index) => index === dayIndex ? { ...day, items } : day);
    return { ...remix, plan,
      beforeRows: beforePlaces.map((place, index) => [place.time || "--:--", place.place, removedIndices.has(index) ? "REMOVED" : ""]),
      afterRows: afterPlaces.map((place) => [place.time || "--:--", place.place, place === addedPlace ? "ADDED" : "SAME"]),
      beforeTime: beforePlaces.at(-1)?.time || "--:--",
      afterTime: afterPlaces.at(-1)?.time || "--:--",
      savedKm: "—",
    };
  }

  if (reason.id === "delay") {
    const nextDay = trip.days?.[dayIndex + 1];
    const movedIndex = nextDay && beforePlaces.length > 1
      ? beforePlaces.findIndex((place) => place.category === "attraction") : -1;
    const moved = beforePlaces[movedIndex];
    const nextDayLabel = formatDayTitle(dayIndex + 1);
    let placeIndex = -1;
    let skipTransport = false;
    const adjustedItems = (trip.days?.[dayIndex]?.items || []).flatMap((item) => {
      if (item.type !== "place") {
        if (skipTransport && item.type === "transport") { skipTransport = false; return []; }
        return [item];
      }
      skipTransport = false;
      placeIndex += 1;
      if (placeIndex === movedIndex) { skipTransport = true; return []; }
      return [{ ...item, time: placeIndex === 0 ? item.time : addMinutes(item.time, -20) }];
    });
    const afterPlaces = adjustedItems.filter((item) => item.type === "place");
    const plan = createRemixedPlan(trip, reason, remix);
    plan.days = plan.days.map((day, index) => {
      if (index === dayIndex) return { ...day, items: adjustedItems };
      if (moved && index === dayIndex + 1) {
        const { transport: _transport, ...movedPlace } = moved;
        return { ...day, items: [...day.items, { ...movedPlace, time: "", type: "place" }] };
      }
      return day;
    });
    return { ...remix, plan,
      beforeRows: beforePlaces.map((place, index) => [place.time || "--:--", place.place, index === movedIndex ? `MOVED → ${nextDayLabel}` : ""]),
      afterRows: afterPlaces.map((place) => [place.time || "--:--", place.place, place.time === beforePlaces.find((original) => original.place === place.place)?.time ? "SAME" : "↑ EARLIER"]),
      beforeTime: beforePlaces.at(-1)?.time || "--:--",
      afterTime: afterPlaces.at(-1)?.time || "--:--",
      delayNote: moved ? `${moved.place}은 ${nextDayLabel}로 이동했어요. 방문 시간은 일정 편집에서 설정해 주세요.` : "첫 방문 시간을 유지하고 이후 일정을 앞당겼어요.",
    };
  }

  return { ...remix, plan: createRemixedPlan(trip, reason, remix) };
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
  const [remixError, setRemixError] = useState("");
  const failureHeading = useRef(null);
  const [aiResult, setAiResult] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const requestLock = useRef(false);
  const requestGeneration = useRef(0);
  const progressValue = useRef(0);
  useEffect(() => () => { requestGeneration.current += 1; }, []);

  useEffect(() => {
    if (stage !== "analyzing") return undefined;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startedAt = performance.now();
    const startValue = progressValue.current;
    let frame;
    let resultTimer;
    const animate = (now) => {
      const elapsed = now - startedAt;
      const completion = Math.min(elapsed / 650, 1);
      // Waiting progress is an estimate; only a verified response can reach 100%.
      const next = aiResult
        ? reducedMotion ? 100 : startValue + (100 - startValue) * (1 - Math.pow(1 - completion, 3))
        : reducedMotion ? 20 : 92 - (92 - startValue) * Math.exp(-elapsed / 9000);
      progressValue.current = next;
      setProgress(next);
      if (aiResult && (reducedMotion || completion === 1)) {
        resultTimer = window.setTimeout(() => setStage("result"), reducedMotion ? 0 : 200);
      } else if (!reducedMotion) {
        frame = window.requestAnimationFrame(animate);
      }
    };
    frame = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(resultTimer);
    };
  }, [stage, aiResult]);

  const requestedPlanId = params.get("planId") || params.get("plan") || params.get("saved") || "";
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
      } catch {
        if (active) setPlanError("저장 일정을 불러오지 못했습니다.");
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
  const remix = useMemo(() => aiResult ? { ...aiResult, plan: { ...selectedTrip, days: aiResult.days,
    aiRemix: { status: "preview", reason: reason.id, sourceRevision: aiResult.revision } } }
    : createRemix(selectedTrip, reason), [aiResult, reason, selectedTrip]);
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
    if (stage !== "complete") return undefined;

    const timer = window.setTimeout(() => navigate(editUrl, {
      replace: true,
      state: { remixDraft: JSON.parse(JSON.stringify(remix.plan)), remixPlanId: planId || null, remixOriginalDays: aiResult?.originalDays },
    }), 3000);
    return () => window.clearTimeout(timer);
  }, [stage, navigate, editUrl, remix.plan, planId, aiResult]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (stage === "error") failureHeading.current?.focus();
  }, [stage]);

  const selectReason = async (item) => {
    if (requestLock.current) return;
    if (!planId || !sourcePlan) { setPlanError("먼저 일정을 저장한 뒤 AI 리믹스를 이용해 주세요."); return; }
    requestLock.current = true;
    const generation = ++requestGeneration.current;
    setPlanError("");
    setRemixError("");
    setAiResult(null);
    setReason(item);
    progressValue.current = 0;
    setProgress(0);
    setStage("analyzing");
    try {
      const response = await requestRemix({ planId, reason: item.id, dayIndex: selectedDay });
      if (generation !== requestGeneration.current) return;
      setAiResult(response);
    } catch (error) {
      if (generation !== requestGeneration.current) return;
      const messages = {
        "functions/not-found": "일정 또는 리믹스 서비스를 찾지 못했어요. 일정이 저장되어 있는지 확인해 주세요.",
        "functions/unauthenticated": "다시 로그인한 뒤 이용해 주세요.",
        "functions/permission-denied": "이 일정을 변경할 권한이 없어요. 로그인 계정을 확인해 주세요.",
        "functions/unavailable": "AI 서버에 연결하지 못했어요. 인터넷 연결을 확인하고 잠시 후 다시 시도해 주세요.",
        "functions/deadline-exceeded": "응답 시간이 길어져 요청을 마쳤어요. 잠시 후 다시 시도해 주세요.",
        "functions/resource-exhausted": "현재 요청이 몰리고 있어요. 잠시 후 다시 시도해 주세요.",
        "functions/failed-precondition": "현재 리믹스를 진행할 수 없어요. 잠시 후에도 계속되면 서비스 관리자에게 문의해 주세요.",
        "functions/invalid-argument": "일정 정보를 확인하지 못했어요. 일정 수정 화면에서 저장한 뒤 다시 시도해 주세요.",
        "functions/aborted": "다른 요청이 처리 중이거나 일정이 변경되었어요. 잠시 후 다시 시도해 주세요.",
      };
      setRemixError(messages[error.code] || "변경안을 만드는 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.");
      setStage("error");
    } finally {
      if (generation === requestGeneration.current) requestLock.current = false;
    }
  };

  const reset = () => {
    requestGeneration.current += 1;
    requestLock.current = false;
    setAiResult(null);
    setStage("select");
    setProgress(0);
  };

  const backButton = (
    <button
      type="button"
      className={styles.backButton}
      onClick={() => !loadDone || stage === "select" ? navigate(-1) : reset()}
      aria-label={!loadDone || stage === "select" ? "이전 페이지로 돌아가기" : "상황 선택으로 돌아가기"}
    >
      <span aria-hidden="true">←</span> BACK
    </button>
  );

  if (!loadDone) {
    return (
      <main className={`${styles.page} ${styles.progressPage} aiRemixPageRoot`}>
        {backButton}
        <section className={styles.analyzing}>
          <p className={styles.meta}>L:CODE AI REMIX</p>
          <h1>일정을 불러오고 있어요.</h1>
        </section>
      </main>
    );
  }

  return (
    <main className={`${styles.page} ${stage === "select" ? styles.selectionPage : ""} ${stage === "analyzing" ? styles.progressPage : ""} ${stage === "result" && reason.id === "rain" ? styles.rainPage : ""} ${stage === "result" && ["delay", "auto"].includes(reason.id) ? styles.delayPage : ""} ${stage === "result" && reason.id === "closed" ? styles.closedPage : ""} ${stage === "complete" ? styles.completionPage : ""} aiRemixPageRoot`}>
      {backButton}
      {stage === "select" && (
        <section className={styles.selectPanel} aria-label={`${sourcePlan?.title || selectedTrip.title || selectedTrip.city} 일정 변경`}>
          <header className={styles.selectHeader}>
            <span>L:CODE AI REMIX</span>
            <button type="button" aria-label="AI 리믹스 닫기" onClick={() => navigate(planId ? `/plan?saved=${encodeURIComponent(planId)}` : "/plan")}>CLOSE ×</button>
          </header>
          <div className={styles.intro}>
            <h1>오늘 일정,<br />다시 맞춰볼까요?</h1>
            <p>현재 상황을 선택하면<br />남은 일정을 다시 구성해드려요.</p>
            {planError && <p role="alert">{planError}</p>}
            {sourcePlan && <label className={styles.remixDay}>변경할 날짜
              <select value={selectedDay} onChange={(event) => setSelectedDay(Number(event.target.value))}>
                {(sourcePlan.days || []).map((day, index) => <option key={index} value={index}>{day.label || formatDayTitle(index)}{day.date ? ` · ${day.date}` : ""}</option>)}
              </select>
            </label>}
          </div>
          <ul className={styles.reasonList}>
            {reasons.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => selectReason(item)}>
                  <span>{item.no}</span>
                  <i aria-hidden="true" className={item.id === "rain" ? styles.rainMark : ""}>{item.id === "rain" ? "" : item.icon}</i>
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
          <p className={styles.meta}>L:CODE AI REMIX <span aria-hidden="true">—</span> {reason.title}</p>
          <h1>남은 일정을<br />다시 계산하고 있어요.</h1>
          <div className={styles.analysisRule} aria-hidden="true"><i style={{ transform: `scaleX(${progress / 100})` }} /></div>
          <ol>
            {analyzeSteps.map((step, index) => {
              const done = Boolean(aiResult) || index === 0;
              return (
                <li className={done ? styles.done : ""} key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                  <b>{done ? "✓" : "•"}</b>
                </li>
              );
            })}
          </ol>
          <div className={styles.progress} role="progressbar" aria-label="일정 재구성 예상 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-valuetext={aiResult ? "변경안 준비 완료" : "AI 응답을 기다리고 있습니다. 진행률은 예상치입니다."}>
            <span>ANALYZING</span>
            <strong>{Math.round(progress)}%</strong>
            <i style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
          <footer className={styles.analysisFooter}>PERSONAL TRAVEL CURATION — L:CODE</footer>
        </section>
      )}

      {stage === "error" && (
        <section className={styles.failurePanel} aria-labelledby="remix-failure-title">
          <p className={styles.failureMeta}>REMIX FAILED <span>{reason.title}</span></p>
          <div className={styles.failureIcon} aria-hidden="true">!</div>
          <h1 id="remix-failure-title" ref={failureHeading} tabIndex={-1}>일정을 다시 구성하지<br />못했어요.</h1>
          <p className={styles.failureMessage}>{remixError}</p>
          <p className={styles.failureNotice}>기존 일정은 변경되지 않았어요.</p>
          <div className={styles.failureActions}>
            <button type="button" onClick={() => selectReason(reason)}>다시 시도</button>
            <button type="button" onClick={() => navigate(editUrl)}>일정 수정으로 돌아가기</button>
            <button type="button" onClick={reset}>다른 상황 선택하기</button>
          </div>
        </section>
      )}

      {stage === "result" && (
        <ResultView result={result} remix={remix} onBack={reset} onApply={() => setStage("complete")} aiResult={aiResult} />
      )}

      {stage === "complete" && (
        <section className={`${styles.complete} ${styles.completionScreen}`} role="status" aria-live="polite">
          <span>REMIX COMPLETE</span>
          <h1>새 일정이<br />적용되었습니다.</h1>
          <i />
        </section>
      )}

      {stage === "edit" && <EditView trip={selectedTrip} remix={remix} editUrl={editUrl} onBack={reset} />}
    </main>
  );
}

function ResultView({ result, remix, onBack, onApply, aiResult }) {
  const resultClass = `${styles.result} ${styles[`${result.reasonId}Result`] || ""}`;

  return (
    <section className={resultClass}>
      <header className={styles.resultHeader}>
        <span>REMIX RESULT</span>
        <em>{result.tag}</em>
      </header>
      <h1>{aiResult ? (aiResult.changes.length ? "일정 변경안을\n준비했어요." : "현재 일정을\n유지하는 것이 좋아요.") : result.title}</h1>
      {aiResult ? <section className={styles.aiChanges}>
        <p>{aiResult.summary}</p>
        <div className={styles.delayContent}>
          <h2>BEFORE / AFTER</h2>
          {[{ title: "BEFORE", rows: aiResult.beforeRows }, { title: "AFTER", rows: aiResult.afterRows }].map(({ title, rows }) => (
            <section key={title} className={`${styles.aiTimeline} ${title === "AFTER" ? styles.aiAfter : ""}`}>
              <header>{title}<span>{rows.length} SPOTS</span></header>
              {rows.map(([time, place, tag], index) => <div key={index}><time>{time}</time><p>{place}</p>{tag && <small>{tag}</small>}</div>)}
            </section>
          ))}
        </div>
        <p className={styles.aiNotice}>{aiResult.notice}</p>
      </section> : <>
      {!["delay", "auto"].includes(result.reasonId) && <p>{result.desc}</p>}
      {result.type === "compare" && <RainCompare remix={remix} />}
      {result.type === "closed" && <ClosedChange remix={remix} />}
      {["delay", "auto"].includes(result.reasonId) ? <DelayResult remix={remix} automatic={result.reasonId === "auto"} /> : result.type === "timeline" && <TimelineChange remix={remix} variant={result.reasonId} />}
      </>}
      <div className={styles.actions}>
        <button type="button" onClick={onBack}>기존 일정 유지</button>
        <button type="button" onClick={onApply} disabled={aiResult && !aiResult.changes.length}>변경 일정 적용</button>
      </div>
    </section>
  );
}

function DelayResult({ remix, automatic = false }) {
  return (
    <div className={styles.delayContent}>
      <h2>SUMMARY</h2>
      <div className={styles.delaySummary}>
        <article><span>DISTANCE SAVED</span><strong>{remix.savedKm}</strong><small>{remix.savedKm === "—" ? "거리 계산 전" : "KM LESS"}</small></article>
        <article><span>TIME ADJUSTED</span><del>{remix.beforeTime}</del><strong>{remix.afterTime}</strong></article>
      </div>
      <h2 className={styles.delayTimelineTitle}>BEFORE / AFTER</h2>
      {[{ title: "BEFORE", rows: remix.beforeRows }, { title: "AFTER", rows: remix.afterRows }].map(({ title, rows }) => (
        <section key={title} className={`${styles.delayTimeline} ${title === "AFTER" ? styles.delayAfter : ""}`} aria-label={`${title} 일정`}>
          <header><span>{title}</span><span>{rows.length} SPOTS</span></header>
          {rows.map(([time, place, tag], index) => (
            <div key={`${place}-${index}`} className={tag === "REMOVED" ? styles.removedRow : tag.startsWith("MOVED") ? styles.delayMoved : ""}>
              <time>{time}</time><i aria-hidden="true">•</i><p>{place}</p>{tag && <em>{tag}</em>}
            </div>
          ))}
        </section>
      ))}
      {!automatic && <aside className={styles.delayNote}>{remix.delayNote || "늦어진 시간을 반영해 오늘 일정을 다시 정리했어요."}</aside>}
    </div>
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
      <div className={styles.rainCards}>
        <article>
          <div className={styles.rainPhoto} style={beforeStyle}>
            <span>BEFORE</span>
            <p>OUTDOOR</p>
          </div>
          <h2>{remix.target?.place || "기존 장소"}</h2>
        </article>
        <article>
          <div className={styles.rainPhoto} style={afterStyle}>
            <span>AFTER</span>
            <p>INDOOR</p>
          </div>
          <h2>{remix.replacement?.place || "대체 장소"}</h2>
          <small>{remix.routeAfterMinutes} MIN AWAY</small>
        </article>
      </div>
      <aside className={styles.summaryNote}>현재 강수 상황을 고려해 야외 일정을<br />가까운 실내 장소로 변경했어요.</aside>
      <ChangeDetails remix={remix} rain />
    </>
  );
}

function ClosedChange({ remix }) {
  const visitTime = remix.target?.time || "--:--";
  return (
    <div className={styles.closedContent}>
      <h2 className={styles.closedLabel}>PLACE CHANGE</h2>
      <section className={styles.closedCards} aria-label="장소 변경">
        <article>
          <span>ORIGINAL</span>
          <h2><del>{remix.target?.place || "기존 장소"}</del></h2>
          <em>CLOSED</em>
        </article>
        <div className={styles.closedArrow} aria-hidden="true">↓</div>
        <article className={styles.closedReplacement}>
          <span>REPLACEMENT</span>
          <h2>{remix.replacement?.place || "대체 장소"}</h2>
          <p>{remix.routeAfterMinutes} MIN AWAY</p>
        </article>
      </section>
      <p className={styles.closedNote}>방문 예정 장소의 운영이 종료되었어요.<br />{remix.routeAfterMinutes}분 거리의 {remix.replacement?.place || "대체 장소"}를 추천해드려요.</p>
      <section className={styles.closedDetails} aria-label="상세 변경 사항">
        <h2 className={styles.closedLabel}>CHANGES DETAIL</h2>
        {[
          { label: "01 / PLACE", tag: `${remix.routeAfterMinutes} MIN AWAY`, caption: "장소 교체", before: remix.target?.place || "기존 장소", after: remix.replacement?.place || "대체 장소" },
          { label: "02 / TIME", tag: "UNCHANGED", caption: "방문 시간", before: visitTime, after: visitTime },
          { label: "03 / TRANSPORT", tag: "CLOSER", caption: "이동 수단", before: remix.routeBefore, after: remix.routeAfter },
        ].map((item) => (
          <article key={item.label}>
            <header><span>{item.label}</span><em>{item.tag}</em></header>
            <p>{item.caption}</p>
            <div><del>{item.before}</del><b aria-hidden="true">→</b><strong>{item.after}</strong></div>
          </article>
        ))}
      </section>
    </div>
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

function ChangeDetails({ remix, closed = false, rain = false }) {
  return (
    <section className={styles.details}>
      <h2>CHANGES DETAIL</h2>
      <article>
        <span>01 / PLACE</span>
        <em>{closed ? "REPLACED" : "OUTDOOR → INDOOR"}</em>
        {rain && <p>장소 변경</p>}
        <div><del>{remix.target?.place || "기존 장소"}</del><b>→</b><strong>{remix.replacement?.place || "대체 장소"}</strong></div>
      </article>
      <article>
        <span>02 / ROUTE</span>
        <em>SHORTER WALK</em>
        {rain && <p>이동 경로</p>}
        <div><del>{remix.routeBefore}</del><b>→</b><strong>{remix.routeAfter}</strong></div>
      </article>
      <article>
        <span>03 / TIME</span>
        <em>{closed ? "UNCHANGED" : "20 MIN EARLIER"}</em>
        {rain && <p>예상 종료</p>}
        <div><del>{remix.beforeTime}</del><b>→</b><strong>{closed ? remix.beforeTime : remix.afterTime}</strong></div>
      </article>
    </section>
  );
}

function EditView({ trip, remix, editUrl, onBack }) {
  const initialDayIndex = remix.dayIndex || 0;
  const previewPlan = remix.plan || trip;
  const days = previewPlan.days || [];
  const [selectedDayIndex, setSelectedDayIndex] = useState(initialDayIndex);
  const dayIndex = days[selectedDayIndex] ? selectedDayIndex : 0;
  const activeDay = days[dayIndex] || days[0] || { items: [] };
  const heroImage = placeItems(previewPlan).find((place) => place.image)?.image;
  const heroStyle = heroImage
    ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.55)), url(${resolveImageUrl(heroImage)})` }
    : undefined;

  useEffect(() => {
    setSelectedDayIndex(initialDayIndex);
  }, [initialDayIndex, previewPlan?.id]);

  return (
    <section className={styles.edit}>
      <div className={styles.editHero} style={heroStyle}>
        <span>PERSONAL TRAVEL PLAN</span>
        <h1>{previewPlan.city || "TRIP"}</h1>
        <p>{normalizeTitle(previewPlan)}</p>
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
        <header><strong>{activeDay.label || formatDayTitle(dayIndex)}</strong><span>{activeDay.date || normalizeTitle(previewPlan)}</span></header>
        {placesForDay(previewPlan, dayIndex).map((place, index) => {
          const changedName = place.place;
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
