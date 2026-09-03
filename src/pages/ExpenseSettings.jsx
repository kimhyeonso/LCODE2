import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import tripRoad from "../data/trip_road.json";
import BudgetOptionCards from "../components/BudgetOptionCards";
import ExpenseCategoryList from "../components/ExpenseCategoryList";
import styles from "./ExpenseSettings.module.scss";

const currencyByCountry = {
  japan: { code: "JPY", symbol: "¥", rate: 9.2, note: "100 JPY ≈ ₩920" },
  china: { code: "CNY", symbol: "CN¥", rate: 190, note: "1 CNY ≈ ₩190" },
  korea: { code: "KRW", symbol: "₩", rate: 1, note: "1 KRW" },
};

const countryAliases = {
  japan: "japan", "일본": "japan", china: "china", "중국": "china",
  korea: "korea", "한국": "korea", "south korea": "korea",
};

const cityAliases = { FUKUOKA: "후쿠오카", TOKYO: "도쿄", SEOUL: "서울", SHANGHAI: "상하이" };
const formatWon = (amount) => `₩${amount.toLocaleString("ko-KR")}`;

const localAmount = (amount, currency) => {
  if (currency.code === "KRW") return formatWon(amount);
  return `${currency.symbol}${(amount / currency.rate).toLocaleString("ja-JP", { maximumFractionDigits: 2 })}`;
};

export default function ExpenseSettings() {
  const [params] = useSearchParams();
  const selectedMode = params.get("budgetMode");
  const incomingBudget = Number(params.get("budget"));
  const [selection, setSelection] = useState(() => selectedMode === "none" ? "none" : "custom");
  const [budget, setBudget] = useState(() => (
    selectedMode === "custom" && Number.isFinite(incomingBudget) && incomingBudget > 0
      ? incomingBudget
      : 400000
  ));
  const planLink = params.toString() ? `/plan?${params.toString()}` : "/plan";

  const trip = useMemo(() => {
    const tripId = params.get("trip");
    const cityParam = params.get("city")?.toUpperCase();
    const city = cityAliases[cityParam] || params.get("city");
    return tripRoad.trips.find((item) => item.id === tripId)
      || tripRoad.trips.find((item) => item.city === city)
      || tripRoad.trips.find((item) => item.city === "후쿠오카")
      || tripRoad.trips[0];
  }, [params]);

  const days = Math.max(trip?.days?.length || 0, 1);
  const nights = Math.max(days - 1, 1);
  const countryKey = String(trip?.country || "").trim().toLowerCase();
  const currency = currencyByCountry[countryAliases[countryKey] || countryKey] || currencyByCountry.japan;
  const expenseRows = [
    ["교통", 40000 + nights * 5000], ["식비", days * 30000], ["카페", 5000 + nights * 10000],
    ["관광 / 입장료", nights * 15000], ["쇼핑", 50000], ["기타", 15000],
  ];
  const packageExpense = expenseRows.reduce((total, [, amount]) => total + amount, 0);
  const parsedBudget = Number(String(budget).replace(/[^0-9]/g, "")) || 0;
  const selectedBudget = selection === "none" ? packageExpense : parsedBudget;
  const cityName = trip?.city || "후쿠오카";
  const duration = trip?.duration || `${days}일`;

  return (
    <main className={styles.expenseSettings}>
      <div className={styles.pageInner}>
        <Link className={styles.backButton} to={planLink}>← BACK</Link>
        <header className={styles.pageHeader}>
          <span>TRAVEL BUDGET</span>
          <h1>여행 경비 설정</h1>
        </header>

        <section className={styles.package} aria-labelledby="package-title">
          <p>SELECTED PACKAGE</p>
          <h2 id="package-title"><b>{cityName.toUpperCase()}</b><span>{cityName} · {duration}</span></h2>
        </section>

        <section className={styles.expenseCard} aria-labelledby="expense-title">
          <p>패키지 예상 경비</p>
          <h2 id="expense-title">약 {formatWon(packageExpense)}</h2>
          <div className={styles.exchangeBox}>
            <div><small>현재 환율 기준</small><strong>{localAmount(packageExpense, currency)}</strong></div>
            <time dateTime="2026-08-31T15:30:00">최근 업데이트<br />2026.08.31 15:30</time>
          </div>
          <Link className={styles.exchangeLink} to={`/destination?currency=${currency.code}`}>환율 자세히 보기 <span>→</span></Link>
          <p className={styles.exclude}>항공권 · 숙박비 제외</p>
          <div className={styles.categoryList}><ExpenseCategoryList rows={expenseRows} currency={currency} /></div>
        </section>

        <p className={styles.guide}>이번 여행에서 사용할 현지 경비를 설정해보세요.<br />패키지 예상 경비를 참고해 자유롭게 설정할 수 있습니다.</p>

        <section className={styles.optionSection} aria-labelledby="option-title">
          <p id="option-title">경비 설정 방법 선택</p>
          <BudgetOptionCards value={selection} onChange={setSelection} />
        </section>

        {selection === "custom" ? (
          <section className={styles.customBudget} aria-labelledby="recommended-title">
            <p id="recommended-title">빠른 선택</p>
            <div className={styles.recommendations}>
              {[400000, 350000, 300000].map((amount, index) => (
                <button key={amount} type="button" className={parsedBudget === amount ? styles.selected : ""} onClick={() => setBudget(amount)}>
                  <small>{["여유롭게", "추천", "알뜰하게"][index]}</small><strong>{formatWon(amount)}</strong>
                </button>
              ))}
            </div>
            <label className={styles.budgetInput}>
              <span>직접 입력</span>
              <input type="text" inputMode="numeric" value={parsedBudget ? formatWon(parsedBudget) : ""} placeholder="₩ 경비 입력" onChange={(event) => setBudget(event.target.value.replace(/[^0-9]/g, ""))} aria-label="직접 입력할 여행 경비" />
            </label>
            <p className={styles.inputNote}>항공권 · 숙박비 제외</p>
          </section>
        ) : (
          <section className={styles.noneBudget} aria-label="선택한 예상 경비">
            <p>패키지 예상 현지 경비</p><strong>약 {formatWon(packageExpense)}</strong><em>약 {localAmount(packageExpense, currency)}</em><small>항공권 · 숙박비 제외</small>
          </section>
        )}

        <Link className={styles.submitButton} to={`/plan?trip=${encodeURIComponent(trip?.id || "")}&budget=${selectedBudget}&budgetMode=${selection}`}>이 경비로 일정 보기 <span>→</span></Link>
      </div>
    </main>
  );
}
