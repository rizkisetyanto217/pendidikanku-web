// src/components/common/main/CartLink.tsx
import * as React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CartLinkProps = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  /** default true = pakai react-router Link */
  internal?: boolean;
  /** kalau ada onClick, akan diprioritaskan */
  onClick?: () => void;
  /** tambahan className optional */
  className?: string;
  /** aria-label custom; default pakai label */
  ariaLabel?: string;
};

export default function CartLink({
  label,
  icon,
  href,
  internal = true,
  onClick,
  className,
  ariaLabel,
}: CartLinkProps) {
  const navigate = useNavigate();

  // ====== Handlers ======
  const handleAction = React.useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (onClick) {
        onClick();
        return;
      }
      if (!href) return;
      if (internal) navigate(href);
      else window.open(href, "_blank", "noopener,noreferrer");
    },
    [href, internal, navigate, onClick]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") handleAction(e);
  };

  // ====== Shared row content ======
  const row = (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border bg-card p-3",
        "transition-colors hover:bg-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span aria-hidden>{icon}</span>
        <span className="truncate text-sm text-foreground">{label}</span>
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
    </div>
  );

  // Prioritas: onClick (button), lalu Link/anchor, terakhir div clickable
  if (onClick || !href) {
    return (
      <button
        type="button"
        className="w-full text-left"
        onClick={handleAction}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel ?? label}
      >
        {row}
      </button>
    );
  }

  if (internal) {
    return (
      <Link to={href} aria-label={ariaLabel ?? label} className="block">
        {row}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel ?? label}
      className="block"
      onClick={(e) => e.stopPropagation()}
    >
      {row}
    </a>
  );
}
