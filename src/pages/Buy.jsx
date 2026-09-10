import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import MypageBackLink from "../components/MypageBackLink";
import styles from "./Buy.module.scss";
import { db } from "../firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import { eligibleProducts, getPurchaseOrders } from "../services/purchaseHistory";
import { enrichShopProduct, resolveProductImage } from "../utils/shopProductResolver";

const filters = ["전체", "배송 준비", "배송 중", "배송 완료"];
const PAGE_SIZE = 3;
const reviewStorageKey = "lcode-saved-reviews";

function readLocalReviewedIds(uid) {
  if (typeof window === "undefined" || !uid) return [];
  try {
    const stored = JSON.parse(localStorage.getItem(reviewStorageKey) || "[]");
    return Array.isArray(stored)
      ? stored.filter((review) => review.userId === uid && review.productId).map((review) => String(review.productId))
      : [];
  } catch {
    return [];
  }
}

function orderRows(savedOrders, uid, reviewedIds = new Set()) {
    const eligibleIds = new Set(eligibleProducts(savedOrders, uid).map((product) => String(product.id)));
    return savedOrders.flatMap((savedOrder) =>
      (savedOrder.items || []).map((item, index) => {
      const product = enrichShopProduct(item);
      const productId = String(product.id || item.id);
      const reviewed = reviewedIds.has(productId);
      return {
      id: savedOrder.orderNumber || `LC-${index + 1}`,
      productId: product.id || item.id,
      date: new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(savedOrder.orderedAt || Date.now())).replaceAll(". ", ".").replace(/\.$/, ""),
      name: product.name || item.name,
      option: `${item.option?.label || "기본 옵션"} / ${item.quantity || 1}개`,
      price: (Number(item.price) + Number(item.option?.extraPrice || 0)) * Number(item.quantity || 1),
      status: savedOrder.status || "배송 준비",
      // Every order line shows a review box: a reviewed product keeps "리뷰 완료"
      // regardless of the 30-day window, an unreviewed one shows "리뷰 쓰기"
      // while it is still eligible.
      reviewDone: reviewed,
      canReview: !reviewed && eligibleIds.has(productId),
      // Firestore order records store the image URL resolved at purchase
      // time, which 404s once local assets are re-hashed (e.g. the
      // png/jpg -> webp conversion). Re-resolve against today's catalog.
      image: resolveProductImage(item),
      };
    }),
  );
}

export default function Buy() {
  const { user } = useAuth();
  const [savedOrders, setSavedOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");
  const [ordersLoading, setOrdersLoading] = useState(true);
  useEffect(() => {
    let active = true;
    if (!user?.uid) return;
    getPurchaseOrders(user.uid).then((orders) => { if (active) setSavedOrders(orders); })
      .catch(() => { if (active) setOrdersError("주문 내역을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."); })
      .finally(() => { if (active) setOrdersLoading(false); });
    return () => { active = false; };
  }, [user?.uid]);
  const [reviewedProductIds, setReviewedProductIds] = useState(() => new Set());
  useEffect(() => {
    let active = true;
    if (!user?.uid) return undefined;
    // Firestore's `reviews` collection is the source of truth for "was this
    // product reviewed" (one doc per user+product). The local cache is only a
    // fallback for when that read fails, since it can keep stale entries for
    // reviews that were deleted on another device.
    const loadReviewedIds = () => {
      const localIds = readLocalReviewedIds(user.uid);
      Promise.resolve(db
        ? getDocs(query(collection(db, "reviews"), where("userId", "==", user.uid)))
          .then((snapshot) => snapshot.docs.map((entry) => entry.data().productId).filter(Boolean).map(String))
        : localIds)
        .then((ids) => { if (active) setReviewedProductIds(new Set(ids)); })
        .catch(() => { if (active) setReviewedProductIds(new Set(localIds)); });
    };
    loadReviewedIds();
    // Deleting or writing a review on the 나의 리뷰 page fires this, so the
    // "리뷰 완료 / 리뷰 쓰기" badges here flip without a manual refresh.
    window.addEventListener("product-reviews-changed", loadReviewedIds);
    return () => {
      active = false;
      window.removeEventListener("product-reviews-changed", loadReviewedIds);
    };
  }, [user?.uid]);
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [page, setPage] = useState(1);
  const orders = useMemo(() => orderRows(savedOrders.filter((order) => order.userId === user?.uid), user?.uid, reviewedProductIds), [savedOrders, user?.uid, reviewedProductIds]);
  const filteredOrders = useMemo(() => selectedFilter === "전체" ? orders : orders.filter((order) => order.status === selectedFilter), [orders, selectedFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const visibleOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changeFilter = (filter) => { setSelectedFilter(filter); setPage(1); };

  // Right rail follows scroll the same way Cart.jsx's summary box does:
  // it rests aligned with the filter row, sticks while scrolling, and
  // stops once it reaches the bottom of the pagination controls.
  const sideRailRef = useRef(null);
  const sideBoxRef = useRef(null);
  const filtersRef = useRef(null);
  const orderListRef = useRef(null);
  const paginationRef = useRef(null);
  const scrollFrameRef = useRef(null);

  useEffect(() => {
    const rail = sideRailRef.current;
    const box = sideBoxRef.current;
    const filtersEl = filtersRef.current;
    if (!rail || !box || !filtersEl) return undefined;

    const TOP_GAP = 24;

    const updatePosition = () => {
      if (window.innerWidth <= 900) {
        rail.style.minHeight = "";
        box.style.position = "static";
        box.style.top = "";
        box.style.left = "";
        box.style.width = "";
        return;
      }

      const railRect = rail.getBoundingClientRect();
      const filtersRect = filtersEl.getBoundingClientRect();
      const startOffset = filtersRect.top - railRect.top;
      const boxHeight = box.offsetHeight;
      rail.style.minHeight = `${startOffset + boxHeight}px`;

      const resetBox = () => {
        box.style.position = "absolute";
        box.style.top = `${startOffset}px`;
        box.style.bottom = "auto";
        box.style.left = "0px";
        box.style.width = "100%";
        box.style.zIndex = "20";
      };

      if (filtersRect.top > TOP_GAP) {
        resetBox();
        return;
      }

      const bottomEl = paginationRef.current || orderListRef.current;
      const listBottom = bottomEl?.getBoundingClientRect().bottom ?? railRect.bottom;
      const stopTop = Math.max(startOffset, listBottom - railRect.top - boxHeight);
      const shouldStop = railRect.top + stopTop <= TOP_GAP;

      if (shouldStop) {
        box.style.position = "absolute";
        box.style.top = `${stopTop}px`;
        box.style.bottom = "auto";
        box.style.left = "0px";
        box.style.width = "100%";
        box.style.zIndex = "20";
        return;
      }

      box.style.position = "fixed";
      box.style.top = `${TOP_GAP}px`;
      box.style.bottom = "auto";
      box.style.left = `${railRect.left}px`;
      box.style.width = `${railRect.width}px`;
      box.style.zIndex = "30";
    };

    const handleScroll = () => {
      if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = requestAnimationFrame(updatePosition);
    };

    updatePosition();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => handleScroll());
      resizeObserver.observe(box);
      if (orderListRef.current) resizeObserver.observe(orderListRef.current);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      resizeObserver?.disconnect();
      if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [visibleOrders.length, pageCount]);

  return (
    <main className={styles.buyPage}>
      <div className={styles.content}>
        <section className={styles.main}>
          <MypageBackLink />
          <p className={styles.eyebrow}>MY L:CODE</p>
          <header className={styles.titleRow}><h1>SHOPPING ORDERS</h1><p>주문한 여행 상품을 한눈에 확인해보세요.</p></header>
          <div className={styles.filters} aria-label="배송 상태 필터" ref={filtersRef}>
            {filters.map((filter) => <button className={selectedFilter === filter ? styles.active : ""} type="button" onClick={() => changeFilter(filter)} key={filter}>{filter}</button>)}
          </div>
          <div className={styles.orderList} ref={orderListRef}>
            {ordersLoading && user && <p role="status">주문 내역을 불러오고 있어요.</p>}
            {ordersError && <p role="alert">{ordersError}</p>}
            {visibleOrders.map((order) => (
              <article className={styles.orderCard} key={`${order.id}-${order.productId}`}>
                <div className={styles.orderMeta}><span>주문일</span><strong>{order.date}</strong><span>주문번호</span><strong>{order.id}</strong></div>
                {order.image ? <img loading="lazy" className={styles.orderImage} src={order.image} alt={order.name} /> : <div className={styles.orderImage} aria-hidden="true" />}
                <div className={styles.orderInfo}><h2>{order.name}</h2><p>{order.option}</p><strong>{order.price.toLocaleString("ko-KR")}원</strong></div>
                <div className={styles.orderActionsRow}><span className={styles.status}>{order.status}</span><div className={styles.orderButtons}><Link to={`/shop/${order.productId}`}>상품 상세</Link>{order.reviewDone ? <span className={styles.reviewDone}>리뷰 완료</span> : order.canReview && <Link className={styles.reviewLink} to={`/review?productId=${encodeURIComponent(order.productId)}`} state={{ productName: order.name }}>리뷰 쓰기</Link>}</div></div>
              </article>
            ))}
            {!ordersLoading && !ordersError && !visibleOrders.length && <div className={styles.emptyState}><p>{orders.length ? "해당 배송 상태의 주문이 없어요." : "주문한 상품이 아직 존재하지 않아요."}</p><Link to="/shop">상품 보러가기 <span aria-hidden="true">→</span></Link></div>}
          </div>
          {filteredOrders.length > PAGE_SIZE && <nav className={styles.pagination} aria-label="주문 페이지" ref={paginationRef}>
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>←</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button className={page === number ? styles.current : ""} type="button" onClick={() => setPage(number)} key={number}>{number}</button>)}
            <button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>→</button>
          </nav>}
        </section>
        <aside className={styles.side} ref={sideRailRef}>
          <div className={styles.sideBox} ref={sideBoxRef}>
            <figure className={styles.heroFrame}><img loading="lazy" src="/Buy-img/order-hero.webp" alt="여행용품 컬렉션" /></figure>
            <section className={styles.snapshot}><h2>ORDER SNAPSHOT</h2><div className={styles.snapshotGrid}><div><span>총 주문</span><strong>{orders.length}</strong></div><div><span>배송 중</span><strong>{orders.filter((order) => order.status === "배송 중").length}</strong></div><div><span>리뷰 가능 상품</span><strong>{orders.filter((order) => order.canReview).length}</strong></div></div></section>
          </div>
        </aside>
        <section className={styles.contactBox} aria-label="주문 관련 문의">
          <div className={styles.contactIcon}><img loading="lazy" src="/Mypage-img/set.svg" alt="" /></div>
          <div className={styles.contactCopy}><h2>주문 관련 문의가 있으신가요?</h2><p>평일 10:00–18:00&nbsp;&nbsp;·&nbsp;&nbsp;hello@lcode.travel</p></div>
          <Link to="/contact">문의하기 <span aria-hidden="true">→</span></Link>
        </section>
      </div>
    </main>
  );
}
