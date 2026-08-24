import styles from "./Notice.module.scss";

const notices = [
  "[안내] L:CODE 오픈 기념 '저렴이 세트' 첫 예약 ..",
  "[필독] 출국 전 반드시 확인해야 할 여권 유효기간..",
  "[이벤트] 짐 싸기 멘탈 붕괴 방지! [못만 챙겨와 패키..",
  "[점검] L:CODE 서비스 안정화를 위한 시스템 정기..",
  "[이벤트] L:CODE 오픈 기념 '전 상품 10% 할인'",
  "[이벤트] L:CODE 오픈 기념 '전 상품 10% 할인'",
];

export default function Notice() {
  return (
    <main className={styles.notice}>
      <div className={styles.content}>
        <section className={styles.noticeList} aria-labelledby="notice-title">
          <p className={styles.eyebrow}>MY JOURNEY</p>
          <h1 id="notice-title">NOTICE</h1>
          <p className={styles.description}>공지사항</p>
          <div className={styles.divider} />
          <div className={styles.items}>
            {notices.map((notice, index) => (
              <button type="button" key={index}><span>{notice}</span><b>›</b></button>
            ))}
          </div>
          <p className={styles.contact}>고객센터 전화번호: 070-548-8679</p>
        </section>
        <section className={styles.banners} aria-label="공지 배너">
          <div className={styles.placeholder} aria-hidden="true" />
          <div className={styles.placeholder} aria-hidden="true" />
        </section>
      </div>
    </main>
  );
}
