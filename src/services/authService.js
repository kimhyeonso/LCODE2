import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { firebaseApp } from "../firebase/config";
import { createUserProfile } from "./firestoreService";
const auth = firebaseApp ? getAuth(firebaseApp) : null;
export function observeAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
const requireAuth = () => {
  if (!auth)
    throw new Error("Firebase가 설정되지 않았습니다. .env를 확인해 주세요.");
  return auth;
};
export const login = (email, password) =>
  signInWithEmailAndPassword(requireAuth(), email, password);
export async function signup(email, password, name) {
  const credential = await createUserWithEmailAndPassword(
    requireAuth(),
    email,
    password,
  );
  if (name) await updateProfile(credential.user, { displayName: name });
  await createUserProfile({
    uid: credential.user.uid,
    email: credential.user.email,
    nickname: name,
  });
  return credential;
}
export const logout = () => (auth ? signOut(auth) : Promise.resolve());