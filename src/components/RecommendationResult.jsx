import styles from "./RecommendationResult.module.scss";
export default function RecommendationResult({ result }) {
  if (!result) return null;
  return (
    <section className={styles.result}>
      <small>AI CURATION / MOCK</small>
      <h2>{result.title}</h2>
      <p>{result.intro}</p>
      <ol>
        {result.schedule.map((item, i) => (
          <li key={item.title}>
            <span>DAY {i + 1}</span>
            <div>
              <b>{item.title}</b>
              <p>{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.note}>
        최종 적용 전, 영업시간과 이동편을 한 번 더 확인해 주세요.
      </p>
    </section>
  );
}
