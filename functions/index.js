const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");

initializeApp();

exports.listDashboardUsers = onCall({ region: "asia-northeast3" }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "로그인이 필요합니다.");

  const adminProfile = await getFirestore().doc(`users/${request.auth.uid}`).get();
  if (adminProfile.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "관리자만 회원 목록을 조회할 수 있습니다.");
  }

  const database = getFirestore();
  const users = [];
  let pageToken;
  do {
    const page = await getAuth().listUsers(1000, pageToken);
    const authUsers = page.users.map((user) => ({
      id: user.uid,
      uid: user.uid,
      email: user.email || "",
      nickname: user.displayName || user.email?.split("@")[0] || "회원",
      disabled: user.disabled,
      emailVerified: user.emailVerified,
      providerIds: user.providerData.map((provider) => provider.providerId),
      authCreatedAt: user.metadata.creationTime || "",
      lastLoginAt: user.metadata.lastSignInTime || "",
      role: "user",
    }));
    const references = authUsers.map((user) => database.doc(`users/${user.uid}`));
    const profiles = references.length ? await database.getAll(...references) : [];
    const writer = database.bulkWriter();

    authUsers.forEach((user, index) => {
      const profile = profiles[index]?.data() || {};
      const synchronized = {
        email: profile.email || user.email,
        nickname: profile.nickname || user.nickname,
        role: profile.role || "user",
        disabled: user.disabled,
        emailVerified: user.emailVerified,
        providerIds: user.providerIds,
        authCreatedAt: user.authCreatedAt,
        lastLoginAt: user.lastLoginAt,
        authSyncedAt: FieldValue.serverTimestamp(),
      };
      if (!profiles[index]?.exists) synchronized.createdAt = FieldValue.serverTimestamp();
      writer.set(references[index], synchronized, { merge: true });
      users.push({
        ...user,
        ...profile,
        email: synchronized.email,
        nickname: synchronized.nickname,
        role: synchronized.role,
        disabled: synchronized.disabled,
        emailVerified: synchronized.emailVerified,
        providerIds: synchronized.providerIds,
      });
    });

    if (references.length) await writer.close();
    pageToken = page.pageToken;
  } while (pageToken);

  return { users };
});
