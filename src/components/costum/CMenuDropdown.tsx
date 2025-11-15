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

/* ================= UI Scale (GLOBAL) ================= */
type UiScale = "normal" | "large" | "xl";
const UI_SCALE_KEY = "app-ui-scale";

const UI_TOKENS: Record<
  UiScale,
  {
    sidebarWidth: string;
    sidebarWidthMobile: string;
    sidebarWidthIcon: string;
    itemH: string;
    subItemH: string;
    icon: string;
    text: string;
    labelH: string;
  }
> = {
  normal: {
    sidebarWidth: "16rem",
    sidebarWidthMobile: "18rem",
    sidebarWidthIcon: "3.25rem",
    itemH: "2.5rem",
    subItemH: "2.125rem",
    icon: "1rem",
    text: "0.9rem",
    labelH: "2rem",
  },
  large: {
    sidebarWidth: "20rem",
    sidebarWidthMobile: "22rem",
    sidebarWidthIcon: "4rem",
    itemH: "3.25rem",
    subItemH: "2.375rem",
    icon: "1.25rem",
    text: "1rem",
    labelH: "2.5rem",
  },
  xl: {
    sidebarWidth: "22rem",
    sidebarWidthMobile: "24rem",
    sidebarWidthIcon: "4.5rem",
    itemH: "3.75rem",
    subItemH: "2.75rem",
    icon: "1.375rem",
    text: "1.06rem",
    labelH: "2.75rem",
  },
};

function readUiScale(): UiScale {
  const raw = (localStorage.getItem(UI_SCALE_KEY) as UiScale) || "normal";
  return raw === "large" || raw === "xl" ? raw : "normal";
}

function applyUiScale(scale: UiScale) {
  const t = UI_TOKENS[scale];
  const root = document.documentElement;
  root.style.setProperty("--sidebar-width", t.sidebarWidth);
  root.style.setProperty("--sidebar-width-mobile", t.sidebarWidthMobile);
  root.style.setProperty("--sidebar-width-icon", t.sidebarWidthIcon);
  root.style.setProperty("--sidebar-item-h", t.itemH);
  root.style.setProperty("--sidebar-subitem-h", t.subItemH);
  root.style.setProperty("--sidebar-icon", t.icon);
  root.style.setProperty("--sidebar-text", t.text);
  root.style.setProperty("--sidebar-label-h", t.labelH);
  localStorage.setItem(UI_SCALE_KEY, scale);
}

/* ================= Component ================= */
interface PublicUserDropdownProps {
  withBg?: boolean;
  variant?: "icon" | "button";
}


export default function CMenuDropdown({
  withBg = true,
}: PublicUserDropdownProps) {
  // seed dari storage
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem(MODE_KEY) as Mode) || "system"
  );
  const [themeName, setThemeName] = useState<ThemeName>(readThemeFromStorage);
  const [fontScale, ] = useState<number>(() => {
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

  // UI Scale (baru)
  const [uiScale, setUiScale] = useState<UiScale>(() => {
    try {
      return readUiScale();
    } catch {
      return "normal";
    }
  });

  const { data: user } = useCurrentUser();

  // apply sekali saat mount (seed)
  useEffect(() => {
    try {
      applyMode(mode);
      applyThemeName(themeName);
      applyFontScale(fontScale);
      applyFontFamily(fontId);
      applyUiScale(uiScale);
    } catch {
      // ignore
    }
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

  // URL tujuan halaman pengaturan & bantuan
  const settingsUrl = isMobile
    ? `pengaturan`
    : `pengaturan`;
  const helpUrl = base ? `bantuan` : "bantuan";

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

  /* ====== HANDLERS QUICK CONTROLS ====== */
  const handleQuickMode = (v: Mode) => {
    setMode(v);
    applyMode(v);
  };

  const handleQuickTheme = (v: ThemeName) => {
    setThemeName(v);
    applyThemeName(v);
  };

  const handleQuickFont = (v: FontId) => {
    setFontId(v);
    applyFontFamily(v);
  };

  const handleQuickUiScale = (v: UiScale) => {
    setUiScale(v);
    applyUiScale(v);
  };

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
              <DropdownMenuItem onClick={() => navigate(settingsUrl)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                navigate(helpUrl);
              }}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Bantuan</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Mode */}
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

          {/* Tema */}
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

          {/* Font */}
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

          {/* Ukuran UI */}
          <div className="px-2 pb-2">
            <p className="text-[11px] text-muted-foreground mb-2">Ukuran UI</p>
            <Select value={uiScale} onValueChange={handleQuickUiScale}>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Pilih ukuran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="large">Besar</SelectItem>
                <SelectItem value="xl">Sangat Besar</SelectItem>
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
