import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAuth } from "../hooks/useAuth";
import { useShop } from "../hooks/useShop";
import { useManagedCollection } from "../hooks/useManagedCollection";
import { getPlans } from "../services/firestoreService";
import products from "../data/products.json";
import tripRoad from "../data/trip_road.json";
import productImage01 from "../assets/images/detail/1_1.webp";
import productImage02 from "../assets/images/detail/2_1.webp";
import productImage03 from "../assets/images/detail/3_1.webp";
import productImage04 from "../assets/images/detail/4_1.webp";
import productImage05 from "../assets/images/detail/5_1.webp";
import productImage06 from "../assets/images/detail/6_1.webp";
import bannerPC1 from "../assets/images/banner/banner01-pc.webp";
import bannerPC2 from "../assets/images/banner/banner02-pc.webp";
import bannerPC3 from "../assets/images/banner/banner03-pc.webp";
import bannerPC4 from "../assets/images/banner/banner04-pc.webp";
import bannerPC5 from "../assets/images/banner/banner05-pc.webp";
import bannerMO1 from "../assets/images/banner/banner01-mo.webp";
import bannerMO2 from "../assets/images/banner/banner02-mo.webp";
import bannerMO3 from "../assets/images/banner/banner03-mo.webp";
import bannerMO4 from "../assets/images/banner/banner04-mo.webp";
import bannerMO5 from "../assets/images/banner/banner05-mo.webp";
import destinationBanner from "../assets/images/BANNER.webp";
import koreaImage from "../assets/images/korea.webp";
import japanImage from "../assets/images/japan.webp";
import chinaImage from "../assets/images/china.webp";
import journalTokyoImage from "../assets/images/journal_tokyo.webp";

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

// Add a banner by importing its image above and appending its copy here.
const heroSlides = [
  {
    desktop: bannerPC1,
    mobile: bannerMO1,
    eyebrow: "RECOMMENDED PACKAGE",
    title: "FUKUOKA",
    subtitle: "후쿠오카 3박 4일",
    description: "맛집과 감성을 담은 시티 트립",
    cta: "VIEW PACKAGE",
    to: "/plan?city=FUKUOKA",
    mobileShiftRight: true,
  },
  {
    desktop: bannerPC2,
    mobile: bannerMO2,
    eyebrow: "RECOMMENDED PACKAGE",
    title: "SEOUL",
    subtitle: "서울 2박 3일",
    description: "도시의 감성과 로컬 스팟을 담은 여행",
    cta: "VIEW PACKAGE",
    to: "/plan?city=SEOUL",
  },
  {
    desktop: bannerPC3,
    mobile: bannerMO3,
    eyebrow: "BALANCE GAME",
    title: "취향\n밸런스 게임",
    description: "6개의 질문으로 찾는 나만의 여행 취향",
    cta: "PLAY NOW",
    to: "/balance",
    centered: true,
    compactTitle: true,
  },
  {
    desktop: bannerPC4,
    mobile: bannerMO4,
    eyebrow: "TRAVEL GACHA",
    title: "가챠 돌리고\n쿠폰 받기",
    description: "랜덤 보상으로 여행의 재미를 더해보세요",
    cta: "JOIN EVENT",
    to: "/event",
    compactTitle: true,
  },
  {
    desktop: bannerPC5,
    mobile: bannerMO5,
    eyebrow: "MYSTERY EVENT",
    title: "비행기 사건의\n범인을 찾아라",
    description: "남겨진 단서 속에 숨겨진 진실을 밝혀내라",
    cta: "START GAME",
    to: "/event",
    dark: true,
    compactTitle: true,
  },
];

const homeProductImages = [
  productImage01,
  productImage02,
  productImage03,
  productImage04,
  productImage05,
  productImage06,
];

const formatProductPrice = (price) => {
  if (price === undefined || price === null || price === "") return "";

  if (typeof price === "number") {
    return `${price.toLocaleString("ko-KR")} KRW`;
  }

  const numberPrice = Number(
    String(price).replace(/[^\d]/g, "")
  );

  if (Number.isNaN(numberPrice)) {
    return price;
  }

  return `${numberPrice.toLocaleString("ko-KR")} KRW`;
};

const formatCardDate = (value, includeYear = true) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return includeYear ? `${year}.${month}.${day}` : `${month}.${day}`;
};

const SectionLabel = ({ number, children }) => (
  <div className={styles.sectionLabel}>
    <span>{number}</span>
    <span>/</span>
    <span>{children}</span>
  </div>
);

const TextLink = ({ to, children, ...props }) => (
  <Link className={styles.textLink} to={to} {...props}>
    {children} <span>→</span>
  </Link>
);

export default function Home() {
  const page = useRef(null);
  const heroTouchStart = useRef(null);
  const shopRowRef = useRef(null);
  const shopCursorRef = useRef(null);
  const shopDrag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const { user, loading: authLoading } = useAuth();
  const { saved, toggleSaved } = useShop();
  const managedProducts = useManagedCollection("products", products);
  const homeProducts = managedProducts.slice(0, 6).map((product, index) => ({
    ...product,
    image: product.image || homeProductImages[index] || "",
  }));
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

  const SHOP_CURSOR_SIZE = 64;

  const moveShopCursor = (event) => {
    const cursor = shopCursorRef.current;
    if (!cursor) return;
    cursor.style.transform = `translate3d(${event.clientX - SHOP_CURSOR_SIZE / 2}px, ${event.clientY - SHOP_CURSOR_SIZE / 2}px, 0)`;
  };

  const handleShopPointerEnter = (event) => {
    if (event.pointerType !== "mouse") return;
    moveShopCursor(event);
    if (shopCursorRef.current) shopCursorRef.current.style.opacity = "1";
  };

  const handleShopPointerMove = (event) => {
    if (event.pointerType === "mouse") moveShopCursor(event);
  };

  const handleShopPointerLeave = () => {
    if (shopCursorRef.current) shopCursorRef.current.style.opacity = "0";
  };

  // Dragging is tracked with window-level listeners rather than
  // setPointerCapture: capturing the pointer on the row would re-target the
  // eventual mouseup/click to the row itself instead of the card link under
  // the cursor, breaking plain (non-drag) clicks on the product cards.
  const handleShopPointerDown = (event) => {
    if (event.pointerType !== "mouse") return;
    const el = shopRowRef.current;
    if (!el) return;
    shopDrag.current = { active: true, startX: event.clientX, startScroll: el.scrollLeft, moved: false };

    const handleWindowPointerMove = (moveEvent) => {
      const state = shopDrag.current;
      if (!state.active) return;
      const delta = moveEvent.clientX - state.startX;
      if (Math.abs(delta) > 4) state.moved = true;
      el.scrollLeft = state.startScroll - delta;
    };

    const handleWindowPointerUp = () => {
      shopDrag.current.active = false;
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
  };

  const handleShopClickCapture = (event) => {
    if (shopDrag.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      shopDrag.current.moved = false;
    }
  };

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
  const cardDate = startDate
    ? `${formatCardDate(startDate)}${endDate ? ` — ${formatCardDate(endDate, startDate.slice(0, 4) !== endDate.slice(0, 4))}` : ""}`
    : "일정 미정";
  const dayCount = upcomingPlan?.days?.length ?? 0;
  // Plan.jsx의 대표 썸네일(heroImage)과 동일하게 trip_road.json 썸네일을 최우선으로 사용한다.
  const upcomingImage = getImageUrl(
    tripRoad.thumbnailMap?.[upcomingPlan?.country]?.[upcomingPlan?.city] || upcomingPlan?.image
  );
  const dDay = startDate
    ? Math.ceil((new Date(startDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
    : null;
  const remixPreviewPath = upcomingPlan?.id
    ? `/ai-remix?plan=${encodeURIComponent(upcomingPlan.id)}`
    : "/ai-remix?city=SEOUL";

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
            {heroSlides.map(({ desktop, mobile, eyebrow, title, subtitle, description, cta, to, dark, centered, compactTitle, mobileShiftRight }, index) => (
              <div
                className={`${styles.heroSlide} ${dark ? styles.heroSlideDark : ""}`}
                key={desktop}
                aria-hidden={index !== activeHeroSlide}
              >
                <picture>
                  <source media="(max-width: 640px)" srcSet={mobile} />
                  <img
                    src={desktop}
                    alt=""
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                </picture>
                <div className={`${styles.heroCopy} ${centered ? styles.heroCopyCentered : ""} ${compactTitle ? styles.heroCopyCompactTitle : ""} ${mobileShiftRight ? styles.heroCopyMobileRight : ""}`}>
                  <p className={styles.heroEyebrow}>{eyebrow}</p>
                  <h1>{title}</h1>
                  {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
                  <p className={styles.heroDescription}>{description}</p>
                  <Link className={styles.heroCta} to={to} tabIndex={index === activeHeroSlide ? 0 : -1}>
                    <span>{cta}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
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
        <h1 className={`${styles.matchTitle} whereToNextTitle`}>UPCOMING TRIP</h1>
        <div className={styles.rowTitle}>
          <p>다가오는 여행</p>
          <TextLink to="/plan">VIEW ALL</TextLink>
        </div>
        {planLoading ? (
          <div className={styles.upcomingLoading}>일정을 확인하고 있어요.</div>
        ) : upcomingPlan ? (
          <Link to="/plan" className={styles.upcomingCard}>
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
              <div><dt>DATE</dt><dd className={styles.dateValue}>{cardDate}</dd></div>
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

      <section className={`${styles.section} ${styles.pickSection}`}>
        <SectionLabel number="03">EDITOR&apos;S PICK</SectionLabel>
        <div className={styles.rowTitle}>
          <p>추천하는 패키지</p>
          <TextLink to="/desrinationAll">VIEW ALL</TextLink>
        </div>
        <div className={styles.pickGrid}>
          <Link to="/plan?city=SHANGHAI" className={styles.featurePick}>
            <div className={styles.placeholder}>
              <img
                src={getImageUrl(tripRoad.thumbnailMap?.china?.["상하이"])}
                alt=""
                loading="lazy"
                className={styles.bgFillImage}
              />
            </div>
            <h3>
              상하이에서 만나는
              <br />
              오래된 것과 새로운 것
            </h3>
          </Link>
          <Link to="/plan?city=TOKYO" className={styles.smallPick}>
            <div className={styles.placeholder}>
              <img
                src={getImageUrl(tripRoad.thumbnailMap?.japan?.["도쿄"])}
                alt=""
                loading="lazy"
                className={styles.bgFillImage}
              />
            </div>
            <h3>TOKYO</h3>
            <p>조용한 골목과 작은 카페를 찾아서</p>
          </Link>
          <Link to="/plan?city=SEOUL" className={styles.smallPick}>
            <div className={styles.placeholder}>
              <img
                src={getImageUrl(tripRoad.thumbnailMap?.korea?.["서울"])}
                alt=""
                loading="lazy"
                className={styles.bgFillImage}
              />
            </div>
            <h3>SEOUL</h3>
            <p>도시 속 오래된 풍경을 천천히</p>
          </Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.destinationSection}`}>
        <SectionLabel number="04">DESTINATIONS</SectionLabel>
        <h2 className={`${styles.scriptTitle} whereToNextTitle`}>Where to Next?</h2>
        <div className={styles.destinationHero}>
          <img src={destinationBanner} alt="" loading="lazy" className={styles.bgFillImage} />
        </div>
        <div className={styles.destinationList}>
          {[
            ["KOREA", "서울, 부산, 제주", koreaImage],
            ["JAPAN", "교토, 도쿄", japanImage],
            ["CHINA", "상하이", chinaImage],
          ].map(([country, cities, image]) => (
            <Link to={`/desrinationAll?country=${country.toLowerCase()}`} key={country}>
              <div>
                <span>EAST ASIA</span>
                <h3>{country}</h3>
                <p>{cities}</p>
              </div>
              <div className={styles.countryImage}>
                <img src={image} alt="" loading="lazy" className={styles.bgFillImage} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <SectionLabel number="05">TRAVEL SHOPPING</SectionLabel>

        <div className={styles.rowTitle}>
          <p>여행 필수템</p>

          <TextLink to="/shop">
            TRAVEL SHOPPING
          </TextLink>
        </div>

        <div
          className={styles.essentialGrid}
          ref={shopRowRef}
          onPointerEnter={handleShopPointerEnter}
          onPointerDown={handleShopPointerDown}
          onPointerMove={handleShopPointerMove}
          onPointerLeave={handleShopPointerLeave}
          onClickCapture={handleShopClickCapture}
          onDragStart={(event) => event.preventDefault()}
        >
          {homeProducts.map((product, index) => (
            <article
              className={styles.productCard}
              key={product.id}
            >
              <div className={styles.productThumbnail}>
                {/* 상품 이미지 */}
                <Link
                  to={`/shop/${product.id}`}
                  className={styles.productImageLink}
                  aria-label={`${product.name} 상세보기`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onError={(event) => {
                      const fallback = homeProductImages[index];
                      if (fallback && event.currentTarget.dataset.fallbackApplied !== "true") {
                        event.currentTarget.dataset.fallbackApplied = "true";
                        event.currentTarget.src = fallback;
                      }
                    }}
                  />
                </Link>

                {/* 왼쪽 상단 카테고리 */}
                <span className={styles.productBadge}>
                  {product.category}
                </span>

                {/* 오른쪽 상단 하트 */}
                <button
                  type="button"
                  className={`${styles.productWish} ${saved.includes(product.id) ? styles.productWishActive : ""}`}
                  aria-label={`${product.name} ${saved.includes(product.id) ? "찜 해제" : "찜하기"}`}
                  aria-pressed={saved.includes(product.id)}
                  onClick={() => toggleSaved(product.id)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
                  </svg>
                </button>

                {/* 오른쪽 하단 + 버튼 */}
                <Link
                  to={`/shop/${product.id}`}
                  className={styles.productAdd}
                  aria-label={`${product.name} 상세보기`}
                >
                  +
                </Link>
              </div>

              {/* 상품 정보 */}
              <Link
                to={`/shop/${product.id}`}
                className={styles.productInfo}
              >
                <span className={styles.productCategory}>
                  {product.category}
                </span>

                <h3>{product.name}</h3>

                <p>
                  {formatProductPrice(product.price)}
                </p>
              </Link>
            </article>
          ))}
        </div>
        <div className={styles.shopDragCursor} ref={shopCursorRef} aria-hidden="true">
          DRAG
        </div>
      </section>

      <section className={`${styles.section} ${styles.journal}`}>
        <SectionLabel number="06">JOURNAL</SectionLabel>
        <div className={styles.rowTitle}>
          <p>여행자의 기록</p>
          <TextLink
            to="/journal/tokyo"
            onClick={() => sessionStorage.setItem("homeJournalScrollY", String(window.scrollY))}
          >
            VIEW ALL
          </TextLink>
        </div>
        <Link
          className={styles.journalLink}
          to="/journal/tokyo"
          onClick={() => sessionStorage.setItem("homeJournalScrollY", String(window.scrollY))}
        >
          <div className={styles.journalVisual}>
            <img src={journalTokyoImage} alt="" loading="lazy" className={styles.bgFillImage} />
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
        </Link>
      </section>
    </main>
  );
}
