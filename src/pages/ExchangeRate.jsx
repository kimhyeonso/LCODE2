import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ExchangeRate.module.scss";
import { getExchangeRates } from "../services/exchangeRateApi";

const initialRates = [
  { code: "JPY", name: "일본 엔", country: "Japan", flag: "🇯🇵", rate: 920, change: "+0.18%", baseUnit: 100, travel: true },
  { code: "USD", name: "미국 달러", country: "United States", flag: "🇺🇸", rate: 1380, change: "-0.12%", baseUnit: 1 },
  { code: "EUR", name: "유로", country: "Europe", flag: "🇪🇺", rate: 1510, change: "+0.05%", baseUnit: 1 },
  { code: "CNY", name: "중국 위안", country: "China", flag: "🇨🇳", rate: 190, change: "-0.08%", baseUnit: 1 },
  { code: "GBP", name: "영국 파운드", country: "United Kingdom", flag: "🇬🇧", rate: 1750, change: "+0.22%", baseUnit: 1 },
  { code: "THB", name: "태국 바트", country: "Thailand", flag: "🇹🇭", rate: 38, change: "+0.30%", baseUnit: 1 },
  { code: "VND", name: "베트남 동", country: "Vietnam", flag: "🇻🇳", rate: 53, change: "-0.04%", baseUnit: 100 },
  { code: "TWD", name: "대만 달러", country: "Taiwan", flag: "🇹🇼", rate: 43, change: "+0.09%", baseUnit: 1 },
];

const quickAmounts = [500, 1000, 5000, 10000];

const ExchangeRate = () => {
  const [currency, setCurrency] = useState("JPY");
  const [amount, setAmount] = useState(0);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState(null);
  const [isConvertReversed, setIsConvertReversed] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rateList, setRateList] = useState(initialRates);
  const selectedRate = rateList.find((item) => item.code === currency) || rateList[0];
  const convertedAmount = (Number(amount) * selectedRate.rate) / selectedRate.baseUnit;
  const filteredRates = rateList.filter((item) => {
    const text = `${item.code} ${item.name} ${item.country}`.toLowerCase();
    return text.includes(searchText.toLowerCase());
  });

  useEffect(() => {
    const loadExchangeRates = async () => {
      try {
        const apiRates = await getExchangeRates();
        setRateList((currentRates) => currentRates.map((item) => {
          const apiRate = apiRates.find((rate) => rate.code === item.code);
          return apiRate ? { ...item, ...apiRate } : item;
        }));
      } catch {
        // API를 불러오지 못하면 처음에 넣어 둔 값으로 화면을 보여줍니다.
      }
    };

    loadExchangeRates();
  }, []);

  const changeCurrency = (code) => {
    setCurrency(code);
    setAmount(0);
    setSelectedQuickAmount(null);
    setSearchText("");
    setIsCurrencyOpen(false);
  };

  const changeOtherRate = (code) => {
    changeCurrency(code);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const moneySign = selectedRate.code === "JPY" ? "¥" : selectedRate.code;
  const quickMoneySign = isConvertReversed ? "₩" : moneySign;

  const handleAmountChange = (value) => {
    setAmount(value);
    const quickValue = isConvertReversed
      ? (Number(value) * selectedRate.rate) / selectedRate.baseUnit
      : Number(value);
    setSelectedQuickAmount(quickAmounts.includes(quickValue) ? quickValue : null);
  };

  const selectQuickAmount = (value) => {
    const foreignAmount = isConvertReversed
      ? (value * selectedRate.baseUnit) / selectedRate.rate
      : value;
    setAmount(foreignAmount);
    setSelectedQuickAmount(value);
  };

  const handleKrwAmountChange = (value) => {
    setAmount((Number(value) * selectedRate.baseUnit) / selectedRate.rate);
    setSelectedQuickAmount(quickAmounts.includes(Number(value)) ? Number(value) : null);
  };

  return (
    <main className={styles.page}>
      <Link to="/" className={styles.backButton}>← BACK</Link>
      <header className={styles.intro}>
        <p>EXCHANGE</p>
        <h1>TRAVEL<br />EXCHANGE</h1>
        <div>
          <span>실시간 환율로 여행 경비를<br />더 정확하게 계획해보세요</span>
          <small>기준: 원 (KRW)</small>
        </div>
      </header>

      <section className={styles.currencySection}>
        <button type="button" className={styles.currencySelect} onClick={() => setIsCurrencyOpen(true)}>
          <span className={styles.flag}>{selectedRate.flag}</span>
          <span className={styles.currencyText}><small>{selectedRate.code}</small>{selectedRate.name}</span>
          {selectedRate.travel && <b>여행 예정</b>}
          <span className={styles.arrow}>⌄</span>
        </button>

        <article className={styles.rateCard}>
          <p>{selectedRate.baseUnit} {selectedRate.code}</p>
          <strong>{selectedRate.rate.toLocaleString()}<em>원</em></strong>
          <span>≈ ₩{selectedRate.rate.toLocaleString()}</span>
          <div>
            <span>전일 대비 <b>{selectedRate.change} {selectedRate.change.startsWith("-") ? "▼" : "▲"}</b></span>
            <time>{selectedRate.date || "환율 정보 확인 중"}</time>
          </div>
        </article>
      </section>

      <section className={styles.convertSection}>
        <h2>QUICK CONVERT</h2>
        {isConvertReversed ? (
          <label className={styles.amountBox}>
            <span>KRW</span>
            <div><i>₩</i><input type="number" min="0" value={Math.round(convertedAmount)} onChange={(e) => handleKrwAmountChange(e.target.value)} /></div>
          </label>
        ) : (
          <label className={styles.amountBox}>
            <span>{selectedRate.code}</span>
            <div><i>{moneySign}</i><input type="number" min="0" value={amount} onChange={(e) => handleAmountChange(e.target.value)} /></div>
          </label>
        )}
        <button type="button" className={styles.swap} onClick={() => setIsConvertReversed(!isConvertReversed)} aria-label="통화 위치 바꾸기">⇄</button>
        {isConvertReversed ? (
          <div className={`${styles.amountBox} ${styles.krwBox}`}>
            <span>{selectedRate.code}</span>
            <div><i>{moneySign}</i><strong>{Number(amount).toLocaleString()}</strong></div>
          </div>
        ) : (
          <div className={`${styles.amountBox} ${styles.krwBox}`}>
            <span>KRW</span>
            <div><i>₩</i><strong>{convertedAmount.toLocaleString()}</strong></div>
          </div>
        )}
        <h3>QUICK AMOUNT</h3>
        <div className={styles.quickButtons}>
          {quickAmounts.map((item) => (
            <button className={selectedQuickAmount === item ? styles.activeQuickAmount : ""} key={item} onClick={() => selectQuickAmount(item)}>{item >= 1000 ? `${quickMoneySign}${item / 1000}K` : `${quickMoneySign}${item}`}</button>
          ))}
        </div>
      </section>

      <section className={styles.otherRates}>
        <div className={styles.otherTitle}><h2>OTHER RATES</h2></div>
        {rateList.map((item) => (
          <button className={`${styles.rateRow} ${currency === item.code ? styles.selectedRate : ""}`} key={item.code} onClick={() => changeOtherRate(item.code)}>
            <span className={styles.flag}>{item.flag}</span>
            <span className={styles.rateName}><small>{item.code}</small>{item.name}</span>
            <span className={styles.rateNumber}>₩{item.rate.toLocaleString()}<small className={item.change.startsWith("-") ? styles.down : ""}>{item.change}</small></span>
          </button>
        ))}
      </section>

      {isCurrencyOpen && (
        <div className={styles.selectorLayer} role="dialog" aria-modal="true" aria-label="통화 선택">
          <button className={styles.selectorOverlay} onClick={() => setIsCurrencyOpen(false)} aria-label="닫기" />
          <section className={styles.selectorSheet}>
            <header>
              <h2>CURRENCY SELECT</h2>
              <button onClick={() => setIsCurrencyOpen(false)}>닫기 ×</button>
            </header>
            <label className={styles.searchBox}>
              <span>⌕</span>
              <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="국가 또는 통화 검색" autoFocus />
            </label>
            <p className={styles.popularTitle}>자주 보는 환율</p>
            <div className={styles.popularList}>
              {rateList.slice(0, 4).map((item) => (
                <button className={currency === item.code ? styles.activeCurrency : ""} key={item.code} onClick={() => changeCurrency(item.code)}>{item.flag} {item.code}</button>
              ))}
            </div>
            <div className={styles.currencyList}>
              {filteredRates.map((item) => (
                <button className={currency === item.code ? styles.selectedCurrency : ""} key={item.code} onClick={() => changeCurrency(item.code)}>
                  <span className={styles.flag}>{item.flag}</span>
                  <span className={styles.listName}><strong>{item.code}</strong>{item.name}<small>{item.name.split(" ")[0]} · {item.country}</small></span>
                  <span className={styles.listRate}>₩{item.rate.toLocaleString()}<small className={item.change.startsWith("-") ? styles.down : ""}>{item.change}</small></span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default ExchangeRate;
