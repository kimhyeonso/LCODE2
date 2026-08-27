import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./Auth.module.scss";
const messages = {
  "auth/invalid-credential": "이메일 또는 비밀번호가 올바르지 않습니다.",
  "auth/email-already-in-use": "이미 가입된 이메일입니다.",
  "auth/weak-password": "비밀번호는 6자 이상이어야 합니다.",
  "auth/invalid-email": "이메일 형식을 확인해 주세요.",
};
export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "signup") await signup(form.email, form.password, form.name);
      else await login(form.email, form.password);
      navigate(location.state?.from || "/my", { replace: true });
    } catch (err) {
      setError(
        messages[err.code] || err.message || "인증 중 문제가 발생했습니다.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className={styles.auth}>
      <section>
        <span>MEMBER / L:CODE</span>
        <h1>
          {mode === "login" ? "다시 만난 여행자님," : "새로운 여행을 시작해요."}
        </h1>
        <p>일정을 저장하고 나만의 여행 기록을 이어가세요.</p>
      </section>
      <form onSubmit={submit}>
        {mode === "signup" && (
          <label>
            이름
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
            />
          </label>
        )}
        <label>
          이메일
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
          />
        </label>
        <label>
          비밀번호
          <input
            required
            minLength="6"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        </label>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button disabled={busy}>
          {busy ? "잠시만요…" : mode === "login" ? "로그인 →" : "회원가입 →"}
        </button>
        <button
          type="button"
          className={styles.switch}
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
          }}
        >
          {mode === "login"
            ? "처음이신가요? 회원가입"
            : "이미 회원이신가요? 로그인"}
        </button>
        <Link to="/">홈으로 돌아가기</Link>
      </form>
    </main>
  );
}
