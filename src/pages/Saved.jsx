import { Link } from "react-router-dom";
import products from "../data/products.json";
import ProductCard from "../components/ProductCard";
import { useShop } from "../hooks/useShop";
import styles from "./Shop.module.scss";
export default function Saved() { const { saved } = useShop(); const items = products.filter((product) => saved.includes(product.id)); return <main className={styles.simplePage}><span>MY SHOP</span><h1>SAVED<br />ITEMS</h1><p className={styles.ruleLabel}>{items.length} ITEMS</p>{items.length ? <div className={styles.productGrid}>{items.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className={styles.empty}><p>아직 찜한 상품이 없습니다.</p><Link to="/shop">상품 보러 가기 →</Link></div>}</main>; }
