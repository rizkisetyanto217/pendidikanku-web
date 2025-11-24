// src/pages/sekolahislamku/pages/user/UserPendaftaranTeacher.tsx
import { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type LocationState = {
  fromLogin?: boolean;
  identifier?: string;
};

export default function UnnasignedStudentProfileTeacher() {
  const { school_slug } = useParams<{ school_slug: string }>();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  // error & success messages
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [loadingTeacher, setLoadingTeacher] = useState(false);

  // ====== Form state: Guru ======
  const [teacherName, setTeacherName] = useState(""); // user_teacher_name
  const [teacherPhone, setTeacherPhone] = useState(""); // user_teacher_whatsapp_url
  const [teacherField, setTeacherField] = useState(""); // user_teacher_field
  const [teacherExperienceYears, setTeacherExperienceYears] = useState(""); // user_teacher_experience_years (string → int)

  // optional (collapse)
  const [teacherGender, setTeacherGender] = useState<"male" | "female" | "">(
    ""
  ); // user_teacher_gender
  const [teacherCity, setTeacherCity] = useState(""); // user_teacher_city
  const [teacherShortBio, setTeacherShortBio] = useState(""); // user_teacher_short_bio
  const [teacherEducation, setTeacherEducation] = useState(""); // user_teacher_education
  const [teacherActivity, setTeacherActivity] = useState(""); // user_teacher_activity
  const [teacherInstagram, setTeacherInstagram] = useState(""); // user_teacher_instagram_url

  // Nama sekolah dari slug (mirip di login)
  const schoolTitle = useMemo(() => {
    if (!school_slug) return "Madinah Salam";

    const parts = school_slug
      .split(/[-_]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length === 0) return "Madinah Salam";

    return parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }, [school_slug]);

  async function handleSubmitTeacher(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoadingTeacher(true);

    try {
      const slug = school_slug?.trim();
      if (!slug) throw new Error("school_slug tidak ditemukan.");

      await api.post(`/${slug}/user/pendaftaran/teacher`, {
        // mapping ke user_teachers
        name: teacherName, // user_teacher_name
        whatsapp: teacherPhone || null, // user_teacher_whatsapp_url
        field: teacherField || null, // user_teacher_field
        experience_years: teacherExperienceYears
          ? Number(teacherExperienceYears)
          : null, // user_teacher_experience_years
        gender: teacherGender || null, // user_teacher_gender
        city: teacherCity || null, // user_teacher_city
        short_bio: teacherShortBio || null, // user_teacher_short_bio
        education: teacherEducation || null, // user_teacher_education
        activity: teacherActivity || null, // user_teacher_activity
        instagram_url: teacherInstagram || null, // user_teacher_instagram_url
      });

      setSuccess(
        "Pendaftaran sebagai guru berhasil dikirim. Tunggu konfirmasi dari pihak sekolah."
      );
    } catch (err: any) {
      console.error(err);
      const backendMsg = err?.response?.data?.message as string | undefined;
      setError(
        backendMsg || err?.message || "Gagal mengirim pendaftaran guru."
      );
    } finally {
      setLoadingTeacher(false);
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
              Pendaftaran Guru
            </h1>
            <p className="text-xs text-muted-foreground">
              {schoolTitle} — Daftar sebagai guru / pengajar.
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
            . Pendaftaran ini akan dikaitkan ke akun tersebut.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert error / success */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gagal</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Berhasil</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="border-none bg-card/40">
        <CardHeader>
          <h2 className="text-lg font-semibold">Data pendaftaran guru</h2>
          <p className="text-sm text-muted-foreground">
            Isi data berikut untuk memperkenalkan profil mengajar dan latar
            belakangmu kepada pihak sekolah.
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={handleSubmitTeacher}>
            {/* FIELD PENTING */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="teacher_name">Nama lengkap *</Label>
                <Input
                  id="teacher_name"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="Sesuai identitas"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="teacher_phone">Nomor WA aktif *</Label>
                <Input
                  id="teacher_phone"
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="teacher_field">Bidang keahlian utama *</Label>
                <Input
                  id="teacher_field"
                  value={teacherField}
                  onChange={(e) => setTeacherField(e.target.value)}
                  placeholder="Contoh: Balaghah, Nahwu, Tahfizh, Fiqih, dll."
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="teacher_experience_years">
                  Pengalaman mengajar (tahun) *
                </Label>
                <Input
                  id="teacher_experience_years"
                  type="number"
                  min={0}
                  max={80}
                  value={teacherExperienceYears}
                  onChange={(e) => setTeacherExperienceYears(e.target.value)}
                  placeholder="Contoh: 3"
                  required
                />
              </div>
            </div>

            {/* OPSIONAL (COLLAPSIBLE) */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground mt-2"
                >
                  <span>Data tambahan (opsional)</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="teacher_gender">Jenis kelamin</Label>
                    <Select
                      value={teacherGender}
                      onValueChange={(v: "male" | "female") =>
                        setTeacherGender(v)
                      }
                    >
                      <SelectTrigger id="teacher_gender">
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Laki-laki</SelectItem>
                        <SelectItem value="female">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="teacher_city">Kota / Domisili</Label>
                    <Input
                      id="teacher_city"
                      value={teacherCity}
                      onChange={(e) => setTeacherCity(e.target.value)}
                      placeholder="Contoh: Bandung, Kota"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="teacher_short_bio">
                    Profil singkat / tagline
                  </Label>
                  <Input
                    id="teacher_short_bio"
                    value={teacherShortBio}
                    onChange={(e) => setTeacherShortBio(e.target.value)}
                    placeholder="Contoh: Pengajar Balaghah & Nahwu sejak 2018."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="teacher_education">Pendidikan</Label>
                  <Textarea
                    id="teacher_education"
                    rows={2}
                    value={teacherEducation}
                    onChange={(e) => setTeacherEducation(e.target.value)}
                    placeholder="Contoh: Lulusan LIPIA / Pesantren X, dst."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="teacher_activity">
                    Aktivitas mengajar / dakwah
                  </Label>
                  <Textarea
                    id="teacher_activity"
                    rows={2}
                    value={teacherActivity}
                    onChange={(e) => setTeacherActivity(e.target.value)}
                    placeholder="Contoh: mengajar di kajian A, B, C."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="teacher_instagram">Instagram</Label>
                  <Input
                    id="teacher_instagram"
                    value={teacherInstagram}
                    onChange={(e) => setTeacherInstagram(e.target.value)}
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <CardFooter className="px-0 pt-4">
              <Button
                type="submit"
                disabled={
                  loadingTeacher ||
                  !teacherName ||
                  !teacherPhone ||
                  !teacherField ||
                  !teacherExperienceYears
                }
                className="w-full sm:w-auto ring-inset"
              >
                {loadingTeacher
                  ? "Mengirim..."
                  : "Kirim pendaftaran sebagai Guru"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
