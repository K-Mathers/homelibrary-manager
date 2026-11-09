import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.scss";
import { ReactNode, useState } from "react";
import { CatalogSVG, DownloadSVG, LogoSVG, NotesSVG, StatsSVG } from "@/assets";
import { Button } from "@/shared/ui";
import { statsApi } from "@/shared/api";

interface INavItem {
  title: string;
  to: string;
  icon: ReactNode;
}

const items: INavItem[] = [
  { title: "Каталог", to: "/catalog", icon: <CatalogSVG size={18} /> },
  {
    title: "Читательский дневник",
    to: "/journal",
    icon: <NotesSVG size={18} />,
  },
  { title: "Статистика", to: "/stats", icon: <StatsSVG size={18} /> },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await statsApi.downloadCsv();
    } catch {
      void 0;
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
    >
      <div
        className={styles.brand}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <LogoSVG size={22} className={styles.logo} />
        {!isCollapsed && <p className={styles.brandText}>HomeLibrary</p>}
      </div>

      <div className={styles.section}>
        <nav className={styles.nav}>
          {items.map((item) => {
            return (
              <NavLink
                to={item.to}
                key={item.to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ""}`
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className={styles.footer}>
        <Button
          variant="outlined"
          icon={<DownloadSVG size={15} />}
          isLoading={isExporting}
          onClick={handleExport}
        >
          {!isCollapsed && "Экспорт в CSV"}
        </Button>
      </div>
    </aside>
  );
};
