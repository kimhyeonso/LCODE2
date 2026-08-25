import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import products from "../data/products.json";
import ProductCard from "../components/ProductCard";
import { useShop } from "../hooks/useShop";
import styles from "./Shop.module.scss";

export default function Products() {
  const [category, setCategory] = useState("ALL");
  const [query, setQuery] = useState("");
  const { cart } = useShop();
  const categories = useMemo(() => ["ALL", ...new Set(products.map((product) => product.category))], []);
  const filtered = useMemo(() => products.filter((product) => (category === "ALL" || product.category === category) && product.name.includes(query)), [category, query]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <main className={styles.shopPage}>
    <header className={styles.shopHero}><div><span>L:CODE SELECTION</span><h1>FLIGHT<br />KIT</h1><p>여행을 더 가볍게 만드는<br />TRAVEL ESSENTIALS</p><Link to="#items">VIEW ALL →</Link></div><aside><Link to="/saved">♡ SAVED</Link><Link to="/cart">CART <b>{cartCount}</b></Link></aside></header>
    <section id="items" className={styles.catalog}><div className={styles.categoryBar}>{categories.map((item) => <button key={item} className={category === item ? styles.selected : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><div className={styles.sectionLabel}><span>ESSENTIALS</span><span>{filtered.length} ITEMS</span></div><label className={styles.search}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="상품명을 검색해보세요" /><small>SEARCH</small></label><div className={styles.productGrid}>{filtered.map((product) => <ProductCard product={product} key={product.id} />)}</div>{!filtered.length && <p className={styles.empty}>검색 결과가 없습니다.</p>}</section>
    {cart.length > 0 && <aside className={styles.quickCart}><small>QUICK CART</small><div><span className={styles.quickVisual} /><b>{cart[cart.length - 1].name}<em>{cart[cart.length - 1].price.toLocaleString()} KRW · {cart[cart.length - 1].quantity}개</em></b><Link to="/cart">장바구니 보기 →</Link></div></aside>}
  </main>;
}
