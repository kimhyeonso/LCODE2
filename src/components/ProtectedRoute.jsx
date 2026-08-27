import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "./Loading";
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading label="회원 정보를 확인하는 중" />;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
