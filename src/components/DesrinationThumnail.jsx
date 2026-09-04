import { Link } from "react-router-dom";
import styles from "./DesrinationThumnail.module.scss";

export default function DesrinationThumnail({
  trip,
  index,
  image,
  category,
  to,
  isFavorite = false,
  onToggleFavorite,
}) {
  return (
    <div className={styles.tripCard}>
      <Link to={to} className={styles.tripLink}>
        <div className={styles.tripImage} style={image ? { backgroundImage: `url(${image})` } : undefined} />
        <div className={styles.tripCopy}>
          <small>CITY {String(index + 1).padStart(2, "0")} · {category}</small>
          <h2>{trip.city}</h2>
          <p>{trip.title}</p>
          <strong>{trip.duration} · {trip.country.toUpperCase()}</strong>
          <em>일정에 추가 &gt;</em>
        </div>
      </Link>
      {onToggleFavorite && (
        <button
          className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteActive : ""}`}
          type="button"
          aria-label={`${trip.title} ${isFavorite ? "찜 해제" : "찜하기"}`}
          aria-pressed={isFavorite}
          onClick={onToggleFavorite}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 20.7 10.55 19.38C5.4 14.7 2 11.62 2 7.85 2 4.77 4.42 2.35 7.5 2.35c1.74 0 3.41.81 4.5 2.09a6.03 6.03 0 0 1 4.5-2.09c3.08 0 5.5 2.42 5.5 5.5 0 3.77-3.4 6.85-8.55 11.54Z" />
          </svg>
        </button>
      )}
    </div>
  );
}
