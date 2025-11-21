// src/pages/dashboard/school/classes/class-list/section/SchoolSectionForm.tsx
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

import {
  ArrowLeft,
  Layers,
  Users,
  Link as LinkIcon,
  ShieldCheck,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

/* ✅ Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* ========= Types ========= */

type EnrollmentMode = "self_select" | "assigned" | "closed" | string;

type ApiClassSection = {
  class_section_id: string;
  class_section_school_id: string;
  class_section_class_id: string;
  class_section_slug: string;
  class_section_name: string;
  class_section_code: string | null;
  class_section_schedule: any | null;
  class_section_capacity: number | null;
  class_section_total_students: number | null;
  class_section_group_url: string | null;
  class_section_image_url: string | null;
  class_section_is_active: boolean;
  class_section_subject_teachers_enrollment_mode: EnrollmentMode;
  class_section_subject_teachers_self_select_requires_approval: boolean;
};

type SectionFormValues = {
  name: string;
  code: string;
  capacity: string;
  groupUrl: string;
  isActive: boolean;
  enrollmentMode: EnrollmentMode;
  selfSelectRequiresApproval: boolean;
  scheduleNote: string;
};

/* ========= Helpers ========= */

const ENROLLMENT_MODE_OPTIONS: { value: EnrollmentMode; label: string }[] = [
  { value: "self_select", label: "Siswa pilih sendiri" },
  { value: "assigned", label: "Ditentukan admin" },
  { value: "closed", label: "Tutup / tidak menerima penugasan baru" },
];

function mapApiToForm(s: ApiClassSection): SectionFormValues {
  return {
    name: s.class_section_name ?? "",
    code: s.class_section_code ?? "",
    capacity:
      typeof s.class_section_capacity === "number"
        ? String(s.class_section_capacity)
        : "",
    groupUrl: s.class_section_group_url ?? "",
    isActive: s.class_section_is_active,
    enrollmentMode:
      s.class_section_subject_teachers_enrollment_mode || "assigned",
    selfSelectRequiresApproval:
      s.class_section_subject_teachers_self_select_requires_approval ?? false,
    scheduleNote:
      typeof s.class_section_schedule === "string"
        ? s.class_section_schedule
        : "",
  };
}

/* Kalau mau, nanti bisa di-strong type sesuai DTO backend */
function mapFormToPayload(
  values: SectionFormValues,
  classId?: string | null
): Record<string, any> {
  return {
    class_id: classId ?? undefined,
    name: values.name.trim(),
    code: values.code.trim() || null,
    capacity: values.capacity ? Number(values.capacity) : null,
    group_url: values.groupUrl.trim() || null,
    is_active: values.isActive,
    subject_teachers_enrollment_mode: values.enrollmentMode,
    subject_teachers_self_select_requires_approval:
      values.selfSelectRequiresApproval,
    // sementara jadwal kita kirim string sederhana (nanti bisa diganti JSON complex)
    schedule: values.scheduleNote.trim() || null,
  };
}

/* ========= API Hooks ========= */

function useSectionDetail(sectionId?: string) {
  return useQuery({
    queryKey: ["class-section-detail", sectionId],
    enabled: !!sectionId,
    queryFn: async () => {
      if (!sectionId) throw new Error("No sectionId");
      // sesuaikan dengan shape response backend (diasumsikan { data: {...} })
      const res = await axios.get<{ data: ApiClassSection }>(
        `/s/class-sections/${sectionId}`
      );
      return res.data.data;
    },
  });
}

type Params = {
  schoolId?: string;
  school_slug?: string;
  classId?: string;
  sectionId?: string;
};

export default function SchoolSectionFormPage() {
  const params = useParams<Params>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const classId = params.classId ?? undefined;
  const sectionId = params.sectionId ?? undefined;
  const isEdit = !!sectionId;

  /* Breadcrumb */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: isEdit ? "Edit Kelas" : "Tambah Kelas",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Kelas" },
        {
          label: "Semua Kelas",
          href: classId ? `../${classId}` : "semua-kelas",
        },
        { label: isEdit ? "Edit" : "Tambah" },
      ],
      actions: null,
    });
  }, [setHeader, isEdit, classId]);

  const {
    data: detail,
    isLoading: isLoadingDetail,
    isError: isDetailError,
  } = useSectionDetail(sectionId);

  const [form, setForm] = useState<SectionFormValues>({
    name: "",
    code: "",
    capacity: "",
    groupUrl: "",
    isActive: true,
    enrollmentMode: "assigned",
    selfSelectRequiresApproval: false,
    scheduleNote: "",
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  /* Sync detail -> form */
  useEffect(() => {
    if (detail && isEdit) {
      setForm(mapApiToForm(detail));
    }
  }, [detail, isEdit]);

  const handleChange =
    (field: keyof SectionFormValues) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleToggle =
    (field: keyof SectionFormValues) => (checked: boolean) => {
      setForm((prev) => ({ ...prev, [field]: checked }));
    };

  const mutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      const payload = mapFormToPayload(form, classId);

      if (isEdit && sectionId) {
        const res = await axios.patch(
          `/s/class-sections/${sectionId}`,
          payload
        );
        return res.data;
      }

      const res = await axios.post(`/s/class-sections`, payload);
      return res.data;
    },
    onSuccess: () => {
      setSuccessMsg(
        isEdit ? "Kelas berhasil diperbarui" : "Kelas berhasil dibuat"
      );
      // invalidasi list sections
      qc.invalidateQueries({
        queryKey: ["sections-user-all", classId ?? null],
      });

      // Kembali ke list
      setTimeout(() => {
        if (classId) {
          navigate("..");
        } else {
          navigate(-1);
        }
      }, 800);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Gagal menyimpan data. Coba lagi.";
      setErrorMsg(msg);
    },
  });

  const isBusy = mutation.isPending || (isEdit && isLoadingDetail);

  const handleBack = () => {
    if (classId) {
      navigate(-1);
    } else {
      navigate("/"); // fallback
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg("Nama kelas wajib diisi.");
      return;
    }
    if (form.capacity && Number.isNaN(Number(form.capacity))) {
      setErrorMsg("Kapasitas harus berupa angka.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="mx-auto flex max-w-4xl flex-col gap-6 py-4">
        {/* Header lokal */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-lg font-semibold md:text-xl">
              {isEdit ? "Edit Kelas" : "Tambah Kelas"}
            </h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              Atur informasi rombongan belajar yang akan digunakan untuk jadwal,
              pengajar, dan siswa.
            </p>
          </div>
        </div>

        {/* Kalau detail error saat edit */}
        {isEdit && isDetailError && (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="py-3 text-sm text-destructive">
              Tidak bisa memuat data kelas. Coba kembali ke halaman sebelumnya.
            </CardContent>
          </Card>
        )}

        {/* Form utama */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="h-4 w-4 text-primary" />
                Informasi Kelas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nama Kelas</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: X IPA 1 - Pagi"
                    value={form.name}
                    onChange={handleChange("name")}
                    disabled={isBusy}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nama yang akan tampil di jadwal dan dashboard.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="code">Kode (opsional)</Label>
                  <Input
                    id="code"
                    placeholder="Misal: XIPA1-PG"
                    value={form.code}
                    onChange={handleChange("code")}
                    disabled={isBusy}
                  />
                  <p className="text-xs text-muted-foreground">
                    Berguna untuk identitas internal atau grup WhatsApp.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="capacity">Kapasitas (opsional)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={0}
                    placeholder="Misal: 30"
                    value={form.capacity}
                    onChange={handleChange("capacity")}
                    disabled={isBusy}
                  />
                  <p className="text-xs text-muted-foreground">
                    Biarkan kosong jika tidak dibatasi.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="groupUrl">Link Grup (opsional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="groupUrl"
                      placeholder="https://chat.whatsapp.com/..."
                      value={form.groupUrl}
                      onChange={handleChange("groupUrl")}
                      disabled={isBusy}
                    />
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Link grup WA/Telegram resmi kelas ini.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mode & status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Mode Mapel &amp; Pengajar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mode penugasan</Label>
                  <div className="flex flex-col gap-1.5">
                    {ENROLLMENT_MODE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            enrollmentMode: opt.value,
                          }))
                        }
                        className={`flex items-start justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                          form.enrollmentMode === opt.value
                            ? "border-primary bg-primary/5"
                            : "border-border/60 hover:bg-muted/40"
                        }`}
                        disabled={isBusy}
                      >
                        <span className="font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                    <div className="space-y-0.5 text-xs">
                      <div className="font-medium">Kelas aktif</div>
                      <div className="text-muted-foreground">
                        Jika nonaktif, siswa tidak akan melihat jadwal baru.
                      </div>
                    </div>
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={handleToggle("isActive")}
                      disabled={isBusy}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                    <div className="space-y-0.5 text-xs">
                      <div className="font-medium">
                        Perlu approval saat siswa pilih sendiri
                      </div>
                      <div className="text-muted-foreground">
                        Hanya berlaku jika mode = &quot;Siswa pilih
                        sendiri&quot;.
                      </div>
                    </div>
                    <Switch
                      checked={form.selfSelectRequiresApproval}
                      onCheckedChange={handleToggle(
                        "selfSelectRequiresApproval"
                      )}
                      disabled={isBusy || form.enrollmentMode !== "self_select"}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jadwal catatan sederhana (opsional) */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                Catatan Jadwal (opsional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="scheduleNote">Ringkasan jadwal</Label>
              <Textarea
                id="scheduleNote"
                rows={3}
                placeholder="Contoh: Senin–Kamis, 07.00–08.30 di Ruang 201. Jadwal detail diatur di modul jadwal."
                value={form.scheduleNote}
                onChange={handleChange("scheduleNote")}
                disabled={isBusy}
              />
              <p className="text-xs text-muted-foreground">
                Hanya catatan singkat. Jadwal detail tetap diatur di modul
                jadwal.
              </p>
            </CardContent>
          </Card>

          {/* Error / success */}
          {(errorMsg || successMsg) && (
            <Card className="border-muted/60 bg-muted/10">
              <CardContent className="py-3 text-xs">
                {errorMsg && <div className="text-destructive">{errorMsg}</div>}
                {successMsg && (
                  <div className="text-emerald-600">{successMsg}</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={isBusy}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Batal
            </Button>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={isBusy} className="min-w-[140px]">
                {isBusy
                  ? isEdit
                    ? "Menyimpan..."
                    : "Membuat..."
                  : isEdit
                  ? "Simpan Perubahan"
                  : "Buat Kelas"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
