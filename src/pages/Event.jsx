import styles from "./Page.module.scss";
export default function Event() {
  return (
    <main className={styles.event}>
      <span>04 / EVENT</span>
      <h1>
        여행 짐을 맞히고
        <br />
        <i>다음 여행을 가볍게.</i>
      </h1>
      <p>
        실루엣만 보고 여행 필수품을 맞혀 보세요.
        <br />
        참여한 모든 여행자에게 작은 쿠폰을 드립니다.
      </p>
      <div className={styles.game}>
        <b>?</b>
        <div>
          <small>WEEKLY TRAVEL QUIZ</small>
          <h2>이 물건은 무엇일까요?</h2>
          <p>힌트: 어디서든 하나의 콘센트를 여러 개로.</p>
          <button
            onClick={() =>
              alert("정답은 멀티 어댑터! 쿠폰 기능은 곧 열릴 예정입니다.")
            }
          >
            정답 확인하기 →
          </button>
        </div>
      </div>
    </main>
  );
}
