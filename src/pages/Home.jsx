import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAuth } from "../hooks/useAuth";
import { getPlans } from "../services/firestoreService";
import travelKitImage from "../assets/images/travel_kit.webp";
import travelPouchImage from "../assets/images/travel_pouch.webp";
import travelAdapterImage from "../assets/images/travel_adapter.webp";
import bannerPC1 from "../assets/images/banner/banner01-pc.png";
import bannerPC2 from "../assets/images/banner/banner02-pc.png";
import bannerPC3 from "../assets/images/banner/banner03-pc.png";
import bannerPC4 from "../assets/images/banner/banner04-pc.png";
import bannerPC5 from "../assets/images/banner/banner05-pc.png";
import bannerMO1 from "../assets/images/banner/banner01-mo.png";
import bannerMO2 from "../assets/images/banner/banner02-mo.png";
import bannerMO3 from "../assets/images/banner/banner03-mo.png";
import bannerMO4 from "../assets/images/banner/banner04-mo.png";
import bannerMO5 from "../assets/images/banner/banner05-mo.png";

import styles from "./Home.module.scss";

const imageModules = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  const relativePath = imagePath.replace(/^img\//, "../assets/images/");
  const key = Object.keys(imageModules).find(
    (path) => path.toLowerCase() === relativePath.toLowerCase(),
  );
  return key ? imageModules[key] : "";
};

// Add a banner by importing its image above and appending it to this array.
const heroSlides = [
  { desktop: bannerPC1, mobile: bannerMO1 },
  { desktop: bannerPC2, mobile: bannerMO2 },
  { desktop: bannerPC3, mobile: bannerMO3 },
  { desktop: bannerPC4, mobile: bannerMO4 },
  { desktop: bannerPC5, mobile: bannerMO5 },
];

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
  const heroTouchStart = useRef(null);
  const { user, loading: authLoading } = useAuth();
  const [planState, setPlanState] = useState({ userId: null, plans: [] });
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

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

  useEffect(() => {
    if (heroSlides.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const handleHeroTouchStart = (event) => {
    heroTouchStart.current = event.touches[0]?.clientX ?? null;
  };

  const handleHeroTouchEnd = (event) => {
    const startX = heroTouchStart.current;
    const endX = event.changedTouches[0]?.clientX;
    heroTouchStart.current = null;

    if (startX === null || endX === undefined || Math.abs(startX - endX) < 40) return;

    setActiveHeroSlide((current) => (
      startX > endX
        ? (current + 1) % heroSlides.length
        : (current - 1 + heroSlides.length) % heroSlides.length
    ));
  };

  useEffect(() => {
    if (authLoading || !user) return undefined;

    let active = true;
    getPlans(user.uid)
      .then((plans) => {
        if (!active) return;
        const sortedPlans = [...plans].sort((a, b) => {
          const first = new Date(a.dateRange?.start || "9999-12-31").getTime();
          const second = new Date(b.dateRange?.start || "9999-12-31").getTime();
          return first - second;
        });
        setPlanState({ userId: user.uid, plans: sortedPlans });
      })
      .catch(() => active && setPlanState({ userId: user.uid, plans: [] }));

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  const planLoading = authLoading || Boolean(user && planState.userId !== user.uid);
  const upcomingPlan = user && planState.userId === user.uid ? planState.plans[0] : null;
  const scheduleCount = upcomingPlan?.days?.reduce(
    (total, day) => total + day.items.filter((item) => item.type === "place").length,
    0,
  ) ?? 0;
  const startDate = upcomingPlan?.dateRange?.start;
  const endDate = upcomingPlan?.dateRange?.end;
  const dayCount = upcomingPlan?.days?.length ?? 0;
  const upcomingImage = getImageUrl(upcomingPlan?.image);
  const dDay = startDate
    ? Math.ceil((new Date(startDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
    : null;

  return (
    <main ref={page} className={styles.home}>
      <section className={styles.hero} aria-label="L:CODE 대표 여행 이미지">
        <div
          className={styles.heroVisual}
          role="region"
          aria-roledescription="carousel"
          aria-label="여행 배너"
          onTouchStart={handleHeroTouchStart}
          onTouchEnd={handleHeroTouchEnd}
        >
          <div
            className={styles.heroTrack}
            style={{ transform: `translateX(-${activeHeroSlide * 100}%)` }}
          >
            {heroSlides.map(({ desktop, mobile }, index) => (
              <div className={styles.heroSlide} key={desktop} aria-hidden={index !== activeHeroSlide}>
                <picture>
                  <source media="(max-width: 640px)" srcSet={mobile} />
                  <img src={desktop} alt="" />
                </picture>
              </div>
            ))}
          </div>
          <div className={styles.heroDots} aria-label="배너 슬라이드 선택">
            {heroSlides.map(({ desktop }, index) => (
              <button
                key={desktop}
                type="button"
                className={`${styles.heroDot} ${index === activeHeroSlide ? styles.heroDotActive : ""}`}
                aria-label={`${index + 1}번 배너 보기`}
                aria-current={index === activeHeroSlide ? "true" : undefined}
                onClick={() => setActiveHeroSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <SectionLabel number="01">UPCOMING</SectionLabel>
        <h1>UPCOMING TRIP</h1>
        <div className={styles.rowTitle}>
          <p>다가오는 여행</p>
          <TextLink to="/itinerary">VIEW ALL</TextLink>
        </div>
        {planLoading ? (
          <div className={styles.upcomingLoading}>일정을 확인하고 있어요.</div>
        ) : upcomingPlan ? (
          <Link to="/itinerary" className={styles.upcomingCard}>
            <div className={styles.upcomingMain}>
              <div>
                <strong>{dDay === null ? "DATE TBD" : dDay > 0 ? `D−${dDay}` : dDay === 0 ? "D-DAY" : "TRAVELED"}</strong>
                <h2>{upcomingPlan.city?.toUpperCase()}</h2>
                <p>{upcomingPlan.title}</p>
              </div>
              <div
                className={styles.upcomingImage}
                style={upcomingImage ? { backgroundImage: `url(${upcomingImage})` } : undefined}
              />
            </div>
            <dl className={styles.tripMeta}>
              <div><dt>DATE</dt><dd>{startDate || "미정"}<br />{endDate ? `— ${endDate}` : ""}</dd></div>
              <div><dt>DAYS</dt><dd>{String(dayCount).padStart(2, "0")} DAYS</dd></div>
              <div><dt>SPOTS</dt><dd>{String(scheduleCount).padStart(2, "0")} SPOTS</dd></div>
            </dl>
          </Link>
        ) : (
          <div className={styles.upcomingEmpty}>
            <span>NO TRIP YET</span>
            <h2>아직 정해진 여행이 없어요.</h2>
            <p>마음에 드는 여행지를 찾아<br />나만의 첫 일정을 만들어 보세요.</p>
            <Link to={user ? "/search" : "/login"}>{user ? "여행 찾기" : "로그인하고 시작하기"} <b>→</b></Link>
          </div>
        )}
      </section>

      <section className={`${styles.section} ${styles.exchangeSection}`}>
        <SectionLabel number="02">EXCHANGE</SectionLabel>
        <div className={styles.exchangeTitle}>
          <span aria-hidden="true" />
          <p>실시간 환율</p>
        </div>
            <Link to="/destination" className={styles.exchangeCard}>
          <div>
            <span>100 JPY</span>
            <strong>920</strong>
          </div>
          <footer>
            <span>환율 변동률&nbsp; +0.18%</span>
            <span>자세히 보기&nbsp; →</span>
          </footer>
        </Link>
      </section>

      <section className={styles.section}>
        <SectionLabel number="03">EDITOR&apos;S PICK</SectionLabel>
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
        <SectionLabel number="04">DESTINATIONS</SectionLabel>
        <h2 className={styles.scriptTitle}>Where to Next?</h2>
        <div className={styles.destinationHero} />
        <div className={styles.destinationList}>
          {[
            ["KOREA", "서울, 부산, 제주", styles.koreaImage],
            ["JAPAN", "교토, 도쿄", styles.japanImage],
            ["CHINA", "상하이", styles.chinaImage],
          ].map(([country, cities, imageClass]) => (
            <Link to={`/desrination?country=${country.toLowerCase()}`} key={country}>
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
        <SectionLabel number="05">TRAVEL SHOPPING</SectionLabel>
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
