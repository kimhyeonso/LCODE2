import { useState } from "react";
import { requestRecommendation } from "../services/aiService";
export function useTravelRecommendation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recommend = async (form) => {
    setLoading(true);
    setError("");
    try {
      setResult(await requestRecommendation(form));
    } catch {
      setError("추천을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };
  return { result, loading, error, recommend };
}
