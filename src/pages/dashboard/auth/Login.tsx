// src/pages/auth/Login.tsx
import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  EyeIcon,
  EyeOffIcon,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import AuthLayout from "@/components/layout/CAuthLayout";
import api, { setTokens, setActiveschoolContext } from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import ModalJoinOrCreate from "./components/CModalJoinOrCreate";
import ModalChooseRole from "./components/CModalChooseRole";
import ModalDemoAccounts from "./components/CModalDemoAccount";

/* =========================
   Types
========================= */
type schoolRole = "dkm" | "admin" | "teacher" | "student" | "user";

/* =========================
   Modal Pilih school & Role (tetap)
========================= */
type schoolItem = {
  school_id: string;
  school_name: string;
  school_icon_url?: string;
  roles: schoolRole[];
};

function ModalSelectRoleschool({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (schoolId: string, role: schoolRole) => void;
}) {
  const [schools, setschools] = React.useState<schoolItem[]>([]);
  const [selected, setSelected] = React.useState<{
    school_id: string;
    role: schoolRole;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    if (!open) return;
    setLoading(true);
    api
      .get("/auth/me/simple-context")
      .then((res) => {
        if (!mounted) return;
        const memberships = res.data?.data?.memberships ?? [];
        const mapped: schoolItem[] = memberships.map((m: any) => ({
          school_id: m.school_id,
          school_name: m.school_name,
          school_icon_url: m.school_icon_url,
          roles: (m.roles ?? []) as schoolRole[],
        }));
        setschools(mapped);
      })
      .catch(() => {
        if (!mounted) return;
        setschools([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Pilih school dan Role"
    >
      <Card className="w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full grid place-items-center bg-primary text-primary-foreground">
              <GraduationCap className="w-5 h-5" />
            </div>
            <CardTitle>Pilih school & Role</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Pilih school dan peran yang ingin kamu gunakan untuk melanjutkan.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-muted-foreground/30 border-t-foreground rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {schools.map((m) => (
                <button
                  key={m.school_id}
                  onClick={() =>
                    setSelected((prev) => {
                      const keepRole =
                        prev?.school_id === m.school_id && prev?.role
                          ? prev.role
                          : undefined;
                      const fallback: schoolRole =
                        keepRole ?? (m.roles?.[0] as schoolRole) ?? "user";
                      return { school_id: m.school_id, role: fallback };
                    })
                  }
                  className={cn(
                    "w-full text-left rounded-xl border p-4 transition-colors",
                    selected?.school_id === m.school_id
                      ? "border-primary/60 bg-primary/5"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={m.school_icon_url || "/image/Gambar-school.jpeg"}
                      alt={m.school_name}
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                    <span className="font-medium">{m.school_name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(m.roles?.length
                      ? m.roles
                      : (["user"] as schoolRole[])
                    ).map((r) => (
                      <Button
                        key={r}
                        type="button"
                        size="sm"
                        variant={
                          selected?.school_id === m.school_id &&
                          selected?.role === r
                            ? "default"
                            : "outline"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected({ school_id: m.school_id, role: r });
                        }}
                        className="ring-inset"
                      >
                        {r.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 ring-inset"
            onClick={onClose}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="flex-1 ring-inset"
            disabled={!selected}
            onClick={() =>
              selected && onSelect(selected.school_id, selected.role)
            }
          >
            Pilih & Lanjutkan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/* =========================
   Halaman Login (shadcn UI)
========================= */
export default function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [openSelectschool, setOpenSelectschool] = useState(false);
  const [openPilihTujuan, setOpenPilihTujuan] = useState(false);
  const [openJoinAtauBuat, setOpenJoinAtauBuat] = useState(false);
  const [selectedTujuan, setSelectedTujuan] = useState<
    "dkm" | "teacher" | "student" | null
  >(null);

  const [openDemo, setOpenDemo] = useState(false);

  // strength meter (0-4 → label 0-4)
  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  }, [password]);

  const strengthLabel = [
    "Sangat lemah",
    "Lemah",
    "Cukup",
    "Kuat",
    "Sangat kuat",
  ][strength];

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", {
        identifier,
        password,
        remember_me: remember,
      });
      const { access_token } = res.data?.data ?? {};
      if (!access_token) throw new Error("Token tidak ditemukan.");

      setTokens(access_token);

      const ctx = await api.get("/auth/me/simple-context");
      const memberships = ctx.data?.data?.memberships ?? [];

      if (memberships.length === 0) {
        setOpenPilihTujuan(true);
        return;
      }

      if (memberships.length === 1) {
        const m = memberships[0];
        const role: schoolRole = (m.roles?.[0] as schoolRole) ?? "user";
        await handleSelectschoolRole(m.school_id, role);
        return;
      }

      setOpenSelectschool(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Login gagal.");
    } finally {
      setLoading(false);
    }
  }

  function handleChooseRole(tujuan: "dkm" | "teacher" | "student") {
    setSelectedTujuan(tujuan);
    setOpenPilihTujuan(false);
    setOpenJoinAtauBuat(true);
  }

  async function handleCreateschool(data: { name: string; file?: File }) {
    try {
      const fd = new FormData();
      fd.append("school_name", data.name);
      if (data.file) fd.append("icon", data.file);

      const res = await api.post("/u/schools/user", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const item = res.data?.data?.item;
      if (!item) throw new Error("school gagal dibuat.");

      const schoolId = item.school_id;
      await setActiveschoolContext(schoolId, "dkm");

      setOpenJoinAtauBuat(false);
      navigate(`/${schoolId}/sekolah`, { replace: true });
    } catch (err: any) {
      alert(
        err?.response?.data?.message || err?.message || "Gagal membuat school."
      );
    }
  }

  async function handleJoinSekolah(code: string, role: "teacher" | "student") {
    try {
      await api.post("/u/student-class-sections/join", { student_code: code });

      const ctx = await api.get("/auth/me/simple-context");
      const memberships = ctx.data?.data?.memberships ?? [];
      if (memberships.length > 0) {
        const m = memberships[0];
        await setActiveschoolContext(m.school_id, role);
        const path = role === "teacher" ? "guru" : "murid";
        navigate(`/${m.school_id}/${path}`, { replace: true });
      }
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal bergabung ke sekolah."
      );
    }
  }

  async function handleSelectschoolRole(schoolId: string, role: schoolRole) {
    try {
      const res = await api.get("/auth/me/simple-context");
      const m = (res.data?.data?.memberships ?? []).find(
        (x: any) => x.school_id === schoolId
      );
      try {
        localStorage.setItem("active_role", role);
      } catch {}
      await setActiveschoolContext(schoolId, role, {
        name: m?.school_name ?? undefined,
        icon: m?.school_icon_url ?? undefined,
      });
      const path =
        role === "teacher" ? "guru" : role === "student" ? "murid" : "sekolah";
      navigate(`/${schoolId}/${path}`, { replace: true });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AuthLayout
      mode="login"
      fullWidth
      // ⬇️ Clip semua isi agar garis/pseudo-element tidak meluber
      contentClassName="max-w-xl mx-auto relative overflow-hidden"
    >
      {/* Header brand */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center bg-primary text-primary-foreground">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">Pendidikanku</h1>
            <p className="text-xs text-muted-foreground">
              Satu akun untuk sekolah, guru, dan murid.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs px-2 py-1 rounded-full border bg-card text-card-foreground">
          <ShieldCheck className="w-4 h-4" />
          Aman &amp; terenkripsi
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Login gagal</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ⬇️ Card di-clip juga */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">Masuk ke Akun</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Identifier */}
            <div>
              <Label htmlFor="identifier">Email / Username</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                </span>
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Masukkan email atau username"
                  autoComplete="username"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <KeyRound className="w-4 h-4" />
                </span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) =>
                    setCapsLockOn((e as any).getModifierState?.("CapsLock"))
                  }
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                  className="pl-10 pr-12"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 ring-inset focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Caps lock */}
              {capsLockOn && (
                <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
                  <Lock className="w-3.5 h-3.5" />
                  Caps Lock aktif
                </div>
              )}

              {/* Strength meter */}
              <div className="mt-3">
                <div className="h-1.5 w-full rounded-full overflow-hidden bg-muted">
                  <div
                    className={cn("h-full transition-all", {
                      "bg-destructive": strength < 2,
                      "bg-primary": strength >= 2 && strength < 3,
                      "bg-green-600": strength >= 3, // kontras OK
                    })}
                    style={{ width: `${(strength / 4) * 100}%` }}
                  />
                </div>
                <div
                  className={cn("mt-1 text-xs", {
                    "text-muted-foreground": strength < 3,
                    "text-green-600": strength >= 3,
                  })}
                >
                  Kekuatan password: {strengthLabel}
                </div>
              </div>
            </div>

            {/* Remember + forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(Boolean(v))}
                  id="remember"
                />
                <span>Ingat saya</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full ring-inset"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk ke Akun
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Divider optional */}
          <Separator className="my-6" />

          {/* Quick actions */}
          <Button
            type="button"
            variant="outline"
            className="w-full ring-inset"
            onClick={() => setOpenDemo(true)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Coba akun demo
          </Button>

          <ModalDemoAccounts
            open={openDemo}
            onClose={() => setOpenDemo(false)}
            onPick={(who) => {
              setIdentifier(`${who}@demo.id`);
              setPassword("Demo@12345");
              setOpenDemo(false);
            }}
          />
        </CardContent>

        <CardFooter className="flex-col items-start gap-2">
          <div className="text-[11px] text-muted-foreground">
            Dengan masuk, kamu menyetujui{" "}
            <Link to="/terms" className="underline">
              Ketentuan
            </Link>{" "}
            &{" "}
            <Link to="/privacy" className="underline">
              Privasi
            </Link>
            .
          </div>
          <div className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Sparkles className="w-3 h-3" /> Akses cepat ke fitur terbaru
          </div>
        </CardFooter>
      </Card>

      {/* Modals (tetap pakai yang sudah ada) */}
      <ModalSelectRoleschool
        open={openSelectschool}
        onClose={() => setOpenSelectschool(false)}
        onSelect={handleSelectschoolRole}
      />
      <ModalChooseRole
        open={openPilihTujuan}
        onClose={() => setOpenPilihTujuan(false)}
        onPilih={handleChooseRole}
      />
      <ModalJoinOrCreate
        open={openJoinAtauBuat}
        mode={selectedTujuan || "dkm"}
        onClose={() => setOpenJoinAtauBuat(false)}
        onCreateschool={handleCreateschool}
        onJoinSekolah={handleJoinSekolah}
      />
    </AuthLayout>
  );
}
