const COUPON_STORAGE_KEY = "lcode-registered-coupons";
export const getCouponStorageKey = (userId) =>
  `${COUPON_STORAGE_KEY}:${userId}`;

