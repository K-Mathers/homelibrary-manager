import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, BookMarked, BarChart2, Download } from 'lucide-react';
import { readingApi } from '@/shared/api';
import styles from './Sidebar.module.scss';

export const Sidebar: React.FC = () => {
  const handleExportCsv = async () => {
    try {
      const blob = await readingApi.exportCsv();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'library_export.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Ошибка экспорта CSV:', err);
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.trafficLights}>
        <span className={`${styles.dot} ${styles.dotClose}`} />
        <span className={`${styles.dot} ${styles.dotMinimize}`} />
        <span className={`${styles.dot} ${styles.dotMaximize}`} />
      </div>

      <div className={styles.brand}>
        <BookOpen className="w-5 h-5 text-[#d99b43]" />
        <span className={styles.brandTitle}>HomeLibrary</span>
      </div>

      <nav className={styles.nav}>
        <NavLink
          to="/catalog"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
          }
        >
          <BookOpen className={styles.navIcon} />
          <span>Каталог</span>
        </NavLink>

        <NavLink
          to="/journal"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
          }
        >
          <BookMarked className={styles.navIcon} />
          <span>Читательский дневник</span>
        </NavLink>

        <NavLink
          to="/stats"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
          }
        >
          <BarChart2 className={styles.navIcon} />
          <span>Статистика</span>
        </NavLink>
      </nav>

      <div className={styles.footer}>
        <button type="button" onClick={handleExportCsv} className={styles.exportBtn}>
          <Download className="w-3.5 h-3.5" />
          <span>Экспорт в CSV</span>
        </button>
      </div>
    </aside>
  );
};

