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
  Users2,
  CheckCircle2,
} from "lucide-react";

import AuthLayout from "@/components/layout/CAuthLayout";
import api, { setActiveschoolContext } from "@/lib/axios";

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
import { cn } from "@/lib/utils";

/* =========================
   Types
========================= */
type SchoolRole = "dkm" | "admin" | "teacher" | "student" | "user";

type SchoolItem = {
  school_id: string;
  school_slug: string;
  school_name: string;
  school_icon_url?: string;
  roles: SchoolRole[];
};

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

  // Path login FE (bukan API)
  const loginPath = schoolSlug ? `/${schoolSlug}/login` : "/login";

  // URL endpoint sesuai kontrak:
  // {{base_url}}api/{{school_slug}}/auth/register
  // {{base_url}}api/{{school_slug}}/auth/me/simple-context
  const registerUrl = schoolSlug
    ? `/${schoolSlug}/auth/register`
    : "/auth/register";

  const simpleContextUrl = schoolSlug
    ? `/${schoolSlug}/auth/me/simple-context`
    : "/auth/me/simple-context";

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [agree, setAgree] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Success modal
  const [openSuccess, setOpenSuccess] = useState(false);

  // Modals lama (role / join / create)
  const [openSelectSchool, setOpenSelectSchool] = useState(false);
  const [openChooseRole, setOpenChooseRole] = useState(false);
  const [openJoinCreate, setOpenJoinCreate] = useState(false);

  const [selectedTujuan, setSelectedTujuan] = useState<
    "dkm" | "teacher" | "student" | null
  >(null);

  // ChooseRole/JoinCreate state
  const [schoolName, setSchoolName] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Select school state
  const [schools, setSchools] = React.useState<SchoolItem[]>([]);
  const [selected, setSelected] = React.useState<{
    school_id: string;
    school_slug: string;
    role: SchoolRole;
  } | null>(null);
  const [loadingSelect, setLoadingSelect] = React.useState(false);

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
      // 1) Register — pakai slug di URL kalau ada
      await api.post(registerUrl, {
        user_name: userName.trim(),
        email: email.trim(),
        password,
        confirm_password: confirm,
      });

      // 2) Kalau sukses, tampilkan modal sukses
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

  function handleChooseRole(tujuan: "dkm" | "teacher" | "student") {
    setSelectedTujuan(tujuan);
    setOpenChooseRole(false);
    setOpenJoinCreate(true);
  }

  async function handleCreateSchool(data: { name: string; file?: File }) {
    setModalLoading(true);
    try {
      const fd = new FormData();
      fd.append("school_name", data.name);
      if (data.file) fd.append("icon", data.file);

      const res = await api.post("/u/schools/user", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const item = res.data?.data?.item;
      if (!item) throw new Error("Sekolah gagal dibuat.");

      const schoolId: string = item.school_id;
      const slugFromApi: string = item.school_slug ?? item.school_id;

      await setActiveschoolContext(schoolId, "dkm", {
        name: item.school_name,
        icon: item.school_icon_url,
      });

      setOpenJoinCreate(false);
      navigate(`/${slugFromApi}/sekolah`, { replace: true });
    } catch (err: any) {
      alert(
        err?.response?.data?.message || err?.message || "Gagal membuat sekolah."
      );
    } finally {
      setModalLoading(false);
    }
  }

  async function handleJoinSekolah(code: string, role: "teacher" | "student") {
    setModalLoading(true);
    try {
      await api.post("/u/student-class-sections/join", { student_code: code });

      const ctx = await api.get(simpleContextUrl);
      const memberships = ctx.data?.data?.memberships ?? [];
      if (memberships.length > 0) {
        const m = memberships[0];
        const slug = m.school_slug || m.school_id;

        await setActiveschoolContext(m.school_id, role, {
          name: m.school_name,
          icon: m.school_icon_url,
        });

        const path = role === "teacher" ? "guru" : "murid";
        setOpenJoinCreate(false);
        navigate(`/${slug}/${path}`, { replace: true });
      }
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal bergabung ke sekolah."
      );
    } finally {
      setModalLoading(false);
    }
  }

  async function handleSelectSchoolRole(schoolId: string, role: SchoolRole) {
    try {
      const res = await api.get(simpleContextUrl);
      const memberships = res.data?.data?.memberships ?? [];
      const m = memberships.find((x: any) => x.school_id === schoolId);

      const slug = m?.school_slug || schoolSlug || schoolId;

      try {
        localStorage.setItem("active_role", role);
      } catch {}

      await setActiveschoolContext(schoolId, role, {
        name: m?.school_name ?? undefined,
        icon: m?.school_icon_url ?? undefined,
      });

      const path =
        role === "teacher" ? "guru" : role === "student" ? "murid" : "sekolah";

      setOpenSelectSchool(false);
      navigate(`/${slug}/${path}`, { replace: true });
    } catch (err) {
      console.error(err);
    }
  }

  // Load schools ketika SelectSchool dibuka
  React.useEffect(() => {
    let mounted = true;
    async function fetchCtx() {
      setLoadingSelect(true);
      try {
        const res = await api.get(simpleContextUrl);
        if (!mounted) return;
        const memberships = res.data?.data?.memberships ?? [];
        const mapped: SchoolItem[] = memberships.map((m: any) => ({
          school_id: m.school_id,
          school_slug: m.school_slug ?? m.school_id,
          school_name: m.school_name,
          school_icon_url: m.school_icon_url,
          roles: (m.roles ?? []) as SchoolRole[],
        }));
        setSchools(mapped);
      } catch {
        if (!mounted) return;
        setSchools([]);
      } finally {
        if (!mounted) return;
        setLoadingSelect(false);
      }
    }
    if (openSelectSchool) fetchCtx();
    return () => {
      mounted = false;
    };
  }, [openSelectSchool, simpleContextUrl]);

  return (
    <AuthLayout
      mode="register"
      fullWidth
      contentClassName="max-w-xl mx-auto relative overflow-hidden"
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
          <section className="rounded-xl bg-card/40 p-6 sm:p-7 space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-lg font-semibold">Buat Akun Baru</h2>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Nama */}
              <div>
                <Label htmlFor="name">Nama</Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User className="w-4 h-4" />
                  </span>
                  <Input
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Nama lengkap"
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

              {/* Konfirmasi */}
              <div>
                <Label htmlFor="confirm">Konfirmasi Password</Label>
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
                  to="/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Ketentuan
                </Link>{" "}
                &{" "}
                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Privasi
                </Link>
                .
              </p>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
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

        {/* =========================
            DIALOG: Pilih Peran
        ========================= */}
        <Dialog
          open={openChooseRole}
          onOpenChange={(v) => setOpenChooseRole(v)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="space-y-3">
              <div className="mx-auto size-16 rounded-2xl grid place-items-center bg-gradient-to-br from-primary to-accent shadow-lg">
                <Sparkles className="size-8 text-primary-foreground" />
              </div>
              <DialogTitle className="text-center">Apa peran Anda?</DialogTitle>
              <DialogDescription className="text-center">
                Pilih tujuan Anda bergabung di SekolahIslamKu
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleChooseRole("dkm")}
                className="w-full py-4 rounded-2xl justify-start gap-3 border-input hover:border-primary"
              >
                <div className="size-10 rounded-xl grid place-items-center bg-gradient-to-br from-primary to-accent shadow-md">
                  <GraduationCap className="size-5 text-primary-foreground" />
                </div>
                <span className="font-semibold">Jadi DKM / Admin Sekolah</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleChooseRole("teacher")}
                className="w-full py-4 rounded-2xl justify-start gap-3 border-input hover:border-primary"
              >
                <div className="size-10 rounded-xl grid place-items-center bg-gradient-to-br from-secondary to-primary shadow-md">
                  <Users2 className="size-5 text-primary-foreground" />
                </div>
                <span className="font-semibold">Gabung Sebagai Guru</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleChooseRole("student")}
                className="w-full py-4 rounded-2xl justify-start gap-3 border-input hover:border-primary"
              >
                <div className="size-10 rounded-xl grid place-items-center bg-gradient-to-br from-accent to-primary shadow-md">
                  <GraduationCap className="size-5 text-primary-foreground" />
                </div>
                <span className="font-semibold">Gabung Sebagai Murid</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full mt-2"
              onClick={() => setOpenChooseRole(false)}
            >
              Nanti Saja
            </Button>
          </DialogContent>
        </Dialog>

        {/* =========================
            DIALOG: Join / Create
        ========================= */}
        <Dialog
          open={openJoinCreate}
          onOpenChange={(v) => setOpenJoinCreate(v)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl grid place-items-center bg-gradient-to-br from-primary to-accent">
                  {selectedTujuan === "dkm" || !selectedTujuan ? (
                    <GraduationCap className="size-6 text-primary-foreground" />
                  ) : selectedTujuan === "teacher" ? (
                    <Users2 className="size-6 text-primary-foreground" />
                  ) : (
                    <GraduationCap className="size-6 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <DialogTitle>
                    {selectedTujuan === "dkm"
                      ? "Buat Sekolah Baru"
                      : "Gabung ke Sekolah"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTujuan === "dkm"
                      ? "Daftarkan sekolah Anda ke sistem."
                      : "Masukkan kode akses dari admin sekolah."}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedTujuan === "dkm" ? (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!schoolName.trim()) return;
                  await handleCreateSchool({
                    name: schoolName.trim(),
                    file: iconFile ?? undefined,
                  });
                }}
              >
                <div className="grid gap-2">
                  <Label htmlFor="schoolName">Nama Sekolah</Label>
                  <Input
                    id="schoolName"
                    placeholder="Contoh: SD Al-Ikhlas"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="iconFile">Logo Sekolah (Opsional)</Label>
                  <Input
                    id="iconFile"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIconFile(e.target.files?.[0] ?? null)}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!schoolName.trim() || modalLoading}
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-95"
                >
                  {modalLoading ? "Membuat sekolah..." : "Buat Sekolah"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setOpenJoinCreate(false)}
                >
                  Batal
                </Button>
              </form>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!accessCode.trim() || !selectedTujuan) return;
                  await handleJoinSekolah(accessCode.trim(), selectedTujuan);
                }}
              >
                <div className="grid gap-2">
                  <Label htmlFor="accessCode">Kode Akses Sekolah</Label>
                  <Input
                    id="accessCode"
                    placeholder="Masukkan kode akses"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="text-center font-mono tracking-wider text-lg"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!accessCode.trim() || modalLoading}
                  className="w-full bg-gradient-to-r from-accent to-primary text-primary-foreground hover:opacity-95"
                >
                  {modalLoading ? "Memproses..." : "Gabung Sekarang"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setOpenJoinCreate(false)}
                >
                  Batal
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* =========================
            DIALOG: Select School & Role
        ========================= */}
        <Dialog
          open={openSelectSchool}
          onOpenChange={(v) => setOpenSelectSchool(v)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full grid place-items-center bg-primary text-primary-foreground">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <DialogTitle>Pilih Sekolah & Role</DialogTitle>
              </div>
              <DialogDescription>
                Pilih sekolah dan peran yang ingin kamu gunakan untuk
                melanjutkan.
              </DialogDescription>
            </DialogHeader>

            {loadingSelect ? (
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
                          prev?.school_id === m.school_id
                            ? prev.role
                            : undefined;
                        const fallback: SchoolRole =
                          keepRole ?? (m.roles?.[0] as SchoolRole) ?? "user";
                        return {
                          school_id: m.school_id,
                          school_slug: m.school_slug,
                          role: fallback,
                        };
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
                        : (["user"] as SchoolRole[])
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
                            setSelected({
                              school_id: m.school_id,
                              school_slug: m.school_slug,
                              role: r,
                            });
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

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 ring-inset"
                onClick={() => setOpenSelectSchool(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                className="flex-1 ring-inset"
                disabled={!selected}
                onClick={() =>
                  selected &&
                  handleSelectSchoolRole(selected.school_id, selected.role)
                }
              >
                Pilih & Lanjutkan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    </AuthLayout>
  );
}