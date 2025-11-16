// --- src/hooks/useActiveschoolInfo.tsx --- //
import { useEffect, useMemo, useState } from "react";
import { getActiveschoolId, getActiveschoolDisplay } from "@/lib/axios";

type ActiveschoolState = {
  id: string | null;
  name: string | null;
  icon: string | null;
};

export function useActiveschoolInfo() {
  const [state, setState] = useState<ActiveschoolState>(() => {
    const id = getActiveschoolId();
    const display = getActiveschoolDisplay();
    return {
      id,
      name: display.name,
      icon: display.icon,
    };
  });

  useEffect(() => {
    const refresh = () => {
      const id = getActiveschoolId();
      const display = getActiveschoolDisplay();
      setState({
        id,
        name: display.name,
        icon: display.icon,
      });
    };

    window.addEventListener("school:changed", refresh as any);
    window.addEventListener("auth:authorized", refresh as any);
    window.addEventListener("auth:logout", refresh as any);

    return () => {
      window.removeEventListener("school:changed", refresh as any);
      window.removeEventListener("auth:authorized", refresh as any);
      window.removeEventListener("auth:logout", refresh as any);
    };
  }, []);

  return useMemo(
    () => ({
      loading: false, // sudah tidak ada request ke server
      id: state.id,
      name: state.name,
      icon: state.icon,
      roles: [] as string[], // simple: tidak ambil roles lagi
    }),
    [state.id, state.name, state.icon]
  );
}