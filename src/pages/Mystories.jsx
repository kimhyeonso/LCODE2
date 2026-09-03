import MypageBackLink from "../components/MypageBackLink";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import products from "../data/products.json";
import { db } from "../firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import styles from "./Mystories.module.scss";

const trips = ["후쿠오카 3박 4일"];
const filters = ["ALL", "POUCH", "FLIGHT", "TECH", "KIT"];
const categories = filters.slice(1);
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
    displayCategory: categories[index % categories.length],
    displayName: fallbackNames[index % fallbackNames.length],
    displayImage: productImageModules[imagePath] || product.image || "",
  };
});

function StoryCard({ title, review }) {
  return <article className={styles.storyCard}>
    <div className={styles.storyImage} aria-hidden="true" />
    <div className={styles.storyInfo}><h2>{title}</h2><p>나만의 여행</p><small>2026.08.17 - 08.20 | 12개 일정</small><footer>
      <Link to="/itinerary">상세 보기</Link>
      <Link className={styles.reviewLink} to="/review" state={{ tripTitle: title, review }}>{review ? "리뷰 수정" : "리뷰 쓰기"}</Link>
    </footer></div>
  </article>;
}

export default function Mystories() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [reviews, setReviews] = useState(() => { try { return JSON.parse(localStorage.getItem(reviewStorageKey)) || []; } catch { return []; } });

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

  const visibleProducts = (selectedFilter === "ALL" ? categorizedProducts : categorizedProducts.filter((product) => product.displayCategory === selectedFilter)).slice(0, 4);

  return <main className={styles.mystories}><div className={styles.content}>
    <section className={styles.stories} aria-labelledby="my-stories-title">
      <MypageBackLink /><p className={styles.eyebrow}>JOURNAL</p><h1 id="my-stories-title">MY<span className={styles.mobileBreak}><br /></span> STORIES</h1><p className={styles.description}>나만의 여행을 위해 남긴 글</p><div className={styles.divider} />
      <div className={styles.storyList}>{trips.map((title) => <StoryCard key={title} title={title} review={reviews.find((item) => item.tripTitle === title)} />)}</div>
      <div className={styles.storyDots} aria-hidden="true"><i /><i /><i /></div>
    </section>
    <section className={styles.shopping} aria-label="리뷰 가능한 상품">
      <div className={styles.filters}>{filters.map((filter) => <button className={selectedFilter === filter ? styles.selected : ""} type="button" aria-pressed={selectedFilter === filter} onClick={() => setSelectedFilter(filter)} key={filter}>{filter}</button>)}</div>
      <div className={styles.productGrid}>{visibleProducts.map((product) => <article className={styles.productCard} key={product.id}>
        <div
          className={styles.productImage}
          role={product.displayImage ? "img" : undefined}
          aria-label={product.displayImage ? `${product.displayName} 상품 이미지` : undefined}
          aria-hidden={product.displayImage ? undefined : "true"}
          style={product.displayImage ? { backgroundImage: `url("${product.displayImage}")`, backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundSize: "cover" } : undefined}
        /><h2>{product.displayName}</h2><small>{Number(product.price).toLocaleString("ko-KR")}원</small><p>평점 <span>★ ★ ★ ★ ★</span></p>
        <footer><Link to={`/shop/${product.id}`}>상품 보기</Link><Link to="/review" state={{ productName: product.displayName }}>리뷰 쓰기</Link></footer>
      </article>)}</div>
      <Link className={styles.pagination} to="/shop">SHOP 더 보기 <span aria-hidden="true">→</span></Link>
    </section>
  </div></main>;
}
