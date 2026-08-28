import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MypageBackLink from "../components/MypageBackLink";
import styles from "./CouponUp.module.scss";

const storageKey = "lcode-registered-coupons";

export default function CouponUp() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [registered, setRegistered] = useState(null);
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      setError("쿠폰 코드를 입력해주세요.");
      return;
    }

    const coupon = {
      type: "L:CODE COUPON",
      title: "10%",
      suffix: "OFF",
      description: "REGISTERED COUPON",
      detail: pin ? `PIN ${pin}` : "새로 등록된 쿠폰",
      code: normalizedCode,
      expiry: "VALID UNTIL 2026.12.31",
    };

    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(storageKey)) || []; } catch { saved = []; }
    if (saved.some((item) => item.code === normalizedCode)) {
      setError("이미 등록된 쿠폰 코드입니다.");
      return;
    }
    localStorage.setItem(storageKey, JSON.stringify([...saved, coupon]));
    setRegistered(coupon);
    setError("");
  };

  return (
    <main className={styles.couponUp}>
      <div className={styles.layout}>
        <section className={styles.formArea}>
          <MypageBackLink to="/coupon" label="쿠폰함으로 돌아가기" />
          <p className={styles.eyebrow}>MY JOURNEY</p>
          <h1>REGISTER<br />COUPON</h1>
          <p className={styles.description}>쿠폰 코드를 입력하고 새로운 혜택을 추가해보세요</p>

          <form onSubmit={submit}>
            <label htmlFor="coupon-code">쿠폰 코드</label>
            <input id="coupon-code" value={code} placeholder="예: LCODE-2026-SUMMER" onChange={(event) => setCode(event.target.value)} />
            <label htmlFor="coupon-pin">PIN 번호 (선택) <small>?</small></label>
            <input id="coupon-pin" value={pin} placeholder="선택 입력 사항입니다" onChange={(event) => setPin(event.target.value)} />
            <div className={styles.notice}><b>ⓘ</b><span>쿠폰 코드는 대소문자를 구분합니다.<br />정확히 입력해 주세요. 유효기간이 지난 쿠폰은 등록할 수 없습니다.</span></div>
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.submitButton}>쿠폰 등록하기</button>
            <button className={styles.cancelButton} type="button" onClick={() => navigate("/coupon")}>취소</button>
          </form>
        </section>

        <section className={styles.previewArea} aria-live="polite">
          <div className={`${styles.couponPreview} ${registered ? styles.registered : ""}`}>
            <p>{registered ? "L:CODE COUPON" : "SPECIAL EVENT"}</p>
            <span>NEW</span>
            <h2>{registered ? "10% OFF" : "PACK & WIN"}</h2>
            <h3>{registered ? "새로운 쿠폰이 추가되었습니다!" : "여행 짐싸고 쿠폰받자!"}</h3>
            <footer><b>{registered?.code || "TC-0060"}</b><b>{registered?.expiry || "VALID UNTIL 2026.08.31"}</b></footer>
          </div>

          {registered && <div className={styles.addedCoupon}><img src="/Mypage-img/coupon1.svg" alt="새로 등록된 쿠폰" /><div><strong>{registered.title} {registered.suffix}</strong><span>{registered.code}</span></div></div>}

          <div className={styles.benefits}>
            <h2>쿠폰 등록 시 제공되는 혜택</h2>
            <article><b>♧</b><p>등록 후 쿠폰함에서 바로 확인 가능<small>마이페이지 &gt; 쿠폰 아카이브에서 확인할 수 있습니다.</small></p></article>
            <article><b>□</b><p>유효기간 및 사용처 확인<small>등록 전 쿠폰의 유효기간과 사용 조건을 확인해 보세요.</small></p></article>
            <article><b>◇</b><p>중복 등록 불가<small>동일한 쿠폰 코드는 한 계정에 한 번만 등록할 수 있습니다.</small></p></article>
          </div>
        </section>
      </div>
    </main>
  );
}
