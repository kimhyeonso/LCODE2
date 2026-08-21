import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
const requireDb = () => {
  if (!db) throw new Error("Firebase is not configured");
  return db;
};
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
