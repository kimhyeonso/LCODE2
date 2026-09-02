import { Link } from "react-router-dom";
import styles from "./MagazineEvent.module.scss";
import { EventHeader } from "./Event";

const icon = (name) => `/event/event04/${name}.png`;

const asset = {
  cover: "/event/event04/magazine_01.png",
  spread: "/event/event04/magazine_02.png",
  sticker: "/event/event04/magazine_icon_02.png",
  stamp: "/event/event04/magazine_icon_01.png",
};

const steps = [
  {
    no: "01",
    icon: icon("magazine_icon_05"),
    title: "여행 리뷰 작성",
    text: "다녀온 여행의 이야기를 리뷰로 남겨주세요.",
  },
  {
    no: "02",
    icon: icon("magazine_icon_06"),
    title: "리뷰 이벤트 응모",
    text: "리뷰를 등록하면 자동으로 응모됩니다.",
  },
  {
    no: "03",
    icon: icon("magazine_icon_07"),
    title: "콘텐츠 추가 제출",
    text: "여행 사진을 함께 올리면 선정 확률이 올라가요.",
  },
  {
    no: "04",
    icon: icon("magazine_icon_08"),
    title: "나만의 잡지 제작",
    text: "선정되면 리뷰가 한 권의 매거진이 됩니다.",
  },
];

const info = [
  ["참여 기간", "2026. 05. 15(금) - 2027. 08. 13(금)"],
  ["당첨자 발표", "매월 마지막 주 금요일 · 개별 SMS 안내"],
  ["참여 대상", "L:CODE 회원 누구나"],
  ["당첨 인원", "매월 10명"],
  ["제작 발송", "발표 후 약 2주 이내 순차 발송 · 배송비 무료"],
  ["잡지 사이즈", "A4 · 32P 내외 · 올컬러 양장 제본"],
];

const tips = [
  {
    icon: icon("magazine_icon_05"),
    title: "시간순으로 작성",
    text: "출발부터 도착까지 흐름이 있으면 좋아요.",
  },
  {
    icon: icon("magazine_icon_10"),
    title: "솔직한 후기",
    text: "좋았던 점도 아쉬웠던 점도 담아주세요.",
  },
  {
    icon: icon("magazine_icon_09"),
    title: "여행 사진 첨부",
    text: "고화질 사진 3장 이상을 권장해요.",
  },
  {
    icon: icon("magazine_icon_11"),
    title: "해시태그 3개",
    text: "여행지 · 테마 · 감정 키워드를 남겨주세요.",
  },
];

export default function MagazineEvent({ onExit }) {
  return (
    <>
      <EventHeader label="SPECIAL EVENT" onBack={onExit} light />

      <section className={`${styles.scene} ${styles.magazineScreen}`}>
        <div className={styles.inner}>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>SPECIAL EVENT</p>
              <h1>
                REVIEW &amp;
                <br />
                MAGAZINE
              </h1>
              <p className={styles.heroLead}>리뷰 쓰고, 당신만의 여행 잡지 받자!</p>
              <p className={styles.heroDesc}>
                여행의 순간들을 공유해주세요. 당신의 리뷰가 특별한 잡지로
                제작되어, 세상에 단 하나뿐인 매거진이 됩니다.
              </p>
            </div>
            <div className={styles.heroVisual}>
              <img className={styles.heroCover} src={asset.cover} alt="여행 매거진 표지" />
              <img className={styles.heroSticker} src={asset.sticker} alt="" />
            </div>
          </header>

          <section className={styles.block}>
            <h2>참여 방법</h2>
            <ol className={styles.steps}>
              {steps.map((step) => (
                <li key={step.no}>
                  <span className={styles.stepNo}>{step.no}</span>
                  <img src={step.icon} alt="" />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.block}>
            <h2>이벤트 안내</h2>
            <dl className={styles.infoTable}>
              {info.map(([term, detail]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.block}>
            <h2>나만의 여행 잡지 미리보기</h2>
            <figure className={styles.preview}>
              <img src={asset.spread} alt="여행 매거진 내지 미리보기" />
            </figure>
          </section>

          <section className={styles.block}>
            <h2>당첨자 혜택</h2>
            <div className={styles.reward}>
              <div className={styles.rewardVisual}>
                <img className={styles.rewardCover} src={asset.cover} alt="" />
                <img className={styles.rewardStamp} src={asset.stamp} alt="" />
              </div>
              <div>
                <strong>
                  나만의 여행 잡지
                  <br />
                  1권 제작 &amp; 발송
                </strong>
                <p>당신의 여행이 한 권의 특별한 이야기가 됩니다.</p>
                <small>* 예시 이미지이며 실제 매거진과 다를 수 있습니다.</small>
              </div>
            </div>
          </section>

          <section className={styles.block}>
            <h2>리뷰 작성 TIP</h2>
            <ul className={styles.tips}>
              {tips.map((tip) => (
                <li key={tip.title}>
                  <img src={tip.icon} alt="" />
                  <h3>{tip.title}</h3>
                  <p>{tip.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <div className={styles.actions}>
            <button type="button" className={styles.ghost} onClick={onExit}>
              목록으로
            </button>
            <Link to="/review" className={styles.primary}>
              리뷰 보러 가기 →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
