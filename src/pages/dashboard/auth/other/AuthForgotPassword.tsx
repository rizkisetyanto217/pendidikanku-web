// src/pages/auth/ForgotPassword.tsx
import * as React from "react";
import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Mail,
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

export default function ForgotPassword() {
  const params = useParams<{ school_slug?: string }>();

  // Kalau nanti mau slug-aware (misal: /diploma-ilmi/forgot-password)
  const schoolSlug = params.school_slug;

  // Path login FE (bukan API)
  const loginPath = schoolSlug ? `/${schoolSlug}/login` : "/login";

  // Endpoint backend (silakan sesuaikan dengan kontrak di service auth):
  // Contoh:
  //   {{base_url}}api/auth/forgot-password
  // atau
  //   {{base_url}}api/{{school_slug}}/auth/forgot-password
  const forgotUrl = schoolSlug
    ? `/${schoolSlug}/auth/forgot-password`
    : "/auth/forgot-password";

  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isSubmitDisabled = loading || !identifier.trim();

  // Nama sekolah untuk header (kalau pakai slug)
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
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await api.post(forgotUrl, {
        // Sesuaikan dengan kontrak backend:
        // bisa `identifier`, bisa `email`
        identifier: identifier.trim(),
      });

      setSuccessMsg(
        "Kalau data cocok, kami sudah mengirimkan instruksi reset password ke email kamu."
      );
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal mengirim permintaan reset password."
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
        {/* Wrapper: padding kanan-kiri konsisten dengan login/register */}
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
                  Atur ulang password akun Madinah Salam kamu.
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
              <AlertTitle>Permintaan terkirim</AlertTitle>
              <AlertDescription>{successMsg}</AlertDescription>
            </Alert>
          )}

          {/* Card isi forgot password */}
          <section className="rounded-xl bg-card/40 py-6 sm:py-7 space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-lg font-semibold">Lupa Password</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Masukkan email atau username yang terdaftar. Kami akan mengirim
                link untuk mengatur ulang password kamu.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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

              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full ring-inset"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Mengirim instruksi...
                  </>
                ) : (
                  <>
                    Kirim Instruksi Reset
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-2" />

            {/* Footer kecil */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                Ingat password kamu?{" "}
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
