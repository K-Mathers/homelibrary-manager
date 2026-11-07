import { Skeleton } from "@/shared/ui";
import styles from "./BookSkeleton.module.scss";

export const BookSkeleton = () => {
  return (
    <div className={styles.card}>
        <div className={styles.previewContainer}>
          <Skeleton width="148px" height="222px" borderRadius="4px" />
        </div>
        <div className={styles.info}>
          <Skeleton width="75%" height="16px" borderRadius="4px" />
          <Skeleton width="50%" height="13px" borderRadius="4px" />
          <div className={styles.statusRow}>
            <Skeleton width="30%" height="12px" borderRadius="4px" />
            <Skeleton width="25%" height="12px" borderRadius="4px" />
          </div>
        </div>
      </div>
      );
};
