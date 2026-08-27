import TravelForm from "../components/TravelForm";
import RecommendationResult from "../components/RecommendationResult";
import Loading from "../components/Loading";
import { useTravelRecommendation } from "../hooks/useTravelRecommendation";
import styles from "./Page.module.scss";

export default function TravelPlanner() {
  const { result, loading, error, recommend } = useTravelRecommendation();

  return (
    <main className={styles.planner}>
      <div className={styles.plannerContent}>
        <TravelForm onSubmit={recommend} loading={loading} />
        {loading && <Loading label="여행 일정을 저장하는 중" />}
        {error && <p role="alert">{error}</p>}
        <RecommendationResult result={result} />
      </div>
    </main>
  );
}
