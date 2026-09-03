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
      <aside className={styles.issueRail} aria-label="Issue information">
        <span>ISSUE NO.</span><strong>002</strong><i aria-hidden="true" />
        <em>COLLECT JOURNEYS<br />DESIGN MOMENTS</em><b aria-hidden="true" />
      </aside>
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
          <p className={styles.contact}><span aria-hidden="true">ⓘ</span>고객센터 전화번호: 070 - 548 - 8679</p>
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
      </div>
    </main>
  );
}
