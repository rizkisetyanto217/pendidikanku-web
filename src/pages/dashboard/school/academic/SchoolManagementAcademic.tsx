// src/pages/sekolahislamku/academic/SchoolManagementAcademicDetail.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Users,
  Clock4,
  FileText,
  Hash,
  Link as LinkIcon,
} from "lucide-react";

/* ========== shadcn/ui ========== */
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

/* =========================================================
   ACADEMIC TYPES — Public Class Sections (Detail via list?id&with_csst)
========================================================= */
export interface ApiPagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  // Tambahan (sesuai contoh payload)
  count?: number;
  per_page_options?: number[];
}

export interface ApiSchedule {
  start?: string; // "07:30"
  end?: string; // "09:00"
  days?: string[]; // ["Senin","Rabu"]
  location?: string; // "Gedung A, Lt. 2" atau URL utk virtual
}

export interface ApiRoomSnapshot {
  code?: string | null;
  name?: string | null;
  slug?: string | null;
  capacity?: number | null;
  location?: string | null;
  is_virtual?: boolean | null;
}

export interface ApiTeacherSnapshot {
  id?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  title_prefix?: string | null;
  title_suffix?: string | null;
  whatsapp_url?: string | null;
}

export interface ApiBookSnapshot {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
  author?: string | null;
  image_url?: string | null;
}

export interface ApiSubjectSnapshot {
  id?: string | null;
  url?: string | null;
  code?: string | null;
  name?: string | null;
  slug?: string | null;
}

export type DeliveryMode = "offline" | "online" | "hybrid";
export type EnrollmentMode =
  | "self_select"
  | "assigned"
  | "invitation"
  | "mixed";

export interface ApiCSSTItem {
  class_section_subject_teacher_id: string;
  class_section_subject_teacher_school_id: string;
  class_section_subject_teacher_section_id: string;
  class_section_subject_teacher_class_subject_book_id: string | null;

  class_section_subject_teacher_teacher_id?: string | null;
  class_section_subject_teacher_name?: string | null;
  class_section_subject_teacher_slug?: string | null;

  class_section_subject_teacher_room_id?: string | null;

  class_section_subject_teacher_total_attendance?: number;
  class_section_subject_teacher_enrolled_count?: number;

  class_section_subject_teacher_delivery_mode?: DeliveryMode;

  class_section_subject_teacher_room_snapshot?: ApiRoomSnapshot | null;
  class_section_subject_teacher_room_name_snap?: string | null;
  class_section_subject_teacher_room_slug_snap?: string | null;
  class_section_subject_teacher_room_location_snap?: string | null;

  class_section_subject_teacher_teacher_snapshot?: ApiTeacherSnapshot | null;
  class_section_subject_teacher_teacher_name_snap?: string | null;

  class_section_subject_teacher_class_subject_book_snapshot?: {
    book?: ApiBookSnapshot | null;
    subject?: ApiSubjectSnapshot | null;
  } | null;

  class_section_subject_teacher_book_title_snap?: string | null;
  class_section_subject_teacher_book_author_snap?: string | null;
  class_section_subject_teacher_book_slug_snap?: string | null;
  class_section_subject_teacher_book_image_url_snap?: string | null;

  class_section_subject_teacher_subject_name_snap?: string | null;
  class_section_subject_teacher_subject_code_snap?: string | null;
  class_section_subject_teacher_subject_slug_snap?: string | null;

  class_section_subject_teacher_books_snapshot?: ApiBookSnapshot[] | null;

  class_section_subject_teacher_is_active?: boolean;
  class_section_subject_teacher_created_at?: string;
  class_section_subject_teacher_updated_at?: string;
  class_section_subject_teacher_deleted_at?: string | null;
}

export interface ApiClassSection {
  class_section_id: string;
  class_section_school_id: string;
  class_section_class_id: string;

  class_section_teacher_id?: string | null;
  class_section_assistant_teacher_id?: string | null;
  class_section_class_room_id?: string | null;
  class_section_leader_student_id?: string | null;

  class_section_slug: string;
  class_section_name: string;
  class_section_code?: string | null;

  class_section_schedule?: ApiSchedule | null;

  class_section_capacity?: number | null;
  class_section_total_students?: number | null;

  class_section_group_url?: string | null;
  class_section_image_url?: string | null;
  class_section_image_object_key?: string | null;
  class_section_image_url_old?: string | null;
  class_section_image_object_key_old?: string | null;
  class_section_image_delete_pending_until?: string | null;

  class_section_is_active: boolean;
  class_section_created_at: string;
  class_section_updated_at: string;

  class_section_class_slug_snap?: string | null;

  class_section_parent_name_snap?: string | null;
  class_section_parent_code_snap?: string | null;
  class_section_parent_slug_snap?: string | null;
  class_section_parent_level_snap?: string | null;

  class_section_room_name_snap?: string | null;
  class_section_room_slug_snap?: string | null;
  class_section_room_location_snap?: string | null;

  class_section_term_id?: string | null;
  class_section_term_name_snap?: string | null;
  class_section_term_slug_snap?: string | null;
  class_section_term_year_label_snap?: string | null;

  class_section_snapshot_updated_at?: string | null;

  class_section_class_snapshot?: {
    slug?: string | null;
  } | null;

  class_section_parent_snapshot?: {
    code?: string | null;
    name?: string | null;
    slug?: string | null;
    level?: string | null;
  } | null;

  class_section_term_snapshot?: {
    name?: string | null;
    slug?: string | null;
    year_label?: string | null;
  } | null;

  class_section_room_snapshot?: ApiRoomSnapshot | null;

  class_sections_csst?: ApiCSSTItem[] | [];
  class_sections_csst_count?: number;
  class_sections_csst_active_count?: number;

  class_section_csst_enrollment_mode?: EnrollmentMode;
  class_section_csst_self_select_requires_approval?: boolean;

  class_section_features?: Record<string, unknown>;
}

export interface ApiIncludes {
  csst_by_section?: Record<string, ApiCSSTItem[]>;
}

export interface ApiSectionListWithIncludes {
  message?: string;
  pagination?: ApiPagination;
  includes?: ApiIncludes; // optional (future-proof)
  data: ApiClassSection[];
}

/* =========================================================
   UTIL: View model + mapper
========================================================= */
export interface SectionDetailView {
  section: ApiClassSection;
  csst: ApiCSSTItem[];
}

// Cari berdasarkan id ATAU slug (supaya URL fleksibel)
function findSectionFromList(
  list: ApiClassSection[] | undefined,
  sectionIdOrSlug: string
): ApiClassSection | null {
  if (!list || list.length === 0) return null;
  const byId = list.find((it) => it.class_section_id === sectionIdOrSlug);
  if (byId) return byId;
  const bySlug = list.find((it) => it.class_section_slug === sectionIdOrSlug);
  return bySlug ?? null;
}

export function toSectionDetailView(
  resp: ApiSectionListWithIncludes,
  sectionIdOrSlug: string
): SectionDetailView | null {
  const section =
    findSectionFromList(resp?.data, sectionIdOrSlug) ?? resp?.data?.[0] ?? null;
  if (!section) return null;

  // Payload sudah menaruh csst di dalam section
  const csst = section.class_sections_csst ?? [];

  return { section, csst };
}

/* =========================================================
   API Fetcher
========================================================= */
export async function fetchSectionDetail(
  schoolId: string,
  idOrSlug: string
): Promise<SectionDetailView | null> {
  const res = await axiosInstance.get<ApiSectionListWithIncludes>(
    `/public/${schoolId}/class-sections/list`,
    {
      // Kirim idOrSlug sebagai id (future-proof kalau BE nanti filter by id),
      // dan aktifkan with_csst agar BE menaruh CSST di section.
      params: { id: idOrSlug, with_csst: true },
    }
  );

  // Logging ringan kalau kosong (opsional)
  if (!res.data?.data?.length) {
    console.warn("[academic-detail] API mengembalikan data kosong", {
      schoolId,
      idOrSlug,
    });
  }

  return toSectionDetailView(res.data, idOrSlug);
}

/* =========================================================
   UTIL: Formatter tampilan
========================================================= */
export function scheduleToText(sch?: ApiSchedule | null): string {
  if (!sch) return "-";
  const days = (sch.days ?? []).join(", ");
  const time =
    sch.start && sch.end
      ? `${sch.start}–${sch.end}`
      : sch.start || sch.end || "";
  const loc = sch.location ? ` @${sch.location}` : "";
  const left = [days, time].filter(Boolean).join(" ");
  return left ? `${left}${loc}` : "-";
}

/* =========================================================
   PAGE COMPONENT — Detail Akademik (shadcn/ui)
========================================================= */
export default function SchoolManagementAcademicDetail() {
  const { schoolId = "", id = "" } = useParams<{
    schoolId: string;
    id: string;
  }>();
  const navigate = useNavigate();

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["academic-detail", schoolId, id],
    enabled: !!schoolId && !!id,
    queryFn: () => fetchSectionDetail(schoolId, id),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const view = data;
  const section = view?.section;
  const csst = view?.csst ?? [];
  const [showRaw, setShowRaw] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-background">
        Memuat data...
      </div>
    );
  }

  if (!section) {
    return (
      <div className="p-6 text-center text-muted-foreground bg-background">
        Data tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <main className="max-w-screen-2xl mx-auto py-6 px-4 space-y-6">
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} className="mr-1" />
              Kembali
            </Button>
            <h1 className="text-lg font-semibold">Detail Kelas Akademik</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={section.class_section_is_active ? "default" : "outline"}
            >
              {section.class_section_is_active ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
        </div>

        {/* ===== Info Umum Section ===== */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border p-3 bg-card">
                <div className="text-xs text-muted-foreground mb-1">
                  Nama Kelas
                </div>
                <div className="font-semibold">
                  {section.class_section_name}
                </div>
                <div className="text-xs text-muted-foreground break-all">
                  slug: {section.class_section_slug}
                </div>
              </div>

              <div className="rounded-xl border p-3 bg-card">
                <div className="text-xs text-muted-foreground mb-1">Kode</div>
                <div className="font-semibold">
                  {section.class_section_code ?? "-"}
                </div>
                <div className="text-xs text-muted-foreground">
                  ID: {section.class_section_id}
                </div>
              </div>

              <div className="rounded-xl border p-3 bg-card">
                <div className="text-xs text-muted-foreground mb-1">
                  Tingkat (Parent)
                </div>
                <div className="font-semibold">
                  {section.class_section_parent_name_snap ?? "-"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {section.class_section_parent_code_snap} •{" "}
                  {section.class_section_parent_slug_snap}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border p-3 bg-card">
                <div className="text-xs text-muted-foreground mb-1">Ruang</div>
                <div className="font-semibold">
                  {section.class_section_room_name_snap ??
                    section.class_section_room_snapshot?.name ??
                    "-"}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin size={14} />
                  {section.class_section_room_location_snap ??
                    section.class_section_room_snapshot?.location ??
                    "-"}
                </div>
              </div>

              <div className="rounded-xl border p-3 bg-card">
                <div className="text-xs text-muted-foreground mb-1">
                  Tahun Ajaran / Term
                </div>
                <div className="font-semibold">
                  {section.class_section_term_name_snap ??
                    section.class_section_term_snapshot?.name ??
                    "-"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {section.class_section_term_slug_snap ??
                    section.class_section_term_snapshot?.slug ??
                    ""}{" "}
                  •{" "}
                  {section.class_section_term_year_label_snap ??
                    section.class_section_term_snapshot?.year_label ??
                    ""}
                </div>
              </div>

              <div className="rounded-xl border p-3 bg-card">
                <div className="text-xs text-muted-foreground mb-1">Siswa</div>
                <div className="font-semibold">
                  {section.class_section_total_students ?? 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  Kapasitas: {section.class_section_capacity ?? "-"}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border p-3 bg-card">
                <div className="text-xs text-muted-foreground mb-1">
                  Jadwal (Section)
                </div>
                <div className="font-semibold">
                  {scheduleToText(section.class_section_schedule)}
                </div>
                {!!section.class_section_group_url && (
                  <a
                    href={section.class_section_group_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline inline-flex gap-1 mt-1 text-primary"
                  >
                    <LinkIcon size={12} />
                    Link Grup
                  </a>
                )}
              </div>

              <div className="rounded-xl border p-3 bg-card">
                <div className="text-xs text-muted-foreground mb-1">
                  Enrollment Mode
                </div>
                <div className="font-semibold">
                  {section.class_section_csst_enrollment_mode ?? "-"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Approval?{" "}
                  {section.class_section_csst_self_select_requires_approval
                    ? "Ya"
                    : "Tidak"}
                </div>
              </div>

              <div className="rounded-xl border p-3 bg-card">
                <div className="text-xs text-muted-foreground mb-1">
                  Class / Parent Snapshot
                </div>
                <div className="text-xs">
                  class_slug: {section.class_section_class_slug_snap ?? "-"}
                </div>
                <div className="text-xs">
                  parent_level: {section.class_section_parent_level_snap ?? "-"}
                </div>
                <div className="text-xs text-muted-foreground">
                  snapshot_updated:{" "}
                  {section.class_section_snapshot_updated_at ?? "-"}
                </div>
              </div>
            </div>

            {section.class_section_room_snapshot && (
              <div className="rounded-xl p-3 text-sm border bg-card">
                <div className="font-medium mb-1 flex items-center gap-2">
                  <MapPin size={14} /> Detail Ruang (Snapshot)
                </div>
                <div className="grid sm:grid-cols-3 gap-1">
                  <div>
                    Nama: {section.class_section_room_snapshot.name ?? "-"}
                  </div>
                  <div>
                    Kode: {section.class_section_room_snapshot.code ?? "-"}
                  </div>
                  <div>
                    Slug: {section.class_section_room_snapshot.slug ?? "-"}
                  </div>
                  <div>
                    Lokasi:{" "}
                    {section.class_section_room_snapshot.location ?? "-"}
                  </div>
                  <div>
                    Kapasitas:{" "}
                    {section.class_section_room_snapshot.capacity ?? "-"}
                  </div>
                  <div>
                    Jenis:{" "}
                    {section.class_section_room_snapshot.is_virtual
                      ? "Virtual"
                      : "Fisik"}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 text-xs text-muted-foreground">
              Dibuat:{" "}
              {new Date(section.class_section_created_at).toLocaleString()} •
              Diperbarui:{" "}
              {new Date(section.class_section_updated_at).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* ===== Mata Pelajaran (CSST) ===== */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between pb-3">
              <div className="font-medium flex items-center gap-2">
                <BookOpen size={18} /> Mata Pelajaran & Pengajar
              </div>
              <div className="text-sm text-muted-foreground">
                {isFetching ? "Menyegarkan…" : ""}
              </div>
            </div>

            {csst.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Belum ada data mata pelajaran untuk kelas ini.
              </div>
            ) : (
              <div className="space-y-4">
                {csst.map((row) => {
                  const teacher =
                    row.class_section_subject_teacher_teacher_snapshot;
                  const subj =
                    row
                      .class_section_subject_teacher_class_subject_book_snapshot
                      ?.subject;
                  const book =
                    row
                      .class_section_subject_teacher_class_subject_book_snapshot
                      ?.book;
                  const room = row.class_section_subject_teacher_room_snapshot;

                  return (
                    <div
                      key={row.class_section_subject_teacher_id}
                      className="rounded-xl border p-4 space-y-3 bg-card"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="font-semibold flex items-center gap-2">
                          <Hash size={16} />
                          {subj?.name ??
                            row.class_section_subject_teacher_name ??
                            "-"}
                        </div>
                        <Badge
                          variant={
                            row.class_section_subject_teacher_is_active
                              ? "default"
                              : "outline"
                          }
                        >
                          {row.class_section_subject_teacher_is_active
                            ? "Aktif"
                            : "Nonaktif"}
                        </Badge>
                      </div>

                      {/* Meta */}
                      <div className="grid md:grid-cols-3 gap-2 text-sm text-foreground">
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>
                            Pengajar:{" "}
                            {teacher
                              ? `${teacher.title_prefix ?? ""} ${
                                  teacher.name ?? ""
                                } ${teacher.title_suffix ?? ""}`.trim()
                              : row.class_section_subject_teacher_teacher_name_snap ??
                                "-"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>
                            Ruang:{" "}
                            {room?.name ??
                              row.class_section_subject_teacher_room_name_snap ??
                              "-"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock4 size={14} />
                          <span>
                            Mode:{" "}
                            {row.class_section_subject_teacher_delivery_mode ??
                              "-"}
                          </span>
                        </div>
                      </div>

                      {/* Buku */}
                      {book && (
                        <div className="flex items-center gap-3 text-sm text-foreground/80">
                          {book.image_url ? (
                            <img
                              src={book.image_url}
                              alt={book.title ?? "Book cover"}
                              className="w-12 h-16 object-cover rounded-md border"
                            />
                          ) : null}
                          <div>
                            <div className="font-medium">
                              {book.title ?? "-"}
                            </div>
                            <div className="text-xs">
                              Penulis: {book.author ?? "-"}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Counts & timestamps */}
                      <div className="grid sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          Enrolled:{" "}
                          {row.class_section_subject_teacher_enrolled_count ??
                            0}
                        </div>
                        <div>
                          Total Attendance:{" "}
                          {row.class_section_subject_teacher_total_attendance ??
                            0}
                        </div>
                        <div>
                          Dibuat:{" "}
                          {row.class_section_subject_teacher_created_at
                            ? new Date(
                                row.class_section_subject_teacher_created_at
                              ).toLocaleString()
                            : "-"}
                        </div>
                        <div>
                          Diperbarui:{" "}
                          {row.class_section_subject_teacher_updated_at
                            ? new Date(
                                row.class_section_subject_teacher_updated_at
                              ).toLocaleString()
                            : "-"}
                        </div>
                        <div>
                          Dihapus:{" "}
                          {row.class_section_subject_teacher_deleted_at
                            ? new Date(
                                row.class_section_subject_teacher_deleted_at
                              ).toLocaleString()
                            : "-"}
                        </div>
                      </div>

                      {/* Kontak guru */}
                      {teacher?.whatsapp_url && (
                        <a
                          href={teacher.whatsapp_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs underline text-primary"
                        >
                          <LinkIcon size={12} />
                          Hubungi Pengajar via WhatsApp
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== JSON mentah (opsional, untuk debugging) ===== */}
        <Card>
          <CardContent className="p-5">
            <Button
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={() => setShowRaw((s) => !s)}
            >
              <FileText size={16} className="mr-2" />
              {showRaw ? "Sembunyikan JSON mentah" : "Lihat JSON mentah"}
            </Button>

            {showRaw && (
              <pre className="mt-3 text-xs p-3 rounded-xl overflow-auto border bg-card max-h-[420px]">
                {JSON.stringify({ section, csst }, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

/* =========================================================
   TIP ROUTING
   <Route path="/sekolah/:schoolId/academic/detail/:id" element={<SchoolManagementAcademicDetail />} />
   navigate(`/sekolah/${schoolId}/academic/detail/${sectionId}`);
========================================================= */
