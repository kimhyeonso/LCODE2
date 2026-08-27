import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./MyPage.module.scss";

export default function MyPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ nickname: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "signup") {
        await signup(form.email, form.password, form.nickname);
      } else {
        await login(form.email, form.password);
      }
      navigate(location.state?.from || "/my", { replace: true });
    } catch (authError) {
      setError(authError.message || "인증 중 문제가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={styles.myPage}>
      <div className={styles.layout}>
        <section className={styles.visualSection} aria-label="L:CODE 소개">
          <div className={styles.sideImage}>
            <span>TRIP TO THE<br />WORLD</span>
          </div>

          <div className={styles.intro}>
            <div className={styles.imagePlaceholder}>
              <p className={styles.welcome}>WELCOME<br />TO<br />L:CODE</p>
            </div>

            <div className={styles.greeting}>
              <span className={styles.number}>01</span>
              <h1>다시 만난 여행자님,</h1>
              <p>일정을 저장하고 나만의 여행기록을 이어가세요.</p>
              <div className={styles.placeSaved}>
                <span>PLACES SAVED</span>
                <strong>♥ 12</strong>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.loginPanel} aria-label="로그인">
          <form onSubmit={submit}>
            {mode === "signup" && (
              <label>
                닉네임
                <input
                  required
                  value={form.nickname}
                  onChange={(event) =>
                    setForm({ ...form, nickname: event.target.value })
                  }
                />
              </label>
            )}
            <label>
              이메일
              <input
                required
                type="email"
                aria-label="이메일"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label>
              비밀번호
              <input
                required
                minLength="6"
                type="password"
                aria-label="비밀번호"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
              />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button disabled={busy}>
              {busy ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
            </button>
          </form>
          <p className={styles.signup}>
            {mode === "login" ? "처음이신가요?" : "이미 회원이신가요?"}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "회원가입" : "로그인"}
            </button>
          </p>
          <Link to="/">홈으로 돌아가기</Link>
        </section>
      </div>
    </main>
  );
}
