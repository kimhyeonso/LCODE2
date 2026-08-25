import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const submit = async (e) => {
    e.preventDefault();
    if (mode === "signup" && form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
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
    <main
      className={`${styles.auth} ${mode === "signup" ? styles.signup : ""}`}
    >
      <section
        className={`${styles.brand} ${mode === "signup" ? styles.signupBrand : ""}`}
      >
        {mode === "login" ? (
          <>
            <p>나만의 여행 계획 플랫폼</p>
            <h1>L:CODE</h1>
            <span>TRAVEL CURATION PLATFORM</span>
          </>
        ) : (
          <>
            <p>회원가입</p>
            <h1>
              CREATE
              <br />
              YOUR
              <br />
              L:CODE
            </h1>
          </>
        )}
      </section>
      <form
        className={mode === "signup" ? styles.signupForm : ""}
        onSubmit={submit}
      >
        {mode === "signup" && (
          <label>
            닉네임
            <input
              required
              placeholder="닉네임을 입력하세요"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
            />
          </label>
        )}
        <label>
          아이디
          <input
            required
            type="email"
            placeholder="이메일을 입력하세요"
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
            placeholder="비밀번호를 입력하세요"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        </label>
        {mode === "signup" && (
          <label>
            비밀번호 확인
            <input
              required
              minLength="6"
              type="password"
              placeholder="비밀번호를 한 번 더 입력하세요"
              value={form.passwordConfirm}
              onChange={(e) =>
                setForm({ ...form, passwordConfirm: e.target.value })
              }
              autoComplete="new-password"
            />
          </label>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button disabled={busy}>
          {busy ? "잠시만요…" : mode === "login" ? "로그인" : "회원가입"}
        </button>
        <p className={styles.accountPrompt}>
          {mode === "login" ? "회원이 아니신가요?" : "이미 회원이신가요?"}
          <button
            type="button"
            className={styles.switch}
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "회원가입" : "로그인"}
          </button>
        </p>
      </form>
    </main>
  );
}
