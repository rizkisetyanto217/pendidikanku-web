// src/components/common/public/LinktreeNavbar.tsx
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CMenuDropdown from "@/components/costum/CMenuDropdown";
// (opsional) kalau punya helper cn:
// import { cn } from "@/lib/utils";

export interface LinktreeNavbarProps {
  brandName?: string;
  brandIconSrc?: string;
  onBrandClick?: () => void;
  coverOverlap?: boolean;
  showMenu?: boolean;
  menuSlot?: React.ReactNode;
  maxWidthClass?: string;
}

export default function LinktreeNavbar({
  brandName = "sekolahislamku",
  brandIconSrc,
  onBrandClick,
  coverOverlap = true,
  showMenu = true,
  menuSlot,
  maxWidthClass = "max-w-screen-xl",
}: LinktreeNavbarProps) {
  const navigate = useNavigate();

  // ===== glass → solid saat scroll
  const [solid, setSolid] = useState(!coverOverlap);
  const ticking = useRef(false);

  useEffect(() => {
    if (!coverOverlap) return;
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setSolid(y > 8);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [coverOverlap]);

  const containerClass = useMemo(() => {
    if (!coverOverlap) return "bg-background border-b";
    return solid
      ? "bg-background/90 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70"
      : "bg-transparent";
  }, [coverOverlap, solid]);

  const handleBrandClick = () => {
    if (onBrandClick) return onBrandClick();
    try {
      navigate("/");
    } catch {/* noop */}
  };

  const initials =
    brandName
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "SI";

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className={`mx-auto w-full ${maxWidthClass} px-3 sm:px-4`}>
        <nav
          className={[
            "mt-2 sm:mt-3 h-12 sm:h-14 grid grid-cols-[1fr_auto] items-center",
            "rounded-2xl border transition-all",
            containerClass,
          ].join(" ")}
          aria-label="Linktree navbar"
        >
          {/* LEFT: Brand */}
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-2 pl-1 sm:pl-1.5 group"
            aria-label={`Beranda ${brandName}`}
            title={brandName}
          >
            {brandIconSrc ? (
              <img
                src={brandIconSrc}
                alt={brandName}
                className="h-8 w-8 rounded-full object-cover border"
              />
            ) : (
              <div className="h-8 w-8 rounded-full grid place-items-center text-xs font-bold border bg-primary text-primary-foreground border-primary">
                {initials}
              </div>
            )}
            <span className="text-sm sm:text-base font-semibold text-foreground">
              {brandName}
            </span>
          </button>

          {/* RIGHT: menu (ikon hamburger / user) */}
          <div className="pr-1 sm:pr-1.5 flex items-center gap-1.5">
            {showMenu ? menuSlot ?? <CMenuDropdown variant="icon" /> : null}
          </div>
        </nav>
      </div>
    </div>
  );
}
