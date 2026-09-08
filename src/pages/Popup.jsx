import { useState } from "react";
import styles from "./Popup.module.scss";

const DAY_MS = 24 * 60 * 60 * 1000;
const popupItems = [
  { id: "popup01", image: "/Mypage-img/popup01.png" },
  { id: "popup02", image: "/Mypage-img/popup02.png" },
];

const storageKey = (id) => `lcode-${id}-hidden-until`;

const canShowPopup = (id) => {
  try {
    return Number(localStorage.getItem(storageKey(id)) || 0) <= Date.now();
  } catch {
    return true;
  }
};

export default function Popup() {
  const [visibleIds, setVisibleIds] = useState(() => (
    popupItems.filter(({ id }) => canShowPopup(id)).map(({ id }) => id)
  ));
  const [hideToday, setHideToday] = useState({});

  const closePopup = (id) => {
    if (hideToday[id]) {
      try {
        localStorage.setItem(storageKey(id), String(Date.now() + DAY_MS));
      } catch {
        // Storage can be unavailable in private or restricted browser modes.
      }
    }

    setVisibleIds((current) => current.filter((visibleId) => visibleId !== id));
  };

  const visiblePopups = popupItems.filter(({ id }) => visibleIds.includes(id));
  if (!visiblePopups.length) return null;

  return (
    <div className={styles.backdrop} role="presentation">
      <section className={styles.popupGroup} aria-label="프로모션 안내">
        {visiblePopups.map(({ id, image }, index) => (
          <article className={styles.popupCard} key={id} role="dialog" aria-modal="true" aria-label={`프로모션 ${index + 1}`}>
            <img src={image} alt="" />
            <footer>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(hideToday[id])}
                  onChange={(event) => setHideToday((current) => ({
                    ...current,
                    [id]: event.target.checked,
                  }))}
                />
                <span>오늘 하루 그만 보기</span>
              </label>
              <button type="button" onClick={() => closePopup(id)}>닫기 <span aria-hidden="true">×</span></button>
            </footer>
          </article>
        ))}
      </section>
    </div>
  );
}
