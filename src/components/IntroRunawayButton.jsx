import { useEffect, useRef, useState } from "react";
import styles from "../pages/Intro.module.scss";
import spontaneous01 from "../assets/images/intro/button2.png";

const MAX_ATTEMPTS = 10;
const sizeForAttempt = (count) => Math.max(0, 1 - count / MAX_ATTEMPTS);

export default function IntroRunawayButton({ onDisappear }) {
  const areaRef = useRef(null);
  const buttonRef = useRef(null);
  const interaction = useRef({ count: 0, position: { x: 0, y: 0 }, lockedUntil: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [attempts, setAttempts] = useState(0);

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
    if (current.count >= MAX_ATTEMPTS || performance.now() < current.lockedUntil) return;
    current.count += 1;
    current.lockedUntil = performance.now() + 300;
    setAttempts(current.count);
    if (current.count === MAX_ATTEMPTS) {
      onDisappear?.();
      return;
    }
    const area = areaRef.current;
    const button = buttonRef.current;
    const book = area.closest(`.${styles.book}`);
    const rect = area.getBoundingClientRect();
    const page = book.getBoundingClientRect();
    const scale = rect.width / area.clientWidth || 1;
    const size = sizeForAttempt(current.count);
    const width = button.offsetWidth * scale * size;
    const height = button.offsetHeight * scale * size;
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
    if (next) { current.position = next; setPosition(next); }
  };

  return (
    <div ref={areaRef} className={styles.runawayArea}>
      {attempts < MAX_ATTEMPTS && <button
        ref={buttonRef}
        className={styles.runawayButton}
        type="button"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${sizeForAttempt(attempts)})`,
          transformOrigin: "top left",
        }}
        aria-label="그냥 마음 가는 대로 갈래 · 작아지며 도망가는 장난 버튼"
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") escape(event);
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (touch) escape(touch);
        }}
        onClick={(event) => {
          event.preventDefault();
          escape(event);
        }}
      >
        <img src={spontaneous01} alt="" draggable="false" />
      </button>}
    </div>
  );
}
