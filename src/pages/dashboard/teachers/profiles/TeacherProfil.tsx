// src/pages/sekolahislamku/teacher/TeacherProfil.shadcn.tsx
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  MessageCircle,
  Camera,
  BookOpen,
  MapPin,
  GraduationCap,
  Calendar,
  ArrowLeft,
  User,
  Link as LinkIcon,
  Users,
} from "lucide-react";

/* Breadcrumb dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

/* ==========================================
   TYPES
========================================== */

type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

type UserTeacherCertificate = {
  year?: number;
  title?: string;
  [key: string]: any;
};

type UserTeacher = {
  user_teacher_id: string;
  user_teacher_user_id: string;

  user_teacher_name_snapshot: string | null;
  user_teacher_field: string | null;

  user_teacher_short_bio: string | null;
  user_teacher_long_bio: string | null;
  user_teacher_greeting: string | null;

  user_teacher_education: string | null;
  user_teacher_activity: string | null;
  user_teacher_experience_years: number | null;

  user_teacher_gender: string | null; // "male" | "female" | dll
  user_teacher_location: string | null;
  user_teacher_city: string | null;

  user_teacher_specialties: string[] | null;
  user_teacher_certificates: UserTeacherCertificate[] | null;

  user_teacher_instagram_url: string | null;
  user_teacher_whatsapp_url: string | null;
  user_teacher_youtube_url: string | null;
  user_teacher_linkedin_url: string | null;
  user_teacher_github_url: string | null;
  user_teacher_telegram_username: string | null;

  user_teacher_avatar_url: string | null;
  user_teacher_avatar_object_key?: string | null;
  user_teacher_avatar_url_old?: string | null;
  user_teacher_avatar_object_key_old?: string | null;

  user_teacher_title_prefix: string | null;
  user_teacher_title_suffix: string | null;

  user_teacher_is_verified: boolean;
  user_teacher_is_active: boolean;

  user_teacher_created_at: string | null;
  user_teacher_updated_at: string | null;

  user_teacher_deleted_at?: string | null;
  user_teacher_is_completed: boolean;
  user_teacher_completed_at?: string | null;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: UserTeacher;
};

/* ================= Helper kecil ================ */

const getInitials = (name?: string | null) =>
  name
    ? name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    : "U";

const formatGender = (g?: string | null) => {
  if (!g) return "-";
  if (g === "male") return "Laki-laki";
  if (g === "female") return "Perempuan";
  // fallback kalau suatu hari isi lain (L/P, dll)
  if (g === "L") return "Laki-laki";
  if (g === "P") return "Perempuan";
  return g;
};

const formatDate = (s?: string | null) => {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const safe = (v?: string | null, fallback: string = "-") =>
  v && v.trim().length > 0 ? v : fallback;

/* ==========================================
   MAIN COMPONENT
========================================== */
export default function TeacherProfil({ showBack = false, backTo }: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  const { setHeader } = useDashboardHeader();

  useEffect(() => {
    setHeader({
      title: "Profil Guru",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Guru" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState<UserTeacher | null>(null);

  /* ================= FETCH DATA ================= */
  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      console.log("[TeacherProfil] Fetch /api/u/user-teachers ...");

      const res = await api.get<ApiResponse>("/api/u/user-teachers");
      console.log("[TeacherProfil] API response:", res.data);

      const item = res.data?.data ?? null;
      setTeacher(item);

      console.log("[TeacherProfil] mapped teacher =", item);
    } catch (err) {
      console.error("❌ [TeacherProfil] Gagal ambil data guru:", err);
      setTeacher(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  useEffect(() => {
    if (teacher) {
      console.log("[TeacherProfil] teacher state updated:", teacher);
    }
  }, [teacher]);

  /* ================= UI - TAMPIL DATA ================= */
  const renderProfileView = () => {
    if (!teacher) {
      return (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Profil guru belum tersedia.
          </CardContent>
        </Card>
      );
    }

    const fullName = safe(teacher.user_teacher_name_snapshot, "Tanpa nama");
    const field = safe(teacher.user_teacher_field, "Guru / Pengajar");
    const shortBio = safe(
      teacher.user_teacher_short_bio,
      "Belum ada bio singkat."
    );
    const longBioRaw =
      teacher.user_teacher_long_bio || teacher.user_teacher_short_bio;
    const longBio = safe(longBioRaw, "Belum ada deskripsi lengkap.");

    const specs = teacher.user_teacher_specialties ?? [];
    const certs = teacher.user_teacher_certificates ?? [];

    return (
      <div className="w-full flex flex-col space-y-6 min-w-0">
        {/* Top header (di dalam page, selain header dashboard) */}
        <div className="md:flex hidden gap-3 items-center">
          {showBack && (
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"

            >
              <ArrowLeft size={20} />
            </Button>
          )}
          <h1 className="font-semibold text-lg md:text-xl">Profil Guru</h1>
        </div>

        {/* Header Card dengan Avatar */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full grid place-items-center text-white text-2xl font-semibold overflow-hidden bg-primary">
                  {teacher.user_teacher_avatar_url ? (
                    <img
                      src={teacher.user_teacher_avatar_url}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(fullName)
                  )}
                </div>
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 rounded-full shadow-lg"
                  title="Ganti foto (belum aktif)"
                  variant="secondary"
                >
                  <Camera className="size-4" />
                </Button>
              </div>

              {/* Nama & meta */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-xl md:text-2xl truncate flex items-center gap-2">
                      <User className="size-5 text-muted-foreground" />
                      <span>
                        {teacher.user_teacher_title_prefix
                          ? `${teacher.user_teacher_title_prefix} `
                          : ""}
                        {fullName}{" "}
                        {teacher.user_teacher_title_suffix
                          ? teacher.user_teacher_title_suffix
                          : ""}
                      </span>
                    </h2>
                    <p className="text-sm mt-1 text-muted-foreground">
                      {field}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge
                      variant={
                        teacher.user_teacher_is_active ? "default" : "outline"
                      }
                    >
                      {teacher.user_teacher_is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                    <Badge
                      variant={
                        teacher.user_teacher_is_verified ? "default" : "outline"
                      }
                    >
                      {teacher.user_teacher_is_verified
                        ? "Terverifikasi"
                        : "Belum Terverifikasi"}
                    </Badge>
                    <Badge
                      variant={
                        teacher.user_teacher_is_completed
                          ? "default"
                          : "outline"
                      }
                    >
                      {teacher.user_teacher_is_completed
                        ? "Profil Lengkap"
                        : "Belum Lengkap"}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <span>
                      {safe(teacher.user_teacher_city, "Kota belum diisi")}
                      {teacher.user_teacher_location
                        ? `, ${teacher.user_teacher_location}`
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>
                      Dibuat:{" "}
                      {formatDate(teacher.user_teacher_created_at || undefined)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="size-4" />
                    <span>
                      Jenis kelamin: {formatGender(teacher.user_teacher_gender)}
                    </span>
                  </div>
                  {typeof teacher.user_teacher_experience_years ===
                    "number" && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="size-4" />
                        <span>
                          {teacher.user_teacher_experience_years} tahun pengalaman
                          mengajar
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>
            <Separator className="mt-4" />
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {teacher.user_teacher_greeting && (
              <p className="text-sm italic text-muted-foreground">
                “{teacher.user_teacher_greeting}”
              </p>
            )}
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {shortBio}
            </p>
          </CardContent>
        </Card>

        {/* Grid 2 Kolom: Pendidikan & Pengalaman + Spesialisasi/Certificate */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* Informasi Pendidikan & Pengalaman */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl grid place-items-center bg-muted">
                  <GraduationCap className="size-4" />
                </div>
                <CardTitle className="text-base">
                  Pendidikan & Aktivitas
                </CardTitle>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="pt-4 text-sm space-y-3">
              <div className="flex items-start gap-2">
                <GraduationCap className="size-4 mt-0.5 shrink-0 text-primary" />
                <div>
                  <span className="font-medium">Pendidikan: </span>
                  <span className="text-muted-foreground">
                    {safe(teacher.user_teacher_education)}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <BookOpen className="size-4 mt-0.5 shrink-0 text-primary" />
                <div>
                  <span className="font-medium">Kegiatan Mengajar: </span>
                  <span className="text-muted-foreground">
                    {safe(teacher.user_teacher_activity)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spesialisasi & Sertifikat */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl grid place-items-center bg-muted">
                  <Users className="size-4" />
                </div>
                <CardTitle className="text-base">
                  Spesialisasi & Sertifikat
                </CardTitle>
              </div>
              <Separator />
            </CardHeader>
            <CardContent className="pt-4 text-sm space-y-3">
              <div className="space-y-1">
                <div className="font-medium">Spesialisasi</div>
                {specs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {specs.map((sp, idx) => (
                      <Badge key={idx} variant="secondary">
                        {sp}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Belum diisi</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="font-medium">Sertifikat</div>
                {certs.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {certs.map((c, idx) => {
                      if (c && typeof c === "object") {
                        const year = c.year ?? "";
                        const title = c.title ?? JSON.stringify(c);
                        return (
                          <li key={idx}>
                            {year ? `${year} — ` : ""}
                            {title}
                          </li>
                        );
                      }
                      return (
                        <li key={idx}>
                          {typeof c === "string" ? c : JSON.stringify(c)}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Belum diisi</p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tentang (Full Width) */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tentang</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="pt-4">
            <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
              {longBio}
            </p>
          </CardContent>
        </Card>

        {/* Sosial Media & Kontak */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Sosial Media & Kontak</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            <div className="grid gap-2 md:grid-cols-2">
              <SocialRow
                label="WhatsApp"
                icon={<MessageCircle className="size-4" />}
                url={teacher.user_teacher_whatsapp_url}
              />
              <SocialRow
                label="Instagram"
                icon={<LinkIcon className="size-4" />}
                url={teacher.user_teacher_instagram_url}
              />
              <SocialRow
                label="YouTube"
                icon={<LinkIcon className="size-4" />}
                url={teacher.user_teacher_youtube_url}
              />
              <SocialRow
                label="LinkedIn"
                icon={<LinkIcon className="size-4" />}
                url={teacher.user_teacher_linkedin_url}
              />
              <SocialRow
                label="GitHub"
                icon={<LinkIcon className="size-4" />}
                url={teacher.user_teacher_github_url}
              />
              <div className="flex items-center gap-2 text-muted-foreground">
                <LinkIcon className="size-4" />
                <span>
                  Telegram:{" "}
                  {safe(teacher.user_teacher_telegram_username, "Belum diisi")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  /* ================= RENDER FINAL ================= */
  return (
    <main className="w-full">
      <div className="mx-auto">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20 text-muted-foreground">
            Memuat data guru...
          </div>
        ) : (
          renderProfileView()
        )}
      </div>
    </main>
  );
}

/* ================= Komponen kecil ================= */

function SocialRow({
  label,
  icon,
  url,
}: {
  label: string;
  icon: React.ReactNode;
  url?: string | null;
}) {
  if (!url) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}: Belum diisi</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {icon}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline break-all"
      >
        {label}
      </a>
    </div>
  );
}
