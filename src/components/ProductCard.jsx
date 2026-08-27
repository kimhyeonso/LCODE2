import { Link } from "react-router-dom";
import styles from "../pages/Shop.module.scss";
import { useShop } from "../hooks/useShop";

export default function ProductCard({ product }) {
  const { saved, toggleSaved, addToCart } = useShop();
  const liked = saved.includes(product.id);
  return <article className={styles.productCard}>
    <div className={`${styles.productVisual} ${styles[product.tone]}`}>
      <button className={`${styles.heart} ${liked ? styles.liked : ""}`} onClick={() => toggleSaved(product.id)} aria-label="찜하기">{liked ? "♥" : "♡"}</button>
      <Link to={`/shop/${product.id}`} aria-label={`${product.name} 상세 보기`}><span>{product.category}</span><b>{product.name.slice(0, 1)}</b></Link>
      <button className={styles.cardCart} onClick={() => addToCart(product)} aria-label="장바구니 담기">+</button>
    </div>
    <div className={styles.productMeta}><small>{product.category}</small><Link to={`/shop/${product.id}`}><h3>{product.name}</h3></Link><p>{product.price.toLocaleString()} KRW</p></div>
  </article>;
}
