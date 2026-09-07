import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import MypageBackLink from "../components/MypageBackLink";
import styles from "./Review.module.scss";

export default function ReviewDetail() {
  const { reviewId } = useParams();
  const { user } = useAuth();
  return <ReviewDetailContent key={`${user.uid}:${reviewId}`} />;
}

function ReviewDetailContent() {
  const { reviewId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const deleteLock = useRef(false);
  const [deleting, setDeleting] = useState(false);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const load = async () => {
      let local;
      try {
        const saved = JSON.parse(localStorage.getItem("lcode-saved-reviews")) || [];
        local = Array.isArray(saved) ? saved.find((item) => item.id === reviewId && item.userId === user.uid) : null;
      } catch { /* Continue with the server copy. */ }
      try {
        let result = local;
        if (!local?.pendingSync && !reviewId.startsWith("local-")) {
          const snapshot = await getDoc(doc(db, "reviews", reviewId));
          result = snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null;
        }
        if (!active) return;
        if (result?.userId === user.uid) setReview(result);
        else setError("리뷰를 찾을 수 없거나 확인할 권한이 없어요.");
      } catch {
        if (!active) return;
        if (local) setReview(local);
        setError(local ? "서버에 연결하지 못해 이 기기에 저장된 내용을 표시합니다." : "리뷰를 불러오지 못했어요. 잠시 후 새로고침해 주세요.");
      } finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [reviewId, user.uid]);

  const ownedReview = review?.userId === user.uid ? review : null;
  const deleteReview = async () => {
    if (!ownedReview || deleteLock.current) return;
    if (!window.confirm("이 리뷰를 삭제할까요? 작성한 내용과 사진이 함께 삭제되며 복구할 수 없습니다.")) return;
    deleteLock.current = true;
    setDeleting(true);
    setError("");
    let serverDeleted = false;
    try {
      // A pending edit can still have a server copy; only local IDs skip deletion.
      if (!reviewId.startsWith("local-")) {
        await deleteDoc(doc(db, "reviews", reviewId));
        serverDeleted = true;
      }
      const key = "lcode-saved-reviews";
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(saved)) {
        localStorage.setItem(key, JSON.stringify(saved.filter((item) => !(item.id === reviewId && item.userId === user.uid))));
      }
      navigate("/mystories", { replace: true });
    } catch {
      setError(serverDeleted
        ? "서버에서는 삭제했지만 이 기기의 저장 내용을 정리하지 못했어요. 삭제를 다시 눌러 주세요."
        : "리뷰를 삭제하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.");
    } finally {
      deleteLock.current = false;
      setDeleting(false);
    }
  };
  return <main className={styles.review}><div className={styles.page}>
    <header className={styles.heading}><div><p>MY STORIES</p><h1>REVIEW</h1></div><MypageBackLink to="/mystories" label="나의 리뷰로 돌아가기" /></header>
    {loading && <p role="status">리뷰를 불러오고 있어요.</p>}
    {error && <p role="alert">{error}</p>}
    {!loading && ownedReview && <article className={styles.savedReview}>
      <p>{ownedReview.productName || ownedReview.tripTitle}</p>
      <h2>{ownedReview.title}</h2>
      <p aria-label={`평점 5점 만점에 ${ownedReview.rating}점`}>{"★".repeat(Math.max(0, Math.min(5, Number(ownedReview.rating) || 0)))} · {ownedReview.rating} / 5</p>
      <div className={styles.savedContent}>{ownedReview.content}</div>
      <div className={styles.savedPhotos}>{(ownedReview.photos || []).map((photo, index) => <img key={index} src={photo.src} alt={photo.name || `리뷰 사진 ${index + 1}`} loading="lazy" />)}</div>
      <p>{(ownedReview.tags || []).map((tag) => `#${tag}`).join(" ")}</p>
      {ownedReview.pendingSync && <p>이 기기에 임시 보관된 리뷰입니다. 리뷰 수정 후 등록하면 서버 저장을 다시 시도합니다.</p>}
      <div className={styles.reviewDetailActions}>
        {deleting ? <button type="button" disabled>리뷰 수정</button> : <Link to="/review" state={{ review: ownedReview }}>리뷰 수정</Link>}
        <button type="button" onClick={deleteReview} disabled={deleting}>{deleting ? "삭제 중..." : "리뷰 삭제"}</button>
      </div>
      {deleting && <p role="status">리뷰를 삭제하고 있어요.</p>}
    </article>}
  </div></main>;
}
