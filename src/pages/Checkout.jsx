import { useNavigate } from "react-router-dom";
import { useShop } from "../hooks/useShop";
import styles from "./Shop.module.scss";
export default function Checkout() {
  const { cart } = useShop();
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal - 2000);
  return <main className={styles.checkoutPage}><span>SHOP</span><h1>ORDER<br />& PAYMENT</h1><div className={styles.steps}>01 CART　 ─　 <b>02 PAYMENT</b>　 ─　 03 COMPLETE</div><section><label>ORDER PRODUCT</label>{cart.map((item) => <div className={styles.orderProduct} key={item.id}><div className={styles.cartVisual} /><div><b>{item.name}</b><small>기본 / Standard · {item.quantity}개</small><span>{(item.price * item.quantity).toLocaleString()} KRW</span></div></div>)}<label>SHIPPING INFORMATION</label><div className={styles.shipping}><p>수령인 <b>전승근</b></p><p>연락처 <b>010-1234-5678</b></p><p>주소 <b>서울시 마포구 상수동 123-4 101호</b></p></div><label>PAYMENT METHOD</label><div className={styles.paymentMethods}><button className={styles.selected}>카드</button><button>계좌이체</button><button>카카오페이</button><button>네이버페이</button></div><label>COUPON / POINT</label><div className={styles.coupon}>쿠폰 적용 <small>TC-0012 - 3,000 KRW 할인</small><input type="checkbox" /></div><label>PAYMENT SUMMARY</label><div className={styles.summary}><p>상품 금액 <b>{subtotal.toLocaleString()} KRW</b></p><p>배송비 <b>3,000 KRW</b></p><p>쿠폰 할인 <b>- 5,000 KRW</b></p><h2>총 결제 금액 <strong>{total.toLocaleString()} KRW</strong></h2></div><button className={styles.primaryButton} onClick={() => navigate("/order-complete")}>{total.toLocaleString()}원 결제하기</button></section></main>;
}
