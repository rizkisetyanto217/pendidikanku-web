// src/routes/RequireschoolRoles.tsx
import { type ReactElement } from "react";
import { Navigate, useLocation, useParams, Outlet } from "react-router-dom";
import {
  useschoolMembership,
  type schoolRole,
} from "@/hooks/useSchoolMembership";
import { getAccessToken, getActiveschoolId } from "@/lib/axios";

export default function RequireschoolRoles({
  allow,
}: {
  allow: schoolRole[];
}): ReactElement | null {
  // support kedua nama param biar konsisten dgn routes
  const { schoolId: p1, school_id: p2 } = useParams<{
    schoolId?: string;
    school_id?: string;
  }>();
  const sid = p1 || p2 || getActiveschoolId() || ""; // ← fallback ke cookie kalau ada
  const loc = useLocation();

  // belum login → ke /login
  if (!getAccessToken()) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  // load membership dg sid (boleh undefined untuk hook-mu)
  const { loading, roles } = useschoolMembership(sid || undefined);
  if (loading) return null;

  // BANGUN PATH FORBIDDEN YANG AMAN (tanpa "//")
  const forbiddenPath = sid ? `/${sid}/forbidden` : `/forbidden`;

  if (!roles.length)
    return <Navigate to={forbiddenPath} replace state={{ from: loc }} />;
  if (!roles.some((r) => allow.includes(r))) {
    return <Navigate to={forbiddenPath} replace state={{ from: loc }} />;
  }

  return <Outlet />;
}
