import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "secondary" | "outlined";

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  children?: ReactNode;
}

export const Button = ({
  variant = "primary",
  icon,
  children,
  className = "",
  disabled,
  ...props
}: IButtonProps) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children && <span className={styles.label}>{children}</span>}
    </button>
  );
};
