// src/components/layout/dashboard/AppSidebar.tsx
import * as React from "react";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/layout/dashboard/nav-main";
import { NavProjects } from "@/components/layout/dashboard/nav-projects";
import { NavUser } from "@/components/layout/dashboard/nav-user";
import { TeamHeader } from "@/components/layout/dashboard/team-switcher";

import { NAVS, type NavDict } from "@/constants/navs";
import { Frame, PieChart, Map } from "lucide-react";

/* 🔐 Ambil context user + school dari JWT */
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
  const { setOpenMobile } = useSidebar();

  // 🔐 Ambil user + membership dari simple-context
  const { data: currentUser } = useCurrentUser();
  const membership =
    currentUser?.membership ?? currentUser?.memberships?.[0] ?? null;

  const schoolName = membership?.school_name ?? "Pendidikanku";
  const schoolIconUrl = membership?.school_icon_url;
  const userName = currentUser?.user_name ?? "User";
  const userEmail = currentUser?.email ?? "user@example.com";

  // Data untuk NavMain (pakai prop `items`)
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

  // 📌 Projects masih dummy (kalau mau nanti bisa dihubungkan juga)
  const projects = React.useMemo(
    () => [
      { name: "Website", url: "#", icon: Frame },
      { name: "Umroh & Badal", url: "#", icon: PieChart },
      { name: "Toko", url: "#", icon: Map },
    ],
    []
  );

  // 👤 Data user untuk NavUser — pakai icon sekolah sebagai avatar
  const sidebarUser = React.useMemo(
    () => ({
      name: userName,
      email: userEmail,
      avatar: schoolIconUrl || "/avatars/shadcn.jpg",
    }),
    [userName, userEmail, schoolIconUrl]
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamHeader name={schoolName} logoUrl={schoolIconUrl} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={items} onNavigate={() => setOpenMobile(false)} />
        <NavProjects projects={projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;