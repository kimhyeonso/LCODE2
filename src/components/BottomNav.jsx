import { NavLink } from "react-router-dom";
import styles from "./BottomNav.module.scss";
import homeIcon from "../assets/icons/menu_bar/01home.svg";
import planIcon from "../assets/icons/menu_bar/02plan.svg";
import addIcon from "../assets/icons/menu_bar/03add.svg";
import shopIcon from "../assets/icons/menu_bar/04shopping_bag.svg";
import userIcon from "../assets/icons/menu_bar/05user.svg";

const items = [
  { to: "/", icon: homeIcon, label: "HOME", end: true },
  { to: "/plan", icon: planIcon, label: "PLAN" },
  { to: "/search", icon: addIcon, label: "", add: true },
  { to: "/shop", icon: shopIcon, label: "SHOP" },
  { to: "/my", icon: userIcon, label: "MY" },
];

export default function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="모바일 주요 메뉴">
      {items.map(({ to, icon, label, add, end }, index) => (
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
      ))}
    </nav>
  );
}
