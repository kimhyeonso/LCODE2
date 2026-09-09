import MypageBackLink from "../components/MypageBackLink";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import products from "../data/products.json";
import { myStoryTrips } from "../data/myStoriesSummary";
import { db } from "../firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import styles from "./Mystories.module.scss";
import { getReviewProducts } from "../services/purchaseHistory";
import { enrichShopProduct } from "../utils/shopProductResolver";

const reviewStorageKey = "lcode-saved-reviews";
const fallbackNames = ["여행용 키트", "멀티 어댑터", "트래블 파우치", "캐리어 커버"];
// 구매 내역이 없을 때 시안처럼 2페이지(페이지당 4개) 분량의 예시 상품을 노출합니다.
const fallbackProductCount = 8;
// 필터 탭 → products.json category 매핑.
const shoppingFilters = [
  { key: "ALL", label: "ALL", categories: null },
  { key: "POUCH", label: "POUCH", categories: ["가방/수납"] },
  { key: "FLIGHT", label: "FLIGHT", categories: ["기내/편의"] },
  { key: "TECH", label: "TECH", categories: ["전자기기"] },
  { key: "KIT", label: "KIT", categories: ["세트 상품"] },
];

// Products.jsx와 동일하게 products.json의 배열 순서에 맞는 대표 이미지를 연결합니다.
// products[0] -> 1_1.webp, products[1] -> 2_1.webp ...
const productImageModules = import.meta.glob("../assets/images/detail/*_1.webp", {
  eager: true,
  import: "default",
});

const getProductImage = (index) => {
  const base = `../assets/images/detail/${index + 1}_1`;
  return productImageModules[`${base}.webp`] || "";
};

const categorizedProducts = products.map((product, index) => ({
  ...enrichShopProduct(product),
  displayName: fallbackNames[index % fallbackNames.length],
  displayImage: getProductImage(index) || enrichShopProduct(product).image || "",
}));

function ReviewSummaryCard({ review }) {
  const photo = review.photos?.[0];
  const contentPreview = review.content?.trim();
  const tags = Array.isArray(review.tags) ? review.tags.slice(0, 4) : [];
  const detailTo = review.id ? `/review/${encodeURIComponent(review.id)}` : "/review";
  const editState = review.id ? { review } : { newReview: true, tripTitle: review.title };
  const subtitle = review.tripDate || review.tripTitle || "여행 리뷰";

  return <article className={`${styles.storyCard} ${styles.hasStoryPhoto}`}>
    {photo?.src ? <img className={styles.storyPhoto} src={photo.src} alt={photo.name || `${review.title} 리뷰 사진`} loading="lazy" /> : <div className={`${styles.storyPhoto} ${styles.defaultStoryPhoto}`} aria-hidden="true" />}
    <div className={styles.storyInfo}>
      <h2>{review.title}</h2>
      <p className={styles.storySubtitle}>{subtitle}{review.rating ? ` · 평점 ${review.rating} / 5` : ""}</p>
      {contentPreview && <p className={styles.storyExcerpt}>{contentPreview}</p>}
      {tags.length > 0 && <ul className={styles.storyTags}>{tags.map((tag) => <li key={tag}>#{tag}</li>)}</ul>}
      <footer>
        <Link to={detailTo} state={editState}>상세 보기</Link>
        <Link className={styles.reviewLink} to="/review" state={editState}>리뷰 쓰기</Link>
      </footer>
    </div>
  </article>;
}

export default function Mystories() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slide, setSlide] = useState(0);
  const [productPage, setProductPage] = useState(0);
  const [shoppingFilter, setShoppingFilter] = useState("ALL");
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const deleteLock = useRef(false);
  const swipeStart = useRef({ x: 0, y: 0 });
  const productSwipeStart = useRef({ x: 0, y: 0 });
  const productDragged = useRef(false);
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
    .map((review) => enrichShopProduct({ id: review.productId, name: review.productName, price: null }));
  const productSource = [...purchasedProducts, ...reviewProducts];
  const visibleProducts = (productSource.length ? productSource : categorizedProducts.slice(0, fallbackProductCount)).filter((item, index, items) => items.findIndex((other) => other.id === item.id) === index).map((product) => ({ ...product, displayName: product.displayName || product.name,
    // Firestore purchase records store the image URL that was resolved at
    // order time; when local assets are re-hashed (e.g. a png -> webp
    // conversion) that stored URL 404s. Prefer today's catalog image and
    // only fall back to the stored one for products no longer in the catalog.
    displayImage: categorizedProducts.find((item) => String(item.id) === product.id)?.displayImage || product.image || "" }));
  const activeFilter = shoppingFilters.find((item) => item.key === shoppingFilter) || shoppingFilters[0];
  const filteredProducts = activeFilter.categories
    ? visibleProducts.filter((product) => activeFilter.categories.includes(product.category))
    : visibleProducts;
  const productsPerPage = 4;
  const productPageCount = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const safeProductPage = Math.min(productPage, productPageCount - 1);
  const pagedProducts = filteredProducts.slice(safeProductPage * productsPerPage, (safeProductPage + 1) * productsPerPage);
  const goToPreviousProductPage = () => {
    if (productPageCount < 2) return;
    setProductPage((safeProductPage - 1 + productPageCount) % productPageCount);
  };
  const goToNextProductPage = () => {
    if (productPageCount < 2) return;
    setProductPage((safeProductPage + 1) % productPageCount);
  };
  const handleProductSwipeStart = (event) => {
    productSwipeStart.current = { x: event.clientX, y: event.clientY };
  };
  const handleProductSwipeEnd = (event) => {
    if (productPageCount < 2) return;
    const deltaX = event.clientX - productSwipeStart.current.x;
    const deltaY = event.clientY - productSwipeStart.current.y;
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    productDragged.current = true;
    window.setTimeout(() => { productDragged.current = false; }, 0);
    if (deltaX > 0) goToPreviousProductPage();
    else goToNextProductPage();
  };
  const preventProductClickAfterDrag = (event) => {
    if (!productDragged.current) return;
    event.preventDefault();
    event.stopPropagation();
  };
  // 여행 리뷰 영역은 저장된 여행 카드 목록을 기준으로 렌더링한다.
  // 임의의 Firestore 테스트 리뷰가 대표 카드를 대체하지 않도록, 같은
  // 여행명에 연결된 리뷰만 카드의 내용으로 합친다.
  const displayTravelReviews = myStoryTrips.map((tripTitle) => {
    const review = reviews.find((item) => item.userId === user?.uid && !item.productName && item.tripTitle === tripTitle);
    return {
      id: review?.id || "",
      title: tripTitle,
      tripTitle: "나만의 여행",
      tripDate: "2026.08.17 - 08.20 | 12개 일정",
      rating: 0,
      content: "",
      tags: [],
      photos: [],
      ...(review || {}),
      title: tripTitle,
      tripTitle: "나만의 여행",
      tripDate: "2026.08.17 - 08.20 | 12개 일정",
    };
  });
  const currentSlide = Math.min(slide, Math.max(0, displayTravelReviews.length - 1));
  const goToPreviousReview = () => {
    if (displayTravelReviews.length < 2) return;
    setSlide((currentSlide - 1 + displayTravelReviews.length) % displayTravelReviews.length);
  };
  const goToNextReview = () => {
    if (displayTravelReviews.length < 2) return;
    setSlide((currentSlide + 1) % displayTravelReviews.length);
  };
  const handleSwipeStart = (event) => {
    const touch = event.touches[0];
    swipeStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleSwipeEnd = (event) => {
    if (displayTravelReviews.length < 2) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - swipeStart.current.x;
    const deltaY = touch.clientY - swipeStart.current.y;
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    if (deltaX > 0) goToPreviousReview();
    else goToNextReview();
  };

  return <main className={styles.mystories}><div className={styles.content}>
    <section className={styles.stories} aria-labelledby="my-stories-title">
      <MypageBackLink /><p className={styles.eyebrow}>JOURNAL</p><h1 id="my-stories-title">MY<span className={styles.mobileBreak}><br /></span> STORIES</h1><p className={styles.description}>나만의 여행을 위해 남긴 글</p><div className={styles.divider} />
      {loading && <p role="status">리뷰를 불러오고 있어요.</p>}
      {error && <p role="alert">{error}</p>}
      {displayTravelReviews.length > 0 && <section className={styles.reviewSlider} aria-label="작성한 여행 리뷰" aria-roledescription="슬라이드">
        <button type="button" className={styles.slideArrow} aria-label="이전 리뷰" disabled={displayTravelReviews.length < 2} onClick={goToPreviousReview}>{"<"}</button>
        <div className={styles.slideViewport} onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}><div className={styles.slideTrack} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {displayTravelReviews.map((review, index) => <div className={`${styles.storyList} ${styles.reviewSlide}`} key={review.id || `default-${index}`} aria-hidden={index !== currentSlide} inert={index !== currentSlide}><ReviewSummaryCard review={review} /></div>)}
        </div></div>
        <button type="button" className={styles.slideArrow} aria-label="다음 리뷰" disabled={displayTravelReviews.length < 2} onClick={goToNextReview}>{">"}</button>
        <p className={styles.slideCount} aria-live="polite">{currentSlide + 1} / {displayTravelReviews.length}</p>
        {displayTravelReviews.length >= 1 && <div className={styles.pageDots}>
          {displayTravelReviews.map((review, index) => <button key={review.id || `dot-${index}`} type="button" className={index === currentSlide ? styles.activeDot : ""} aria-label={`${index + 1}번째 리뷰`} aria-current={index === currentSlide} onClick={() => setSlide(index)} />)}
        </div>}
      </section>}
      <Link className={styles.newReview} to="/review" state={{ newReview: true }}>새 리뷰 작성</Link>
    </section>
    <section className={styles.shopping} aria-labelledby="shopping-review-title">
      <h2 className={styles.shoppingTitle} id="shopping-review-title">SHOPPING REVIEW</h2>
      <div className={styles.filters} aria-label="shopping review filter">
        {shoppingFilters.map((item) => (
          <button
            key={item.key}
            type="button"
            className={item.key === shoppingFilter ? styles.selected : ""}
            aria-pressed={item.key === shoppingFilter}
            onClick={() => { setShoppingFilter(item.key); setProductPage(0); }}
          >{item.label}</button>
        ))}
      </div>
      {productsLoading && <p role="status">구매 내역을 불러오고 있어요.</p>}
      {productsError && <p role="alert">{productsError}</p>}
      {deleteError && <p role="alert">{deleteError}</p>}
      {!productsLoading && !productsError && !visibleProducts.length && <p>최근 30일간 구매한 상품이 없어요.</p>}
      <div
        className={styles.productGrid}
        onPointerDown={handleProductSwipeStart}
        onPointerUp={handleProductSwipeEnd}
        onPointerCancel={handleProductSwipeEnd}
        onClickCapture={preventProductClickAfterDrag}
      >{pagedProducts.map((product) => {
        const review = reviews.find((item) => item.userId === user.uid && item.productId === product.id);
        return <article className={styles.productCard} key={product.id}>
        <div
          className={styles.productImage}
          role={product.displayImage ? "img" : undefined}
          aria-label={product.displayImage ? `${product.displayName} 상품 이미지` : undefined}
          aria-hidden={product.displayImage ? undefined : "true"}
          style={product.displayImage ? { backgroundImage: `url("${product.displayImage}")`, backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundSize: "cover" } : undefined}
        /><h2>{product.displayName}</h2>{product.price !== null && <small>{Number(product.price).toLocaleString("ko-KR")}원</small>}<p className={styles.productRating}>{review ? `내 평점 ${review.rating} / 5` : "평점 ★★★★★"}</p>
        <footer>{review ? <>
          {deletingId === review.id ? <button type="button" disabled>리뷰 쓰기</button> : <Link to={`/review?productId=${encodeURIComponent(product.id)}`} state={{ review, productName: product.displayName }}>리뷰 쓰기</Link>}
          <button type="button" disabled={Boolean(deletingId)} onClick={() => deleteProductReview(review)}>{deletingId === review.id ? "삭제 중..." : "리뷰 삭제"}</button>
        </> : <><Link to={`/shop/${encodeURIComponent(product.id)}`}>상품 보기</Link>{loading || error ? <button type="button" disabled>리뷰 확인 중</button> : <Link to={`/review?productId=${encodeURIComponent(product.id)}`} state={{ productName: product.displayName }}>리뷰 쓰기</Link>}</>}</footer>
      </article>; })}</div>
      {filteredProducts.length > 0 && <div className={styles.pageDots}>
        {Array.from({ length: productPageCount }, (_, index) => <button key={`shop-page-${index}`} type="button" className={index === safeProductPage ? styles.activeDot : ""} aria-label={`상품 ${index + 1}페이지`} aria-current={index === safeProductPage} onClick={() => setProductPage(index)} />)}
      </div>}
    </section>
  </div></main>;
}
