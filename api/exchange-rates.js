const currencyItems = {
  JPY: { itemCode: "0000002", baseUnit: 100 },
  USD: { itemCode: "0000001", baseUnit: 1 },
  EUR: { itemCode: "0000003", baseUnit: 1 },
  CNY: { itemCode: "0000053", baseUnit: 1 },
  GBP: { itemCode: "0000012", baseUnit: 1 },
  THB: { itemCode: "0000028", baseUnit: 1 },
  VND: { itemCode: "0000035", baseUnit: 100 },
  TWD: { itemCode: "0000031", baseUnit: 1 },
};

let cachedRates = null;
let cacheTime = 0;

const dateText = (date) => date.toISOString().slice(0, 10).replaceAll("-", "");

const loadRates = async (apiKey) => {
  if (cachedRates && Date.now() - cacheTime < 10 * 60 * 1000) return cachedRates;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 45);

  const rates = await Promise.all(
    Object.entries(currencyItems).map(async ([code, item]) => {
      const url = [
        "https://ecos.bok.or.kr/api/StatisticSearch",
        apiKey,
        "json",
        "kr",
        "1",
        "100",
        "731Y001",
        "D",
        dateText(startDate),
        dateText(endDate),
        item.itemCode,
      ].join("/");

      const response = await fetch(url);
      if (!response.ok) throw new Error("ECOS request failed");

      const data = await response.json();
      const rows = data.StatisticSearch?.row || [];
      const latest = rows.at(-1);
      const previous = rows.at(-2);
      if (!latest) return null;

      const rate = Number(latest.DATA_VALUE);
      const previousRate = Number(previous?.DATA_VALUE);
      const change = previousRate
        ? `${(((rate - previousRate) / previousRate) * 100).toFixed(2)}%`
        : "0.00%";

      return {
        code,
        rate,
        change: change.startsWith("-") ? change : `+${change}`,
        date: latest.TIME,
        baseUnit: item.baseUnit,
      };
    }),
  );

  cachedRates = rates.filter(Boolean);
  cacheTime = Date.now();
  return cachedRates;
};

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ message: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ECOS_API_KEY;

  if (!apiKey) {
    response.status(500).json({ message: "ECOS_API_KEY is not configured" });
    return;
  }

  try {
    response.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=3600");
    response.status(200).json({ rates: await loadRates(apiKey) });
  } catch {
    response.status(502).json({ message: "Failed to load exchange rates" });
  }
}
