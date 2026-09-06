import { Link } from "react-router-dom";
import MypageBackLink from "../components/MypageBackLink";
import { useManagedCollection } from "../hooks/useManagedCollection";
import { defaultNotices } from "../data/defaultNotices";
import styles from "./Notice.module.scss";

const journalCards = [
  { image: "3.png", location: "KYOTO · JAPAN", caption: "L:CODE JOURNAL" },
  { image: "5.png", location: "BEIJING · CHINA", caption: "JOURNEY IN STYLE" },
];

export default function Notice() {
  const managedNotices = useManagedCollection("notices", defaultNotices);
  return (
    <main className={styles.notice}>
      <div className={styles.content}>
        <section className={styles.noticeList} aria-labelledby="notice-title">
          <MypageBackLink />
          <p className={styles.eyebrow}>MY JOURNEY</p>
          <h1 id="notice-title" className={styles.title}>NOTICE</h1>
          <p className={styles.description}>공지사항</p><div className={styles.divider} />
          <div className={styles.items}>
            {managedNotices.map((notice) => {
              const content = <><span>{notice.title}</span><b aria-hidden="true">→</b></>;
              return <Link className={styles.noticeLink} to={`/notice/${encodeURIComponent(notice.id)}`} key={notice.id}>{content}</Link>;
            })}
          </div>
        </section>
        <section className={styles.journal} aria-label="L:CODE 여행 저널">
          {journalCards.map(({ image, location, caption }) => (
            <article className={styles.journalCard} key={location}>
              <img src={`/Mypage-img/${image}`} alt="여행지 풍경" />
              <div className={styles.cardCaption}><span>{location}</span><i aria-hidden="true" /><span>{caption}</span></div>
            </article>
          ))}
          <span className={styles.stamp} aria-hidden="true" />
        </section>
        <section className={styles.contact} aria-label="고객센터 전화 안내">
          <div className={styles.contactIcon} aria-hidden="true">
            <img src="/Mypage-img/set.svg" alt="" />
          </div>
          <div className={styles.contactCopy}>
            <h2>고객센터 문의</h2>
            <p>고객센터 전화번호: 070 - 548 - 8679</p>
          </div>
        </section>
      </div>
    </main>
  );
}
