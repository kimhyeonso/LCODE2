import MypageBackLink from "../components/MypageBackLink";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useManagedCollection } from "../hooks/useManagedCollection";
import { getUserCoupons } from "../services/firestoreService";
import { getCouponStorageKey } from "../data/eventCoupons";
import styles from "./Coupon.module.scss";

const coupons = [
  { type: "SPECIAL EVENT", title: "PACK & WIN", description: "여행 짐싸고 쿠폰받자!", code: "TC-0056", expiry: "VALID UNTIL 2026.08.31" },
  { type: "L:CODE", title: "5%", suffix: "OFF", description: "FLIGHT KIT", detail: "여행 키트", code: "TC-0034", expiry: "VALID UNTIL 2026.10.15" },
  { type: "L:CODE", title: "10%", suffix: "OFF", description: "TRAVEL GOODS", detail: "여행 상품", code: "TC-0041", expiry: "VALID UNTIL 2026.12.31" },
];

const COUPONS_PER_PAGE = 3;
// 쿠폰함 맨 위에 고정되는 "가차 돌리기" 홍보 쿠폰(TC-0056)의 배너 슬라이드 이미지입니다.
const PROMO_COUPON_CODE = "TC-0056";
const GACHA_SLIDE_INTERVAL = 4000;
const gachaCouponSlides = [
  { image: "/Mypage-img/couponBanner01.png", to: "/event?event=gacha", label: "가챠 이벤트로 이동" },
  { image: "/Mypage-img/couponBanner02.png", to: "/event?event=mystery", label: "비행기 사건 이벤트로 이동" },
  { image: "/Mypage-img/couponBanner03.png", to: "/event?event=magazine", label: "리뷰 매거진 이벤트로 이동" },
];

function CouponTicket({ coupon }) {
  // 가차 이벤트에서 실제로 당첨된 쿠폰(source: "event")은 일반 쿠폰 티켓으로 표시하고,
  // 홍보용 "가차 돌리기" 쿠폰만 배너 슬라이드가 있는 이벤트 티켓으로 렌더링합니다.
  const isPromoCoupon = coupon.code === PROMO_COUPON_CODE;
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (!isPromoCoupon) return undefined;
    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % gachaCouponSlides.length);
    }, GACHA_SLIDE_INTERVAL);
    return () => window.clearInterval(timer);
  }, [isPromoCoupon]);

  const displayCoupon = isPromoCoupon
    ? { ...coupon, type: "EVENT", title: "가차 돌리기", description: "가차 돌리고 쿠폰받자!" }
    : coupon;
  return (
    <article
      className={`${styles.ticket} ${displayCoupon.used ? styles.used : ""} ${isPromoCoupon ? styles.eventTicket : ""}`}
    >
      {isPromoCoupon && (
        <div className={styles.eventSlides}>
          {gachaCouponSlides.map((slide, index) => (
            <Link
              className={index === slideIndex ? styles.activeSlide : ""}
              key={slide.image}
              to={slide.to}
              aria-label={slide.label}
            >
              <img src={slide.image} alt="" decoding="async" />
            </Link>
          ))}
        </div>
      )}
      {!isPromoCoupon && (
        <>
      <div className={styles.ticketBody}>
        <p className={styles.ticketType}>{displayCoupon.type}</p>
        {displayCoupon.used && <span className={styles.usedLabel}>USED</span>}
        <h2>{displayCoupon.title} {displayCoupon.suffix && <small>{displayCoupon.suffix}</small>}</h2>
        <p className={styles.ticketDescription}>{displayCoupon.description}</p>
        {displayCoupon.detail && <p className={styles.detail}>{displayCoupon.detail}</p>}
        {!coupon.used && <span className={styles.cut}>✂<small>USE<br />COUPON</small></span>}
      </div>
      <footer><span>{displayCoupon.code}</span><span>{displayCoupon.expiry}</span></footer>
        </>
      )}
    </article>
  );
}

export default function Coupon() {
  const managedCoupons = useManagedCollection("coupons", [
    { id: "coupon-welcome", type: "L:CODE SHOP", title: "3,000", suffix: "KRW OFF", description: "쇼핑몰 전용", code: "TC-0012", expiry: "VALID UNTIL 2026.09.30" },
    ...coupons,
  ]);
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
  // "쇼핑몰 전용"(TC-0012) 웰컴 쿠폰은 더 이상 상단에 고정하지 않고 일반 보유 쿠폰 목록에 포함합니다.
  const ownedCoupons = useMemo(
    () => [...managedCoupons, ...registeredCoupons],
    [managedCoupons, registeredCoupons],
  );
  // "가차 돌리기" 홍보 쿠폰은 목록 맨 위에 고정하고, 페이지네이션 대상에서는 제외합니다.
  const promoCoupon = ownedCoupons.find((coupon) => coupon.code === PROMO_COUPON_CODE);
  const listCoupons = useMemo(
    () => ownedCoupons.filter((coupon) => coupon.code !== PROMO_COUPON_CODE),
    [ownedCoupons],
  );
  const availableCount = listCoupons.filter((coupon) => !coupon.used).length;
  const pageCount = Math.max(1, Math.ceil(listCoupons.length / COUPONS_PER_PAGE));
  const pageCoupons = listCoupons.slice(
    (currentPage - 1) * COUPONS_PER_PAGE,
    currentPage * COUPONS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  useEffect(() => {
    const registeredCouponCode = state?.registeredCouponCode;
    if (!registeredCouponCode) return;

    const registeredIndex = listCoupons.findIndex(
      (coupon) => coupon.code === registeredCouponCode,
    );
    if (registeredIndex >= 0) {
      const targetPage = Math.floor(registeredIndex / COUPONS_PER_PAGE) + 1;
      queueMicrotask(() => setCurrentPage(targetPage));
    }
  }, [state?.registeredCouponCode, listCoupons]);

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
          <p className={styles.description}>보유한 쿠폰과 사용 가능한 혜택을 확인해보세요.</p>
          <div className={styles.divider} />
          {promoCoupon && <CouponTicket coupon={promoCoupon} key="promo" />}
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
