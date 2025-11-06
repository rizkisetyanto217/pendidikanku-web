// src/routes/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAccessToken, restoreSession } from "@/lib/axios";

const PUBLIC_PREFIXES = ["/login", "/register", "/forgot-password"];

export default function ProtectedRoute() {
  const location = useLocation();
  const isPublic = PUBLIC_PREFIXES.some((p) => location.pathname.startsWith(p));
  if (isPublic) return <Outlet />;

  const [checking, setChecking] = useState(() => !getAccessToken());
  const [ok, setOk] = useState(() => Boolean(getAccessToken()));

  useEffect(() => {
    let cancelled = false;

    if (getAccessToken()) {
      setOk(true);
      setChecking(false);
      return;
    }

    (async () => {
      try {
        setChecking(true);
        const success = await restoreSession();
        if (cancelled) return;
        setOk(Boolean(success));
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    const onAuth = () => {
      if (!cancelled) {
        setOk(true);
        setChecking(false);
      }
    };
    window.addEventListener("auth:authorized", onAuth);

    return () => {
      cancelled = true;
      window.removeEventListener("auth:authorized", onAuth);
    };
  }, []);

  if (checking) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <div className="flex items-center gap-3 text-sm opacity-70">
          <span className="w-4 h-4 inline-block rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span>Menyambungkan sesi…</span>
        </div>
      </div>
    );
  }

  if (!ok) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
