import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import products from "../data/products.json";
import { useShop } from "../hooks/useShop";
import styles from "./Shop.module.scss";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const product = products.find((item) => item.id === productId);
  const { addToCart } = useShop();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  if (!product) return <main className={styles.empty}><h1>상품을 찾을 수 없어요.</h1><Link to="/shop">SHOP으로 돌아가기 →</Link></main>;
  const total = product.price * quantity;
  return <main className={styles.detailPage}>
    <div className={styles.detailVisual}><span>{product.category}</span><b>{product.name.slice(0, 1)}</b></div>
    <section className={styles.detailInfo}>
      <small>{product.category} · TRAVEL ESSENTIALS</small><h1>{product.name}</h1><strong>{product.price.toLocaleString()} <em>KRW</em></strong>
      <p>{product.desc}<br />{product.merit}</p><hr /><label>OPTION</label>
      <div className={styles.options}><button className={styles.selected}>기본 / Standard</button><button>선물 포장 / Gift Wrap</button></div>
      <label>QUANTITY</label><div className={styles.quantity}><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button><b>{quantity}</b><button onClick={() => setQuantity(quantity + 1)}>+</button></div>
      <hr /><label>TOTAL</label><strong>{total.toLocaleString()} <em>KRW</em></strong>
      <div className={styles.detailActions}><button onClick={() => { addToCart(product, quantity); setAdded(true); }}>장바구니 담기</button><Link to="/checkout" onClick={() => addToCart(product, quantity)}>바로 구매</Link></div>
    </section>
    <div className={styles.story}><details open><summary>01　 PRODUCT STORY</summary><p>{product.desc}</p></details><details><summary>02　 DETAIL</summary><p>{product.merit}</p></details><details><summary>03　 DELIVERY</summary><p>결제 후 2-3일 내 배송됩니다.</p></details></div>
    {added && <div className={styles.modalBackdrop}><div className={styles.addedModal}><button className={styles.close} onClick={() => setAdded(false)}>×</button><h2>✓　장바구니에 상품을 담았습니다.</h2><p>{product.name} · 기본 세트 · {quantity}개</p><hr /><b>함께 준비하면 좋은 상품</b><div className={styles.miniProducts}>{products.filter((item) => item.id !== product.id).slice(0, 3).map((item) => <div key={item.id}><div className={styles.miniVisual} /><small>{item.category}</small><span>{item.name}</span></div>)}</div><div className={styles.modalActions}><button onClick={() => setAdded(false)}>계속 쇼핑</button><Link to="/cart">장바구니 보기 →</Link></div></div></div>}
  </main>;
}
