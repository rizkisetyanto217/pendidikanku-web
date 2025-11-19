// src/pages/auth/AuthLogin.tsx
import React, { useState, useMemo } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
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

import ModalDemoAccounts from "./components/CAuthModalDemoAccount";

/* =========================
   Types
========================= */
type schoolRole = "dkm" | "admin" | "teacher" | "student" | "user";

function roleLabel(r: schoolRole) {
  switch (r) {
    case "dkm":
      return "DKM / Pengelola";
    case "admin":
      return "Admin Sekolah";
    case "teacher":
      return "Guru / Pengajar";
    case "student":
      return "Murid / Santri";
    default:
      return "Pengguna";
  }
}

/* =========================
   Modal pilih role (untuk multi-role)
========================= */
function RolePickerModal({
  open,
  roles,
  onClose,
  onSelect,
}: {
  open: boolean;
  roles: schoolRole[];
  onClose: () => void;
  onSelect: (role: schoolRole) => void;
}) {
  if (!open) return null;
  const uniqueRoles = Array.from(new Set(roles));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Pilih peran"
    >
      <Card className="w-full max-w-sm shadow-lg animate-in fade-in zoom-in-95 duration-150">
        <CardHeader>
          <CardTitle className="text-base">Pilih peran</CardTitle>
          <p className="text-sm text-muted-foreground">
            Kamu terdaftar dengan beberapa peran. Pilih mau masuk sebagai apa.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {uniqueRoles.map((r) => (
              <Button
                key={r}
                type="button"
                variant="outline"
                size="sm"
                className="ring-inset"
                onClick={() => onSelect(r)}
              >
                {roleLabel(r)}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ring-inset"
            onClick={onClose}
          >
            Batal
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
  const { school_slug } = useParams<{ school_slug: string }>();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [openDemo, setOpenDemo] = useState(false);

  // state untuk pemilihan role (multi-role)
  const [openRolePicker, setOpenRolePicker] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<schoolRole[]>([]);
  const [pendingSchoolId, setPendingSchoolId] = useState<string | null>(null);

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

  function navigateByRole(schoolId: string, role: schoolRole) {
    const section =
      role === "teacher" ? "guru" : role === "student" ? "murid" : "sekolah";

    if (!school_slug) {
      // fallback kalau entah gimana slug-nya hilang
      navigate("/", { replace: true });
      return;
    }

    // Context tetap simpan ID (bagus, buat query backend)
    setActiveschoolContext(schoolId, role);

    // URL tetap pakai slug
    navigate(`/${school_slug}/${section}/dashboard`, { replace: true });
  }

  function handleRolePicked(role: schoolRole) {
    if (!pendingSchoolId) return;
    navigateByRole(pendingSchoolId, role);
    setOpenRolePicker(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const slug = school_slug?.trim();
      if (!slug) {
        throw new Error("school_slug tidak ditemukan di URL.");
      }

      // Backend: POST /api/:school_slug/auth/login
      const res = await api.post(`/${slug}/auth/login`, {
        identifier,
        password,
        remember_me: remember,
      });

      const { access_token, user } = res.data?.data ?? {};
      if (!access_token || !user) {
        throw new Error("Respon login tidak lengkap (token / user kosong).");
      }

      // Simpan access token (sessionStorage + header axios)
      setTokens(access_token);

      // Ambil info sekolah & roles dari payload user
      const schoolId: string | undefined = user.school_id;
      const rawRoles: string[] = Array.isArray(user.roles)
        ? user.roles.map((r: string) => r.toLowerCase())
        : [];

      if (!schoolId) {
        // fallback ekstrem: tidak ada school_id padahal login via slug
        navigate("/", { replace: true });
        return;
      }

      // Filter & normalisasi roles ke union type
      const normalizedRoles = rawRoles.filter((r) =>
        ["dkm", "admin", "teacher", "student", "user"].includes(r)
      ) as schoolRole[];

      if (normalizedRoles.length <= 1) {
        // cuma 0 atau 1 role → auto-pick
        const activeRole: schoolRole = normalizedRoles[0] ?? "user";
        navigateByRole(schoolId, activeRole);
      } else {
        // multi-role → buka modal pilih peran
        setPendingSchoolId(schoolId);
        setAvailableRoles(normalizedRoles);
        setOpenRolePicker(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Login gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      mode="login"
      fullWidth
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
                      "bg-green-600": strength >= 3,
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

      {/* Modal pilih role kalau punya banyak role di sekolah ini */}
      <RolePickerModal
        open={openRolePicker}
        roles={availableRoles}
        onClose={() => setOpenRolePicker(false)}
        onSelect={handleRolePicked}
      />
    </AuthLayout>
  );
}
