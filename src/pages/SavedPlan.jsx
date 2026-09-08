import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { deletePlan, getPlans } from "../services/firestoreService";
import {
  deleteFavoriteTrip,
  getFavoriteTrips,
  saveFavoriteTrip,
} from "../services/firestoreService";
import tripRoad from "../data/trip_road.json";
import DesrinationThumnail from "../components/DesrinationThumnail";
import MypageBackLink from "../components/MypageBackLink";
import styles from "./SavedPlan.module.scss";
import { resolveImageUrl as imageUrl } from "../utils/imageUtils";
import { useManagedCollection } from "../hooks/useManagedCollection";

const thumbnailModules = import.meta.glob(
  "../assets/images/Thumbnail/Thumbnail-image/**/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" }
);

const planThumbnail = (plan) =>
  tripRoad.thumbnailMap?.[plan?.country]?.[plan?.city];

const cityEnglishNames = {
  강릉: "GANGNEUNG",
  거제: "GEOJE",
  광저우: "GUANGZHOU",
  다롄: "DALIAN",
  서울: "SEOUL",
  부산: "BUSAN",
  여수: "YEOSU",
  제주: "JEJU",
  제주도: "JEJU",
  도쿄: "TOKYO",
  오사카: "OSAKA",
  "오사카·도쿄": "OSAKA · TOKYO",
  장가계: "ZHANGJIAJIE",
  청두: "CHENGDU",
  충칭: "CHONGQING",
  칭다오: "QINGDAO",
  하얼빈: "HARBIN",
  항저우: "HANGZHOU",
  홋카이도: "HOKKAIDO",
  후쿠오카: "FUKUOKA",
  상하이: "SHANGHAI",
  베이징: "BEIJING",
  시안: "XI'AN",
};

const cityEnglishName = (city) => cityEnglishNames[city] || city?.toUpperCase();
const getFavoriteStorageKey = (userId) => `lcode-favorite-trips:${userId}`;

const getStoredFavoriteTrips = (userId) => {
  try {
    const value = localStorage.getItem(getFavoriteStorageKey(userId));
    if (value === null) return null;
    const ids = JSON.parse(value);
    return Array.isArray(ids) ? ids : null;
  } catch {
    return null;
  }
};

const storeFavoriteTrips = (userId, ids) => {
  try {
    localStorage.setItem(getFavoriteStorageKey(userId), JSON.stringify(ids));
  } catch {
    // Firebase 동기화는 계속 시도합니다.
  }
};

// Plan.jsx의 대표 썸네일(heroImage)과 동일하게 trip_road.json 썸네일을 최우선으로 사용한다.
const planImage = (plan) =>
  imageUrl(
    planThumbnail(plan) ||
      plan?.image ||
      plan?.days
        ?.flatMap((day) => day.items || [])
        .find((item) => item.image)?.image
  );

const countSpots = (plan) =>
  plan?.days?.reduce(
    (sum, day) =>
      sum +
      (day.items || []).filter((item) => item.type === "place").length,
    0
  ) || 0;

const formatDate = (date) => date?.replaceAll("-", ".") || "날짜 미정";

const updatedTime = (plan) =>
  plan.updatedAt?.toMillis?.() ||
  (plan.updatedAt?.seconds || 0) * 1000 ||
  plan.createdAt?.toMillis?.() ||
  (plan.createdAt?.seconds || 0) * 1000 ||
  0;

const travelStartTime = (plan) => {
  const startDate = plan?.dateRange?.start;
  const time = startDate ? new Date(`${startDate}T00:00:00`).getTime() : NaN;

  return Number.isFinite(time) ? time : null;
};

const compareByTravelDate = (a, b) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const aStart = travelStartTime(a);
  const bStart = travelStartTime(b);

  if (aStart === null || bStart === null) {
    if (aStart === bStart) return updatedTime(b) - updatedTime(a);
    return aStart === null ? 1 : -1;
  }

  const aUpcoming = aStart >= today;
  const bUpcoming = bStart >= today;

  if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
  if (aUpcoming) return aStart - bStart;
  return bStart - aStart;
};

const dday = (date) => {
  if (!date) return "D-DAY";

  const diff = Math.ceil(
    (new Date(`${date}T00:00:00`) -
      new Date().setHours(0, 0, 0, 0)) /
      86400000
  );

  return diff > 0
    ? `D-${diff}`
    : diff === 0
      ? "D-DAY"
      : `D+${Math.abs(diff)}`;
};

const trendingCities = [
  "서울",
  "부산",
  "제주도",
  "도쿄",
  "오사카",
  "후쿠오카",
  "상하이",
  "베이징",
];

const themeNames = {
  attraction: "ART & WALK",
  restaurant: "SEA & FOOD",
  hotel: "STAY & REST",
  airport: "START A JOURNEY",
};

const getFirstPlace = (trip) =>
  trip.days
    .flatMap((day) => day.items)
    .find((item) => item.type === "place");

const getTrendingImage = (trip) => {
  const thumbnailPath = tripRoad.thumbnailMap?.[trip.country]?.[trip.city];
  const assetPath = thumbnailPath?.replace(/^img\//, "../assets/images/");

  return thumbnailModules[assetPath] || planImage(trip);
};

export default function SavedPlan({ showBack = false }) {
  const pageRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const managedTrips = useManagedCollection("packages", tripRoad.trips);
  const [params] = useSearchParams();
  const savedId = params.get("id");

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [durationModal, setDurationModal] = useState(null);
  const [selectedDurationId, setSelectedDurationId] = useState("");
  const [favoriteTripIds, setFavoriteTripIds] = useState(
    () => (user?.uid ? (getStoredFavoriteTrips(user.uid) ?? []) : []),
  );
  const favoriteMutationRef = useRef(0);
  const favoriteLock = useRef(false);

  useEffect(() => {
    if (!user) return;

    setLoadError("");

    getPlans(user.uid)
      .then((items) =>
        setPlans(
          [...items].sort(compareByTravelDate)
        )
      )
      .catch(() =>
        setLoadError(
          "저장한 일정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
        )
      )
      .finally(() => setLoading(false));
  }, [user]);

  const saved =
    plans.find((plan) => plan.id === savedId) || plans[0];

  const others = plans.filter((plan) => plan.id !== saved?.id);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll(`.${styles.revealCard}`);

    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add(styles.revealVisible));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(styles.revealVisible);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [others.length, saved?.id]);

  const trending = useMemo(() => {
    const savedCities = new Set(
      plans.map((plan) => plan.city)
    );

    return trendingCities
      .filter((city) => !savedCities.has(city))
      .map((city) => {
        const variants = managedTrips
          .filter((trip) => trip.city === city)
          .sort((first, second) => first.days.length - second.days.length);
        return variants.length ? { trip: variants[0], variants } : null;
      })
      .filter(Boolean)
      .slice(0, 4);
  }, [managedTrips, plans]);

  const selectedDurationTrip = durationModal?.trips.find(
    (trip) => trip.id === selectedDurationId,
  ) || null;

  const openDurationModal = (cityTrips) => {
    setDurationModal({ city: cityTrips[0].city, trips: cityTrips });
    setSelectedDurationId(cityTrips[0].id);
  };

  useEffect(() => {
    if (!durationModal) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setDurationModal(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [durationModal]);

  useEffect(() => {
    if (!user?.uid) return undefined;

    let active = true;
    const mutationAtStart = favoriteMutationRef.current;
    const storedIds = getStoredFavoriteTrips(user.uid);

    getFavoriteTrips(user.uid)
      .then((firebaseIds) => {
        if (!active || favoriteMutationRef.current !== mutationAtStart) return;
        const ids = firebaseIds;
        setFavoriteTripIds(ids);
        storeFavoriteTrips(user.uid, ids);
      })
      .catch(() => {
        if (active && storedIds !== null && favoriteMutationRef.current === mutationAtStart) {
          setFavoriteTripIds(storedIds);
        }
      });

    return () => { active = false; };
  }, [user?.uid]);

  const toggleFavoriteTrip = async (tripId) => {
    if (!user?.uid) {
      navigate("/login");
      return;
    }

    if (favoriteLock.current) return;
    favoriteLock.current = true;
    const wasFavorite = favoriteTripIds.includes(tripId);
    const nextIds = wasFavorite
      ? favoriteTripIds.filter((id) => id !== tripId)
      : [...favoriteTripIds, tripId];

    favoriteMutationRef.current += 1;
    setFavoriteTripIds(nextIds);
    storeFavoriteTrips(user.uid, nextIds);

    try {
      if (wasFavorite) await deleteFavoriteTrip(user.uid, tripId);
      else await saveFavoriteTrip(user.uid, tripId);
      window.dispatchEvent(new Event("favorite-trips-changed"));
    } catch {
      setFavoriteTripIds(favoriteTripIds);
      storeFavoriteTrips(user.uid, favoriteTripIds);
      window.alert("일정 찜을 저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      favoriteLock.current = false;
    }
  };

  const removeDraft = async () => {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await deletePlan(user.uid, deleteTarget.id);

      setPlans((current) =>
        current.filter(
          (plan) => plan.id !== deleteTarget.id
        )
      );

      setDeleteTarget(null);
      setDeleting(false);

      window.dispatchEvent(
        new Event("plans-changed")
      );
    } catch {
      setDeleting(false);
      setDeleteError(
        "임시저장 일정을 삭제하지 못했습니다."
      );
    }
  };

  if (loading) {
    return (
      <main className={showBack ? styles.page : styles.status}>
        {showBack && <MypageBackLink label="이전 페이지로 돌아가기" />}
        <div className={showBack ? styles.status : ""}>
          저장한 일정을 불러오고 있어요.
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className={showBack ? styles.page : styles.status}>
        {showBack && <MypageBackLink label="이전 페이지로 돌아가기" />}
        <div className={showBack ? styles.status : ""}>
          <div>
          <strong>일정을 불러올 수 없어요.</strong>

          <p>{loadError}</p>

          <Link to="/search">
            일정 검색으로 이동 →
          </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!saved) {
    return (
      <main className={showBack ? styles.page : styles.status}>
        {showBack && <MypageBackLink label="이전 페이지로 돌아가기" />}
        <div className={showBack ? styles.status : ""}>
          <div>
          <strong>
            저장된 일정이 없습니다.
          </strong>

          <p>
            새로운 여행 일정을 찾아보세요.
          </p>

          <Link to="/search">
            새 일정 만들기 →
          </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main ref={pageRef} className={styles.page}>
      {showBack && <MypageBackLink label="이전 페이지로 돌아가기" />}
      <p className={styles.eyebrow}>
        MY PLAN
      </p>

      <h1>
        SAVED
        <br />
        PLAN
      </h1>

      <p className={styles.description}>
        저장된 일정을 확인해보세요.
      </p>

      {/* 메인 저장 일정 */}
      <article
        className={`${styles.heroCard} ${styles.revealCard}`}
      >
        <video
          className={styles.heroVideo}
          src="/Mypage-img/sea01.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        {/* 왼쪽 상단 삭제 아이콘 */}
        <button
          type="button"
          className={styles.heroDelete}
          onClick={() =>
            setDeleteTarget(saved)
          }
          aria-label="일정 삭제"
          title="일정 삭제"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v5" />
            <path d="M14 11v5" />
          </svg>
        </button>

        {/* D-DAY */}
        <b>
          {dday(saved.dateRange?.start)}
        </b>

        {/* 여행 정보 */}
        <div>
          <small>
            {formatDate(
              saved.dateRange?.start
            )}{" "}
            —{" "}
            {formatDate(
              saved.dateRange?.end
            ).slice(5)}
            {saved.status === "draft"
              ? " · 작성 중"
              : ""}
          </small>

          <h2>
            {cityEnglishName(saved.city)}
          </h2>

          <p>
            {Math.max(
              (saved.days?.length || 1) - 1,
              0
            )}{" "}
            NIGHTS　·　
            {saved.days?.length || 0} DAYS　·　
            {countSpots(saved)} SPOTS
          </p>
        </div>

        <nav className={styles.heroActions} aria-label={`${saved.title} 일정 메뉴`}>
          {saved.status === "draft" ? (
            <Link to={`/travel-planner?plan=${encodeURIComponent(saved.id)}`}>
              이어서 작성
            </Link>
          ) : (
            <>
              <Link to={`/plan?trip=${encodeURIComponent(saved.tripId)}&saved=${encodeURIComponent(saved.id)}`}>
                일정 확인
              </Link>
              <Link to={`/travel-planner?plan=${encodeURIComponent(saved.id)}`}>
                수정하기 →
              </Link>
            </>
          )}
        </nav>
      </article>

      {/* 다른 저장 일정 */}
      {others.length > 0 && (
        <section
          className={styles.others}
        >
          <p
            className={styles.eyebrow}
          >
            OTHER JOURNEYS
          </p>

          {others.map((plan) => (
            <article className={styles.revealCard} key={plan.id}>
              <button
                type="button"
                className={styles.heroDelete}
                onClick={() => setDeleteTarget(plan)}
                aria-label="Delete plan"
                title="Delete plan"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v5" />
                  <path d="M14 11v5" />
                </svg>
              </button>
              <span
                style={{
                  backgroundImage: `url(${planImage(
                    plan
                  )})`,
                }}
              />

              <div>
                <h2>
                  {plan.title ||
                    `${plan.city} 여행`}

                  {plan.status ===
                    "draft" && (
                    <em>작성 중</em>
                  )}
                </h2>

                <p>나만의 여행</p>

                <small>
                  {formatDate(
                    plan.dateRange?.start
                  )}{" "}
                  -{" "}
                  {formatDate(
                    plan.dateRange?.end
                  ).slice(5)}{" "}
                  | {countSpots(plan)}개 일정
                </small>

                <nav>
                  {plan.status ===
                  "draft" ? (
                    <>
                      <Link
                        to={`/travel-planner?plan=${encodeURIComponent(
                          plan.id
                        )}`}
                      >
                        이어서 작성
                      </Link>

                    </>
                  ) : (
                    <>
                      <Link
                        to={`/plan?trip=${encodeURIComponent(
                          plan.tripId
                        )}&saved=${encodeURIComponent(
                          plan.id
                        )}`}
                      >
                        일정 확인
                      </Link>

                      <Link
                        to={`/travel-planner?plan=${encodeURIComponent(
                          plan.id
                        )}`}
                      >
                        수정하기 →
                      </Link>
                    </>
                  )}

                </nav>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* 새 일정 만들기 */}
      <Link
        className={styles.newPlan}
        to="/search"
      >
        ＋　새로운 여행 일정 만들기
      </Link>

      <p className={styles.notice}>
        ⓘ　삭제한 일정은 복구할 수 없습니다.
      </p>

      {/* 추천 여행지 */}
      {trending.length > 0 && (
        <section
          className={styles.trending}
        >
          <header
            className={
              styles.trendingHeader
            }
          >
            <h2>요즘 뜨고 있는</h2>

            <Link
              className={styles.allView}
              to="/desrinationAll"
            >
              VIEW ALL <span>→</span>
            </Link>
          </header>

          <div>
            {trending.map(({ trip, variants }, index) => {
              const firstPlace = getFirstPlace(trip);
              const category = themeNames[firstPlace?.category] || "TRAVEL PACKAGE";
              const hasDurationOptions = variants.length > 1;
              const scheduleSummary = hasDurationOptions
                ? `${variants[0].duration} ~ ${variants[variants.length - 1].duration}까지 총 ${variants.length}개 일정`
                : undefined;

              return (
                <DesrinationThumnail
                  key={trip.id}
                  trip={trip}
                  index={index}
                  image={getTrendingImage(trip)}
                  category={category}
                  to={`/plan?trip=${encodeURIComponent(trip.id)}`}
                  isFavorite={favoriteTripIds.includes(trip.id)}
                  onToggleFavorite={() => toggleFavoriteTrip(trip.id)}
                  onTripClick={hasDurationOptions ? (event) => {
                    event.preventDefault();
                    openDurationModal(variants);
                  } : undefined}
                  actionLabel={hasDurationOptions ? "여행 일수 선택 >" : undefined}
                  scheduleSummary={scheduleSummary}
                />
              );
            })}
          </div>
        </section>
      )}

      {durationModal && (
        <div
          className={styles.durationBackdrop}
          role="presentation"
          onMouseDown={() => setDurationModal(null)}
        >
          <section
            className={styles.durationModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="duration-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className={styles.modalHandle} aria-hidden="true" />
            <p className={styles.modalBrand}>L:CODE</p>
            <h2 id="duration-modal-title">여행 일수를<br />선택해 주세요.</h2>
            <p className={styles.modalMessage}>
              {durationModal.city}에서 원하는 여행 기간을 골라보세요.
            </p>
            <div
              className={styles.durationChoices}
              role="radiogroup"
              aria-label={`${durationModal.city} 여행 일수 선택`}
            >
              {durationModal.trips.map((trip) => (
                <button
                  key={trip.id}
                  className={trip.id === selectedDurationId ? styles.durationChoiceActive : ""}
                  type="button"
                  role="radio"
                  aria-checked={trip.id === selectedDurationId}
                  onClick={() => setSelectedDurationId(trip.id)}
                >
                  <strong>{trip.duration}</strong>
                  <span>{trip.days.length} DAYS · {trip.title}</span>
                </button>
              ))}
            </div>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setDurationModal(null)}>닫기</button>
              {selectedDurationTrip && (
                <Link to={`/plan?trip=${encodeURIComponent(selectedDurationTrip.id)}`}>
                  상세 일정 보기
                </Link>
              )}
            </div>
          </section>
        </div>
      )}

      {/* 삭제 모달 */}
      {deleteTarget && (
        <div
          className={
            styles.deleteBackdrop
          }
          role="presentation"
          onMouseDown={() =>
            !deleting &&
            setDeleteTarget(null)
          }
        >
          <section
            className={
              styles.deleteModal
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="draft-delete-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <p>DELETE DRAFT</p>

            <h2 id="draft-delete-title">
              정말 삭제하겠습니까?
            </h2>

            <span>
              삭제한 일정은 복구할 수
              없습니다.
            </span>

            {deleteError && (
              <small role="alert">
                {deleteError}
              </small>
            )}

            <div>
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteTarget(null)
                }
              >
                취소
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={removeDraft}
              >
                {deleting
                  ? "삭제 중…"
                  : "삭제하기"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
