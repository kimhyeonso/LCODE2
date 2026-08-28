import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAuth } from "../hooks/useAuth";
import styles from "./Header.module.scss";
import logoBlack from "../assets/images/logo-black.png";
import menuIcon from "../assets/icons/ham_menu.svg";
import closeIcon from "../assets/icons/close.svg";
import searchIcon from "../assets/icons/search.svg";

const links = [
  ["/", "HOME"],
  ["/plan", "PLAN"],
  ["/shop", "SHOP"],
  ["/event", "EVENT"],
  ["/contact", "CONTACT"],
];

export default function Header() {
  const header = useRef(null);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
  };

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
        <img src={logoBlack} alt="L:CODE" />
      </NavLink>
      <div className={styles.headerActions}>
        <NavLink className={styles.searchButton} to="/search" aria-label="여행 검색" onClick={() => setOpen(false)}>
          <img src={searchIcon} alt="" aria-hidden="true" />
        </NavLink>
        <button
          className={styles.menu}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <img src={open ? closeIcon : menuIcon} alt="" aria-hidden="true" />
        </button>
      </div>
      <nav
        className={styles.navigation}
        aria-label="주요 메뉴"
      >
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
        <div className={styles.memberMenu}>
          {user ? (
            <>
              <NavLink
                to="/my"
                onClick={() => setOpen(false)}
                className={({ isActive }) => (isActive ? styles.active : "")}
              >
                MYPAGE
              </NavLink>
              <button type="button" onClick={handleLogout}>LOGOUT</button>
            </>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              LOGIN / SIGN UP
            </NavLink>
          )}
        </div>
      </nav>
      <nav
        className={`${styles.mobileNavigation} ${open ? styles.open : ""}`}
        aria-label="모바일 주요 메뉴"
      >
        <div className={styles.memberIntro}>
          <span>MY L:CODE</span>
          <strong>
            안녕하세요,
            <br />
            {user?.displayName || "여행자"} 님.
          </strong>
          <p>{user?.email || "로그인하고 여행을 시작하세요."}</p>
        </div>

        <span className={styles.contentsLabel}>CONTENTS</span>
        <div className={styles.mobileLinks}>
          {links.map(([to, label], index) => (
            <NavLink key={label} to={to} onClick={() => setOpen(false)}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <strong>{label}</strong>
              <span>→</span>
            </NavLink>
          ))}
        </div>
        <div className={styles.mobileMemberMenu}>
          {user ? (
            <>
              <NavLink to="/my" onClick={() => setOpen(false)}>MYPAGE</NavLink>
              <button type="button" onClick={handleLogout}>LOGOUT</button>
            </>
          ) : (
            <NavLink to="/login" onClick={() => setOpen(false)}>
              LOGIN / SIGN UP
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
