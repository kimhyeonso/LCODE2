import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getAdminDashboardData } from "../services/firestoreService";
import styles from "./AdminDashboard.module.scss";

const formatDate = (value) => {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(date)
    : "-";
};

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [data, setData] = useState({ users: [], plans: [], reviews: [] });
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    getAdminDashboardData()
      .then((result) => {
        if (active) {
          setData(result);
          setStatus("ready");
        }
      })
      .catch(() => active && setStatus("error"));
    return () => { active = false; };
  }, []);

  const recentUsers = useMemo(
    () => [...data.users].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 8),
    [data.users],
  );
  const metric = (value) => status === "loading" ? "—" : value;

  return (
    <main className={styles.dashboard}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>L:CODE · ADMIN</p>
        <h1>운영 대시보드</h1>
        <p>{profile?.nickname || "관리자"}님, 서비스 현황을 한눈에 확인하세요.</p>
      </header>

      {status === "error" && (
        <p className={styles.error} role="alert">데이터를 불러오지 못했습니다. Firestore 규칙 배포 여부를 확인해 주세요.</p>
      )}

      <section className={styles.metrics} aria-label="서비스 현황">
        <article><span>전체 회원</span><strong>{metric(data.users.length)}</strong><small>명</small></article>
        <article><span>저장된 여행</span><strong>{metric(data.plans.length)}</strong><small>개</small></article>
        <article><span>작성된 리뷰</span><strong>{metric(data.reviews.length)}</strong><small>개</small></article>
        <article><span>관리자</span><strong>{metric(data.users.filter((user) => user.role === "admin").length)}</strong><small>명</small></article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelTitle}>
          <div><p>MEMBERS</p><h2>최근 가입 회원</h2></div>
          <span>{status === "loading" ? "불러오는 중…" : `총 ${data.users.length}명`}</span>
        </div>
        <div className={styles.tableWrap}>
          <table>
            <thead><tr><th>회원</th><th>이메일</th><th>권한</th><th>가입일</th></tr></thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.nickname || "이름 없음"}</td>
                  <td>{user.email || "-"}</td>
                  <td><span className={user.role === "admin" ? styles.adminBadge : styles.userBadge}>{user.role === "admin" ? "관리자" : "회원"}</span></td>
                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}
              {status === "ready" && recentUsers.length === 0 && <tr><td colSpan="4" className={styles.empty}>아직 가입한 회원이 없습니다.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
