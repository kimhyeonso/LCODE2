import MypageBackLink from "../components/MypageBackLink";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import products from "../data/products.json";
import { db } from "../firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import styles from "./Mystories.module.scss";

const trips = ["후쿠오카 3박 4일", "후쿠오카 3박 4일"];
const filters = ["ALL", "POUCH", "FLIGHT", "TECH", "KIT"];
const randomFilters = filters.slice(1);
const reviewStorageKey = "lcode-saved-reviews";
const categorizedProducts = products.map((product) => {
  const randomIndex = [...product.id].reduce((total, character) => total + character.charCodeAt(0), 0) % randomFilters.length;
  return { ...product, displayCategory: randomFilters[randomIndex] };
});

function StoryCard({ title, review }) {
  return (
    <article className={styles.storyCard}>
      <div className={styles.storyImage} aria-hidden="true" />
      <div className={styles.storyInfo}>
        <h2>{title}</h2>
        <p>나만의 여행</p>
        <small>2026.08.17 - 08.20 | 12개 일정</small>
        <footer>
          <button type="button">상세 보기</button>
          <Link className={styles.reviewLink} to="/review" state={{ tripTitle: title, review }}>
            {review ? "리뷰 수정" : "리뷰쓰기"}
          </Link>
        </footer>
      </div>
    </article>
  );
}

export default function Mystories() {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [reviews, setReviews] = useState(() => {
    try { return JSON.parse(localStorage.getItem(reviewStorageKey)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    if (!db || !user?.uid) return;

    getDocs(collection(db, "reviews"))
      .then((snapshot) => {
        const remoteReviews = snapshot.docs
          .map((reviewDoc) => ({ id: reviewDoc.id, ...reviewDoc.data() }))
          .filter((review) => review.userId === user.uid);
        if (!remoteReviews.length) return;

        setReviews((localReviews) => {
          const merged = [...remoteReviews];
          localReviews.forEach((review) => {
            if (!merged.some((item) => item.id === review.id)) merged.push(review);
          });
          localStorage.setItem(reviewStorageKey, JSON.stringify(merged));
          return merged;
        });
      })
      .catch((error) => console.warn("저장된 리뷰를 불러오지 못했습니다.", error));
  }, [user?.uid]);
  const visibleProducts = selectedFilter === "ALL"
    ? categorizedProducts
    : categorizedProducts.filter((product) => product.displayCategory === selectedFilter);

  return (
    <main className={styles.mystories}>
      <div className={styles.content}>
        <section className={styles.stories} aria-labelledby="my-stories-title">
          <MypageBackLink />
          <p className={styles.eyebrow}>MY JOURNEY</p>
          <h1 id="my-stories-title">MY STORIES</h1>
          <p className={styles.description}>나만의 여행을 위해 남긴 글</p>
          <div className={styles.divider} />
          <div className={styles.storyList}>
            {trips.map((title, index) => (
              <StoryCard
                key={index}
                title={title}
                review={reviews.find((item) => item.tripTitle === title)}
              />
            ))}
          </div>
        </section>

        <section className={styles.shopping} aria-labelledby="shopping-title">
          <h1 id="shopping-title">SHOPPING</h1>
          <p>잊어버리고 못 산 물건이 있지는 않았나요?</p>
          <div className={styles.filters}>
            {filters.map((filter) => (
              <button
                className={selectedFilter === filter ? styles.selected : ""}
                type="button"
                aria-pressed={selectedFilter === filter}
                onClick={() => setSelectedFilter(filter)}
                key={filter}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className={styles.productGrid}>
            {visibleProducts.map((product) => (
              <article className={styles.productCard} key={product.id}>
                <div className={styles.productImage} aria-hidden="true" />
                <h2>{product.name}</h2>
                <small>{product.price.toLocaleString("ko-KR")}원</small>
                <p>{product.category}</p>
                <footer><button type="button">상품 보기</button><button type="button">리뷰 쓰기</button></footer>
              </article>
            ))}
          </div>
          <Link className={styles.pagination} to="/shop" aria-label="쇼핑 페이지로 이동">쇼핑 더보기</Link>
        </section>
      </div>
    </main>
  );
}
