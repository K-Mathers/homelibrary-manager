import { HTMLAttributes } from "react";
import styles from "./Skeleton.module.scss";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export const Skeleton = ({
  width = "100%",
  height = "16px",
  borderRadius = "8px",
  className = "",
  style,
  ...props
}: SkeletonProps) => {
  return (
    <div
      className={`${styles.skeleton} ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      {...props}
    />
  );
};
