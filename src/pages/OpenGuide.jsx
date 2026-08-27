import styles from "./OpenGuide.module.scss";

const guideSections = [
  ["1. 상품 구성 확인", "여행용 키트, 보행기, 캐리어 커버 등\n상품별 구성품과 옵션을 확인해주세요."],
  ["2. 수하물 기준 확인", "상품 상세 화면에서 기내 수하물과\n위탁 수하물 반입 가능 여부를 확인할 수 있습니다."],
  ["3. 결제 및 배송", "배송지와 결제 금액을 확인한 뒤 주문을 진행합니다.\n배송 현황은 마이페이지 주문 내역에서 조회할 수 있습니다."],
  ["4. 취소 및 환불 안내", "배송 준비중 단계까지는 주문 취소 신청이 가능합니다.\n환불 기준은 결제 수단과 상품 상태에 따라 달라질 수 있습니다."],
];

export default function OpenGuide() {
  return (
    <main className={styles.openGuide}>
      <div className={styles.content}>
        <article className={styles.articleHeader}>
          <a href="/notice" className={styles.back}>← NOTICE</a>
          <h1>[안내] L:CODE 오픈 기념<br />'저렴이 세트' 첫 예약 가이드</h1>
          <p>2026.08.11 | 안내</p>
          <div className={styles.divider} />
        </article>

        <section className={styles.images} aria-label="가이드 이미지">
          <div className={styles.imageLarge} aria-hidden="true" />
          <div className={styles.imageSmall} aria-hidden="true" />
        </section>

        <article className={styles.guideContent}>
          <p className={styles.introduction}>안녕하세요. L:CODE입니다.</p>
          <p className={styles.introduction}>처음 여행을 준비하는 사용자를 위해<br />쇼핑 상품 예약 전 확인해야 할 내용을<br />아래와 같이 안내드립니다.</p>
          <div className={styles.sections}>
            {guideSections.map(([title, text]) => (
              <section key={title}>
                <h2>{title}</h2>
                <p>{text}</p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}
