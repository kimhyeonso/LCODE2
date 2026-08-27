import { Link, useParams } from "react-router-dom";
import products from "../data/products.json";
import styles from "./Page.module.scss";
export default function ProductDetailPage() {
  const { productId } = useParams();
  const p = products.find((x) => x.id === productId);
  if (!p)
    return (
      <main className={styles.empty}>
        <h1>여행을 찾을 수 없어요.</h1>
        <Link to="/products">목록으로 돌아가기 →</Link>
      </main>
    );
  return (
    <main className={styles.detail}>
      <div className={`${styles.detailArt} ${styles[p.tone]}`}>
        <span>{p.city}</span>
        <b>{p.city[0]}</b>
      </div>
      <div className={styles.detailCopy}>
        <small>
          {p.tag} / {p.country}
        </small>
        <h1>{p.title}</h1>
        <p>{p.summary}</p>
        <dl>
          <div>
            <dt>기간</dt>
            <dd>{p.days}</dd>
          </div>
          <div>
            <dt>가격</dt>
            <dd>{p.price.toLocaleString()}원부터</dd>
          </div>
          <div>
            <dt>스타일</dt>
            <dd>느긋한 발견 · 로컬 큐레이션</dd>
          </div>
        </dl>
        <h2>ITINERARY / HIGHLIGHTS</h2>
        <ol>
          {p.spots.map((s, i) => (
            <li key={s}>
              <span>0{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <Link className={styles.cta} to="/travel-planner">
          이 일정으로 시작하기 →
        </Link>
      </div>
    </main>
  );
}
