import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./Header.module.scss";

const links = [
  ["/", "HOME"],
  ["/products", "PLAN"],
  ["/event", "EVENT"],
  ["/contact", "CONTACT"],
];
export default function Header() {
  const header = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const tween = gsap.fromTo(
      header.current,
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
    );
    return () => tween.kill();
  }, []);
  return (
    <header ref={header} className={styles.header}>
      <NavLink to="/" className={styles.logo}>
        L:CODE<span>TRAVEL, REMIXED</span>
      </NavLink>
      <button
        className={styles.menu}
        aria-label="메뉴 열기"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        MENU
      </button>
      <nav className={open ? styles.open : ""} aria-label="주요 메뉴">
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            {label}
          </NavLink>
        ))}
        <NavLink to="/my" onClick={() => setOpen(false)} className={styles.my}>
          MY PAGE <span>↗</span>
        </NavLink>
      </nav>
    </header>
  );
}
