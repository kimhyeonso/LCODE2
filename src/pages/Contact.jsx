import styles from "./Contact.module.scss";

const faqs = [
  { question: "AI 추천은 자동으로 적용되나요?", answer: "추천 결과를 확인한 뒤 원하는 일정만 직접 선택해 적용할 수 있어요." },
  { question: "예약까지 바로 할 수 있나요?", answer: "현재는 여행 일정 구성과 정보 확인을 제공하며, 예약 기능은 준비 중이에요." },
  { question: "일정이 저장되지 않아요.", answer: "로그인 상태와 네트워크 연결을 확인한 뒤 다시 저장해 주세요." },
  { question: "비회원도 이용할 수 있나요?", answer: "여행 정보는 볼 수 있지만 일정 저장 등 일부 기능은 로그인이 필요해요." },
  { question: "환불은 어디서 확인하나요?", answer: "주문 내역에서 처리 상태를 확인하거나 고객센터로 문의해 주세요." },
];

export default function Contact() {
  return (
    <main className={styles.contactPage}>
      <div className={styles.content}>
        <section className={styles.mainContent}>
          <header className={styles.intro}>
            <p className={styles.eyebrow}>HELP DESK</p>
            <h1>CONTACT</h1>
            <p className={styles.description}>궁금한 점이 있다면 자주 묻는 질문과 고객센터 안내를 확인해보세요.</p>
          </header>

          <section className={styles.faq} aria-labelledby="faq-title">
            <h2 id="faq-title">FREQUENTLY ASKED</h2>
            <div className={styles.faqList}>
              {faqs.map(({ question, answer }) => (
                <details key={question}>
                  <summary><span>{question}</span><i aria-hidden="true" /></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </section>
        </section>

        <aside className={styles.visual} aria-label="여행 풍경">
          <div className={styles.stamp} aria-hidden="true" />
          <img src="/Mypage-img/tape.png" alt="테이프 이미지" className={styles.tape}/>
          <figure className={styles.photoFrame}>
            <img src="/Mypage-img/content.png" alt="노을이 비치는 여행지 풍경" />
          </figure>
          <p>JOURNEY<br />BEYOND<br />THE ORDINARY</p>
        </aside>

        <section className={styles.helpBox} aria-label="고객센터 문의">
          <div className={styles.helpIcon} aria-hidden="true">
            <img src="/Mypage-img/set.svg" alt="" />
          </div>
          <div className={styles.helpCopy}>
            <h2>아직 궁금한 점이 있나요?</h2>
            <p>평일 10:00–18:00&nbsp;&nbsp;·&nbsp;&nbsp;hello@lcode.travel</p>
          </div>
          <a href="mailto:hello@lcode.travel">문의하기 <span aria-hidden="true">→</span></a>
        </section>
      </div>
    </main>
  );
}
