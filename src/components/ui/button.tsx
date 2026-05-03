"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BUTTON — Ulul Albaab Edition
   Token-aligned dengan globals.css ululalbaab:
   · Warna   : brand-blue, brand-yellow, gold, ink
   · Shadow  : --shadow-blue, --shadow-blue-lg, --shadow-yellow, --shadow-yellow-lg
   · Radius  : --radius-full (pill), --radius-md, --radius-lg
   · Easing  : --ease-spring, --ease-smooth
   · Duration: --duration-fast, --duration-base
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const buttonVariants = cva(
  /* ─── Base — berlaku semua variant ─── */
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-sans font-semibold tracking-[-0.01em]",
    "select-none cursor-pointer",
    "transition-all",
    "duration-[var(--duration-base)]",
    "[transition-timing-function:var(--ease-spring)]",
    /* Focus ring — branded blue */
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--color-brand-blue-500)]",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[var(--color-surface-50)]",
    /* Disabled */
    "disabled:pointer-events-none disabled:opacity-45",
    /* Active scale — semua variant */
    "active:scale-[0.97]",
  ].join(" "),
  {
    variants: {
      variant: {
        /* ─── PRIMARY — Blue gradient utama ─── */
        primary: [
          "relative overflow-hidden",
          "bg-gradient-to-br from-[var(--color-brand-blue-500)] to-[var(--color-brand-blue-800)]",
          "text-white",
          "[box-shadow:var(--shadow-blue)]",
          /* Shine overlay */
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-gradient-to-br before:from-white/[0.12] before:to-transparent",
          "before:pointer-events-none",
          "hover:-translate-y-[2px]",
          "hover:[box-shadow:var(--shadow-blue-lg)]",
          "hover:brightness-[1.08]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── SECONDARY — Putih + border blue ─── */
        secondary: [
          "bg-[var(--color-white)]",
          "text-[var(--color-brand-blue-700)]",
          "border border-[var(--color-brand-blue-200)]",
          "[box-shadow:var(--shadow-xs)]",
          "hover:bg-[var(--color-brand-blue-50)]",
          "hover:border-[var(--color-brand-blue-400)]",
          "hover:[box-shadow:var(--shadow-sm)]",
          "hover:-translate-y-[1px]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── YELLOW — Kuning energik, aksen identitas ─── */
        yellow: [
          "relative overflow-hidden",
          "bg-gradient-to-br from-[var(--color-brand-yellow-300)] to-[var(--color-brand-yellow-500)]",
          "text-[var(--color-brand-blue-900)]",
          "[box-shadow:var(--shadow-yellow)]",
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-gradient-to-br before:from-white/20 before:to-transparent",
          "before:pointer-events-none",
          "hover:-translate-y-[2px]",
          "hover:brightness-[1.06]",
          "hover:[box-shadow:var(--shadow-yellow-lg)]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── GOLD — Kuning tua premium ─── */
        gold: [
          "relative overflow-hidden",
          "bg-gradient-to-br from-[var(--color-gold-300)] to-[var(--color-gold-500)]",
          "text-[var(--color-brand-blue-950)]",
          "[box-shadow:var(--shadow-gold)]",
          "before:absolute before:inset-0 before:rounded-[inherit]",
          "before:bg-gradient-to-br before:from-white/20 before:to-transparent",
          "before:pointer-events-none",
          "hover:-translate-y-[2px]",
          "hover:brightness-[1.05]",
          "hover:[box-shadow:0_8px_24px_-4px_rgba(245,158,11,0.45)]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── OUTLINE — Border blue, fill on hover ─── */
        outline: [
          "bg-transparent",
          "text-[var(--color-brand-blue-600)]",
          "border-[1.5px] border-[var(--color-brand-blue-300)]",
          "hover:bg-[var(--color-brand-blue-800)]",
          "hover:text-white",
          "hover:border-[var(--color-brand-blue-800)]",
          "hover:[box-shadow:var(--shadow-blue)]",
          "hover:-translate-y-[1px]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── GHOST — Transparan, minimum footprint ─── */
        ghost: [
          "bg-transparent",
          "text-[var(--color-ink-600)]",
          "border border-transparent",
          "hover:bg-[var(--color-brand-blue-50)]",
          "hover:text-[var(--color-brand-blue-700)]",
          "hover:border-[var(--color-brand-blue-100)]",
          "[transition-timing-function:var(--ease-smooth)]",
          "duration-[var(--duration-fast)]",
        ].join(" "),

        /* ─── DANGER — Destructive action ─── */
        danger: [
          "bg-[var(--color-danger-500)]",
          "text-white",
          "[box-shadow:0_4px_14px_-2px_rgba(220,38,38,0.28),0_2px_6px_rgba(0,0,0,0.06)]",
          "hover:brightness-[1.08]",
          "hover:-translate-y-[2px]",
          "hover:[box-shadow:0_8px_24px_-4px_rgba(220,38,38,0.38)]",
          "active:translate-y-0",
        ].join(" "),

        /* ─── LINK — Inline text link, minimal ─── */
        link: [
          "bg-transparent p-0 h-auto",
          "text-[var(--color-brand-blue-600)]",
          "font-medium underline-offset-4",
          "hover:underline hover:text-[var(--color-brand-blue-900)]",
          "[transition-timing-function:var(--ease-smooth)]",
          "duration-[var(--duration-fast)]",
          "active:scale-100",
        ].join(" "),
      },

      size: {
        xs: "h-8 px-3 text-xs rounded-[var(--radius-md)]",
        sm: "h-9 px-4 text-[0.8125rem] rounded-[var(--radius-full)]",
        md: "h-11 px-6 text-[0.9375rem] rounded-[var(--radius-full)]",
        lg: "h-12 px-8 text-base rounded-[var(--radius-full)]",
        xl: "h-14 px-10 text-lg rounded-[var(--radius-full)]",
        icon: "h-10 w-10 rounded-[var(--radius-md)] p-0",
        "icon-sm": "h-8 w-8 rounded-[var(--radius-md)] p-0",
        "icon-lg": "h-12 w-12 rounded-[var(--radius-lg)] p-0",
      },

      fullWidth: {
        true: "w-full",
      },

      loading: {
        true: "pointer-events-none",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SPINNER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TYPES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  /** Render sebagai child element (mis. Link dari Next.js) */
  asChild?: boolean;
  /** Tampilkan spinner + disable pointer events */
  isLoading?: boolean;
  /** Label aksesibilitas saat loading */
  loadingText?: string;
  /** Icon di sisi kiri konten */
  leftIcon?: React.ReactNode;
  /** Icon di sisi kanan konten */
  rightIcon?: React.ReactNode;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const computedClass = cn(
      buttonVariants({ variant, size, fullWidth, loading: isLoading, className })
    );

    const content = (
      <>
        {isLoading ? (
          <Spinner />
        ) : leftIcon ? (
          <span className="shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]">
            {leftIcon}
          </span>
        ) : null}

        {isLoading && loadingText ? (
          <span>{loadingText}</span>
        ) : isLoading ? (
          <span className="sr-only">Memuat…</span>
        ) : (
          children
        )}

        {!isLoading && rightIcon ? (
          <span className="shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]">
            {rightIcon}
          </span>
        ) : null}
      </>
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<Record<string, unknown>>,
        { className: computedClass, ref, ...props }
      );
    }

    return (
      <button
        ref={ref}
        className={computedClass}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-disabled={isDisabled}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };