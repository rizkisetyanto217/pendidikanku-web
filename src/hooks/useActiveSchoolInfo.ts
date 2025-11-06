// --- di src/hooks/useActiveschoolInfo.tsx --- //
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getActiveschoolId,
  getActiveschoolDisplay,
  fetchSimpleContext,
} from "@/lib/axios";

export function useActiveschoolInfo() {
  const activeId = getActiveschoolId();
  const display = getActiveschoolDisplay(); // fallback instan {name, icon}

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["me", "simple-context", activeId], // ikat ke id
    queryFn: () => fetchSimpleContext(), // ⬅️ pakai cache 5 menit
    enabled: Boolean(activeId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const onschoolChanged = () => refetch();
    const onAuth = () => refetch();
    const onLogout = () => refetch();

    window.addEventListener("school:changed", onschoolChanged as any);
    window.addEventListener("auth:authorized", onAuth as any);
    window.addEventListener("auth:logout", onLogout as any);

    return () => {
      window.removeEventListener("school:changed", onschoolChanged as any);
      window.removeEventListener("auth:authorized", onAuth as any);
      window.removeEventListener("auth:logout", onLogout as any);
    };
  }, [refetch]);

  const memberships = data?.memberships ?? [];
  const active = memberships.find((m) => m.school_id === activeId);

  const name = active?.school_name ?? display.name ?? null;
  const icon = active?.school_icon_url ?? display.icon ?? null;

  return useMemo(
    () => ({
      loading: isLoading,
      id: activeId || null,
      name,
      icon,
      roles: active?.roles ?? [],
    }),
    [isLoading, activeId, name, icon, active?.roles]
  );
}
