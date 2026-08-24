import { useState } from "react";
import styles from "./Notice.module.scss";

const notices = [
  ["[안내] L:CODE 오픈 기념 '저렴이 세트' 첫 예약 안내", "오픈을 기념해 준비한 저렴이 세트의 예약 방법과 혜택을 안내드립니다. 상품을 확인한 뒤 원하는 날짜에 맞춰 예약해주세요."],
  ["[필독] 출국 전 반드시 확인해야 할 여권 유효기간", "여행 출발일 기준 여권 유효기간을 미리 확인해주세요. 국가별 입국 조건이 다를 수 있으니 출국 전에 한 번 더 확인하는 것을 권장합니다."],
  ["[이벤트] 짐 싸기 멘탈 붕괴 방지! 못만 챙겨와 패키지", "여행 준비가 어려운 분들을 위해 꼭 필요한 준비물을 한 번에 확인할 수 있는 패키지를 준비했습니다."],
  ["[점검] L:CODE 서비스 안정화를 위한 시스템 정기 점검", "보다 안정적인 서비스를 위해 정기 점검이 진행됩니다. 점검 시간에는 일부 메뉴 이용이 제한될 수 있습니다."],
  ["[이벤트] L:CODE 오픈 기념 전 상품 10% 할인", "오픈 기간 동안 일부 상품을 제외한 전 상품을 할인된 가격으로 만나보실 수 있습니다."],
  ["[이벤트] L:CODE 오픈 기념 전 상품 10% 할인", "쿠폰과 할인 혜택은 이벤트 기간 내에만 적용되며 자세한 내용은 상품 페이지에서 확인해주세요."],
];

export default function Notice() {
  // 한 번에 하나의 공지만 펼쳐지는 아코디언 상태입니다.
  const [openIndex, setOpenIndex] = useState(null);

  function toggleNotice(index) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <main className={styles.notice}>
      <div className={styles.content}>
        <section className={styles.noticeList} aria-labelledby="notice-title">
          <p className={styles.eyebrow}>MY JOURNEY</p>
          <h1 id="notice-title">NOTICE</h1>
          <p className={styles.description}>공지사항</p>
          <div className={styles.divider} />
          <div className={styles.items}>
            {notices.map(([title, detail], index) => {
              const isOpen = openIndex === index;
              return (
                <div className={`${styles.noticeItem} ${isOpen ? styles.open : ""}`} key={title + index}>
                  <button
                    className={styles.noticeButton}
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggleNotice(index)}
                  >
                    <span>{title}</span>
                    <b className={styles.arrow} aria-hidden="true">›</b>
                  </button>
                  <div className={styles.noticeDetail}>{detail}</div>
                </div>
              );
            })}
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
