// src/components/layout/dashboard/nav-main.tsx
"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { NavLink, useLocation, matchPath } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type SubItem = {
  title: string;
  url: string;
  end?: boolean;
  locked?: boolean;
};

type Item = {
  title: string;
  url: string;
  icon?: LucideIcon;
  end?: boolean;
  isActive?: boolean;
  locked?: boolean;
  items?: SubItem[];
};

export function NavMain({
  items,
  onNavigate, // optional: dipanggil saat klik link untuk nutup sheet mobile
}: {
  items: Item[];
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();

  const isUrlActive = (url: string, end?: boolean) =>
    !!matchPath({ path: url, end: !!end }, pathname);

  const anyChildActiveRaw = (children?: SubItem[]) =>
    (children ?? []).some((c) => isUrlActive(c.url, c.end));

  // 🔥 aktif style: pill + ring + strip kiri — versi rounded lebih kecil
  const activeClasses =
    // radius utama ↓
    "rounded-lg " +
    // bg & text
    "data-[active=true]:bg-primary/15 data-[active=true]:text-primary " +
    // ring & subtle inner shadow
    "data-[active=true]:ring-1 data-[active=true]:ring-primary/50 data-[active=true]:shadow-sm " +
    // indikator strip kiri (radius lebih kecil) ↓
    "relative data-[active=true]:before:absolute data-[active=true]:before:left-0 " +
    "data-[active=true]:before:inset-y-1 data-[active=true]:before:w-1 " +
    "data-[active=true]:before:rounded-r data-[active=true]:before:bg-primary";

  const subActiveClasses =
    // radius sub ↓
    "rounded-md " +
    "data-[active=true]:bg-primary/12 data-[active=true]:text-primary " +
    "data-[active=true]:font-medium data-[active=true]:ring-1 data-[active=true]:ring-primary/30";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const isLocked = !!item.locked;

          const parentActiveRaw =
            typeof item.isActive === "boolean"
              ? item.isActive
              : isUrlActive(item.url, item.end);

          // ❗ item locked tidak pernah tampil sebagai "active" hijau
          const parentActive = parentActiveRaw && !isLocked;

          const hasChildren = !!(item.items && item.items.length);
          const open =
            hasChildren && (anyChildActiveRaw(item.items) || parentActiveRaw);

          if (hasChildren) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={open}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={parentActive}
                      className={[
                        activeClasses,
                        "px-3 py-2.5 gap-3",
                        isLocked
                          ? // gaya SILVER untuk item terkunci
                          "bg-muted/40 text-muted-foreground border border-muted/60 shadow-none cursor-pointer"
                          : "hover:bg-primary/5",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {item.icon && (
                        <item.icon
                          className={isLocked ? "opacity-70" : undefined}
                        />
                      )}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub className="mt-1">
                      {item.items!.map((sub) => {
                        const subLocked = sub.locked ?? isLocked;
                        const subActiveRaw = isUrlActive(sub.url, sub.end);
                        const subActive = subActiveRaw && !subLocked;

                        return (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={subActive}
                              onClick={onNavigate}
                              className={[
                                subActiveClasses,
                                "px-3 py-2",
                                subLocked
                                  ? "bg-muted/40 text-muted-foreground border border-muted/60 shadow-none cursor-pointer"
                                  : "hover:bg-primary/5",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              <NavLink to={sub.url} end={sub.end}>
                                <span>{sub.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          // Top-level tanpa submenu → link langsung
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={parentActive}
                onClick={onNavigate}
                className={[
                  activeClasses,
                  "px-3 py-2.5 gap-3",
                  isLocked
                    ? "bg-muted/40 text-muted-foreground border border-muted/60 shadow-none cursor-pointer"
                    : "hover:bg-primary/5",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <NavLink to={item.url} end={item.end}>
                  {item.icon && (
                    <item.icon
                      className={isLocked ? "opacity-70" : undefined}
                    />
                  )}
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}