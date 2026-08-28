import { useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import MypageBackLink from "../components/MypageBackLink";
import { db } from "../firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import styles from "./Review.module.scss";

const baseTags = ["도시", "야경", "맛집", "감성", "재방문 의사"];
const draftKey = "lcode-review-draft";

function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(draftKey)) || {};
  } catch {
    localStorage.removeItem(draftKey);
    return {};
  }
}

export default function Review() {
  const { user } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [draft] = useState(readDraft);
  const [rating, setRating] = useState(draft.rating || 0);
  const [title, setTitle] = useState(draft.title || "");
  const [content, setContent] = useState(draft.content || "");
  const [tags, setTags] = useState(draft.tags || []);
  const [customTags, setCustomTags] = useState(draft.customTags || []);
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState({ saving: false, message: "", error: "" });
  const tripTitle = state?.tripTitle || "후쿠오카 3박 4일";

  const allTags = useMemo(() => [...baseTags, ...customTags], [customTags]);
  const toggleTag = (tag) => setTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);

  const addTag = () => {
    const value = window.prompt("추가할 태그를 입력해주세요.")?.trim();
    if (value && !allTags.includes(value)) {
      setCustomTags((current) => [...current, value]);
      setTags((current) => [...current, value]);
    }
  };

  const selectPhotos = (event) => {
    const files = Array.from(event.target.files || []).slice(0, Math.max(0, 3 - photos.length));
    setPhotos((current) => [...current, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    event.target.value = "";
  };

  const saveDraft = () => {
    localStorage.setItem(draftKey, JSON.stringify({ rating, title, content, tags, customTags }));
    setStatus({ saving: false, message: "임시 저장되었습니다.", error: "" });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!rating || !title.trim() || !content.trim()) {
      setStatus({ saving: false, message: "", error: "별점, 제목, 상세 리뷰를 모두 입력해주세요." });
      return;
    }
    if (!db) {
      setStatus({ saving: false, message: "", error: "Firebase가 설정되지 않았습니다." });
      return;
    }
    setStatus({ saving: true, message: "", error: "" });
    try {
      await addDoc(collection(db, "reviews"), {
        userId: user.uid,
        userEmail: user.email || "",
        tripTitle,
        tripType: "나만의 여행",
        tripDate: "2026.08.17 - 08.20",
        scheduleCount: 12,
        rating,
        title: title.trim(),
        content: content.trim(),
        tags,
        photoNames: photos.map(({ file }) => file.name),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      localStorage.removeItem(draftKey);
      setStatus({ saving: false, message: "리뷰가 등록되었습니다.", error: "" });
      setTimeout(() => navigate("/mystories", { replace: true }), 700);
    } catch {
      setStatus({ saving: false, message: "", error: "리뷰를 저장하지 못했습니다. 잠시 후 다시 시도해주세요." });
    }
  };

  return (
    <main className={styles.review}>
      <div className={styles.page}>
        <header className={styles.heading}>
          <div><MypageBackLink to="/mystories" label="나의 리뷰로 돌아가기" /><p>MY JOURNEY</p><h1>REVIEW</h1></div>
          <MypageBackLink to="/mystories" label="나의 리뷰로 돌아가기" />
        </header>

        <form onSubmit={submit}>
          <section className={styles.tripSummary}>
            <img src="/Mypage-img/2.png" alt="후쿠오카 여행 거리" />
            <div><h2>{tripTitle}</h2><p>나만의 여행</p><span>2026.08.17 - 08.20&nbsp;&nbsp; | &nbsp;&nbsp;12개 일정</span></div>
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
            <div className={styles.textareaWrap}><textarea id="review-content" maxLength="2000" value={content} placeholder="여행에서 느낀 점, 좋았던 순간, 추천하고 싶은 장소나 팁을 자유롭게 적어주세요." onChange={(event) => setContent(event.target.value)} /><span>{content.length} / 2000</span></div>
          </section>

          <section className={`${styles.formRow} ${styles.photoRow}`}>
            <h2>4. 사진 추가<small>(선택)</small></h2>
            <div className={styles.photos}>
              {["/Mypage-img/2.png", "/Mypage-img/3.png"].map((src) => <img src={src} alt="여행 사진 미리보기" key={src} />)}
              {photos.map((photo) => <img src={photo.preview} alt={photo.file.name} key={photo.preview} />)}
              {photos.length < 3 && <label className={styles.addPhoto}>＋<span>사진 추가</span><input type="file" accept="image/*" multiple onChange={selectPhotos} /></label>}
            </div>
          </section>

          <section className={`${styles.formRow} ${styles.tagRow}`}>
            <h2>5. 태그<small>(선택)</small></h2>
            <div className={styles.tags}>{allTags.map((tag) => <button type="button" className={tags.includes(tag) ? styles.selectedTag : ""} onClick={() => toggleTag(tag)} key={tag}>{tag}</button>)}<button type="button" onClick={addTag}>＋ 태그 추가</button></div>
          </section>

          {(status.error || status.message) && <p className={status.error ? styles.error : styles.success}>{status.error || status.message}</p>}
          <div className={styles.actions}><button type="button" onClick={saveDraft}>♡&nbsp; 임시 저장</button><button type="submit" disabled={status.saving}>{status.saving ? "등록 중..." : "리뷰 등록"}</button></div>
        </form>
      </div>
    </main>
  );
}
