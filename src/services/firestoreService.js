import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
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
export async function getPlan(id) {
  const snap = await getDoc(doc(requireDb(), "plans", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}