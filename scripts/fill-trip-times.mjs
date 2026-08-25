import { readFileSync, writeFileSync } from "node:fs";

const filePath = new URL("../src/data/trip_road.json", import.meta.url);
const data = JSON.parse(readFileSync(filePath, "utf8"));

const stayMinutes = {
  airport: 75,
  station: 20,
  hotel: 30,
  attraction: 90,
  restaurant: 75,
};

const parseTime = (time) => {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes) => {
  const normalized = Math.min(minutes, 23 * 60 + 30);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const getTravelMinutes = (transport = "") => {
  const hourMatch = transport.match(/(\d+)\s*시간/);
  const minuteMatch = transport.match(/(\d+)\s*분/);
  const hours = hourMatch ? Number(hourMatch[1]) * 60 : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
  return hours + minutes || 20;
};

for (const trip of data.trips) {
  for (const day of trip.days) {
    let currentMinutes = 9 * 60;

    for (const item of day.items) {
      if (item.type === "place") {
        const existingTime = parseTime(item.time);

        if (existingTime !== null) {
          currentMinutes = existingTime;
        } else {
          item.time = formatTime(currentMinutes);
        }

        currentMinutes += stayMinutes[item.category] || 60;
      }

      if (item.type === "transport") {
        currentMinutes += getTravelMinutes(item.transport);
      }
    }
  }
}

writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
