import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";

import { AppSidebar } from "@/components/layout/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { DashboardHeaderBar } from "./DashboardHeaderBar";

/* ================== Types ================== */
export type Crumb = { label: string; href?: string };

export type HeaderState = {
  title?: string; // judul utk mobile
  breadcrumbs?: Crumb[]; // breadcrumb utk md+
  headerLeft?: React.ReactNode; // slot kiri custom
  actions?: React.ReactNode; // slot kanan (aksi)
  showUserMenu?: boolean; // tampilkan menu user?

  /** Tampilkan tombol back default (ArrowLeft) di header */
  showBack?: boolean;
};

export type MobileHeaderMode = "menu" | "back";

type DashboardLayoutProps = HeaderState & {
  children?: React.ReactNode;
  contentClassName?: string;
  headerClassName?: string;

  /** ====== MOBILE OPTIONS ======
   * "menu":  [Hamburger]  Title  [UserMenu]
   * "back":  [Back] Title [UserMenu] [Hamburger]
   * default: "menu"
   *
   * Biasanya cukup pakai showBack dari route/page,
   * mobileMode bisa kamu biarin "menu".
   */
  mobileMode?: MobileHeaderMode;
  /** Callback tombol back (mobileMode="back" atau showBack=true). Default: navigate(-1) */
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
  showBack,

  children,
  contentClassName = "",
  headerClassName = "",

  // mobile options
  mobileMode = "menu",
  onMobileBack,
  mobileTitleMaxWords = 6,
}: DashboardLayoutProps) {
  const location = useLocation();

  /* ---- Baseline header (dipakai untuk reset saat ganti route) ---- */
  const baselineRef = React.useRef<Required<HeaderState>>({
    title: title ?? breadcrumbs[breadcrumbs.length - 1]?.label ?? "Dashboard",
    breadcrumbs,
    headerLeft: headerLeft ?? null,
    actions: actions ?? null,
    showUserMenu,
    showBack: showBack ?? false,
  });

  // Update baseline jika props layout berubah
  React.useEffect(() => {
    baselineRef.current = {
      title: title ?? breadcrumbs[breadcrumbs.length - 1]?.label ?? "Dashboard",
      breadcrumbs,
      headerLeft: headerLeft ?? null,
      actions: actions ?? null,
      showUserMenu,
      showBack: showBack ?? false,
    };
  }, [title, breadcrumbs, headerLeft, actions, showUserMenu, showBack]);

  // State header yang bisa dioverride anak
  const [hdr, setHdr] = React.useState<Required<HeaderState>>(
    baselineRef.current
  );

  // RESET header setiap ganti route → hilangkan “riwayat” breadcrumb lama
  React.useLayoutEffect(() => {
    setHdr(baselineRef.current);
  }, [location.pathname]);

  const setHeader = React.useCallback((next: Partial<HeaderState>) => {
    setHdr((s) => {
      const merged: Required<HeaderState> = {
        ...s,
        ...next,
        // Required<> but fields tetap aman
        title:
          next.title ??
          s.title ??
          (next.breadcrumbs ?? s.breadcrumbs)[
            (next.breadcrumbs ?? s.breadcrumbs).length - 1
          ]?.label ??
          "Dashboard",
        breadcrumbs: next.breadcrumbs ?? s.breadcrumbs,
        headerLeft: next.headerLeft ?? s.headerLeft,
        actions: next.actions ?? s.actions,
        showUserMenu: next.showUserMenu ?? s.showUserMenu,
        showBack: next.showBack ?? s.showBack,
      };
      return merged;
    });
  }, []);

  return (
    <HeaderContext.Provider value={{ header: hdr, setHeader }}>
      <AppSidebar />

      <SidebarInset>
        <DashboardHeaderBar
          hdr={hdr}
          mobileMode={mobileMode}
          onMobileBack={onMobileBack}
          mobileTitleMaxWords={mobileTitleMaxWords}
          headerClassName={headerClassName}
        />

        {/* Content */}
        <div
          className={`flex-1 lg:p-8 p-4 pt-0 flex flex-col gap-4 ${contentClassName}`}
        >
          {children ?? <Outlet />}
        </div>
      </SidebarInset>
    </HeaderContext.Provider>
  );
}
