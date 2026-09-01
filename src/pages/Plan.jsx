import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import { useCurrentWeather } from "../hooks/useCurrentWeather";
import { useAuth } from "../hooks/useAuth";
import { deletePlan, getPlan, getPlanDateConflict, getPlans, savePlan } from "../services/firestoreService";
import travelIcon from "../assets/icons/transportation/travel.svg";
import diningIcon from "../assets/icons/dining.svg";
import carIcon from "../assets/icons/transportation/directions_car.svg";
import styles from "./Plan.module.scss";
import { resolveImageUrl as getImageUrl } from "../utils/imageUtils";

const categoryNames = { airport: "AIRPORT", station: "STATION", hotel: "HOTEL", attraction: "SIGHTSEEING", restaurant: "RESTAURANT" };

const cityAliases = {
  SEOUL: "서울",
  SHANGHAI: "상하이",
  TOKYO: "도쿄",
};

const formatDate = (date, fallback) => {
  if (!date) return fallback;
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return fallback;
  const month = value.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const weekday = value.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  return `${month} ${String(value.getDate()).padStart(2, "0")} / ${weekday}`;
};

const getDayPlaces = (day) => day.items.reduce((result, item, index, items) => {
  if (item.type !== "place") return result;
  const transport = items[index + 1]?.type === "transport" ? items[index + 1].transport : "";
  result.push({ ...item, transport, imageUrl: getImageUrl(item.image) });
  return result;
}, []);

const toDateInputValue = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date || "") ? date : "";

const addDays = (date, amount) => {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + amount);
  return value.toLocaleDateString("sv-SE");
};

export default function Plan() {
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const savedPlanId = params.get("saved");
  const viewingSavedPlan = Boolean(savedPlanId);
  const [savedState, setSavedState] = useState({ userId: null, plans: [] });
  const [savedDetailState, setSavedDetailState] = useState({ loading: viewingSavedPlan, plan: null, error: "" });
  const hasRequestedTrip = Boolean(params.get("trip") || params.get("city") || params.get("country") || savedPlanId);

  useEffect(() => {
    if (!savedPlanId || authLoading) return undefined;
    if (!user) {
      setSavedDetailState({ loading: false, plan: null, error: "저장한 일정을 확인하려면 로그인해 주세요." });
      return undefined;
    }
    let active = true;
    setSavedDetailState({ loading: true, plan: null, error: "" });
    getPlan(savedPlanId)
      .then((plan) => {
        if (!active) return;
        if (!plan || plan.userId !== user.uid) {
          setSavedDetailState({ loading: false, plan: null, error: "저장된 일정을 찾을 수 없습니다." });
          return;
        }
        setSavedDetailState({ loading: false, plan, error: "" });
      })
      .catch(() => active && setSavedDetailState({ loading: false, plan: null, error: "저장한 일정을 불러오지 못했습니다." }));
    return () => { active = false; };
  }, [authLoading, savedPlanId, user]);

  useEffect(() => {
    if (hasRequestedTrip || authLoading || !user) return undefined;
    let active = true;
    getPlans(user.uid)
      .then((plans) => active && setSavedState({ userId: user.uid, plans }))
      .catch(() => active && setSavedState({ userId: user.uid, plans: [] }));
    return () => {
      active = false;
    };
  }, [authLoading, hasRequestedTrip, user]);

  const savedPlan = user && savedState.userId === user.uid ? savedState.plans[0] : null;
  const savedPlanLoading = !hasRequestedTrip && (authLoading || Boolean(user && savedState.userId !== user.uid));
  const selectedTrip = useMemo(() => {
    const tripId = params.get("trip");
    const cityParam = params.get("city")?.toUpperCase();
    const countryParam = params.get("country")?.toLowerCase();
    const city = cityAliases[cityParam] || params.get("city");

    return savedDetailState.plan
      || (!hasRequestedTrip ? savedPlan : null)
      || tripRoad.trips.find((trip) => trip.id === tripId)
      || tripRoad.trips.find((trip) => trip.city === city)
      || tripRoad.trips.find((trip) => trip.country.toLowerCase() === countryParam)
      || tripRoad.trips.find((trip) => trip.city === "후쿠오카")
      || tripRoad.trips[0];
  }, [hasRequestedTrip, params, savedDetailState.plan, savedPlan]);
  const [activeDay, setActiveDay] = useState(0);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [savedDocumentId, setSavedDocumentId] = useState("");
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [saveState, setSaveState] = useState({ saving: false, error: "" });
  const [conflictingPlan, setConflictingPlan] = useState(null);
  const saveLockRef = useRef(false);
  const [deleteState, setDeleteState] = useState({ deleting: false, error: "" });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [dateDraft, setDateDraft] = useState(() => ({
    start: toDateInputValue(selectedTrip.dateRange?.start),
    end: toDateInputValue(selectedTrip.dateRange?.end),
  }));
  useEffect(() => {
    if (!savedDetailState.plan) return;
    setActiveDay(0);
    setDateDraft({
      start: toDateInputValue(savedDetailState.plan.dateRange?.start),
      end: toDateInputValue(savedDetailState.plan.dateRange?.end),
    });
  }, [savedDetailState.plan]);
  const visibleDay = Math.min(activeDay, selectedTrip.days.length - 1);
  const weather = useCurrentWeather(selectedTrip.city, selectedTrip.country);
  const allPlaces = selectedTrip.days.flatMap(getDayPlaces);
  const activePlaces = getDayPlaces(selectedTrip.days[visibleDay]);
  const heroImage = allPlaces.find((place) => place.imageUrl)?.imageUrl;
  const nights = Math.max(selectedTrip.days.length - 1, 1);
  const startDate = selectedTrip.dateRange?.start;
  const endDate = selectedTrip.dateRange?.end;
  const budgetRows = [
    ["교통", 40000 + selectedTrip.days.length * 5000],
    ["식비", selectedTrip.days.length * 30000],
    ["카페", selectedTrip.days.length * 10000],
    ["관광 / 입장료", selectedTrip.days.length * 15000],
    ["쇼핑", 50000],
    ["기타", 15000],
  ];
  const estimatedExpense = budgetRows.reduce((total, [, amount]) => total + amount, 0);
  const representativeImage = selectedTrip.days
    .flatMap((day) => day.items)
    .find((item) => item.type === "place" && item.image)
    ?.image;
  const todayValue = new Date().toLocaleDateString("sv-SE");
  const tripLength = Math.max(1, selectedTrip.days.length);

  const openDateStep = () => {
    if (!user) {
      navigate("/login", {
        state: { from: `/plan?trip=${encodeURIComponent(selectedTrip.id)}` },
      });
      return;
    }
    const savedStart = toDateInputValue(selectedTrip.dateRange?.start);
    const start = savedStart >= todayValue ? savedStart : todayValue;
    setDateDraft({ start, end: addDays(start, tripLength - 1) });
    setSaveState({ saving: false, error: "" });
    setConflictingPlan(null);
    setIsDateOpen(true);
  };

  const handleSavePlan = async (event) => {
    event.preventDefault();
    if (saveState.saving || saveLockRef.current) return;

    if (!dateDraft.start || !dateDraft.end) {
      setSaveState({ saving: false, error: "여행 시작일과 종료일을 모두 선택해 주세요." });
      return;
    }
    if (dateDraft.start < todayValue) {
      setSaveState({ saving: false, error: "오늘 이후의 여행 시작일을 선택해 주세요." });
      return;
    }
    if (dateDraft.end !== addDays(dateDraft.start, tripLength - 1)) {
      setSaveState({ saving: false, error: `이 일정은 ${tripLength}일 일정입니다. 종료일을 다시 확인해 주세요.` });
      return;
    }
    if (dateDraft.end < dateDraft.start) {
      setSaveState({ saving: false, error: "종료일은 시작일보다 빠를 수 없어요." });
      return;
    }

    saveLockRef.current = true;
    setSaveState({ saving: true, error: "" });

    try {
      const conflict = await getPlanDateConflict(user.uid, {
        start: dateDraft.start,
        end: dateDraft.end,
        tripId: selectedTrip.id,
      });
      if (conflict) {
        setConflictingPlan(conflict);
        setSaveState({
          saving: false,
          error: `${conflict.title || conflict.city || "저장된 일정"} (${conflict.dateRange.start} ~ ${conflict.dateRange.end})과 날짜가 겹칩니다.`,
        });
        saveLockRef.current = false;
        return;
      }
      const datedDays = selectedTrip.days.map((day, index) => ({
        ...day,
        date: addDays(dateDraft.start, index),
      }));
      const savedDocument = await savePlan(user.uid, {
        tripId: selectedTrip.id,
        title: selectedTrip.title,
        city: selectedTrip.city,
        country: selectedTrip.country,
        duration: selectedTrip.duration,
        status: "confirmed",
        dateRange: { start: dateDraft.start, end: dateDraft.end },
        days: datedDays,
        image: representativeImage || null,
      });

      if (!savedDocument?.id) {
        throw new Error("저장된 일정의 문서 ID를 확인할 수 없습니다.");
      }

      setSaveState({ saving: false, error: "" });
      saveLockRef.current = false;
      setIsDateOpen(false);
      setSavedDocumentId(savedDocument.id);
      window.dispatchEvent(new Event("plans-changed"));
      setIsSavedOpen(true);
    } catch (error) {
      console.error("일정 저장 실패:", error);
      const message = error?.code === "permission-denied"
        ? "일정을 저장할 권한이 없습니다. 다시 로그인한 후 시도해 주세요."
        : error?.code === "unavailable"
          ? "네트워크 연결을 확인한 후 다시 시도해 주세요."
          : "일정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
      setSaveState({ saving: false, error: message });
      saveLockRef.current = false;
    }
  };

  const handleDeletePlan = async () => {
    if (!user || !savedPlanId || deleteState.deleting) return;
    setDeleteState({ deleting: true, error: "" });
    try {
      await deletePlan(user.uid, savedPlanId);
      window.dispatchEvent(new Event("plans-changed"));
      const remainingPlans = (await getPlans(user.uid)).filter((plan) => plan.id !== savedPlanId);
      setIsDeleteOpen(false);
      navigate(remainingPlans.length ? `/plan/saved?id=${encodeURIComponent(remainingPlans[0].id)}` : "/search", { replace: true });
    } catch {
      setDeleteState({ deleting: false, error: "일정을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요." });
    }
  };

  if (viewingSavedPlan && (authLoading || savedDetailState.loading)) {
    return <main className={`${styles.plan} ${styles.planStatus}`}>저장된 일정을 불러오고 있어요.</main>;
  }

  if (viewingSavedPlan && savedDetailState.error) {
    return <main className={`${styles.plan} ${styles.planEmpty}`}><span>PLAN ERROR</span><h1>일정을 확인할 수 없어요.</h1><p>{savedDetailState.error}</p><Link to="/plan/saved">저장 일정으로 돌아가기 <b>→</b></Link></main>;
  }

  if (savedPlanLoading) {
    return <main className={`${styles.plan} ${styles.planStatus}`}>저장된 일정을 불러오고 있어요.</main>;
  }

  if (!hasRequestedTrip && !savedPlan) {
    return (
      <main className={`${styles.plan} ${styles.planEmpty}`}>
        <span>NO SAVED PLAN</span>
        <h1>저장된 일정이 없어요.</h1>
        <p>{user ? "가고 싶은 도시를 찾아 첫 일정을 담아보세요." : "로그인하면 저장한 일정을 여기서 확인할 수 있어요."}</p>
        <Link to={user ? "/search" : "/login"}>{user ? "여행지 둘러보기" : "로그인하기"} <b>→</b></Link>
      </main>
    );
  }

  return (
    <main className={styles.plan}>
      <section className={styles.hero} style={heroImage ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.7)), url(${heroImage})` } : undefined}>
        <div className={styles.heroTop}><span>TRAVEL PLAN</span><span>{selectedTrip.country.toUpperCase()} / ISSUE 01</span></div>
        <p className={styles.heroTags}>{selectedTrip.duration} · 맛집 · 카페</p>
        <p className={styles.heroWeather}>
          <b>{weather.loading ? "--" : weather.temperature ?? "--"}°C</b><span>·</span>
          <span>{weather.error ? "WEATHER" : weather.label}</span><span>·</span>
          <span>{startDate && endDate ? `${startDate.slice(5).replace("-", "/")}–${endDate.slice(5).replace("-", "/")}` : selectedTrip.duration}</span>
        </p>
      </section>

      <section className={styles.intro}>
        <h1>{selectedTrip.title.replace(" 일정", "").replace(", ", ",\n")}</h1>
        <p>맛집과 카페를 중심으로<br />천천히 걷는 여행</p>
        <dl className={styles.stats}>
          <div><dt>{String(nights).padStart(2, "0")}</dt><dd>NIGHTS</dd></div>
          <div><dt>{String(selectedTrip.days.length).padStart(2, "0")}</dt><dd>DAYS</dd></div>
          <div><dt>{String(allPlaces.length).padStart(2, "0")}</dt><dd>SPOTS</dd></div>
        </dl>
      </section>

      <section className={styles.points}>
        <h2>이 일정의 포인트</h2>
        <div>
          <p><img src={travelIcon} alt="" /><strong>공항 접근성</strong></p>
          <p><img src={diningIcon} alt="" /><strong>맛집 중심</strong></p>
          <p><img src={carIcon} alt="" /><strong>도심 이동 거리</strong></p>
        </div>
      </section>

      <div className={styles.visualBreak} aria-hidden="true" />

      <section className={styles.expense} aria-labelledby="estimated-expense-title">
        <p>ESTIMATED EXPENSE</p>
        <div className={styles.expenseSummary}>
          <span>예상 여행 경비</span>
          <h2 id="estimated-expense-title">약 ₩{estimatedExpense.toLocaleString("ko-KR")}</h2>
          <small>항공권 · 숙박비 제외</small>
        </div>
        <dl className={styles.expenseList}>
          {budgetRows.map(([label, amount]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>₩{amount.toLocaleString("ko-KR")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.itinerary}>
        <header className={styles.dayHeader}>
          <h2>DAY {String(visibleDay + 1).padStart(2, "0")}</h2>
          <span>{formatDate(selectedTrip.days[visibleDay]?.date, `DAY ${visibleDay + 1}`)}</span>
          <b>{activePlaces.length}곳</b>
        </header>
        <ol className={styles.timeline}>
          {activePlaces.map((place, index) => (
            <li key={`${place.place}-${index}`}>
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <time>{place.time || "시간 미정"}</time>
              <span className={styles.placeImage}>{place.imageUrl && <img src={place.imageUrl} alt="" />}</span>
              <div className={styles.placeCopy}>
                <small>{categoryNames[place.category] || place.category}</small>
                <strong>{place.place}</strong>
                <p>{place.recommendation || place.place}</p>
              </div>
              <button type="button" aria-label={`${place.place} 메뉴`}>···</button>
              {place.transport && <p className={styles.transport}>{place.transport}</p>}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.otherDays}>
        <p>OTHER DAYS</p>
        {selectedTrip.days.map((day, index) => {
          if (index === visibleDay) return null;
          return (
            <button type="button" key={day.day} onClick={() => setActiveDay(index)}>
              <strong>DAY {String(index + 1).padStart(2, "0")}</strong>
              <span>{formatDate(day.date, `DAY ${index + 1}`)}</span>
              <b>{getDayPlaces(day).length}곳　›</b>
            </button>
          );
        })}
      </section>

      {hasRequestedTrip && (
        <div className={styles.saveArea}>
          {viewingSavedPlan ? (
            <div className={styles.savedActions}>
              <button type="button" onClick={() => navigate(`/travel-planner?plan=${encodeURIComponent(savedPlanId)}`)}>수정</button>
              <button type="button" onClick={() => {
                setDeleteState({ deleting: false, error: "" });
                setIsDeleteOpen(true);
              }}>삭제</button>
            </div>
          ) : (
            <button type="button" onClick={openDateStep} disabled={saveState.saving}>내 일정에 담기</button>
          )}
          {deleteState.error && <p className={styles.saveError} role="alert">{deleteState.error}</p>}
        </div>
      )}

      {isDeleteOpen && (
        <div className={styles.deleteBackdrop} role="presentation" onMouseDown={() => !deleteState.deleting && setIsDeleteOpen(false)}>
          <section className={styles.deleteModal} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <p>DELETE PLAN</p>
            <h2 id="delete-modal-title">저장한 일정을<br />삭제할까요?</h2>
            <span>삭제한 일정은 복구할 수 없습니다.</span>
            {deleteState.error && <small role="alert">{deleteState.error}</small>}
            <div>
              <button type="button" disabled={deleteState.deleting} onClick={() => setIsDeleteOpen(false)}>취소</button>
              <button type="button" disabled={deleteState.deleting} onClick={handleDeletePlan}>{deleteState.deleting ? "삭제 중…" : "삭제하기"}</button>
            </div>
          </section>
        </div>
      )}

      {isDateOpen && (
        <div className={styles.dateBackdrop} role="presentation" onMouseDown={() => !saveState.saving && setIsDateOpen(false)}>
          <section className={styles.dateModal} role="dialog" aria-modal="true" aria-labelledby="date-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.dateClose} type="button" aria-label="날짜 입력 닫기" onClick={() => setIsDateOpen(false)}>×</button>
            <p className={styles.dateEyebrow}>TRAVEL DATE</p>
            <h2 id="date-modal-title">언제 여행을<br />떠나시나요?</h2>
            <p className={styles.dateDescription}>여행 시작일과 종료일을 선택해 주시면<br />내 일정에 날짜를 맞춰 저장해 드릴게요.</p>
            <form className={styles.dateForm} onSubmit={handleSavePlan}>
              <label>
                <span>여행 시작일 <b>START</b></span>
                <input type="date" required value={dateDraft.start} min={todayValue} onChange={(event) => {
                  const start = event.target.value;
                  setDateDraft({ start, end: start ? addDays(start, tripLength - 1) : "" });
                  setSaveState({ saving: false, error: "" });
                  setConflictingPlan(null);
                }} />
              </label>
              <label>
                <span>여행 종료일 <b>END</b></span>
                <input type="date" required value={dateDraft.end} readOnly />
              </label>
              <p className={styles.dateDuration}>{tripLength - 1}박 {tripLength}일 일정에 맞춰 종료일이 자동 계산됩니다.</p>
              <p className={styles.dateNotice}>선택한 날짜는 저장된 여행 일정 전체에 반영됩니다.</p>
              {saveState.error && <p className={styles.saveError} role="alert">{saveState.error}</p>}
              {conflictingPlan && <Link className={styles.conflictLink} to={`/travel-planner?plan=${encodeURIComponent(conflictingPlan.id)}`}>겹치는 일정 확인·수정하기 →</Link>}
              <button className={styles.dateSubmit} disabled={saveState.saving}>
                {saveState.saving ? "저장하고 있어요…" : "여행 일정 저장하기"}
              </button>
            </form>
          </section>
        </div>
      )}

      {isSavedOpen && (
        <div className={styles.savedBackdrop} role="presentation" onMouseDown={() => setIsSavedOpen(false)}>
          <section
            className={styles.savedModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="saved-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsSavedOpen(false);
            }}
          >
            <span className={styles.modalHandle} aria-hidden="true" />
            <p className={styles.modalBrand}>L:CODE</p>
            <h2 id="saved-modal-title">일정 담기 성공!</h2>
            <p className={styles.modalMessage}>추천 일정이<br />내 여행에 저장되었습니다.</p>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setIsSavedOpen(false)}>닫기</button>
              <Link to={`/travel-planner?plan=${encodeURIComponent(savedDocumentId)}`}>일정 보기</Link>
            </div>
          </section>
        </div>
      )}

    </main>
  );
}
