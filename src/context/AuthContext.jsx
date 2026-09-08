import { useEffect, useState } from "react";
import { observeAuth, login, logout, signup } from "../services/authService";
import { getUserProfile } from "../services/firestoreService";
import { AuthContext } from "./auth-context";
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, profile: null, loading: true });
  useEffect(() => {
    let active = true;
    let authVersion = 0;
    const unsubscribe = observeAuth(async (user) => {
      const version = ++authVersion;
      if (!user) {
        if (active) setState({ user: null, profile: null, loading: false });
        return;
      }
      if (active) setState({ user: null, profile: null, loading: true });
      try {
        const profile = await getUserProfile(user.uid);
        if (active && version === authVersion) setState({ user, profile, loading: false });
      } catch {
        if (active && version === authVersion) setState({ user, profile: null, loading: false });
      }
    });
    return () => {
      active = false;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);
  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
