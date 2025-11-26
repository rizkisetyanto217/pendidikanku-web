// src/pages/dashboard/unnasigned/teachers/profiles/UnnasignedTeacherProfile.tsx
import { useMemo, useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom"; // ⬅️ tambahkan useNavigate
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

type UserTeacherResponse = {
  user_teacher_id: string;
  user_teacher_user_id: string;

  user_teacher_name_snapshot?: string;
  user_teacher_field?: string;
  user_teacher_short_bio?: string;
  user_teacher_long_bio?: string;
  user_teacher_greeting?: string;
  user_teacher_education?: string;
  user_teacher_activity?: string;
  user_teacher_gender?: string; // "male" | "female" | ""
  user_teacher_location?: string;
  user_teacher_city?: string;
  user_teacher_instagram_url?: string;
  user_teacher_whatsapp_url?: string;
  user_teacher_youtube_url?: string;
  user_teacher_linkedin_url?: string;
  user_teacher_github_url?: string;
  user_teacher_telegram_username?: string;
  user_teacher_title_prefix?: string;
  user_teacher_title_suffix?: string;
  user_teacher_avatar_url?: string;
  user_teacher_avatar_object_key?: string;
  user_teacher_avatar_url_old?: string;
  user_teacher_avatar_object_key_old?: string;
  user_teacher_is_verified?: boolean;
  user_teacher_is_active?: boolean;
  user_teacher_is_completed?: boolean;
  user_teacher_created_at?: string;
  user_teacher_updated_at?: string;
};

// helper: konversi nomor ke URL WA (biar konsisten dengan student)
function toWhatsappUrl(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  // 08xxxxxxxxx → 62xxxxxxxxx
  if (digits.startsWith("0")) {
    return `https://wa.me/62${digits.slice(1)}`;
  }
  // 62xxxxxxxxx → oke
  if (digits.startsWith("62")) {
    return `https://wa.me/${digits}`;
  }
  // fallback: langsung pakai digits
  return `https://wa.me/${digits}`;
}

// helper: dari URL WA → nomor lokal (08xxxx)
function fromWhatsappUrl(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname !== "wa.me") return url; // bukan pattern standar
    const path = u.pathname.replace(/\//g, ""); // "62xxxx"
    if (!path) return "";
    if (path.startsWith("62")) {
      return "0" + path.slice(2);
    }
    return path;
  } catch {
    return url;
  }
}

export default function UnnasignedTeacherProfile() {
  const { school_slug } = useParams<{ school_slug: string }>();
  const location = useLocation();
  const navigate = useNavigate(); // ⬅️ inisialisasi
  const state = (location.state || {}) as LocationState;

  // 🔍 mode khusus: kalau URL mengandung "-new"
  const isNewFlow = location.pathname.includes("profil-new");

  // error & success messages
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [loadingTeacher, setLoadingTeacher] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // ====== Form state: Guru ======
  const [teacherName, setTeacherName] = useState(""); // user_teacher_name_snapshot
  const [teacherTitlePrefix, setTeacherTitlePrefix] = useState(""); // user_teacher_title_prefix
  const [teacherTitleSuffix, setTeacherTitleSuffix] = useState(""); // user_teacher_title_suffix
  const [teacherPhone, setTeacherPhone] = useState(""); // nomor WA (nanti dikonversi ke URL)
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

  // Avatar guru (mirip murid)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Nama sekolah dari slug (mirip di login & student)
  const schoolTitle = useMemo(() => {
    if (!school_slug) return "Madinah Salam";

    const parts = school_slug
      .split(/[-_]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length === 0) return "Madinah Salam";

    return parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }, [school_slug]);

  // handle perubahan file avatar
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  // 🔄 Fetch user_teachers awal (prefill)
  useEffect(() => {
    let isMounted = true;

    async function fetchUserTeacher() {
      setLoadingInitial(true);
      try {
        const res = await api.get<{
          success: boolean;
          message: string;
          data: any;
        }>("/u/user-teachers");

        if (!isMounted) return;

        const raw = res.data?.data;
        if (!raw) return;

        // support 2 bentuk:
        // 1) { data: { ...fields } }
        // 2) { data: { item: { ...fields }, meta: {...} } }
        const item: UserTeacherResponse =
          (raw.item as UserTeacherResponse) || (raw as UserTeacherResponse);

        if (!item) return;

        if (item.user_teacher_name_snapshot) {
          setTeacherName(item.user_teacher_name_snapshot);
        }

        if (item.user_teacher_title_prefix) {
          setTeacherTitlePrefix(item.user_teacher_title_prefix);
        }

        if (item.user_teacher_title_suffix) {
          setTeacherTitleSuffix(item.user_teacher_title_suffix);
        }

        if (
          item.user_teacher_gender === "male" ||
          item.user_teacher_gender === "female"
        ) {
          setTeacherGender(item.user_teacher_gender);
        }

        if (item.user_teacher_city) {
          setTeacherCity(item.user_teacher_city);
        }

        if (item.user_teacher_field) {
          setTeacherField(item.user_teacher_field);
        }

        if (item.user_teacher_short_bio) {
          setTeacherShortBio(item.user_teacher_short_bio);
        }

        if (item.user_teacher_education) {
          setTeacherEducation(item.user_teacher_education);
        }

        if (item.user_teacher_activity) {
          setTeacherActivity(item.user_teacher_activity);
        }

        if (item.user_teacher_instagram_url) {
          setTeacherInstagram(item.user_teacher_instagram_url);
        }

        if (item.user_teacher_whatsapp_url) {
          setTeacherPhone(fromWhatsappUrl(item.user_teacher_whatsapp_url));
        }

        if (item.user_teacher_avatar_url) {
          setAvatarPreview(item.user_teacher_avatar_url);
        }
      } catch (err) {
        console.warn(
          "[UnnasignedTeacherProfile] gagal fetch /u/user-teachers",
          err
        );
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    }

    fetchUserTeacher();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmitTeacher(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoadingTeacher(true);

    try {
      // konversi nomor WA ke URL (https://wa.me/...)
      const waUrl = teacherPhone ? toWhatsappUrl(teacherPhone) : null;

      // === siapkan FormData (multipart) ===
      const formData = new FormData();

      // payload JSON, disesuaikan dengan UpdateUserTeacherRequest / DTO backend
      const payload = {
        // mapping ke user_teachers / DTO backend
        user_teacher_name_snapshot: teacherName || null,
        user_teacher_title_prefix: teacherTitlePrefix || null,
        user_teacher_title_suffix: teacherTitleSuffix || null,
        user_teacher_whatsapp_url: waUrl,

        user_teacher_field: teacherField || null,
        user_teacher_experience_years: teacherExperienceYears
          ? Number(teacherExperienceYears)
          : null,

        user_teacher_gender: teacherGender || null,
        user_teacher_city: teacherCity || null,
        user_teacher_short_bio: teacherShortBio || null,
        user_teacher_education: teacherEducation || null,
        user_teacher_activity: teacherActivity || null,
        user_teacher_instagram_url: teacherInstagram || null,
      };

      // backend PatchMe baca field "payload" (JSON string) sama persis seperti profile
      formData.append("payload", JSON.stringify(payload));

      // file avatar (disamakan dengan getImageFormFile di backend, biasanya field "avatar")
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      // ⬅️ ini yang penting: pakai PATCH /u/user-teachers
      await api.patch("/u/user-teachers", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // ✅ Behavior sesuai permintaan:
      // - kalau di /profil-new → redirect ke /user-guru/bergabung
      // - kalau di /profil biasa → cukup tampilkan pesan sukses & stay
      if (isNewFlow) {
        const base = school_slug ? `/${school_slug}` : "";
        navigate(`${base}/user-guru/bergabung`, { replace: true });
      } else {
        setSuccess("Profil guru berhasil diperbarui.");
      }
    } catch (err: any) {
      console.error(err);
      const backendMsg = err?.response?.data?.message as string | undefined;
      setError(backendMsg || err?.message || "Gagal menyimpan profil guru.");
    } finally {
      setLoadingTeacher(false);
    }
  }

  const submitDisabled =
    loadingTeacher ||
    loadingInitial ||
    !teacherName ||
    !teacherPhone ||
    !teacherField ||
    !teacherGender; // gender wajib

  // 🧱 Container: kalau -new → max-width & center (sama seperti student)
  const containerClass = isNewFlow
    ? "w-full max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6"
    : "w-full px-4 md:px-6 lg:px-8 py-8 space-y-6";

  return (
    <div className={containerClass}>
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
            belakangmu kepada pihak sekolah. Nomor WA akan dikonversi otomatis
            menjadi tautan WhatsApp (https://wa.me/...).
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={handleSubmitTeacher}>
            {/* AVATAR + IDENTITAS UTAMA */}
            <div className="grid gap-4 sm:grid-cols-[auto,1fr] items-start">
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Foto guru"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>Foto</span>
                  )}
                </div>

                <input
                  id="teacher_avatar_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  className="text-[11px]"
                  onClick={() =>
                    document.getElementById("teacher_avatar_upload")?.click()
                  }
                >
                  Pilih / ganti foto
                </Button>
                <p className="text-[10px] text-muted-foreground text-center max-w-[160px]">
                  Format JPG/PNG, maksimal sekitar 2MB.
                </p>
              </div>

              <div className="space-y-3">
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

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="teacher_title_prefix">Gelar depan</Label>
                    <Input
                      id="teacher_title_prefix"
                      value={teacherTitlePrefix}
                      onChange={(e) => setTeacherTitlePrefix(e.target.value)}
                      placeholder="Contoh: Ustadz, Dr."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="teacher_title_suffix">Gelar belakang</Label>
                    <Input
                      id="teacher_title_suffix"
                      value={teacherTitleSuffix}
                      onChange={(e) => setTeacherTitleSuffix(e.target.value)}
                      placeholder="Contoh: Lc, MA"
                    />
                  </div>
                </div>

                {/* JENIS KELAMIN - WAJIB & DIPINDAH KE ATAS */}
                <div className="space-y-1.5">
                  <Label htmlFor="teacher_gender">Jenis kelamin *</Label>
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
                  <Label htmlFor="teacher_phone">Nomor WA aktif *</Label>
                  <Input
                    id="teacher_phone"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Nomor ini akan dikonversi otomatis ke tautan WhatsApp
                    (https://wa.me/...). Pastikan nomor benar.
                  </p>
                </div>
              </div>
            </div>

            {/* FIELD PENTING LAINNYA */}
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
                {/* Experience years + kota sekarang opsional */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="teacher_experience_years">
                      Pengalaman mengajar (tahun)
                    </Label>
                    <Input
                      id="teacher_experience_years"
                      type="number"
                      min={0}
                      max={80}
                      value={teacherExperienceYears}
                      onChange={(e) =>
                        setTeacherExperienceYears(e.target.value)
                      }
                      placeholder="Contoh: 3"
                    />
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

            <CardFooter className="px-0 pt-4 justify-end">
              <Button
                type="submit"
                disabled={submitDisabled}
                className="w-full sm:w-auto ring-inset"
              >
                {loadingTeacher || loadingInitial
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