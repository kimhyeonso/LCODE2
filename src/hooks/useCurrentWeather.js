import { useEffect, useState } from "react";

const countryCodes = {
  korea: "KR",
  japan: "JP",
  china: "CN",
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
      try {
        const searchCity = city.split("·")[0].trim();
        const countryCode = countryCodes[country.toLowerCase()] || "";
        const geocodingParams = new URLSearchParams({
          name: searchCity,
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
        const location = locationData.results?.[0];
        if (!location) throw new Error("검색된 도시 없음");

        const forecastParams = new URLSearchParams({
          latitude: String(location.latitude),
          longitude: String(location.longitude),
          current: "temperature_2m,weather_code",
          timezone: "auto",
        });
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?${forecastParams}`,
          { signal: controller.signal },
        );
        if (!weatherResponse.ok) throw new Error("날씨 조회 실패");

        const weatherData = await weatherResponse.json();
        setWeather({
          temperature: Math.round(weatherData.current.temperature_2m),
          label: getWeatherLabel(weatherData.current.weather_code),
          loading: false,
          error: false,
        });
      } catch (error) {
        if (error.name === "AbortError") return;
        setWeather({
          temperature: null,
          label: "정보 없음",
          loading: false,
          error: true,
        });
      }
    }

    loadWeather();
    return () => controller.abort();
  }, [city, country]);

  return weather;
}
