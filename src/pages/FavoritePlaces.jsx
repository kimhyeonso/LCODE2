import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { deleteFavoritePlace, getFavoritePlaces } from "../services/firestoreService";
import styles from "./FavoritePlaces.module.scss";
import { resolveImageUrl as imageUrl, useImageFallback } from "../utils/imageUtils";

export default function FavoritePlaces() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, places: [], error: "" });

  useEffect(() => {
    let active = true;
    getFavoritePlaces(user.uid)
      .then((places) => active && setState({ loading: false, places, error: "" }))
      .catch(() => active && setState({ loading: false, places: [], error: "찜한 장소를 불러오지 못했습니다." }));
    return () => { active = false; };
  }, [user]);

  const remove = async (place) => {
    try {
      await deleteFavoritePlace(user.uid, place.id);
      setState((current) => ({ ...current, places: current.places.filter((item) => item.id !== place.id) }));
      window.dispatchEvent(new Event("favorite-places-changed"));
    } catch {
      setState((current) => ({ ...current, error: "찜한 장소를 삭제하지 못했습니다." }));
    }
  };

  return (
    <main className={styles.page}>
      <p className={styles.eyebrow}>MY PLACES</p>
      <h1>찜한 장소</h1>
      <p className={styles.count}>{state.places.length} PLACES</p>
      {state.loading && <p className={styles.empty}>불러오는 중…</p>}
      {state.error && <p className={styles.error} role="alert">{state.error}</p>}
      {!state.loading && !state.places.length && <div className={styles.empty}><p>아직 찜한 장소가 없습니다.</p><Link to="/search">여행지 둘러보기 →</Link></div>}
      <section className={styles.grid}>
        {state.places.map((place) => (
          <article key={place.id}>
            <span className={styles.image}>{imageUrl(place.image) && <img src={imageUrl(place.image)} alt="" onError={useImageFallback} />}</span>
            <div><small>{place.city} · {place.category}</small><h2>{place.name}</h2><p>{place.recommendation || "다음 일정에 추가해 보세요."}</p></div>
            <button type="button" onClick={() => remove(place)}>찜 해제</button>
          </article>
        ))}
      </section>
      <Link className={styles.add} to="/search">일정에 장소 추가하기 →</Link>
    </main>
  );
}
