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
  const [showPassword, setShowPassword] = useState(false);
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
        await signup(form.email, form.password, form.name);
      } else {
        await login(form.email, form.password);
      }
      navigate(location.state?.from || "/mypage-user", { replace: true });
    } catch (authError) {
      setError(
        messages[authError.code] || authError.message || "인증 중 문제가 발생했습니다.",
      );
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
  };

  return (
    <main className={styles.auth}>
      <section className={styles.intro} aria-labelledby="auth-title">
        <div className={styles.kicker}>MEMBER&nbsp;&nbsp;/&nbsp;&nbsp;L:CODE</div>
        <div className={styles.titleRow}>
          <h1 id="auth-title">
            {mode === "login" ? (
              <>We meet again,<br /> traveler.</>
            ) : (
              <>Nice to meet you,<br /> traveler.</>
            )}
          </h1>
          <img
            className={styles.postmark}
            src="/Mypage-img/u.png"
            alt=""
            aria-hidden="true"
          />
        </div>
        <div className={styles.copy}>
          <p>저장해 둔 일정과 취향, 여행 기록을 그대로 이어가세요.</p>
          <p>당신의 여정은 여기서 계속됩니다.</p>
        </div>
        <div className={styles.signature}>
          <span>JOURNEY IN STYLE<br />CURATED FOR TRAVELERS</span>
          <i />
          <span>VOL. 02</span>
        </div>
      </section>

      <section className={styles.formFrame} aria-label={mode === "login" ? "로그인" : "회원가입"}>
        <div className={styles.frameBorder} aria-hidden="true">
          <span />
        </div>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>
              이름
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
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
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              autoComplete="email"
            />
          </label>
          <label>
            비밀번호
            <span className={styles.passwordField}>
              <input
                required
                minLength="6"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                <span aria-hidden="true" />
              </button>
            </span>
          </label>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button className={styles.submit} disabled={busy}>
            {busy ? "잠시만요…" : mode === "login" ? "로그인  →" : "회원가입  →"}
          </button>
          <div className={styles.divider} aria-hidden="true"><span /></div>
          <p className={styles.accountPrompt}>
            {mode === "login" ? "처음이신가요?" : "이미 회원이신가요?"}
            <button type="button" className={styles.switch} onClick={switchMode}>
              {mode === "login" ? "회원가입" : "로그인"}
            </button>
          </p>
          <Link className={styles.homeLink} to="/">홈으로 돌아가기</Link>
        </form>
      </section>
    </main>
  );
}
