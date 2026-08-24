import styles from "./Itinerary.module.scss";

export default function Itinerary() {
  return (
    <main className={styles.itinerary}>
      <div className={styles.content}>
        <section className={styles.intro} aria-labelledby="upcoming-trip-title">
          <p className={styles.eyebrow}>MY JOURNEY</p>
          <div className={styles.titleRow}>
            <h1 id="upcoming-trip-title">UPCOMING<br />TRIP</h1>
            <p>다음 여행을 위해 저장해둔 장소</p>
          </div>
          <div className={styles.divider} />

          <div className={styles.quickCards}>
            <article className={styles.countCard}>
              <h2>D-Day<br />count</h2>
              <p>가장 가까운 일정을<br />쉽게 볼 수 있어요.</p>
            </article>
            <article className={styles.packingCard}>
              <p>챙길 물건도 빠지지 않게<br />가져갈 수 있어요.</p>
              <h2>Packing<br />List</h2>
            </article>
          </div>
        </section>

        <section className={styles.tripArea} aria-label="다가오는 여행">
          <button className={`${styles.arrow} ${styles.previous}`} type="button" aria-label="이전 여행">‹</button>
          <article className={styles.tripCard}>
            <div className={styles.photo} aria-hidden="true">
              <span>D-12</span>
            </div>
            <div className={styles.tripInfo}>
              <h2>후쿠오카 3박 4일</h2>
              <p className={styles.subtitle}>나만의 여행</p>
              <p className={styles.date}>2026.08.17 - 08.20&nbsp; | &nbsp;12개 일정</p>
              <button className={styles.detailButton} type="button">일정 상세 보기</button>
            </div>
          </article>
          <button className={`${styles.arrow} ${styles.next}`} type="button" aria-label="다음 여행">›</button>
        </section>
      </div>
    </main>
  );
}
