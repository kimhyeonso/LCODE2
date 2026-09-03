import { Link } from "react-router-dom";
import styles from "./DesrinationThumnail.module.scss";

export default function DesrinationThumnail({ trip, index, image, category, to }) {
  return (
    <Link to={to} className={styles.tripCard}>
      <div className={styles.tripImage} style={image ? { backgroundImage: `url(${image})` } : undefined} />
      <div className={styles.tripCopy}>
        <small>CITY {String(index + 1).padStart(2, "0")} · {category}</small>
        <h2>{trip.city}</h2>
        <p>{trip.title}</p>
        <strong>{trip.duration} · {trip.country.toUpperCase()}</strong>
        <em>일정에 추가 &gt;</em>
      </div>
    </Link>
  );
}