// src/routes/RequireschoolRoles.tsx
import { type ReactElement } from "react";
import { Navigate, useLocation, useParams, Outlet } from "react-router-dom";
import {
  useschoolMembership,
  type schoolRole,
} from "@/hooks/useSchoolMembership";
import { getAccessToken, getActiveschoolId } from "@/lib/axios";

type RouteParams = {
  school_slug?: string;
  schoolId?: string;
  school_id?: string;
};

export default function RequireschoolRoles({
  allow,
}: {
  allow: schoolRole[];
}): ReactElement | null {
  const { school_slug, schoolId: p1, school_id: p2 } = useParams<RouteParams>();
  const loc = useLocation();

  // ID untuk cek membership (UUID) – tetap gunakan yang lama
  const sid = p1 || p2 || getActiveschoolId() || "";

  // Prefix URL untuk sekolah (pakai slug, bukan ID)
  const slugPrefix = school_slug ? `/${school_slug}` : "";

  // ==== 1. Belum login → redirect ke login tenant ====
  if (!getAccessToken()) {
    const loginPath = slugPrefix ? `${slugPrefix}/login` : "/login";

    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: loc.pathname }} // kirim string, bukan object
      />
    );
  }

  // ==== 2. Cek membership ====
  const { loading, roles } = useschoolMembership(sid || undefined);
  if (loading) return null;

  const forbiddenPath = slugPrefix ? `${slugPrefix}/forbidden` : "/forbidden";

  // Tidak punya membership sama sekali
  if (!roles.length) {
    return (
      <Navigate to={forbiddenPath} replace state={{ from: loc.pathname }} />
    );
  }

  // Punya membership tapi rolenya tidak diizinkan
  if (!roles.some((r) => allow.includes(r))) {
    return (
      <Navigate to={forbiddenPath} replace state={{ from: loc.pathname }} />
    );
  }

  return <Outlet />;
}