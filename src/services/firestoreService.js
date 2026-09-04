import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import { firebaseApp } from "../firebase/config";
import { getFunctions, httpsCallable } from "firebase/functions";
const requireDb = () => {
  if (!db) throw new Error("Firebase is not configured");
  return db;
};

export async function createUserProfile({ uid, email, nickname }) {
  return setDoc(
    doc(requireDb(), "users", uid),
    {
      email,
      nickname: nickname || "여행자",
      savedTrips: [],
      favorites: [],
      orders: [],
      role: "user",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getAdminDashboardData() {
  const database = requireDb();
  const [usersSnapshot, plansSnapshot, reviewsSnapshot] = await Promise.all([
    getDocs(collection(database, "users")),
    getDocs(collection(database, "plans")),
    getDocs(collection(database, "reviews")),
  ]);

  const mapSnapshot = (snapshot) =>
    snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

  return {
    users: mapSnapshot(usersSnapshot),
    plans: mapSnapshot(plansSnapshot),
    reviews: mapSnapshot(reviewsSnapshot),
  };
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(requireDb(), "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, data) {
  return setDoc(
    doc(requireDb(), "users", uid),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function savePlan(userId, plan) {
  return addDoc(collection(requireDb(), "plans"), {
    ...plan,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
export async function getPlans(userId) {
  if (!db) return [];
  const ref = userId
    ? query(collection(db, "plans"), where("userId", "==", userId))
    : collection(db, "plans");
  const snap = await getDocs(ref);
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getPlanDateConflict(userId, {
  start,
  end,
  excludePlanId = "",
  tripId = "",
  draft = false,
} = {}) {
  if (!userId || !start || !end) return null;
  const plans = await getPlans(userId);
  return plans.find((plan) => {
    if (plan.id === excludePlanId) return false;
    const planStart = plan.dateRange?.start;
    const planEnd = plan.dateRange?.end;
    if (!planStart || !planEnd) return false;
    const exactDuplicate = Boolean(tripId)
      && plan.tripId === tripId
      && planStart === start
      && planEnd === end;
    if (exactDuplicate) return true;
    if (draft || plan.status === "draft") return false;
    return start <= planEnd && end >= planStart;
  }) || null;
}
export async function getPlan(id) {
  const snap = await getDoc(doc(requireDb(), "plans", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updatePlan(userId, planId, data) {
  if (!userId || !planId) throw new Error("일정 수정 정보가 올바르지 않습니다.");
  const planRef = doc(requireDb(), "plans", planId);
  const snap = await getDoc(planRef);
  if (!snap.exists()) throw new Error("수정할 일정을 찾을 수 없습니다.");
  if (snap.data().userId !== userId) {
    throw new Error("다른 사용자의 일정은 수정할 수 없습니다.");
  }
  await updateDoc(planRef, { ...data, updatedAt: serverTimestamp() });
  return { id: planId, ...snap.data(), ...data };
}

export async function deletePlan(userId, planId) {
  if (!userId || !planId) throw new Error("일정 삭제 정보가 올바르지 않습니다.");
  const planRef = doc(requireDb(), "plans", planId);
  const snap = await getDoc(planRef);
  if (!snap.exists()) return;
  if (snap.data().userId !== userId) {
    throw new Error("다른 사용자의 일정은 삭제할 수 없습니다.");
  }
  return deleteDoc(planRef);
}

export async function getFavoritePlaces(userId) {
  if (!db || !userId) return [];
  const snap = await getDocs(collection(db, "users", userId, "favoritePlaces"));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function saveFavoritePlace(userId, place) {
  if (!userId || !place?.key) throw new Error("찜할 장소 정보가 올바르지 않습니다.");
  await setDoc(doc(requireDb(), "users", userId, "favoritePlaces", place.key), {
    ...place,
    userId,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return { id: place.key, ...place, userId };
}

export async function deleteFavoritePlace(userId, placeId) {
  if (!userId || !placeId) throw new Error("삭제할 찜 장소 정보가 올바르지 않습니다.");
  return deleteDoc(doc(requireDb(), "users", userId, "favoritePlaces", placeId));
}

const adminCollections = {
  products: "adminProducts",
  packages: "adminPackages",
  notices: "adminNotices",
  coupons: "adminCoupons",
  members: "users",
};

const getAdminCollectionName = (type) => {
  const name = adminCollections[type];
  if (!name) throw new Error("지원하지 않는 관리 항목입니다.");
  return name;
};

const removeUndefinedValues = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map(removeUndefinedValues);
  }
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, removeUndefinedValues(item)]),
    );
  }
  return value;
};

export async function getAdminManagementData() {
  const database = requireDb();
  const entries = await Promise.all(
    Object.entries(adminCollections).map(async ([type, collectionName]) => {
      const snapshot = await getDocs(collection(database, collectionName));
      return [type, snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))];
    }),
  );
  return Object.fromEntries(entries);
}

export async function getAdminManagementItems(type) {
  const snapshot = await getDocs(collection(requireDb(), getAdminCollectionName(type)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export function subscribeAdminManagementItems(type, onItems, onError) {
  if (!db) {
    queueMicrotask(() => onError?.(new Error("Firebase is not configured")));
    return () => {};
  }
  const target = collection(db, getAdminCollectionName(type));
  return onSnapshot(
    target,
    (snapshot) => onItems(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function saveAdminManagementItem(type, item) {
  const collectionName = getAdminCollectionName(type);
  const id = String(item.id || `${type}-${Date.now()}`);
  const data = removeUndefinedValues({ ...item, id, _deleted: false });
  delete data.updatedAt;
  await setDoc(
    doc(requireDb(), collectionName, id),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
  return { ...data, id };
}

export async function deleteAdminManagementItem(type, id) {
  if (!id) throw new Error("삭제할 항목 ID가 없습니다.");
  const reference = doc(requireDb(), getAdminCollectionName(type), String(id));
  if (type === "members") return deleteDoc(reference);
  return setDoc(reference, { id: String(id), _deleted: true, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getFirebaseAuthUsers() {
  if (!firebaseApp) return [];
  const functions = getFunctions(firebaseApp, "asia-northeast3");
  const result = await httpsCallable(functions, "listDashboardUsers")();
  return Array.isArray(result.data?.users) ? result.data.users : [];
}

export async function ensureUserDataStructure(userId) {
  if (!userId) throw new Error("사용자 ID가 없습니다.");
  const database = requireDb();
  const references = {
    cart: doc(database, "users", userId, "shop", "cart"),
    savedProducts: doc(database, "users", userId, "shop", "savedProducts"),
    couponsMeta: doc(database, "users", userId, "coupons", "_meta"),
  };

  return runTransaction(database, async (transaction) => {
    const [cart, savedProducts, couponsMeta] = await Promise.all([
      transaction.get(references.cart),
      transaction.get(references.savedProducts),
      transaction.get(references.couponsMeta),
    ]);

    if (!cart.exists()) {
      transaction.set(references.cart, { items: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    if (!savedProducts.exists()) {
      transaction.set(references.savedProducts, { productIds: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    }
    if (!couponsMeta.exists()) {
      transaction.set(references.couponsMeta, {
        _system: true,
        initialized: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  });
}

export async function ensureUsersDataStructures(users = []) {
  return Promise.all(
    users
      .map((user) => String(user?.id || user?.uid || ""))
      .filter(Boolean)
      .map((userId) => ensureUserDataStructure(userId)),
  );
}

export async function decreaseProductStocks(items = []) {
  const quantities = new Map();
  items.forEach((item) => {
    const id = String(item.id || item.productId || "");
    const quantity = Math.max(0, Number(item.quantity || 0));
    if (id && quantity) quantities.set(id, (quantities.get(id) || 0) + quantity);
  });
  if (!quantities.size) throw new Error("구매할 상품 정보가 없습니다.");

  const database = requireDb();
  return runTransaction(database, async (transaction) => {
    const entries = [...quantities.entries()].map(([id, quantity]) => ({
      id, quantity, reference: doc(database, "adminProducts", id),
    }));
    const snapshots = await Promise.all(
      entries.map((entry) => transaction.get(entry.reference)),
    );

    entries.forEach((entry, index) => {
      const snapshot = snapshots[index];
      // Firebase에 재고가 설정된 상품부터 재고 관리를 적용한다.
      if (!snapshot.exists() || snapshot.data().stock == null) return;
      const stock = Number(snapshot.data().stock);
      if (!Number.isFinite(stock) || stock < entry.quantity) {
        const error = new Error(
          stock <= 0
            ? `${snapshot.data().name || "상품"}은(는) 품절되었습니다.`
            : `${snapshot.data().name || "상품"}의 재고가 부족합니다. (남은 수량 ${Math.max(0, stock)}개)`,
        );
        error.code = "insufficient-stock";
        throw error;
      }
    });

    entries.forEach((entry, index) => {
      const snapshot = snapshots[index];
      if (!snapshot.exists() || snapshot.data().stock == null) return;
      transaction.update(entry.reference, {
        stock: Number(snapshot.data().stock) - entry.quantity,
        updatedAt: serverTimestamp(),
      });
    });
  });
}

export async function getCartItems(userId) {
  if (!db || !userId) return [];
  const snapshot = await getDoc(doc(db, "users", userId, "shop", "cart"));
  const items = snapshot.data()?.items;
  return Array.isArray(items) ? items : [];
}

export async function saveCartItems(userId, items) {
  if (!userId) throw new Error("장바구니를 저장할 사용자 정보가 없습니다.");
  const safeItems = JSON.parse(JSON.stringify(Array.isArray(items) ? items : []));
  return setDoc(
    doc(requireDb(), "users", userId, "shop", "cart"),
    { items: safeItems, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function getSavedProductIds(userId) {
  if (!db || !userId) return [];
  const snapshot = await getDoc(doc(db, "users", userId, "shop", "savedProducts"));
  const productIds = snapshot.data()?.productIds;
  return Array.isArray(productIds) ? productIds.filter(Boolean) : [];
}

export async function saveSavedProductIds(userId, productIds) {
  if (!userId) throw new Error("찜한 상품을 저장할 사용자 정보가 없습니다.");
  return setDoc(
    doc(requireDb(), "users", userId, "shop", "savedProducts"),
    {
      productIds: Array.from(new Set(Array.isArray(productIds) ? productIds.filter(Boolean) : [])),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getFavoriteTrips(userId) {
  if (!db || !userId) return [];
  const snapshot = await getDocs(collection(db, "users", userId, "favoriteTrips"));
  return snapshot.docs.map((item) => item.id);
}

export async function saveFavoriteTrip(userId, tripId) {
  if (!userId || !tripId) throw new Error("찜할 일정 정보가 올바르지 않습니다.");
  return setDoc(
    doc(requireDb(), "users", userId, "favoriteTrips", tripId),
    { tripId, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function deleteFavoriteTrip(userId, tripId) {
  if (!userId || !tripId) throw new Error("삭제할 일정 정보가 올바르지 않습니다.");
  return deleteDoc(doc(requireDb(), "users", userId, "favoriteTrips", tripId));
}

export async function getUserCoupons(userId) {
  if (!userId) return [];

  const snapshot = await getDocs(
    collection(requireDb(), "users", userId, "coupons"),
  );

  return snapshot.docs
    .map((couponDocument) => ({
      id: couponDocument.id,
      ...couponDocument.data(),
    }))
    .filter((coupon) => !coupon._system)
    .sort((a, b) => (b.issuedAt?.seconds || 0) - (a.issuedAt?.seconds || 0));
}
