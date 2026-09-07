import MypageBackLink from "../components/MypageBackLink";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import products from "../data/products.json";
import { myStoryTrips, shoppingReviewLimit } from "../data/myStoriesSummary";
import { db } from "../firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import styles from "./Mystories.module.scss";

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

function StoryCard({ title, review }) {
  return <article className={styles.storyCard}>
    <div className={styles.storyImage} aria-hidden="true" />
    <div className={styles.storyInfo}><h2>{title}</h2><p>나만의 여행</p><small>2026.08.17 - 08.20 | 12개 일정</small><footer>
      <Link to="/plan/saved">상세 보기</Link>
      <Link className={styles.reviewLink} to="/review" state={{ tripTitle: title, review }}>{review ? "리뷰 수정" : "리뷰 쓰기"}</Link>
    </footer></div>
  </article>;
}

export default function Mystories() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(() => { try { return JSON.parse(localStorage.getItem(reviewStorageKey)) || []; } catch { return []; } });
  const storyTrackRef = useRef(null);
  const [storyIndex, setStoryIndex] = useState(0);

  useEffect(() => {
    if (!db || !user?.uid) return;
    getDocs(collection(db, "reviews")).then((snapshot) => {
      const remoteReviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((review) => review.userId === user.uid);
      if (!remoteReviews.length) return;
      setReviews((localReviews) => {
        const merged = [...remoteReviews];
        localReviews.forEach((review) => { if (!merged.some((item) => item.id === review.id)) merged.push(review); });
        localStorage.setItem(reviewStorageKey, JSON.stringify(merged));
        return merged;
      });
    }).catch((error) => console.warn("저장된 리뷰를 불러오지 못했습니다.", error));
  }, [user?.uid]);

  const visibleProducts = categorizedProducts.slice(0, shoppingReviewLimit);

  const handleStoryScroll = () => {
    const track = storyTrackRef.current;
    if (!track || !track.clientWidth) return;
    setStoryIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  const goToStory = (index) => {
    const track = storyTrackRef.current;
    if (track) track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  return <main className={styles.mystories}><div className={styles.content}>
    <section className={styles.stories} aria-labelledby="my-stories-title">
      <MypageBackLink /><p className={styles.eyebrow}>JOURNAL</p><h1 id="my-stories-title">MY<span className={styles.mobileBreak}><br /></span> STORIES</h1><p className={styles.description}>나만의 여행을 위해 남긴 글</p><div className={styles.divider} />
      <div className={styles.storyList} ref={storyTrackRef} onScroll={handleStoryScroll}>{myStoryTrips.map((title) => <StoryCard key={title} title={title} review={reviews.find((item) => item.tripTitle === title)} />)}</div>
      {myStoryTrips.length > 0 && (
        <div className={styles.storyDots}>
          {myStoryTrips.map((title, index) => (
            <button key={title} type="button" className={index === storyIndex ? styles.activeDot : ""} aria-label={`${index + 1}번째 여행 리뷰 보기`} onClick={() => goToStory(index)} />
          ))}
        </div>
      )}
    </section>
    <section className={styles.shopping} aria-labelledby="shopping-review-title">
      <h2 className={styles.shoppingTitle} id="shopping-review-title">SHOPPING REVIEW</h2>
      <div className={styles.productGrid}>{visibleProducts.map((product) => <article className={styles.productCard} key={product.id}>
        <div
          className={styles.productImage}
          role={product.displayImage ? "img" : undefined}
          aria-label={product.displayImage ? `${product.displayName} 상품 이미지` : undefined}
          aria-hidden={product.displayImage ? undefined : "true"}
          style={product.displayImage ? { backgroundImage: `url("${product.displayImage}")`, backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundSize: "cover" } : undefined}
        /><h2>{product.displayName}</h2><small>{Number(product.price).toLocaleString("ko-KR")}원</small><p>평점 <span>★ ★ ★ ★ ★</span></p>
        <footer><Link to="/shop">상세보기</Link><Link to="/review" state={{ productName: product.displayName }}>리뷰쓰기</Link></footer>
      </article>)}</div>
    </section>
  </div></main>;
}
