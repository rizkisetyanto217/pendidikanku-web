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

type Item = {
  title: string;
  url: string;
  icon?: LucideIcon;
  end?: boolean;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
    end?: boolean;
  }[];
};

export function NavMain({ items }: { items: Item[] }) {
  const location = useLocation();
  const pathname = location.pathname;

  const isUrlActive = (url: string, end?: boolean) =>
    !!matchPath({ path: url, end: !!end }, pathname);

  const anyChildActive = (children?: Item["items"]) =>
    (children ?? []).some((c) => isUrlActive(c.url, c.end));

  // utility kelas untuk state aktif: lebih mencolok
  const activeClasses =
    // bg & text
    "data-[active=true]:bg-primary/15 data-[active=true]:text-primary " +
    // ring & shadow
    "data-[active=true]:ring-1 data-[active=true]:ring-primary/50 data-[active=true]:shadow-sm " +
    // indikator strip kiri
    "relative data-[active=true]:before:absolute data-[active=true]:before:left-0 " +
    "data-[active=true]:before:inset-y-1 data-[active=true]:before:w-1 " +
    "data-[active=true]:before:rounded-r-md data-[active=true]:before:bg-primary";

  const subActiveClasses =
    "data-[active=true]:bg-primary/12 data-[active=true]:text-primary " +
    "data-[active=true]:font-medium data-[active=true]:ring-1 data-[active=true]:ring-primary/30";

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const parentActive =
            typeof item.isActive === "boolean"
              ? item.isActive
              : isUrlActive(item.url, item.end);

          const hasChildren = !!(item.items && item.items.length > 0);
          const open =
            hasChildren && (anyChildActive(item.items) || parentActive);

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
                      isActive={open}
                      className={activeClasses}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items!.map((sub) => (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={subActiveClasses}
                          >
                            <NavLink
                              to={sub.url}
                              end={sub.end}
                              className={({ isActive }) =>
                                isActive ? "data-[active=true]" : undefined
                              }
                            >
                              <span>{sub.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          // Tanpa anak → link biasa, tetap highlight kuat saat aktif
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={parentActive}
                className={activeClasses}
              >
                <NavLink to={item.url} end={item.end}>
                  {item.icon && <item.icon />}
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