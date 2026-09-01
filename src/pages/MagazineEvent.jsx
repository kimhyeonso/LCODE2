import styles from "./MagazineEvent.module.scss";
import { EventHeader } from "./Event";

const asset = {
  magazine: "/event/event04/magazinebanne.png",
};

export default function MagazineEvent({ onExit }) {
  return (
    <>
      <EventHeader label="SPECIAL EVENT" onBack={onExit} light />
      <section className={`${styles.scene} ${styles.magazineScreen}`}>
        <img src={asset.magazine} alt="리뷰 쓰고 잡지 받자 이벤트" />
      </section>
    </>
  );
}
