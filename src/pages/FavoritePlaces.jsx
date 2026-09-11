import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { deleteFavoritePlace, deleteFavoriteTrip, getFavoritePlaces, getFavoriteTrips, subscribeFavoritePlaces } from "../services/firestoreService";
import tripRoad from "../data/trip_road.json";
import styles from "./FavoritePlaces.module.scss";
import { resolveImageUrl as imageUrl, useImageFallback } from "../utils/imageUtils";
import MypageBackLink from "../components/MypageBackLink";
export default function FavoritePlaces() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, places: [], error: "" });
  const [favoriteTripIds, setFavoriteTripIds] = useState([]);

  useEffect(() => {
    let active = true;
    getFavoritePlaces(user?.uid)
      .then((places) => active && setState({ loading: false, places, error: "" }))
      .catch(() => active && setState({ loading: false, places: [], error: "찜한 목록을 불러오지 못했습니다." }));
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return undefined;

    return subscribeFavoritePlaces(
      user.uid,
      (places) => setState({ loading: false, places, error: "" }),
      () => setState((current) => ({ ...current, loading: false, error: "찜한 장소를 불러오지 못했습니다." })),
    );
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setFavoriteTripIds([]);
      return undefined;
    }

    let active = true;
    getFavoriteTrips(user.uid)
      .then((ids) => { if (active) setFavoriteTripIds(ids); })
      .catch(() => { if (active) setFavoriteTripIds([]); });
    return () => { active = false; };
  }, [user?.uid]);

  const places = useMemo(() => {
    const placeKeys = new Set(state.places.map((place) => `${place.city || ""}:${place.name || ""}`));
    const tripPlaces = favoriteTripIds
      .map((id) => tripRoad.trips.find((trip) => trip.id === id))
      .filter(Boolean)
      .map((trip) => {
        const firstPlace = trip.days.flatMap((day) => day.items).find((item) => item.type === "place");
        return {
          id: `trip-${trip.id}`,
          tripId: trip.id,
          name: firstPlace?.place || trip.city,
          city: trip.city,
          category: "TRAVEL PACKAGE",
          recommendation: trip.title,
          image: firstPlace?.image || trip.image || "",
        };
      })
      .filter((place) => !placeKeys.has(`${place.city || ""}:${place.name || ""}`));
    return [...state.places, ...tripPlaces];
  }, [favoriteTripIds, state.places]);

  useEffect(() => {
    if (!favoriteTripIds.length) return;
    setState((current) => ({ ...current, places }));
  }, [favoriteTripIds]);

  const remove = async (place) => {
    try {
      if (place.tripId) {
        await deleteFavoriteTrip(user.uid, place.tripId);
        setFavoriteTripIds((current) => current.filter((id) => id !== place.tripId));
        setState((current) => ({ ...current, places: current.places.filter((item) => item.tripId !== place.tripId) }));
      } else {
        await deleteFavoritePlace(user.uid, place.id);
        setState((current) => ({ ...current, error: "", places: current.places.filter((item) => item.id !== place.id) }));
      }
      window.dispatchEvent(new Event("favorite-places-changed"));
    } catch {
      setState((current) => ({ ...current, error: "찜한 장소를 삭제하지 못했습니다." }));
    }
  };

  return (
    <main className={styles.page}>
      <MypageBackLink />
      <p className={styles.eyebrow}>MY JOURNEY</p>
      <h1>WISH LIST</h1>
      <p className={styles.description}>다음 여행을 위해 저장해둔 장소</p>
      <div className={styles.divider} />
      {state.loading && <p className={styles.empty}>불러오는 중…</p>}
      {state.error && <p className={styles.error} role="alert">{state.error}</p>}
      {!state.loading && !state.error && !state.places.length && <div className={styles.emptyState}><strong>아직 찜한 장소가 없어요!</strong><Link to="/search">여행지 둘러보기 <span aria-hidden="true">→</span></Link></div>}
      <section className={styles.grid}>
        {state.places.map((place) => (
          <article key={place.id}>
            <span className={styles.image}>{imageUrl(place.image) && <img loading="lazy" src={imageUrl(place.image)} alt="" onError={useImageFallback} />}</span>
            <div><small>{place.city} · {place.category}</small><h2>{place.name}</h2><p>{place.recommendation || "다음 일정에 추가해 보세요."}</p></div>
            <button type="button" onClick={() => remove(place)}>찜 해제</button>
          </article>
        ))}
      </section>
    </main>
  );
}
