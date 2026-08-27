import TravelForm from "../components/TravelForm";
import RecommendationResult from "../components/RecommendationResult";
import Loading from "../components/Loading";
import { useTravelRecommendation } from "../hooks/useTravelRecommendation";
import styles from "./Page.module.scss";
export default function TravelPlanner() {
  const { result, loading, error, recommend } = useTravelRecommendation();
  return (
    <main className={styles.planner}>
      <header>
        <span>PLAN → CUSTOM → REMIX</span>
        <h1>
          당신의 여행을
          <br />
          <i>다시 조립합니다.</i>
        </h1>
        <p>
          몇 가지 취향만 알려주세요. 준비된 여행의 뼈대에
          <br />
          지금의 당신에게 맞는 장면을 더할게요.
        </p>
      </header>
      <div>
        <TravelForm onSubmit={recommend} loading={loading} />
        {loading && <Loading label="여행의 장면을 고르는 중" />}
        {error && <p role="alert">{error}</p>}
        <RecommendationResult result={result} />
      </div>
    </main>
  );
}
