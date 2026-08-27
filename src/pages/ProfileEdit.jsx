import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../services/firestoreService";
import styles from "./ProfileEdit.module.scss";

export default function ProfileEdit() {
  const { user } = useAuth();
  const [nickname, setNickname] = useState(user?.displayName || "");
  const [status, setStatus] = useState({ loading: true, error: "", saved: "" });

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        let profile = await getUserProfile(user.uid);
        if (!profile) {
          await createUserProfile({
            uid: user.uid,
            email: user.email,
            nickname: user.displayName,
          });
          profile = await getUserProfile(user.uid);
        }
        if (active) {
          setNickname(profile?.nickname || user.displayName || "");
          setStatus({ loading: false, error: "", saved: "" });
        }
      } catch {
        if (active) {
          setStatus({ loading: false, error: "회원 정보를 불러오지 못했습니다.", saved: "" });
        }
      }
    }
    loadProfile();
    return () => {
      active = false;
    };
  }, [user]);

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ loading: false, error: "", saved: "" });
    try {
      await updateUserProfile(user.uid, { nickname });
      setStatus({ loading: false, error: "", saved: "저장되었습니다." });
    } catch {
      setStatus({ loading: false, error: "저장하지 못했습니다.", saved: "" });
    }
  };

  return (
    <main className={styles.profileEdit}>
      <div className={styles.layout}>
        <section className={styles.formSection} aria-labelledby="profile-title">
          <span className={styles.eyebrow}>PROFILE</span>
          <h1 id="profile-title">회원 정보 수정</h1>

          <form onSubmit={submit}>
            <label>
              닉네임
              <input
                required
                type="text"
                placeholder="닉네임"
                aria-label="닉네임"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
              />
            </label>
            <label>
              이메일
              <input
                type="email"
                value={user?.email || ""}
                aria-label="이메일"
                readOnly
              />
            </label>
            <p className={styles.passwordLink}>
              비밀번호를 변경하시겠습니까? <button type="button">변경하기</button>
            </p>
            {status.error && <p className={styles.error}>{status.error}</p>}
            {status.saved && <p className={styles.saved}>{status.saved}</p>}
            <button className={styles.saveButton} disabled={status.loading}>
              {status.loading ? "불러오는 중..." : "저장하기"}
            </button>
          </form>
        </section>

        <section className={styles.archive} aria-label="여행 아카이브 미리보기">
          <article className={styles.tripCard}>
            <span>01</span>
            <strong>D-14</strong>
            <small>MY TRIP</small>
          </article>
          <article className={styles.recentCard}>
            <span>02</span>
            <small>RECENT</small>
            <h2>TOKYO<br />KYOTO</h2>
            <em>MAY 2026</em>
          </article>
          <article className={styles.savedCard}>
            <span>03</span>
            <small>PLACES SAVED</small>
            <strong>♥ 12</strong>
          </article>
          <article className={styles.storyCard}>
            <span>04</span>
            <small>STORIES</small>
            <strong>★ ★ ★ ★ ★<br />05</strong>
          </article>
        </section>
      </div>
    </main>
  );
}
