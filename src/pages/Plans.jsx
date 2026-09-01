import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPlans } from "../services/firestoreService";
import Loading from "../components/Loading";
import styles from "./Page.module.scss";
export default function Plans() {
  const [state, setState] = useState({ loading: true, plans: [], error: "" });
  useEffect(() => {
    let active = true;
    async function loadPlans() {
      try {
        const plans = await getPlans();
        if (active) setState({ loading: false, plans, error: "" });
      } catch {
        if (active)
          setState({
            loading: false,
            plans: [],
            error: "일정을 불러오지 못했습니다.",
          });
      }
    }
    loadPlans();
    return () => {
      active = false;
    };
  }, []);
  return (
    <main className={styles.page}>
      <header className={styles.title}>
        <span>MY ARCHIVE</span>
        <h1>
          저장된
          <br />
          <i>여행 계획</i>
        </h1>
      </header>
      {state.loading ? (
        <Loading />
      ) : state.error ? (
        <div className={styles.empty}>{state.error}</div>
      ) : state.plans.length ? (
        <div>
          {state.plans.map((p) => (
            <article key={p.id}>{p.title}</article>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <b>아직 저장된 여행이 없어요.</b>
          <p>AI 플래너에서 첫 여행을 만들어 보세요.</p>
          <Link to="/travel-planner">여행 만들기 →</Link>
        </div>
      )}
    </main>
  );
}
