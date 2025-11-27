// src/pages/common/Forbidden403.tsx
import { Link, useLocation, useParams } from "react-router-dom";

type RouteParams = {
  school_slug?: string; // sesuaikan dengan yang di route
};

export default function Forbidden403() {
  const { school_slug } = useParams<RouteParams>();
  const location = useLocation();

  const state = location.state as { from?: string } | null;

  const lastDashboardPath =
    (state?.from && typeof state.from === "string" && state.from) ||
    window.localStorage.getItem("lastDashboardPath") ||
    `/${school_slug ?? ""}/sekolah`;

  const loginPath = school_slug ? `/${school_slug}/login` : "/login";

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-bold">403 — Akses Ditolak</h1>

      <p className="text-muted-foreground max-w-md">
        Kamu tidak memiliki izin untuk membuka halaman ini. Jika merasa ini
        sebuah kesalahan, silakan hubungi admin sekolah.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-primary text-primary-foreground hover:opacity-95 transition"
          to={lastDashboardPath}
        >
          Kembali ke Dashboard
        </Link>

        <Link
          className="inline-flex items-center justify-center rounded-md px-4 py-2 border border-border bg-background text-foreground hover:bg-muted transition"
          to={loginPath}
        >
          Ganti Akun
        </Link>
      </div>
    </div>
  );
}