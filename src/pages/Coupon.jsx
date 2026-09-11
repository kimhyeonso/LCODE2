import MypageBackLink from "../components/MypageBackLink";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState, useRef, useId } from "react";
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

const gachaPrizeImages = {
  "event-first": "/event/event02/coupon01.svg",
  "event-second": "/event/event02/coupon02.webp",
  "event-third": "/event/event02/coupon03.webp",
  "event-fourth": "/event/event02/coupon04.webp",
};

const EVENT_COUPON_STORAGE_KEY = "lcode-event-coupons";

function readCouponList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
  } catch {
    return [];
  }
}

function readLocalCoupons(userId) {
  if (!userId) return [];
  const registered = readCouponList(getCouponStorageKey(userId));
  const eventCoupons = readCouponList(EVENT_COUPON_STORAGE_KEY)
    .filter((item) => item.userId === userId && item.rewardId === "mystery-airplane-starbucks")
    .map((item) => ({
      ...item,
      type: "CASE SOLVED REWARD",
      title: item.name || "스타벅스 쿠폰",
      description: item.description || "아메리카노 1잔",
      code: item.code || "MYSTERY-CASE-01-" + userId,
      used: item.used === true || item.status === "used",
      expiry: item.expiry || "DEMO REWARD",
    }));
  return [...eventCoupons, ...registered];
}

function mergeCoupons(...lists) {
  const seen = new Set();
  return lists.flat().filter((item) => {
    const key = item.code || item.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const demoNumbers = new Map();

function getGiftNumber(userId, coupon) {
  const reward = coupon.rewardId || coupon.eventId || coupon.id || coupon.code;
  const key = `lcode-gift-number:${userId}:${reward}`;
  if (demoNumbers.has(key)) return demoNumbers.get(key);
  let saved;
  try { saved = localStorage.getItem(key); } catch { /* Session fallback. */ }
  if (!/^\d{12}$/.test(saved || "")) {
    const values = new Uint32Array(3);
    crypto.getRandomValues(values);
    saved = Array.from(values, (value) => String(value % 10000).padStart(4, "0")).join("");
    try { localStorage.setItem(key, saved); } catch { /* Keep this session's number. */ }
  }
  demoNumbers.set(key, saved);
  return saved;
}

function GiftBarcode({ number }) {
  // Decorative preview bars; this is not a redeemable merchant barcode.
  const bars = [];
  let x = 12;
  for (const digit of number) {
    for (let index = 0; index < 4; index += 1) {
      const width = 1 + ((Number(digit) + index * 3) % 3);
      bars.push(<rect key={bars.length} x={x} y="0" width={width} height="66" />);
      x += width + 1 + (index % 2);
    }
  }
  return <svg className={styles.giftBarcode} viewBox={`0 0 ${x + 12} 66`} aria-hidden="true">{bars}</svg>;
}

function StarbucksGift({ coupon }) {
  const { user } = useAuth();
  const dialogRef = useRef(null);
  const [number, setNumber] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const titleId = useId();
  useEffect(() => { dialogRef.current?.close(); setNumber(""); }, [user?.uid]);
  const openGift = () => {
    if (!user?.uid) return;
    setNumber(getGiftNumber(user.uid, coupon));
    setCopyMessage("");
    dialogRef.current?.showModal();
  };
  const copyNumber = async () => {
    try { await navigator.clipboard.writeText(number); setCopyMessage("번호를 복사했어요."); }
    catch { setCopyMessage("아래 번호를 선택해 복사해주세요."); }
  };
  return <>
    <button type="button" className={styles.starbucksGift} onClick={openGift} aria-label="스타벅스 아메리카노 쿠폰 보기">
      <span className={styles.giftCardFace}>
        <span className={styles.giftEyebrow}>CASE SOLVED · COFFEE BREAK</span>
        <strong className={styles.giftWordmark}>STAR<br />BUCKS</strong>
        <span className={styles.giftCoffeeCo}>COFFEE CO.</span>
        <span className={styles.giftProduct}>카페 아메리카노 <b>1잔</b></span>
      </span>
      <span className={styles.giftCardRail}>
        <img src="/event/event03/Starbucks.webp" alt="스타벅스" />
        <span>GIFT<br />COUPON</span>
        <b>쿠폰 보기 ↗</b>
      </span>
    </button>
    <dialog ref={dialogRef} className={styles.giftDialog} aria-labelledby={titleId} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.currentTarget.close();
    }}>
      <div className={styles.giftDialogHeader}><span>MOBILE GIFT COUPON</span><button type="button" autoFocus onClick={() => dialogRef.current.close()} aria-label="쿠폰 닫기">×</button></div>
      <div className={styles.giftCupStage}><div className={styles.giftCup}><img src="/event/event03/Starbucks.webp" alt="스타벅스 로고" /></div></div>
      <div className={styles.giftCodeArea}>
        <GiftBarcode number={number} />
        <p className={styles.giftNumber}>{number.match(/.{1,4}/g)?.join(" ")}</p>
        <button type="button" className={styles.giftCopyButton} onClick={copyNumber}>번호 복사</button>
        <span className={styles.giftCopyStatus} role="status">{copyMessage}</span>
      </div>
      <div className={styles.giftDetails}><span>스타벅스</span><h2 id={titleId}>카페 아메리카노 1잔</h2><p>사건 해결을 축하하는 커피 한 잔</p><small>포트폴리오 시연용 · 실제 매장 사용 불가</small></div>
    </dialog>
  </>;
}


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

  if (coupon.rewardId === "mystery-airplane-starbucks" || coupon.eventId === "mystery-case-01" || coupon.code?.startsWith("MYSTERY-CASE-01-")) {
    return <StarbucksGift coupon={coupon} />;
  }

  const displayCoupon = isPromoCoupon
    ? { ...coupon, type: "EVENT", title: "가차 돌리기", description: "가차 돌리고 쿠폰받자!" }
    : coupon;
  const eventPrizeImage = coupon.source === "event" && coupon.eventId === "gacha-2026"
    ? gachaPrizeImages[coupon.prizeId]
    : null;

  if (eventPrizeImage) {
    const prizeClassName = coupon.prizeId === "event-fourth" ? styles.eventPrizeFourth : "";
    return (
      <article className={`${styles.ticket} ${styles.eventPrizeTicket} ${prizeClassName}`}>
        <img src={eventPrizeImage} alt={`${coupon.type} 당첨 쿠폰`} />
      </article>
    );
  }

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
  const [couponData, setCouponData] = useState({ userId: null, coupons: [], error: "" });
  const registeredCoupons = couponData.userId === user?.uid ? couponData.coupons : [];
  const loadError = couponData.userId === user?.uid ? couponData.error : "";

  useEffect(() => {
    if (!user?.uid) return undefined;
    const userId = user.uid;
    let active = true;
    let remoteCoupons = [];
    let error = "";
    const refreshLocal = () => {
      if (!active) return;
      setCouponData({ userId, coupons: mergeCoupons(remoteCoupons, readLocalCoupons(userId)), error });
    };
    const onStorage = (event) => {
      if (event.key === null || event.key === EVENT_COUPON_STORAGE_KEY || event.key === getCouponStorageKey(userId)) refreshLocal();
    };
    const onIssued = (event) => {
      if (event.detail?.userId === userId) refreshLocal();
    };
    setCurrentPage(1);
    refreshLocal();
    window.addEventListener("storage", onStorage);
    window.addEventListener("lcode:coupon-issued", onIssued);
    getUserCoupons(userId)
      .then((coupons) => {
        remoteCoupons = coupons;
        refreshLocal();
      })
      .catch(() => {
        error = "계정 쿠폰을 불러오지 못했습니다. 이 브라우저에 저장된 쿠폰만 표시합니다.";
        refreshLocal();
      });
    return () => {
      active = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("lcode:coupon-issued", onIssued);
    };
  }, [user?.uid]);
  // 발급받은 쿠폰을 기본 안내 쿠폰보다 먼저 표시합니다.
  const ownedCoupons = useMemo(
    () => mergeCoupons(registeredCoupons, managedCoupons),
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
