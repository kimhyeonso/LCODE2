import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import products from "../data/products.json";
import ProductCard from "../components/ProductCard";
import styles from "./Page.module.scss";
export default function Products() {
  const [params] = useSearchParams();
  const [filter, setFilter] = useState(params.get("country") || "ALL");
  const filtered = useMemo(
    () =>
      filter === "ALL"
        ? products
        : products.filter((p) => p.country === filter),
    [filter],
  );
  return (
    <main className={styles.page}>
      <header className={styles.title}>
        <span>TRAVEL COLLECTION / 06</span>
        <h1>
          떠날 준비가 된<br />
          <i>여행들</i>
        </h1>
        <p>
          잘 짜인 기본 일정에서 시작해
          <br />
          당신의 방식으로 자유롭게 고쳐 쓰세요.
        </p>
      </header>
      <div className={styles.filters} aria-label="국가 필터">
        {["ALL", "KOREA", "JAPAN", "CHINA"].map((x) => (
          <button
            className={filter === x ? styles.selected : ""}
            onClick={() => setFilter(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <div className={styles.productGrid}>
        {filtered.map((p, i) => (
          <ProductCard product={p} index={i} key={p.id} />
        ))}
      </div>
      {!filtered.length && (
        <div className={styles.empty}>아직 준비된 여행이 없습니다.</div>
      )}
    </main>
  );
}
