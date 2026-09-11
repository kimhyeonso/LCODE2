import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getExchangeRates } from "../services/exchangeRateApi";
import styles from "../pages/Home.module.scss";

export default function HomeExchange() {
  const [state, setState] = useState({ rate: null, loading: true, error: false });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let controller;
    const load = async () => {
      controller?.abort();
      controller = new AbortController();
      const request = controller;
      const timeout = setTimeout(() => request.abort(), 15000);
      try {
        const rates = await getExchangeRates({ signal: request.signal });
        const rate = rates.find((item) => item.code === "JPY");
        if (!rate || !Number.isFinite(rate.rate) || rate.rate <= 0 || rate.baseUnit !== 100 || !/^\d{8}$/.test(rate.date)) throw new Error("Invalid JPY rate");
        if (active) setState({ rate, loading: false, error: false });
      } catch {
        if (active) setState({ rate: null, loading: false, error: true });
      } finally { clearTimeout(timeout); }
    };
    load();
    const timer = setInterval(load, 10 * 60 * 1000);
    return () => { active = false; controller?.abort(); clearInterval(timer); };
  }, [attempt]);
  const { rate, loading, error } = state;
  return (
    <div>
      <Link to="/destination?currency=JPY" className={styles.exchangeCard} aria-label="일본 엔 환율 상세 보기">
        <div><span>100 JPY / KRW</span><strong>{rate ? rate.rate.toLocaleString("ko-KR", { maximumFractionDigits: 2 }) : "—"}</strong></div>
        <footer>
          <span>{rate ? `전일 대비 ${rate.change}` : loading ? "환율을 불러오는 중" : "환율 조회 실패"}</span>
          <span>자세히 보기 →</span>
        </footer>
      </Link>
      <div className={styles.exchangeStatus} aria-live="polite">
        {rate && <span>한국은행 · {rate.date.replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3")} 고시 기준</span>}
        {error && <button type="button" onClick={() => { setState({ rate: null, loading: true, error: false }); setAttempt((value) => value + 1); }}>환율 다시 불러오기</button>}
      </div>
    </div>
  );
}
