const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");

function setup(entries = {}) {
  const records = new Map(Object.entries(entries));
  class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
  const db = { doc: (path) => path, runTransaction: async (fn) => fn({
    get: async (path) => ({ data: () => records.get(path) }),
    set: (path, data) => records.set(path, data),
  }) };
  const context = { exports: {}, require: (name) => {
    if (name === "firebase-functions/v2/https") return { onCall: (_, handler) => handler, HttpsError };
    if (name === "firebase-admin/firestore") return { getFirestore: () => db, FieldValue: { serverTimestamp: () => 1, arrayUnion: (value) => [value] } };
    return require(name);
  } };
  vm.runInNewContext(fs.readFileSync(`${__dirname}/shop-reviews.js`, "utf8"), context);
  return { ...context.exports, records };
}
const data = { productId: "P001", title: "Review", content: "Good", rating: 5, photos: [] };
const history = (days) => ({ orders: [{ userId: "u1", orderedAt: new Date(Date.now() - days * 86400000).toISOString(), orderNumber: "o1", items: [{ id: "P001", name: "Product" }] }] });
test("reject unauthenticated and missing or expired purchases", async () => {
  await assert.rejects(setup().saveProductReview({ data }), { code: "unauthenticated" });
  for (const entries of [{}, { "users/u1/shop/purchaseHistory": history(31) }]) {
    await assert.rejects(setup(entries).saveProductReview({ auth: { uid: "u1" }, data }), { code: "failed-precondition" });
  }
});
test("recent purchase creates stable review ID; repeat saves do not duplicate", async () => {
  const app = setup({ "users/u1/shop/purchaseHistory": history(1) });
  const first = await app.saveProductReview({ auth: { uid: "u1" }, data });
  const second = await app.saveProductReview({ auth: { uid: "u1" }, data });
  assert.equal(first.id, second.id);
  assert.equal(first.productName, "Product");
});
test("existing owner can edit after purchase expiry but others cannot", async () => {
  const app = setup({ "reviews/r1": { userId: "u1", productId: "P001", productName: "Product" } });
  await app.saveProductReview({ auth: { uid: "u1" }, data: { ...data, reviewId: "r1" } });
  await assert.rejects(app.saveProductReview({ auth: { uid: "u2" }, data: { ...data, reviewId: "r1" } }), { code: "permission-denied" });
});
test("reject malformed photos and deleted review edits", async () => {
  await assert.rejects(setup().saveProductReview({ auth: { uid: "u1" }, data: { ...data, photos: [{ name: "bad", src: "https://example.com" }] } }), { code: "invalid-argument" });
  await assert.rejects(setup().saveProductReview({ auth: { uid: "u1" }, data: { ...data, reviewId: "missing" } }), { code: "not-found" });
});
test("checkout requires login and valid items", async () => {
  await assert.rejects(setup().recordShopOrder({ data: {} }), { code: "unauthenticated" });
  await assert.rejects(setup().recordShopOrder({ auth: { uid: "u1" }, data: { orderNumber: "o1", items: [] } }), { code: "invalid-argument" });
});
test("checkout records server time and retries keep original date", async () => {
  const app = setup();
  const request = { auth: { uid: "u1" }, data: { orderNumber: "o1", orderedAt: "2000-01-01", items: [{ id: "P001", name: "Product" }] } };
  await app.recordShopOrder(request);
  const first = app.records.get("users/u1/shop/purchaseHistory").orders[0];
  assert.equal(first.demo, true);
  assert.equal(first.source, "demo-checkout");
  assert.ok(Date.parse(first.orderedAt) > Date.parse("2026-01-01"));
  await app.recordShopOrder(request);
  assert.equal(app.records.get("users/u1/shop/purchaseHistory").orders[0].orderedAt, first.orderedAt);
});
