import { Link, useParams } from "react-router-dom";
import { useManagedCollectionState } from "../hooks/useManagedCollection";
import { defaultNotices } from "../data/defaultNotices";
import styles from "./NoticeDetail.module.scss";

const formatDate = (value) => {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  if (!date || Number.isNaN(date.getTime())) return "L:CODE NOTICE";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" }).format(date);
};

export default function NoticeDetail() {
  const { noticeId } = useParams();
  const { items: notices, loading } = useManagedCollectionState("notices", defaultNotices);
  const notice = notices.find((item) => String(item.id) === noticeId);

  if (loading && !notice) {
    return <main className={styles.page}><section className={styles.empty}><p>NOTICE</p><h1>공지사항을 불러오는 중입니다.</h1></section></main>;
  }

  if (!notice) {
    return (
      <main className={styles.page}>
        <section className={styles.empty}>
          <p>NOTICE</p>
          <h1>공지사항을 찾을 수 없습니다.</h1>
          <Link to="/notice">공지 목록으로 돌아가기 →</Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <Link className={styles.back} to="/notice">← NOTICE</Link>
        <p className={styles.eyebrow}>L:CODE · NOTICE</p>
        <h1>{notice.title}</h1>
        <p className={styles.meta}>{formatDate(notice.updatedAt || notice.createdAt)}</p>
        <div className={styles.divider} />
        <div className={styles.body}>{notice.content || "등록된 공지 내용이 없습니다."}</div>
        <footer><Link to="/notice">목록으로</Link></footer>
      </article>
    </main>
  );
}
