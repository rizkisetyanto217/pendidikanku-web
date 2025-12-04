// src/components/layout/dashboard/app-sidebar.tsx

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

import {
  NAVS,
  type NavDict,
  type NavItem,
  NAVS_UNNASIGNED_STUDENT,
  NAVS_UNNASIGNED_TEACHER,
} from "@/constants/navs";
import { Frame, PieChart, Map } from "lucide-react";

/* 🔐 Ambil context user + school dari JWT */
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { CurrentUserMembership } from "@/hooks/useCurrentUser";

/* cek status profile-completion (dipakai cuma buat hide dashboard sekolah) */
import { useQuery } from "@tanstack/react-query";
import api, { getActiveSchoolContext } from "@/lib/axios";

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

type ProfileCompletionStatus = {
  has_profile: boolean;
  is_profile_completed: boolean;
  has_teacher: boolean;
  is_teacher_completed: boolean;
  is_fully_completed: boolean;
};

/** Normalisasi string segmen ke role NAVS (berbasis path) */
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
function useRoleAndBaseFromPath(): {
  role: keyof NavDict;
  base: string;
  roleSegment: string;
} {
  const location = useLocation();
  const segs = location.pathname.split("/").filter(Boolean);

  const slug = segs[0] ?? "sekolah";
  const roleSegment = segs[1] ?? "sekolah";

  const base = "/" + [slug, roleSegment].filter(Boolean).join("/");

  const mappedRole = ROLE_ALIASES[roleSegment] ?? "sekolah";

  return { role: mappedRole, base, roleSegment };
}

/** Resolve nav key berdasarkan membership (role di JWT) */
function resolveNavKey(
  membership: CurrentUserMembership | null,
  pathRole: keyof NavDict
): keyof NavDict {
  // Kalau di URL sudah jelas area guru/murid → pakai saja
  if (pathRole === "guru" || pathRole === "murid") {
    return pathRole;
  }

  // Tidak ada membership → default sekolah
  if (!membership) {
    return "sekolah";
  }

  const roles = membership.roles ?? [];

  // Admin/dkm/staff → sekolah
  if (
    roles.includes("admin") ||
    roles.includes("dkm") ||
    roles.includes("staff")
  ) {
    return "sekolah";
  }

  if (roles.includes("teacher")) return "guru";
  if (roles.includes("student")) return "murid";

  return "sekolah";
}

export function AppSidebar(props: AppSidebarProps) {
  const { role: pathRole, base, roleSegment } = useRoleAndBaseFromPath();
  const { setOpenMobile } = useSidebar();

  const isUserStudentArea = roleSegment === "user-murid";
  const isUserTeacherArea = roleSegment === "user-guru";

  // 🔐 Ambil user + membership dari simple-context
  const { data: currentUser } = useCurrentUser();
  const membership =
    currentUser?.membership ?? currentUser?.memberships?.[0] ?? null;

  // 🎯 Ambil slug dari base → "/{slug}/{role}"
  const baseSlug = React.useMemo(() => {
    const parts = base.split("/").filter(Boolean);
    return parts[0] ?? "";
  }, [base]);

  // 🔍 Query status profile-completion (hanya untuk hide dashboard SEKOLAH)
  const { data: completion } = useQuery<ProfileCompletionStatus | null>({
    queryKey: ["profile-completion", baseSlug],
    enabled: !!baseSlug,
    queryFn: async () => {
      const res = await api.get<{
        success: boolean;
        message: string;
        data: ProfileCompletionStatus;
      }>(`/${baseSlug}/auth/me/profile-completion`);
      return res.data?.data ?? null;
    },
    staleTime: 60_000,
  });

  // ✅ aturan dasar: kalau belum punya / belum lengkap profile → bisa hide dashboard
  const hideDashboardBase =
    !!completion &&
    (!completion.has_profile || !completion.is_profile_completed);

  // 🔑 Tentukan navKey dulu (buat tau ini nav sekolah / murid / guru)
  const navKey: keyof NavDict = resolveNavKey(membership, pathRole);

  // Hanya hide dashboard untuk:
  // - nav sekolah
  // - BUKAN area user-murid / user-guru (pmb/unnasigned)
  const applyHideDashboard =
    hideDashboardBase &&
    navKey === "sekolah" &&
    !isUserStudentArea &&
    !isUserTeacherArea;

  // 🔑 Tentukan sumber nav items
  let rawNavItems: NavItem[];

  if (isUserStudentArea) {
    rawNavItems = NAVS_UNNASIGNED_STUDENT;
  } else if (isUserTeacherArea) {
    rawNavItems = NAVS_UNNASIGNED_TEACHER;
  } else {
    rawNavItems = NAVS[navKey];
  }

  // Data untuk NavMain
  const schoolName = membership?.school_name ?? "Pendidikanku";
  const schoolIconUrl = membership?.school_icon_url;
  const userName = currentUser?.user_name ?? "User";

  // 🎭 Role aktif untuk ditampilkan di NavUser
  const sidebarRole = React.useMemo(() => {
    const ctx = getActiveSchoolContext();
    const activeRole = ctx.role;
    const roles = membership?.roles ?? [];

    const raw =
      activeRole && roles.includes(activeRole) ? activeRole : roles[0] ?? "";

    if (!raw) return "Role: -";

    const MAP: Record<string, string> = {
      admin: "Admin",
      dkm: "DKM",
      staff: "Staf",
      teacher: "Guru",
      student: "Murid",
    };

    return MAP[raw] ?? raw;
  }, [membership]);

  const items = rawNavItems
    .filter((it) => {
      if (!applyHideDashboard) return true;

      const path = (it.path ?? "").toLowerCase();

      // ❌ Jangan buang "dashboard" lagi
      // ✅ Cuma sembunyiin item yang path-nya kosong (root)
      return !(path === "" || path === ".");
    })
    .map((it) => {
      const targetParentUrl =
        it.path === "" || it.path === "." ? `${base}` : `${base}/${it.path}`;

      return {
        title: it.label,
        url: targetParentUrl,
        icon: it.icon,
        end: it.end ?? false,
        items: it.children?.map((c) => {
          const targetChildUrl = c.to
            ? `${base}/${c.to.replace(/^\/+/, "")}`
            : `${targetParentUrl}/${c.path.replace(/^\/+/, "")}`;

          return {
            title: c.label,
            url: targetChildUrl,
            end: c.end ?? false,
          };
        }),
      };
    });

  // 📌 Projects masih dummy
  const projects = React.useMemo(
    () => [
      { name: "Website", url: "#", icon: Frame },
      { name: "Umroh & Badal", url: "#", icon: PieChart },
      { name: "Toko", url: "#", icon: Map },
    ],
    []
  );

  // 👤 Data user untuk NavUser — pakai icon sekolah sebagai avatar, + role
  const sidebarUser = React.useMemo(
    () => ({
      name: userName,
      role: sidebarRole,
      avatar: schoolIconUrl || "/avatars/shadcn.jpg",
    }),
    [userName, sidebarRole, schoolIconUrl]
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