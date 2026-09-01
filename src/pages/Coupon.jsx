import MypageBackLink from "../components/MypageBackLink";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  COUPON_STORAGE_KEY,
  EVENT_PRIZE_INBOX_KEY,
  eventCouponCatalog,
} from "../data/eventCoupons";
import styles from "./Coupon.module.scss";

const coupons = [
  { type: "SPECIAL EVENT", title: "PACK & WIN", description: "여행 짐싸고 쿠폰받자!", code: "TC-0056", expiry: "VALID UNTIL 2026.08.31", used: true },
  { type: "L:CODE", title: "5%", suffix: "OFF", description: "FLIGHT KIT", detail: "여행 키트", code: "TC-0034", expiry: "VALID UNTIL 2026.10.15" },
];

const COUPONS_PER_PAGE = 3;

function CouponTicket({ coupon, featured = false }) {
  return (
    <article className={`${styles.ticket} ${coupon.used ? styles.used : ""} ${featured ? styles.featured : ""} ${coupon.source === "event" ? styles.eventTicket : ""}`}>
      <div className={styles.ticketBody}>
        <p className={styles.ticketType}>{coupon.type}</p>
        {coupon.used && <span className={styles.usedLabel}>USED</span>}
        <h2>{coupon.title} {coupon.suffix && <small>{coupon.suffix}</small>}</h2>
        <p className={styles.ticketDescription}>{coupon.description}</p>
        {coupon.detail && <p className={styles.detail}>{coupon.detail}</p>}
        {!coupon.used && <span className={styles.cut}>✂<small>USE<br />COUPON</small></span>}
      </div>
      <footer><span>{coupon.code}</span><span>{coupon.expiry}</span></footer>
    </article>
  );
}

export default function Coupon() {
  const { state } = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [registeredCoupons, setRegisteredCoupons] = useState(() => {
    try { return JSON.parse(localStorage.getItem(COUPON_STORAGE_KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    let eventResult;
    try {
      eventResult = JSON.parse(localStorage.getItem(EVENT_PRIZE_INBOX_KEY));
    } catch {
      eventResult = null;
    }

    const template = eventResult && eventCouponCatalog[eventResult.prizeId];
    if (!template) return;

    const eventCoupon = {
      ...template,
      source: "event",
      code: eventResult.claimId,
      wonAt: eventResult.wonAt,
      background: "/event/coupon03.png",
    };

    setRegisteredCoupons((current) => {
      if (current.some((coupon) => coupon.code === eventCoupon.code)) return current;
      const next = [...current, eventCoupon];
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    localStorage.removeItem(EVENT_PRIZE_INBOX_KEY);
  }, []);
  const welcomeCoupon = { type: "L:CODE SHOP", title: "3,000", suffix: "KRW OFF", description: "쇼핑몰 전용", code: "TC-0012", expiry: "VALID UNTIL 2026.09.30" };
  const ownedCoupons = [...coupons, ...registeredCoupons];
  const pageCount = Math.max(1, Math.ceil(ownedCoupons.length / COUPONS_PER_PAGE));
  const pageCoupons = ownedCoupons.slice(
    (currentPage - 1) * COUPONS_PER_PAGE,
    currentPage * COUPONS_PER_PAGE,
  );

  useEffect(() => {
    const registeredCouponCode = state?.registeredCouponCode;
    if (!registeredCouponCode) return;

    const registeredIndex = ownedCoupons.findIndex(
      (coupon) => coupon.code === registeredCouponCode,
    );
    if (registeredIndex >= 0) {
      setCurrentPage(Math.floor(registeredIndex / COUPONS_PER_PAGE) + 1);
    }
  }, [state?.registeredCouponCode, registeredCoupons.length]);

  return (
    <main className={styles.coupon}>
      
      <div className={styles.content}>
        <section className={styles.archive} aria-labelledby="coupon-title">
          <MypageBackLink />
          <div className={styles.archiveHeading}>
            <div>
              <p className={styles.eyebrow}>ARCHIVE</p>
              <h1 id="coupon-title">COUPON ARCHIVE</h1>
            </div>
            <div className={styles.available}><span>AVAILABLE</span><strong>{ownedCoupons.length + 1 < 10 ? `0${ownedCoupons.length + 1}` : ownedCoupons.length + 1}</strong></div>
          </div>
          <p className={styles.description}>나만의 여행을 위해 남긴 글</p>
          <div className={styles.divider} />
          <CouponTicket coupon={welcomeCoupon} featured />
          <Link className={styles.register} to="/coupon/register">쿠폰 등록하기</Link>
        </section>
        <section className={styles.couponList} aria-label="보유 쿠폰">
          {pageCoupons.map((coupon, index) => (
            <CouponTicket coupon={coupon} key={`${coupon.code}-${index}`} />
          ))}
          <nav className={styles.pagination} aria-label="쿠폰 페이지">
            <button
              type="button"
              aria-label="이전 쿠폰 페이지"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >&lt;</button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
              <button
                type="button"
                className={page === currentPage ? styles.activePage : ""}
                aria-current={page === currentPage ? "page" : undefined}
                onClick={() => setCurrentPage(page)}
                key={page}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              aria-label="다음 쿠폰 페이지"
              disabled={currentPage === pageCount}
              onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
            >&gt;</button>
          </nav>
        </section>
      </div>
    </main>
  );
}
