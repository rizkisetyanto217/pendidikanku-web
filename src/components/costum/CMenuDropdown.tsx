// src/components/common/PublicUserDropdown.tsx
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  LogOut,
  Settings,
  HelpCircle,
  MoreVertical,
  Moon,
  Sun,
  MonitorCog,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import { useResponsive } from "@/hooks/isResponsive";
import { apiLogout } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

/* ================= CSS-only Theming Helpers ================= */
type Mode = "light" | "dark" | "system";
type ThemeName = "default" | "sunrise" | "midnight";

const THEME_KEY = "theme-name";
const MODE_KEY = "theme-mode";
const THEME_NAMES: ThemeName[] = ["default", "sunrise", "midnight"];

function applyThemeName(name: ThemeName) {
  const el = document.documentElement;
  if (name === "default") {
    el.removeAttribute("data-theme");
  } else {
    el.setAttribute("data-theme", name);
  }
  localStorage.setItem(THEME_KEY, name);
}

function applyMode(mode: Mode) {
  const el = document.documentElement;
  const mm = window.matchMedia("(prefers-color-scheme: dark)");

  const setFromSystem = () => {
    if (mm.matches) el.classList.add("dark");
    else el.classList.remove("dark");
  };

  // bersihkan listener lama (opsional bisa disimpan di window)
  // @ts-expect-error - attach once per call
  if (window.__theme_mm_listener__) {
    // @ts-expect-error
    mm.removeEventListener("change", window.__theme_mm_listener__);
    // @ts-expect-error
    window.__theme_mm_listener__ = undefined;
  }

  if (mode === "dark") {
    el.classList.add("dark");
  } else if (mode === "light") {
    el.classList.remove("dark");
  } else {
    setFromSystem();
    const listener = () => setFromSystem();
    mm.addEventListener("change", listener);
    // @ts-expect-error
    window.__theme_mm_listener__ = listener;
  }

  localStorage.setItem(MODE_KEY, mode);
}

/* ================= Helpers existing ================= */

type ModeOption = {
  value: Mode;
  label: string;
  icon: ReactNode;
};
/* ================= Component ================= */
interface PublicUserDropdownProps {
  variant?: "default" | "icon";
  withBg?: boolean;
}

export default function CMenuDropdown({
//   variant = "default",
  withBg = true,
}: PublicUserDropdownProps) {
  // CSS-only mode & themeName (persist via localStorage)
  const [mode, setMode] = useState<Mode>(() => {
    const saved = (localStorage.getItem(MODE_KEY) as Mode) || "system";
    return saved;
  });
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = (localStorage.getItem(THEME_KEY) as ThemeName) || "default";
    return saved;
  });

  useEffect(() => {
    // apply on mount (initial)
    try {
      applyMode(mode);
      applyThemeName(themeName);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-apply when changed
  useEffect(() => {
    try {
      applyMode(mode);
    } catch {}
  }, [mode]);
  useEffect(() => {
    try {
      applyThemeName(themeName);
    } catch {}
  }, [themeName]);

  // USER / ROUTER
  const { data: user } = useCurrentUser();
  const isLoggedIn = !!user;

  const navigate = useNavigate();
  const { slug } = useParams();
  const { isMobile } = useResponsive();
  const queryClient = useQueryClient();

  const base = slug ? `/school/${slug}` : "";

  // UI state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiLogout();
      queryClient.removeQueries({ queryKey: ["currentUser"], exact: true });
      navigate(slug ? `${base}/login` : "/login", { replace: true });
    } catch {
      navigate(slug ? `${base}/login` : "/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const modeOptions: ModeOption[] = [
    { value: "light", label: "Terang", icon: <Sun className="w-4 h-4" /> },
    { value: "dark", label: "Gelap", icon: <Moon className="w-4 h-4" /> },
    {
      value: "system",
      label: "Sistem",
      icon: <MonitorCog className="w-4 h-4" />,
    },
  ];

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={withBg ? "ghost" : "ghost"}
            size="icon"
            className="h-9 w-9 rounded-xl"
            aria-label="Buka menu pengguna"
            title="Menu"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Menu Pengguna
          </DropdownMenuLabel>

          <DropdownMenuGroup>
            {!isLoggedIn ? (
              <DropdownMenuItem onClick={() => navigate("/login")}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Login</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  const url = isMobile
                    ? `${base}/aktivitas/pengaturan/menu`
                    : `${base}/aktivitas/pengaturan/profil-saya`;
                  navigate(url);
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => navigate(`${base || ""}/bantuan`)}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Bantuan</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* === Tampilan (Mode) === */}
          <div className="px-2 py-1.5">
            <p className="text-[11px] text-muted-foreground mb-2">
              Mode Tampilan
            </p>
            <RadioGroup
              value={mode}
              onValueChange={(v: Mode) => setMode(v)}
              className="grid grid-cols-3 gap-1"
            >
              {modeOptions.map((m) => (
                <Label
                  key={m.value}
                  htmlFor={`mode-${m.value}`}
                  className={`flex items-center justify-center gap-1 rounded-md border px-2 py-1 text-xs cursor-pointer ${
                    mode === m.value ? "bg-primary/10 border-primary" : ""
                  }`}
                >
                  <RadioGroupItem
                    id={`mode-${m.value}`}
                    value={m.value}
                    className="sr-only"
                  />
                  {m.icon}
                  {m.label}
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* === Pilih Tema (Select) === */}
          <div className="px-2 pb-2">
            <p className="text-[11px] text-muted-foreground mb-2">Pilih Tema</p>
            <div className="flex items-center gap-2">
              <Select
                value={themeName}
                onValueChange={(v: ThemeName) => setThemeName(v)}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Pilih tema" />
                </SelectTrigger>
                <SelectContent>
                  {THEME_NAMES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === "default"
                        ? "Default"
                        : t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* preview warna primary dari theme aktif */}
              <span
                className="inline-block w-6 h-6 rounded-md border"
                style={{ background: "hsl(var(--primary))" }}
                title="Preview warna utama"
              />
            </div>
          </div>

          <DropdownMenuSeparator />

          {isLoggedIn && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <span className="mr-2 inline-flex h-4 w-4 rounded-full border-2 border-destructive/40 border-t-destructive animate-spin" />
                    Keluar...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </>
                )}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}