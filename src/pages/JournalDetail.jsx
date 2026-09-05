import { Link } from "react-router-dom";
import { useLayoutEffect } from "react";
import hero from "../assets/images/journal_tokyo.jpg";
import coffee from "../assets/images/Tokyo/Tokyo/GlitchCoffee&Roasters.png";
import crossing from "../assets/images/Tokyo/Tokyo/ShibuyaCrossing.webp";
import tower from "../assets/images/Tokyo/Tokyo/TokyoTower.jpg";
import station from "../assets/images/Tokyo/Tokyo/TokyoStation.jpg";
import styles from "./JournalDetail.module.scss";

export default function JournalDetail() {
  const homeScrollY = Number(sessionStorage.getItem("homeJournalScrollY")) || 0;

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.scrollTop = 0;
    document.body.scrollTop = 0;

    return () => {
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

  return <main className={styles.page}>
    <Link className={styles.back} to="/" state={{ restoreScrollY: homeScrollY }}>← BACK</Link>
    <section className={styles.cover} style={{ backgroundImage: `linear-gradient(180deg, transparent 35%, rgba(0,0,0,.6)), url(${hero})` }}><span>BEST REVIEW</span><div><small>CITY EDITION　TOKYO 14:52</small><h1>TOKYO</h1><p>나를 조금씩 닮아가는 여행</p></div></section>
    <section className={styles.intro}><h2>★★★★★ <b>4.7</b></h2><p>도쿄는 예상보다 훨씬 걷기 좋은 도시였어요. 골목마다 분위기가 다르고, 지역마다 색깔이 뚜렷해서 하루하루가 새로웠습니다. 메이지 신궁부터 시부야 야경까지, 여행의 속도를 천천히 늦춘 덕분에 더 많은 것을 담아올 수 있었어요.</p><dl><div><dt>TRAVEL</dt><dd>TOKYO</dd></div><div><dt>DATE</dt><dd>MAY 12, 2026</dd></div><div><dt>BY</dt><dd>HAEUN</dd></div></dl><div className={styles.tags}>{["도시", "야경", "맛집", "감성", "재방문 의사"].map((tag) => <span key={tag}>{tag}</span>)}</div></section>
    <JournalDay day="01" subtitle="나리타 공항 · 시부야" images={[hero]}><p>나리타 공항에서 아사쿠사를 거쳐 시부야 숙소까지 이동했다. 처음 도착한 도쿄는 낯설면서도 어딘가 익숙한 도시의 냄새가 났다. 지하철 환승 과정이 복잡했지만, 큰 불편함조차 도쿄다웠다.</p><small>첫날이라 무리하지 않고 숙소 근처 골목을 짧게 걸었다.</small></JournalDay>
    <JournalDay day="02" subtitle="메이지 신궁 · 하라주쿠 · 시부야" images={[coffee, crossing]}><p>이른 아침 메이지 신궁을 먼저 찾았다. 사람이 많았지만 숲길을 걷는 것만으로도 충분했다. 하라주쿠와 오모테산도를 이어 걸으며 골목마다 분위기가 달라 걷는 재미가 있었다.</p><blockquote><small>MY PICK</small><strong>메이지 신궁</strong><span>이른 아침, 사람 없는 참배길을 걷는 것을 추천해요.</span></blockquote></JournalDay>
    <JournalDay day="03" subtitle="아키하바라 · 도쿄역 · 야경" images={[tower, station]}><p>아키하바라는 낮보다 해질 무렵이 더 좋았다. 도쿄역 마루노우치 쪽에서 야경을 보다가 자연스럽게 하루가 끝났다. 걸어서 이동한 거리가 제법 됐지만 피곤하지 않았다.</p><small>마지막 날이라 조금 아쉬웠다. 다음에는 긴 일정으로 다시 찾고 싶다.</small></JournalDay>
    <section className={styles.favorites}><p>MY FAVORITE<br /><span>이번 여행에서 가장 좋았던 장소</span></p>{[["01", "MEIJI JINGU", "메이지 신궁"], ["02", "TOKYO STATION", "도쿄역"], ["03", "SHIBUYA CROSSING", "시부야 교차로"]].map(([no, name, ko]) => <div key={no}><b>{no}</b><strong>{name}</strong><span>{ko}</span></div>)}</section>
    <section className={styles.tip}><small>TRAVEL TIP</small><p>도쿄 여행은 하루에 너무 많은 장소를 넣기보다 지역별로 묶어서 이동하는 것이 편했어요. 시부야·하라주쿠·오모테산도는 한 번에, 아사쿠사·우에노·아키하바라는 다른 날 묶으면 이동 피로가 훨씬 적습니다.</p></section>
    <footer className={styles.actions}><Link to="/">목록으로</Link><Link to="/plan?city=TOKYO">일정 보기</Link></footer>
  </main>;
}

function JournalDay({ day, subtitle, images, children }) {
  return <section className={styles.day}><header><h2>DAY {day}</h2><span>{subtitle}</span></header><div className={images.length > 1 ? styles.photoGrid : styles.photo}><>{images.map((image) => <img src={image} alt="" key={image} />)}</></div><div className={styles.story}>{children}</div></section>;
}
