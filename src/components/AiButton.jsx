import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import styles from "./AiButton.module.scss";

const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function AiButton({ topVisible = false }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState({ userId: null, plans: [] });
  const [today, setToday] = useState(localDate);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user?.uid || !db) return;
    const userId = user.uid;
    return onSnapshot(query(collection(db, "plans"), where("userId", "==", userId)),
      (result) => setSnapshot({ userId, plans: result.docs.map((item) => ({ ...item.data(), id: item.id })) }),
      () => setSnapshot({ userId, plans: [] }),
    );
  }, [user?.uid]);

  useEffect(() => {
    const update = () => setToday(localDate());
    const timer = window.setInterval(update, 30000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const activePlan = !loading && user?.uid && snapshot.userId === user.uid
    ? snapshot.plans.filter((plan) => plan.status !== "draft"
      && plan.dateRange?.start && plan.dateRange?.end
      && plan.dateRange.start <= today && today <= plan.dateRange.end)
      .sort((a, b) => b.dateRange.start.localeCompare(a.dateRange.start) || a.id.localeCompare(b.id))[0]
    : null;

  const remixUrl = activePlan
    ? `/ai-remix?planId=${encodeURIComponent(activePlan.id)}`
    : "/ai-remix";

  const handleClick = (event) => {
    const touchInput = event.pointerType === "touch" || event.pointerType === "pen"
      || (event.detail !== 0 && window.matchMedia("(hover: none), (pointer: coarse)").matches);
    if (touchInput && !expanded) {
      setExpanded(true);
      return;
    }
    setExpanded(false);
    navigate(remixUrl, {
      state: { remixEntry: `${Date.now()}-${Math.random()}` },
    });
  };

  return (
    <button
      type="button"
      className={`${styles.aiButton} ${topVisible ? styles.aboveTop : ""} ${expanded ? styles.expanded : ""}`}
      aria-label={expanded ? "여행중 변수가 생겼나요? 한 번 더 누르면 AI 리믹스로 이동합니다." : activePlan ? `${activePlan.title || activePlan.city || "현재 여행"} AI 리믹스 시작` : "AI 리믹스 시작"}
      onClick={handleClick}
      onBlur={() => setExpanded(false)}
      onKeyDown={(event) => { if (event.key === "Escape") setExpanded(false); }}
    >
      <span className={styles.prompt} aria-hidden="true">여행중 변수가 생겼나요?</span>
      <span className={styles.icon} aria-hidden="true">
        <b>AI</b>
        <small>REMIX</small>
      </span>
    </button>
  );
}
