import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import TravelForm from "../components/TravelForm";
import Loading from "../components/Loading";
import { useAuth } from "../hooks/useAuth";
import { getPlan, getPlanDateConflict, savePlan, updatePlan } from "../services/firestoreService";
import styles from "./Page.module.scss";

export default function TravelPlanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planId = params.get("plan");
  const [savedPlan, setSavedPlan] = useState(null);
  const [editState, setEditState] = useState({ loading: Boolean(planId), saving: false, error: "", saved: false });
  const [draftState, setDraftState] = useState({ saving: false, saved: false, savedAt: null, error: "" });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [conflictingPlan, setConflictingPlan] = useState(null);
  const saveLockRef = useRef(false);

  const handleDirtyChange = useCallback((dirty) => {
    setHasUnsavedChanges(dirty);
    if (dirty) setDraftState((current) => ({ ...current, saved: false }));
  }, []);

  useEffect(() => {
    if (!hasUnsavedChanges) return undefined;
    const message = "저장하지 않은 변경 사항이 있습니다. 페이지를 나갈까요?";
    const beforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = message;
    };
    const guardLink = (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || anchor.target === "_blank") return;
      const target = new URL(anchor.href, window.location.href);
      if (target.origin !== window.location.origin) return;
      if (!window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      setHasUnsavedChanges(false);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", guardLink, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", guardLink, true);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!planId) return undefined;
    let active = true;
    getPlan(planId)
      .then((plan) => {
        if (!active) return;
        setSavedPlan(plan);
        setEditState({ loading: false, saving: false, error: plan ? "" : "저장된 일정을 찾을 수 없습니다.", saved: false });
      })
      .catch(() => active && setEditState({ loading: false, saving: false, error: "일정을 불러오지 못했습니다.", saved: false }));
    return () => { active = false; };
  }, [planId]);

  const saveChanges = async (changes) => {
    if (!user || !planId || saveLockRef.current) return;
    saveLockRef.current = true;
    setConflictingPlan(null);
    setEditState((current) => ({ ...current, saving: true, error: "", saved: false }));
    try {
      const conflict = await getPlanDateConflict(user.uid, {
        start: changes.dateRange?.start,
        end: changes.dateRange?.end,
        excludePlanId: planId,
        tripId: changes.tripId,
      });
      if (conflict) {
        setConflictingPlan(conflict);
        setEditState({ loading: false, saving: false, error: `${conflict.title || conflict.city || "저장된 일정"}과 여행 날짜가 겹칩니다.`, saved: false });
        saveLockRef.current = false;
        return;
      }
      const updated = await updatePlan(user.uid, planId, changes);
      setSavedPlan(updated);
      setEditState({ loading: false, saving: false, error: "", saved: true });
      setHasUnsavedChanges(false);
      saveLockRef.current = false;
      window.dispatchEvent(new Event("plans-changed"));
      navigate(`/plan/saved?id=${encodeURIComponent(planId)}`);
    } catch (saveError) {
      console.error("일정 수정 실패:", saveError);
      setEditState({ loading: false, saving: false, error: "변경 내용을 저장하지 못했습니다.", saved: false });
      saveLockRef.current = false;
    }
  };

  const confirmNewPlan = async ({ plan }) => {
    if (!user) {
      navigate("/login", { state: { from: "/travel-planner" } });
      return;
    }
    if (saveLockRef.current) return;
    saveLockRef.current = true;
    setConflictingPlan(null);
    setEditState({ loading: false, saving: true, error: "", saved: false });
    try {
      const conflict = await getPlanDateConflict(user.uid, {
        start: plan.dateRange?.start,
        end: plan.dateRange?.end,
        tripId: plan.tripId,
      });
      if (conflict) {
        setConflictingPlan(conflict);
        setEditState({ loading: false, saving: false, error: `${conflict.title || conflict.city || "저장된 일정"}과 여행 날짜가 겹칩니다.`, saved: false });
        saveLockRef.current = false;
        return;
      }
      const document = await savePlan(user.uid, { ...plan, status: "confirmed" });
      if (!document?.id) throw new Error("확정 일정 문서 ID가 없습니다.");
      window.dispatchEvent(new Event("plans-changed"));
      setHasUnsavedChanges(false);
      saveLockRef.current = false;
      navigate(`/plan/saved?id=${encodeURIComponent(document.id)}`);
    } catch (confirmError) {
      console.error("일정 확정 실패:", confirmError);
      setEditState({ loading: false, saving: false, error: "일정을 확정하지 못했습니다.", saved: false });
      saveLockRef.current = false;
    }
  };

  const saveDraft = async (draft) => {
    if (!user) {
      navigate("/login", { state: { from: planId ? `/travel-planner?plan=${encodeURIComponent(planId)}` : "/travel-planner" } });
      return;
    }
    if (draftState.saving || saveLockRef.current) return;
    saveLockRef.current = true;
    setConflictingPlan(null);
    setDraftState({ saving: true, saved: false, savedAt: null, error: "" });
    try {
      if (planId) {
        const updated = await updatePlan(user.uid, planId, draft);
        setSavedPlan(updated);
        setDraftState({ saving: false, saved: true, savedAt: new Date(), error: "" });
      } else {
        const duplicate = await getPlanDateConflict(user.uid, {
          start: draft.dateRange?.start,
          end: draft.dateRange?.end,
          tripId: draft.tripId,
          draft: true,
        });
        if (duplicate) {
          setConflictingPlan(duplicate);
          setDraftState({ saving: false, saved: false, savedAt: null, error: "같은 패키지와 날짜로 저장된 일정이 이미 있습니다." });
          saveLockRef.current = false;
          return;
        }
        const document = await savePlan(user.uid, draft);
        if (!document?.id) throw new Error("임시저장 문서 ID가 없습니다.");
        setDraftState({ saving: false, saved: true, savedAt: new Date(), error: "" });
        window.dispatchEvent(new Event("plans-changed"));
        navigate(`/travel-planner?plan=${encodeURIComponent(document.id)}`, { replace: true });
      }
      window.dispatchEvent(new Event("plans-changed"));
      setHasUnsavedChanges(false);
      saveLockRef.current = false;
    } catch (draftError) {
      console.error("일정 임시저장 실패:", draftError);
      setDraftState({ saving: false, saved: false, savedAt: null, error: "임시저장하지 못했습니다. 잠시 후 다시 시도해 주세요." });
      saveLockRef.current = false;
    }
  };

  if (editState.loading) return <main className={styles.planner}><Loading label="저장된 일정을 불러오고 있어요." /></main>;

  return (
    <main className={styles.planner}>
      <div className={styles.plannerContent}>
        <TravelForm
          key={savedPlan?.id || "new-plan"}
          initialTrip={savedPlan}
          onSubmit={planId ? saveChanges : confirmNewPlan}
          onDraftSave={saveDraft}
          onDirtyChange={handleDirtyChange}
          loading={editState.saving}
          draftLoading={draftState.saving}
          editMode={Boolean(planId)}
        />
        {editState.saved && <p className={styles.editSuccess} role="status">변경한 일정이 저장되었습니다.</p>}
        {editState.error && <p className={styles.editError} role="alert">{editState.error}</p>}
        {conflictingPlan && <Link className={styles.conflictPlanLink} to={`/travel-planner?plan=${encodeURIComponent(conflictingPlan.id)}`}>겹치는 일정 확인·수정하기 →</Link>}
        {draftState.saved && <p className={styles.editSuccess} role="status">{draftState.savedAt?.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 임시저장 완료</p>}
        {hasUnsavedChanges && !draftState.saving && <p className={styles.unsavedNotice} role="status">저장되지 않은 변경 사항이 있습니다.</p>}
        {draftState.error && <p className={styles.editError} role="alert">{draftState.error}</p>}
      </div>
    </main>
  );
}
