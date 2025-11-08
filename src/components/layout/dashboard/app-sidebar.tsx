import * as React from "react";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar, // ⬅️ dipakai untuk menutup sheet di mobile saat klik menu
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

/** Normalisasi string segmen ke role NAVS */
const ROLE_ALIASES: Record<string, keyof NavDict> = {
  // sekolah/admin
  sekolah: "sekolah",
  school: "sekolah",
  admin: "sekolah",

  // murid/student
  murid: "murid",
  student: "murid",
  siswa: "murid",

  // guru/teacher
  guru: "guru",
  teacher: "guru",
  pengajar: "guru",
};

/** Cari role & base langsung dari path apapun bentuknya */
function useRoleAndBaseFromPath(): { role: keyof NavDict; base: string } {
  const location = useLocation();
  const segs = location.pathname.split("/").filter(Boolean);

  // cari segmen yang match alias role
  const roleIdx = segs.findIndex((s) => ROLE_ALIASES[s] !== undefined);
  if (roleIdx >= 0) {
    const role = ROLE_ALIASES[segs[roleIdx]];
    const base = "/" + segs.slice(0, roleIdx + 1).join("/");
    return { role, base };
  }

  // fallback lama: coba segs[1] atau segs[0]
  const candidate = (segs[1] ?? segs[0]) as keyof NavDict | undefined;
  if (
    candidate === "sekolah" ||
    candidate === "murid" ||
    candidate === "guru"
  ) {
    return {
      role: candidate,
      base: "/" + segs.slice(0, (segs[0] ? 1 : 0) + 1).join("/"),
    };
  }

  // fallback terakhir
  return { role: "sekolah", base: "/sekolah" };
}

export function AppSidebar(props: AppSidebarProps) {
  const { role, base } = useRoleAndBaseFromPath();
  const { setOpenMobile } = useSidebar(); // ⬅️ untuk nutup saat klik menu (mobile)

  // Bentuk data untuk NavMain (pakai prop `items`, bukan `children`)
  const items = NAVS[role].map((it) => {
    const parentUrl =
      it.path === "" || it.path === "." ? `${base}` : `${base}/${it.path}`;

    return {
      title: it.label,
      url: parentUrl,
      icon: it.icon,
      end: it.end ?? false,
      items: it.children?.map((c) => ({
        title: c.label,
        url: `${parentUrl}/${c.path.replace(/^\/+/, "")}`,
        end: c.end ?? false,
      })),
    };
  });

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
        {/* ⬅️ Tutup sheet mobile segera setelah user klik item */}
        <NavMain items={items} onNavigate={() => setOpenMobile(false)} />
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
