import * as React from "react";
import { Outlet } from "react-router-dom"; // ⬅️ tambahkan ini
import { AppSidebar } from "@/components/layout/dashboard/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
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
  /** Konten utama halaman (opsional ketika dipakai sebagai Route layout) */
  children?: React.ReactNode; // ⬅️ ubah jadi opsional
  headerLeft?: React.ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  showUserMenu?: boolean;
};

export default function DashboardLayout({
  breadcrumbs = [{ label: "Dashboard" }],
  actions,
  children,
  headerLeft,
  contentClassName = "",
  headerClassName = "",
  showUserMenu = true,
}: DashboardLayoutProps) {
  const lastIndex = breadcrumbs.length - 1;

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header
          className={[
            "flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear",
            "group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
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
          {/* ⬅️ fallback ke Outlet saat dipakai di Route */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
