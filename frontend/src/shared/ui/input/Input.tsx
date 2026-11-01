import { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Input.module.scss";

export interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  hotkey?: string;
}

export const Input = ({
  leftIcon,
  rightSlot,
  hotkey,
  className = "",
  ...props
}: IInputProps) => {
  return (
    <div className={`${styles.root} ${className}`.trim()}>
      {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
      <input type="text" className={styles.input} {...props} />
      {hotkey && <kbd className={styles.hotkey}>{hotkey}</kbd>}
      {!hotkey && rightSlot && <span className={styles.rightSlot}>{rightSlot}</span>}
    </div>
  );
};
