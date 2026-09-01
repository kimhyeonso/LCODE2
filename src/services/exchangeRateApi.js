export const getExchangeRates = async () => {
  const response = await fetch("/api/exchange-rates");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "환율 정보를 불러오지 못했습니다.");
  }

  return data.rates;
};
