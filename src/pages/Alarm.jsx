import styles from "./Alarm.module.scss";

const alarmItems = [
  ["주문 내역", true],
  ["특가 / 프로모션", false],
  ["여행 일정 알림", false],
  ["가격 변동 알림", true],
  ["리뷰 / 답변 알림", true],
  ["공지사항 알림", false],
];

export default function Alarm() {
  return (
    <main className={styles.alarm}>
      <div className={styles.content}>
        <section className={styles.settings} aria-labelledby="alarm-title">
          <p className={styles.eyebrow}>MY JOURNEY</p>
          <h1 id="alarm-title">ALARM</h1>
          <p className={styles.description}>알림을 설정하세요</p>
          <div className={styles.divider} />
          <div className={styles.settingList}>
            {alarmItems.map(([label, enabled]) => (
              <div className={styles.setting} key={label}>
                <span>{label}</span>
                <button className={enabled ? styles.enabled : ""} type="button" aria-label={`${label} 알림`}>
                  <i />
                </button>
              </div>
            ))}
          </div>
          <p className={styles.notice}><span>ⓘ</span> 푸시 알림 설정 &gt; 알림 설정에서<br />언제든지 변경할 수 있습니다</p>
        </section>
        <div className={styles.imagePlaceholder} aria-label="알림 이미지 영역" />
      </div>
    </main>
  );
}
