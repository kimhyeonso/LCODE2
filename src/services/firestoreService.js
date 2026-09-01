import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
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
