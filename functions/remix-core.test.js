const test = require("node:test");
const assert = require("node:assert/strict");
const { prepare, applyDecision } = require("./remix-core");
const plan = { city: "서울", userId: "owner", days: [{ items: [
  { type: "place", place: "공항", category: "airport", time: "09:00" },
  { type: "transport", transport: "도보 10분" },
  { type: "place", place: "공원", category: "attraction", time: "10:00" },
  { type: "transport", transport: "도보 15분" },
  { type: "place", place: "예약 식당", category: "restaurant", reserved: true, time: "12:00" },
] }, { items: [{ type: "place", place: "호텔", category: "hotel", time: "18:00" }] }] };
const catalog = [
  { id: "museum", city: "서울", place: "미술관", category: "attraction", indoor: true },
  { id: "outside", city: "서울", place: "야외 광장", category: "attraction", indoor: false },
  { id: "other-city", city: "부산", place: "박물관", category: "attraction", indoor: true },
];
const context = prepare(plan, { reason: "rain", dayIndex: 0 }, catalog);
const decision = { summary: "실내 장소를 제안합니다.", changes: [{ type: "replace", fromId: "p2", toId: "museum" }] };
test("rain candidates stay in city and indoors", () => assert.deepEqual(context.candidates.map((p) => p.id), ["museum"]));
test("replacement preserves time, other days, and original; invalidates route estimates", () => {
  const result = applyDecision(plan, context, decision);
  assert.equal(result.days[0].items[2].place, "미술관");
  assert.equal(result.days[0].items[2].time, "10:00");
  assert.equal(result.days[0].items[1].transport, "이동 경로 확인 필요");
  assert.equal(result.days[0].items[3].transport, "이동 경로 확인 필요");
  assert.deepEqual(result.days[1], plan.days[1]);
  assert.equal(plan.days[0].items[2].place, "공원");
  assert.equal(result.savedKm, "—");
});
test("reject hallucinated candidate and source IDs", () => {
  for (const change of [{ type: "replace", fromId: "p2", toId: "fake" }, { type: "replace", fromId: "p99", toId: "museum" }]) {
    assert.throws(() => applyDecision(plan, context, { summary: "", changes: [change] }));
  }
});
test("airport and reservation cannot be changed", () => {
  for (const fromId of ["p0", "p4"]) assert.throws(() => applyDecision(plan, context, { ...decision, changes: [{ type: "replace", fromId, toId: "museum" }] }));
});
test("reject duplicates and removals in rain flow", () => {
  assert.throws(() => applyDecision(plan, context, { ...decision, changes: [decision.changes[0], decision.changes[0]] }));
  assert.throws(() => applyDecision(plan, context, { ...decision, changes: [{ type: "remove", fromId: "p2", toId: null }] }));
});
test("tired removal preview matches days and marks removed stop", () => {
  const tired = prepare(plan, { reason: "tired", dayIndex: 0 }, catalog);
  const result = applyDecision(plan, tired, { summary: "휴식을 확보하세요.", changes: [{ type: "remove", fromId: "p2", toId: null }] });
  assert.equal(result.afterRows.length, 2);
  assert.equal(result.beforeRows[1][2], "REMOVED");
  assert.ok(!result.days[0].items.some((p) => p.place === "공원"));
});
test("versioned cache changes when source, reason, or catalog changes", () => {
  assert.equal(prepare(plan, { reason: "rain" }, catalog).key, context.key);
  assert.notEqual(prepare({ ...plan, updatedAt: 1 }, { reason: "rain" }, catalog).key, context.key);
  assert.notEqual(prepare(plan, { reason: "closed" }, catalog).key, context.key);
  assert.notEqual(prepare(plan, { reason: "rain" }, []).key, context.key);
});
test("no change is valid; invalid reason/day is rejected", () => {
  assert.deepEqual(applyDecision(plan, context, { summary: "유지", changes: [] }).days, plan.days);
  assert.throws(() => prepare(plan, { reason: "bad" }, catalog));
  assert.throws(() => prepare(plan, { reason: "rain", dayIndex: -1 }, catalog));
});
