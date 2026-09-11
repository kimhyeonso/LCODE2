import { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "../firebase/config";

export function useHomeViewers() {
  const [count, setCount] = useState(null);
  useEffect(() => {
    if (!firebaseApp) return undefined;
    let active = true;
    let pending = false;
    let visitorId;
    try {
      visitorId = localStorage.getItem("lcode-home-visitor");
      if (!/^[0-9a-f-]{36}$/i.test(visitorId || "")) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("lcode-home-visitor", visitorId);
      }
    } catch { visitorId = crypto.randomUUID(); }
    const heartbeat = httpsCallable(getFunctions(firebaseApp, "asia-northeast3"), "homePresence", { timeout: 15000 });
    const update = async () => {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const { data } = await heartbeat({ visitorId });
        if (active) setCount(Number.isInteger(data.count) && data.count >= 0 ? data.count : null);
      } catch { if (active) setCount(null); }
      finally { pending = false; }
    };
    update();
    const timer = setInterval(update, 25000);
    document.addEventListener("visibilitychange", update);
    return () => { active = false; clearInterval(timer); document.removeEventListener("visibilitychange", update); };
  }, []);
  return count;
}
