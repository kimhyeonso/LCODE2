import { doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "../firebase/config";
import { db } from "../firebase/firestore";
import { enrichShopProduct } from "../utils/shopProductResolver";

export async function recordPurchase(userId, order) {
  if (!userId) return;
  const purchase = { userId, orderNumber: order.orderNumber, orderedAt: order.orderedAt,
    items: order.items.map((item) => {
      const product = enrichShopProduct(item);
      return { id: String(product.id), name: product.name || "상품", image: product.image || "", price: Number(item.price ?? product.price) || 0, quantity: Number(item.quantity) || 1, option: { label: item.option?.label || "기본 옵션", extraPrice: Number(item.option?.extraPrice) || 0 } };
    }) };
  await httpsCallable(getFunctions(firebaseApp, "asia-northeast3"), "recordShopOrder")(purchase);
}

export async function saveProductReview(review, reviewId) {
  const response = await httpsCallable(getFunctions(firebaseApp, "asia-northeast3"), "saveProductReview")({ ...review, reviewId: reviewId?.startsWith("local-") ? null : reviewId || null });
  return response.data;
}

export function eligibleProducts(orders, userId, now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 30);
  const products = new Map();
  [...orders].sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt)).forEach((order) => {
    const date = new Date(order.orderedAt);
    if (order.userId !== userId || !(date >= cutoff && date <= now) || ["cancelled", "refunded"].includes(order.status)) return;
    (order.items || []).forEach((item) => {
      if (item.id && !products.has(String(item.id))) products.set(String(item.id), { ...item, id: String(item.id), orderNumber: order.orderNumber, orderedAt: order.orderedAt });
    });
  });
  return [...products.values()];
}

export async function getReviewProducts(userId) {
  return eligibleProducts(await getPurchaseOrders(userId), userId);
}

export async function getPurchaseOrders(userId) {
  const snapshot = await getDoc(doc(db, "users", userId, "shop", "purchaseHistory"));
  const orders = snapshot.data()?.orders;
  return Array.isArray(orders)
    ? orders
      .filter((order) => order.userId === userId)
      .map((order) => ({
        ...order,
        items: (order.items || []).map((item) => ({
          ...item,
          ...enrichShopProduct(item),
          // Historical orders keep their actual paid price/options; only the
          // catalogue metadata (especially image) is refreshed.
          price: item.price ?? enrichShopProduct(item).price,
          option: item.option,
          quantity: item.quantity,
        })),
      }))
    : [];
}
