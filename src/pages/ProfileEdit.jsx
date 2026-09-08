import { useEffect, useRef, useState } from "react";
import {
  updateEmail as updateAuthEmail,
  updatePassword,
  updateProfile as updateAuthProfile,
} from "firebase/auth";
import { useAuth } from "../hooks/useAuth";
import MypageBackLink from "../components/MypageBackLink";
import { createUserProfile, getUserProfile, updateUserProfile } from "../services/firestoreService";
import styles from "./ProfileEdit.module.scss";

const editLabels = {
  nickname: "닉네임",
  email: "이메일",
  password: "새 비밀번호",
  name: "이름",
  phone: "휴대폰 번호",
  themes: "관심 여행 테마",
};

export default function ProfileEdit() {
  const { user } = useAuth();
  const modalInputRef = useRef(null);
  const fieldRefs = {
    nickname: useRef(null),
    email: useRef(null),
    password: useRef(null),
    name: useRef(null),
    phone: useRef(null),
    themes: useRef(null),
  };
  const [nickname, setNickname] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState("");
  const [themes, setThemes] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [activeEdit, setActiveEdit] = useState("");
  const [draftEdit, setDraftEdit] = useState({ value: "", confirm: "" });
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
      setActiveEdit("");
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

  const getFieldValue = (field) => ({
    nickname,
    email,
    password,
    name,
    phone,
    themes,
  }[field] || "");

  const startEditing = (field) => {
    setActiveEdit(field);
    setDraftEdit({
      value: getFieldValue(field),
      confirm: field === "password" ? passwordConfirm : "",
    });
    window.requestAnimationFrame(() => modalInputRef.current?.focus());
  };

  const closeEditing = () => {
    setActiveEdit("");
    setDraftEdit({ value: "", confirm: "" });
  };

  const applyEditing = () => {
    if (activeEdit === "nickname") setNickname(draftEdit.value);
    if (activeEdit === "email") setEmail(draftEdit.value);
    if (activeEdit === "password") {
      setPassword(draftEdit.value);
      setPasswordConfirm(draftEdit.confirm);
    }
    if (activeEdit === "name") setName(draftEdit.value);
    if (activeEdit === "phone") setPhone(draftEdit.value);
    if (activeEdit === "themes") setThemes(draftEdit.value);
    closeEditing();
  };

  return (
    <main className={styles.profileEdit}>
      <div className={styles.layout}>
        <section className={styles.formSection} aria-labelledby="profile-title">
          <MypageBackLink />
          <span className={styles.eyebrow}>MY JOURNEY</span>
          <h1 className={styles.hero} id="profile-title">PROFILE</h1>
          <p className={styles.subtitle}>회원 정보 수정</p>
          <form onSubmit={submit}>
            <div className={styles.fieldRow}>
              <label htmlFor="profile-nickname">닉네임</label>
              <input ref={fieldRefs.nickname} id="profile-nickname" required type="text" placeholder="닉네임" value={nickname} readOnly />
              <button type="button" className={styles.rowButton} onClick={() => startEditing("nickname")}>수정</button>
            </div>
            <div className={styles.fieldRow}>
              <label htmlFor="profile-email">이메일</label>
              <input ref={fieldRefs.email} id="profile-email" required type="email" value={email} readOnly />
              <button type="button" className={styles.rowButton} onClick={() => startEditing("email")}>수정</button>
            </div>
            <div className={styles.fieldRow}><label htmlFor="profile-password">새 비밀번호</label><input ref={fieldRefs.password} id="profile-password" type="password" value={password} placeholder="변경할 경우에만 입력" readOnly /><button type="button" className={styles.rowButton} onClick={() => startEditing("password")}>수정</button></div>
            <div className={styles.fieldRow}><label htmlFor="profile-password-confirm">비밀번호 확인</label><input id="profile-password-confirm" type="password" value={passwordConfirm} placeholder="새 비밀번호 확인" readOnly /></div>
            <div className={styles.fieldRow}><label htmlFor="profile-name">이름</label><input ref={fieldRefs.name} id="profile-name" type="text" value={name} placeholder="이름" readOnly /><button type="button" className={styles.rowButton} onClick={() => startEditing("name")}>수정</button></div>
            <div className={styles.fieldRow}><label htmlFor="profile-phone">휴대폰 번호</label><input ref={fieldRefs.phone} id="profile-phone" type="tel" value={phone} placeholder="휴대폰 번호" readOnly /><button type="button" className={styles.rowButton} onClick={() => startEditing("phone")}>수정</button></div>
            <div className={styles.fieldRow}><label htmlFor="profile-themes">관심 여행 테마</label><input ref={fieldRefs.themes} id="profile-themes" type="text" value={themes} placeholder="예: 도시, 건축, 미식" readOnly /><button type="button" className={styles.rowButton} onClick={() => startEditing("themes")}>수정</button></div>
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

        {activeEdit && (
          <div className={styles.editModalBackdrop} role="presentation" onMouseDown={closeEditing}>
            <section
              className={styles.editModal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-edit-modal-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className={styles.editModalTop}>
                <button type="button" aria-label="뒤로가기" onClick={closeEditing}>←</button>
                <button type="button" aria-label="닫기" onClick={closeEditing}>×</button>
              </div>
              <p className={styles.modalEyebrow}>PROFILE EDIT</p>
              <h2 id="profile-edit-modal-title">{editLabels[activeEdit]}</h2>
              <label className={styles.modalField} htmlFor="profile-edit-modal-input">
                <span>{editLabels[activeEdit]}</span>
                <input
                  ref={modalInputRef}
                  id="profile-edit-modal-input"
                  type={activeEdit === "password" ? "password" : activeEdit === "email" ? "email" : activeEdit === "phone" ? "tel" : "text"}
                  value={draftEdit.value}
                  placeholder={editLabels[activeEdit]}
                  onChange={(event) => setDraftEdit((current) => ({ ...current, value: event.target.value }))}
                />
              </label>
              {activeEdit === "password" && (
                <label className={styles.modalField} htmlFor="profile-edit-modal-confirm">
                  <span>비밀번호 확인</span>
                  <input
                    id="profile-edit-modal-confirm"
                    type="password"
                    value={draftEdit.confirm}
                    placeholder="새 비밀번호 확인"
                    onChange={(event) => setDraftEdit((current) => ({ ...current, confirm: event.target.value }))}
                  />
                </label>
              )}
              <div className={styles.editModalActions}>
                <button type="button" onClick={closeEditing}>취소</button>
                <button type="button" onClick={applyEditing}>적용</button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
