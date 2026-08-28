import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./Home.module.scss";
import travelKitImage from "../assets/images/travel_kit.webp";
import travelPouchImage from "../assets/images/travel_pouch.webp";
import travelAdapterImage from "../assets/images/travel_adapter.webp";

const SectionLabel = ({ number, children }) => (
  <div className={styles.sectionLabel}>
    <span>{number}</span>
    <span>/</span>
    <span>{children}</span>
  </div>
);

const TextLink = ({ to, children }) => (
  <Link className={styles.textLink} to={to}>
    {children} <span>→</span>
  </Link>
);

export default function Home() {
  const page = useRef(null);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.from(`.${styles.heroVisual}`, {
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
      });
    }, page);
    return () => context.revert();
  }, []);

  return (
    <main ref={page} className={styles.home}>
      <section className={styles.hero} aria-label="L:CODE 대표 여행 이미지">
        <div className={styles.heroVisual}>
          <span>TRAVEL, REMIXED</span>
        </div>
      </section>

      <section className={styles.section}>
        <SectionLabel number="01">UPCOMING</SectionLabel>
        <h1>UPCOMING TRIP</h1>
        <div className={styles.rowTitle}>
          <p>다가오는 여행</p>
          <TextLink to="/plans">VIEW ALL</TextLink>
        </div>
        <Link to="/plans" className={styles.upcomingCard}>
          <div className={styles.upcomingMain}>
            <div>
              <strong>D−14</strong>
              <h2>FUKUOKA</h2>
              <p>후쿠오카 3박 4일</p>
            </div>
            <div className={styles.upcomingImage} />
          </div>
          <dl className={styles.tripMeta}>
            <div>
              <dt>DATE</dt>
              <dd>
                AUG 17 —<br />
                AUG 21
              </dd>
            </div>
            <div>
              <dt>DAYS</dt>
              <dd>04 DAYS</dd>
            </div>
            <div>
              <dt>SPOTS</dt>
              <dd>07 SPOTS</dd>
            </div>
          </dl>
        </Link>
      </section>

      <section className={styles.section}>
        <SectionLabel number="02">EDITOR&apos;S PICK</SectionLabel>
        <div className={styles.rowTitle}>
          <p>추천하는 패키지</p>
          <TextLink to="/plan">VIEW ALL</TextLink>
        </div>
        <div className={styles.pickGrid}>
          <Link to="/plan?city=SHANGHAI" className={styles.featurePick}>
            <div className={`${styles.placeholder} ${styles.shanghaiImage}`} />
            <h3>
              상하이에서 만나는
              <br />
              오래된 것과 새로운 것
            </h3>
          </Link>
          <Link to="/plan?city=TOKYO" className={styles.smallPick}>
            <div className={`${styles.placeholder} ${styles.tokyoImage}`} />
            <h3>TOKYO</h3>
            <p>조용한 골목과 작은 카페를 찾아서</p>
          </Link>
          <Link to="/plan?city=SEOUL" className={styles.smallPick}>
            <div className={`${styles.placeholder} ${styles.seoulImage}`} />
            <h3>SEOUL</h3>
            <p>도시 속 오래된 풍경을 천천히</p>
          </Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.destinationSection}`}>
        <SectionLabel number="03">DESTINATIONS</SectionLabel>
        <h2 className={styles.scriptTitle}>Where to Next?</h2>
        <div className={styles.destinationHero} />
        <div className={styles.destinationList}>
          {[
            ["KOREA", "서울, 부산, 제주", styles.koreaImage],
            ["JAPAN", "교토, 도쿄", styles.japanImage],
            ["CHINA", "상하이", styles.chinaImage],
          ].map(([country, cities, imageClass]) => (
            <Link to={`/plan?country=${country}`} key={country}>
              <div>
                <span>EAST ASIA</span>
                <h3>{country}</h3>
                <p>{cities}</p>
              </div>
              <div className={`${styles.countryImage} ${imageClass}`} />
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <SectionLabel number="04">EVENT</SectionLabel>
        <div className={styles.rowTitle}>
          <div>
            <h2>EVENT</h2>
            <p>짐싸고 쿠폰 받자!</p>
          </div>
          <TextLink to="/event">자세히 보기</TextLink>
        </div>
        <Link to="/event" className={styles.eventVisual}>
          <span>PACK &amp; GO</span>
        </Link>
      </section>

      <section className={styles.section}>
        <SectionLabel number="05">ESSENTIALS</SectionLabel>
        <div className={styles.rowTitle}>
          <p>여행 필수템</p>
          <TextLink to="/shop">TRAVEL SHOPPING</TextLink>
        </div>
        <div className={styles.essentialGrid}>
          {[
            ["TRAVEL KIT", "여행용 키트", travelKitImage],
            ["POUCH", "파우치", travelPouchImage],
            ["ADAPTER", "어댑터", travelAdapterImage],
          ].map(([name, sub, image]) => (
            <Link to="/shop" key={name}>
              <div>
                <img src={image} alt={sub} loading="lazy" />
              </div>
              <h3>{name}</h3>
              <p>{sub}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.journal}`}>
        <SectionLabel number="06">JOURNAL</SectionLabel>
        <div className={styles.rowTitle}>
          <div>
            <h2>JOURNAL</h2>
            <p>여행자의 기록</p>
          </div>
          <TextLink to="/contact">ALL</TextLink>
        </div>
        <article>
          <div className={styles.journalVisual}>
            <span>JOURNAL 04</span>
          </div>
          <div className={styles.journalMeta}>
            <span>TOKYO</span>
            <i />
            <span>MAY 12, 2026</span>
            <i />
            <span>by HAEUN</span>
          </div>
          <h3>
            도쿄의 조용한 아침,
            <br />
            골목이 들려준 이야기
          </h3>
          <p>
            이른 아침 도쿄의 골목을 걷다 보면 도시가 아직 잠에서 깨어나기 전의
            고요한 순간을 마주한다. 작은 카페에서 피어오르는 커피 향, 빗물에
            젖은 돌바닥…
          </p>
          <footer>P. 04 — TOKYO JOURNAL</footer>
        </article>
      </section>
    </main>
  );
}
