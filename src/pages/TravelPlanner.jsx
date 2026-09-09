import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import TravelForm from "../components/TravelForm";
import Loading from "../components/Loading";
import { useAuth } from "../hooks/useAuth";
import { getPlan, getPlanDateConflict, savePlan, updatePlan } from "../services/firestoreService";
import { getShopCatalog, resolveProductImage } from "../utils/shopProductResolver";
import { getTravelProductRecommendations } from "../utils/travelProductRecommendations";
import styles from "./Page.module.scss";

export default function TravelPlanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planId = params.get("plan");
  const location = useLocation();
  const remixDraft = location.state?.remixPlanId === (planId || null) ? location.state?.remixDraft : null;
  const [savedPlan, setSavedPlan] = useState(remixDraft || null);
  const [editState, setEditState] = useState({ loading: Boolean(planId && !remixDraft), saving: false, error: "", saved: false });
  const [draftState, setDraftState] = useState({ saving: false, saved: false, savedAt: null, error: "" });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(Boolean(remixDraft));
  const [conflictingPlan, setConflictingPlan] = useState(null);
  const [productRecommendation, setProductRecommendation] = useState(null);
  const saveLockRef = useRef(false);
  const remixBaseDays = useRef(remixDraft ? location.state?.remixOriginalDays : undefined);

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
    if (!planId || remixDraft) return undefined;
    let active = true;
    getPlan(planId)
      .then((plan) => {
        if (!active) return;
        setSavedPlan(plan);
        setEditState({ loading: false, saving: false, error: plan ? "" : "저장된 일정을 찾을 수 없습니다.", saved: false });
      })
      .catch(() => active && setEditState({ loading: false, saving: false, error: "일정을 불러오지 못했습니다.", saved: false }));
    return () => { active = false; };
  }, [planId, remixDraft]);

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
      const updated = await updatePlan(user.uid, planId, changes, remixBaseDays.current);
      remixBaseDays.current = updated.days;
      setSavedPlan(updated);
      setEditState({ loading: false, saving: false, error: "", saved: true });
      setHasUnsavedChanges(false);
      saveLockRef.current = false;
      window.dispatchEvent(new Event("plans-changed"));
      setProductRecommendation({
        planId: updated.id || planId,
        city: updated.city,
        products: getTravelProductRecommendations(updated, getShopCatalog()).map((product) => ({
          ...product,
          image: resolveProductImage(product),
        })),
      });
    } catch (saveError) {
      console.error("일정 수정 실패:", saveError);
      setEditState({ loading: false, saving: false, error: saveError.message || "변경 내용을 저장하지 못했습니다.", saved: false });
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
        const updated = await updatePlan(user.uid, planId, draft, remixBaseDays.current);
        remixBaseDays.current = updated.days;
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
          hasUnsavedChanges={hasUnsavedChanges}
        />
        {editState.saved && <p className={styles.editSuccess} role="status">변경한 일정이 저장되었습니다.</p>}
        {editState.error && <p className={styles.editError} role="alert">{editState.error}</p>}
        {conflictingPlan && <Link className={styles.conflictPlanLink} to={`/travel-planner?plan=${encodeURIComponent(conflictingPlan.id)}`}>겹치는 일정 확인·수정하기 →</Link>}
        {draftState.saved && <p className={styles.editSuccess} role="status">{draftState.savedAt?.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 임시저장 완료</p>}
        {draftState.error && <p className={styles.editError} role="alert">{draftState.error}</p>}
      </div>
      {productRecommendation && (
        <div className={styles.productRecommendationBackdrop} role="presentation" onMouseDown={() => setProductRecommendation(null)}>
          <section className={styles.productRecommendationModal} role="dialog" aria-modal="true" aria-labelledby="travel-product-recommendation-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.productRecommendationClose} type="button" aria-label="추천 모달 닫기" onClick={() => setProductRecommendation(null)}>×</button>
            <p>TRAVEL ESSENTIALS</p>
            <h2 id="travel-product-recommendation-title">여행 맞춤 준비물을<br />추천해 드릴게요.</h2>
            <span>{productRecommendation.city} 일정의 여행지·계절·기간·활동을 반영했습니다.</span>
            <div className={styles.productRecommendationGrid}>
              {productRecommendation.products.map((product) => (
                <Link className={styles.productRecommendationCard} to={`/shop/${product.id}`} key={product.id}>
                  <span className={styles.productRecommendationImage}>
                    {product.image ? <img loading="lazy" src={product.image} alt={product.name} /> : <b>{product.name.slice(0, 1)}</b>}
                  </span>
                  <small>{product.category}</small>
                  <strong>{product.name}</strong>
                  <em>{product.recommendationReason}</em>
                  <i>{Number(product.price).toLocaleString("ko-KR")} KRW</i>
                </Link>
              ))}
            </div>
            <div className={styles.productRecommendationActions}>
              <Link to={`/plan/saved?id=${encodeURIComponent(productRecommendation.planId)}`}>저장된 일정 보기</Link>
              <Link to="/shop">쇼핑 더보기 <b>→</b></Link>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
