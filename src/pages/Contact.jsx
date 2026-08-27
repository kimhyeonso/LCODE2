import styles from "./Page.module.scss";
export default function Contact() {
  return (
    <main className={styles.page}>
      <header className={styles.title}>
        <span>CONTACT / HELP DESK</span>
        <h1>
          여행에 필요한
          <br />
          <i>도움을 드릴게요.</i>
        </h1>
      </header>
      <section className={styles.faq}>
        <h2>FREQUENTLY ASKED</h2>
        {[
          [
            "AI 추천은 자동으로 적용되나요?",
            "아니요. 기존 일정과 변경안을 비교한 뒤 여행자가 직접 선택합니다.",
          ],
          [
            "예약까지 바로 할 수 있나요?",
            "현재 버전은 큐레이션과 일정 구성에 집중하며 예약 기능은 준비 중입니다.",
          ],
          [
            "일정이 저장되지 않아요.",
            "Firebase 설정 전에는 저장 기능이 비활성화됩니다. AI 추천은 설정 없이도 이용할 수 있어요.",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <b>＋</b>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <section className={styles.contactBox}>
        <h2>아직 궁금한 점이 있나요?</h2>
        <p>평일 10:00—18:00 · hello@lcode.travel</p>
        <a href="mailto:hello@lcode.travel">메일 보내기 →</a>
      </section>
    </main>
  );
}
