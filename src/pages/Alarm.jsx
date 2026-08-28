import { useState } from "react";
import styles from "./Alarm.module.scss";

// 처음에는 모든 알림을 꺼진 상태로 보여줍니다.
const alarmItems = [
  "주문 내역",
  "특가 / 프로모션",
  "여행 일정 알림",
  "가격 변동 알림",
  "리뷰 / 답변 알림",
  "공지사항 알림",
];

export default function Alarm() {
  // 알림 이름을 key로 사용해 각각의 토글 상태를 따로 관리합니다.
  const [enabledAlarms, setEnabledAlarms] = useState([]);

  // 클릭한 알림만 켜거나 다시 끕니다.
  function toggleAlarm(label) {
    setEnabledAlarms((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  }

  return (
    <main className={styles.alarm}>
      <div className={styles.content}>
        <section className={styles.settings} aria-labelledby="alarm-title">
          <p className={styles.eyebrow}>MY JOURNEY</p>
          <h1 id="alarm-title">ALARM</h1>
          <p className={styles.description}>알림을 설정하세요</p>
          <div className={styles.divider} />
          <div className={styles.settingList}>
            {alarmItems.map((label) => {
              const isEnabled = enabledAlarms.includes(label);
              return (
                <div className={styles.setting} key={label}>
                  <span>{label}</span>
                  <button
                    className={isEnabled ? styles.enabled : ""}
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    aria-label={`${label} 알림`}
                    onClick={() => toggleAlarm(label)}
                  >
                    <i />
                  </button>
                </div>
              );
            })}
          </div>
          <p className={styles.notice}>
            <span>ⓘ</span> 푸시 알림 설정 &gt; 알림 설정에서<br />언제든지 변경할 수 있습니다
          </p>
        </section>
        <div className={styles.imagePlaceholder} aria-label="알림 이미지 영역" />
      </div>
    </main>
  );
}
