import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAuth } from "../hooks/useAuth";
import { usePlanDestination } from "../hooks/usePlanDestination";
import styles from "./Header.module.scss";
import logoBlack from "../assets/images/logo-black.png";
import searchIcon from "../assets/icons/search.svg";
import menuIcon from "../assets/icons/ham_menu.svg";
import closeIcon from "../assets/icons/close.svg";

const links = [
  ["/", "HOME"],
  ["PLAN", "PLAN"],
  ["/shop", "SHOP"],
  ["/event", "EVENT"],
  ["/contact", "CONTACT"],
];

const desktopLinks = [
  ["/", "HOME"],
  ["/search", "SEARCH"],
  ["PLAN", "PLAN"],
  ["/shop", "SHOP"],
  ["/event", "EVENT"],
  ["/contact", "CONTACT"],
];

export default function Header() {
  const header = useRef(null);
  const searchInput = useRef(null);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const planDestination = usePlanDestination();

  const toggleMenu = () => {
    setOpen((current) => !current);
    setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen((current) => !current);
    setOpen(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      searchInput.current?.focus();
      return;
    }
    navigate(`/search?city=${encodeURIComponent(query)}`);
    setSearchOpen(false);
  };

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

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  return (
    <header ref={header} className={styles.header}>
      <NavLink to="/" className={styles.logo}>
        <img src={logoBlack} alt="L:CODE" />
      </NavLink>
      <div className={styles.mobileActions}>
        <button
          className={styles.searchButton}
          type="button"
          aria-label={searchOpen ? "검색 닫기" : "검색 열기"}
          aria-expanded={searchOpen}
          aria-controls="mobile-search"
          onClick={toggleSearch}
        >
          <img src={searchOpen ? closeIcon : searchIcon} alt="" aria-hidden="true" />
        </button>
        <button
          className={styles.menu}
          type="button"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={toggleMenu}
        >
          <img src={open ? closeIcon : menuIcon} alt="" aria-hidden="true" />
        </button>
      </div>
      <form
        id="mobile-search"
        className={`${styles.mobileSearch} ${searchOpen ? styles.open : ""}`}
        role="search"
        onSubmit={handleSearch}
      >
        <label htmlFor="mobile-search-input">여행지 검색</label>
        <div>
          <input
            ref={searchInput}
            id="mobile-search-input"
            type="search"
            value={searchQuery}
            placeholder="도시 또는 여행지를 입력하세요"
            autoComplete="off"
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <button type="submit" aria-label="검색">
            <img src={searchIcon} alt="" aria-hidden="true" />
          </button>
        </div>
      </form>
      <nav
        className={styles.navigation}
        aria-label="주요 메뉴"
      >
        {desktopLinks.map(([link, label]) => {
          const to = link === "PLAN" ? (user ? planDestination : "/plan") : link;
          return (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            {label}
          </NavLink>
          );
        })}
        <div className={styles.memberMenu}>
          {user ? (
            <>
              {profile?.role === "admin" && (
                <NavLink
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => (isActive ? styles.active : "")}
                >
                  DASHBOARD
                </NavLink>
              )}
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
          {links.map(([link, label], index) => {
            const to = link === "PLAN" ? planDestination : link;
            return (
            <NavLink key={label} to={to} onClick={() => setOpen(false)}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <strong>{label}</strong>
              <span>→</span>
            </NavLink>
            );
          })}
        </div>
        <div className={styles.mobileMemberMenu}>
          {user ? (
            <>
              {profile?.role === "admin" && (
                <NavLink to="/admin" onClick={() => setOpen(false)}>DASHBOARD</NavLink>
              )}
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
