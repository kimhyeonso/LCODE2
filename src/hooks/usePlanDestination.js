import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { getPlans } from "../services/firestoreService";

const createdTime = (plan) => plan.createdAt?.toMillis?.()
  || (plan.createdAt?.seconds || 0) * 1000
  || plan.updatedAt?.toMillis?.()
  || 0;

export function usePlanDestination() {
  const { user, loading: authLoading } = useAuth();
  const { pathname } = useLocation();
  const [refresh, setRefresh] = useState(0);
  const [state, setState] = useState({ userId: null, destination: "/search" });

  useEffect(() => {
    const refreshPlans = () => setRefresh((value) => value + 1);
    window.addEventListener("plans-changed", refreshPlans);
    return () => window.removeEventListener("plans-changed", refreshPlans);
  }, []);

  useEffect(() => {
    if (authLoading) return undefined;
    if (!user) return undefined;

    let active = true;
    getPlans(user.uid)
      .then((plans) => {
        if (!active) return;
        const latest = [...plans].sort((a, b) => createdTime(b) - createdTime(a))[0];
        setState({
          userId: user.uid,
          destination: latest ? `/plan/saved?id=${encodeURIComponent(latest.id)}` : "/search",
        });
      })
      .catch(() => active && setState({ userId: user.uid, destination: "/search" }));

    return () => { active = false; };
  }, [authLoading, pathname, refresh, user]);

  return state.userId === user?.uid ? state.destination : "/search";
}
