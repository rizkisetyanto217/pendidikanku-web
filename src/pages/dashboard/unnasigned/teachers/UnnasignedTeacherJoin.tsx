// src/pages/sekolahislamku/pages/user/UnassignedTeacherJoin.tsx
import { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  GraduationCap,
  ShieldCheck,
  School,
  Users,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

type LocationState = {
  identifier?: string; // info akun yg login (opsional, mirip halaman pendaftaran)
};

export default function UnassignedTeacherJoin() {
  const { school_slug } = useParams<{ school_slug: string }>();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [schoolCode, setSchoolCode] = useState("");
  const [classCode, setClassCode] = useState("");

  const [loadingSchoolJoin, setLoadingSchoolJoin] = useState(false);
  const [loadingClassJoin, setLoadingClassJoin] = useState(false);

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const schoolTitle = useMemo(() => {
    if (!school_slug) return "Madinah Salam";

    const parts = school_slug
      .split(/[-_]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length === 0) return "Madinah Salam";

    return parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }, [school_slug]);

  const slug = school_slug?.trim() || "";

  async function handleJoinBySchoolCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoadingSchoolJoin(true);

    try {
      if (!slug) throw new Error("school_slug tidak ditemukan.");
      if (!schoolCode.trim()) throw new Error("Kode guru sekolah wajib diisi.");

      // DUMMY ONLY – simulasi call API
      await new Promise((r) => setTimeout(r, 700));

      setSuccess(
        `Berhasil bergabung dengan sekolah sebagai guru menggunakan kode ${schoolCode
          .trim()
          .toUpperCase()}. 🎉`
      );
      setSchoolCode("");
      // nanti kalau sudah ada API:
      // const res = await api.post(`/${slug}/teacher/join-by-school-code`, { invite_code: schoolCode.trim() })
      // dst...
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Gagal bergabung menggunakan kode guru sekolah."
      );
    } finally {
      setLoadingSchoolJoin(false);
    }
  }

  async function handleJoinByClassCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoadingClassJoin(true);

    try {
      if (!slug) throw new Error("school_slug tidak ditemukan.");
      if (!classCode.trim()) throw new Error("Kode kelas guru wajib diisi.");

      // DUMMY ONLY – simulasi call API
      await new Promise((r) => setTimeout(r, 700));

      setSuccess(
        `Berhasil bergabung ke kelas sebagai pengajar dengan kode ${classCode
          .trim()
          .toUpperCase()}. 🎉`
      );
      setClassCode("");
      // nanti kalau sudah ada API:
      // const res = await api.post(`/${slug}/teacher/join-by-class-code`, { class_invite_code: classCode.trim() })
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Gagal bergabung menggunakan kode kelas untuk guru."
      );
    } finally {
      setLoadingClassJoin(false);
    }
  }

  return (
    <div className="w-full px-4 md:px-6 lg:px-8 py-8 space-y-6">
      {/* Header brand */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center bg-primary text-primary-foreground">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">
              Bergabung sebagai Guru
            </h1>
            <p className="text-xs text-muted-foreground">
              {schoolTitle} — Masuk dengan kode undangan dari sekolah atau
              kelas.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs px-2 py-1 rounded-full border bg-card text-card-foreground">
          <ShieldCheck className="w-4 h-4" />
          Aman &amp; terenkripsi
        </div>
      </div>

      {/* Info akun yang sedang login (opsional) */}
      {state.identifier && (
        <Alert className="border-dashed">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Akun terhubung</AlertTitle>
          <AlertDescription className="text-sm">
            Kamu login sebagai:{" "}
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              {state.identifier}
            </span>
            . Bergabung sebagai guru akan dikaitkan ke akun ini.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert error / success global */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gagal</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Berhasil</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Dua card join */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Card 1: Join by teacher code (school invite) */}
        <Card className="border-none bg-card/40">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg grid place-items-center bg-primary/10 text-primary">
                <School className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold">
                  Bergabung dengan Kode Guru Sekolah
                </h2>
                <p className="text-xs text-muted-foreground">
                  Gunakan kode undangan guru yang diberikan oleh admin sekolah
                  (bukan kode kelas).
                </p>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4 space-y-4">
            <form className="space-y-3" onSubmit={handleJoinBySchoolCode}>
              <div className="space-y-1">
                <label
                  htmlFor="school_teacher_code"
                  className="text-xs font-medium"
                >
                  Kode guru sekolah
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-muted-foreground">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <Input
                      id="school_teacher_code"
                      value={schoolCode}
                      onChange={(e) =>
                        setSchoolCode(e.target.value.toUpperCase())
                      }
                      placeholder="Contoh: MS-TEACH-ABCD"
                      className="pl-8 uppercase"
                      autoComplete="one-time-code"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="sm:w-28 shrink-0"
                    disabled={loadingSchoolJoin || !schoolCode.trim()}
                  >
                    {loadingSchoolJoin ? "Memproses..." : "Bergabung"}
                  </Button>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Kode ini biasanya dikirim oleh admin sekolah melalui WhatsApp
                atau pengumuman resmi. Dengan kode ini, akunmu akan tercatat
                sebagai guru resmi di sekolah ini.
              </p>
            </form>
          </CardContent>

          <CardFooter className="pt-2 text-[11px] text-muted-foreground flex flex-wrap gap-1">
            <span>Butuh bantuan?</span>
            <button
              type="button"
              className="underline underline-offset-2 hover:text-primary"
              onClick={() => {
                // opsional: arahkan ke halaman kontak sekolah
                // navigate(`/${slug}/kontak`);
              }}
            >
              Hubungi admin sekolah
            </button>
          </CardFooter>
        </Card>

        {/* Card 2: Join by class code (teacher invitation to specific class) */}
        <Card className="border-none bg-card/40">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg grid place-items-center bg-primary/10 text-primary">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold">
                  Bergabung ke Kelas dengan Kode
                </h2>
                <p className="text-xs text-muted-foreground">
                  Gunakan kode undangan kelas yang diberikan oleh admin atau
                  koordinator untuk menjadi pengajar di kelas tertentu.
                </p>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4 space-y-4">
            <form className="space-y-3" onSubmit={handleJoinByClassCode}>
              <div className="space-y-1">
                <label
                  htmlFor="class_teacher_code"
                  className="text-xs font-medium"
                >
                  Kode kelas untuk guru
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-muted-foreground">
                      <KeyRound className="w-4 h-4" />
                    </span>
                    <Input
                      id="class_teacher_code"
                      value={classCode}
                      onChange={(e) =>
                        setClassCode(e.target.value.toUpperCase())
                      }
                      placeholder="Contoh: MS-CLS-XYZ1"
                      className="pl-8 uppercase"
                      autoComplete="one-time-code"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="sm:w-28 shrink-0"
                    disabled={loadingClassJoin || !classCode.trim()}
                  >
                    {loadingClassJoin ? "Memproses..." : "Bergabung"}
                  </Button>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Kode ini bisa langsung menambahkanmu sebagai pengajar di kelas
                tertentu. Cocok untuk undangan mengisi kajian, program musiman,
                atau team-teaching.
              </p>
            </form>
          </CardContent>

          <CardFooter className="pt-2 text-[11px] text-muted-foreground">
            Pastikan kode yang kamu terima memang khusus untuk guru (bukan kode
            pendaftaran murid).
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
