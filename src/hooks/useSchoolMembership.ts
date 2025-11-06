// src/hooks/useschoolMembership.ts
import { useQuery } from "@tanstack/react-query";
import { fetchSimpleContext } from "@/lib/axios";

export type schoolRole = "dkm" | "admin" | "teacher" | "student" | "user";

export function useschoolMembership(schoolId?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["me", "simple-context"], // ⬅️ SENGAJA: tidak tergantung activeId
    queryFn: () => fetchSimpleContext(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const memberships = data?.memberships ?? [];
  const membership = schoolId
    ? memberships.find((m: any) => m.school_id === schoolId)
    : undefined;

  return {
    loading: isLoading,
    membership,
    roles: (membership?.roles ?? []) as schoolRole[],
  };
}
