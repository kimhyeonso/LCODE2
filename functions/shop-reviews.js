const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { createHash } = require("node:crypto");
const options = { region: "asia-northeast3", maxInstances: 2 };
const id = (value) => typeof value === "string" && /^[\w-]{1,128}$/.test(value);
const validNumber = (value) => value == null
  || ((typeof value === "number" || typeof value === "string") && Number.isFinite(Number(value)));
const readOrders = (snapshot) => {
  const orders = snapshot.data()?.orders;
  if (orders == null) return [];
  if (!Array.isArray(orders)) throw new HttpsError("failed-precondition", "주문 내역 형식을 확인할 수 없습니다. 고객센터에 문의해 주세요.");
  return orders;
};

// Demo checkout only: no payment-provider confirmation or stock deduction.
exports.recordShopOrder = onCall(options, async ({ auth, data }) => {
  if (!auth) throw new HttpsError("unauthenticated", "로그인이 필요합니다.");
  if (!id(data?.orderNumber) || !Array.isArray(data.items) || !data.items.length || data.items.length > 50) throw new HttpsError("invalid-argument", "주문 정보를 확인해 주세요.");
  const items = data.items.map((item) => {
    if (!item || !id(item.id) || typeof item.name !== "string" || !item.name.trim() || item.name.length > 200
      || !validNumber(item.price) || !validNumber(item.quantity) || !validNumber(item.option?.extraPrice)) throw new HttpsError("invalid-argument", "상품 정보를 확인해 주세요.");
    return { id: item.id, name: item.name, price: Math.max(0, Number(item.price) || 0), quantity: Math.max(1, Math.min(999, Math.floor(Number(item.quantity) || 1))), option: { label: typeof item.option?.label === "string" ? item.option.label.slice(0, 100) : "기본 옵션", extraPrice: Math.max(0, Number(item.option?.extraPrice) || 0) }, image: typeof item.image === "string" && item.image.length < 2000 ? item.image : "" };
  });
  const db = getFirestore();
  const ref = db.doc(`users/${auth.uid}/shop/purchaseHistory`);
  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    const orders = readOrders(snapshot);
    if (orders.some((order) => order?.orderNumber === data.orderNumber)) return;
    tx.set(ref, { orders: FieldValue.arrayUnion({ userId: auth.uid, orderNumber: data.orderNumber, orderedAt: new Date().toISOString(), source: "demo-checkout", demo: true, status: "데모 주문", items }) }, { merge: true });
  });
  return { saved: true };
});

exports.saveProductReview = onCall(options, async ({ auth, data }) => {
  if (!auth) throw new HttpsError("unauthenticated", "로그인이 필요합니다.");
  if (!id(data?.productId) || (data.reviewId && !id(data.reviewId))) throw new HttpsError("invalid-argument", "상품 정보를 확인해 주세요.");
  if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5 || typeof data.title !== "string" || !data.title.trim() || data.title.length > 80 || typeof data.content !== "string" || !data.content.trim() || data.content.length > 2000) throw new HttpsError("invalid-argument", "리뷰 내용을 확인해 주세요.");
  const photos = data.photos || [];
  if (!Array.isArray(photos) || photos.length > 3 || photos.some((photo) => !photo || typeof photo.name !== "string" || photo.name.length > 255 || typeof photo.src !== "string" || photo.src.length > 180000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(photo.src))) throw new HttpsError("invalid-argument", "사진 정보를 확인해 주세요.");
  const tags = (value) => Array.isArray(value) ? value.filter((tag) => typeof tag === "string" && tag.length <= 80).slice(0, 20) : [];
  const db = getFirestore();
  const reviewId = data.reviewId || `product-${createHash("sha256").update(`${auth.uid}:${data.productId}`).digest("hex")}`;
  const ref = db.doc(`reviews/${reviewId}`);
  return db.runTransaction(async (tx) => {
    const old = (await tx.get(ref)).data();
    if (old && (old.userId !== auth.uid || old.productId !== data.productId)) throw new HttpsError("permission-denied", "본인의 상품 리뷰만 수정할 수 있습니다.");
    if (data.reviewId && !old) throw new HttpsError("not-found", "삭제되었거나 존재하지 않는 리뷰입니다.");
    let productName = old?.productName;
    let orderNumber = old?.orderNumber || "";
    if (!old) {
      const orders = readOrders(await tx.get(db.doc(`users/${auth.uid}/shop/purchaseHistory`)));
      const now = Date.now();
      const order = orders.find((order) => order?.userId === auth.uid && !["cancelled", "refunded"].includes(order.status) && Date.parse(order.orderedAt) <= now && Date.parse(order.orderedAt) >= now - 30 * 86400000 && Array.isArray(order.items) && order.items.some((item) => item?.id === data.productId && typeof item.name === "string"));
      if (!order) throw new HttpsError("failed-precondition", "최근 30일 이내의 주문 내역이 필요합니다.");
      productName = order.items.find((item) => item?.id === data.productId && typeof item.name === "string").name;
      orderNumber = order.orderNumber;
    }
    const review = { userId: auth.uid, productId: data.productId, productName, orderNumber, title: data.title.trim(), content: data.content.trim(), rating: data.rating, tags: tags(data.tags), customTags: tags(data.customTags), photos, photoNames: photos.map((photo) => photo.name) };
    tx.set(ref, { ...review, createdAt: old?.createdAt || FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    return { ...review, id: reviewId };
  });
});
