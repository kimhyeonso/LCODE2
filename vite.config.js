import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

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

const dateText = (date) => date.toISOString().slice(0, 10).replaceAll("-", "");

const ecosApi = () => {
  let apiKey = "";
  let cachedRates = null;
  let cacheTime = 0;

  const loadRates = async () => {
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
        if (!response.ok) throw new Error("한국은행 API 요청에 실패했습니다.");

        const data = await response.json();
        const rows = data.StatisticSearch?.row || [];
        const latest = rows.at(-1);
        const previous = rows.at(-2);
        if (!latest) return null;

        const rate = Number(latest.DATA_VALUE);
        const previousRate = Number(previous?.DATA_VALUE);
        const change = previousRate
          ? `${((rate - previousRate) / previousRate * 100).toFixed(2)}%`
          : "0.00%";

        return {
          code,
          rate,
          change: change.startsWith("-") ? change : `+${change}`,
          date: latest.TIME,
          baseUnit: item.baseUnit,
        };
      })
    );

    cachedRates = rates.filter(Boolean);
    cacheTime = Date.now();
    return cachedRates;
  };

  return {
    name: "ecos-exchange-rate-api",
    config(_, { mode }) {
      apiKey = loadEnv(mode, process.cwd(), "").ECOS_API_KEY || "";
    },
    configureServer(server) {
      server.middlewares.use("/api/exchange-rates", async (request, response) => {
        if (request.method !== "GET") {
          response.statusCode = 405;
          response.end();
          return;
        }

        response.setHeader("Content-Type", "application/json; charset=utf-8");

        if (!apiKey) {
          response.statusCode = 500;
          response.end(JSON.stringify({ message: "ECOS_API_KEY가 설정되지 않았습니다." }));
          return;
        }

        try {
          response.end(JSON.stringify({ rates: await loadRates() }));
        } catch {
          response.statusCode = 502;
          response.end(JSON.stringify({ message: "환율 정보를 불러오지 못했습니다." }));
        }
      });
    },
  };
};

export default defineConfig({
  plugins: [react(), ecosApi()],
});
