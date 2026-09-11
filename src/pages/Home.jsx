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
import { homeVideos } from "../data/homeVideo";
import { getUpcomingPlans } from "../utils/upcomingPlans";
import HomeExchange from "../components/HomeExchange";
import { useHomeViewers } from "../hooks/useHomeViewers";
import viewerIcon from "../assets/icons/menu_bar/05user.svg";

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
    desktop: "/Mypage-img/travel-coast.jpg",
    mobile: "/Mypage-img/travel-coast.jpg",
    video: "/Mypage-img/travel-coast.mp4",
    eyebrow: "FIND YOUR NEXT TRIP",
    title: "계획이 틀어져도,\n여행은 계속된다.",
    serviceIntro: true,
    description: "취향에 맞는 여행을 추천하고, 여행 중 예상치 못한 상황에서도 일정을 다시 설계하는 여행 일정 리믹스 플랫폼",
    cta: "나에게 맞는 여행 찾기",
    to: "/destinations",
  },
  {
    desktop: bannerPC1,
    mobile: bannerMO1,
    video: "/Mypage-img/fukuoka.mp4",
    eyebrow: "RECOMMENDED PACKAGE",
    title: "FUKUOKA",
    subtitle: "후쿠오카 3박 4일",
    description: "맛집과 감성을 담은 시티 트립",
    cta: "VIEW PACKAGE",
    to: "/plan?city=FUKUOKA",
    mobileIvory: true,
  },
  {
    desktop: bannerPC2,
    mobile: bannerMO2,
    video: "/Mypage-img/seoul.mp4",
    eyebrow: "RECOMMENDED PACKAGE",
    title: "SEOUL",
    subtitle: "서울 2박 3일",
    description: "도시의 감성과 로컬 스팟을 담은 여행",
    cta: "VIEW PACKAGE",
    to: "/plan?city=SEOUL",
    mobileLightText: true,
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
    trimImageEdges: true,
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
    mobileBottomLeft: true,
    mobileIvory: true,
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

const ViewerBadge = ({ count }) => (
  <p className={styles.viewerBadge} title="최근 60초 동안 홈 화면을 연 브라우저 수입니다. 같은 브라우저의 여러 탭은 한 번만 집계합니다.">
    <img src={viewerIcon} alt="" aria-hidden="true" />
    <span>최근 1분 홈 접속 <strong>{count.toLocaleString("ko-KR")}</strong></span>
  </p>
);

function HeroVideo({ src, poster, active }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (active && !motion.matches && !document.hidden) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };
    syncPlayback();
    motion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      video.pause();
      motion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, [active]);

  return (
    <>
      <video
        ref={videoRef}
        className={styles.heroVideo}
        src={active ? src : undefined}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className={styles.heroVideoToggle}
        tabIndex={active ? 0 : -1}
        aria-label={playing ? "배경 영상 일시정지" : "배경 영상 재생"}
        title={playing ? "배경 영상 일시정지" : "배경 영상 재생"}
        onClick={() => {
          if (playing) videoRef.current.pause();
          else videoRef.current.play().catch(() => {});
        }}
      >
        <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
      </button>
    </>
  );
}

const TextLink = ({ to, children, ...props }) => (
  <Link className={styles.textLink} to={to} {...props}>
    {children} <span>→</span>
  </Link>
);

export default function Home() {
  const viewerCount = useHomeViewers();
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
  const [planState, setPlanState] = useState({ userId: null, plans: [], loading: false, error: false });
  const [planRetry, setPlanRetry] = useState(0);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [heroTransitionEnabled, setHeroTransitionEnabled] = useState(true);

  useEffect(() => {
    const motion = gsap.matchMedia();
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(`.${styles.heroVisual}`, {
        opacity: 0,
        duration: 0.9,
        ease: "power2.out",
      });
    }, page);
    return () => motion.revert();
  }, []);

  useEffect(() => {
    const root = page.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!root || media.matches || !("IntersectionObserver" in window)) return;

    // Reveal siblings in reading order, with the original short upward motion.
    const targets = [...root.querySelectorAll(
      `.${styles.section} > *, .${styles.destinationList} > a`,
    )].filter((target) => !target.classList.contains(styles.destinationList) && !target.classList.contains(styles.shopDragCursor));
    const countryCards = [...root.querySelectorAll(`.${styles.destinationList} > a`)];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      visible.sort((a, b) => targets.indexOf(a.target) - targets.indexOf(b.target));
      visible.forEach((entry, index) => {
        const countryIndex = countryCards.indexOf(entry.target);
        const delay = countryIndex >= 0 ? countryIndex * 0.2 : Math.min(index, 3) * 0.12;
        entry.target.style.setProperty("--home-reveal-delay", `${delay}s`);
        entry.target.classList.add(styles.revealVisible);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });

    targets.forEach((target) => {
      target.classList.add(styles.revealPending);
      observer.observe(target);
    });
    const show = (target) => {
      target.style.setProperty("--home-reveal-delay", "0s");
      target.classList.add(styles.revealVisible);
      observer.unobserve(target);
    };
    const onMotionChange = () => { if (media.matches) targets.forEach(show); };
    const onFocus = (event) => targets.forEach((target) => {
      if (target.contains(event.target)) show(target);
    });
    media.addEventListener("change", onMotionChange);
    root.addEventListener("focusin", onFocus);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", onMotionChange);
      root.removeEventListener("focusin", onFocus);
      targets.forEach((target) => {
        target.classList.remove(styles.revealPending, styles.revealVisible);
        target.style.removeProperty("--home-reveal-delay");
      });
    };
  }, []);

  useEffect(() => {
    if (heroSlides.length < 2) return undefined;

    const duration = activeHeroSlide === 0 ? 8000 : 5000;
    const timer = window.setTimeout(() => {
      setActiveHeroSlide((current) => current + 1);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [activeHeroSlide]);

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
        ? Math.min(current + 1, heroSlides.length)
        : (current - 1 + heroSlides.length) % heroSlides.length
    ));
  };

  const handleHeroTransitionEnd = () => {
    if (activeHeroSlide !== heroSlides.length) return;
    setHeroTransitionEnabled(false);
    setActiveHeroSlide(0);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setHeroTransitionEnabled(true));
    });
  };

  useEffect(() => {
    if (authLoading || !user) return undefined;

    let active = true;
    let requestVersion = 0;
    const loadPlans = async () => {
      const version = ++requestVersion;
      setPlanState({ userId: user.uid, plans: [], loading: true, error: false });
      try {
        const plans = await getPlans(user.uid);
        if (active && version === requestVersion) setPlanState({ userId: user.uid, plans, loading: false, error: false });
      } catch {
        if (active && version === requestVersion) setPlanState({ userId: user.uid, plans: [], loading: false, error: true });
      }
    };
    loadPlans();
    window.addEventListener("plans-changed", loadPlans);

    return () => {
      active = false;
      window.removeEventListener("plans-changed", loadPlans);
    };
  }, [authLoading, user, planRetry]);

  const planLoading = authLoading || Boolean(user && (planState.userId !== user.uid || planState.loading));
  const planError = Boolean(user && planState.userId === user.uid && planState.error);
  const upcomingPlans = getUpcomingPlans(user && planState.userId === user.uid ? planState.plans : []);

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
            style={{
              transform: `translateX(-${activeHeroSlide * 100}%)`,
              transition: heroTransitionEnabled ? undefined : "none",
            }}
            onTransitionEnd={handleHeroTransitionEnd}
          >
            {[...heroSlides, heroSlides[0]].map(({ desktop, mobile, video, eyebrow, title, subtitle, description, cta, to, dark, centered, compactTitle, mobileShiftRight, mobileBottomLeft, mobileIvory, mobileLightText, trimImageEdges, serviceIntro }, index) => {
              const isClone = index === heroSlides.length;
              return (
              <div
                className={`${styles.heroSlide} ${video ? styles.heroSlideVideo : ""} ${dark ? styles.heroSlideDark : ""} ${mobileIvory ? styles.heroSlideMobileIvory : ""} ${mobileLightText ? styles.heroSlideMobileLightText : ""} ${trimImageEdges ? styles.heroSlideTrimmed : ""}`}
                key={`${desktop}-${index}`}
                aria-hidden={index !== activeHeroSlide || isClone}
              >
                {video ? (
                  <HeroVideo
                    src={video}
                    poster={desktop}
                    active={index === activeHeroSlide}
                  />
                ) : (
                  <picture>
                    <source media="(max-width: 640px)" srcSet={mobile} />
                    <img
                      src={desktop}
                      alt=""
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />
                  </picture>
                )}
                {viewerCount !== null && <ViewerBadge count={viewerCount} />}
                <div className={`${styles.heroCopy} ${serviceIntro ? styles.serviceIntro : ""} ${centered ? styles.heroCopyCentered : ""} ${compactTitle ? styles.heroCopyCompactTitle : ""} ${mobileShiftRight ? styles.heroCopyMobileRight : ""} ${mobileBottomLeft ? styles.heroCopyMobileBottomLeft : ""}`}>
                  <p className={styles.heroEyebrow}>{eyebrow}</p>
                  <h1>{title}</h1>
                  {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
                  <p className={styles.heroDescription}>{description}</p>
                  <Link className={styles.heroCta} to={to} tabIndex={!isClone && index === activeHeroSlide ? 0 : -1}>
                    <span>{cta}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
              );
            })}
          </div>
          <div className={styles.heroDots} aria-label="배너 슬라이드 선택">
            {heroSlides.map(({ desktop }, index) => (
              <button
                key={desktop}
                type="button"
                className={`${styles.heroDot} ${index === (activeHeroSlide % heroSlides.length) ? styles.heroDotActive : ""}`}
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
          <TextLink to="/plan/saved">VIEW ALL</TextLink>
        </div>
        {planLoading ? (
          <div className={styles.upcomingLoading}>일정을 확인하고 있어요.</div>
        ) : planError ? (
          <div className={styles.upcomingError}>
            <p role="alert">다가오는 일정을 불러오지 못했어요.<br />잠시 후 다시 시도해 주세요.</p>
            <button type="button" onClick={() => setPlanRetry((value) => value + 1)}>다시 불러오기</button>
          </div>
        ) : upcomingPlans.length ? (
          <UpcomingTrips key={`${user.uid}:${upcomingPlans.map(({ plan, dDay }) => `${plan.id}:${dDay}`).join(",")}`} trips={upcomingPlans} />
        ) : (
          <div className={styles.upcomingEmpty}>
            <span>NO TRIP YET</span>
            <h2>다가오는 여행이 없어요.</h2>
            <p>마음에 드는 여행지를 찾아<br />새로운 일정을 만들어 보세요.</p>
            <Link to={user ? "/search" : "/login"}>{user ? "여행 찾기" : "로그인하고 시작하기"} <b>→</b></Link>
          </div>
        )}
      </section>

      <section className={`${styles.section} ${styles.exchangeSection}`}>
        <SectionLabel number="02">EXCHANGE</SectionLabel>
        <div className={styles.exchangeTitle}>
          <span aria-hidden="true" />
          <p>최신 환율</p>
        </div>
        <HomeExchange />
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
                    className={styles.productThumb}
                    onLoad={(event) => {
                      event.currentTarget.classList.add(styles.productThumbLoaded);
                    }}
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

      <section className={`${styles.section} ${styles.filmSection}`} aria-labelledby="home-film-title">
        <SectionLabel number="06">TRAVEL FILM</SectionLabel>
        <div className={styles.filmHeading}>
          <div>
            <span className={styles.filmEyebrow}>L:CODE ON YOUTUBE</span>
            <h2 id="home-film-title">화면 너머, 여행의 시작</h2>
          </div>
        </div>
        <HomeVideoCarousel />
      </section>

      <section className={`${styles.section} ${styles.journal}`}>
        <SectionLabel number="07">JOURNAL</SectionLabel>
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

function UpcomingTrips({ trips }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef(null);
  const count = trips.length;
  const move = (direction) => setActiveIndex((current) => (current + direction + count) % count);

  return (
    <div className={styles.upcomingCarousel} role="region" aria-roledescription="carousel" aria-label="다가오는 일정" tabIndex={0}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        move(event.key === "ArrowLeft" ? -1 : 1);
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
      }}
      onTouchCancel={() => { touchStart.current = null; }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].clientX - start.x;
        const dy = event.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      }}
    >
      <div className={styles.upcomingViewport}>
        <div className={styles.upcomingTrack} style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {trips.map(({ plan, dDay }, index) => {
            const start = plan.dateRange.start;
            const end = plan.dateRange.end;
            const cardDate = `${formatCardDate(start)}${end ? ` — ${formatCardDate(end, start.slice(0, 4) !== end.slice(0, 4))}` : ""}`;
            const days = plan.days || [];
            const spots = days.reduce((total, day) => total + (day.items || []).filter((item) => item.type === "place").length, 0);
            const image = getImageUrl(tripRoad.thumbnailMap?.[plan.country]?.[plan.city] || plan.image);
            return (
              <article key={plan.id} className={`${styles.upcomingCard} ${styles.upcomingSlide}`} role="group" aria-roledescription="slide"
                aria-label={`${index + 1} / ${count}: ${plan.city}`} aria-hidden={index !== activeIndex} inert={index !== activeIndex}>
                <div className={styles.upcomingMain}>
                  <div>
                    <strong>{dDay === 0 ? "D-DAY" : `D−${dDay}`}</strong>
                    <h2><Link to={`/plan/saved?id=${encodeURIComponent(plan.id)}`}>{plan.city?.toUpperCase()}</Link></h2>
                    <p>{plan.title}</p>
                    <div className={styles.remixContext}><h3>계획에 문제가 생겼나요?</h3><p>날씨 · 휴무 · 일정 변경이 생겨도 현재 여행을 기준으로 일정을 다시 추천해드려요.</p></div>
                    <Link className={styles.remixButton} to={`/ai-remix?planId=${encodeURIComponent(plan.id)}`}>
                      <span>AI REMIX</span><b>일정 다시 맞추기 →</b>
                    </Link>
                  </div>
                  <div className={styles.upcomingImage} style={image ? { backgroundImage: `url(${image})` } : undefined} />
                </div>
                <dl className={styles.tripMeta}>
                  <div><dt>DATE</dt><dd className={styles.dateValue}>{cardDate}</dd></div>
                  <div><dt>DAYS</dt><dd>{String(days.length).padStart(2, "0")} DAYS</dd></div>
                  <div><dt>SPOTS</dt><dd>{String(spots).padStart(2, "0")} SPOTS</dd></div>
                </dl>
              </article>
            );
          })}
        </div>
      </div>
      {count > 1 && (
        <div className={styles.upcomingNavigation}>
          <button type="button" onClick={() => move(-1)} aria-label="이전 일정">←</button>
          <div className={styles.upcomingPagination}>
            <span aria-live="polite" aria-atomic="true">{String(activeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
            <div className={styles.upcomingDots}>{trips.map(({ plan }, index) => (
              <button key={plan.id} type="button" aria-label={`${index + 1}번 일정: ${plan.city}`}
                aria-current={index === activeIndex ? "true" : undefined} onClick={() => setActiveIndex(index)} />
            ))}</div>
          </div>
          <button type="button" onClick={() => move(1)} aria-label="다음 일정">→</button>
        </div>
      )}
    </div>
  );
}

function HomeVideoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef(null);
  const videos = homeVideos.length ? homeVideos : [{ videoId: "", title: "새로운 여행 이야기" }];
  const count = videos.length;
  const move = (direction) => setActiveIndex((current) => (current + direction + count) % count);

  return (
    <div className={styles.filmCarousel} role="region" aria-roledescription="carousel" aria-label="여행 영상" tabIndex={0}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        move(event.key === "ArrowLeft" ? -1 : 1);
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
      }}
      onTouchCancel={() => { touchStart.current = null; }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start || !event.changedTouches.length) return;
        const dx = event.changedTouches[0].clientX - start.x;
        const dy = event.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      }}
    >
      <div className={styles.filmViewport}>
        <div className={styles.filmTrack} style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {videos.map((video, index) => (
            <div className={styles.filmSlide} key={`${video.videoId}-${index}`} role="group" aria-roledescription="slide"
              aria-label={`${index + 1} / ${count}: ${video.title}`} aria-hidden={index !== activeIndex} inert={index !== activeIndex}>
              <HomeVideo key={`${video.videoId}-${index === activeIndex}`} video={video} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.filmNavigation}>
        <button type="button" onClick={() => move(-1)} disabled={count < 2} aria-label="이전 영상">←</button>
        <div className={styles.filmPagination}>
          <span aria-live="polite" aria-atomic="true">{String(activeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
          {count > 1 && <div className={styles.filmDots}>{videos.map((video, index) => (
            <button key={`${video.videoId}-${index}`} type="button" aria-label={`${index + 1}번 영상: ${video.title}`}
              aria-current={index === activeIndex ? "true" : undefined} onClick={() => setActiveIndex(index)} />
          ))}</div>}
        </div>
        <button type="button" onClick={() => move(1)} disabled={count < 2} aria-label="다음 영상">→</button>
      </div>
    </div>
  );
}

function HomeVideo({ video }) {
  const [playing, setPlaying] = useState(false);
  const videoId = /^[\w-]{11}$/.test(video.videoId) ? video.videoId : "";

  return (
    <div className={styles.filmCard}>
      <div className={styles.filmVisual}>
        {playing && videoId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : japanImage}
              alt=""
              loading="lazy"
              onError={(event) => {
                if (event.currentTarget.dataset.fallbackApplied) return;
                event.currentTarget.dataset.fallbackApplied = "true";
                event.currentTarget.src = japanImage;
              }}
            />
            <div className={styles.filmOverlay}>
              {videoId ? (
                <button className={styles.filmPlay} type="button" onClick={() => setPlaying(true)} aria-label={`${video.title} 영상 재생`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z" fill="currentColor" /></svg>
                  <span>영상 재생</span>
                </button>
              ) : (
                <div className={styles.filmComingSoon}><span>COMING SOON</span><p>새로운 여행 이야기를 준비하고 있어요.</p></div>
              )}
            </div>
          </>
        )}
      </div>
      <div className={styles.filmFooter}>
        <span>{video.title}</span>
        {videoId ? <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">YouTube에서 보기 <span aria-hidden="true">↗</span></a> : <span>곧 만나요</span>}
      </div>
    </div>
  );
}
