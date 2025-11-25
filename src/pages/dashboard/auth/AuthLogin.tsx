// src/pages/auth/AuthLogin.tsx
import React, { useState, useMemo, useCallback } from "react";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* =========================
   Types
========================= */
type schoolRole = "dkm" | "admin" | "teacher" | "student" | "user";

type ProfileCompletionStatus = {
  has_profile: boolean;
  is_profile_completed: boolean;
  has_teacher: boolean;
  is_teacher_completed: boolean;
  is_fully_completed: boolean;
};

function roleLabel(r: schoolRole) {
  switch (r) {
    case "dkm":
      return "Admin";
    case "admin":
      return "Admin Sekolah";
    case "teacher":
      return "Pengajar";
    case "student":
      return "Murid";
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
  const tenantBase = school_slug ? `/${school_slug}` : "";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // state untuk pemilihan role (multi-role)
  const [openRolePicker, setOpenRolePicker] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<schoolRole[]>([]);
  const [pendingSchoolId, setPendingSchoolId] = useState<string | null>(null);
  const [profileCompletion, setProfileCompletion] =
    useState<ProfileCompletionStatus | null>(null);

  // langsung ke halaman register tanpa popup pilihan guru/murid
  const handleGoRegister = useCallback(() => {
    if (school_slug) {
      navigate(`/${school_slug}/register`);
    } else {
      navigate("/register");
    }
  }, [navigate, school_slug]);

  // Nama sekolah dari slug (diploma-ilmi → "Diploma Ilmi")
  const schoolTitle = useMemo(() => {
    if (!school_slug) return "Madinah Salam";

    const parts = school_slug
      .split(/[-_]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length === 0) return "Madinah Salam";

    return parts
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [school_slug]);

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
      navigate("/", { replace: true });
      return;
    }

    setActiveschoolContext(schoolId, role);

    navigate(`/${school_slug}/${section}/dashboard`, { replace: true });
  }

  // arahkan ke cluster unassigned sesuai role + halaman
  function navigateToUnassigned(
    initialRole?: schoolRole,
    page: "profil" | "pendaftaran" = "profil"
  ) {
    const state = {
      fromLogin: true,
      identifier,
      initialRole,
    };

    const section = initialRole === "teacher" ? "user-guru" : "user-murid";

    // mapping: "profil" → "profil-new"
    const pathSegment = page === "profil" ? "profil-new" : "pendaftaran";

    if (!school_slug) {
      navigate(`/${section}/${pathSegment}`, {
        replace: true,
        state,
      });
      return;
    }

    navigate(`/${school_slug}/${section}/${pathSegment}`, {
      replace: true,
      state,
    });
  }

  function handleRolePicked(role: schoolRole) {
    if (!pendingSchoolId) return;
    const schoolId = pendingSchoolId;

    // admin/dkm → langsung dashboard sekolah
    if (role === "admin" || role === "dkm") {
      navigateByRole(schoolId, role);
      setOpenRolePicker(false);
      return;
    }

    // teacher/student → cek dulu profileCompletion
    if (
      profileCompletion &&
      (!profileCompletion.has_profile ||
        !profileCompletion.is_profile_completed)
    ) {
      setActiveschoolContext(schoolId, role);
      navigateToUnassigned(role);
    } else {
      navigateByRole(schoolId, role);
    }

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

      const res = await api.post(`/${slug}/auth/login`, {
        identifier,
        password,
        remember_me: remember,
      });

      const { access_token, user } = res.data?.data ?? {};
      if (!access_token || !user) {
        throw new Error("Respon login tidak lengkap (token / user kosong).");
      }

      setTokens(access_token);

      const schoolId: string | undefined = user.school_id;
      const rawRoles: string[] = Array.isArray(user.roles)
        ? user.roles.map((r: string) => r.toLowerCase())
        : [];

      if (!schoolId) {
        navigate("/", { replace: true });
        return;
      }

      const normalizedRoles = rawRoles.filter((r) =>
        ["dkm", "admin", "teacher", "student", "user"].includes(r)
      ) as schoolRole[];

      // cek profile-completion
      let completion: ProfileCompletionStatus | null = null;
      try {
        const pcRes = await api.get<{
          success: boolean;
          message: string;
          data: ProfileCompletionStatus;
        }>(`/${slug}/auth/me/profile-completion`);

        completion = pcRes.data?.data ?? null;
      } catch (e) {
        console.warn("[login] gagal cek profile-completion", e);
      }
      setProfileCompletion(completion);

      console.log("[login] normalizedRoles", normalizedRoles);
      console.log("[login] completion", completion);

      // ==== Branching utama ====

      // CASE 0: tidak punya peran di sekolah ini → unassigned (user/pendaftaran)
      if (normalizedRoles.length === 0) {
        // 🔥 PRIORITAS: kalau sudah punya entitas guru tapi profil guru BELUM lengkap
        if (
          completion &&
          completion.has_teacher &&
          !completion.is_teacher_completed
        ) {
          // anggap dia login sebagai guru
          setActiveschoolContext(schoolId, "teacher");

          // arahkan ke: /:school_slug/user-guru/profil-new
          navigateToUnassigned("teacher", "profil");
          return;
        }

        // fallback lama: infer role dari profil umum
        const inferredRole: schoolRole =
          completion?.has_teacher && completion?.is_teacher_completed
            ? "teacher"
            : "student";

        setActiveschoolContext(schoolId, inferredRole);

        // kalau profil SUDAH lengkap & role murid → langsung ke pendaftaran
        if (
          completion &&
          completion.has_profile &&
          completion.is_profile_completed &&
          inferredRole === "student"
        ) {
          navigateToUnassigned(inferredRole, "pendaftaran");
        } else {
          // profil belum lengkap → ke profil-new
          navigateToUnassigned(inferredRole, "profil");
        }
        return;
      }

      // CASE 1: hanya 1 role
      if (normalizedRoles.length === 1) {
        const singleRole: schoolRole = normalizedRoles[0];

        // admin/dkm → tetap langsung ke dashboard sekolah
        if (singleRole === "admin" || singleRole === "dkm") {
          navigateByRole(schoolId, singleRole);
          return;
        }

        // 🔥 PRIORITAS BARU:
        // kalau user sudah punya entitas guru,
        // tapi profil guru BELUM lengkap → paksa ke /user-guru/profil-new
        if (
          completion &&
          completion.has_teacher &&
          !completion.is_teacher_completed
        ) {
          // konteks aktif sebagai guru
          setActiveschoolContext(schoolId, "teacher");
          // ini akan resolve ke:
          // /:school_slug/user-guru/profil-new
          navigateToUnassigned("teacher", "profil");
          return;
        }

        // teacher/student tunggal → cek kelengkapan profil umum (user profile)
        if (
          completion &&
          (!completion.has_profile || !completion.is_profile_completed)
        ) {
          const initialRole: schoolRole =
            singleRole === "teacher" ? "teacher" : "student";

          setActiveschoolContext(schoolId, initialRole);
          navigateToUnassigned(initialRole, "profil");
          return;
        }

        // profil umum & (kalau ada) profil guru sudah beres → langsung ke dashboard
        navigateByRole(schoolId, singleRole);
        return;
      }

      // CASE 2: multi-role (>= 2, contoh: dkm + teacher + student)
      setPendingSchoolId(schoolId);
      setAvailableRoles(normalizedRoles);
      setOpenRolePicker(true);
    } catch (err: any) {
      console.error(err);

      const backendMsg = err?.response?.data?.message as string | undefined;
      setError(backendMsg || err?.message || "Login gagal. Silakan coba lagi.");
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
      <>
        {/* Wrapper supaya header & isi punya padding kanan-kiri yang sama */}
        <div className="px-6 sm:px-8">
          {/* Header brand */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl grid place-items-center bg-primary text-primary-foreground">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight">
                  {schoolTitle}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Satu akun semua progam Madinah Salam
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

          {/* Card isi login */}
          <section className="rounded-xl bg-card/40 py-6 sm:py-7 space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-lg font-semibold">Masuk ke Akun</h2>
            </div>

            {/* Form */}
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
                    variant="icon"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </Button>
                </div>

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
                  to={
                    tenantBase
                      ? `${tenantBase}/lupa-password`
                      : "/lupa-password"
                  }
                  className="text-sm text-primary hover:underline"
                >
                  Lupa password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading || !identifier.trim() || !password}
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

            <Separator className="my-2" />

            {/* Footer kecil */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="text-[11px] text-muted-foreground">
                Dengan masuk, kamu menyetujui{" "}
                <Link
                  to={tenantBase ? `${tenantBase}/ketentuan` : "/ketentuan"}
                  className="underline"
                >
                  Ketentuan
                </Link>
                &{" "}
                <Link
                  to={tenantBase ? `${tenantBase}/privasi` : "/privasi"}
                  className="underline"
                >
                  Privasi
                </Link>
                .
              </div>
              <div className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Sparkles className="w-3 h-3" /> Akses cepat ke fitur terbaru
              </div>
              <div className="pt-1 text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={handleGoRegister}
                  className="font-semibold text-primary hover:underline"
                >
                  Daftar sekarang
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Modal pilih role kalau punya banyak role di sekolah ini */}
        <RolePickerModal
          open={openRolePicker}
          roles={availableRoles}
          onClose={() => setOpenRolePicker(false)}
          onSelect={handleRolePicked}
        />
      </>
    </AuthLayout>
  );
}