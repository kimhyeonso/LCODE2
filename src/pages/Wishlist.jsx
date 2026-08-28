import { useState } from "react";
import MypageBackLink from "../components/MypageBackLink";
import styles from "./Wishlist.module.scss";

const places = [
  { location: "FUKUOKA / JAPAN", name: "나가스 야타이", category: "FOOD", image: "/Mypage-img/2.png" },
  { location: "FUKUOKA / JAPAN", name: "캐널시티 하카타", category: "SHOPPING", image: "/Mypage-img/1.png" },
  { location: "KYOTO / JAPAN", name: "후시미 이나리", category: "SHRINE", image: "/Mypage-img/3.png" },
  { location: "TOKYO / JAPAN", name: "블루보틀 카페", category: "CAFE", image: "/Mypage-img/5.png" },
];

export default function Wishlist() {
  // 카드별 하트 상태를 따로 저장해서 한 카드만 바뀌게 합니다.
  const [likedPlaces, setLikedPlaces] = useState([]);

  // 클릭한 장소만 좋아요 목록에 넣거나 다시 뺍니다.
  function toggleLike(name) {
    setLikedPlaces((current) =>
      current.includes(name)
        ? current.filter((placeName) => placeName !== name)
        : [...current, name],
    );
  }

  return (
    <main className={styles.wishlist}>
      <section className={styles.content} aria-labelledby="wish-list-title">
        <MypageBackLink />
        <p className={styles.eyebrow}>MY JOURNEY</p>
        <h1 id="wish-list-title">WISH LIST</h1>
        <p className={styles.description}>다음 여행을 위해 저장해둔 장소</p>
        <div className={styles.divider} />

        <div className={styles.placeGrid}>
          {places.map((place) => {
            const isLiked = likedPlaces.includes(place.name);
            return (
              <article className={styles.placeCard} key={place.name}>
                <div
                  className={styles.imagePlaceholder}
                  style={{ backgroundImage: `url("${place.image}")` }}
                >
                  {/* 하트 뒤에 흰색 원을 깔고, 클릭하면 하트가 커졌다 돌아옵니다. */}
                  <button
                    className={`${styles.heartButton} ${isLiked ? styles.liked : ""}`}
                    type="button"
                    aria-label={isLiked ? "위시리스트에서 삭제" : "위시리스트에 추가"}
                    aria-pressed={isLiked}
                    onClick={() => toggleLike(place.name)}
                  >
                    <span aria-hidden="true">{isLiked ? "♥" : "♥"}</span>
                  </button>
                </div>
                <p className={styles.location}>{place.location}</p>
                <h2>{place.name}</h2>
                <footer>
                  <span>{place.category}</span>
                  <button type="button">+ 일정에 추가</button>
                </footer>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
