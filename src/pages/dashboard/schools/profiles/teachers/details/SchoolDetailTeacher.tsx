// src/pages/school/CSchoolDetailTeacher.tsx
/* ================= Imports ================= */
import { useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* lucide icons */
import {
  ArrowLeft,
  Mail,
  Phone,
  User2,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock3,
  BadgeInfo,
  Link as LinkIcon,
} from "lucide-react";

/* Tambahan untuk breadcrumb sistem dashboard */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* ===== shadcn/ui ===== */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

/* ================= Types (gabungan model & snapshot) ================= */
type GenderLP = "L" | "P";
type Gender = "male" | "female";
type Employment =
  | "tetap"
  | "kontrak"
  | "paruh_waktu"
  | "magang"
  | "honorer"
  | "relawan"
  | "tamu";

interface TeacherSectionItem {
  class_section_id: string;
  role: "homeroom" | "teacher" | "assistant" | string;
  is_active: boolean;

  from?: string; // "YYYY-MM-DD"
  to?: string;

  class_section_name?: string;
  class_section_slug?: string;

  class_section_image_url?: string;
  class_section_image_object_key?: string;

  class_section_class_parent_id?: string;
  class_section_class_parent_name?: string;
  class_section_class_parent_slug?: string;
  class_section_class_parent_level?: number | null;

  total_students?: number;
  total_students_male?: number;
  total_students_female?: number;
  total_students_active?: number;
  total_students_male_active?: number;
  total_students_female_active?: number;
}

interface TeacherCSSTItem {
  csst_id: string;
  is_active: boolean;

  csst_role?: "main" | "assistant" | string;

  from?: string;
  to?: string;

  subject_id?: string;
  class_subject_id?: string;

  subject_name?: string;
  subject_slug?: string;

  class_section_id?: string;
  class_section_name?: string;
  class_section_slug?: string;

  quota_taken?: number;
  total_attendance?: number;
  total_assessments?: number;
  total_students_passed?: number;
  total_assessments_graded?: number;
  total_assessments_ungraded?: number;
}

/* Sertifikat dari user_teacher */
interface TeacherCertificateItem {
  year?: number;
  title?: string;
}

/* Detail teacher yang kita tampilkan (snapshot + profile ringkas) */
interface TeacherDetail {
  // PK & scope
  school_teacher_id: string;
  school_teacher_school_id: string;

  // Identitas/Kepegawaian
  school_teacher_code?: string | null;
  school_teacher_slug?: string | null;
  school_teacher_employment?: Employment | null;
  school_teacher_is_active: boolean;

  // Periode kerja
  school_teacher_joined_at?: string | null; // YYYY-MM-DD / ISO
  school_teacher_left_at?: string | null; // YYYY-MM-DD / ISO

  // Verifikasi
  school_teacher_is_verified: boolean;
  school_teacher_verified_at?: string | null;

  // Visibilitas & Catatan
  school_teacher_is_public: boolean;
  school_teacher_notes?: string | null;

  // Snapshot dari user_teachers
  school_teacher_user_teacher_name_snapshot?: string | null;
  school_teacher_user_teacher_avatar_url_snapshot?: string | null;
  school_teacher_user_teacher_whatsapp_url_snapshot?: string | null;
  school_teacher_user_teacher_title_prefix_snapshot?: string | null;
  school_teacher_user_teacher_title_suffix_snapshot?: string | null;

  // Snapshot sekolah
  school_teacher_school_name_snapshot?: string | null;
  school_teacher_school_slug_snapshot?: string | null;
  school_teacher_school_logo_url_snapshot?: string | null;

  // JSONB
  school_teacher_sections: TeacherSectionItem[];
  school_teacher_csst: TeacherCSSTItem[];

  // ====== Tambahan dari user_profiles / user_teacher ======
  profile_gender?: Gender | null;
  profile_phone?: string | null;
  profile_email?: string | null;
  profile_bio_short?: string | null;
  profile_instagram_url?: string | null;
  profile_whatsapp_url?: string | null;
  profile_linkedin_url?: string | null;
  profile_github_url?: string | null;

  // Field populer (row "NIP", "Subject")
  nip?: string | null;
  default_subject?: string | null;

  // Profil lengkap guru (user_teacher)
  teacher_field?: string | null;
  teacher_long_bio?: string | null;
  teacher_greeting?: string | null;
  teacher_education?: string | null;
  teacher_activity?: string | null;
  teacher_experience_years?: number | null;
  teacher_location?: string | null;
  teacher_city?: string | null;
  teacher_specialties?: string[] | null;
  teacher_certificates?: TeacherCertificateItem[] | null;
  teacher_youtube_url?: string | null;
  teacher_telegram_username?: string | null;

  // Agregat
  total_class_sections?: number | null;
  total_csst?: number | null;
  total_class_sections_active?: number | null;
  total_csst_active?: number | null;
}

/* ================= Helpers ================= */
const genderLabel = (g?: Gender | GenderLP | null) =>
  g === "male" || g === "L"
    ? "Laki-laki"
    : g === "female" || g === "P"
      ? "Perempuan"
      : "-";

const toDateLong = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    : "-";

const empBadge = (e?: Employment | null) => {
  switch (e) {
    case "tetap":
      return {
        label: "Tetap",
        className: "bg-green-600 text-white hover:bg-green-600",
      };
    case "kontrak":
      return {
        label: "Kontrak",
        className: "bg-blue-600 text-white hover:bg-blue-600",
      };
    case "paruh_waktu":
      return {
        label: "Paruh Waktu",
        className: "bg-emerald-600 text-white hover:bg-emerald-600",
      };
    case "magang":
      return {
        label: "Magang",
        className: "bg-teal-600 text-white hover:bg-teal-600",
      };
    case "honorer":
      return {
        label: "Honorer",
        className: "bg-yellow-500 text-black hover:bg-yellow-500",
      };
    case "relawan":
      return {
        label: "Relawan",
        className: "bg-lime-600 text-white hover:bg-lime-600",
      };
    case "tamu":
      return {
        label: "Tamu",
        className: "bg-slate-600 text-white hover:bg-slate-600",
      };
    default:
      return {
        label: "—",
        className: "bg-secondary text-secondary-foreground",
      };
  }
};

const statusBadgeClass = (active: boolean) =>
  active
    ? "bg-green-600 text-white hover:bg-green-600"
    : "bg-slate-400 text-white hover:bg-slate-400";

const initials = (name?: string | null) =>
  (name || "Guru")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const isUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

const formatExperience = (years?: number | null) => {
  if (years == null) return "-";
  if (years === 0) return "Baru mulai";
  if (years === 1) return "1 tahun";
  return `${years} tahun`;
};

const formatLocation = (city?: string | null, loc?: string | null) => {
  if (city && loc) return `${city}, ${loc}`;
  if (city) return city;
  if (loc) return loc;
  return "-";
};

const formatStatNumber = (n?: number | null) =>
  typeof n === "number" ? n.toString() : "-";

/* ================= Component ================= */

const SchoolDetailTeacher: React.FC = () => {
  // id di route bisa berupa UUID atau slug
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  /* Atur breadcrumb dan title */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Detail Guru",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "profil" },
        { label: "guru", href: "profil/guru" },
        { label: "Detail" },
      ],
      showBack: true,
    });
  }, [setHeader]);

  // Fetch detail dari list endpoint (pakai filter id/slug)
  const { data: resp } = useQuery({
    queryKey: ["school-teacher-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const params: Record<string, any> = {
        include: "user_teachers",
        per_page: 1,
      };

      if (id) {
        if (isUUID(id)) {
          params.school_teacher_id = id;
        } else {
          params.school_teacher_slug = id;
        }
      }

      const res = await axios.get("/api/u/school-teachers/list", { params });
      return res.data as {
        success: boolean;
        message: string;
        data: any[];
        pagination: any;
      };
    },
  });

  // Mapping API -> TeacherDetail (atau undefined kalau nggak ada)
  const detail: TeacherDetail | undefined = useMemo(() => {
    if (!resp || !Array.isArray(resp.data) || resp.data.length === 0) {
      return undefined;
    }

    const list = resp.data as any[];

    // Kalau backend belum filter, cari manual by id/slug/code
    let t: any = list[0];
    if (id) {
      t =
        list.find(
          (x) =>
            x.school_teacher_id === id ||
            x.school_teacher_slug === id ||
            x.school_teacher_code === id
        ) ?? t;
    }

    if (!t) return undefined;

    const ut = t.user_teacher || {};

    // Ambil subject default dari CSST pertama (kalau ada)
    let defaultSubject: string | null = null;
    if (Array.isArray(t.school_teacher_csst) && t.school_teacher_csst.length) {
      defaultSubject =
        t.school_teacher_csst[0]
          .class_section_subject_teacher_subject_name_cache ?? null;
    }

    // Derive phone dari whatsapp_url (kalau mau)
    const rawWaUrl: string | undefined =
      t.school_teacher_user_teacher_whatsapp_url_cache ||
      ut.user_teacher_whatsapp_url ||
      undefined;
    const derivedPhone =
      rawWaUrl && rawWaUrl.includes("wa.me")
        ? rawWaUrl.replace(/\D/g, "") || null
        : null;

    const sections: TeacherSectionItem[] = Array.isArray(
      t.school_teacher_sections
    )
      ? t.school_teacher_sections.map(
        (s: any): TeacherSectionItem => ({
          class_section_id: s.class_section_id,
          role: s.class_section_role,
          is_active: !!s.class_section_is_active,
          from: s.class_section_from || undefined,
          to: s.class_section_to || undefined,
          class_section_name: s.class_section_name,
          class_section_slug: s.class_section_slug,
          class_section_image_url: s.class_section_image_url,
          class_section_image_object_key: s.class_section_image_object_key,

          class_section_class_parent_id: s.class_section_class_parent_id,
          class_section_class_parent_name:
            s.class_section_class_parent_name_cache,
          class_section_class_parent_slug:
            s.class_section_class_parent_slug_cache,
          class_section_class_parent_level:
            s.class_section_class_parent_level_cache,

          total_students: s.class_section_total_students_active ?? undefined,
          total_students_male:
            s.class_section_total_students_male ?? undefined,
          total_students_female:
            s.class_section_total_students_female ?? undefined,
          total_students_active:
            s.class_section_total_students_active ?? undefined,
          total_students_male_active:
            s.class_section_total_students_male_active ?? undefined,
          total_students_female_active:
            s.class_section_total_students_female_active ?? undefined,
        })
      )
      : [];

    const csst: TeacherCSSTItem[] = Array.isArray(t.school_teacher_csst)
      ? t.school_teacher_csst.map(
        (c: any): TeacherCSSTItem => ({
          csst_id: c.class_section_subject_teacher_id,
          is_active: !!c.class_section_subject_teacher_is_active,
          csst_role: c.class_section_subject_teacher_role,
          from: c.class_section_subject_teacher_from || undefined,
          to: c.class_section_subject_teacher_to || undefined,

          subject_id: c.class_section_subject_teacher_subject_id,
          class_subject_id: c.class_section_subject_teacher_class_subject_id,

          subject_name:
            c.class_section_subject_teacher_subject_name_cache || undefined,
          subject_slug:
            c.class_section_subject_teacher_subject_slug_cache || undefined,

          class_section_id: c.class_section_id,
          class_section_name: c.class_section_name,
          class_section_slug: c.class_section_slug,

          quota_taken: c.class_section_subject_teacher_quota_taken,
          total_attendance: c.class_section_subject_teacher_total_attendance,
          total_assessments:
            c.class_section_subject_teacher_total_assessments,
          total_students_passed:
            c.class_section_subject_teacher_total_students_passed,
          total_assessments_graded:
            c.class_section_subject_teacher_total_assessments_graded,
          total_assessments_ungraded:
            c.class_section_subject_teacher_total_assessments_ungraded,
        })
      )
      : [];

    const teacherSpecialties: string[] | null = Array.isArray(
      ut.user_teacher_specialties
    )
      ? ut.user_teacher_specialties
      : null;

    const teacherCertificates: TeacherCertificateItem[] | null = Array.isArray(
      ut.user_teacher_certificates
    )
      ? ut.user_teacher_certificates
      : null;

    return {
      school_teacher_id: t.school_teacher_id,
      school_teacher_school_id: t.school_teacher_school_id,

      school_teacher_code: t.school_teacher_code,
      school_teacher_slug: t.school_teacher_slug,
      school_teacher_employment: t.school_teacher_employment,
      school_teacher_is_active: !!t.school_teacher_is_active,

      school_teacher_joined_at: t.school_teacher_joined_at,
      school_teacher_left_at: t.school_teacher_left_at,

      school_teacher_is_verified: !!t.school_teacher_is_verified,
      school_teacher_verified_at: t.school_teacher_verified_at,

      school_teacher_is_public: !!t.school_teacher_is_public,
      school_teacher_notes: t.school_teacher_notes,

      school_teacher_user_teacher_name_snapshot:
        t.school_teacher_user_teacher_full_name_cache ||
        ut.user_teacheru_user_full_name_cache ||
        ut.user_teacher_full_name ||
        ut.user_teacher_name,

      school_teacher_user_teacher_avatar_url_snapshot:
        t.school_teacher_user_teacher_avatar_url_cache ||
        ut.user_teacher_avatar_url,

      school_teacher_user_teacher_whatsapp_url_snapshot: rawWaUrl || null,

      school_teacher_user_teacher_title_prefix_snapshot:
        t.school_teacher_user_teacher_title_prefix_cache ||
        ut.user_teacher_title_prefix,

      school_teacher_user_teacher_title_suffix_snapshot:
        t.school_teacher_user_teacher_title_suffix_cache ||
        ut.user_teacher_title_suffix,

      // Snapshot sekolah: belum ada di response contoh, biarkan null dulu (siap kalau nanti ada)
      school_teacher_school_name_snapshot:
        t.school_teacher_school_name_snapshot || null,
      school_teacher_school_slug_snapshot:
        t.school_teacher_school_slug_snapshot || null,
      school_teacher_school_logo_url_snapshot:
        t.school_teacher_school_logo_url_snapshot || null,

      school_teacher_sections: sections,
      school_teacher_csst: csst,

      profile_gender: ut.user_teacher_gender ?? null,
      profile_phone: derivedPhone,
      profile_email: ut.user_teacher_email ?? null,
      profile_bio_short: ut.user_teacher_short_bio ?? null,
      profile_instagram_url: ut.user_teacher_instagram_url ?? null,
      profile_whatsapp_url: ut.user_teacher_whatsapp_url ?? null,
      profile_linkedin_url: ut.user_teacher_linkedin_url ?? null,
      profile_github_url: ut.user_teacher_github_url ?? null,

      nip: ut.user_teacher_nip ?? null,
      default_subject: defaultSubject,

      teacher_field: ut.user_teacher_field ?? null,
      teacher_long_bio: ut.user_teacher_long_bio ?? null,
      teacher_greeting: ut.user_teacher_greeting ?? null,
      teacher_education: ut.user_teacher_education ?? null,
      teacher_activity: ut.user_teacher_activity ?? null,
      teacher_experience_years: ut.user_teacher_experience_years ?? null,
      teacher_location: ut.user_teacher_location ?? null,
      teacher_city: ut.user_teacher_city ?? null,
      teacher_specialties: teacherSpecialties,
      teacher_certificates: teacherCertificates,
      teacher_youtube_url: ut.user_teacher_youtube_url ?? null,
      teacher_telegram_username: ut.user_teacher_telegram_username ?? null,

      total_class_sections: t.school_teacher_total_class_sections ?? null,
      total_csst: t.school_teacher_total_class_section_subject_teachers ?? null,
      total_class_sections_active:
        t.school_teacher_total_class_sections_active ?? null,
      total_csst_active:
        t.school_teacher_total_class_section_subject_teachers_active ?? null,
    };
  }, [resp, id]);

  const prefix = detail?.school_teacher_user_teacher_title_prefix_snapshot
    ?.trim()
    .trim();
  const suffix = detail?.school_teacher_user_teacher_title_suffix_snapshot
    ?.trim()
    .trim();
  const name = detail?.school_teacher_user_teacher_name_snapshot?.trim() || "-";

  const emp = empBadge(detail?.school_teacher_employment ?? null);
  const isActive = !!detail?.school_teacher_is_active;

  const waHref =
    detail?.school_teacher_user_teacher_whatsapp_url_snapshot ||
    detail?.profile_whatsapp_url ||
    (detail?.profile_phone
      ? `https://wa.me/${detail.profile_phone.replace(/\D/g, "")}`
      : undefined);

  return (
    <TooltipProvider>
      <div className="w-full bg-background text-foreground">
        {/* Header */}
        <header className="w-full bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="max-w-screen-2xl mx-auto h-14 flex items-center justify-between">
            <div className="md:flex hidden gap-3 items-center">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="icon"
                className="cursor-pointer self-start"
              >
                <ArrowLeft size={20} />
              </Button>
              <h1 className="font-semibold text-lg md:text-xl">Detail Guru</h1>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="w-full">
          <div className="max-w-screen-2xl mx-auto grid lg:grid-cols-3 gap-6">
            {/* Left: Profile Card */}
            <Card className="lg:col-span-1 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/25 via-accent/20 to-secondary/40" />
              <CardContent className="-mt-10">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="size-20 ring-2 ring-white shadow -mt-6">
                    <AvatarImage
                      src={
                        detail?.school_teacher_user_teacher_avatar_url_snapshot ||
                        ""
                      }
                      alt={name}
                    />
                    <AvatarFallback>{initials(name)}</AvatarFallback>
                  </Avatar>
                  <div className="mt-3">
                    <h2 className="text-xl font-semibold">
                      {prefix ? `${prefix} ` : ""}
                      {name}
                      {suffix ? `, ${suffix}` : ""}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {detail?.teacher_field || detail?.default_subject || "-"}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <Badge className={emp.className}>{emp.label}</Badge>
                    <Badge className={statusBadgeClass(isActive)}>
                      {isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                    {detail?.school_teacher_is_verified ? (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        <CheckCircle2 className="mr-1 size-3.5" />
                        Terverifikasi
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-500 text-white hover:bg-slate-500">
                        <XCircle className="mr-1 size-3.5" />
                        Belum Verifikasi
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {detail?.profile_phone && (
                      <Button asChild size="sm" variant="outline">
                        <a href={`tel:${detail.profile_phone}`}>
                          <Phone className="mr-2 size-4" />
                          Telepon
                        </a>
                      </Button>
                    )}
                    {waHref && (
                      <Button
                        asChild
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <a href={waHref} target="_blank" rel="noreferrer">
                          <User2 className="mr-2 size-4" />
                          WhatsApp
                        </a>
                      </Button>
                    )}
                    {detail?.profile_email && (
                      <Button asChild size="sm" variant="secondary">
                        <a href={`mailto:${detail.profile_email}`}>
                          <Mail className="mr-2 size-4" />
                          Email
                        </a>
                      </Button>
                    )}
                    {detail?.teacher_youtube_url && (
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={detail.teacher_youtube_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <LinkIcon className="mr-2 size-4" />
                          YouTube
                        </a>
                      </Button>
                    )}
                  </div>

                  {detail?.teacher_greeting && (
                    <p className="mt-4 text-sm font-medium">
                      {detail.teacher_greeting}
                    </p>
                  )}

                  {detail?.profile_bio_short && (
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed px-2">
                      {detail.profile_bio_short}
                    </p>
                  )}

                  {detail?.teacher_long_bio && (
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed px-2">
                      {detail.teacher_long_bio}
                    </p>
                  )}

                  <Separator className="my-4" />

                  {/* Meta table compact */}
                  <Table className="text-sm">
                    <TableBody>
                      <MetaRow label="NIP" value={detail?.nip ?? "-"} />
                      <MetaRow
                        label="Gender"
                        value={genderLabel(detail?.profile_gender ?? null)}
                      />
                      <MetaRow
                        label="Lokasi"
                        value={formatLocation(
                          detail?.teacher_city ?? null,
                          detail?.teacher_location ?? null
                        )}
                      />
                      <MetaRow
                        label="Pengalaman"
                        value={formatExperience(
                          detail?.teacher_experience_years ?? null
                        )}
                      />
                      <MetaRow
                        label="Bergabung"
                        value={toDateLong(
                          detail?.school_teacher_joined_at ?? null
                        )}
                        icon={<CalendarDays className="size-3.5" />}
                      />
                      <MetaRow
                        label="Berakhir"
                        value={
                          detail?.school_teacher_left_at
                            ? toDateLong(detail.school_teacher_left_at)
                            : "—"
                        }
                        icon={<Clock3 className="size-3.5" />}
                      />
                    </TableBody>
                  </Table>

                  {/* Socials */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {detail?.profile_instagram_url && (
                      <SocialChip
                        href={detail.profile_instagram_url}
                        label="Instagram"
                      />
                    )}
                    {detail?.profile_linkedin_url && (
                      <SocialChip
                        href={detail.profile_linkedin_url}
                        label="LinkedIn"
                      />
                    )}
                    {detail?.profile_github_url && (
                      <SocialChip
                        href={detail.profile_github_url}
                        label="GitHub"
                      />
                    )}
                    {detail?.teacher_telegram_username && (
                      <SocialChip
                        href={`https://t.me/${detail.teacher_telegram_username}`}
                        label="Telegram"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right: Teaching & Assignments */}
            <div className="lg:col-span-2 space-y-6">
              {/* About & Notes */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BadgeInfo className="size-4" />
                    Tentang Guru & Catatan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Sekolah</div>
                      <div className="flex items-center gap-2">
                        {detail?.school_teacher_school_logo_url_snapshot ? (
                          <img
                            src={detail.school_teacher_school_logo_url_snapshot}
                            alt="logo"
                            className="size-6 rounded-sm"
                          />
                        ) : null}
                        <span className="font-medium">
                          {detail?.school_teacher_school_name_snapshot || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Slug Guru</div>
                      <div className="font-medium">
                        {detail?.school_teacher_slug || "-"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Bidang</div>
                      <div className="font-normal">
                        {detail?.teacher_field ||
                          detail?.default_subject ||
                          "-"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Aktivitas</div>
                      <div className="font-normal">
                        {detail?.teacher_activity || "—"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Pendidikan</div>
                      <div className="font-normal whitespace-pre-line">
                        {detail?.teacher_education || "—"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Status Publik</div>
                      <div className="font-normal">
                        {detail?.school_teacher_is_public
                          ? "Ditampilkan ke publik"
                          : "Hanya internal sekolah"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Catatan</div>
                    <div className="font-normal">
                      {detail?.school_teacher_notes || "—"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistik Mengajar */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Statistik Mengajar
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">
                        Total Section
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        {formatStatNumber(detail?.total_class_sections)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Aktif:{" "}
                        {formatStatNumber(detail?.total_class_sections_active)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">
                        Total CSST
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        {formatStatNumber(detail?.total_csst)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Aktif: {formatStatNumber(detail?.total_csst_active)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">
                        Mapel aktif
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        {detail?.school_teacher_csst?.filter((c) => c.is_active)
                          .length ?? 0}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Berdasarkan CSST
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">
                        Section wali kelas
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        {detail?.school_teacher_sections?.filter(
                          (s) => s.role === "homeroom"
                        ).length ?? 0}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Per tahun ajaran
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Spesialisasi & Sertifikat */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Spesialisasi & Sertifikat
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-1 space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5">
                      Spesialisasi
                    </div>
                    {detail?.teacher_specialties &&
                      detail.teacher_specialties.length ? (
                      <div className="flex flex-wrap gap-2">
                        {detail.teacher_specialties.map((sp) => (
                          <Badge key={sp} variant="outline" className="text-xs">
                            {sp}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Belum ada data spesialisasi.
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5">
                      Sertifikat
                    </div>
                    {detail?.teacher_certificates &&
                      detail.teacher_certificates.length ? (
                      <ul className="space-y-1.5 text-sm">
                        {detail.teacher_certificates.map((c, idx) => (
                          <li
                            key={`${c.title}-${c.year}-${idx}`}
                            className="flex items-center gap-2"
                          >
                            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary/70" />
                            <span className="font-medium">
                              {c.title || "-"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {c.year || ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Belum ada data sertifikat.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sections (Homeroom / Mengajar) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Kelas (Sections)</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {detail?.school_teacher_sections?.length ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {detail.school_teacher_sections.map((s) => {
                        const roleLabel =
                          s.role === "homeroom"
                            ? "Wali Kelas"
                            : s.role === "assistant"
                              ? "Asisten"
                              : "Pengajar";

                        const parentLabel =
                          s.class_section_class_parent_name ||
                          s.class_section_class_parent_slug ||
                          "";

                        const studentsTotal =
                          s.total_students ??
                          s.total_students_active ??
                          s.total_students_male_active ??
                          s.total_students_female_active ??
                          undefined;

                        const studentsDesc =
                          studentsTotal != null
                            ? `Siswa: ${studentsTotal}${s.total_students_active != null &&
                              s.total_students_active !== studentsTotal
                              ? ` (aktif ${s.total_students_active})`
                              : ""
                            }`
                            : undefined;

                        const metaLeft =
                          s.from || s.to
                            ? [
                              s.from ? toDateLong(s.from) : null,
                              s.to ? `s.d. ${toDateLong(s.to)}` : null,
                            ]
                              .filter(Boolean)
                              .join(" • ")
                            : undefined;

                        const metaRight = studentsDesc;

                        return (
                          <ChipCard
                            key={s.class_section_id}
                            title={
                              s.class_section_name ||
                              s.class_section_slug ||
                              s.class_section_id
                            }
                            subtitle={
                              parentLabel
                                ? `${parentLabel} • ${roleLabel}`
                                : roleLabel
                            }
                            imageUrl={s.class_section_image_url}
                            rightBadge={s.is_active ? "Aktif" : "Nonaktif"}
                            rightBadgeClass={
                              s.is_active ? "bg-green-600" : "bg-slate-500"
                            }
                            metaLeft={metaLeft}
                            metaRight={metaRight}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyNote />
                  )}
                </CardContent>
              </Card>

              {/* CSST (Subject Assignments) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Mata Pelajaran (CSST)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {detail?.school_teacher_csst?.length ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {detail.school_teacher_csst.map((c) => {
                        const metaLeft =
                          c.total_attendance != null ||
                            c.total_assessments != null
                            ? [
                              c.total_attendance != null
                                ? `Pertemuan: ${c.total_attendance}`
                                : null,
                              c.total_assessments != null
                                ? `Penilaian: ${c.total_assessments}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" • ")
                            : undefined;

                        const metaRight =
                          c.total_assessments_graded != null ||
                            c.total_assessments_ungraded != null ||
                            c.total_students_passed != null
                            ? [
                              c.total_assessments_graded != null
                                ? `Nilai masuk: ${c.total_assessments_graded}`
                                : null,
                              c.total_assessments_ungraded != null
                                ? `Belum dinilai: ${c.total_assessments_ungraded}`
                                : null,
                              c.total_students_passed != null
                                ? `Lulus: ${c.total_students_passed}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" • ")
                            : undefined;

                        return (
                          <ChipCard
                            key={c.csst_id}
                            title={
                              c.subject_name ||
                              c.subject_slug ||
                              "Mata Pelajaran"
                            }
                            subtitle={
                              c.class_section_name ||
                              c.class_section_slug ||
                              "—"
                            }
                            icon={<LinkIcon className="size-4" />}
                            rightBadge={c.is_active ? "Aktif" : "Nonaktif"}
                            rightBadgeClass={
                              c.is_active ? "bg-green-600" : "bg-slate-500"
                            }
                            metaLeft={metaLeft}
                            metaRight={metaRight}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyNote />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default SchoolDetailTeacher;

/* ================= Small UI helpers ================= */
function MetaRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <TableRow className="border-0">
      <TableCell className="pl-0 text-muted-foreground w-32">{label}</TableCell>
      <TableCell className="pr-0">
        <span className="inline-flex items-center gap-1.5">
          {icon}
          {value}
        </span>
      </TableCell>
    </TableRow>
  );
}

function SocialChip({ href, label }: { href: string; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-xs px-2 py-1 rounded-full border hover:bg-accent hover:text-accent-foreground transition"
        >
          {label}
        </a>
      </TooltipTrigger>
      <TooltipContent>
        <p>Buka {label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ChipCard({
  title,
  subtitle,
  rightBadge,
  rightBadgeClass,
  imageUrl,
  icon,
  metaLeft,
  metaRight,
}: {
  title: string;
  subtitle?: string;
  rightBadge?: string;
  rightBadgeClass?: string;
  imageUrl?: string;
  icon?: React.ReactNode;
  metaLeft?: string;
  metaRight?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border p-3 hover:bg-muted/50 transition">
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="size-10 rounded-lg object-cover"
          />
        ) : icon ? (
          <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
            {icon}
          </div>
        ) : (
          <div className="size-10 rounded-lg bg-muted" />
        )}
        <div className="min-w-0">
          <div className="font-medium leading-tight truncate">{title}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground truncate">
              {subtitle}
            </div>
          )}
          {(metaLeft || metaRight) && (
            <div className="mt-1 text-[11px] text-muted-foreground">
              {metaLeft || "—"} {metaRight ? `• ${metaRight}` : ""}
            </div>
          )}
        </div>
      </div>
      {rightBadge && (
        <Badge
          className={`text-xs ${rightBadgeClass || "bg-slate-500 text-white"}`}
        >
          {rightBadge}
        </Badge>
      )}
    </div>
  );
}

function EmptyNote() {
  return (
    <div className="text-sm text-muted-foreground flex items-center gap-2">
      <BadgeInfo className="size-4" />
      Belum ada data untuk ditampilkan.
    </div>
  );
}