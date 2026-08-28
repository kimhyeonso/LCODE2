import { Link } from "react-router-dom";
import styles from "./Notice.module.scss";

const notices = [
  "[안내] L:CODE 오픈 기념 저렴이 세트 첫 예약 안내",
  "[필독] 출국 전 반드시 확인해야 할 여권 유효기간",
  "[이벤트] 짐 싸기 멘탈 붕괴 방지! 못난 챙겨와 패키지",
  "[점검] L:CODE 서비스 안정화를 위한 시스템 정기 점검",
  "[이벤트] L:CODE 오픈 기념 전 상품 10% 할인",
  "[이벤트] L:CODE 오픈 기념 전 상품 10% 할인",
];

const journalCards = [
  { image: "3.png", location: "KYOTO · JAPAN", caption: "L:CODE JOURNAL" },
  { image: "5.png", location: "BEIJING · CHINA", caption: "JOURNEY IN STYLE" },
];

export default function Notice() {
  return (
    <main className={styles.notice}>
      <aside className={styles.issueRail} aria-label="Issue information">
        <span>ISSUE NO.</span><strong>002</strong><i aria-hidden="true" />
        <em>COLLECT JOURNEYS<br />DESIGN MOMENTS</em><b aria-hidden="true" />
      </aside>
      <Link className={styles.back} to="/my" aria-label="마이페이지로 돌아가기">←</Link>
      <div className={styles.content}>
        <section className={styles.noticeList} aria-labelledby="notice-title">
          <p className={styles.eyebrow}>MY JOURNEY</p>
          <h1 id="notice-title" className={styles.title}>NOTICE</h1>
          <p className={styles.description}>공지사항</p><div className={styles.divider} />
          <div className={styles.items}>
            {notices.map((title, index) => {
              const content = <><span>{title}</span><b aria-hidden="true">→</b></>;
              return index === 0 ? <Link className={styles.noticeLink} to="/open-guide" key={title}>{content}</Link> : <div className={styles.noticeRow} key={`${title}-${index}`}>{content}</div>;
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
