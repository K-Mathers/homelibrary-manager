import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "secondary" | "outlined";
export type ButtonSize = "sm" | "md" | "lg";

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children?: ReactNode;
  isLoading?: boolean;
}

export type ButtonProps = IButtonProps;

export const Button = ({
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  disabled,
  isLoading = false,
  ...props
}: IButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`.trim()}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className={styles.spinner} size={size === "sm" ? 14 : 16} />
      ) : (
        icon && <span className={styles.icon}>{icon}</span>
      )}
      {children && <span className={styles.label}>{children}</span>}
    </button>
  );
};
