import { useState } from "react";
import MypageBackLink from "../components/MypageBackLink";
import styles from "./Alarm.module.scss";

const alarmItems = ["주문 내역", "특가 / 프로모션", "여행 일정 알림", "가격 변동 알림", "리뷰 / 답변 알림", "공지사항 알림"];
const initiallyEnabled = ["주문 내역", "가격 변동 알림", "리뷰 / 답변 알림"];

export default function Alarm() {
  const [enabledAlarms, setEnabledAlarms] = useState(initiallyEnabled);
  const toggleAlarm = (label) => setEnabledAlarms((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);

  return <main className={styles.alarm}>
    <img className={styles.tape} src="/Mypage-img/tape.png" alt="" />
    <aside className={styles.issueRail} aria-label="Issue information"><span>ISSUE NO.</span><strong>002</strong><i aria-hidden="true" /><em>COLLECT MOMENTS<br />DESIGN JOURNEYS</em><b aria-hidden="true" /></aside>
    <div className={styles.content}>
      <section className={styles.settings} aria-labelledby="alarm-title">
        <MypageBackLink />
        <p className={styles.eyebrow}>SAVED</p>
        <h1 id="alarm-title">ALARM</h1>
        <p className={styles.description}>알림 설정 하세요</p>
        <div className={styles.divider} />
        <div className={styles.settingList}>{alarmItems.map((label) => {
          const isEnabled = enabledAlarms.includes(label);
          return <div className={styles.setting} key={label}><span>{label}</span><button className={isEnabled ? styles.enabled : ""} type="button" role="switch" aria-checked={isEnabled} aria-label={`${label} 알림`} onClick={() => toggleAlarm(label)}><i /></button></div>;
        })}</div>
        <p className={styles.notice}><span aria-hidden="true">ⓘ</span> 푸시 알림 설정 &gt; 알림 설정에서<br />언제든지 변경할 수 있습니다</p>
      </section>
      <div className={styles.imagePlaceholder} aria-label="알림 이미지 영역" />
    </div>
    <p className={styles.sideCaption}>SUMMER ESCAPE<br /><em>Endless blue, endless memories.</em></p>
  </main>;
}
