import { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Input.module.scss";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Input = ({
  leftIcon,
  rightSlot,
  className = "",
  ...props
}: InputProps) => {
  return (
    <div className={`${styles.root} ${className}`.trim()}>
      {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
      <input type="text" className={styles.input} {...props} />
      {rightSlot && <span className={styles.rightSlot}>{rightSlot}</span>}
    </div>
  );
};
