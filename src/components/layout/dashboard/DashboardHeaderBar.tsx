// src/components/layout/dashboard/DashboardHeaderBar.tsx
import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import CMenuDropdown from "@/components/costum/CMenuDropdown";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import type { HeaderState, MobileHeaderMode } from "./DashboardLayout";

type DashboardHeaderBarProps = {
  hdr: Required<HeaderState>;
  mobileMode: MobileHeaderMode;
  onMobileBack?: () => void;
  mobileTitleMaxWords: number;
  headerClassName?: string;
};

/* ================= Helpers ================= */
function truncateWords(s: string, maxWords: number) {
  const parts = (s ?? "").trim().split(/\s+/);
  if (parts.length <= maxWords) return s;
  return parts.slice(0, maxWords).join(" ") + "…";
}

/* ================= Component ================= */
export function DashboardHeaderBar({
  hdr,
  mobileMode,
  onMobileBack,
  mobileTitleMaxWords,
  headerClassName,
}: DashboardHeaderBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile, setOpen, isMobile } = useSidebar();

  // === Wide trigger: buka sidebar dari mana saja yang ditandai ===
  const openSidebarWide = React.useCallback(() => {
    if (isMobile) setOpenMobile(true);
    else setOpen(true); // paksa expand di desktop
  }, [isMobile, setOpenMobile, setOpen]);

  // Akses keyboard utk elemen "role=button"
  const keyActivate = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openSidebarWide();
      }
    },
    [openSidebarWide]
  );

  /* ---- Scroll-aware header (show instantly on small upward scroll) ---- */
  const [hidden, setHidden] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const lastYRef = React.useRef<number>(0);
  const revealAtYRef = React.useRef<number>(0);
  const tickingRef = React.useRef(false);

  React.useEffect(() => {
    const y0 = Math.max(0, window.scrollY || 0);
    lastYRef.current = y0;
    revealAtYRef.current = y0;

    const PIN_AT_TOP = 4;
    const HIDE_AFTER_DOWN = 12;

    const onScroll = () => {
      const y = Math.max(0, window.scrollY || 0);
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const last = lastYRef.current;
        const delta = y - last;

        setScrolled(y > 8);

        if (y <= PIN_AT_TOP) {
          setHidden(false);
          revealAtYRef.current = y;
        } else if (delta < 0) {
          setHidden(false);
          revealAtYRef.current = y;
        } else if (delta > 0) {
          if (y - revealAtYRef.current > HIDE_AFTER_DOWN) {
            setHidden(true);
          }
        }

        lastYRef.current = y;
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Normalisasi href breadcrumb relatif ke schoolId/role
  const normalizeHref = React.useCallback(
    (href: string) => {
      if (!href) return href;
      if (href.startsWith("/") || href.startsWith("http")) return href;

      const segs = location.pathname.split("/").filter(Boolean);
      const schoolId = segs[0] ?? "";
      const role = segs[1] ?? "guru";

      const base = `/${schoolId}/${role}`;
      return `${base}/${href.replace(/^\/+/, "")}`;
    },
    [location.pathname]
  );

  /* ---- Styling header ---- */
  const baseHeaderCls =
    "sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 transition-[transform,width,height,background] ease-linear";
  const compactCls = "group-has-data-[collapsible=icon]/sidebar-wrapper:h-12";
  const bgBlurShadowCls = scrolled
    ? "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
    : "bg-background";
  const hideTransformCls = hidden ? "-translate-y-full" : "translate-y-0";

  const mobileTitle = React.useMemo(
    () => truncateWords(hdr.title ?? "", mobileTitleMaxWords),
    [hdr.title, mobileTitleMaxWords]
  );

  const handleMobileBack = React.useCallback(() => {
    if (onMobileBack) onMobileBack();
    else navigate(-1);
  }, [onMobileBack, navigate]);

  // Sumber utama: hdr.showBack, fallback mobileMode
  const isBack = hdr.showBack || mobileMode === "back";

  return (
    <header
      className={[
        baseHeaderCls,
        compactCls,
        bgBlurShadowCls,
        hideTransformCls,
        headerClassName,
      ].join(" ")}
    >
      <div className="flex items-center gap-2 px-4 w-full">
        <div className="flex items-center gap-2 min-w-0">
          {/* ======= LEFT CONTROLS ======= */}

          {/* MOBILE: [Back] [Title] */}
          {isBack && (
            <div className="md:hidden flex items-center gap-2 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl"
                aria-label="Kembali"
                onClick={handleMobileBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <div
                className="text-base font-semibold truncate max-w-[50vw]"
                title={hdr.title}
              >
                {mobileTitle}
              </div>
            </div>
          )}

          {/* DESKTOP/TABLET HAMBURGER (tetap di kiri di md+) */}
          <SidebarTrigger
            className={isBack ? "hidden md:inline-flex -ml-1" : "-ml-1"}
          />

          {/* Separator hanya tampil di md+ */}
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4 hidden md:block"
          />

          {hdr.headerLeft ? (
            hdr.headerLeft
          ) : (
            <div className="min-w-0">
              {/* MOBILE TITLE kalau tidak mode back */}
              {!isBack && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={openSidebarWide}
                  onKeyDown={keyActivate}
                  className="md:hidden text-base font-semibold truncate max-w-[60vw] cursor-pointer select-none px-2 py-1 -mx-1 rounded-md hover:bg-muted/30 active:bg-muted/40"
                  title={`${hdr.title} — ketuk untuk buka menu`}
                  aria-label="Buka sidebar"
                >
                  {mobileTitle}
                </div>
              )}

              {/* BREADCRUMB (md+) */}
              <Breadcrumb className="min-w-0 hidden md:block">
                <BreadcrumbList className="flex-nowrap overflow-hidden">
                  {hdr.breadcrumbs.map((c, i) => {
                    const isLast = i === hdr.breadcrumbs.length - 1;
                    return (
                      <React.Fragment key={`${c.label}-${i}`}>
                        <BreadcrumbItem
                          className={i === 0 ? "hidden md:block" : ""}
                        >
                          {isLast ? (
                            <BreadcrumbPage variant="chip" className="truncate">
                              {c.label}
                            </BreadcrumbPage>
                          ) : c.href ? (
                            <BreadcrumbLink asChild className="truncate">
                              <Link
                                to={normalizeHref(c.href)}
                                replace={i === 0}
                              >
                                {c.label}
                              </Link>
                            </BreadcrumbLink>
                          ) : (
                            <span className="truncate text-foreground/80">
                              {c.label}
                            </span>
                          )}
                        </BreadcrumbItem>

                        {!isLast && (
                          <BreadcrumbSeparator
                            className={i === 0 ? "hidden md:block" : ""}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
        </div>

        {/* ======= RIGHT CONTROLS ======= */}
        <div className="ml-auto flex items-center gap-2">
          {hdr.actions}

          {/* MOBILE/BACK: [Menu] [⋮] di kanan */}
          {isBack && (
            <SidebarTrigger className="md:hidden" aria-label="Buka menu" />
          )}

          {hdr.showUserMenu && <CMenuDropdown withBg />}
        </div>
      </div>
    </header>
  );
}
