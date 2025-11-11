// src/components/layout/dashboard/DashboardLayout.tsx
import * as React from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/dashboard/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
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

/* ================== Types ================== */
export type Crumb = { label: string; href?: string };

export type HeaderState = {
  title?: string; // judul utk mobile
  breadcrumbs?: Crumb[]; // breadcrumb utk md+
  headerLeft?: React.ReactNode; // slot kiri custom
  actions?: React.ReactNode; // slot kanan (aksi)
  showUserMenu?: boolean; // tampilkan menu user?
};

type MobileHeaderMode = "menu" | "back";

type DashboardLayoutProps = HeaderState & {
  children?: React.ReactNode;
  contentClassName?: string;
  headerClassName?: string;

  /** ====== MOBILE OPTIONS ======
   * "menu":  [Hamburger]  Title  [UserMenu]
   * "back":  [Back] Title [UserMenu] [Hamburger]
   * default: "menu"
   */
  mobileMode?: MobileHeaderMode;
  /** Callback tombol back (mobileMode="back"). Default: navigate(-1) */
  onMobileBack?: () => void;
  /** Batas kata judul mobile sebelum di-ellipsis. Default: 6 kata */
  mobileTitleMaxWords?: number;
};

/* ================== Context API ================== */
type HeaderContextValue = {
  header: Required<HeaderState>;
  setHeader: (next: Partial<HeaderState>) => void; // merge setter
};

const DEFAULT_BC: Crumb[] = [{ label: "Dashboard", href: "dashboard" }];

const HeaderContext = React.createContext<HeaderContextValue | null>(null);

export function useDashboardHeader() {
  const ctx = React.useContext(HeaderContext);
  if (!ctx)
    throw new Error("useDashboardHeader must be used inside DashboardLayout");
  return ctx;
}

/* ================== Helpers ================== */
function truncateWords(s: string, maxWords: number) {
  const parts = (s ?? "").trim().split(/\s+/);
  if (parts.length <= maxWords) return s;
  return parts.slice(0, maxWords).join(" ") + "…";
}

/* ================== Public Component ================== */
export default function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardShell {...props} />
    </SidebarProvider>
  );
}

/* ================== Shell ================== */
function DashboardShell({
  title,
  breadcrumbs = DEFAULT_BC,
  actions,
  headerLeft,
  showUserMenu = true,
  children,
  contentClassName = "",
  headerClassName = "",

  // mobile options
  mobileMode = "menu",
  onMobileBack,
  mobileTitleMaxWords = 6,
}: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpenMobile, setOpen, isMobile } = useSidebar();

  // Tutup sheet sidebar di mobile setiap route berubah
  React.useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

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

  // posisi scroll terakhir
  const lastYRef = React.useRef<number>(0);
  // titik terakhir saat header “ditampilkan”
  const revealAtYRef = React.useRef<number>(0);
  // rAF guard
  const tickingRef = React.useRef(false);

  React.useEffect(() => {
    // init
    const y0 = Math.max(0, window.scrollY || 0);
    lastYRef.current = y0;
    revealAtYRef.current = y0;

    const PIN_AT_TOP = 4; // di dekat top, header selalu tampil
    const HIDE_AFTER_DOWN = 12; // pixel turun sebelum hide

    const onScroll = () => {
      const y = Math.max(0, window.scrollY || 0);
      if (tickingRef.current) return;
      tickingRef.current = true;

      requestAnimationFrame(() => {
        const last = lastYRef.current;
        const delta = y - last;

        // status blur/shadow
        setScrolled(y > 8);

        if (y <= PIN_AT_TOP) {
          // dekat top → selalu terlihat
          setHidden(false);
          revealAtYRef.current = y;
        } else if (delta < 0) {
          // bergerak ke atas sedikit saja → tampilkan segera
          setHidden(false);
          revealAtYRef.current = y;
        } else if (delta > 0) {
          // bergerak ke bawah → sembunyikan setelah melewati ambang kecil
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

  /* ---- Baseline header (dipakai untuk reset saat ganti route) ---- */
  const baselineRef = React.useRef<Required<HeaderState>>({
    title: title ?? breadcrumbs[breadcrumbs.length - 1]?.label ?? "Dashboard",
    breadcrumbs,
    headerLeft: headerLeft ?? null,
    actions: actions ?? null,
    showUserMenu,
  });

  // Update baseline jika props layout berubah
  React.useEffect(() => {
    baselineRef.current = {
      title: title ?? breadcrumbs[breadcrumbs.length - 1]?.label ?? "Dashboard",
      breadcrumbs,
      headerLeft: headerLeft ?? null,
      actions: actions ?? null,
      showUserMenu,
    };
  }, [title, breadcrumbs, headerLeft, actions, showUserMenu]);

  // State header yang bisa dioverride anak
  const [hdr, setHdr] = React.useState<Required<HeaderState>>(
    baselineRef.current
  );

  // RESET header setiap ganti route → hilangkan “riwayat” breadcrumb lama
  React.useEffect(() => {
    setHdr(baselineRef.current);
  }, [location.pathname]);

  const setHeader = React.useCallback((next: Partial<HeaderState>) => {
    setHdr((s) => {
      const merged = { ...s, ...next };
      if (!merged.title) {
        merged.title =
          merged.breadcrumbs[merged.breadcrumbs.length - 1]?.label ??
          "Dashboard";
      }
      return merged;
    });
  }, []);

  const normalizeHref = React.useCallback(
    (href: string) => {
      if (!href) return href;
      if (href.startsWith("/") || href.startsWith("http")) return href;

      // Ambil segmen path, misalnya: ["0c864ac5-74f4-4a2a-9f1d-c88b7fb7ad12", "guru", "dashboard"]
      const segs = location.pathname.split("/").filter(Boolean);

      // Ambil school_id = segs[0]
      const schoolId = segs[0] ?? "";

      // Ambil role dashboard (guru / sekolah / siswa)
      const role = segs[1] ?? "guru"; // default guru

      // Base path dinamis
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

  // Judul untuk mobile (dipotong per jumlah kata + truncate CSS)
  const mobileTitle = React.useMemo(
    () => truncateWords(hdr.title ?? "", mobileTitleMaxWords),
    [hdr.title, mobileTitleMaxWords]
  );

  // Handler back default
  const handleMobileBack = React.useCallback(() => {
    if (onMobileBack) onMobileBack();
    else navigate(-1);
  }, [onMobileBack, navigate]);

  const isBack = mobileMode === "back";

  return (
    <HeaderContext.Provider value={{ header: hdr, setHeader }}>
      <AppSidebar />

      <SidebarInset>
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

              {/* --- MOBILE CLUSTER (mode back): Back — Title — Menu — Hamburger --- */}
              {isBack && (
                <div className="md:hidden flex items-center gap-2 min-w-0">
                  {/* Back paling kiri */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl"
                    aria-label="Kembali"
                    onClick={handleMobileBack}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>

                  {/* Title → WIDE TRIGGER (mobile) */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={openSidebarWide}
                    onKeyDown={keyActivate}
                    className="text-base font-semibold truncate max-w-[46vw] cursor-pointer select-none px-2 py-1 -mx-1 rounded-md hover:bg-muted/30 active:bg-muted/40"
                    title={`${hdr.title} — ketuk untuk buka menu`}
                    aria-label="Buka sidebar"
                  >
                    {mobileTitle}
                  </div>

                  {/* Menu di sebelah title */}
                  {hdr.showUserMenu && <CMenuDropdown withBg />}

                  {/* Hamburger di paling kanan cluster */}
                  <SidebarTrigger />
                </div>
              )}

              {/* --- DESKTOP/TABLET HAMBURGER (hidden di mobile saat mode back) --- */}
              <SidebarTrigger
                className={isBack ? "hidden md:inline-flex -ml-1" : "-ml-1"}
              />

              {/* Separator hanya tampil di md+ biar mobile ringkas */}
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4 hidden md:block"
              />

              {hdr.headerLeft ? (
                hdr.headerLeft
              ) : (
                <div className="min-w-0">
                  {/* ======= MOBILE TITLE (hanya bila bukan mode back) ======= */}
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

                  {/* ======= BREADCRUMB (md+) ======= */}
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
                                <BreadcrumbPage
                                  variant="chip"
                                  className="truncate"
                                >
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
              {/* Sembunyikan menu di mobile saat mode back (karena sudah di kiri),
                 tetap tampil di md+ */}
              {hdr.showUserMenu && (
                <div className={isBack ? "hidden md:block" : ""}>
                  <CMenuDropdown withBg />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div
          className={`flex-1 p-4 pt-0 flex flex-col gap-4 ${contentClassName}`}
        >
          {children ?? <Outlet />}
        </div>
      </SidebarInset>
    </HeaderContext.Provider>
  );
}
