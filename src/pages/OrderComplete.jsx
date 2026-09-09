import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./Shop.module.scss";
export default function OrderComplete() {
  const { user } = useAuth();
  const { state } = useLocation();
  const [savedOrder] = useState(() => {
    try {
      return state?.order || JSON.parse(sessionStorage.getItem("lastOrder"));
    } catch {
      return null;
    }
  });
  const order = savedOrder?.userId === (user?.uid || null)
    && savedOrder?.orderNumber && Array.isArray(savedOrder.items)
    && savedOrder.items.length > 0
    && savedOrder.items.every((item) => item && typeof item.name === "string")
    && Number.isFinite(savedOrder.price?.total) ? savedOrder : null;

  return <main className={styles.completePage}>
    <span>ORDER</span><h1>{order ? "COMPLETE" : "ORDER INFO"}</h1>
    {order && <p className={styles.completeDescription}>데모 주문이 완료되었습니다. 실제 결제와 배송은 진행되지 않습니다.</p>}
    {order ? <>
      <div className={styles.completeMessage}><b>✓</b><div><h2>여행 준비가<br />한 단계 완료되었습니다.</h2></div></div>
      <dl>
        <div><dt>ORDER NUMBER</dt><dd>{order.orderNumber}</dd></div>
        <div><dt>PAYMENT</dt><dd>{order.price.total.toLocaleString("ko-KR")} KRW</dd></div>
        <div><dt>DELIVERY</dt><dd>데모 · 배송 없음</dd></div>
        <div><dt>PRODUCT</dt><dd>{order.items.map((item) => `${item.name} ${item.quantity || 1}개`).join(", ")}</dd></div>
      </dl>
    </> : <p role="status">확인할 주문 정보가 없습니다. 주문 내역에서 확인해 주세요.</p>}
    <div className={styles.completeActions}><Link to="/shop">쇼핑 계속</Link><Link to="/buy">주문 내역</Link></div>
  </main>;
}
