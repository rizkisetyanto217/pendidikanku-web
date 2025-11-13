// src/pages/dashboard/school/classes/class-list/section/SchoolSectionCSST.tsx
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Layers,
  Users,
  Clock4,
  Hash,
  Link as LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* ========= Types ========= */
type DeliveryMode = "offline" | "online" | "hybrid";

type ApiSchedule = {
  start?: string;
  end?: string;
  days?: string[];
  location?: string;
};

type ApiRoomSnapshot = {
  code?: string | null;
  name?: string | null;
  slug?: string | null;
  capacity?: number | null;
  location?: string | null;
  is_virtual?: boolean | null;
};

type ApiTeacherSnapshot = {
  id?: string | null;
  name?: string | null;
  avatar_url?: string | null;
  title_prefix?: string | null;
  title_suffix?: string | null;
  whatsapp_url?: string | null;
};

type ApiBookSnapshot = {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
  author?: string | null;
  image_url?: string | null;
};

type ApiSubjectSnapshot = {
  id?: string | null;
  url?: string | null;
  code?: string | null;
  name?: string | null;
  slug?: string | null;
};

type ApiCSSTItem = {
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
  class_section_subject_teacher_teacher_snapshot?: ApiTeacherSnapshot | null;
  class_section_subject_teacher_class_subject_book_snapshot?: {
    book?: ApiBookSnapshot | null;
    subject?: ApiSubjectSnapshot | null;
  } | null;
  class_section_subject_teacher_is_active?: boolean;
  class_section_subject_teacher_created_at?: string;
  class_section_subject_teacher_updated_at?: string;
};

type ApiClassSection = {
  class_section_id: string;
  class_section_school_id: string;
  class_section_class_id: string;
  class_section_name: string;
  class_section_code?: string | null;
  class_section_schedule?: ApiSchedule | null;
  class_section_capacity?: number | null;
  class_section_total_students?: number | null;
  class_section_group_url?: string | null;
  class_section_is_active: boolean;
  class_section_parent_name_snap?: string | null;
  class_section_parent_slug_snap?: string | null;
  class_section_room_name_snap?: string | null;
  class_section_room_location_snap?: string | null;
  class_section_term_name_snap?: string | null;
  class_section_term_year_label_snap?: string | null;
  class_section_room_snapshot?: ApiRoomSnapshot | null;
  class_sections_csst?: ApiCSSTItem[] | [];
};

type ApiIncludes = {
  csst_by_section?: Record<string, ApiCSSTItem[]>;
};

type ApiSectionListWithIncludes = {
  data: ApiClassSection[];
  includes?: ApiIncludes;
};

/* ========= Helpers ========= */
const scheduleToText = (sch?: ApiSchedule | null): string => {
  if (!sch) return "-";
  const days = (sch.days ?? []).join(", ");
  const time =
    sch.start && sch.end
      ? `${sch.start}–${sch.end}`
      : sch.start || sch.end || "";
  const loc = sch.location ? ` @${sch.location}` : "";
  const left = [days, time].filter(Boolean).join(" ");
  return left ? `${left}${loc}` : "-";
};

/* ========= Query: ambil SATU section + CSST ========= */
function useSectionWithCSST(
  schoolId: string,
  sectionId?: string,
  classId?: string
) {
  return useQuery({
    queryKey: [
      "section-manage-one-csst",
      schoolId,
      sectionId ?? null,
      classId ?? null,
    ],
    enabled: !!schoolId && !!sectionId,
    queryFn: async () => {
      const params: Record<string, any> = { with_csst: true };
      if (classId) params.class_id = classId;

      const res = await axios.get<ApiSectionListWithIncludes>(
        `/public/${schoolId}/class-sections/list`,
        { params }
      );

      const list = res.data?.data ?? [];
      const bySec = res.data?.includes?.csst_by_section ?? {};

      const rows = list.map((s) => ({
        ...s,
        class_sections_csst:
          bySec[s.class_section_id] ?? s.class_sections_csst ?? [],
      }));

      const found = rows.find((s) => s.class_section_id === sectionId);
      return found ?? null;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   PAGE B: Detail Section – Mapel & Pengajar (CSST)
========================================================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function SchoolCSST({ showBack = false, backTo }: Props) {
  const {
    schoolId = "",
    classId,
    sectionId,
  } = useParams<{
    schoolId: string;
    classId?: string;
    sectionId?: string;
  }>();
  const navigate = useNavigate();

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  const { setHeader } = useDashboardHeader();
  const sectionQ = useSectionWithCSST(schoolId, sectionId, classId);
  const section = sectionQ.data;

  useEffect(() => {
    setHeader({
      title: section
        ? `Mapel & Pengajar – ${section.class_section_name}`
        : "Mapel & Pengajar Section",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        { label: "Section", href: "section" },
        { label: "Mapel & Pengajar" },
      ],
      actions: null,
    });
  }, [setHeader, section]);

  if (sectionQ.isLoading) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center">
        <div className="text-muted-foreground">Memuat data…</div>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <div className="text-muted-foreground">Section tidak ditemukan.</div>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2" size={16} />
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <main className="mx-auto space-y-6">
        {/* Header */}
        <div className="md:flex hidden gap-3 items-center">
          {showBack && (
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="cursor-pointer self-start"
            >
              <ArrowLeft size={20} />
            </Button>
          )}
          <h1 className="font-semibold text-lg md:text-xl">
            Mapel & Pengajar – {section.class_section_name}
          </h1>
        </div>

        {/* Kartu info Section */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Layers size={18} /> {section.class_section_name}
              </CardTitle>
              <Badge
                variant={
                  section.class_section_is_active ? "default" : "outline"
                }
                className={
                  section.class_section_is_active ? "bg-green-600" : ""
                }
              >
                {section.class_section_is_active ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">Kode</div>
                <div className="font-semibold">
                  {section.class_section_code ?? "-"}
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">
                  Parent / Tingkat
                </div>
                <div className="font-semibold truncate">
                  {section.class_section_parent_name_snap ?? "-"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {section.class_section_parent_slug_snap ?? "-"}
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">Ruang</div>
                <div className="font-semibold truncate">
                  {section.class_section_room_name_snap ??
                    section.class_section_room_snapshot?.name ??
                    "-"}
                </div>
                <div className="text-xs flex items-center gap-1 text-muted-foreground truncate">
                  <MapPin size={14} />
                  {section.class_section_room_location_snap ??
                    section.class_section_room_snapshot?.location ??
                    "-"}
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-3 text-sm">
              <span className="text-muted-foreground mr-2">Jadwal:</span>
              <span className="font-medium">
                {scheduleToText(section.class_section_schedule)}
              </span>
              {!!section.class_section_group_url && (
                <a
                  href={section.class_section_group_url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-3 underline inline-flex items-center gap-1 text-xs text-primary"
                >
                  <LinkIcon size={12} />
                  Link Grup
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ==== CSST di section ini ==== */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BookOpen size={18} /> Mata Pelajaran & Pengajar
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {section.class_sections_csst &&
            section.class_sections_csst.length ? (
              <div className="space-y-4">
                {section.class_sections_csst.map((row) => {
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
                      className="rounded-xl border bg-card p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold flex items-center gap-2">
                          <Hash size={16} />{" "}
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
                          className={
                            row.class_section_subject_teacher_is_active
                              ? "bg-green-600"
                              : ""
                          }
                        >
                          {row.class_section_subject_teacher_is_active
                            ? "Aktif"
                            : "Nonaktif"}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>
                            Pengajar:{" "}
                            {teacher
                              ? `${teacher.title_prefix ?? ""} ${
                                  teacher.name ?? ""
                                } ${teacher.title_suffix ?? ""}`.trim()
                              : "-"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>Ruang: {room?.name ?? "-"}</span>
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

                      {book && (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {book.image_url ? (
                            <img
                              src={book.image_url}
                              alt={book.title ?? "Book cover"}
                              className="w-12 h-16 object-cover rounded-md border"
                            />
                          ) : null}
                          <div>
                            <div className="font-medium text-foreground">
                              {book.title ?? "-"}
                            </div>
                            <div className="text-xs">
                              Penulis: {book.author ?? "-"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-3">
                Belum ada mata pelajaran untuk section ini.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
