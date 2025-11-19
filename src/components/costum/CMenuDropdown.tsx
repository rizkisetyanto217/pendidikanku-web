// src/components/.../CMenuDropdown.tsx
import { useState, type ReactNode } from "react";
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

import {
  type Mode,
  type ThemeName,
  type FontId,
  type UiScale,
  THEME_NAMES,
  readMode,
  readThemeFromStorage,
  readFontId,
  readUiScale,
  applyMode,
  applyThemeName,
  applyFontFamily,
  applyUiScale,
} from "@/lib/theme-prefs";

interface PublicUserDropdownProps {
  withBg?: boolean;
  variant?: "icon" | "button";
}

export default function CMenuDropdown({
  withBg = true,
}: PublicUserDropdownProps) {
  // seed dari storage
  const [mode, setMode] = useState<Mode>(() => readMode());
  const [themeName, setThemeName] = useState<ThemeName>(() =>
    readThemeFromStorage()
  );
  const [fontId, setFontId] = useState<FontId>(() => readFontId());
  const [uiScale, setUiScale] = useState<UiScale>(() => readUiScale());

  const { data: user } = useCurrentUser();

  // router & logout
  const isLoggedIn = !!user;
  const navigate = useNavigate();
  const { school_slug } = useParams();
  const queryClient = useQueryClient();
  const base = school_slug ? `/${school_slug}` : "";

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiLogout();
      queryClient.removeQueries({ queryKey: ["currentUser"], exact: true });
      navigate(base ? `${base}/login` : "/login", { replace: true });
    } catch {
      navigate(base ? `${base}/login` : "/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const settingsUrl = "pengaturan";
  const helpUrl = base ? `${base}/bantuan` : "/bantuan";

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
              <DropdownMenuItem onClick={() => navigate(base || "/login")}>
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
            <Select value={fontId} onValueChange={handleQuickFont}>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Pilih font" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { id: "system", label: "System UI" },
                  { id: "inter", label: "Inter" },
                  { id: "poppins", label: "Poppins" },
                  { id: "nunito", label: "Nunito" },
                  { id: "jakarta", label: "Plus Jakarta Sans" },
                ].map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    <span className="inline-flex items-center gap-2">
                      <AaIcon className="w-4 h-4 opacity-70" />
                      <span>{f.label}</span>
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
