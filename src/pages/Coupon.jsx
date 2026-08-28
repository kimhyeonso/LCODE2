import MypageBackLink from "../components/MypageBackLink";
import { Link } from "react-router-dom";
import { useState } from "react";
import styles from "./Coupon.module.scss";

const coupons = [
  { type: "SPECIAL EVENT", title: "PACK & WIN", description: "여행 짐싸고 쿠폰받자!", code: "TC-0056", expiry: "VALID UNTIL 2026.08.31", used: true },
  // description is the main coupon description: "FLIGHT KIT".
  { type: "L:CODE", title: "5%", suffix: "OFF", description: "FLIGHT KIT", detail: "여행 키트", code: "TC-0034", expiry: "VALID UNTIL 2026.10.15" },
  // description is the main coupon description: "FLIGHT KIT".
  { type: "L:CODE", title: "5%", suffix: "OFF", description: "FLIGHT KIT", detail: "여행 키트", code: "TC-0034", expiry: "VALID UNTIL 2026.10.15" },
];

function CouponTicket({ coupon, featured = false }) {
  return (
    <article className={`${styles.ticket} ${coupon.used ? styles.used : ""} ${featured ? styles.featured : ""}`}>
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
  const [registeredCoupons] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lcode-registered-coupons")) || []; }
    catch { return []; }
  });
  const welcomeCoupon = { type: "L:CODE SHOP", title: "3,000", suffix: "KRW OFF", description: "쇼핑몰 전용", code: "TC-0012", expiry: "VALID UNTIL 2026.09.30" };
  return (
    <main className={styles.coupon}>
      
      <div className={styles.content}>
        <section className={styles.archive} aria-labelledby="coupon-title">
          <MypageBackLink />
          <p className={styles.eyebrow}>MY JOURNEY</p>
          <h1 id="coupon-title">COUPON ARCHIVE</h1>
          <p className={styles.description}>나만의 여행을 위해 남긴 글</p>
          <div className={styles.divider} />
          <CouponTicket coupon={welcomeCoupon} featured />
          <Link className={styles.register} to="/coupon/register">쿠폰 등록하기</Link>
        </section>
        <section className={styles.couponList} aria-label="보유 쿠폰">
          {coupons.map((coupon, index) => <CouponTicket coupon={coupon} key={index} />)}
          {registeredCoupons.map((coupon) => <CouponTicket coupon={coupon} key={coupon.code} />)}
        </section>
      </div>
    </main>
  );
}
