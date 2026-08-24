import styles from "./Mystories.module.scss";

const trips = ["후쿠오카 3박 4일", "후쿠오카 3박 4일"];
const products = [
  { name: "여행용 키트", price: "22,000원", review: "평점" },
  { name: "멀티 어댑터", price: "호텔 패키지", review: "평점" },
  { name: "여행용 키트", price: "22,000원", review: "평점" },
  { name: "멀티 어댑터", price: "호텔 패키지", review: "평점" },
];

function StoryCard({ title }) {
  return (
    <article className={styles.storyCard}>
      <div className={styles.storyImage} aria-hidden="true" />
      <div className={styles.storyInfo}>
        <h2>{title}</h2>
        <p>나만의 여행</p>
        <small>2026.08.17 - 08.20 | 12개 일정</small>
        <footer>
          <button type="button">상세 보기</button>
          <button type="button">리뷰쓰기</button>
        </footer>
      </div>
    </article>
  );
}

export default function Mystories() {
  return (
    <main className={styles.mystories}>
      <div className={styles.content}>
        <section className={styles.stories} aria-labelledby="my-stories-title">
          <p className={styles.eyebrow}>MY JOURNEY</p>
          <h1 id="my-stories-title">MY STORIES</h1>
          <p className={styles.description}>나만의 여행을 위해 남긴 글</p>
          <div className={styles.divider} />
          <div className={styles.storyList}>{trips.map((title, index) => <StoryCard key={index} title={title} />)}</div>
        </section>

        <section className={styles.shopping} aria-labelledby="shopping-title">
          <h1 id="shopping-title">SHOPPING</h1>
          <p>잊어버리고 못 산 물건이 있지는 않았나요?</p>
          <div className={styles.filters}>
            {["ALL", "POUCH", "FLIGHT", "TECH", "KIT"].map((filter, index) => <button className={index === 0 ? styles.selected : ""} type="button" key={filter}>{filter}</button>)}
          </div>
          <div className={styles.productGrid}>
            {products.map((product, index) => (
              <article className={styles.productCard} key={`${product.name}-${index}`}>
                <div className={styles.productImage} aria-hidden="true" />
                <h2>{product.name}</h2>
                <small>{product.price}</small>
                <p>{product.review} <span>★ ★ ★ ★ ★</span></p>
                <footer><button type="button">상품 보기</button><button type="button">리뷰 쓰기</button></footer>
              </article>
            ))}
          </div>
          <div className={styles.pagination} aria-hidden="true">● ● ●</div>
        </section>
      </div>
    </main>
  );
}
