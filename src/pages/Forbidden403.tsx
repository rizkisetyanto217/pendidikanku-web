// src/pages/common/Forbidden403.tsx
import { Link, useParams } from "react-router-dom";
import { useThemeCtx } from "@/hooks/ThemeContext";

export default function Forbidden403() {
  const { schoolId } = useParams();
  const { theme, setTheme, isDark, toggleDark, availableThemes } =
    useThemeCtx();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
      {/* Theme switcher panel */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-card text-card-foreground border border-border rounded-lg shadow px-3 py-2">
        <label htmlFor="theme-select" className="text-sm opacity-80">
          Tema
        </label>
        <select
          id="theme-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value as any)}
          className="bg-background text-foreground border border-border rounded px-2 py-1"
        >
          {availableThemes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <button
          onClick={toggleDark}
          className="ml-2 bg-primary text-primary-foreground rounded px-3 py-1"
          aria-pressed={isDark}
          title="Toggle dark mode"
        >
          {isDark ? "Dark" : "Light"}
        </button>
      </div>

      {/* Page content */}
      <h1 className="text-3xl font-bold">403 — Akses Ditolak</h1>
      <p className="text-muted-foreground">
        Kamu tidak memiliki izin untuk membuka halaman ini.
      </p>

      <div className="flex gap-3">
        <Link
          className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-primary text-primary-foreground hover:opacity-95 transition"
          to={`/${schoolId ?? ""}/sekolah`}
        >
          Kembali ke Dashboard
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-md px-4 py-2 border border-border bg-background text-foreground hover:bg-muted transition"
          to="/login"
        >
          Ganti Akun
        </Link>
      </div>
    </div>
  );
}
