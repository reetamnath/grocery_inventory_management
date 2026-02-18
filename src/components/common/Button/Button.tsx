import type { ButtonHTMLAttributes } from "react";
import "./Button.css";

type ButtonVariant =
  | "default"
  | "primary"
  | "danger"
  | "cart"
  | "cart-active"
  | "ghost";
type ButtonSize = "default" | "sm" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export function Button({
  variant = "default",
  size = "default",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "default"
      ? ""
      : variant === "primary"
        ? "btn-primary"
        : `btn-${variant}`;

  const sizeClass =
    size === "default" ? "" : size === "icon" ? "btn-icon" : `btn-${size}`;

  const classes = ["btn", variantClass, sizeClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
