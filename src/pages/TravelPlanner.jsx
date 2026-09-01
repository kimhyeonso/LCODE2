import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TravelForm from "../components/TravelForm";
import RecommendationResult from "../components/RecommendationResult";
import Loading from "../components/Loading";
import { useTravelRecommendation } from "../hooks/useTravelRecommendation";
import { useAuth } from "../hooks/useAuth";
import { getPlan, updatePlan } from "../services/firestoreService";
import styles from "./Page.module.scss";

export default function TravelPlanner() {
  const { result, loading, error, recommend } = useTravelRecommendation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planId = params.get("plan");
  const [savedPlan, setSavedPlan] = useState(null);
  const [editState, setEditState] = useState({ loading: Boolean(planId), saving: false, error: "", saved: false });

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
    if (!user || !planId) return;
    setEditState((current) => ({ ...current, saving: true, error: "", saved: false }));
    try {
      const updated = await updatePlan(user.uid, planId, changes);
      setSavedPlan(updated);
      setEditState({ loading: false, saving: false, error: "", saved: true });
      window.dispatchEvent(new Event("plans-changed"));
      navigate(`/plan/saved?id=${encodeURIComponent(planId)}`);
    } catch (saveError) {
      console.error("일정 수정 실패:", saveError);
      setEditState({ loading: false, saving: false, error: "변경 내용을 저장하지 못했습니다.", saved: false });
    }
  };

  if (editState.loading) return <main className={styles.planner}><Loading label="저장된 일정을 불러오고 있어요." /></main>;

  return (
    <main className={styles.planner}>
      <div className={styles.plannerContent}>
        <TravelForm
          key={savedPlan?.id || "new-plan"}
          initialTrip={savedPlan}
          onSubmit={planId ? saveChanges : recommend}
          loading={planId ? editState.saving : loading}
          editMode={Boolean(planId)}
        />
        {editState.saved && <p className={styles.editSuccess} role="status">변경한 일정이 저장되었습니다.</p>}
        {editState.error && <p className={styles.editError} role="alert">{editState.error}</p>}
        {loading && <Loading label="여행 일정을 저장하는 중" />}
        {error && <p role="alert">{error}</p>}
        <RecommendationResult result={result} />
      </div>
    </main>
  );
}
