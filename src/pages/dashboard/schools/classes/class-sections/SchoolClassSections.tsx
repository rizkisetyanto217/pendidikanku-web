// src/pages/dashboard/school/classes/class-list/section/SchoolSection.tsx
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { ArrowLeft, MapPin, Layers, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ✅ Import untuk breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* ========= Types ========= */
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
};

type ApiSectionList = {
  data: ApiClassSection[];
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

/* ========= Query: ambil semua sections ========= */
function useSections(schoolId: string, classId?: string) {
  return useQuery({
    queryKey: ["sections-manage-all", schoolId, classId ?? null],
    enabled: !!schoolId,
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (classId) params.class_id = classId;
      const res = await axios.get<ApiSectionList>(
        `/public/${schoolId}/class-sections/list`,
        { params }
      );
      return res.data?.data ?? [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

/* =========================================================
   PAGE A: Daftar Class Sections (rombongan belajar)
========================================================= */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function SchoolClassesSection({
  showBack = false,
  backTo,
}: Props) {
  const { schoolId = "", classId } = useParams<{
    schoolId: string;
    classId?: string;
  }>();
  const navigate = useNavigate();

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* ✅ Breadcrumb */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "Daftar Section Kelas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        { label: "Section" },
      ],
      actions: null,
    });
  }, [setHeader]);

  const { data: sections = [], isLoading } = useSections(schoolId, classId);

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
            Daftar Section Kelas
          </h1>
        </div>

        {isLoading && (
          <div className="p-6 text-center text-muted-foreground">
            Memuat data…
          </div>
        )}

        {!isLoading && sections.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            Belum ada section.
          </div>
        )}

        {/* ==== LOOP: satu kartu per Section ==== */}
        {sections.map((section) => (
          <Card
            key={section.class_section_id}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() =>
              navigate(
                `section/${section.class_section_id}/csst`
                // sesuaikan dengan route detail-mu
              )
            }
          >
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
              {/* Ringkas meta section */}
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
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LinkIcon size={12} />
                    Link Grup
                  </a>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `section/${section.class_section_id}/csst`
                      // sesuaikan dengan route detail-mu
                    );
                  }}
                >
                  Kelola Mapel & Pengajar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
