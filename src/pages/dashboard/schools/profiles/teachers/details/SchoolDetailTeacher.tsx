// src/pages/school/CSchoolDetailTeacher.tsx
/* ================= Imports ================= */
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
  role: "homeroom" | "teacher" | "assistant";
  is_active: boolean;
  from?: string; // "YYYY-MM-DD"
  to?: string;
  class_section_name?: string;
  class_section_slug?: string;
  class_section_image_url?: string;
  class_section_image_object_key?: string;
}

interface TeacherCSSTItem {
  csst_id: string;
  is_active: boolean;
  from?: string;
  to?: string;
  subject_name?: string;
  subject_slug?: string;
  class_section_id?: string;
  class_section_name?: string;
  class_section_slug?: string;
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
  school_teacher_joined_at?: string | null; // YYYY-MM-DD
  school_teacher_left_at?: string | null; // YYYY-MM-DD

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

  // ====== Tambahan dari user_profiles (opsional untuk tampilan) ======
  profile_gender?: Gender | null;
  profile_phone?: string | null;
  profile_email?: string | null;
  profile_bio_short?: string | null;
  profile_instagram_url?: string | null;
  profile_whatsapp_url?: string | null;
  profile_linkedin_url?: string | null;
  profile_github_url?: string | null;

  // Field populer lokal (untuk row "NIP", "Subject")
  nip?: string | null;
  default_subject?: string | null;
}

/* ================= Dummy 1 data (lengkap & konsisten dengan DB) ================= */
const DUMMY_DETAIL: TeacherDetail = {
  school_teacher_id: "3e5197e0-aaaa-4b2d-bb55-111122223333",
  school_teacher_school_id: "0c864ac5-74f4-4a2a-9f1d-c88b7fb7ad12",

  school_teacher_code: "TCH-2025-001",
  school_teacher_slug: "ust-hendra-saputra",
  school_teacher_employment: "tetap",
  school_teacher_is_active: true,

  school_teacher_joined_at: "2023-07-01",
  school_teacher_left_at: null,

  school_teacher_is_verified: true,
  school_teacher_verified_at: "2024-01-12T08:30:00Z",

  school_teacher_is_public: true,
  school_teacher_notes:
    "Fokus pada penguatan dasar logika bahasa & evaluasi formatif mingguan.",

  school_teacher_user_teacher_name_snapshot: "Ust. Hendra Saputra",
  school_teacher_user_teacher_avatar_url_snapshot:
    "https://i.pravatar.cc/200?img=12",
  school_teacher_user_teacher_whatsapp_url_snapshot:
    "https://wa.me/6281234567890",
  school_teacher_user_teacher_title_prefix_snapshot: "Ust.",
  school_teacher_user_teacher_title_suffix_snapshot: "M.Pd.I",

  school_teacher_school_name_snapshot: "SekolahIslamku",
  school_teacher_school_slug_snapshot: "sekolahislamku",
  school_teacher_school_logo_url_snapshot:
    "https://dummyimage.com/64x64/0f592a/ffffff&text=SI",

  school_teacher_sections: [
    {
      class_section_id: "csec-001",
      role: "homeroom",
      is_active: true,
      from: "2024-07-15",
      class_section_name: "Kelas Balaghoh B",
      class_section_slug: "balaghoh-b",
      class_section_image_url: "https://dummyimage.com/80x80/0f592a/fff&text=B",
    },
    {
      class_section_id: "csec-002",
      role: "teacher",
      is_active: true,
      from: "2025-01-10",
      class_section_name: "Kelas Nahwu 1",
      class_section_slug: "nahwu-1",
    },
  ],
  school_teacher_csst: [
    {
      csst_id: "csst-001",
      is_active: true,
      from: "2024-08-01",
      subject_name: "Ilmu Balaghoh Dasar 1",
      subject_slug: "balaghoh-dasar-1",
      class_section_id: "csec-001",
      class_section_name: "Kelas Balaghoh B",
      class_section_slug: "balaghoh-b",
    },
    {
      csst_id: "csst-002",
      is_active: true,
      from: "2025-02-01",
      subject_name: "Nahwu Dasar",
      subject_slug: "nahwu-dasar",
      class_section_id: "csec-002",
      class_section_name: "Kelas Nahwu 1",
      class_section_slug: "nahwu-1",
    },
  ],

  // ===== profile tambahan (opsional tampilan)
  profile_gender: "male",
  profile_phone: "081234567890",
  profile_email: "ust.hendra@sekolahislamku.sch.id",
  profile_bio_short:
    "Pengajar bahasa Arab dengan fokus Balaghoh & Nahwu. Mengutamakan praktik melalui contoh sederhana dan diskusi.",
  profile_instagram_url: "https://instagram.com/ust_hendra",
  profile_whatsapp_url: "https://wa.me/6281234567890",
  profile_linkedin_url: "https://www.linkedin.com/in/ust-hendra",
  profile_github_url: "https://github.com/ust-hendra",

  nip: "19801212 200501 1 001",
  default_subject: "Ilmu Balaghoh",
};

/* ================= Helpers ================= */
const genderLabel = (g?: Gender | GenderLP | null) =>
  g === "male" || g === "L"
    ? "Laki-laki"
    : g === "female" || g === "P"
    ? "Perempuan"
    : "-";

const hijriWithWeekday = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("id-ID-u-ca-islamic-umalqura", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
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

/* ================= Component ================= */
const SchoolDetailTeacher: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();

  const schoolId = useMemo(() => {
    const u: any = user || {};
    return u.school_id || u.lembaga_id || u?.school?.id || u?.lembaga?.id || "";
  }, [user]);

  // Fetch ringan (opsional) — dipakai kalau endpoint kamu sudah siap
  const { data: resp } = useQuery({
    queryKey: ["school-teacher-detail", schoolId, id],
    enabled: !!schoolId && !!id,
    queryFn: async () => {
      const res = await axios.get("/api/a/school-teachers/by-school", {
        params: schoolId ? { school_id: schoolId } : undefined,
      });
      return res.data;
    },
  });

  // Mapping API -> TeacherDetail (sesuaikan ketika endpoint siap)
  const fromApi: TeacherDetail | undefined = (() => {
    const list = resp?.data?.teachers as any[] | undefined;
    if (!list || !id) return undefined;
    const t = list.find((x) => x.school_teacher_id === id || x.id === id);
    if (!t) return undefined;
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
        t.school_teacher_user_teacher_name_snapshot || t.user_name,
      school_teacher_user_teacher_avatar_url_snapshot:
        t.school_teacher_user_teacher_avatar_url_snapshot || t.avatar_url,
      school_teacher_user_teacher_whatsapp_url_snapshot:
        t.school_teacher_user_teacher_whatsapp_url_snapshot || t.whatsapp_url,
      school_teacher_user_teacher_title_prefix_snapshot:
        t.school_teacher_user_teacher_title_prefix_snapshot,
      school_teacher_user_teacher_title_suffix_snapshot:
        t.school_teacher_user_teacher_title_suffix_snapshot,

      school_teacher_school_name_snapshot:
        t.school_teacher_school_name_snapshot,
      school_teacher_school_slug_snapshot:
        t.school_teacher_school_slug_snapshot,
      school_teacher_school_logo_url_snapshot:
        t.school_teacher_school_logo_url_snapshot,

      school_teacher_sections: Array.isArray(t.school_teacher_sections)
        ? t.school_teacher_sections
        : [],
      school_teacher_csst: Array.isArray(t.school_teacher_csst)
        ? t.school_teacher_csst
        : [],

      profile_gender: t.profile_gender,
      profile_phone: t.phone,
      profile_email: t.email,
      profile_bio_short: t.profile_bio_short,
      profile_instagram_url: t.profile_instagram_url,
      profile_whatsapp_url: t.profile_whatsapp_url,
      profile_linkedin_url: t.profile_linkedin_url,
      profile_github_url: t.profile_github_url,

      nip: t.nip,
      default_subject: t.subject,
    };
  })();

  const detail: TeacherDetail = fromApi ?? DUMMY_DETAIL;
  const usingDummy = !fromApi;

  const prefix =
    detail.school_teacher_user_teacher_title_prefix_snapshot?.trim();
  const suffix =
    detail.school_teacher_user_teacher_title_suffix_snapshot?.trim();
  const name = detail.school_teacher_user_teacher_name_snapshot || "Nama Guru";

  const emp = empBadge(detail.school_teacher_employment);
  const isActive = !!detail.school_teacher_is_active;

  const waHref =
    detail.school_teacher_user_teacher_whatsapp_url_snapshot ||
    detail.profile_whatsapp_url ||
    (detail.profile_phone
      ? `https://wa.me/${detail.profile_phone.replace(/\D/g, "")}`
      : undefined);

  return (
    <TooltipProvider>
      <div className="w-full bg-background text-foreground">
        {/* Header */}
        <header className="w-full border-b bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft size={20} />
              </Button>
              <div className="flex flex-col">
                <h1 className="font-semibold">Detail Guru</h1>
                <span className="text-xs text-muted-foreground">
                  {hijriWithWeekday(new Date().toISOString())}
                </span>
              </div>
            </div>

            {usingDummy && (
              <Badge variant="outline" className="text-xs">
                Data Dummy
              </Badge>
            )}
          </div>
        </header>

        {/* Main */}
        <main className="w-full px-4 md:px-6 py-6">
          <div className="max-w-screen-2xl mx-auto grid lg:grid-cols-3 gap-6">
            {/* Left: Profile Card */}
            <Card className="lg:col-span-1 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/25 via-accent/20 to-secondary/40" />
              <CardContent className="-mt-10">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="size-20 ring-2 ring-white shadow -mt-6">
                    <AvatarImage
                      src={
                        detail.school_teacher_user_teacher_avatar_url_snapshot ||
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
                      {detail.default_subject || "Umum"}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <Badge className={emp.className}>{emp.label}</Badge>
                    <Badge className={statusBadgeClass(isActive)}>
                      {isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                    {detail.school_teacher_is_verified ? (
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

                  <div className="mt-4 flex gap-2">
                    {detail.profile_phone && (
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
                    {detail.profile_email && (
                      <Button asChild size="sm" variant="secondary">
                        <a href={`mailto:${detail.profile_email}`}>
                          <Mail className="mr-2 size-4" />
                          Email
                        </a>
                      </Button>
                    )}
                  </div>

                  {detail.profile_bio_short && (
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed px-2">
                      {detail.profile_bio_short}
                    </p>
                  )}

                  <Separator className="my-4" />

                  {/* Meta table compact */}
                  <Table className="text-sm">
                    <TableBody>
                      <MetaRow label="NIP" value={detail.nip || "-"} />
                      <MetaRow
                        label="Gender"
                        value={genderLabel(detail.profile_gender)}
                      />
                      <MetaRow
                        label="Bergabung"
                        value={toDateLong(detail.school_teacher_joined_at)}
                        icon={<CalendarDays className="size-3.5" />}
                      />
                      <MetaRow
                        label="Berakhir"
                        value={
                          detail.school_teacher_left_at
                            ? toDateLong(detail.school_teacher_left_at)
                            : "—"
                        }
                        icon={<Clock3 className="size-3.5" />}
                      />
                    </TableBody>
                  </Table>

                  {/* Socials */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {detail.profile_instagram_url && (
                      <SocialChip
                        href={detail.profile_instagram_url}
                        label="Instagram"
                      />
                    )}
                    {detail.profile_linkedin_url && (
                      <SocialChip
                        href={detail.profile_linkedin_url}
                        label="LinkedIn"
                      />
                    )}
                    {detail.profile_github_url && (
                      <SocialChip
                        href={detail.profile_github_url}
                        label="GitHub"
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
                    Tentang & Catatan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Sekolah</div>
                      <div className="flex items-center gap-2">
                        {detail.school_teacher_school_logo_url_snapshot ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={detail.school_teacher_school_logo_url_snapshot}
                            alt="logo"
                            className="size-6 rounded-sm"
                          />
                        ) : null}
                        <span className="font-medium">
                          {detail.school_teacher_school_name_snapshot || "—"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Slug</div>
                      <div className="font-medium">
                        {detail.school_teacher_slug || "—"}
                      </div>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <div className="text-muted-foreground">Catatan</div>
                      <div className="font-normal">
                        {detail.school_teacher_notes || "—"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sections (Homeroom / Mengajar) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sections</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {detail.school_teacher_sections?.length ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {detail.school_teacher_sections.map((s) => (
                        <ChipCard
                          key={s.class_section_id}
                          title={
                            s.class_section_name ||
                            s.class_section_slug ||
                            s.class_section_id
                          }
                          subtitle={
                            s.role === "homeroom"
                              ? "Wali Kelas"
                              : s.role === "assistant"
                              ? "Asisten"
                              : "Pengajar"
                          }
                          imageUrl={s.class_section_image_url}
                          rightBadge={s.is_active ? "Aktif" : "Nonaktif"}
                          rightBadgeClass={
                            s.is_active ? "bg-green-600" : "bg-slate-500"
                          }
                          metaLeft={s.from ? toDateLong(s.from) : undefined}
                          metaRight={s.to ? toDateLong(s.to) : undefined}
                        />
                      ))}
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
                  {detail.school_teacher_csst?.length ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {detail.school_teacher_csst.map((c) => (
                        <ChipCard
                          key={c.csst_id}
                          title={
                            c.subject_name || c.subject_slug || "Mata Pelajaran"
                          }
                          subtitle={
                            c.class_section_name || c.class_section_slug || "—"
                          }
                          icon={<LinkIcon className="size-4" />}
                          rightBadge={c.is_active ? "Aktif" : "Nonaktif"}
                          rightBadgeClass={
                            c.is_active ? "bg-green-600" : "bg-slate-500"
                          }
                          metaLeft={c.from ? toDateLong(c.from) : undefined}
                          metaRight={c.to ? toDateLong(c.to) : undefined}
                        />
                      ))}
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
          // eslint-disable-next-line @next/next/no-img-element
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
