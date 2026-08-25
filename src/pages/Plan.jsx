import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import styles from "./Plan.module.scss";

const packages = [
  {
    id: "fukuoka-table",
    city: "FUKUOKA",
    country: "JAPAN",
    days: "3박 4일",
    type: "SLOW · 맛집",
    title: "맛집과 카페를 따라 천천히 걷는 후쿠오카",
    tags: "맛집 카페 · 온천 · 근교",
    image: "fukuoka",
  },
  {
    id: "tokyo-afterdark",
    city: "TOKYO",
    country: "JAPAN",
    days: "4박 5일",
    type: "FULL · 일정",
    title: "도쿄의 클래식한 명소를 품고 알차게",
    tags: "유명 관광지 · 쇼핑 · 현지 맛집",
    image: "tokyo",
  },
  {
    id: "kyoto-slow",
    city: "KYOTO",
    country: "JAPAN",
    days: "3박 4일",
    type: "BALANCE · 힐링",
    title: "천년의 도시, 고요의 골목을 걷는 시간",
    tags: "한적한 골목 · 전통 · 산책",
    image: "kyoto",
  },
  {
    id: "seoul-archive",
    city: "SEOUL",
    country: "KOREA",
    days: "1박 2일",
    type: "SLOW · 여유",
    title: "서울 감성 카페 투어 1박 2일",
    tags: "카페 · 한강 · 골목",
    image: "seoul",
  },
  {
    id: "busan-blue",
    city: "BUSAN",
    country: "KOREA",
    days: "2박 3일",
    type: "BALANCE · 바다",
    title: "파도 옆에서 보내는 가벼운 주말",
    tags: "해안 열차 · 로컬 마켓 · 야경",
    image: "busan",
  },
  {
    id: "osaka-food",
    city: "OSAKA",
    country: "JAPAN",
    days: "2박 3일",
    type: "FULL · 맛집",
    title: "오사카 먹방 여행, 도톤보리에서 난바까지",
    tags: "맛집 쇼핑 · 친구 · 가족",
    image: "osaka",
  },
  {
    id: "jeju-field",
    city: "JEJU",
    country: "KOREA",
    days: "3박 4일",
    type: "BALANCE · 힐링",
    title: "제주의 자연 속으로, 한라산과 올레길",
    tags: "자연 액티비티 · 맛집 · 휴식",
    image: "jeju",
  },
  {
    id: "shanghai-frame",
    city: "SHANGHAI",
    country: "CHINA",
    days: "3박 4일",
    type: "BALANCE · 체험",
    title: "상하이의 두 얼굴, 와이탄과 신티엔디",
    tags: "유명 관광지 · 현지 체험 · 야경",
    image: "shanghai",
  },
];

const regions = [
  ["KR", ["SEOUL", "BUSAN", "JEJU"]],
  ["JP", ["TOKYO", "KYOTO", "OSAKA", "FUKUOKA"]],
  ["CN", ["SHANGHAI"]],
];

export default function Plan() {
  const [params] = useSearchParams();
  const initialCountry = params.get("country") || "ALL";
  const initialCity = params.get("city") || "ALL";
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState(initialCountry);
  const [city, setCity] = useState(initialCity);
  const [sort, setSort] = useState("추천순");

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const result = packages.filter((item) => {
      const matchesCountry = country === "ALL" || item.country === country;
      const matchesCity = city === "ALL" || item.city === city;
      const matchesQuery =
        !keyword ||
        `${item.city} ${item.title} ${item.tags}`.toLowerCase().includes(keyword);
      return matchesCountry && matchesCity && matchesQuery;
    });
    return sort === "도시순"
      ? [...result].sort((a, b) => a.city.localeCompare(b.city))
      : result;
  }, [city, country, query, sort]);

  const selectCity = (nextCity) => {
    const selected = packages.find((item) => item.city === nextCity);
    setCity(nextCity);
    setCountry(selected?.country || "ALL");
  };

  const resetFilters = () => {
    setQuery("");
    setCountry("ALL");
    setCity("ALL");
  };

  return (
    <main className={styles.plan}>
      <section className={styles.searchArea}>
        <label className={styles.search}>
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="여행지 또는 패키지를 검색하세요."
          />
        </label>
        <p>어디로 떠나볼까요?</p>
        <div className={styles.regions}>
          {regions.map(([code, cities]) => (
            <div key={code}>
              <span>{code}</span>
              {cities.map((item) => (
                <button
                  className={city === item ? styles.active : ""}
                  key={item}
                  onClick={() => selectCity(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.tools}>
          <button onClick={resetFilters}>FILTER</button>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option>추천순</option>
            <option>도시순</option>
          </select>
        </div>
      </section>

      <section className={styles.recommendations}>
        <h2>L:CODE PICKS</h2>
        <div>
          {packages.slice(0, 4).map((item) => (
            <button key={item.id} onClick={() => selectCity(item.city)}>
              <span className={`${styles.thumb} ${styles[item.image]}`} />
              <b>{item.city}</b>
              <small>{item.days}</small>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.archive}>
        <div className={styles.archiveTitle}>
          <span>PACKAGE ARCHIVE</span>
          <b>{String(filtered.length).padStart(2, "0")}</b>
        </div>
        <div className={styles.packageList}>
          {filtered.map((item, index) => (
            <article key={item.id}>
              <div className={`${styles.packageImage} ${styles[item.image]}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <button aria-label={`${item.city} 찜하기`}>♡</button>
                <h2>{item.city}</h2>
              </div>
              <div className={styles.packageCopy}>
                <p>
                  {item.days} <span>{item.type}</span>
                </p>
                <h3>{item.title}</h3>
                <small>{item.tags}</small>
                <Link to="/travel-planner">이 패키지로 일정 만들기 →</Link>
              </div>
            </article>
          ))}
          {!filtered.length && (
            <p className={styles.empty}>조건에 맞는 패키지가 없습니다.</p>
          )}
        </div>
      </section>
    </main>
  );
}
