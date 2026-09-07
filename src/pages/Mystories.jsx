import MypageBackLink from "../components/MypageBackLink";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import products from "../data/products.json";
import { db } from "../firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import styles from "./Mystories.module.scss";
import { getReviewProducts } from "../services/purchaseHistory";

const reviewStorageKey = "lcode-saved-reviews";
const fallbackNames = ["여행용 키트", "멀티 어댑터", "트래블 파우치", "캐리어 커버"];

// Products.jsx와 동일하게 products.json의 배열 순서에 맞는 대표 이미지를 연결합니다.
// products[0] -> 1_1.png, products[1] -> 2_1.png ...
const productImageModules = import.meta.glob("../assets/images/detail/*_1.png", {
  eager: true,
  import: "default",
});

const categorizedProducts = products.map((product, index) => {
  const imagePath = `../assets/images/detail/${index + 1}_1.png`;

  return {
    ...product,
    displayName: fallbackNames[index % fallbackNames.length],
    displayImage: productImageModules[imagePath] || product.image || "",
  };
});

function StoryCard({ review }) {
  return <article className={styles.storyCard}>
    <div className={styles.storyInfo}><h2>{review.title}</h2><p>{review.tripTitle || "여행 리뷰"}</p><small>평점 {review.rating} / 5</small><footer>
      <Link to={`/review/${encodeURIComponent(review.id)}`}>상세 보기</Link>
      <Link className={styles.reviewLink} to="/review" state={{ review }}>리뷰 수정</Link>
    </footer></div>
  </article>;
}

export default function Mystories() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slide, setSlide] = useState(0);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const deleteLock = useRef(false);
  const [deleteError, setDeleteError] = useState("");
  const deleteProductReview = async (review) => {
    if (deleteLock.current || review.userId !== user.uid) return;
    if (!window.confirm("제품 리뷰를 삭제할까요? 내용과 사진이 함께 삭제되며 복구할 수 없습니다.")) return;
    deleteLock.current = true;
    setDeletingId(review.id);
    setDeleteError("");
    let serverDeleted = false;
    try {
      if (!review.id.startsWith("local-")) {
        await deleteDoc(doc(db, "reviews", review.id));
        serverDeleted = true;
      }
      const local = JSON.parse(localStorage.getItem(reviewStorageKey) || "[]");
      if (Array.isArray(local)) localStorage.setItem(reviewStorageKey, JSON.stringify(local.filter((item) => !(item.id === review.id && item.userId === user.uid))));
      setReviews((current) => current.filter((item) => item.id !== review.id));
    } catch {
      setDeleteError(serverDeleted ? "서버에서 삭제했지만 기기 저장 내용을 정리하지 못했어요. 삭제를 다시 눌러 주세요." : "리뷰를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      deleteLock.current = false;
      setDeletingId("");
    }
  };
  useEffect(() => {
    let active = true;
    getReviewProducts(user.uid).then((items) => { if (active) setPurchasedProducts(items); })
      .catch(() => { if (active) setProductsError("구매 내역을 불러오지 못했어요. 새로고침 후 다시 시도해 주세요."); })
      .finally(() => { if (active) setProductsLoading(false); });
    return () => { active = false; };
  }, [user.uid]);
  useEffect(() => {
    let active = true;
    let local = [];
    try { local = JSON.parse(localStorage.getItem(reviewStorageKey)) || []; } catch { /* No saved reviews. */ }
    local = Array.isArray(local) ? local.filter((review) => user?.uid && review.userId === user.uid) : [];
    if (!db || !user?.uid) return;
    getDocs(query(collection(db, "reviews"), where("userId", "==", user.uid))).then((snapshot) => {
      if (!active) return;
      const remote = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
      const merged = [...local.filter((item) => item.pendingSync), ...remote.filter((item) => !local.some((saved) => saved.id === item.id && saved.pendingSync))];
      // Only unsynced drafts survive a successful server refresh.
      setReviews(merged);
    }).catch(() => { if (active) { setReviews(local); setError("리뷰를 불러오지 못했어요. 잠시 후 새로고침해 주세요."); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.uid]);

  const productReviews = reviews.filter((item) => item.userId === user.uid && item.productId);
  const reviewProducts = productReviews.filter((review) => !purchasedProducts.some((item) => item.id === review.productId))
    .map((review) => ({ id: review.productId, name: review.productName, price: null, image: "" }));
  const visibleProducts = [...purchasedProducts, ...reviewProducts].filter((item, index, items) => items.findIndex((other) => other.id === item.id) === index).map((product) => ({ ...product, displayName: product.name,
    displayImage: product.image || categorizedProducts.find((item) => String(item.id) === product.id)?.displayImage || "" }));
  const travelReviews = reviews.filter((item) => item.userId === user?.uid && !item.productName);
  const currentSlide = Math.min(slide, Math.max(0, travelReviews.length - 1));

  return <main className={styles.mystories}><div className={styles.content}>
    <section className={styles.stories} aria-labelledby="my-stories-title">
      <MypageBackLink /><p className={styles.eyebrow}>JOURNAL</p><h1 id="my-stories-title">MY<span className={styles.mobileBreak}><br /></span> STORIES</h1><p className={styles.description}>나만의 여행을 위해 남긴 글</p><div className={styles.divider} />
      {loading && <p role="status">리뷰를 불러오고 있어요.</p>}
      {error && <p role="alert">{error}</p>}
      {travelReviews.length > 0 && <section className={styles.reviewSlider} aria-label="작성한 여행 리뷰" aria-roledescription="슬라이드">
        <button type="button" className={styles.slideArrow} aria-label="이전 리뷰" disabled={travelReviews.length < 2} onClick={() => setSlide((currentSlide - 1 + travelReviews.length) % travelReviews.length)}>‹</button>
        <div className={styles.slideViewport}><div className={styles.slideTrack} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {travelReviews.map((review, index) => <div className={`${styles.storyList} ${styles.reviewSlide}`} key={review.id} aria-hidden={index !== currentSlide} inert={index !== currentSlide}><StoryCard review={review} /></div>)}
        </div></div>
        <button type="button" className={styles.slideArrow} aria-label="다음 리뷰" disabled={travelReviews.length < 2} onClick={() => setSlide((currentSlide + 1) % travelReviews.length)}>›</button>
        <p className={styles.slideCount} aria-live="polite">{currentSlide + 1} / {travelReviews.length}</p>
      </section>}
      {!loading && !error && !reviews.some((item) => item.userId === user?.uid && !item.productName) && <div className={styles.emptyState}><h2>아직 작성한 여행 리뷰가 없어요.</h2><p>첫 여행 이야기를 남겨보세요.</p></div>}
      <Link className={styles.newReview} to="/review" state={{ newReview: true }}>새 리뷰 작성</Link>
    </section>
    <section className={styles.shopping} aria-labelledby="shopping-review-title">
      <h2 className={styles.shoppingTitle} id="shopping-review-title">SHOPPING REVIEW</h2>
      {productsLoading && <p role="status">구매 내역을 불러오고 있어요.</p>}
      {productsError && <p role="alert">{productsError}</p>}
      {deleteError && <p role="alert">{deleteError}</p>}
      {!productsLoading && !productsError && !visibleProducts.length && <p>최근 30일간 구매한 상품이 없어요.</p>}
      <div className={styles.productGrid}>{visibleProducts.map((product) => {
        const review = reviews.find((item) => item.userId === user.uid && item.productId === product.id);
        return <article className={styles.productCard} key={product.id}>
        <div
          className={styles.productImage}
          role={product.displayImage ? "img" : undefined}
          aria-label={product.displayImage ? `${product.displayName} 상품 이미지` : undefined}
          aria-hidden={product.displayImage ? undefined : "true"}
          style={product.displayImage ? { backgroundImage: `url("${product.displayImage}")`, backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundSize: "cover" } : undefined}
        /><h2>{product.displayName}</h2>{product.price !== null && <small>{Number(product.price).toLocaleString("ko-KR")}원</small>}<p>{review ? `내 평점 ${review.rating} / 5` : "리뷰 작성 가능"}</p>
        <footer>{review ? <>
          {deletingId === review.id ? <button type="button" disabled>리뷰 수정</button> : <Link to={`/review?productId=${encodeURIComponent(product.id)}`} state={{ review, productName: product.displayName }}>리뷰 수정</Link>}
          <button type="button" disabled={Boolean(deletingId)} onClick={() => deleteProductReview(review)}>{deletingId === review.id ? "삭제 중..." : "리뷰 삭제"}</button>
        </> : <><Link to={`/shop/${encodeURIComponent(product.id)}`}>상세보기</Link>{loading || error ? <button type="button" disabled>리뷰 확인 중</button> : <Link to={`/review?productId=${encodeURIComponent(product.id)}`} state={{ productName: product.displayName }}>리뷰쓰기</Link>}</>}</footer>
      </article>; })}</div>
    </section>
  </div></main>;
}
