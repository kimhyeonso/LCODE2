import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import MypageBackLink from "../components/MypageBackLink";
import { db } from "../firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import styles from "./Review.module.scss";
import { prepareReviewPhoto } from "../services/reviewPhotos";
import { getPlans } from "../services/firestoreService";
import { recentReviewTrips } from "../services/recentReviewTrips";
import { getReviewProducts, saveProductReview } from "../services/purchaseHistory";
import { resolveProductImage } from "../utils/shopProductResolver";

const baseTags = ["도시", "야경", "맛집", "감성", "재방문 의사", "좋아요"];
const draftKey = "lcode-review-draft";
const reviewStorageKey = "lcode-saved-reviews";
const hiddenProductReviewCardsKey = "lcode-hidden-product-review-cards";

function unhideProductReviewCard(userId, productId) {
  if (!userId || !productId) return;
  try {
    const stored = JSON.parse(localStorage.getItem(hiddenProductReviewCardsKey) || "{}");
    if (!Array.isArray(stored[userId])) return;
    stored[userId] = stored[userId].filter((id) => String(id) !== String(productId));
    localStorage.setItem(hiddenProductReviewCardsKey, JSON.stringify(stored));
  } catch { /* Ignore local UI state persistence failures. */ }
}

function saveReviewLocally(review) {
  let reviews = [];
  try { reviews = JSON.parse(localStorage.getItem(reviewStorageKey)) || []; }
  catch { reviews = []; }

  if (!Array.isArray(reviews)) reviews = [];
  const index = reviews.findIndex((item) => item.id === review.id && item.userId === review.userId);
  const next = index >= 0
    ? reviews.map((item, itemIndex) => itemIndex === index ? review : item)
    : [review, ...reviews];
  localStorage.setItem(reviewStorageKey, JSON.stringify(next));
}

function readDraft(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    localStorage.removeItem(key);
    return {};
  }
}

export default function Review() {
  const { user } = useAuth();
  const { state } = useLocation();
  const isNewReview = Boolean(state?.newReview);
  const editingReview = !isNewReview && state?.review?.userId === user.uid ? state.review : null;
  const [params] = useSearchParams();
  const productId = params.get("productId") || state?.review?.productId || "";
  const isProductReview = Boolean(productId || state?.productName || state?.review?.productName);
  const [purchase, setPurchase] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(isProductReview);
  const [purchaseError, setPurchaseError] = useState("");
  useEffect(() => {
    if (!isProductReview || editingReview) return;
    let active = true;
    getReviewProducts(user.uid).then((items) => {
      if (!active) return;
      const item = items.find((item) => item.id === productId);
      // Firestore purchase records store the image URL resolved at order
      // time, which 404s once local assets are re-hashed (png/jpg -> webp).
      // Re-resolve against today's catalog.
      setPurchase(item ? { ...item, image: resolveProductImage(item) } : null);
      if (!item) setPurchaseError("최근 30일 이내에 구매한 상품만 리뷰를 작성할 수 있어요.");
    }).catch(() => { if (active) setPurchaseError("구매 내역을 확인하지 못했어요. 새로고침 후 다시 시도해 주세요."); })
      .finally(() => { if (active) setPurchaseLoading(false); });
    return () => { active = false; };
  }, [user.uid, productId, isProductReview, editingReview]);
  const navigate = useNavigate();
  const userDraftKey = `${draftKey}:${user.uid}:${productId || state?.productName || "travel"}`;
  const [draft] = useState(() => isNewReview ? {} : readDraft(userDraftKey));
  const initialReview = editingReview || draft;
  const [rating, setRating] = useState(initialReview.rating || 0);
  const [title, setTitle] = useState(initialReview.title || "");
  const [content, setContent] = useState(initialReview.content || "");
  const [tags, setTags] = useState(initialReview.tags || []);
  const [customTags, setCustomTags] = useState(initialReview.customTags || []);
  const [photos, setPhotos] = useState(() => initialReview.photos || []);
  const [processingPhotos, setProcessingPhotos] = useState(false);
  const [status, setStatus] = useState({ saving: false, message: "", error: "" });
  const [noticeMessage, setNoticeMessage] = useState("");
  const reviewBackTo = state?.reviewBackTo || "/mystories";
  const reviewBackLabel = state?.reviewBackLabel || "나의 리뷰로 돌아가기";
  const productName = isProductReview ? purchase?.name || state?.productName || editingReview?.productName || "상품 리뷰" : "";
  const [tripId, setTripId] = useState(initialReview.tripId || state?.tripId || "");
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(!productName && !editingReview);
  const [tripsError, setTripsError] = useState("");
  useEffect(() => {
    if (productName || editingReview) return;
    let active = true;
    getPlans(user.uid).then((plans) => {
      if (active) setTrips(recentReviewTrips(plans));
    }).catch(() => {
      if (active) setTripsError("여행 목록을 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.");
    }).finally(() => { if (active) setTripsLoading(false); });
    return () => { active = false; };
  }, [user.uid, productName, editingReview]);
  useEffect(() => {
    if (!productName && !editingReview && !isNewReview && !tripId && trips.length) {
      setTripId(trips[0].id);
    }
  }, [productName, editingReview, isNewReview, tripId, trips]);
  const selectedTrip = trips.find((trip) => trip.id === tripId);
  const tripTitle = selectedTrip?.title || selectedTrip?.city || state?.tripTitle || editingReview?.tripTitle || (productName ? productName : "나의 여행");

  const allTags = useMemo(() => [...baseTags, ...customTags], [customTags]);
  const toggleTag = (tag) => setTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);

  const addTag = () => {
    const value = window.prompt("추가할 태그를 입력해주세요.")?.trim();
    if (value && !allTags.includes(value)) {
      setCustomTags((current) => [...current, value]);
      setTags((current) => [...current, value]);
    }
  };

  const selectPhotos = async (event) => {
    if (processingPhotos || status.saving) return;
    const files = Array.from(event.target.files || []).slice(0, Math.max(0, 3 - photos.length));
    event.target.value = "";
    setProcessingPhotos(true);
    try {
      const additions = await Promise.all(files.map(prepareReviewPhoto));
      setPhotos((current) => [...current, ...additions].slice(0, 3));
      setStatus({ saving: false, message: "", error: "" });
    } catch (error) {
      setStatus({ saving: false, message: "", error: error.message || "사진을 불러오지 못했어요." });
    } finally { setProcessingPhotos(false); }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(userDraftKey, JSON.stringify({ rating, title, content, tags, customTags, photos, tripId }));
    } catch {
      setStatus({ saving: false, message: "", error: "기기 저장 공간이 부족해 임시 저장하지 못했어요." });
      return;
    }
    setStatus({ saving: false, message: "임시 저장되었습니다.", error: "" });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (status.saving || processingPhotos) return;
    if (isProductReview && !editingReview && (!purchase || purchaseLoading || purchaseError)) {
      setStatus({ saving: false, message: "", error: "최근 30일 이내의 구매 내역을 확인한 후 작성할 수 있어요." });
      return;
    }
    if (!productName && !editingReview && !recentReviewTrips(trips).some((trip) => trip.id === tripId)) {
      setStatus({ saving: false, message: "", error: "최근 30일 이내에 종료된 여행을 선택해 주세요." });
      return;
    }
    if (!rating || !title.trim() || !content.trim()) {
      setStatus({ saving: false, message: "", error: "별점, 제목, 상세 리뷰를 모두 입력해주세요." });
      return;
    }
    setStatus({ saving: true, message: "", error: "" });
    const reviewData = {
      userId: user.uid,
      userEmail: user.email || "",
      tripTitle,
      tripId: selectedTrip?.tripId || selectedTrip?.id || editingReview?.tripId || "",
      tripDate: selectedTrip ? `${selectedTrip.dateRange.start || ""} ~ ${selectedTrip.dateRange.end}` : (editingReview?.tripDate || ""),
      productName,
      productId,
      orderNumber: purchase?.orderNumber || editingReview?.orderNumber || "",
      customTags,
      rating,
      title: title.trim(),
      content: content.trim(),
      tags,
      photos,
      photoNames: photos.map((photo) => photo.name),
    };

    if (isProductReview && !editingReview) {
      try {
        const eligible = await getReviewProducts(user.uid);
        if (!eligible.some((item) => item.id === productId)) {
          setStatus({ saving: false, message: "", error: "리뷰 작성 가능한 구매 기간이 지났어요." });
          return;
        }
      } catch {
        setStatus({ saving: false, message: "", error: "구매 내역을 확인하지 못해 등록하지 않았어요. 다시 시도해 주세요." });
        return;
      }
    }
    try {
      let reviewId = editingReview?.id;
      if (isProductReview) {
        const saved = await saveProductReview(reviewData, reviewId);
        reviewId = saved.id;
        Object.assign(reviewData, saved);
      } else if (reviewId && !reviewId.startsWith("local-")) {
        await updateDoc(doc(db, "reviews", reviewId), {
          ...reviewData,
          updatedAt: serverTimestamp(),
        });
      } else {
        const savedReview = await addDoc(collection(db, "reviews"), {
          ...reviewData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        reviewId = savedReview.id;
      }

      try {
      saveReviewLocally({ ...reviewData, id: reviewId, updatedAt: Date.now() });
      if (isProductReview) unhideProductReviewCard(user.uid, productId);
      if (editingReview?.id?.startsWith("local-") && editingReview.id !== reviewId) {
        const saved = JSON.parse(localStorage.getItem(reviewStorageKey)) || [];
        localStorage.setItem(reviewStorageKey, JSON.stringify(saved.filter((item) => item.id !== editingReview.id || item.userId !== user.uid)));
      }
      localStorage.removeItem(userDraftKey);
      } catch { /* Server save succeeded; a full local cache must not undo it. */ }
      // Keep the 상품 주문 내역 badge ("리뷰 쓰기" -> "리뷰 완료") in sync.
      if (isProductReview) window.dispatchEvent(new Event("product-reviews-changed"));
      setNoticeMessage(editingReview ? "리뷰가 수정되었습니다. 나의 리뷰로 이동합니다." : "리뷰가 등록되었습니다. 나의 리뷰로 이동합니다.");
    } catch (error) {
      if (isProductReview) {
        setStatus({ saving: false, message: "", error: error.code === "functions/failed-precondition" ? "최근 30일 이내의 주문 내역이 필요합니다." : "상품 리뷰를 저장하지 못했어요. 구매 내역과 연결을 확인하고 다시 시도해 주세요." });
        return;
      }
      const localId = editingReview?.id || `local-${Date.now()}`;
      try {
        saveReviewLocally({ ...reviewData, id: localId, updatedAt: Date.now(), pendingSync: true });
      } catch {
        setStatus({ saving: false, message: "", error: "리뷰와 사진을 저장하지 못했어요. 연결과 기기 저장 공간을 확인한 뒤 다시 등록해 주세요." });
        return;
      }
      localStorage.removeItem(userDraftKey);
      setNoticeMessage("서버에 저장하지 못해 이 기기에 임시 보관했습니다. 나의 리뷰로 이동합니다.");
      console.warn("Firestore 리뷰 저장 실패, 로컬에 저장했습니다.", error);
    }
  };

  const closeNotice = () => {
    setNoticeMessage("");
    navigate("/mystories", { replace: true });
  };

  return (
    <main className={styles.review}>
      <div className={styles.page}>
        <header className={styles.heading}>
          <MypageBackLink to={reviewBackTo} label={reviewBackLabel} />
          <div><p>{isProductReview ? "SHOPPING REVIEW" : "MY JOURNEY"}</p><h1>REVIEW</h1><p className={styles.description}>{isProductReview ? "구매한 상품의 이용 후기를 남겨보세요." : "여행 후기를 남겨보세요."}</p></div>
        </header>

        <form onSubmit={submit}>
          {false && !productName && !editingReview && <section className={styles.tripPicker}>
            <label htmlFor="review-trip">리뷰를 작성할 여행</label>
            <p>종료일 기준 최근 30일 이내의 저장된 여행을 선택해 주세요.</p>
            {tripsError ? <p role="alert">{tripsError}</p> : tripsLoading ? <p role="status">여행을 불러오고 있어요.</p> : trips.length ?
              <select id="review-trip" value={tripId} onChange={(event) => setTripId(event.target.value)} required>
                <option value="">여행 선택</option>
                {trips.map((trip) => <option key={trip.id} value={trip.id}>{trip.title || trip.city || "여행"} · {trip.dateRange.start} ~ {trip.dateRange.end}</option>)}
              </select> : <p>최근 30일 이내에 종료된 여행이 없어요. 저장된 일정의 여행 날짜를 확인해 주세요.</p>}
          </section>}
          <section className={styles.tripSummary}>
            {productName ? <>
              {purchase?.image && <img loading="lazy" src={purchase.image} alt={productName} />}
              <div><h2>{productName}</h2>{purchase && <p>구매일 {new Date(purchase.orderedAt).toLocaleDateString("ko-KR")}</p>}
              {!editingReview && purchaseLoading && <p role="status">구매 내역 확인 중...</p>}{purchaseError && <p role="alert">{purchaseError}</p>}</div>
            </> : <div><h2>{tripTitle}</h2><p>{editingReview ? "작성한 리뷰 수정" : "새 리뷰 작성"}</p></div>}
          </section>

          <section className={styles.formRow}>
            <h2>1. 별점</h2>
            <div className={styles.stars} role="radiogroup" aria-label="별점 선택">
              {[1, 2, 3, 4, 5].map((star) => <button key={star} className={star <= rating ? styles.activeStar : ""} type="button" role="radio" aria-checked={star === rating} onClick={() => setRating(star)}>{star <= rating ? "★" : "☆"}</button>)}
            </div>
          </section>

          <section className={styles.formRow}>
            <label htmlFor="review-title">2. 한 줄 제목</label>
            <input id="review-title" maxLength="80" value={title} placeholder="리뷰 제목을 입력해주세요" onChange={(event) => setTitle(event.target.value)} />
          </section>

          <section className={`${styles.formRow} ${styles.detailRow}`}>
            <label htmlFor="review-content">3. 상세 리뷰</label>
            <div className={styles.textareaWrap}><textarea id="review-content" maxLength="2000" value={content} placeholder="자유롭게 적어주세요" onChange={(event) => setContent(event.target.value)} /><span>{content.length} / 2000</span></div>
          </section>

          <section className={`${styles.formRow} ${styles.photoRow}`}>
            <h2>4. 사진 추가<small>(선택)</small></h2>
            <div className={styles.photos}>
              {photos.map((photo, index) => <div className={styles.photoItem} key={`${index}-${photo.name}`}><img loading="lazy" src={photo.src} alt={photo.name} /><button type="button" disabled={status.saving || processingPhotos} aria-label={`${photo.name} 삭제`} onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}>×</button></div>)}
              {photos.length < 3 && <label className={styles.addPhoto}>＋<span>{processingPhotos ? "처리 중..." : "사진 추가"}</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={processingPhotos || status.saving} onChange={selectPhotos} /></label>}
            </div>
          </section>

          <section className={`${styles.formRow} ${styles.tagRow}`}>
            <h2>5. 태그<small>(선택)</small></h2>
            <div className={styles.tags}>{allTags.map((tag) => <button type="button" className={tags.includes(tag) ? styles.selectedTag : ""} onClick={() => toggleTag(tag)} key={tag}>{tag}</button>)}<button type="button" onClick={addTag}>＋ 태그 추가</button></div>
          </section>

          {(status.error || status.message) && <p className={status.error ? styles.error : styles.success}>{status.error || status.message}</p>}
          <div className={styles.actions}><button type="button" disabled={processingPhotos || status.saving} onClick={saveDraft}>♡&nbsp; 임시 저장</button><button type="submit" disabled={status.saving || processingPhotos}>{status.saving ? "등록 중..." : "리뷰 등록"}</button></div>
        </form>
      </div>
      {noticeMessage && (
        <div className={styles.modalBackdrop} role="presentation">
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="review-notice-title">
            <h2 id="review-notice-title">알림</h2>
            <p>{noticeMessage}</p>
            <footer>
              <button type="button" onClick={closeNotice}>확인</button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
