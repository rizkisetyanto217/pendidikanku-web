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
  CaseSensitive as AaIcon,
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

import UserSettingsModal, {
  type SettingsState,
} from "@/pages/dashboard/components/modal/SettingModal";
import UserHelpModal from "@/pages/dashboard/components/modal/helpModal";

/* ================= CSS-only Theming Helpers ================= */
type Mode = "light" | "dark" | "system";
type ThemeName = "default" | "green" | "yellow";

const THEME_KEY = "theme-name";
const MODE_KEY = "theme-mode";
const THEME_NAMES: ThemeName[] = ["default", "green", "yellow"];

function applyThemeName(name: ThemeName) {
  const el = document.documentElement;
  if (name === "default") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", name);
  localStorage.setItem(THEME_KEY, name);
}

function readThemeFromStorage(): ThemeName {
  const raw = (localStorage.getItem(THEME_KEY) || "default") as ThemeName;
  return THEME_NAMES.includes(raw) ? raw : "default";
}

function applyMode(mode: Mode) {
  const el = document.documentElement;
  const mm = window.matchMedia("(prefers-color-scheme: dark)");
  const setFromSystem = () =>
    mm.matches ? el.classList.add("dark") : el.classList.remove("dark");

  // cleanup listener lama
  // @ts-expect-error
  if (window.__theme_mm_listener__) {
    // @ts-expect-error
    mm.removeEventListener("change", window.__theme_mm_listener__);
    // @ts-expect-error
    window.__theme_mm_listener__ = undefined;
  }

  if (mode === "dark") el.classList.add("dark");
  else if (mode === "light") el.classList.remove("dark");
  else {
    setFromSystem();
    const listener = () => setFromSystem();
    mm.addEventListener("change", listener);
    // @ts-expect-error
    window.__theme_mm_listener__ = listener;
  }
  localStorage.setItem(MODE_KEY, mode);
}

/* ================= Font Scale (GLOBAL) ================= */
const FONT_SCALE_KEY = "app-font-scale";
function readFontScale(): number {
  const raw = localStorage.getItem(FONT_SCALE_KEY);
  const n = raw ? Number(raw) : 1;
  return Number.isFinite(n) && n > 0 ? n : 1;
}
function applyFontScale(scale: number) {
  document.documentElement.style.setProperty("--app-font-scale", String(scale));
  localStorage.setItem(FONT_SCALE_KEY, String(scale));
}

/* ================= Font Family (GLOBAL) ================= */
type FontId = "system" | "inter" | "poppins" | "nunito" | "jakarta";
const FONT_FAMILY_KEY = "app-font-family";
const FONT_LINK_ID = "app-font-link";
type FontOption = { id: FontId; label: string; stack: string; href?: string };
const FONT_OPTIONS: FontOption[] = [
  {
    id: "system",
    label: "System UI",
    stack:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
  },
  {
    id: "inter",
    label: "Inter",
    stack:
      "'Inter', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
  {
    id: "poppins",
    label: "Poppins",
    stack:
      "'Poppins', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
  },
  {
    id: "nunito",
    label: "Nunito",
    stack:
      "'Nunito', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    href: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap",
  },
  {
    id: "jakarta",
    label: "Plus Jakarta Sans",
    stack:
      "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap",
  },
];
function readFontId(): FontId {
  const raw = (localStorage.getItem(FONT_FAMILY_KEY) as FontId) || "system";
  return FONT_OPTIONS.some((f) => f.id === raw) ? raw : "system";
}
function ensureFontLink(href?: string) {
  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (!href) {
    if (link) link.remove();
    return;
  }
  if (!link) {
    link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}
function applyFontFamily(fontId: FontId) {
  const option = FONT_OPTIONS.find((f) => f.id === fontId)!;
  ensureFontLink(option.href);
  document.documentElement.style.fontFamily = option.stack;
  localStorage.setItem(FONT_FAMILY_KEY, fontId);
}

/* ================= Component ================= */
interface PublicUserDropdownProps {
  withBg?: boolean;
}
const getUserDisplayName = (
  user?: { user_name?: string; email?: string } | null
) =>
  (user?.user_name && user.user_name.trim()) ||
  (user?.email ? user.email.split("@")[0] : "");

export default function CMenuDropdown({
  withBg = true,
}: PublicUserDropdownProps) {
  // seed dari storage
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem(MODE_KEY) as Mode) || "system"
  );
  const [themeName, setThemeName] = useState<ThemeName>(readThemeFromStorage);
  const [fontScale, setFontScale] = useState<number>(() => {
    try {
      return readFontScale();
    } catch {
      return 1;
    }
  });
  const [fontId, setFontId] = useState<FontId>(() => {
    try {
      return readFontId();
    } catch {
      return "system";
    }
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false); // <-- baru
  const { data: user } = useCurrentUser();

  const [settingsValue, setSettingsValue] = useState<SettingsState>(() => ({
    mode: (mode as SettingsState["mode"]) || "system",
    theme: themeName,
    fontScalePct: Math.round(fontScale * 100),
    fontFamily: fontId,
    density: "normal",
    sidebarBehavior: "sticky",
    displayName: getUserDisplayName(user),
    email: user?.email || "",
    notifInApp: true,
    notifEmail: !!user?.email,
    notifPush: false,
    notifSound: true,
    notifVerbosity: "summary",
    locale: "id",
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    currency: "IDR",
    twoFA: false,
    activeSchoolName: undefined,
    activeRole: undefined,
    telemetry: true,
    appVersion: import.meta.env.VITE_APP_VERSION || "v0.0.0",
  }));

  // sinkron user → settings
  useEffect(() => {
    setSettingsValue((s) => ({
      ...s,
      displayName: getUserDisplayName(user),
      email: user?.email || "",
      notifEmail: !!user?.email,
    }));
  }, [user]);

  const patchSettings = (next: Partial<SettingsState>) =>
    setSettingsValue((s) => ({ ...s, ...next }));

  /* ===== INSTANT APPLY: setiap settingsValue berubah (dari modal) ===== */
  useEffect(() => {
    applyMode(settingsValue.mode);
    applyThemeName(settingsValue.theme);
    const scale = Math.max(
      0.75,
      Math.min(1.5, settingsValue.fontScalePct / 100)
    );
    applyFontScale(scale);
    applyFontFamily(settingsValue.fontFamily);

    // mirror ke quick controls
    setMode(settingsValue.mode);
    setThemeName(settingsValue.theme);
    setFontScale(scale);
    setFontId(settingsValue.fontFamily);
  }, [
    settingsValue.mode,
    settingsValue.theme,
    settingsValue.fontScalePct,
    settingsValue.fontFamily,
  ]);

  // apply sekali saat mount (seed)
  useEffect(() => {
    try {
      applyMode(mode);
      applyThemeName(themeName);
      applyFontScale(fontScale);
      applyFontFamily(fontId);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // router & logout
  const isLoggedIn = !!user;
  const navigate = useNavigate();
  const { slug } = useParams();
  const { isMobile } = useResponsive();
  const queryClient = useQueryClient();
  const base = slug ? `/school/${slug}` : "";

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

  type ModeOption = { value: Mode; label: string; icon: ReactNode };
  const modeOptions: ModeOption[] = [
    {
      value: "light",
      label: "Terang",
      icon: <Sun className="w-[1em] h-[1em]" />,
    },
    {
      value: "dark",
      label: "Gelap",
      icon: <Moon className="w-[1em] h-[1em]" />,
    },
    {
      value: "system",
      label: "Sistem",
      icon: <MonitorCog className="w-[1em] h-[1em]" />,
    },
  ];

  const themeLabel = (t: ThemeName) =>
    t === "default"
      ? "Default (Hijau+Kuning)"
      : t[0].toUpperCase() + t.slice(1);

  const handleApplySettings = () => {
    setSettingsOpen(false);
    // kalau mau persist ke server, kirim settingsValue di sini
  };

  /* ====== HANDLERS QUICK CONTROLS (langsung apply + sync ke settings) ====== */
  const handleQuickMode = (v: Mode) => {
    setMode(v);
    applyMode(v);
    setSettingsValue((s) => ({ ...s, mode: v }));
  };

  const handleQuickTheme = (v: ThemeName) => {
    setThemeName(v);
    applyThemeName(v);
    setSettingsValue((s) => ({ ...s, theme: v }));
  };

  const handleQuickFont = (v: FontId) => {
    setFontId(v);
    applyFontFamily(v);
    setSettingsValue((s) => ({ ...s, fontFamily: v }));
  };

  return (
    <div className="relative">
      {/* Modal Settings */}
      <UserSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        value={settingsValue}
        onChange={patchSettings}
        onApply={handleApplySettings}
        onReset={() =>
          setSettingsValue((s) => ({
            ...s,
            mode: "system",
            theme: "default",
            fontScalePct: 100,
            fontFamily: "system",
            density: "normal",
          }))
        }
        onLogout={handleLogout}
        onSwitchContext={() => {
          const url = isMobile
            ? `${base}/aktivitas/pengaturan/menu`
            : `${base}/aktivitas/pengaturan/profil-saya`;
          navigate(url);
        }}
      />

      {/* ⬇️ Modal Bantuan */}
      <UserHelpModal open={helpOpen} onOpenChange={setHelpOpen} />

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

        <DropdownMenuContent align="end" className="w-72 leading-[1.35]">
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
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setHelpOpen(true); // <-- buka modal
              }}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Bantuan</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Quick controls */}
          <div className="px-2 py-1.5">
            <p className="text-[11px] text-muted-foreground mb-2">
              Mode Tampilan
            </p>
            <RadioGroup
              value={mode}
              onValueChange={handleQuickMode}
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

          <div className="px-2 pb-2">
            <p className="text-[11px] text-muted-foreground mb-2">Pilih Tema</p>
            <div className="flex items-center gap-2">
              <Select value={themeName} onValueChange={handleQuickTheme}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Pilih tema" />
                </SelectTrigger>
                <SelectContent>
                  {THEME_NAMES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {themeLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span
                className="inline-block w-6 h-6 rounded-md border"
                style={{ background: "hsl(var(--primary))" }}
                title="Preview warna utama"
              />
            </div>
          </div>

          <div className="px-2 pb-2">
            <p className="text-[11px] text-muted-foreground mb-2">Pilih Font</p>
            <Select
              value={FONT_OPTIONS.find((f) => f.id === fontId)?.id ?? "system"}
              onValueChange={handleQuickFont}
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Pilih font" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    <span className="inline-flex items-center gap-2">
                      <AaIcon className="w-4 h-4 opacity-70" />
                      <span style={{ fontFamily: f.stack }}>{f.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DropdownMenuSeparator />

          {isLoggedIn && (
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
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
