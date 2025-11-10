// src/components/layout/dashboard/DashboardLayout.tsx
import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
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

export type Crumb = {
  label: string;
  href?: string;
};

type DashboardLayoutProps = {
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
  headerLeft?: React.ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  showUserMenu?: boolean;
};

export default function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardShell {...props} />
    </SidebarProvider>
  );
}

function DashboardShell({
  breadcrumbs = [{ label: "Dashboard" }],
  actions,
  children,
  headerLeft,
  contentClassName = "",
  headerClassName = "",
  showUserMenu = true,
}: DashboardLayoutProps) {
  const lastIndex = breadcrumbs.length - 1;

  // Auto-close sheet sidebar saat route berubah (UX mobile)
  const location = useLocation();
  const { setOpenMobile } = useSidebar();
  React.useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  /* ========= Auto-hide header on scroll ========= */
  const [hidden, setHidden] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const lastYRef = React.useRef<number>(0);
  const tickingRef = React.useRef(false);

  React.useEffect(() => {
    // initial
    lastYRef.current = window.scrollY || 0;

    const onScroll = () => {
      const y = Math.max(0, window.scrollY || 0);
      if (!tickingRef.current) {
        window.requestAnimationFrame(() => {
          const last = lastYRef.current;
          const delta = y - last;

          // status "sudah menggulir?" untuk shadow/blur
          setScrolled(y > 8);

          // ambang biar gak terlalu sensitif
          const THRESH = 6;

          if (Math.abs(delta) > THRESH) {
            if (delta > 0 && y > 56) {
              // scroll turun -> sembunyikan
              setHidden(true);
            } else {
              // scroll naik / mendekati top -> tampilkan
              setHidden(false);
            }
            lastYRef.current = y;
          } else {
            // Update posisi tanpa toggle ketika delta kecil
            lastYRef.current = y;
          }

          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const baseHeaderCls =
    "sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 transition-[transform,width,height,background] ease-linear";
  const compactCls = "group-has-data-[collapsible=icon]/sidebar-wrapper:h-12";
  const bgBlurShadowCls = scrolled
    ? "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
    : "bg-background";
  const hideTransformCls = hidden ? "-translate-y-full" : "translate-y-0";

  return (
    <>
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
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              {headerLeft ? (
                headerLeft
              ) : (
                <Breadcrumb className="min-w-0">
                  <BreadcrumbList className="flex-nowrap overflow-hidden">
                    {breadcrumbs.map((c, i) => {
                      const isLast = i === lastIndex;
                      return (
                        <React.Fragment key={`${c.label}-${i}`}>
                          <BreadcrumbItem
                            className={i === 0 ? "hidden md:block" : ""}
                          >
                            {isLast || !c.href ? (
                              <BreadcrumbPage className="truncate">
                                {c.label}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink
                                href={c.href}
                                className="truncate"
                              >
                                {c.label}
                              </BreadcrumbLink>
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
              )}
            </div>

            <div className="ml-auto flex items-center gap-2">
              {actions ?? null}
              {showUserMenu && <CMenuDropdown withBg />}
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
    </>
  );
}
