import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { usePlanDestination } from "../hooks/usePlanDestination";
import styles from "./BottomNav.module.scss";
import homeIcon from "../assets/icons/menu_bar/01home.svg";
import planIcon from "../assets/icons/menu_bar/02plan.svg";
import addIcon from "../assets/icons/menu_bar/03add.svg";
import shopIcon from "../assets/icons/menu_bar/04shopping_bag.svg";
import userIcon from "../assets/icons/menu_bar/05user.svg";

const items = [
  { to: "/", icon: homeIcon, label: "HOME", end: true },
  { to: "PLAN", icon: planIcon, label: "PLAN" },
  { to: "/search", icon: addIcon, label: "", add: true },
  { to: "/shop", icon: shopIcon, label: "SHOP" },
  { to: "/my", icon: userIcon, label: "MY" },
];

export default function BottomNav() {
  const planDestination = usePlanDestination();
  const navigate = useNavigate();
  const [isBalancePromptOpen, setIsBalancePromptOpen] = useState(false);

  const openBalance = () => {
    setIsBalancePromptOpen(false);
    navigate("/balance");
  };

  const openSearch = () => {
    setIsBalancePromptOpen(false);
    navigate("/search");
  };

  return (
    <>
      {isBalancePromptOpen && (
        <button
          type="button"
          className={styles.scrim}
          aria-label="밸런스 게임 안내 닫기"
          onClick={() => setIsBalancePromptOpen(false)}
        />
      )}
    <nav className={styles.nav} aria-label="모바일 주요 메뉴">
      {items.map(({ to: target, icon, label, add, end }, index) => {
        const to = target === "PLAN" ? planDestination : target;

        if (add) {
          return (
            <div className={styles.addItem} key={`add-${index}`}>
              {isBalancePromptOpen && (
                <>
                  <button
                    type="button"
                    className={`${styles.balancePrompt} ${styles.searchPrompt}`}
                    onClick={openSearch}
                  >
                    <span>검색<br />바로가기 <b>click!</b></span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.balancePrompt} ${styles.gamePrompt}`}
                    onClick={openBalance}
                  >
                    <span>밸런스 게임<br />하러가기 <b>click!</b></span>
                  </button>
                </>
              )}
              <button
                type="button"
                className={styles.addButton}
                aria-label="밸런스 게임 열기"
                aria-expanded={isBalancePromptOpen}
                onClick={() => setIsBalancePromptOpen((current) => !current)}
              >
                <span className={styles.add}>
                  <img src={icon} alt="" aria-hidden="true" />
                </span>
              </button>
            </div>
          );
        }

        return (
        <NavLink
          key={`${to}-${index}`}
          to={to}
          end={end}
          className={({ isActive }) => (isActive ? styles.active : "")}
        >
          <span className={add ? styles.add : ""}>
            <img src={icon} alt="" aria-hidden="true" />
          </span>
          {label && <small>{label}</small>}
        </NavLink>
        );
      })}
    </nav>
    </>
  );
}
