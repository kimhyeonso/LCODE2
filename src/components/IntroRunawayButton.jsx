import { useEffect, useRef, useState } from "react";
import styles from "../pages/Intro.module.scss";
import spontaneous01 from "../assets/images/intro/button2.png";
import spontaneous02 from "../assets/images/intro/button-02-2.png";
import spontaneous03 from "../assets/images/intro/button-02-3.png";
import spontaneous04 from "../assets/images/intro/button-02-4.png";
import spontaneous05 from "../assets/images/intro/button-02-5.png";
import spontaneous06 from "../assets/images/intro/button-02-6.png";

const runawayButtonImages = [spontaneous01, spontaneous02, spontaneous03, spontaneous04, spontaneous05];
const labels = ["그냥 마음 가는 대로 갈래", "진짜 아무 계획 없이?", "맛집이 닫혀 있어도?", "비 와도 그냥 갈 거야?", "그래도 즉흥으로?"];
export default function IntroRunawayButton({ onChoose }) {
  const areaRef = useRef(null);
  const buttonRef = useRef(null);
  const suppressTouchClick = useRef(false);
  const interaction = useRef({ count: 0, position: { x: 0, y: 0 }, lockedUntil: 0 });
  const [escapeCount, setEscapeCount] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const images = [...runawayButtonImages, spontaneous06].map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    return () => images.forEach((img) => { img.onload = null; });
  }, []);

  useEffect(() => {
    const area = areaRef.current;
    const button = buttonRef.current;
    const measure = () => {
      interaction.current.position = { x: 0, y: 0 };
      setPosition({ x: 0, y: 0 });
    };
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(area);
    observer?.observe(button);
    window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  const escape = (event) => {
    const current = interaction.current;
    if (current.count >= 4) { setConfirmed(true); return; }
    if (performance.now() < current.lockedUntil) return;
    const area = areaRef.current;
    const button = buttonRef.current;
    const book = area.closest(`.${styles.book}`);
    const rect = area.getBoundingClientRect();
    const page = book.getBoundingClientRect();
    const scale = rect.width / area.clientWidth || 1;
    const width = button.offsetWidth * scale;
    const height = button.offsetHeight * scale;
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const bounds = {
      left: Math.max(8, page.left + page.width * (mobile ? .01 : .49)),
      right: Math.min(window.innerWidth - 8, page.right - page.width * .01),
      top: Math.max(8, page.top + page.height * (mobile ? .01 : .04)),
      bottom: Math.min(window.innerHeight - 8, page.bottom - page.height * (mobile ? .01 : .04)),
    };
    const obstacles = [...book.closest("dialog").querySelectorAll(`h1, .${styles.plan}, .${styles.close}`)]
      .map((element) => element.getBoundingClientRect());
    const originX = rect.left + (area.clientWidth - button.offsetWidth) * scale / 2;
    const originY = rect.top + button.offsetTop * scale;
    const choices = [];
    // Sample fresh positions on every interaction instead of using fixed grid points.
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const x = bounds.left + Math.max(0, bounds.right - bounds.left - width) * Math.random();
      const y = bounds.top + Math.max(0, bounds.bottom - bounds.top - height) * Math.random();
      if (x + width > bounds.right || y + height > bounds.bottom) continue;
      if (obstacles.some((obstacle) => x < obstacle.right + 8 && x + width > obstacle.left - 8
        && y < obstacle.bottom + 8 && y + height > obstacle.top - 8)) continue;
      const point = { x: (x - originX) / scale, y: (y - originY) / scale };
      const distance = Math.hypot(point.x - current.position.x, point.y - current.position.y);
      if (distance < 32) continue;
      if (event.clientX >= x - 8 && event.clientX <= x + width + 8
        && event.clientY >= y - 8 && event.clientY <= y + height + 8) continue;
      choices.push(point);
    }
    const next = choices[Math.floor(Math.random() * choices.length)];
    current.count += 1;
    current.lockedUntil = performance.now() + 300;
    if (next) { current.position = next; setPosition(next); }
    setEscapeCount(current.count);
  };

  return (
    <div ref={areaRef} className={styles.runawayArea}>
      <button
        ref={buttonRef}
        className={styles.runawayButton}
        type="button"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        aria-label={`${confirmed ? "이번엔 진짜 갈래!" : labels[escapeCount]} · 즉흥 여행 선택`}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" && document.activeElement !== event.currentTarget) escape(event);
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          suppressTouchClick.current = interaction.current.count < 4;
          if (touch) escape(touch);
        }}
        onClick={(event) => {
          // Keyboard activation always works; touch requires four playful attempts.
          if (event.detail === 0) { onChoose(); return; }
          // A touch already triggered the escape; ignore its subsequent click.
          if (suppressTouchClick.current) { suppressTouchClick.current = false; return; }
          if (performance.now() < interaction.current.lockedUntil) return;
          if (interaction.current.count < 4) { escape(event); return; }
          onChoose();
        }}
      >
        <img key={confirmed ? "confirmed" : escapeCount} src={confirmed ? spontaneous06 : runawayButtonImages[escapeCount]} alt="" draggable="false" />
      </button>
    </div>
  );
}
