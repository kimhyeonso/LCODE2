import { Link } from "react-router-dom";
import styles from "./ProductCard.module.scss";
export default function ProductCard({ product, index = 0 }) {
  return (
    <article className={styles.card}>
      <Link to={`/products/${product.id}`}>
        <div className={`${styles.visual} ${styles[product.tone]}`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <b>{product.city.slice(0, 1)}</b>
          <em>{product.city}</em>
        </div>
        <div className={styles.meta}>
          <small>
            {product.tag} · {product.country}
          </small>
          <h3>{product.title}</h3>
          <p>
            {product.days} · {product.price.toLocaleString()}원
          </p>
        </div>
      </Link>
    </article>
  );
}
