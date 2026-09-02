import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firestore";

const EVENT_ID = "gacha-2026";
const prizes = [
  { prizeId: "event-first", type: "EVENT 1ST PRIZE", title: "100,000", suffix: "KRW OFF", description: "L:CODE 10만원 쿠폰 + 여행 키트 교환권", detail: "이벤트 1등 당첨" },
  { prizeId: "event-second", type: "EVENT 2ND PRIZE", title: "50,000", suffix: "KRW OFF", description: "L:CODE 5만원 쿠폰 + 여행 키트 교환권", detail: "이벤트 2등 당첨" },
  { prizeId: "event-third", type: "EVENT 3RD PRIZE", title: "TRAVEL KIT", suffix: "", description: "여행 키트 교환권", detail: "이벤트 3등 당첨" },
  { prizeId: "event-fourth", type: "EVENT 4TH PRIZE", title: "10%", suffix: "OFF", description: "L:CODE SHOP 할인 쿠폰", detail: "이벤트 4등 당첨" },
];

export async function drawEventCoupon(userId) {
  if (!db) throw new Error("Firebase가 설정되지 않았습니다.");
  if (!userId) throw new Error("로그인이 필요합니다.");

  // Cloud Function 방식으로 이미 발급된 기존 쿠폰도 중복 참여로 처리합니다.
  const existingQuery = query(
    collection(db, "users", userId, "coupons"),
    where("eventId", "==", EVENT_ID),
  );
  const existingSnapshot = await getDocs(existingQuery);
  if (!existingSnapshot.empty) {
    const existingCoupon = existingSnapshot.docs[0];
    return {
      prizeId: existingCoupon.data().prizeId,
      couponId: existingCoupon.id,
      alreadyClaimed: true,
    };
  }

  const couponRef = doc(db, "users", userId, "coupons", EVENT_ID);
  return runTransaction(db, async (transaction) => {
    const existingCoupon = await transaction.get(couponRef);
    if (existingCoupon.exists()) {
      return {
        prizeId: existingCoupon.data().prizeId,
        couponId: existingCoupon.id,
        alreadyClaimed: true,
      };
    }

    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    transaction.set(couponRef, {
      ...prize,
      eventId: EVENT_ID,
      code: `GACHA-2026-${userId}`,
      source: "event",
      used: false,
      issuedAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date("2026-12-31T14:59:59.999Z")),
      expiry: "VALID UNTIL 2026.12.31",
    });

    return { prizeId: prize.prizeId, couponId: EVENT_ID, alreadyClaimed: false };
  });
}
