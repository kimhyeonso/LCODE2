import MypageBackLink from "../components/MypageBackLink";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getUserCoupons } from "../services/firestoreService";
import { getCouponStorageKey } from "../data/eventCoupons";
import styles from "./Coupon.module.scss";

const coupons = [
  { type: "SPECIAL EVENT", title: "PACK & WIN", description: "여행 짐싸고 쿠폰받자!", code: "TC-0056", expiry: "VALID UNTIL 2026.08.31", used: true },
  { type: "L:CODE", title: "5%", suffix: "OFF", description: "FLIGHT KIT", detail: "여행 키트", code: "TC-0034", expiry: "VALID UNTIL 2026.10.15" },
  { type: "L:CODE", title: "10%", suffix: "OFF", description: "TRAVEL GOODS", detail: "여행 상품", code: "TC-0041", expiry: "VALID UNTIL 2026.12.31" },
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
  const { user } = useAuth();
  const { state } = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [registeredCoupons, setRegisteredCoupons] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    const storageKey = getCouponStorageKey(user.uid);
    let localCoupons = [];
    try { localCoupons = JSON.parse(localStorage.getItem(storageKey)) || []; }
    catch { localCoupons = []; }

    getUserCoupons(user.uid)
      .then((firebaseCoupons) => {
        if (!active) return;
        setLoadError("");
        setRegisteredCoupons(() => {
          const merged = [...firebaseCoupons];
          localCoupons.forEach((coupon) => {
            if (!merged.some((item) => item.code === coupon.code)) merged.push(coupon);
          });
          return merged;
        });
      })
      .catch(() => {
        if (!active) return;
        setRegisteredCoupons(localCoupons);
        setLoadError("Firebase 쿠폰을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      });
    return () => { active = false; };
  }, [user]);
  const welcomeCoupon = { type: "L:CODE SHOP", title: "3,000", suffix: "KRW OFF", description: "쇼핑몰 전용", code: "TC-0012", expiry: "VALID UNTIL 2026.09.30" };
  const ownedCoupons = useMemo(
    () => [...coupons, ...registeredCoupons],
    [registeredCoupons],
  );
  const availableCount = [welcomeCoupon, ...ownedCoupons]
    .filter((coupon) => !coupon.used).length;
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
      const targetPage = Math.floor(registeredIndex / COUPONS_PER_PAGE) + 1;
      queueMicrotask(() => setCurrentPage(targetPage));
    }
  }, [state?.registeredCouponCode, ownedCoupons]);

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
            <div className={styles.available}><span>AVAILABLE</span><strong>{String(availableCount).padStart(2, "0")}</strong></div>
          </div>
          <p className={styles.description}>나만의 여행을 위해 남긴 글</p>
          <div className={styles.divider} />
          <CouponTicket coupon={welcomeCoupon} featured />
          <Link className={styles.register} to="/coupon/register">쿠폰 등록하기</Link>
        </section>
        <section className={styles.couponList} aria-label="보유 쿠폰">
          {loadError && <p role="alert">{loadError}</p>}
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
