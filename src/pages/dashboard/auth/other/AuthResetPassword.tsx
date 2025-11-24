// src/pages/auth/ResetPassword.tsx
import * as React from "react";
import { useMemo, useState } from "react";
import {
  Link,
  useParams,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import AuthLayout from "@/components/layout/CAuthLayout";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function ResetPassword() {
  const params = useParams<{ school_slug?: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // ==== Resolve schoolSlug (kalau suatu saat route-nya slug-aware) ====
  let schoolSlug: string | undefined = params.school_slug;
  if (!schoolSlug) {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length > 0 && segments[0] !== "reset-password") {
      // mis: "/diploma-ilmi/reset-password"
      schoolSlug = segments[0];
    }
  }

  const loginPath = schoolSlug ? `/${schoolSlug}/login` : "/login";

  // Endpoint backend (sesuaikan dengan kontrak backend-mu):
  // {{base_url}}api/{{school_slug}}/auth/reset-password
  // atau global:
  // {{base_url}}api/auth/reset-password
  const resetUrl = schoolSlug
    ? `/${schoolSlug}/auth/reset-password`
    : "/auth/reset-password";

  // token dari query string ?token=...
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const confirmMismatch = confirm.length > 0 && confirm !== password;

  const isSubmitDisabled =
    loading || !token || !password || !confirm || confirmMismatch;

  // Password strength
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

  const schoolTitle = useMemo(() => {
    if (!schoolSlug) return "Madinah Salam";
    const parts = schoolSlug
      .split(/[-_]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return "Madinah Salam";
    return parts
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [schoolSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Token tidak ditemukan. Silakan buka link dari email kembali.");
      return;
    }
    if (confirmMismatch) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await api.post(resetUrl, {
        token,
        password,
        confirm_password: confirm,
      });

      setSuccessMsg(
        "Password berhasil diubah. Silakan masuk dengan password baru."
      );
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal mengubah password. Coba lagi beberapa saat."
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
      <>
        {/* Wrapper: padding konsisten */}
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
                  Buat password baru untuk akun Madinah Salam kamu.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs px-2 py-1 rounded-full border bg-card text-card-foreground">
              <ShieldCheck className="w-4 h-4" />
              Aman &amp; terenkripsi
            </div>
          </div>

          {/* Token missing warning */}
          {!token && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Token tidak valid</AlertTitle>
              <AlertDescription>
                Link reset password tidak memiliki token. Silakan minta ulang
                permintaan reset password.
              </AlertDescription>
            </Alert>
          )}

          {/* Error alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Gagal</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success alert */}
          {successMsg && (
            <Alert className="mb-4 border-emerald-500/60 bg-emerald-50/60 text-emerald-900 dark:bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Berhasil</AlertTitle>
              <AlertDescription>{successMsg}</AlertDescription>
            </Alert>
          )}

          {/* Card isi reset password */}
          <section className="rounded-xl bg-card/40 py-6 sm:py-7 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Reset Password</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Isi password baru yang aman. Setelah ini kamu bisa login kembali
                seperti biasa.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password baru */}
              <div>
                <Label htmlFor="password">Password Baru</Label>
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
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Lock className="w-4 h-4" />
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
                <Label htmlFor="confirm">Ulangi Password Baru</Label>
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
                    <Lock className="w-4 h-4" />
                  </Button>
                </div>
                {confirmMismatch && (
                  <p className="mt-2 text-xs text-destructive">
                    Konfirmasi password tidak sama.
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full ring-inset"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Menyimpan password...
                  </>
                ) : (
                  <>
                    Simpan Password Baru
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-2" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                Sudah ingat password?{" "}
                <Link
                  to={loginPath}
                  className="font-semibold text-primary hover:underline"
                >
                  Kembali ke halaman login
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </>
    </AuthLayout>
  );
}
