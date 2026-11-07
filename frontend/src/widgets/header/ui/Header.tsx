import { ReactNode } from "react";
import styles from "./Header.module.scss";

export interface IHeaderProps {
  title: string;
  badge?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const Header = ({
  title,
  badge,
  action,
  children,
  className = "",
}: IHeaderProps) => {
  return (
    <header className={`${styles.header} ${className}`.trim()}>
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          {badge && <div className={styles.badge}>{badge}</div>}
        </div>

        {action && <div className={styles.action}>{action}</div>}
      </div>

      {children && <div className={styles.bottomRow}>{children}</div>}
    </header>
  );
};
