// src/hooks/useCurrentUser.ts
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import api, { getAccessToken } from "@/lib/axios";

/* ============================
   Raw types dari API backend
============================ */

type SimpleContextMembershipAPI = {
  school_id: string;
  school_name: string;
  school_slug: string;
  school_icon_url?: string;
  roles?: string[];
  school_teacher_id?: string;
  school_student_id?: string;
};

type SimpleContextDataAPI = {
  user_id: string;
  user_name?: string;
  user_email?: string;
  memberships?: SimpleContextMembershipAPI[];
};

/* ============================
   Tipe yang dipakai di FE
============================ */

export type CurrentUserMembership = {
  school_id: string;
  school_name: string;
  school_slug: string;
  school_icon_url?: string;
  roles: string[];
  school_teacher_id?: string;
  school_student_id?: string;
};

export type CurrentUser = {
  id: string;
  email?: string;
  user_name?: string;
  memberships: CurrentUserMembership[];
  membership: CurrentUserMembership | null;
};

export function useCurrentUser() {
  const qc = useQueryClient();
  const params = useParams<{ school_slug?: string }>();
  const location = useLocation();

  // ── Resolve school_slug ─────────────────────
  let schoolSlug: string | undefined = params.school_slug;

  // fallback kalau hook dipakai di child route yang nggak define param,
  // tapi URL-nya tetap diawali /diploma-ilmi/...
  if (!schoolSlug) {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      schoolSlug = segments[0]; // mis: "/diploma-ilmi/dashboard" -> "diploma-ilmi"
    }
  }

  // ⛔️ Jangan fetch sebelum ada access token / slug
  const enabled = !!getAccessToken() && !!schoolSlug;

  const q = useQuery<CurrentUser | null>({
    queryKey: ["currentUser", schoolSlug],
    enabled,
    queryFn: async () => {
      if (!schoolSlug) return null;

      // ⬅️ ini beda pentingnya: pakai /{school_slug}/auth/me/simple-context
      const res = await api.get(`/${schoolSlug}/auth/me/simple-context`);

      const raw = (res.data?.data ?? null) as SimpleContextDataAPI | null;
      if (!raw) return null;

      const memberships: CurrentUserMembership[] =
        raw.memberships?.map((m) => ({
          school_id: m.school_id,
          school_name: m.school_name,
          school_slug: m.school_slug,
          school_icon_url: m.school_icon_url,
          roles: m.roles ?? [],
          school_teacher_id: m.school_teacher_id,
          school_student_id: m.school_student_id,
        })) ?? [];

      const membership = memberships[0] ?? null;

      const mapped: CurrentUser = {
        id: raw.user_id,
        user_name: raw.user_name,
        email: raw.user_email,
        memberships,
        membership,
      };

      return mapped;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // 🔁 Sinkron dengan event auth dari axios
  useEffect(() => {
    const onAuthOk = () =>
      qc.invalidateQueries({ queryKey: ["currentUser", schoolSlug] });
    const onLogout = () => qc.setQueryData(["currentUser", schoolSlug], null);

    window.addEventListener("auth:authorized", onAuthOk);
    window.addEventListener("auth:logout", onLogout);
    return () => {
      window.removeEventListener("auth:authorized", onAuthOk);
      window.removeEventListener("auth:logout", onLogout);
    };
  }, [qc, schoolSlug]);

  return q;
}

/* (opsional) helper role */
export function hasRole(
  m: CurrentUserMembership | null | undefined,
  role: string
) {
  if (!m) return false;
  return m.roles.includes(role);
}