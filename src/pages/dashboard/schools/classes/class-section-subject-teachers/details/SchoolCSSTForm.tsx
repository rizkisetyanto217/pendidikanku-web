// src/pages/dashboard/school/classes/class-list/section/SchoolCSSTForm.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { getActiveschoolId } from "@/lib/axios";
import type { AxiosError } from "axios";

/* Icons */
import {
  ArrowLeft,
  BookOpen,
  Users,
  Hash,
  Radio,
  RadioTower,
  Laptop2,
} from "lucide-react";

/* Layout header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* Current user (ambil school_id dari token) */
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* shadcn/ui */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

/* ========= Types shared dengan list ========= */
type DeliveryMode = "offline" | "online" | "hybrid";

type ApiTeacherSnapshot = {
  id?: string | null;
  name?: string | null;
  title_prefix?: string | null;
  title_suffix?: string | null;
};

type ApiSubjectSnapshot = {
  id?: string | null;
  code?: string | null;
  name?: string | null;
};

type ApiBookSnapshot = {
  id?: string | null;
  title?: string | null;
};

type ApiClassSubjectBookSnapshot = {
  id?: string | null;
  subject?: ApiSubjectSnapshot | null;
  book?: ApiBookSnapshot | null;
};

type ApiCSSTItem = {
  class_section_subject_teacher_id: string;
  class_section_subject_teacher_class_section_id: string;
  class_section_subject_teacher_school_teacher_id: string;
  class_section_subject_teacher_class_subject_book_id: string | null;
  class_section_subject_teacher_delivery_mode: DeliveryMode;
  class_section_subject_teacher_is_active: boolean;

  class_section_subject_teacher_class_section_name_snapshot?: string | null;
  class_section_subject_teacher_class_section_code_snapshot?: string | null;

  class_section_subject_teacher_school_teacher_snapshot?: ApiTeacherSnapshot | null;
  class_section_subject_teacher_school_teacher_name_snapshot?: string | null;

  class_section_subject_teacher_class_subject_book_snapshot?: ApiClassSubjectBookSnapshot | null;
  class_section_subject_teacher_subject_name_snapshot?: string | null;
  class_section_subject_teacher_subject_code_snapshot?: string | null;
  class_section_subject_teacher_book_title_snapshot?: string | null;
};

/* ========= Types untuk opsi select ========= */
type SectionOption = {
  id: string;
  name: string;
  code?: string | null;
};

type TeacherOption = {
  id: string;
  name: string;
};

type CSBOption = {
  id: string;
  subjectName?: string | null;
  subjectCode?: string | null;
  bookTitle?: string | null;
};

/* ========= API hooks kecil ========= */

// Detail CSST (untuk edit)
function useCSSTDetail(id?: string) {
  return useQuery<ApiCSSTItem, AxiosError>({
    queryKey: ["csst-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await axios.get<{ data: ApiCSSTItem }>(
        `/u/class-section-subject-teachers/${id}`
      );
      return res.data.data;
    },
  });
}

// List section untuk dropdown
function useSectionOptions(schoolId?: string | null) {
  return useQuery<SectionOption[], AxiosError>({
    queryKey: ["sections-options", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const res = await axios.get<any>(
        `/public/${schoolId}/class-sections/list`,
        { params: { per_page: 999 } }
      );
      const rows = (res.data?.data ?? []) as any[];
      return rows.map((row) => ({
        id: row.class_section_id,
        name: row.class_section_name,
        code: row.class_section_code,
      }));
    },
    staleTime: 120_000,
  });
}

// List teacher untuk dropdown
function useTeacherOptions(schoolId?: string | null) {
  return useQuery<TeacherOption[], AxiosError>({
    queryKey: ["teacher-options", schoolId],
    enabled: !!schoolId,
    queryFn: async () => {
      const res = await axios.get<any>(
        `/public/${schoolId}/school-teachers/list`,
        { params: { per_page: 999 } }
      );
      const rows = (res.data?.data ?? []) as any[];
      return rows.map((t) => {
        const prefix =
          t.school_teacher_user_teacher_title_prefix_snapshot ?? "";
        const name = t.school_teacher_user_teacher_name_snapshot ?? "";
        const suffix =
          t.school_teacher_user_teacher_title_suffix_snapshot ?? "";
        const full = [prefix, name, suffix].filter(Boolean).join(" ").trim();
        return {
          id: t.school_teacher_id,
          name: full || "Tanpa Nama",
        };
      });
    },
    staleTime: 120_000,
  });
}

// List class_subject_book untuk dropdown
function useCSBOptions() {
  return useQuery<CSBOption[], AxiosError>({
    queryKey: ["csb-options"],
    queryFn: async () => {
      const res = await axios.get<any>(`/u/class-subject-books/list`, {
        params: { per_page: 999 },
      });
      const rows = (res.data?.data ?? []) as any[];
      return rows.map((row) => ({
        id: row.class_subject_book_id,
        subjectName:
          row.class_subject_book_subject_name_snapshot ??
          row.subject_name ??
          row.subject?.name ??
          null,
        subjectCode:
          row.class_subject_book_subject_code_snapshot ??
          row.subject_code ??
          row.subject?.code ??
          null,
        bookTitle:
          row.class_subject_book_book_title_snapshot ??
          row.book_title ??
          row.book?.title ??
          null,
      }));
    },
    staleTime: 120_000,
  });
}

/* ========= Page: Form Add/Edit CSST ========= */

/**
 * Rute yang diharapkan:
 * - Buat baru: kelas/pelajaran/new
 * - Edit:      kelas/pelajaran/:csstId/edit
 */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function SchoolCSSTForm({ showBack = false, backTo }: Props) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { csstId } = useParams<{ csstId?: string }>();
  const isEdit = Boolean(csstId);

  // Ambil school_id dari token (membership) → fallback cookie UI
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const activeMembership = currentUser?.membership ?? null;
  const schoolIdFromMembership = activeMembership?.school_id ?? null;
  const schoolId = schoolIdFromMembership || getActiveschoolId() || null;

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  // Header dashboard (pakai struktur route KELAS terbaru)
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: isEdit ? "Edit Pelajaran Kelas" : "Tambah Pelajaran Kelas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        { label: "Pelajaran" },
        { label: isEdit ? "Edit" : "Tambah" },
      ],
      showBack: true,
    });
  }, [setHeader, isEdit]);

  // Guard kalau tidak ada schoolId
  if (!schoolId && !userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm">
        Tidak ditemukan sekolah aktif. Pastikan Anda sudah memilih sekolah aktif
        dan memiliki membership.
      </div>
    );
  }

  // Queries: detail + options
  const csstDetailQ = useCSSTDetail(csstId);
  const sectionsQ = useSectionOptions(schoolId);
  const teachersQ = useTeacherOptions(schoolId);
  const csbQ = useCSBOptions();

  // Form state
  const [sectionId, setSectionId] = useState<string>("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [csbId, setCsbId] = useState<string>("");
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("offline");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Sync initial state ketika data detail sudah ada
  useEffect(() => {
    if (!isEdit || !csstDetailQ.data) return;
    const d = csstDetailQ.data;
    setSectionId(d.class_section_subject_teacher_class_section_id);
    setTeacherId(d.class_section_subject_teacher_school_teacher_id);
    setCsbId(d.class_section_subject_teacher_class_subject_book_id || "");
    setDeliveryMode(d.class_section_subject_teacher_delivery_mode);
    setIsActive(d.class_section_subject_teacher_is_active);
  }, [isEdit, csstDetailQ.data]);

  const sectionsOptions = sectionsQ.data ?? [];
  const teacherOptions = teachersQ.data ?? [];
  const csbOptions = csbQ.data ?? [];

  const isLoadingForm =
    userLoading ||
    sectionsQ.isLoading ||
    teachersQ.isLoading ||
    csbQ.isLoading ||
    (isEdit && csstDetailQ.isLoading);

  const anyError =
    sectionsQ.isError ||
    teachersQ.isError ||
    csbQ.isError ||
    csstDetailQ.isError;

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        class_section_subject_teacher_class_section_id: sectionId,
        class_section_subject_teacher_school_teacher_id: teacherId,
        class_section_subject_teacher_class_subject_book_id: csbId || null,
        class_section_subject_teacher_delivery_mode: deliveryMode,
        class_section_subject_teacher_is_active: isActive,
      };

      if (isEdit && csstId) {
        // Edit
        const res = await axios.patch(
          `/a/class-section-subject-teachers/${csstId}`,
          payload
        );
        return res.data;
      }

      // Create
      const res = await axios.post(
        `/a/class-section-subject-teachers`,
        payload
      );
      return res.data;
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["csst-list"] }),
        qc.invalidateQueries({ queryKey: ["csst-detail", csstId] }),
      ]);
      handleBack();
    },
  });

  const canSubmit =
    !!sectionId && !!teacherId && !mutation.isPending && !isLoadingForm;

  // Display helper
  const csbLabel = (o: CSBOption) => {
    const subject = o.subjectCode
      ? `${o.subjectCode} · ${o.subjectName ?? "-"}`
      : o.subjectName ?? "-";
    const book = o.bookTitle ? ` – ${o.bookTitle}` : "";
    return subject + book;
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <main className="mx-auto flex flex-col gap-4 lg:gap-6">
        {/* Header inline */}
        <div className="md:flex hidden items-center gap-3">
          {showBack && (
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="cursor-pointer"
            >
              <ArrowLeft size={20} />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold md:text-xl">
              {isEdit ? "Edit Pelajaran Kelas" : "Tambah Pelajaran Kelas"}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              Atur keterhubungan kelas (section), guru, dan mata pelajaran +
              buku yang diajarkan.
            </p>
          </div>
        </div>

        {/* State loading / error */}
        {isLoadingForm && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Memuat data formulir…
            </CardContent>
          </Card>
        )}

        {anyError && !isLoadingForm && (
          <Card>
            <CardContent className="py-6 text-sm text-destructive space-y-2">
              <div>Gagal memuat data opsi atau detail CSST.</div>
              <div className="text-xs text-muted-foreground">
                Pastikan endpoint:
                <ul className="list-disc list-inside">
                  <li>/public/:schoolId/class-sections/list</li>
                  <li>/public/:schoolId/school-teachers/list</li>
                  <li>/u/class-subject-books/list</li>
                  <li>/u/class-section-subject-teachers/:id</li>
                </ul>
                sudah tersedia di backend.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form utama */}
        {!isLoadingForm && (
          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">
                Detail Pelajaran Kelas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section & Teacher */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <BookOpen className="h-4 w-4" />
                    Kelas / Section
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={sectionId}
                    onValueChange={setSectionId}
                    disabled={sectionsQ.isLoading}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Pilih kelas / section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionsOptions.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                          {s.code ? ` – ${s.code}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Kelas / rombel yang akan diajar.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4" />
                    Guru
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={teacherId}
                    onValueChange={setTeacherId}
                    disabled={teachersQ.isLoading}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Pilih guru" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherOptions.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">
                    Guru yang bertanggung jawab mengajar di kelas ini.
                  </p>
                </div>
              </div>

              {/* Mapel + buku */}
              <div className="grid gap-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Hash className="h-4 w-4" />
                  Mata Pelajaran & Buku
                </Label>
                <Select
                  value={csbId}
                  onValueChange={setCsbId}
                  disabled={csbQ.isLoading}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih mapel & buku (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Tanpa buku spesifik —</SelectItem>
                    {csbOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {csbLabel(o)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Relasi ke kombinasi mata pelajaran & buku. Boleh dikosongkan
                  bila belum disetting.
                </p>
              </div>

              {/* Delivery mode & status */}
              <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Radio className="h-4 w-4" />
                    Mode Pengajaran
                  </Label>
                  <RadioGroup
                    value={deliveryMode}
                    onValueChange={(v) => setDeliveryMode(v as DeliveryMode)}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                  >
                    <Label
                      htmlFor="mode-offline"
                      className="flex cursor-pointer items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2 text-xs sm:text-sm"
                    >
                      <RadioGroupItem id="mode-offline" value="offline" />
                      <span className="flex items-center gap-1">
                        <Laptop2 className="h-3 w-3" />
                        Offline
                      </span>
                    </Label>
                    <Label
                      htmlFor="mode-online"
                      className="flex cursor-pointer items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2 text-xs sm:text-sm"
                    >
                      <RadioGroupItem id="mode-online" value="online" />
                      <span className="flex items-center gap-1">
                        <RadioTower className="h-3 w-3" />
                        Online
                      </span>
                    </Label>
                    <Label
                      htmlFor="mode-hybrid"
                      className="flex cursor-pointer items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2 text-xs sm:text-sm"
                    >
                      <RadioGroupItem id="mode-hybrid" value="hybrid" />
                      <span>Hybrid</span>
                    </Label>
                  </RadioGroup>
                  <p className="text-[11px] text-muted-foreground">
                    Informasi tambahan saja, tidak membatasi jenis absensi.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-3 py-2">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {isActive ? "Aktif" : "Nonaktif"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Jika nonaktif, pelajaran ini tidak digunakan untuk
                        absensi / nilai baru.
                      </p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={mutation.isPending}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={() => mutation.mutate()}
                  disabled={!canSubmit}
                  className="w-full sm:w-auto"
                >
                  {mutation.isPending
                    ? "Menyimpan…"
                    : isEdit
                    ? "Simpan Perubahan"
                    : "Tambah Pelajaran"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
