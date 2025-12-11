// src/pages/sekolahislamku/pages/academic/SchoolSubjectForm.tsx
import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "@/lib/axios";

/* icons */
import { ArrowLeft } from "lucide-react";

/* ---------- BreadCrum ---------- */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* Context user dari simple-context (JWT) */
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* shadcn/ui */
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import CPicturePreview from "@/components/costum/common/CPicturePreview";
import CActionsButton from "@/components/costum/common/buttons/CActionsButton";

/* ================= Types (re-use dari table) ================= */
type SubjectStatus = "active" | "inactive";

type SubjectRow = {
  id: string; // subject_id
  code: string;
  name: string;
  status: SubjectStatus;
  class_count: number;
  total_hours_per_week: number | null;
  book_count: number;
  assignments: any[];
};

/* ================= Const ================= */
const ADMIN_PREFIX = "/a";

/* ================= Helpers ================= */
function extractErrorMessage(err: any) {
  const d = err?.response?.data;
  if (!d) return err?.message || "Request error";
  if (typeof d === "string") return d;
  if (d.message) return d.message;
  if (Array.isArray(d.errors)) {
    return d.errors
      .map((e: any) => [e.field, e.message].filter(Boolean).join(": "))
      .join("\n");
  }
  try {
    return JSON.stringify(d);
  } catch {
    return String(d);
  }
}

/* ================= Mutations ================= */
function useCreateSubjectMutation(school_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: FormData) => {
      const { data } = await axios.post(
        `${ADMIN_PREFIX}/${encodeURIComponent(school_id)}/subjects`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects-merged", school_id] });
    },
  });
}

function useUpdateSubjectMutation(school_id: string, subjectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (form: FormData) => {
      const { data } = await axios.patch(
        `${ADMIN_PREFIX}/${encodeURIComponent(
          school_id
        )}/subjects/${subjectId}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects-merged", school_id] });
    },
  });
}

/* ================= Page ================= */
type LocationState = {
  subject?: SubjectRow;
};

const SchoolSubjectForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const subjectFromState = state.subject;

  const { data: currentUser } = useCurrentUser();
  const schoolId = currentUser?.membership?.school_id ?? "";

  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: isEdit ? "Edit Mapel" : "Tambah Mapel",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Mapel", href: "akademik/mata-pelajaran" },
        { label: isEdit ? "Edit" : "Tambah" },
      ],
      showBack: true,
    });
  }, [setHeader, isEdit]);

  const [code, setCode] = useState(subjectFromState?.code ?? "");
  const [name, setName] = useState(subjectFromState?.name ?? "");
  const [desc, setDesc] = useState("");
  const [isActive, setIsActive] = useState(
    subjectFromState?.status ? subjectFromState.status === "active" : true
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);

    if (newFile) {
      setPreview(URL.createObjectURL(newFile));
    } else {
      setPreview(null);
    }
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !subjectFromState) return;
    setCode(subjectFromState.code ?? "");
    setName(subjectFromState.name ?? "");
    setIsActive(subjectFromState.status === "active");
    setDesc("");
    setFile(null);
  }, [isEdit, subjectFromState?.id]);

  const createMutation = useCreateSubjectMutation(schoolId || "");
  const updateMutation = useUpdateSubjectMutation(
    schoolId || "",
    id ?? subjectFromState?.id ?? ""
  );

  const loading = createMutation.isPending || updateMutation.isPending;

  const handleBack = () => navigate(-1);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();


    if (!schoolId) {
      setErrorMsg("Context sekolah tidak ditemukan.");
      return;
    }
    if (!name.trim()) {
      setErrorMsg("Nama mapel wajib diisi.");
      return;
    }

    const fd = new FormData();
    fd.append("subject_name", name.trim());

    if (code.trim()) fd.append("subject_code", code.trim());
    if (desc.trim()) fd.append("subject_desc", desc.trim());
    if (file) fd.append("file", file);

    // untuk edit, backend sudah support subject_is_active
    if (isEdit) {
      fd.append("subject_is_active", isActive ? "true" : "false");
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(fd);
      } else {
        await createMutation.mutateAsync(fd);
      }
      navigate(-1);
    } catch (err) {
      setErrorMsg(extractErrorMessage(err));
    }
  };

  return (
    <div className="w-full">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-6">
          {/* Header minimal (back + title) */}
          <div className="md:flex hidden items-center gap-3">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-semibold text-lg md:text-xl">
                {isEdit ? "Edit Mapel" : "Tambah Mapel"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEdit
                  ? "Perbarui informasi mata pelajaran."
                  : "Buat mata pelajaran baru untuk sekolah ini."}
              </p>
            </div>
          </div>

          <Card>
            <form id="subjectForm" onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-4">

                {/* === FORM FIELD === */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="subject_code">Kode (opsional)</Label>
                    <Input
                      id="subject_code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="B-Ing-1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Contoh: MTK-7A, B-IND-1, dsb.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="subject_name">Nama *</Label>
                    <Input
                      id="subject_name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Bahasa Inggris"
                    />
                  </div>
                </div>

                {isEdit && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="is-active"
                      checked={isActive}
                      onCheckedChange={(v) => setIsActive(Boolean(v))}
                    />
                    <Label htmlFor="is-active">Aktif</Label>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <Label htmlFor="subject_desc">Deskripsi (opsional)</Label>
                  <Textarea
                    id="subject_desc"
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Deskripsi singkat mapel…"
                  />
                </div>

                {/* Upload Image */}
                <Label>Gambar (opsional)</Label>
                <CPicturePreview
                  file={file}
                  preview={preview}
                  onFileChange={handleFileChange}
                />

                {errorMsg && (
                  <div className="text-sm text-destructive whitespace-pre-line">
                    {errorMsg}
                  </div>
                )}
              </CardContent>

              {/* ===== FOOTER BUTTONS ===== */}
              <CardFooter className="flex justify-end">
                <CActionsButton
                  onCancel={handleBack}
                  onSave={() =>
                    document.getElementById("subjectForm")?.dispatchEvent(
                      new Event("submit", { cancelable: true, bubbles: true })
                    )
                  }
                  loadingSave={loading}
                />

              </CardFooter>
            </form>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default SchoolSubjectForm;
