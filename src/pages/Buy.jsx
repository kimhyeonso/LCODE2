import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Buy.module.scss";

const filters = ["전체", "배송 준비", "배송 중", "배송 완료"];
const orders = [
  { id: "LC-20394", date: "2026.08.18", name: "여행용 키트", option: "아이보리 / 1개", price: 22200, status: "배송 완료", image: "/Buy-img/travel-kit.png", action: "리뷰 작성" },
  { id: "LC-20351", date: "2026.08.12", name: "멀티 어댑터", option: "화이트 / 1개", price: 38000, status: "배송 중", image: "/Buy-img/adapter.png", action: "배송 조회" },
  { id: "LC-20288", date: "2026.08.03", name: "캐리어 커버", option: "아이보리 / 1개", price: 19000, status: "배송 준비", image: "/Buy-img/luggage-cover.png", action: "주문 취소" },
  { id: "LC-20241", date: "2026.07.29", name: "여행용 키트", option: "아이보리 / 1개", price: 22200, status: "배송 완료", image: "/Buy-img/travel-kit.png", action: "리뷰 작성" },
  { id: "LC-20196", date: "2026.07.18", name: "멀티 어댑터", option: "화이트 / 1개", price: 38000, status: "배송 완료", image: "/Buy-img/adapter.png", action: "리뷰 작성" },
  { id: "LC-20120", date: "2026.07.02", name: "캐리어 커버", option: "아이보리 / 1개", price: 19000, status: "배송 완료", image: "/Buy-img/luggage-cover.png", action: "리뷰 작성" },
];

const PAGE_SIZE = 3;

export default function Buy() {
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [page, setPage] = useState(1);
  const filteredOrders = useMemo(
    () => selectedFilter === "전체" ? orders : orders.filter((order) => order.status === selectedFilter),
    [selectedFilter],
  );
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const visibleOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const changeFilter = (filter) => {
    setSelectedFilter(filter);
    setPage(1);
  };

  return (
    <main className={styles.buyPage}>
      <div className={styles.content}>
        <section className={styles.main}>
          <Link className={styles.back} to="/my"><span aria-hidden="true">←</span> BACK</Link>
          <p className={styles.eyebrow}>MY L:CODE</p>
          <header className={styles.titleRow}>
            <h1>SHOPPING ORDERS</h1>
            <p>주문한 여행 상품을 한눈에 확인해보세요.</p>
          </header>

          <div className={styles.filters} aria-label="배송 상태 필터">
            {filters.map((filter) => (
              <button className={selectedFilter === filter ? styles.active : ""} type="button" onClick={() => changeFilter(filter)} key={filter}>{filter}</button>
            ))}
          </div>

          <div className={styles.orderList}>
            {visibleOrders.map((order) => (
              <article className={styles.orderCard} key={order.id}>
                <div className={styles.orderMeta}>
                  <span>주문일</span><strong>{order.date}</strong>
                  <span>주문번호</span><strong>{order.id}</strong>
                </div>
                <img className={styles.orderImage} src={order.image} alt={order.name} />
                <div className={styles.orderInfo}>
                  <h2>{order.name}</h2><p>{order.option}</p><strong>{order.price.toLocaleString("ko-KR")}원</strong>
                </div>
                <div className={styles.orderActions}>
                  <span className={styles.status}>{order.status}</span>
                  <button type="button">주문 상세</button><button type="button">{order.action}</button>
                </div>
              </article>
            ))}
          </div>

          <nav className={styles.pagination} aria-label="주문 페이지">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>‹</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button className={page === number ? styles.current : ""} type="button" onClick={() => setPage(number)} key={number}>{number}</button>
            ))}
            <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>›</button>
          </nav>
        </section>

        <aside className={styles.side}>
          <div className={styles.stamp} aria-hidden="true" />
          <figure className={styles.heroFrame}><img src="/Buy-img/order-hero.png" alt="여행용품 컬렉션" /></figure>
          <p className={styles.sideLabel}>CURATED SHOP · JOURNEY READY</p>
          <section className={styles.snapshot}>
            <h2>ORDER SNAPSHOT</h2>
            <div className={styles.snapshotGrid}>
              <div><span>총 주문</span><strong>12</strong></div>
              <div><span>배송 중</span><strong>2</strong></div>
              <div><span>리뷰 가능</span><strong>1</strong></div>
            </div>
          </section>
          <section className={styles.contactBox}>
            <div className={styles.contactIcon}><img src="/Mypage-img/set.svg" alt="" /></div>
            <div><p>주문 관련 문의는<br />고객센터에서 확인하실 수 있습니다.</p><Link to="/contact">고객센터 바로가기 <span>→</span></Link></div>
          </section>
        </aside>
      </div>
    </main>
  );
}
