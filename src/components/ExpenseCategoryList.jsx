const formatWon = (amount) => `₩${amount.toLocaleString("ko-KR")}`;

const formatLocalCurrency = (amount, currency) => {
  if (currency.code === "KRW") return formatWon(amount);

  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: 0,
  }).format(amount / currency.rate);
};

export default function ExpenseCategoryList({ rows, currency }) {
  return (
    <dl>
      {rows.map(([label, amount]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>
            <strong>{formatWon(amount)}</strong>
            {currency.code !== "KRW" && <small>≈ {formatLocalCurrency(amount, currency)}</small>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
