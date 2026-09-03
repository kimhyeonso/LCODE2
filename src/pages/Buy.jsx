import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Buy.module.scss";

const filters = ["전체", "배송 준비", "배송 중", "배송 완료"];
const PAGE_SIZE = 3;

function readOrders() {
  try {
    const savedOrder = JSON.parse(sessionStorage.getItem("lastOrder"));
    if (!savedOrder?.items?.length) return [];
    return savedOrder.items.map((item, index) => ({
      id: savedOrder.orderNumber || `LC-${index + 1}`,
      productId: item.id,
      date: new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(savedOrder.orderedAt || Date.now())).replaceAll(". ", ".").replace(/\.$/, ""),
      name: item.name,
      option: `${item.option?.label || "기본 옵션"} / ${item.quantity || 1}개`,
      price: (Number(item.price) + Number(item.option?.extraPrice || 0)) * Number(item.quantity || 1),
      status: "배송 완료",
      image: item.image,
    }));
  } catch { return []; }
}

export default function Buy() {
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [page, setPage] = useState(1);
  const orders = useMemo(() => readOrders(), []);
  const filteredOrders = useMemo(() => selectedFilter === "전체" ? orders : orders.filter((order) => order.status === selectedFilter), [orders, selectedFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const visibleOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changeFilter = (filter) => { setSelectedFilter(filter); setPage(1); };

  return (
    <main className={styles.buyPage}>
      <div className={styles.content}>
        <section className={styles.main}>
          <Link className={styles.back} to="/my"><span aria-hidden="true">←</span></Link>
          <p className={styles.eyebrow}>MY L:CODE</p>
          <header className={styles.titleRow}><h1>SHOPPING ORDERS</h1><p>주문한 여행 상품을 한눈에 확인해보세요.</p></header>
          <div className={styles.filters} aria-label="배송 상태 필터">
            {filters.map((filter) => <button className={selectedFilter === filter ? styles.active : ""} type="button" onClick={() => changeFilter(filter)} key={filter}>{filter}</button>)}
          </div>
          <div className={styles.orderList}>
            {visibleOrders.map((order) => (
              <article className={styles.orderCard} key={`${order.id}-${order.productId}`}>
                <div className={styles.orderMeta}><span>주문일</span><strong>{order.date}</strong><span>주문번호</span><strong>{order.id}</strong></div>
                {order.image ? <img className={styles.orderImage} src={order.image} alt={order.name} /> : <div className={styles.orderImage} aria-hidden="true" />}
                <div className={styles.orderInfo}><h2>{order.name}</h2><p>{order.option}</p><strong>{order.price.toLocaleString("ko-KR")}원</strong></div>
                <div className={styles.orderActions}><span className={styles.status}>{order.status}</span><Link to={`/shop/${order.productId}`}>상품 상세</Link><Link to="/review" state={{ productName: order.name }}>리뷰 쓰기</Link></div>
              </article>
            ))}
            {!visibleOrders.length && <div className={styles.emptyState}><p>{orders.length ? "해당 배송 상태의 주문이 없어요." : "주문한 상품이 아직 존재하지 않아요."}</p><Link to="/shop">상품 보러가기 <span aria-hidden="true">→</span></Link></div>}
          </div>
          {filteredOrders.length > PAGE_SIZE && <nav className={styles.pagination} aria-label="주문 페이지">
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>←</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button className={page === number ? styles.current : ""} type="button" onClick={() => setPage(number)} key={number}>{number}</button>)}
            <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>→</button>
          </nav>}
        </section>
        <aside className={styles.side}>
          <div className={styles.stamp} aria-hidden="true" /><figure className={styles.heroFrame}><img src="/Buy-img/order-hero.png" alt="여행용품 컬렉션" /></figure><p className={styles.sideLabel}>CURATED SHOP · JOURNEY READY</p>
          <section className={styles.snapshot}><h2>ORDER SNAPSHOT</h2><div className={styles.snapshotGrid}><div><span>총 주문</span><strong>{orders.length}</strong></div><div><span>배송 중</span><strong>0</strong></div><div><span>리뷰 가능</span><strong>{orders.length}</strong></div></div></section>
          <section className={styles.contactBox}><div className={styles.contactIcon}><img src="/Mypage-img/set.svg" alt="" /></div><div><p>주문 관련 문의는<br />고객센터에서 확인할 수 있습니다.</p><Link to="/contact">고객센터 바로가기 <span>→</span></Link></div></section>
        </aside>
      </div>
    </main>
  );
}
