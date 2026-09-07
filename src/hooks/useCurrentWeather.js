import { useEffect, useState } from "react";

const countryCodes = {
  korea: "KR",
  japan: "JP",
  china: "CN",
  "한국": "KR", "대한민국": "KR", "south korea": "KR", kr: "KR",
  "일본": "JP", jp: "JP", "중국": "CN", cn: "CN",
};
const citySearchNames = {
  "서울": "Seoul", "강릉": "Gangneung", "거제": "Geoje", "부산": "Busan", "여수": "Yeosu", "제주도": "Jeju",
  "도쿄": "Tokyo", "오사카": "Osaka", "후쿠오카": "Fukuoka", "홋카이도": "Sapporo",
  "상하이": "Shanghai", "광저우": "Guangzhou", "다롄": "Dalian", "베이징": "Beijing", "시안": "Xi'an",
  "장가계": "Zhangjiajie", "청두": "Chengdu", "충칭": "Chongqing", "칭다오": "Qingdao", "하얼빈": "Harbin", "항저우": "Hangzhou",
};

const getWeatherLabel = (code) => {
  if (code === 0) return "맑음";
  if ([1, 2].includes(code)) return "대체로 맑음";
  if (code === 3) return "흐림";
  if ([45, 48].includes(code)) return "안개";
  if ([51, 53, 55, 56, 57].includes(code)) return "이슬비";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "비";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "눈";
  if ([95, 96, 99].includes(code)) return "뇌우";
  return "날씨 정보";
};

export function useCurrentWeather(city, country) {
  const [weather, setWeather] = useState({
    temperature: null,
    label: "불러오는 중",
    loading: true,
    error: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadWeather() {
      let location = null;
      const timeout = setTimeout(() => controller.abort(new Error("날씨 조회 시간 초과")), 15000);
      try {
        const searchCity = String(city || "").split("·")[0].trim();
        if (!searchCity) throw new Error("도시 정보 없음");
        const countryCode = countryCodes[String(country || "").toLowerCase()] || "";
        const geocodingParams = new URLSearchParams({
          name: citySearchNames[searchCity] || searchCity,
          count: "1",
          language: "ko",
          format: "json",
        });
        if (countryCode) geocodingParams.set("countryCode", countryCode);

        const locationResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?${geocodingParams}`,
          { signal: controller.signal },
        );
        if (!locationResponse.ok) throw new Error("위치 조회 실패");

        const locationData = await locationResponse.json();
        location = locationData.results?.[0];
        if (!location) throw new Error("검색된 도시 없음");

        const forecastParams = new URLSearchParams({
          latitude: String(location.latitude),
          longitude: String(location.longitude),
          current: "temperature_2m,weather_code",
          timezone: "auto",
          temperature_unit: "celsius",
        });
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?${forecastParams}`,
          { signal: controller.signal },
        );
        if (!weatherResponse.ok) throw new Error("날씨 조회 실패");

        const weatherData = await weatherResponse.json();
        if (!Number.isFinite(weatherData.current?.temperature_2m)) throw new Error("온도 정보 없음");
        if (controller.signal.aborted) return;
        setWeather({
          city, country, location: [location.latitude, location.longitude],
          temperature: Math.round(weatherData.current.temperature_2m),
          label: getWeatherLabel(weatherData.current.weather_code),
          loading: false,
          error: false,
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        setWeather({
          city, country, location: location ? [location.latitude, location.longitude] : null,
          temperature: null,
          label: "정보 없음",
          loading: false,
          error: true,
        });
      } finally { clearTimeout(timeout); }
    }

    loadWeather();
    return () => controller.abort();
  }, [city, country]);

  return weather.city === city && weather.country === country ? weather : { temperature: null, label: "불러오는 중", loading: true, error: false, location: null };
}
