import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { deletePlan, getPlans } from "../services/firestoreService";
import tripRoad from "../data/trip_road.json";
import DesrinationThumnail from "../components/DesrinationThumnail";
import styles from "./SavedPlan.module.scss";
import { resolveImageUrl as imageUrl } from "../utils/imageUtils";

const thumbnailModules = import.meta.glob(
  "../assets/images/Thumbnail/Thumbnail-image/**/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" }
);

const planThumbnail = (plan) =>
  tripRoad.thumbnailMap?.[plan?.country]?.[plan?.city];

const cityEnglishNames = {
  강릉: "GANGNEUNG",
  서울: "SEOUL",
  부산: "BUSAN",
  제주: "JEJU",
  제주도: "JEJU",
  도쿄: "TOKYO",
  오사카: "OSAKA",
  상하이: "SHANGHAI",
  베이징: "BEIJING",
};

const cityEnglishName = (city) => cityEnglishNames[city] || city?.toUpperCase();

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

export default function SavedPlan() {
  const { user } = useAuth();

  const [params] = useSearchParams();
  const savedId = params.get("id");

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  const trending = useMemo(() => {
    const savedCities = new Set(
      plans.map((plan) => plan.city)
    );

    return trendingCities
      .filter((city) => !savedCities.has(city))
      .map((city) =>
        tripRoad.trips.find((trip) => trip.city === city)
      )
      .filter(Boolean)
      .slice(0, 4);
  }, [plans]);

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
      <main className={styles.status}>
        저장한 일정을 불러오고 있어요.
      </main>
    );
  }

  if (loadError) {
    return (
      <main className={styles.status}>
        <div>
          <strong>일정을 불러올 수 없어요.</strong>

          <p>{loadError}</p>

          <Link to="/search">
            일정 검색으로 이동 →
          </Link>
        </div>
      </main>
    );
  }

  if (!saved) {
    return (
      <main className={styles.status}>
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
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>
        MY PLAN
      </p>

      <h1>
        SAVED
        <br />
        PLAN
      </h1>

      {/* 메인 저장 일정 */}
      <article
        className={styles.heroCard}
        style={{
          backgroundImage: `linear-gradient(
            180deg,
            transparent 30%,
            rgba(0, 0, 0, 0.78)
          ), url(${planImage(saved)})`,
        }}
      >
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

        {/* 하단 메뉴 */}
        <footer>
          <span>{saved.title}</span>

          <nav>
            {saved.status === "draft" ? (
              <Link
                to={`/travel-planner?plan=${encodeURIComponent(
                  saved.id
                )}`}
              >
                이어서 작성
              </Link>
            ) : (
              <>
                <Link
                  to={`/plan?trip=${encodeURIComponent(
                    saved.tripId
                  )}&saved=${encodeURIComponent(
                    saved.id
                  )}`}
                >
                  일정 확인
                </Link>

                <Link
                  to={`/travel-planner?plan=${encodeURIComponent(
                    saved.id
                  )}`}
                >
                  수정하기 →
                </Link>
              </>
            )}
          </nav>
        </footer>
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
            <article key={plan.id}>
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
            {trending.map((trip, index) => {
              const firstPlace = getFirstPlace(trip);
              const category = themeNames[firstPlace?.category] || "TRAVEL PACKAGE";

              return (
                <DesrinationThumnail
                  key={trip.id}
                  trip={trip}
                  index={index}
                  image={getTrendingImage(trip)}
                  category={category}
                  to={`/plan?trip=${encodeURIComponent(trip.id)}`}
                />
              );
            })}
          </div>
        </section>
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
