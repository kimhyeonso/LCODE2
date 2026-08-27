import { useEffect, useState } from "react";
import { observeAuth, login, logout, signup } from "../services/authService";
import { AuthContext } from "./auth-context";
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true });
  useEffect(() => {
    const unsubscribe = observeAuth((user) =>
      setState({ user, loading: false }),
    );
    return typeof unsubscribe === "function" ? unsubscribe : undefined;
  }, []);
  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
