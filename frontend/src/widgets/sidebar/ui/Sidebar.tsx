import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.scss";

interface INavItem {
    title: string;
    to: string;
    icon: string;
}

const items: INavItem[] = [
  { title: "Каталог", to: "/catalog", icon: "/catalog.svg" },
  { title: "Читательский дневник", to: "/journal", icon: "/book-open-reader-solid.svg" },
  { title: "Статистика", to: "/stats", icon: "/chart-no-axes-combined.svg"},
];

export const Sidebar = ({}) => {
  return (
    <div className={styles.sidebar}>
        <div className={styles.brand}>
          <img src="./homelibrary-logo.svg" alt="" />
          <p>HomeLibrary</p>
        </div>

        <div className={styles.section}>
            <p className={styles.sectionTitle}>БИБЛИОТЕКА</p>
            <nav className={styles.nav}>
            {items.map((item) => {
                return (
                    <NavLink to={item.to} key={item.to} className={({ isActive }) => 
                        `${styles.navItem} ${isActive ? styles.active : ""}`
                    }
                  >
                    <img src="" alt="" className={styles.navIcon} />
                    <span>{item.title}</span>
                    </NavLink>
                )
            })}
            </nav>
        </div>

        <div className={styles.footer}>
          <button>
            <p>Экспорт в CSV</p>
          </button>
        </div>
      </div>
  );
};
