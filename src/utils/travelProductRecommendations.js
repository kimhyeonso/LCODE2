const overseasCountries = new Set([
  "japan",
  "china",
  "taiwan",
  "hong kong",
  "thailand",
  "vietnam",
  "usa",
  "france",
  "italy",
  "spain",
]);

const summerMonths = new Set([5, 6, 7, 8, 9]);
const winterMonths = new Set([11, 12, 1, 2]);

const getTravelMonth = (plan) => {
  const value = plan?.dateRange?.start;
  const matched = String(value || "").match(/^\d{4}-(\d{2})-\d{2}$/);
  return matched ? Number(matched[1]) : null;
};

const getStops = (plan) =>
  (plan?.days || []).flatMap((day) => day?.items || []);

const addCandidate = (candidates, id, score, reason) => {
  const current = candidates.get(id);
  if (!current || score > current.score) {
    candidates.set(id, { score, reason });
  }
};

// 일정에 저장된 여행지·계절·기간·장소 유형을 기준으로 현재 상품 카탈로그를 추천합니다.
// 추천은 제안만 하며 장바구니를 변경하지 않습니다.
export function getTravelProductRecommendations(plan, catalog) {
  const products = Array.isArray(catalog) ? catalog : [];
  const candidates = new Map();
  const month = getTravelMonth(plan);
  const duration = Math.max(1, plan?.days?.length || 0);
  const country = String(plan?.country || "").trim().toLowerCase();
  const isOverseas = overseasCountries.has(country) || (country && country !== "korea" && country !== "한국");
  const stops = getStops(plan);
  const hasOutdoorActivity = stops.some((stop) => ["attraction", "station"].includes(stop?.category));
  const hasWaterActivity = stops.some((stop) => /해변|바다|수영|온천|워터|beach|ocean|pool/i.test(`${stop?.place || ""} ${stop?.recommendation || ""}`));

  // 여행지
  if (isOverseas) {
    addCandidate(candidates, "P024", 100, "해외 여행지의 전원 규격에 맞춘 필수 준비물");
    addCandidate(candidates, "P029", 42, "낯선 여행지에서 바로 꺼내 보기 좋은 회화 가이드");
  } else {
    addCandidate(candidates, "P001", 40, "국내 이동 중 소지품을 간편하게 보관하는 준비물");
  }

  // 계절
  if (summerMonths.has(month)) {
    addCandidate(candidates, hasOutdoorActivity ? "S003" : "P005", 90, "더운 계절과 야외 일정에 맞춘 쿨링 준비물");
  } else if (winterMonths.has(month)) {
    addCandidate(candidates, "S006", 90, "추운 계절과 이동 시간의 보온을 위한 준비물");
  }

  // 여행 기간
  if (duration >= 4) {
    addCandidate(candidates, "S012", 80, `${duration}일 일정의 짐 정리를 돕는 패킹 세트`);
  } else {
    addCandidate(candidates, "S011", 72, `${duration}일 일정에 가볍게 챙기기 좋은 기내·세면 세트`);
  }

  // 활동 유형
  if (hasWaterActivity) {
    addCandidate(candidates, "P028", 86, "물놀이·해변·우천 가능성이 있는 일정용 방수 준비물");
  } else if (hasOutdoorActivity) {
    addCandidate(candidates, "P026", 76, "관광과 이동이 많은 일정의 지도·카메라 사용을 위한 준비물");
  } else {
    addCandidate(candidates, "S004", 65, "일정 전반에 두루 쓰기 좋은 기본 패킹 세트");
  }

  // 어떤 일정에도 최소 세 가지의 선택지가 보이도록 기본 준비물을 보충합니다.
  addCandidate(candidates, "P011", 35, "여행 중 기본 위생용품을 한 번에 챙기는 준비물");
  addCandidate(candidates, "P019", 30, "개인 상비약과 영양제를 정리하기 좋은 준비물");

  const productById = new Map(products.map((product) => [String(product.id), product]));

  return [...candidates.entries()]
    .sort(([, left], [, right]) => right.score - left.score)
    .map(([id, recommendation]) => {
      const product = productById.get(id);
      return product ? { ...product, recommendationReason: recommendation.reason } : null;
    })
    .filter(Boolean)
    .slice(0, 3);
}
