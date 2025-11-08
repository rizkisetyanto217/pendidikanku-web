// src/pages/teacher/classes/TeacherStudentDetail.tsx
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* ========== shadcn/ui ========== */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* ========== Icons ========== */
import {
  ArrowLeft,
  Users,
  MessageSquareText,
  AlertTriangle,
  Building2,

  CalendarCheck2,
  User2,
  Hash,
  Clock,
  Phone,
} from "lucide-react";

/* =========================================================
   TYPES — mirror kolom penting dari tabel (school_students + snapshots)
========================================================= */
export type SectionItem = {
  class_section_id: string;
  is_active?: boolean;
  from?: string | null; // ISO date
  to?: string | null; // ISO date
  class_section_name?: string | null;
  class_section_slug?: string | null;
  class_section_image_url?: string | null;
};

export type StudentDetailDTO = {
  school_student_id: string;
  school_student_school_id: string;
  school_student_user_profile_id: string;

  school_student_slug: string;
  school_student_code?: string | null; // NIS/Code
  school_student_status: "active" | "inactive" | "alumni";

  school_student_joined_at?: string | null;
  school_student_left_at?: string | null;
  school_student_note?: string | null;

  // user profile snapshots
  school_student_user_profile_name_snapshot?: string | null;
  school_student_user_profile_avatar_url_snapshot?: string | null;
  school_student_user_profile_whatsapp_url_snapshot?: string | null;
  school_student_user_profile_parent_name_snapshot?: string | null;
  school_student_user_profile_parent_whatsapp_url_snapshot?: string | null;

  // school snapshots
  school_student_school_name_snapshot?: string | null;
  school_student_school_slug_snapshot?: string | null;
  school_student_school_logo_url_snapshot?: string | null;
  school_student_school_icon_url_snapshot?: string | null;
  school_student_school_background_url_snapshot?: string | null;

  // sections JSONB
  school_student_sections: SectionItem[];

  // (bonus) derived from user_profiles table idea — not required by table but useful
  user_profile_gender?: "male" | "female" | null;
};

/* =========================================================
   DUMMY — satu student detail (self-contained)
========================================================= */
const phoneToWaUrl = (phone?: string | null) => {
  if (!phone) return undefined;
  let p = phone.trim();
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0")) p = "62" + p.slice(1);
  return `https://wa.me/${p}`;
};

const makeSections = (seed: string): SectionItem[] => [
  {
    class_section_id: `${seed}-A`,
    is_active: true,
    from: "2025-07-15",
    to: null,
    class_section_name: "Tahfidz A",
    class_section_slug: "tahfidz-a",
    class_section_image_url: null,
  },
  {
    class_section_id: `${seed}-R1`,
    is_active: false,
    from: "2024-07-15",
    to: "2025-06-30",
    class_section_name: "Matematika Dasar B",
    class_section_slug: "matdas-b",
    class_section_image_url: null,
  },
];

const DUMMY_STUDENT: StudentDetailDTO = {
  school_student_id: "s-01",
  school_student_school_id: "sch-0001-uuid",
  school_student_user_profile_id: "up-s-01",

  school_student_slug: "ahmad-fathir",
  school_student_code: "2025001",
  school_student_status: "active",

  school_student_joined_at: "2025-07-15T07:00:00Z",
  school_student_left_at: null,
  school_student_note:
    "Alergi kacang; Asthma ringan (bawa inhaler). Duduk dekat jendela lebih nyaman.",

  school_student_user_profile_name_snapshot: "Ahmad Fathir",
  school_student_user_profile_avatar_url_snapshot: null,
  school_student_user_profile_whatsapp_url_snapshot:
    phoneToWaUrl("081200000001"),
  school_student_user_profile_parent_name_snapshot: "Bpk. Fajar",
  school_student_user_profile_parent_whatsapp_url_snapshot:
    phoneToWaUrl("08121111111"),

  school_student_school_name_snapshot: "Diploma Ilmi",
  school_student_school_slug_snapshot: "diploma-ilmi",
  school_student_school_logo_url_snapshot: null,
  school_student_school_icon_url_snapshot: null,
  school_student_school_background_url_snapshot: null,

  school_student_sections: makeSections("s-01"),
  user_profile_gender: "male",
};

/* =========================================================
   HELPERS
========================================================= */
const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString() : "-";

const statusToBadge = (s?: StudentDetailDTO["school_student_status"]) => {
  const map: Record<string, { label: string; variant?: any }> = {
    active: { label: "Aktif" },
    inactive: { label: "Nonaktif", variant: "secondary" },
    alumni: { label: "Alumni", variant: "outline" },
  };
  return s ? map[s] ?? { label: s } : { label: "-" };
};

function pickActiveSections(sections: SectionItem[] = []) {
  return sections.filter((x) => x?.is_active);
}

/* =========================================================
   PAGE — detail satu siswa (dummy only)
========================================================= */
const TeacherDetailClassStudent: React.FC = () => {
  const navigate = useNavigate();
//   const location = useLocation();
  const { studentId: paramStudentId } = useParams<{ studentId?: string }>();

  // Pakai dummy 100%; namun tetap hormati :studentId untuk future-proof
  const dto = useMemo(() => {
    // kalau id bukan s-01, tetap pakai DUMMY_STUDENT tapi override id/slug/kode agar URL terasa konsisten
    if (!paramStudentId || paramStudentId === DUMMY_STUDENT.school_student_id)
      return DUMMY_STUDENT;
    return {
      ...DUMMY_STUDENT,
      school_student_id: paramStudentId,
      school_student_slug: `${DUMMY_STUDENT.school_student_slug}-${paramStudentId}`,
      school_student_code: DUMMY_STUDENT.school_student_code,
      school_student_sections: makeSections(paramStudentId),
    } as StudentDetailDTO;
  }, [paramStudentId]);

  const activeSections = useMemo(
    () => pickActiveSections(dto.school_student_sections),
    [dto.school_student_sections]
  );

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <main className="w-full px-4 md:px-6 py-4 md:py-8 max-w-screen-2xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
          >
            <ArrowLeft />
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              {dto.school_student_user_profile_name_snapshot}
            </h1>
            <Badge className="uppercase">
              {statusToBadge(dto.school_student_status).label}
            </Badge>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {dto.school_student_user_profile_whatsapp_url_snapshot && (
              <a
                href={dto.school_student_user_profile_whatsapp_url_snapshot}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="default" size="sm" className="gap-2">
                  <MessageSquareText size={16} /> WhatsApp
                </Button>
              </a>
            )}
            {dto.school_student_user_profile_parent_whatsapp_url_snapshot && (
              <a
                href={
                  dto.school_student_user_profile_parent_whatsapp_url_snapshot
                }
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="secondary" size="sm" className="gap-2">
                  <Users size={16} /> Wali
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Identitas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User2 size={18} /> Identitas & Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <Field label="Nama">
                  {dto.school_student_user_profile_name_snapshot}
                </Field>
                <Field label="Kode/NIS">
                  {dto.school_student_code || dto.school_student_slug}
                </Field>
                <Field label="Gender">
                  {dto.user_profile_gender ? (
                    <Badge variant="outline" className="uppercase">
                      {dto.user_profile_gender === "male" ? "L" : "P"}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </Field>
                <Field label="Status">
                  <Badge variant="outline" className="uppercase">
                    {statusToBadge(dto.school_student_status).label}
                  </Badge>
                </Field>
                <Field label="Bergabung">
                  {fmtDate(dto.school_student_joined_at)}
                </Field>
                <Field label="Keluar">
                  {fmtDate(dto.school_student_left_at)}
                </Field>
                <Field label="Sekolah">
                  <span className="inline-flex items-center gap-2">
                    <Building2 size={16} />
                    {dto.school_student_school_name_snapshot}
                  </span>
                </Field>
                <Field label="Slug Sekolah">
                  {dto.school_student_school_slug_snapshot || "-"}
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Kontak */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone size={18} /> Kontak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <Field label="WhatsApp Siswa">
                  {dto.school_student_user_profile_whatsapp_url_snapshot ? (
                    <a
                      className="text-primary underline"
                      href={
                        dto.school_student_user_profile_whatsapp_url_snapshot
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka WhatsApp
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </Field>
                <Field label="Nama Wali">
                  {dto.school_student_user_profile_parent_name_snapshot || "-"}
                </Field>
                <Field label="WhatsApp Wali">
                  {dto.school_student_user_profile_parent_whatsapp_url_snapshot ? (
                    <a
                      className="text-primary underline"
                      href={
                        dto.school_student_user_profile_parent_whatsapp_url_snapshot
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka WhatsApp Wali
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Catatan Penting */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={18} /> Catatan penting
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dto.school_student_note ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {dto.school_student_note}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tidak ada catatan.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Keanggotaan Kelas/Section */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck2 size={18} /> Kelas / Section
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="aktif">
                <TabsList>
                  <TabsTrigger value="aktif">Aktif</TabsTrigger>
                  <TabsTrigger value="riwayat">Riwayat</TabsTrigger>
                </TabsList>
                <TabsContent value="aktif" className="mt-3">
                  {activeSections.length ? (
                    <ul className="space-y-2">
                      {activeSections.map((s) => (
                        <li
                          key={s.class_section_id}
                          className="flex items-start justify-between rounded-lg border p-3"
                        >
                          <div>
                            <div className="font-medium">
                              {s.class_section_name || "(Tanpa nama)"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Sejak {fmtDate(s.from)}
                            </div>
                          </div>
                          <Badge>AKTIF</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Tidak ada section aktif.
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="riwayat" className="mt-3">
                  <ul className="space-y-2">
                    {dto.school_student_sections
                      .filter((s) => !s.is_active)
                      .map((s) => (
                        <li
                          key={s.class_section_id}
                          className="rounded-lg border p-3"
                        >
                          <div className="font-medium">
                            {s.class_section_name || "(Tanpa nama)"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {fmtDate(s.from)} — {fmtDate(s.to)}
                          </div>
                        </li>
                      ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Audit Info */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={18} /> Audit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <Field label="ID Siswa">
                  <span className="inline-flex items-center gap-2">
                    <Hash size={14} />
                    {dto.school_student_id}
                  </span>
                </Field>
                <Field label="School ID">{dto.school_student_school_id}</Field>
                <Field label="User Profile ID">
                  {dto.school_student_user_profile_id}
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TeacherDetailClassStudent;

/* =========================================================
   REUSABLE FIELD COMPONENT
========================================================= */
function Field({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-sm">{children ?? "-"}</div>
    </div>
  );
}
