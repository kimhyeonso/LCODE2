import { useEffect, useState } from "react";
import MypageBackLink from "../components/MypageBackLink";
import styles from "./Paking.module.scss";

const groups = [
  { title: "서류 / 기본 준비", items: ["여권", "항공권 또는 e-ticket", "숙소 예약 내역", "카드 / 현금", "비상 연락처"] },
  { title: "옷 / 생활용품", items: ["옷", "속옷", "양말", "잠옷", "샴푸 / 세면도구", "칫솔 / 치약"] },
  { title: "전자기기 / 기타", items: ["충전기", "멀티 어댑터(변환기)", "휴대폰 보조배터리", "캐리어", "상비약", "우산 또는 가벼운 겉옷"] },
];

const tips = [
  "여권은 출국 전날 미리 꺼내 두고, 바로 찾을 수 있는 가방 칸에 넣어두세요.",
  "비행기에서 쓸 물건(여권, 휴대폰, 충전기)은 캐리어보다 손가방에 넣는 게 편해요.",
  "샴푸나 액체류는 새지 않게 지퍼백이나 파우치에 따로 넣어두세요.",
  "첫날 바로 입을 옷과 속옷은 꺼내기 쉬운 곳에 챙기면 덜 헤매요.",
  "출발 전날 이 체크리스트를 한 번 더 보면서 하나씩 확인하면 훨씬 마음이 편해져요.",
];

const storageKey = "lcode-paking-checklist";
const allItems = groups.flatMap((group) => group.items);

const getSavedChecks = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export default function Paking() {
  const [checkedItems, setCheckedItems] = useState(getSavedChecks);
  const [showStampModal, setShowStampModal] = useState(false);

  useEffect(() => {
    if (allItems.every((item) => checkedItems.includes(item))) {
      setShowStampModal(true);
    }
  }, [checkedItems]);

  const toggleItem = (item) => {
    setCheckedItems((current) => {
      const next = current.includes(item)
        ? current.filter((savedItem) => savedItem !== item)
        : [...current, item];
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return (
    <main className={styles.pakingPage}>
      <div className={styles.content}>
        <header className={styles.hero}>
          <div className={styles.heading}>
            <MypageBackLink to="/plan/saved" label="여행 일정으로 돌아가기" />
            <p className={styles.eyebrow}>MY JOURNEY</p>
            <h1>PACKING LIST</h1>
            <p className={styles.description}>여행 필수품과 초보 여행자를 위한 팁을 한 번에 확인해보세요.</p>
            <div className={styles.divider} />
          </div>
          <div className={styles.postcard}>
            <img src="/Mypage-img/3.png" alt="교토의 전통 거리" />
            <span>KYOTO, JAPAN</span>
          </div>
        </header>

        <div className={styles.panels}>
          <section className={styles.checklist} aria-labelledby="checklist-title">
            <h2 id="checklist-title"><span aria-hidden="true">✓</span> 여행 필수품 체크리스트</h2>
            <div className={styles.groups}>
              {groups.map((group) => (
                <div className={styles.group} key={group.title}>
                  <h3>{group.title}</h3>
                  <div>
                    {group.items.map((item) => (
                      <label key={item}>
                        <input
                          type="checkbox"
                          checked={checkedItems.includes(item)}
                          onChange={() => toggleItem(item)}
                        />
                        <span aria-hidden="true" />
                        <b>{item}</b>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.tips} aria-labelledby="tips-title">
            <header>
              <span className={styles.tipIcon} aria-hidden="true">☼</span>
              <div><h2 id="tips-title">FIRST TRIP TIPS</h2><p>여행 초보 TIP</p></div>
            </header>
            <ol>
              {tips.map((tip, index) => <li key={tip}><span>{index + 1}</span><p>{tip}</p></li>)}
            </ol>
          </section>
        </div>
      </div>

      {showStampModal && (
        <div
          className={styles.stampModal}
          role="presentation"
          onClick={() => setShowStampModal(false)}
        >
          <div
            className={styles.stampBoard}
            role="dialog"
            aria-modal="true"
            aria-label="여행 준비 완료 스탬프"
            onClick={(event) => event.stopPropagation()}
          >
            <img className={styles.stampBoardImage} src="/Mypage-img/stamp_2.svg" alt="여행 스탬프 보드" />
            <img className={styles.completedStamp} src="/Mypage-img/stamp.png" alt="완료 스탬프" />
            <button type="button" onClick={() => setShowStampModal(false)} aria-label="스탬프 닫기">×</button>
          </div>
        </div>
      )}
    </main>
  );
}
