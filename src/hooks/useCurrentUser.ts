// src/hooks/useCurrentUser.ts
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api, { getAccessToken } from "@/lib/axios";

export type CurrentUser = {
  id: string;
  email?: string;
  user_name?: string;
  memberships?: Array<{ school_id: string; role: string }>;
};

export function useCurrentUser() {
  const qc = useQueryClient();

  // ⛔️ Jangan fetch sebelum ada access token (hindari auto-refresh di halaman login)
  const enabled = !!getAccessToken();

  const q = useQuery<CurrentUser | null>({
    queryKey: ["currentUser"],
    enabled, // <- kunci perbaikan
    queryFn: async () => {
      const res = await api.get("/auth/me/simple-context");
      return (res.data?.data as CurrentUser) ?? null;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // 🔁 Sinkron dengan event auth dari axios:
  // - "auth:authorized" dipublish saat login/refresh sukses
  // - "auth:logout" dipublish saat logout
  useEffect(() => {
    const onAuthOk = () => qc.invalidateQueries({ queryKey: ["currentUser"] });
    const onLogout = () => qc.setQueryData(["currentUser"], null);

    window.addEventListener("auth:authorized", onAuthOk);
    window.addEventListener("auth:logout", onLogout);
    return () => {
      window.removeEventListener("auth:authorized", onAuthOk);
      window.removeEventListener("auth:logout", onLogout);
    };
  }, [qc]);

  return q;
}
