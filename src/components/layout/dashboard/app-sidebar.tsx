// src/components/layout/dashboard/app-sidebar.tsx
import * as React from "react";
import { useParams } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/layout/dashboard/nav-main";
import { NavProjects } from "@/components/layout/dashboard/nav-projects";
import { NavUser } from "@/components/layout/dashboard/nav-user";
import { TeamSwitcher } from "@/components/layout/dashboard/team-switcher";

import { NAVS, type NavDict } from "@/constants/navs";
import {
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  Frame,
  PieChart,
  Map,
} from "lucide-react";

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

// ⬇️ TODO: ganti ke sumber role yang sesungguhnya (context/store)
function useActiveRole(): keyof NavDict {
  return "sekolah"; // "murid" | "guru"
}

export function AppSidebar(props: AppSidebarProps) {
  const { schoolId } = useParams();
  const role = useActiveRole();

  // base path sesuai namespace (contoh: /:schoolId/sekolah)
  const base = schoolId ? `/${schoolId}/${role}` : `/${role}`;

  // Map NAVS → NavMain items
  const navMain = NAVS[role].map((it) => ({
    title: it.label,
    url: it.path === "" || it.path === "." ? `${base}` : `${base}/${it.path}`,
    icon: it.icon,
    // optional: isActive ditentukan oleh NavMain sendiri via NavLink
  }));

  // Data dummy (Team/User/Projects) — bebas kamu ganti/disable
  const data = {
    user: {
      name: "User",
      email: "user@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      { name: "Sekolahku", logo: GalleryVerticalEnd, plan: "Pro" },
      { name: "Demo", logo: AudioWaveform, plan: "Free" },
      { name: "Lainnya", logo: Command, plan: "Free" },
    ],
    projects: [
      { name: "Design Engineering", url: "#", icon: Frame },
      { name: "Sales & Marketing", url: "#", icon: PieChart },
      { name: "Travel", url: "#", icon: Map },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        {/* opsional: bagian projects kalau mau dipakai */}
        <NavProjects projects={data.projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
