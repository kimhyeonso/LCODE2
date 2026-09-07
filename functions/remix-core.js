const { createHash } = require("node:crypto");

const REASONS = ["rain", "delay", "traffic", "closed", "tired", "cost", "auto"];
const VERSION = "remix-v1";
const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const protectedPlace = (item) => ["airport", "station", "hotel"].includes(item.category)
  || Boolean(item.locked || item.isLocked || item.isFixed || item.reserved || item.bookingId || item.completed);

function prepare(plan, input, catalog) {
  const { reason, dayIndex = 0 } = input;
  if (!REASONS.includes(reason) || !Number.isInteger(dayIndex) || dayIndex < 0 || !plan.days?.[dayIndex]) {
    throw new Error("invalid-input");
  }
  const items = plan.days[dayIndex].items;
  if (!Array.isArray(items) || items.length > 60 || !items.some((item) => item.type === "place")) throw new Error("invalid-plan");
  const places = items.flatMap((item, index) => item.type === "place" ? [{
    id: `p${index}`, name: String(item.place || "").slice(0, 100),
    category: item.category || "", time: item.time || "", protected: protectedPlace(item),
  }] : []);
  const names = new Set((plan.days || []).flatMap((day) => (day.items || []).map((item) => item.place)));
  const candidates = catalog.filter((item) => item.city === plan.city && !names.has(item.place)
    && (reason !== "rain" || item.indoor === true)).slice(0, 5);
  const revision = digest({ city: plan.city, days: plan.days, updatedAt: plan.updatedAt || null });
  return { reason, dayIndex, places, candidates, revision,
    key: digest({ version: VERSION, revision, reason, dayIndex, candidates }) };
}

function applyDecision(plan, context, decision) {
  if (!decision || !Array.isArray(decision.changes) || decision.changes.length > 2
    || typeof decision.summary !== "string" || decision.summary.length > 240) throw new Error("invalid-output");
  const used = new Set();
  const selected = new Set();
  const changes = decision.changes.map((change) => {
    const place = context.places.find((item) => item.id === change.fromId);
    if (!place || place.protected || used.has(place.id)) throw new Error("protected-or-invalid-place");
    used.add(place.id);
    if (!["replace", "remove"].includes(change.type)) throw new Error("invalid-operation");
    if (["rain", "closed"].includes(context.reason) && change.type !== "replace") throw new Error("replacement-required");
    const candidate = context.candidates.find((item) => item.id === change.toId);
    if (change.type === "replace" && (!candidate || selected.has(candidate.id))) throw new Error("invalid-candidate");
    if (change.type === "remove" && change.toId !== null) throw new Error("invalid-remove");
    if (candidate) selected.add(candidate.id);
    return { ...change, index: Number(place.id.slice(1)), before: place.name, after: candidate?.place || null, candidate };
  });
  const originalItems = plan.days[context.dayIndex].items;
  // A changed edge has no verified travel duration; never retain the old route estimate.
  const changedIndices = new Set(changes.map((item) => item.index));
  const items = originalItems.flatMap((item, index) => {
    if (item.type === "transport") {
      const previous = context.places.filter((place) => Number(place.id.slice(1)) < index).at(-1);
      const next = context.places.find((place) => Number(place.id.slice(1)) > index);
      if ([previous, next].some((place) => place && changedIndices.has(Number(place.id.slice(1))))) {
        return [{ ...item, transport: "이동 경로 확인 필요" }];
      }
      return [item];
    }
    const change = changes.find((entry) => entry.index === index);
    if (!change) return [item];
    if (change.type === "remove") return [];
    return [{ type: "place", place: change.candidate.place, category: change.candidate.category,
      image: change.candidate.image || null, time: item.time || "", recommendation: "" }];
  });
  if (!items.some((item) => item.type === "place")) throw new Error("empty-plan");
  const beforeRows = context.places.map((place) => [place.time || "--:--", place.name,
    changes.find((change) => change.fromId === place.id)?.type === "remove" ? "REMOVED" : ""]);
  const afterRows = items.filter((item) => item.type === "place").map((item) => [item.time || "--:--", item.place,
    changes.some((change) => change.after === item.place) ? "ADDED" : "SAME"]);
  return {
    revision: context.revision, originalDays: plan.days, dayIndex: context.dayIndex, summary: decision.summary,
    changes: changes.map(({ type, fromId, toId, before, after }) => ({ type, fromId, toId, before, after })),
    beforeRows, afterRows, savedKm: "—", beforeTime: beforeRows.at(-1)?.[0] || "--:--", afterTime: afterRows.at(-1)?.[0] || "--:--",
    days: plan.days.map((day, index) => index === context.dayIndex ? { ...day, items } : day),
    notice: "보유한 장소 데이터로 만든 변경안입니다. 영업 여부·날씨·이동 시간은 실시간 확인되지 않았습니다.",
  };
}

module.exports = { prepare, applyDecision, digest, VERSION };
