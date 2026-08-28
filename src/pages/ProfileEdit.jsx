import { useEffect, useState } from "react";
import {
  updateEmail as updateAuthEmail,
  updatePassword,
  updateProfile as updateAuthProfile,
} from "firebase/auth";
import { useAuth } from "../hooks/useAuth";
import MypageBackLink from "../components/MypageBackLink";
import { createUserProfile, getUserProfile, updateUserProfile } from "../services/firestoreService";
import kyotoImage from "../assets/images/japan.jpg";
import beijingImage from "../assets/images/beijing_china.jpg";
import styles from "./ProfileEdit.module.scss";

export default function ProfileEdit() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState("");
  const [themes, setThemes] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [editing, setEditing] = useState("");
  const [status, setStatus] = useState({ loading: true, error: "", saved: "" });

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        let profile = await getUserProfile(user.uid);
        if (!profile) {
          await createUserProfile({ uid: user.uid, email: user.email, nickname: user.displayName });
          profile = await getUserProfile(user.uid);
        }
        if (active) {
          setNickname(profile?.nickname || user.displayName || "");
          setEmail(profile?.email || user.email || "");
          setName(profile?.name || user.displayName || "");
          setPhone(profile?.phone || "");
          setThemes(profile?.themes || "");
          setStatus({ loading: false, error: "", saved: "" });
        }
      } catch {
        if (active) setStatus({ loading: false, error: "회원 정보를 불러오지 못했습니다.", saved: "" });
      }
    }
    loadProfile();
    return () => { active = false; };
  }, [user]);

  const submit = async (event) => {
    event.preventDefault();
    if (password && password !== passwordConfirm) {
      setStatus({ loading: false, error: "새 비밀번호가 서로 일치하지 않습니다.", saved: "" });
      return;
    }
    if (password && password.length < 6) {
      setStatus({ loading: false, error: "비밀번호는 6자 이상 입력해주세요.", saved: "" });
      return;
    }
    setStatus({ loading: true, error: "", saved: "" });
    try {
      if (email !== user.email) await updateAuthEmail(user, email);
      if (name !== (user.displayName || "")) await updateAuthProfile(user, { displayName: name });
      if (password) await updatePassword(user, password);
      await updateUserProfile(user.uid, { nickname, email, name, phone, themes });
      setPassword("");
      setPasswordConfirm("");
      setEditing("");
      setStatus({ loading: false, error: "", saved: "저장되었습니다." });
    } catch (error) {
      const needsLogin = error?.code === "auth/requires-recent-login";
      setStatus({
        loading: false,
        error: needsLogin ? "이메일 또는 비밀번호 변경을 위해 다시 로그인해주세요." : "저장하지 못했습니다. 입력 내용을 확인해주세요.",
        saved: "",
      });
    }
  };

  const startEditing = (field) => setEditing(field);

  return (
    <main className={styles.profileEdit}>
      <div className={styles.layout}>
        <aside className={styles.issueRail} aria-hidden="true">
          <p>ISSUE NO.<br />002</p>
          <span>TRAVEL L:CODE MEMBER<br />CURATED FOR YOU</span>
          <div className={styles.seal}>L:CODE<br />TRAVEL</div>
        </aside>

        <section className={styles.formSection} aria-labelledby="profile-title">
          <MypageBackLink />
          <span className={styles.eyebrow}>MY JOURNEY</span>
          <h1 className={styles.hero} id="profile-title">PROFILE</h1>
          <p className={styles.subtitle}>회원 정보 수정</p>
          <form onSubmit={submit}>
            <div className={styles.fieldRow}>
              <label htmlFor="profile-nickname">닉네임</label>
              <input id="profile-nickname" required type="text" placeholder="닉네임" value={nickname} readOnly={editing !== "nickname"} onChange={(event) => setNickname(event.target.value)} />
              <button type="button" className={styles.rowButton} onClick={() => startEditing("nickname")}>수정</button>
            </div>
            <div className={styles.fieldRow}>
              <label htmlFor="profile-email">이메일</label>
              <input id="profile-email" required type="email" value={email} readOnly={editing !== "email"} onChange={(event) => setEmail(event.target.value)} />
              <button type="button" className={styles.rowButton} onClick={() => startEditing("email")}>수정</button>
            </div>
            <div className={styles.fieldRow}><label htmlFor="profile-password">새 비밀번호</label><input id="profile-password" type="password" value={password} placeholder="변경할 경우에만 입력" readOnly={editing !== "password"} onChange={(event) => setPassword(event.target.value)} /><button type="button" className={styles.rowButton} onClick={() => startEditing("password")}>수정</button></div>
            <div className={styles.fieldRow}><label htmlFor="profile-password-confirm">비밀번호 확인</label><input id="profile-password-confirm" type="password" value={passwordConfirm} placeholder="새 비밀번호 확인" readOnly={editing !== "password"} onChange={(event) => setPasswordConfirm(event.target.value)} /><button type="button" className={styles.rowButton} onClick={() => startEditing("password")}>수정</button></div>
            <div className={styles.fieldRow}><label htmlFor="profile-name">이름</label><input id="profile-name" type="text" value={name} placeholder="이름" readOnly={editing !== "name"} onChange={(event) => setName(event.target.value)} /><button type="button" className={styles.rowButton} onClick={() => startEditing("name")}>수정</button></div>
            <div className={styles.fieldRow}><label htmlFor="profile-phone">휴대폰 번호</label><input id="profile-phone" type="tel" value={phone} placeholder="휴대폰 번호" readOnly={editing !== "phone"} onChange={(event) => setPhone(event.target.value)} /><button type="button" className={styles.rowButton} onClick={() => startEditing("phone")}>수정</button></div>
            <div className={styles.fieldRow}><label htmlFor="profile-themes">관심 여행 테마</label><input id="profile-themes" type="text" value={themes} placeholder="예: 도시, 건축, 미식" readOnly={editing !== "themes"} onChange={(event) => setThemes(event.target.value)} /><button type="button" className={styles.rowButton} onClick={() => startEditing("themes")}>수정</button></div>
            {status.error && <p className={styles.error}>{status.error}</p>}
            {status.saved && <p className={styles.saved}>{status.saved}</p>}
            <div className={styles.withdrawNotice}>
              <span className={styles.infoIcon}>i</span><span>회원 탈퇴를 원하시면 고객센터로 문의해주세요.</span><span>고객센터&nbsp; 070-548-8679</span>
            </div>
            <button className={styles.saveButton} disabled={status.loading}>
              <span>{status.loading ? "처리 중..." : "변경사항 저장"}</span><span aria-hidden="true">→</span>
            </button>
          </form>
        </section>

        <section className={styles.archive} aria-label="여행 아카이브 미리보기">
          <figure><img src={kyotoImage} alt="교토의 거리 풍경" /><figcaption><span>KYOTO · JAPAN</span><i /><span>L:CODE JOURNAL</span></figcaption></figure>
          <figure><img src={beijingImage} alt="베이징의 거리 풍경" /><figcaption><span>BEIJING · CHINA</span><i /><span>JOURNEY IN STYLE</span></figcaption></figure>
        </section>
      </div>
    </main>
  );
}
