import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import styles from "./Modal.module.scss";

export interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: IModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.window} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className={styles.header}>
            <h3 className={styles.title}>{title}</h3>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Закрыть"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
};
