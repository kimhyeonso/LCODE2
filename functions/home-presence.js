const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

exports.homePresence = onCall({ region: "asia-northeast3", maxInstances: 3, timeoutSeconds: 15 }, async (request) => {
  const visitorId = request.data?.visitorId;
  if (typeof visitorId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId)) {
    throw new HttpsError("invalid-argument", "Invalid visitor ID");
  }
  const database = getFirestore();
  const visitors = database.collection("homePresence");
  const now = Timestamp.now();
  const reference = visitors.doc(visitorId);
  await database.runTransaction(async (transaction) => {
    const current = await transaction.get(reference);
    if (!current.exists || now.toMillis() - current.data().seenAt.toMillis() >= 20000) {
      transaction.set(reference, { seenAt: now, expiresAt: Timestamp.fromMillis(now.toMillis() + 60000) });
    }
  });
  const [count, expired] = await Promise.all([
    visitors.where("expiresAt", ">", now).count().get(),
    visitors.where("expiresAt", "<=", now).limit(25).get(),
  ]);
  if (!expired.empty) {
    // Recheck under a transaction so a renewed visitor is not removed by stale cleanup.
    await database.runTransaction(async (transaction) => {
      const docs = await transaction.getAll(...expired.docs.map((item) => item.ref));
      for (const item of docs) {
        if (item.exists && item.data().expiresAt.toMillis() <= now.toMillis()) transaction.delete(item.ref);
      }
    });
  }
  return { count: count.data().count, windowSeconds: 60 };
});
