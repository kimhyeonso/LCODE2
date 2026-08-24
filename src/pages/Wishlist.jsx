import styles from "./Wishlist.module.scss";

const places = [
  { location: "FUKUOKA / JAPAN", name: "나가스 야타이", category: "FOOD" },
  { location: "FUKUOKA / JAPAN", name: "캐널시티 하카타", category: "SHOPPING" },
  { location: "KYOTO / JAPAN", name: "후시미 이나리", category: "SHRINE" },
  { location: "TOKYO / JAPAN", name: "블루보틀 카페", category: "CAFE" },
];

export default function Wishlist() {
  return (
    <main className={styles.wishlist}>
      <section className={styles.content} aria-labelledby="wish-list-title">
        <p className={styles.eyebrow}>MY JOURNEY</p>
        <h1 id="wish-list-title">WISH LIST</h1>
        <p className={styles.description}>다음 여행을 위해 저장해둔 장소</p>
        <div className={styles.divider} />

        <div className={styles.placeGrid}>
          {places.map((place) => (
            <article className={styles.placeCard} key={place.name}>
              <div className={styles.imagePlaceholder} aria-hidden="true">
                <span>♥</span>
              </div>
              <p className={styles.location}>{place.location}</p>
              <h2>{place.name}</h2>
              <footer>
                <span>{place.category}</span>
                <button type="button">+ 일정에 추가</button>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
