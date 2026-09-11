const patterns = {
  cafe: /카페|커피|로스터|찻집|다방|디저트|베이커리|제과|파르페|café|cafe|coffee|bakery|boul'ange|르타오|청수당|모이핀|온더선셋|몰리힐스|토리코로루/i,
  shopping: /쇼핑|백화점|아울렛|면세|돈키호테|시장|상점|상가|몰\b|타이쿠리|캐널시티|난징동루|shopping|market|outlet|mall/i,
  nature: /해변|해수욕장|바다|해안|오름|폭포|호수|수목원|정원|국립공원|삼림|대자연|절경|보타니아|서호|오동도|협재|비에이|후라노|청의 호수|beach|waterfall|garden|lake/i,
  culture: /박물관|미술관|사찰|신사|궁전|경복궁|덕수궁|자금성|유적|유산|전통|역사|한옥|구시가지|오죽헌|인사동|종루|고루|성당|museum|temple|shrine|palace/i,
  activity: /등산|하이킹|트레킹|서핑|스키|스노보드|래프팅|케이블카|테마파크|놀이공원|유니버설|디즈니|크루즈|유람선|대관람차|레일바이크|액티비티|hiking|surfing|skiing|cruise|disney|universal/i,
  relaxation: /온천|스파|휴양|리조트|해변|해수욕장|족욕|조잔케이|유후인|onsen|spa\b|resort|beach/i,
  family: /수족관|아쿠아리움|동물원|테마파크|놀이공원|유니버설|디즈니|박물관|정원|공원|판다|aquarium|zoo|museum|garden|disney|universal/i,
};
const placesOf = (trip) => (trip.days || []).flatMap((day) => day.items || []).filter((item) => item.type === "place");
const asList = (value) => Array.isArray(value) ? value : typeof value === "string" ? [value] : [];

export function getTripFilterProfile(trip) {
  const places = placesOf(trip);
  const text = places.map((place) => `${place.place || place.name || ""} ${place.recommendation || ""}`).join(" ");
  const themes = [...asList(trip.themes), ...asList(trip.styles), ...asList(trip.tags)].join(" ");
  const themedText = `${text} ${themes}`;
  const styles = new Set(asList(trip.styles));
  if (places.some((place) => place.category === "attraction")) styles.add("유명 관광지");
  if (places.some((place) => place.category === "restaurant" && !place.isFreeMeal && !patterns.cafe.test(`${place.place} ${place.recommendation || ""}`))) styles.add("맛집");
  if (patterns.cafe.test(themedText)) styles.add("카페");
  if (patterns.shopping.test(themedText)) styles.add("쇼핑");
  if (patterns.nature.test(themedText)) styles.add("자연");
  if (patterns.culture.test(themedText)) styles.add("현지 문화");
  if (patterns.activity.test(themedText)) styles.add("액티비티");
  if (patterns.relaxation.test(themedText)) styles.add("휴양");
  const days = (trip.days || []).length;
  const dailyStops = places.filter((place) => !["airport", "station", "hotel"].includes(place.category)).length / Math.max(days, 1);
  const pace = dailyStops <= 3 ? "slow" : dailyStops <= 5 ? "balance" : "full";
  // Prefer curated metadata. Otherwise these are recommendations based on the actual itinerary.
  const companions = new Set(asList(trip.companions || trip.companion));
  if (!companions.size) {
    if (pace !== "full" && (styles.has("현지 문화") || styles.has("카페"))) companions.add("혼자");
    if (styles.has("쇼핑") || styles.has("액티비티") || styles.has("맛집")) companions.add("친구");
    if (styles.has("카페") && (styles.has("자연") || styles.has("휴양") || /야경|전망대/.test(themedText))) companions.add("연인");
    if (pace !== "full" && patterns.family.test(text)) companions.add("가족");
  }
  const seasons = new Set(asList(trip.seasons || trip.season));
  if (!seasons.size) {
    const start = String(trip.dateRange?.start || "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(start)) {
      const date = new Date(`${start}T00:00:00Z`);
      if (Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === start) {
        const month = date.getUTCMonth() + 1;
        seasons.add(month >= 3 && month <= 5 ? "봄" : month >= 6 && month <= 8 ? "여름" : month >= 9 && month <= 11 ? "가을" : "겨울");
      }
    }
  }
  return { days, pace, styles, companions, seasons };
}

export function matchesTripFilters(trip, filters) {
  const profile = getTripFilterProfile(trip);
  const nights = Math.max(profile.days - 1, 0);
  const duration = filters.duration === "all" || (filters.duration === "5박 이상" ? nights >= 5 : filters.duration === `${nights}박 ${profile.days}일`);
  return duration
    && (filters.companion === "all" || profile.companions.has(filters.companion))
    && filters.styles.every((style) => profile.styles.has(style))
    && (filters.pace === "all" || filters.pace === profile.pace)
    && (filters.season === "all" || profile.seasons.has(filters.season));
}
