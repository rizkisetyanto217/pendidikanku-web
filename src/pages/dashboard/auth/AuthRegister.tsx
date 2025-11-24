// src/pages/auth/Register.tsx
import * as React from "react";
import { useMemo, useState } from "react";
import { useNavigate, Link, useParams, useLocation } from "react-router-dom";
import {
  EyeIcon,
  EyeOffIcon,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Lock,
  Mail,
  User,
  KeyRound,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import AuthLayout from "@/components/layout/CAuthLayout";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ⬇️ NEW: Select shadcn untuk pilih role
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

/* =========================
   Halaman Register (shadcn UI)
========================= */
export default function Register() {
  const navigate = useNavigate();
  const params = useParams<{ school_slug?: string }>();
  const location = useLocation();

  // Resolve school_slug dari params atau dari path pertama
  let schoolSlug: string | undefined = params.school_slug;
  if (!schoolSlug) {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      schoolSlug = segments[0]; // mis: "/diploma-ilmi/register" -> "diploma-ilmi"
    }
  }

  // Base tenant untuk link-link lain
  const tenantBase = schoolSlug ? `/${schoolSlug}` : ""; // ⬅️ NEW

  // Path login FE (bukan API)
  const loginPath = schoolSlug ? `/${schoolSlug}/login` : "/login";

  // URL endpoint sesuai kontrak:
  // {{base_url}}api/{{school_slug}}/auth/register
  // {{base_url}}api/{{school_slug}}/auth/me/simple-context
  const registerUrl = schoolSlug
    ? `/${schoolSlug}/auth/register`
    : "/auth/register";

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  const [fullName, setFullName] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [agree, setAgree] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ⬇️ NEW: role yang dipilih (default: student)
  const [registerAs, setRegisterAs] = useState<"student" | "teacher">(
    "student"
  );

  // Success modal
  const [openSuccess, setOpenSuccess] = useState(false);

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

  const confirmMismatch = confirm.length > 0 && confirm !== password;

  const isSubmitDisabled =
    loading ||
    !agree ||
    !fullName.trim() ||
    !userName.trim() ||
    !email.trim() ||
    !password ||
    !confirm ||
    confirmMismatch;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) {
      setError("Anda harus menyetujui Ketentuan & Privasi.");
      return;
    }
    if (confirmMismatch) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post(registerUrl, {
        user_name: userName.trim(),
        email: email.trim(),
        full_name: fullName.trim(),
        password,
        confirm_password: confirm,
        // ⬇️ NEW: kirim role yang dipilih ke backend
        // sesuaikan nama field ini dengan kontrak backend-mu
        register_as: registerAs,
      });

      setOpenSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message || err?.message || "Registrasi gagal."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      mode="register"
      fullWidth
      contentClassName="max-w-2xl mx-auto relative overflow-hidden"
    >
      <>
        {/* Wrapper: bikin header & isi punya padding sama kayak login */}
        <div className="px-6 sm:px-8">
          {/* Header brand */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl grid place-items-center bg-primary text-primary-foreground">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight">
                  Madinah Salam
                </h1>
                <p className="text-xs text-muted-foreground">
                  Daftar untuk mulai pakai semua fitur.
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
              <AlertTitle>Registrasi gagal</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Isi register */}
          <section className="rounded-xl bg-card/40 space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-lg font-semibold">Buat Akun Baru</h2>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Grid:
                  Row 1: Nama Lengkap | Daftar sebagai
                  Row 2: Nama akun | Email
                  Row 3: Password | Ulangi password
              */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Nama lengkap */}
                <div>
                  <Label htmlFor="full_name">Nama Lengkap</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <User className="w-4 h-4" />
                    </span>
                    <Input
                      id="full_name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama lengkap sesuai identitas"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* ⬇️ NEW: Dropdown pilih role */}
                <div>
                  <Label htmlFor="register_as">Daftar sebagai</Label>
                  <div className="mt-2">
                    <Select
                      value={registerAs}
                      onValueChange={(v) =>
                        setRegisterAs(v as "student" | "teacher")
                      }
                    >
                      <SelectTrigger id="register_as">
                        <SelectValue
                          placeholder="Pilih peran"
                          aria-label={
                            registerAs === "teacher" ? "Pengajar" : "Murid"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Murid</SelectItem>
                        <SelectItem value="teacher">Pengajar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Nama akun */}
                <div>
                  <Label htmlFor="username">Nama Akun</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <User className="w-4 h-4" />
                    </span>
                    <Input
                      id="username"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Nama pengguna (username)"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                    </span>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@domain.com"
                      autoComplete="email"
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
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyUp={(e) =>
                        setCapsLockOn((e as any).getModifierState?.("CapsLock"))
                      }
                      placeholder="Minimal 8 karakter"
                      autoComplete="new-password"
                      required
                      className="pl-10 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="
                        absolute right-2 top-1/2 -translate-y-1/2
                        p-0
                        bg-transparent hover:bg-transparent
                        text-muted-foreground hover:text-foreground
                        focus-visible:ring-0
                      "
                      onClick={() => setShowPw((s) => !s)}
                      aria-label={
                        showPw ? "Sembunyikan password" : "Tampilkan password"
                      }
                    >
                      {showPw ? (
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

                {/* Ulangi password */}
                <div>
                  <Label htmlFor="confirm">Ulangi Password</Label>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <Input
                      id="confirm"
                      type={showPw2 ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Ulangi password"
                      autoComplete="new-password"
                      required
                      className={cn(
                        "pl-10 pr-12",
                        confirmMismatch && "border-destructive"
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="
                        absolute right-2 top-1/2 -translate-y-1/2
                        p-0
                        bg-transparent hover:bg-transparent
                        text-muted-foreground hover:text-foreground
                        focus-visible:ring-0
                      "
                      onClick={() => setShowPw2((s) => !s)}
                      aria-label={
                        showPw2
                          ? "Sembunyikan konfirmasi"
                          : "Tampilkan konfirmasi"
                      }
                    >
                      {showPw2 ? (
                        <EyeOffIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {confirmMismatch && (
                    <p className="mt-2 text-xs text-destructive">
                      Konfirmasi password tidak sama.
                    </p>
                  )}
                </div>
              </div>
              {/* Agree + link login */}
              <div className="flex items-center justify-between gap-4">
                {/* Checkbox + label biasa */}
                <div className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={agree}
                    onCheckedChange={(v) => setAgree(Boolean(v))}
                    id="agree"
                  />
                  <Label
                    htmlFor="agree"
                    className="cursor-pointer leading-snug"
                  >
                    Saya setuju dengan Ketentuan &amp; Privasi.
                  </Label>
                </div>

                {/* Link ke login, slug-aware */}
                <Link
                  to={loginPath}
                  className="text-sm text-primary hover:underline whitespace-nowrap"
                >
                  Sudah punya akun?
                </Link>
              </div>

              {/* Link ke Ketentuan & Privasi (di bawah, bukan di dalam label) */}
              <p className="mt-1 text-xs text-muted-foreground">
                Baca{" "}
                <Link
                  to={tenantBase ? `${tenantBase}/ketentuan` : "/ketentuan"}
                  className="underline"
                >
                  Ketentuan
                </Link>{" "}
                &{" "}
                <Link
                  to={tenantBase ? `${tenantBase}/privasi` : "/privasi"}
                  className="underline"
                >
                  Privasi
                </Link>
                .
              </p>
              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full ring-inset"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Membuat Akun...
                  </>
                ) : (
                  <>
                    Buat Akun
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* CTA + disclaimer */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5" />
                Dapatkan akses cepat ke fitur terbaru setelah mendaftar.
              </div>
              <div className="text-[11px] text-muted-foreground">
                Dengan mendaftar, kamu menyetujui Ketentuan &amp; Privasi.
              </div>
            </div>
          </section>
        </div>

        {/* =========================
            DIALOG: Sukses Register
        ========================= */}
        <Dialog open={openSuccess} onOpenChange={setOpenSuccess}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="space-y-3">
              <div className="mx-auto size-16 rounded-2xl grid place-items-center bg-emerald-500/90 text-emerald-50 shadow-lg">
                <CheckCircle2 className="size-9" />
              </div>
              <DialogTitle className="text-center">
                Pendaftaran Berhasil
              </DialogTitle>
              <DialogDescription className="text-center">
                Akun kamu sudah terdaftar. Silakan masuk dengan email dan
                password yang baru dibuat.
              </DialogDescription>
            </DialogHeader>

            <Button
              className="w-full mt-2"
              onClick={() => {
                setOpenSuccess(false);
                navigate(loginPath, { replace: true });
              }}
            >
              Masuk Sekarang
            </Button>
          </DialogContent>
        </Dialog>
      </>
    </AuthLayout>
  );
}