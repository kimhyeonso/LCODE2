import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import products from "../data/products.json";
import ProductCard from "../components/ProductCard";
import styles from "./Home.module.scss";
const SectionHead = ({ no, kicker, title }) => (
  <div className={styles.sectionHead}>
    <span>
      {no} / {kicker}
    </span>
    <h2>{title}</h2>
  </div>
);
export default function Home() {
  const hero = useRef(null);
  useEffect(() => {
    const tween = gsap.from(hero.current.children, {
      y: 35,
      opacity: 0,
      stagger: 0.12,
      duration: 0.9,
      ease: "power3.out",
    });
    return () => tween.kill();
  }, []);
  return (
    <>
      <section className={styles.hero}>
        <div ref={hero} className={styles.heroCopy}>
          <span className={styles.issue}>VOL. 01 — JOURNEY IN MOTION</span>
          <h1>
            계획이 틀어져도,
            <br />
            <i>여행은 계속된다.</i>
          </h1>
          <p>
            미리 큐레이션된 여행에 당신의 취향을 더하고,
            <br />
            예상 밖의 순간에는 AI로 다시 이어가세요.
          </p>
          <Link to="/travel-planner">
            나의 여행 시작하기 <b>↗</b>
          </Link>
        </div>
        <div className={styles.heroArt}>
          <div className={styles.sun} />
          <div className={styles.arch}>旅</div>
          <span>KYOTO · 35.0116° N</span>
        </div>
      </section>
      <section className={styles.upcoming}>
        <SectionHead no="01" kicker="UPCOMING" title="다가오는 여행" />
        <div className={styles.trip}>
          <div>
            <b>D−12</b>
            <span>다음 장면까지</span>
          </div>
          <h3>
            KYOTO
            <br />
            <i>A Quiet Spring</i>
          </h3>
          <p>
            APR 08 — 11
            <br />3 NIGHTS · 7 PLACES
          </p>
          <Link to="/plans">일정 열기 →</Link>
        </div>
      </section>
      <section className={styles.products}>
        <SectionHead
          no="02"
          kicker="EDITOR'S PICK"
          title="이번 계절, 우리가 고른 여행"
        />
        <div className={styles.grid}>
          {products.slice(0, 3).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
        <Link className={styles.more} to="/products">
          모든 여행 보기 (06) →
        </Link>
      </section>
      <section className={styles.destinations}>
        <SectionHead no="03" kicker="DESTINATIONS" title="Where to next?" />
        <div>
          {["KOREA", "JAPAN", "CHINA"].map((x, i) => (
            <Link to={`/products?country=${x}`} key={x}>
              <span>0{i + 1}</span>
              {x}
              <b>↗</b>
            </Link>
          ))}
        </div>
      </section>
      <section className={styles.remix}>
        <span>WHEN PLANS CHANGE</span>
        <h2>
          계획은 고정된 답이 아니라
          <br />
          <i>계속 고쳐 쓰는 여행의 초안.</i>
        </h2>
        <p>
          날씨가 바뀌고, 문이 닫히고, 조금 지쳤을 때.
          <br />
          L:CODE가 지금의 당신에게 맞게 일정을 다시 엮습니다.
        </p>
        <Link to="/travel-planner">TRY AI REMIX →</Link>
      </section>
      <section className={styles.journal}>
        <SectionHead no="06" kicker="JOURNAL" title="여행자의 기록" />
        <div className={styles.journalGrid}>
          {[
            "골목은 목적지보다 오래 남는다",
            "좋은 여행을 만드는 비워 둔 두 시간",
            "비 오는 교토를 걷는 법",
          ].map((x, i) => (
            <article key={x}>
              <div>
                JOURNAL
                <br />
                NO. {i + 1}
              </div>
              <small>FIELD NOTE · 5 MIN READ</small>
              <h3>{x}</h3>
              <p>계획 밖의 장면을 발견하는 여행자의 작은 기록.</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
