import travelKitImage from "../assets/images/travel_kit.webp";
import travelPouchImage from "../assets/images/travel_pouch.webp";
import travelAdapterImage from "../assets/images/travel_adapter.webp";
import styles from "./Shop.module.scss";

const shopItems = [
  {
    id: "travel-kit",
    name: "TRAVEL KIT",
    koreanName: "여행용 키트",
    description: "여행 중 필요한 작은 도구를 한 번에 챙기는 기본 키트",
    price: 29000,
    image: travelKitImage,
  },
  {
    id: "pouch",
    name: "POUCH",
    koreanName: "트래블 파우치",
    description: "케이블과 세면도구를 깔끔하게 나누어 담는 수납 파우치",
    price: 18000,
    image: travelPouchImage,
  },
  {
    id: "adapter",
    name: "ADAPTER",
    koreanName: "멀티 어댑터",
    description: "여러 국가에서 간편하게 사용할 수 있는 여행용 어댑터",
    price: 24000,
    image: travelAdapterImage,
  },
];

export default function Shop() {
  return (
    <main className={styles.shop}>
      <header className={styles.title}>
        <span>TRAVEL ESSENTIALS / 03</span>
        <h1>
          Pack Light,
          <br />
          <i>Travel Well.</i>
        </h1>
        <p>
          여행의 번거로움은 덜고
          <br />
          필요한 것만 가볍게 챙겨 보세요.
        </p>
      </header>

      <section className={styles.collection} aria-label="여행용품 목록">
        {shopItems.map((item, index) => (
          <article id={item.id} className={styles.card} key={item.id}>
            <div className={styles.visual}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <img src={item.image} alt={item.koreanName} />
            </div>
            <div className={styles.copy}>
              <div>
                <h2>{item.name}</h2>
                <p>{item.koreanName}</p>
              </div>
              <strong>{item.price.toLocaleString()}원</strong>
            </div>
            <p className={styles.description}>{item.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
