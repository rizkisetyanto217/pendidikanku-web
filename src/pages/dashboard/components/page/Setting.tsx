// src/pages/dashboard/components/page/Setting.tsx
import { useState } from "react";
import { MonitorCog, Sun, Moon, Info, Smartphone, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

/* shadcn/ui */
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ThemeMode = "light" | "dark" | "system";
type UiDensity = "comfortable" | "normal" | "compact";
type ThemeName = "default" | "green" | "yellow";
type FontId = "system" | "inter" | "poppins" | "nunito" | "jakarta";

export type SettingsState = {
  // Tampilan
  mode: ThemeMode;
  theme: ThemeName; // ⬅️ sesuai index.css
  fontScalePct: number; // 85..130
  fontFamily: FontId; // id font
  density: UiDensity;
  sidebarBehavior: "sticky" | "auto";

  // Akun
  displayName: string;
  email: string;

  // Notifikasi
  notifInApp: boolean;
  notifEmail: boolean;
  notifPush: boolean;
  notifSound: boolean;
  notifVerbosity: "summary" | "detailed";

  // Bahasa & Format
  locale: "id" | "en";
  timezone: string;
  dateFormat: "DD/MM/YYYY" | "YYYY-MM-DD";
  timeFormat: "24h" | "12h";
  currency: "IDR" | "USD";

  // Keamanan
  twoFA: boolean;

  // Konteks
  activeSchoolName?: string;
  activeRole?: string;

  // Lainnya
  telemetry: boolean;
  appVersion: string;
};

const defaultSettings: SettingsState = {
  // Tampilan
  mode: "system",
  theme: "default",
  fontScalePct: 100,
  fontFamily: "system",
  density: "normal",
  sidebarBehavior: "sticky",

  // Akun
  displayName: "Nama Pengguna",
  email: "user@example.com",

  // Notifikasi
  notifInApp: true,
  notifEmail: true,
  notifPush: false,
  notifSound: false,
  notifVerbosity: "summary",

  // Bahasa & Format
  locale: "id",
  timezone: "Asia/Jakarta",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  currency: "IDR",

  // Keamanan
  twoFA: false,

  // Konteks
  activeSchoolName: "Sekolah Islamku",
  activeRole: "Admin",

  // Lainnya
  telemetry: true,
  appVersion: "v0.1.0",
};

export default function Setting() {
  const [value, setValue] = useState<SettingsState>(defaultSettings);

  const set = (patch: Partial<SettingsState>) => {
    setValue((prev) => ({ ...prev, ...patch }));
  };

  const bumpFont = (delta: number) => {
    const next = Math.max(
      85,
      Math.min(130, Math.round(value.fontScalePct + delta))
    );
    set({ fontScalePct: next });
  };

  const resetFont = () => set({ fontScalePct: 100 });

  const handleApply = () => {
    // TODO: simpan ke backend / localStorage
    // console.log("Apply settings:", value);
  };

  const handleReset = () => {
    // TODO: kalau mau reset ke nilai dari server, panggil API dulu
    setValue(defaultSettings);
  };

  const handleLogout = () => {
    // TODO: trigger logout (clear token, redirect, dsb)
  };

  const handleSwitchContext = () => {
    // TODO: buka modal pilih sekolah/peran atau navigate ke halaman lain
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <MonitorCog className="h-5 w-5" />
          Pengaturan
        </h1>
        <p className="text-sm text-muted-foreground">
          Sesuaikan tampilan, akun, dan preferensi lainnya untuk pengalaman yang
          lebih nyaman.
        </p>
      </div>

      <div className="rounded-lg border bg-background p-4 sm:p-6">
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid grid-cols-3 sm:w-auto sm:inline-flex sm:mb-4 gap-2">
            <TabsTrigger value="appearance">
              <MonitorCog className="mr-2 h-4 w-4" />
              Tampilan
            </TabsTrigger>
            <TabsTrigger value="account">
              <Smartphone className="mr-2 h-4 w-4" />
              Akun
            </TabsTrigger>
            <TabsTrigger value="about">
              <Info className="mr-2 h-4 w-4" />
              Tentang
            </TabsTrigger>
          </TabsList>

          {/* ===== Tampilan ===== */}
          <TabsContent value="appearance" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Mode & Tema</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Mode Tampilan</Label>
                  <RadioGroup
                    value={value.mode}
                    onValueChange={(v) => set({ mode: v as ThemeMode })}
                    className="grid grid-cols-3 gap-2"
                  >
                    <Label asChild className="cursor-pointer">
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-md border p-2",
                          value.mode === "light" && "border-primary"
                        )}
                      >
                        <RadioGroupItem value="light" id="mode-light" />
                        <Sun className="h-4 w-4" /> Terang
                      </div>
                    </Label>
                    <Label asChild className="cursor-pointer">
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-md border p-2",
                          value.mode === "dark" && "border-primary"
                        )}
                      >
                        <RadioGroupItem value="dark" id="mode-dark" />
                        <Moon className="h-4 w-4" /> Gelap
                      </div>
                    </Label>
                    <Label asChild className="cursor-pointer">
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-md border p-2",
                          value.mode === "system" && "border-primary"
                        )}
                      >
                        <RadioGroupItem value="system" id="mode-system" />
                        <MonitorCog className="h-4 w-4" /> Sistem
                      </div>
                    </Label>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="mb-2 block">Pilih Tema</Label>
                  <Select
                    value={value.theme}
                    onValueChange={(v) => set({ theme: v as ThemeName })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tema" />
                    </SelectTrigger>
                    <SelectContent>
                      {(["default", "green", "yellow"] as ThemeName[]).map(
                        (t) => (
                          <SelectItem key={t} value={t}>
                            {t === "default"
                              ? "Default (Hijau+Kuning)"
                              : t[0].toUpperCase() + t.slice(1)}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <Label className="mb-2 block">Ukuran Teks</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => bumpFont(-5)}
                    >
                      A-
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetFont}>
                      100%
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => bumpFont(+5)}
                    >
                      A+
                    </Button>
                    <Badge variant="secondary" className="ml-2">
                      {value.fontScalePct}%
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Jenis Font</Label>
                  <Select
                    value={value.fontFamily}
                    onValueChange={(v) => set({ fontFamily: v as FontId })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih font" />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        [
                          "system",
                          "inter",
                          "poppins",
                          "nunito",
                          "jakarta",
                        ] as FontId[]
                      ).map((id) => (
                        <SelectItem key={id} value={id}>
                          {id === "system"
                            ? "System UI"
                            : id === "jakarta"
                            ? "Plus Jakarta Sans"
                            : id[0].toUpperCase() + id.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Kerapatan UI</Label>
                  <Select
                    value={value.density}
                    onValueChange={(v) => set({ density: v as UiDensity })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comfortable">Ringan</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="compact">Rapat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Perilaku Sidebar</Label>
                  <Select
                    value={value.sidebarBehavior}
                    onValueChange={(v) =>
                      set({ sidebarBehavior: v as "sticky" | "auto" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sticky">Tetap</SelectItem>
                      <SelectItem value="auto">Auto collapse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Konteks Aktif</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Sekolah & Peran
                  </div>
                  <div className="font-medium">
                    {value.activeSchoolName || "—"}{" "}
                    {value.activeRole ? `• ${value.activeRole}` : ""}
                  </div>
                </div>
                <Button
                  onClick={handleSwitchContext}
                  variant="outline"
                  size="sm"
                >
                  Ganti Konteks
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== Akun ===== */}
          <TabsContent value="account" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Profil</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nama</Label>
                  <Input
                    value={value.displayName}
                    onChange={(e) => set({ displayName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={value.email} readOnly />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <Button variant="outline">Ganti Foto</Button>
                  <Button variant="outline">Ganti Sandi</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bahasa Aplikasi</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={value.locale}
                  onValueChange={(v) =>
                    set({ locale: v as SettingsState["locale"] })
                  }
                >
                  <SelectTrigger className="w-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Indonesia</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== Tentang ===== */}
          <TabsContent value="about" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tentang Aplikasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Versi: <Badge variant="secondary">{value.appVersion}</Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  Butuh bantuan? Buka menu <b>Bantuan</b> atau hubungi support
                  sekolah.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleApply}>Simpan</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
