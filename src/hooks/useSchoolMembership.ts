// src/hooks/useschoolMembership.ts
import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/axios";

export type schoolRole = "dkm" | "admin" | "teacher" | "student" | "user";

type TokenSchoolRoleEntry = {
  school_id: string;
  roles?: string[];
  tenant_profile?: string;
};

type AccessPayload = {
  school_id?: string;
  school_roles?: TokenSchoolRoleEntry[];
  roles_global?: string[];
};

// Decode JWT (access token) → payload JSON
function decodeJwtPayload(token: string): AccessPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4); // pad jika perlu

    const jsonStr = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonStr) as AccessPayload;
  } catch {
    return null;
  }
}

/**
 * useschoolMembership
 * - Baca membership dari access token (JWT)
 * - Tidak ada lagi fetch /auth/me/simple-context
 */
export function useschoolMembership(schoolId?: string) {
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<TokenSchoolRoleEntry | null>(
    null
  );
  const [roles, setRoles] = useState<schoolRole[]>([]);

  useEffect(() => {
    setLoading(true);

    const token = getAccessToken();
    if (!token) {
      setMembership(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      setMembership(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    const all = payload.school_roles ?? [];
    const sid = schoolId ?? payload.school_id;

    if (!sid) {
      setMembership(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    const found = all.find((m) => m.school_id === sid) ?? null; // idealnya cuma satu, karena token sudah difilter per slug

    setMembership(found);

    const rawRoles = (found?.roles ?? []).map((r) =>
      String(r || "").toLowerCase()
    ) as schoolRole[];

    setRoles(rawRoles);
    setLoading(false);
  }, [schoolId]);

  return {
    loading,
    membership,
    roles,
  };
}