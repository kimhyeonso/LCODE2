import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getPlan } from "../../services/firestoreService";
import styles from "./AIRemix.module.scss";

const reasons = [
  { id: "rain", no: "01", icon: "☂", title: "RAIN", desc: "비가 와요" },
  { id: "delay", no: "02", icon: "◷", title: "DELAY", desc: "일정이 늦어졌어요" },
  { id: "traffic", no: "03", icon: "→", title: "TRAFFIC", desc: "교통이 지연됐어요" },
  { id: "closed", no: "04", icon: "×", title: "CLOSED", desc: "방문 장소가 문을 닫았어요" },
  { id: "tired", no: "05", icon: "−", title: "TIRED", desc: "조금 피곤해요" },
  { id: "cost", no: "06", icon: "↓", title: "CUT COSTS", desc: "경비 절감" },
  { id: "auto", no: "07", icon: "↻", title: "AUTO", desc: "알아서 최적화" },
];

const analyzeSteps = ["현재 위치 확인", "날씨 정보 수집", "실내 장소 탐색", "이동 경로 계산", "일정 재구성"];

const resultCopy = {
  rain: {
    tag: "RAIN",
    title: "야외 일정을\n실내로 바꿔드렸어요.",
    desc: "현재 젖은 상황을 고려해 이동 부담을 줄이는 실내 코스로 변경했어요.",
    type: "compare",
  },
  delay: {
    tag: "DELAY",
    title: "오늘 일정이\n조금 더 가벼워졌어요.",
    desc: "늦어진 시간을 반영해 이동 거리가 긴 장소를 내일로 옮겼어요.",
    type: "timeline",
  },
  traffic: {
    tag: "TRAFFIC",
    title: "막히는 길을 피해\n동선을 다시 잡았어요.",
    desc: "현재 교통 상황을 기준으로 가까운 장소부터 방문하도록 정리했어요.",
    type: "timeline",
  },
  closed: {
    tag: "CLOSED",
    title: "문이 닫힌 곳을\n대신할 장소를 찾았어요.",
    desc: "방문 예정 장소의 운영 정보를 확인하고 가까운 대체 장소를 찾았어요.",
    type: "closed",
  },
  tired: {
    tag: "TIRED",
    title: "여유로운 일정으로\n조정했어요.",
    desc: "휴식 시간을 확보하고 필수 일정만 남겨 부담을 줄였어요.",
    type: "timeline",
  },
  cost: {
    tag: "CUT COSTS",
    title: "이동 비용을 줄이는\n일정으로 바꿨어요.",
    desc: "도보 이동과 가까운 장소를 우선해 전체 경비를 낮췄어요.",
    type: "timeline",
  },
  auto: {
    tag: "AUTO",
    title: "오늘 일정에 맞게\n자동으로 최적화했어요.",
    desc: "날씨, 거리, 운영 시간을 함께 계산해 가장 무리 없는 순서로 정리했어요.",
    type: "timeline",
  },
};

const beforeSpots = [
  ["13:00", "CANAL CITY", ""],
  ["15:00", "OHORI PARK", "MOVED → DAY 02"],
  ["18:30", "TENJIN", ""],
];

const afterSpots = [
  ["13:30", "CANAL CITY", "SAME"],
  ["16:20", "TENJIN", "1° EARLIER"],
  ["18:30", "NAKASU", "ADDED"],
];

const editDays = ["DAY 01", "DAY 02", "DAY 03", "DAY 04", "DAY 05"];

export default function AIRemix() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const planId = params.get("planId");
  const [stage, setStage] = useState("select");
  const [reason, setReason] = useState(reasons[0]);
  const [progress, setProgress] = useState(0);
  const [sourcePlan, setSourcePlan] = useState(null);
  const [planError, setPlanError] = useState("");

  const result = useMemo(() => resultCopy[reason.id] ?? resultCopy.auto, [reason]);

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

  const selectReason = (item) => {
    setReason(item);
    setProgress(0);
    setStage("analyzing");
  };

  const reset = () => {
    setStage("select");
    setProgress(0);
  };

  return (
    <main className={styles.page}>
      {stage === "select" && (
        <section className={styles.selectPanel}>
          <header className={styles.selectHeader}>
            <span>L:CODE AI REMIX</span>
            <button type="button" onClick={() => navigate(-1)}>CLOSE ×</button>
          </header>
          <div className={styles.intro}>
            <h1>오늘 일정,<br />다시 맞춰볼까요?</h1>
            <p>{sourcePlan ? `${sourcePlan.title || sourcePlan.city || "저장된 일정"}을 기준으로` : "현재 상황을 선택하면"}<br />남은 일정을 다시 구성해드려요.</p>
            {planError && <p role="alert">{planError}</p>}
          </div>
          <ul className={styles.reasonList}>
            {reasons.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => selectReason(item)}>
                  <span>{item.no}</span>
                  <i>{item.icon}</i>
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
        <ResultView result={result} onBack={reset} onApply={() => setStage("complete")} />
      )}

      {stage === "complete" && (
        <button className={styles.complete} type="button" onClick={() => setStage("edit")}>
          <span>REMIX COMPLETE</span>
          <h1>새 일정이<br />적용되었습니다.</h1>
          <i />
        </button>
      )}

      {stage === "edit" && <EditView onBack={reset} />}
    </main>
  );
}

function ResultView({ result, onBack, onApply }) {
  return (
    <section className={styles.result}>
      <header className={styles.resultHeader}>
        <span>REMIX RESULT</span>
        <em>{result.tag}</em>
      </header>
      <h1>{result.title}</h1>
      <p>{result.desc}</p>

      {result.type === "compare" && <RainCompare />}
      {result.type === "closed" && <ClosedChange />}
      {result.type === "timeline" && <TimelineChange />}

      <div className={styles.actions}>
        <button type="button" onClick={onBack}>기존 일정 유지</button>
        <button type="button" onClick={onApply}>변경 일정 적용</button>
      </div>
    </section>
  );
}

function RainCompare() {
  return (
    <>
      <div className={styles.compare}>
        <article>
          <span>BEFORE</span>
          <div />
          <h2>OHORI PARK</h2>
          <p>오호리 공원</p>
        </article>
        <article>
          <span>AFTER</span>
          <div />
          <h2>FUKUOKA ART MUSEUM</h2>
          <p>후쿠오카 시립미술관</p>
        </article>
      </div>
      <aside className={styles.summaryNote}>현재 강수 상황을 고려하여 야외 일정을 가까운 실내 장소로 변경했어요.</aside>
      <ChangeDetails />
    </>
  );
}

function ClosedChange() {
  return (
    <>
      <section className={styles.placeChange}>
        <article>
          <span>ORIGINAL</span>
          <h2>FUKUOKA TOWER</h2>
          <p>운영중지</p>
        </article>
        <b>↓</b>
        <article className={styles.darkPlace}>
          <span>REPLACEMENT</span>
          <h2>FUKUOKA ART MUSEUM</h2>
          <p>5 MIN AWAY · OPEN UNTIL 20:00</p>
        </article>
      </section>
      <p className={styles.softText}>방문 예정 장소와 운영이 종료되었고, 짧은 거리의 후쿠오카 시립미술관을 추천해드려요.</p>
      <ChangeDetails closed />
    </>
  );
}

function TimelineChange() {
  return (
    <>
      <section className={styles.summaryGrid}>
        <article>
          <span>DISTANCE SAVED</span>
          <strong>2.1</strong>
          <p>KM LESS</p>
        </article>
        <article>
          <span>TIME ADJUSTED</span>
          <del>21:10</del>
          <strong>20:20</strong>
        </article>
      </section>
      <section className={styles.timeline}>
        <h2>BEFORE / AFTER</h2>
        <Timeline title="BEFORE" count="3 SPOTS" rows={beforeSpots} />
        <Timeline title="AFTER" count="3 SPOTS" rows={afterSpots} dark />
      </section>
      <aside className={styles.summaryNote}>우천과 피로를 고려해 이동 시간을 줄였어요.</aside>
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

function ChangeDetails({ closed = false }) {
  return (
    <section className={styles.details}>
      <h2>CHANGES DETAIL</h2>
      <article>
        <span>01 / PLACE</span>
        <em>{closed ? "5 MIN AWAY" : "OUTDOOR → INDOOR"}</em>
        <div><del>{closed ? "FUKUOKA TOWER" : "OHORI PARK"}</del><b>→</b><strong>FUKUOKA ART MUSEUM</strong></div>
      </article>
      <article>
        <span>02 / ROUTE</span>
        <em>{closed ? "CLOSER" : "SHORTER WALK"}</em>
        <div><del>{closed ? "WALK 25 MIN" : "도보 15분"}</del><b>→</b><strong>{closed ? "WALK 8 MIN" : "도보 8분"}</strong></div>
      </article>
      <article>
        <span>03 / TIME</span>
        <em>{closed ? "UNCHANGED" : "20 MIN EARLIER"}</em>
        <div><del>{closed ? "15:00" : "21:10"}</del><b>→</b><strong>{closed ? "15:00" : "20:50"}</strong></div>
      </article>
    </section>
  );
}

function EditView({ onBack }) {
  return (
    <section className={styles.edit}>
      <div className={styles.editHero}>
        <span>PERSONAL TRAVEL PLAN</span>
        <h1>FUKUOKA</h1>
        <p>후쿠오카, 3박 4일 일정</p>
        <button type="button" onClick={onBack}>EDIT</button>
      </div>
      <nav className={styles.dayTabs}>
        {editDays.map((day, index) => <button className={index === 0 ? styles.activeDay : ""} type="button" key={day}>{day}</button>)}
      </nav>
      <section className={styles.dayPlan}>
        <header><strong>DAY 04</strong><span>2026. 11. 04</span></header>
        {["후쿠오카 공항", "캐널시티 하카타", "나카스", "후쿠오카 시립미술관", "호텔 체크인"].map((place, index) => (
          <article key={place}>
            <label><input type="checkbox" /> <span>{place}</span></label>
            <em>{`${12 + index}:30`} - {`${13 + index}:10`}</em>
            <button type="button">×</button>
          </article>
        ))}
        <button className={styles.addSpot} type="button">+ 장소 추가</button>
      </section>
      <button className={styles.saveEdit} type="button">일정 수정</button>
    </section>
  );
}
