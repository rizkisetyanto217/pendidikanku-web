// src/pages/sekolahislamku/school/SchoolProfile.shadcn.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";
import {
  Building2,
  Award,
  MapPin,
  Phone,
  Mail,
  Globe,
  UserCog,
  ExternalLink,
  Navigation,
  X,
  ArrowLeft,
  Users,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  ApiSchool,
  ApiSchoolProfile,
  SchoolUi,
} from "./types/schoolProfile";
import { adaptToUi, adaptFromUi } from "./types/schoolProfile";

/* =================== Helpers =================== */
type ApiList<T> = { message: string; data: T[]; pagination?: any };

/* =================== Data Fetch =================== */
const fetchSchool = async (id: string): Promise<ApiSchool | null> => {
  const { data } = await axios.get<ApiList<ApiSchool>>(
    `/public/schools/list?id=${id}`
  );
  return data?.data?.[0] ?? null;
};

const fetchProfile = async (id: string): Promise<ApiSchoolProfile | null> => {
  try {
    const { data } = await axios.get<ApiSchoolProfile>(
      `/api/schools/${id}/profile`
    );
    return data ?? null;
  } catch (e: any) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
};

const upsertProfile = async (
  schoolId: string,
  payload: Partial<ApiSchoolProfile> & { school_profile_id?: string }
) => {
  if (payload.school_profile_id) {
    const { data } = await axios.patch<ApiSchoolProfile>(
      `/api/school-profiles/${payload.school_profile_id}`,
      payload
    );
    return data;
  }
  // create new
  const { data } = await axios.post<ApiSchoolProfile>(
    `/api/schools/${schoolId}/profile`,
    payload
  );
  return data;
};

const patchSchool = async (schoolId: string, payload: Partial<ApiSchool>) => {
  const { data } = await axios.patch<ApiSchool>(
    `/api/schools/${schoolId}`,
    payload
  );
  return data;
};

/* =================== Page =================== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

const SchoolProfile: React.FC<Props> = ({ showBack = false, backTo }) => {
  const navigate = useNavigate();
  const { schoolId } = useParams<{ schoolId: string }>();
  const q = useQueryClient();

  // Queries
  const qSchool = useQuery({
    queryKey: ["school", schoolId],
    queryFn: () => fetchSchool(schoolId!),
    enabled: !!schoolId,
  });
  const qProfile = useQuery({
    queryKey: ["school-profile", schoolId],
    queryFn: () => fetchProfile(schoolId!),
    enabled: !!schoolId,
  });

  const isLoading = qSchool.isLoading || qProfile.isLoading;
  const error = (qSchool.error || qProfile.error) as any | null;

  const ui: SchoolUi | null = useMemo(() => {
    if (!qSchool.data) return null;
    return adaptToUi(qSchool.data, qProfile.data ?? undefined);
  }, [qSchool.data, qProfile.data]);

  const [editOpen, setEditOpen] = useState(false);

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  return (
    <div className="w-full">
      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
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
                Profil Sekolah
              </h1>
            </div>

            {/* States */}
            {isLoading && (
              <Card>
                <CardContent className="p-6">Memuat…</CardContent>
              </Card>
            )}
            {error && (
              <Card>
                <CardContent className="p-6 text-sm text-destructive">
                  Gagal memuat data: {error?.message ?? "Unknown error"}
                </CardContent>
              </Card>
            )}

            {ui && (
              <>
                {/* Header Card */}
                <Card className="overflow-hidden">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* Logo */}
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl grid place-items-center overflow-hidden border shrink-0 mx-auto sm:mx-0 bg-card text-card-foreground">
                        {ui.logoUrl ? (
                          <img
                            src={ui.logoUrl}
                            alt="Logo Sekolah"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 size={28} />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight">
                          {ui.name}
                        </h1>

                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                          {ui.accreditation && (
                            <Badge>Akreditasi {ui.accreditation}</Badge>
                          )}
                          {typeof ui.foundedYear === "number" && (
                            <Badge variant="outline">
                              Berdiri {ui.foundedYear}
                            </Badge>
                          )}
                          {ui.isBoarding && (
                            <Badge
                              variant="secondary"
                              className="inline-flex gap-1"
                            >
                              <Home className="h-3 w-3" /> Boarding
                            </Badge>
                          )}
                          {ui.capacity != null && (
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" /> Kapasitas{" "}
                              {ui.capacity}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          {!!ui?.npsn && (
                            <div className="flex justify-center sm:justify-start">
                              <Badge variant="outline">
                                <span>NPSN: {ui.npsn}</span>
                              </Badge>
                            </div>
                          )}
                          <div className="text-sm flex items-start justify-center sm:justify-start gap-1 text-muted-foreground">
                            <MapPin size={14} className="mt-0.5 shrink-0" />
                            <span className="text-center sm:text-left leading-relaxed">
                              {ui.address || "-"}
                              {ui.city ? `, ${ui.city}` : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Kontak & Kepala Sekolah */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Phone size={18} />
                        Kontak
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <InfoRow
                        icon={<Phone size={16} />}
                        label="Telepon"
                        value={ui.contactPhone ?? "-"}
                      />
                      <InfoRow
                        icon={<Mail size={16} />}
                        label="Email"
                        value={ui.contactEmail ?? "-"}
                      />
                      <InfoRow
                        icon={<Globe size={16} />}
                        label="Website"
                        value={
                          ui.website ? (
                            <a
                              href={ui.website}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 underline break-all text-primary"
                            >
                              {ui.website}{" "}
                              <ExternalLink size={12} className="shrink-0" />
                            </a>
                          ) : (
                            "-"
                          )
                        }
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Award size={18} />
                        Kepala Sekolah
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      {/* Kita hanya punya principal_user_id di BE */}
                      <InfoRow
                        icon={<UserCog size={16} />}
                        label="User ID"
                        value={ui.principalUserId ?? "-"}
                      />
                      <div className="text-xs text-muted-foreground">
                        *Untuk menampilkan nama/email kepala sekolah, lakukan
                        fetch detail user berdasarkan{" "}
                        <code>principal_user_id</code>.
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Deskripsi & Peta */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Deskripsi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {ui.description || "-"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Navigation size={18} /> Lokasi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {ui.mapsUrl ? (
                        <div className="rounded-xl overflow-hidden border">
                          <iframe
                            src={ui.mapsUrl}
                            title="Peta Sekolah"
                            width="100%"
                            height="220"
                            className="md:h-64"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <EmptyBlock
                          icon={<Navigation />}
                          text="Belum ada peta."
                        />
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Aksi */}
                <div className="flex items-center justify-center sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setEditOpen(true)}
                    className="w-full sm:w-auto"
                  >
                    Edit Profil
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {!!ui && (
        <ModalEditProfilSchool
          open={editOpen}
          onOpenChange={setEditOpen}
          initial={ui}
          onSubmit={async (v) => {
            // validasi ringan sesuai constraint
            if (
              v.foundedYear &&
              (v.foundedYear < 1800 || v.foundedYear > new Date().getFullYear())
            ) {
              throw new Error("Tahun berdiri harus 1800..tahun saat ini.");
            }
            if (v.capacity != null && v.capacity < 0) {
              throw new Error("Kapasitas siswa minimal 0.");
            }

            const { schoolsPatch, profilePatch } = adaptFromUi(v);

            // patch paralel (profile bisa create or patch)
            const currentProfileId = qProfile.data?.school_profile_id;
            await Promise.all([
              patchSchool(v.id, schoolsPatch),
              upsertProfile(v.id, {
                ...profilePatch,
                school_profile_id: currentProfileId,
              }),
            ]);

            await Promise.all([
              q.invalidateQueries({ queryKey: ["school", v.id] }),
              q.invalidateQueries({ queryKey: ["school-profile", v.id] }),
            ]);
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default SchoolProfile;

/* =============== Small UI =============== */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-xs opacity-80 mb-1 text-muted-foreground">
          {label}
        </div>
        <div className="text-sm leading-relaxed">{value}</div>
      </div>
    </div>
  );
}
function EmptyBlock({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-6 text-sm",
        "flex flex-col sm:flex-row items-center justify-center gap-3",
        "text-center sm:text-left text-muted-foreground"
      )}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}

/* =========================================================
   ModalEditProfilSchool — hanya field yg ada di BE
   ========================================================= */
function ModalEditProfilSchool({
  open,
  onOpenChange,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: SchoolUi;
  onSubmit: (v: SchoolUi) => Promise<void> | void;
}) {
  const [form, setForm] = useState<SchoolUi>(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setForm(initial);
    setErr(null);
    setSaving(false);
  }, [open, initial]);

  const set = <K extends keyof SchoolUi>(k: K, v: SchoolUi[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const canSubmit = !!form.name && !saving;

  const submit = async () => {
    try {
      setSaving(true);
      setErr(null);
      await onSubmit(form);
    } catch (e: any) {
      setErr(e?.message ?? "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          <div className="px-4 sm:px-6 py-4 border-b flex items-center justify-between">
            <DialogHeader className="p-0">
              <DialogTitle className="flex items-center gap-3">
                <Building2 size={20} className="text-primary" />
                Edit Profil Sekolah
              </DialogTitle>
            </DialogHeader>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              <X size={18} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="space-y-6 sm:space-y-8">
              {!!err && (
                <div className="rounded-lg px-4 py-3 text-sm bg-destructive/10 text-destructive">
                  {err}
                </div>
              )}

              {/* Identitas */}
              <section>
                <BlockTitle title="Identitas Sekolah" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldText
                    label="Nama Sekolah"
                    value={form.name}
                    onChange={(v) => set("name", v)}
                    required
                  />
                  <FieldText
                    label="NPSN"
                    value={form.npsn ?? ""}
                    onChange={(v) => set("npsn", v || null)}
                  />

                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Akreditasi</Label>
                    <Select
                      value={form.accreditation ?? ""}
                      onValueChange={(val) =>
                        set("accreditation", (val || null) as any)
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">—</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="Ungraded">Ungraded</SelectItem>
                        <SelectItem value="-">-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <FieldNumber
                    label="Tahun Berdiri"
                    value={form.foundedYear ?? ""}
                    onChange={(v) =>
                      set("foundedYear", v === "" ? null : Number(v))
                    }
                    placeholder="mis. 2010"
                  />
                </div>
              </section>

              {/* Alamat & Kapasitas */}
              <section>
                <BlockTitle title="Alamat & Kapasitas" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FieldText
                      label="Alamat Sekolah"
                      value={form.address ?? ""}
                      onChange={(v) => set("address", v || null)}
                    />
                  </div>
                  <FieldText
                    label="Kota/Kabupaten (tampil)"
                    value={form.city ?? ""}
                    onChange={(v) => set("city", v || null)}
                  />
                  <FieldNumber
                    label="Kapasitas Siswa"
                    value={form.capacity ?? ""}
                    onChange={(v) =>
                      set("capacity", v === "" ? null : Number(v))
                    }
                    placeholder="mis. 500"
                  />
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Boarding</Label>
                    <Select
                      value={form.isBoarding ? "yes" : "no"}
                      onValueChange={(val) => set("isBoarding", val === "yes")}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">Tidak</SelectItem>
                        <SelectItem value="yes">Ya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Kontak */}
              <section>
                <BlockTitle title="Kontak" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldText
                    label="Telepon"
                    value={form.contactPhone ?? ""}
                    onChange={(v) => set("contactPhone", v || null)}
                  />
                  <FieldText
                    label="Email"
                    value={form.contactEmail ?? ""}
                    onChange={(v) => set("contactEmail", v || null)}
                  />
                  <div className="sm:col-span-2">
                    <FieldText
                      label="Website"
                      value={form.website ?? ""}
                      onChange={(v) => set("website", v || null)}
                      placeholder="https://…"
                    />
                  </div>
                </div>
              </section>

              {/* Kepala Sekolah */}
              <section>
                <BlockTitle title="Kepala Sekolah" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldText
                    label="Principal User ID"
                    value={form.principalUserId ?? ""}
                    onChange={(v) => set("principalUserId", v || null)}
                    placeholder="UUID user kepala sekolah"
                  />
                </div>
              </section>

              {/* Deskripsi & Peta */}
              <section>
                <BlockTitle title="Deskripsi & Peta" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Deskripsi</Label>
                    <Textarea
                      rows={5}
                      value={form.description ?? ""}
                      onChange={(e) =>
                        set("description", e.target.value || null)
                      }
                      className="rounded-xl resize-none"
                      placeholder="Gambaran singkat sekolah…"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">
                      Google Maps URL
                    </Label>
                    <Input
                      value={form.mapsUrl ?? ""}
                      onChange={(e) => set("mapsUrl", e.target.value || null)}
                      className="rounded-xl"
                      placeholder="https://maps.google.com/…"
                    />
                  </div>
                </div>
              </section>

              {/* Sosial */}
              <section>
                <BlockTitle title="Sosial Media" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldText
                    label="Instagram"
                    value={form.socials?.instagram ?? ""}
                    onChange={(v) =>
                      set("socials", {
                        ...(form.socials || {}),
                        instagram: v || null,
                      })
                    }
                  />
                  <FieldText
                    label="YouTube"
                    value={form.socials?.youtube ?? ""}
                    onChange={(v) =>
                      set("socials", {
                        ...(form.socials || {}),
                        youtube: v || null,
                      })
                    }
                  />
                  <FieldText
                    label="Facebook"
                    value={form.socials?.facebook ?? ""}
                    onChange={(v) =>
                      set("socials", {
                        ...(form.socials || {}),
                        facebook: v || null,
                      })
                    }
                  />
                  <FieldText
                    label="TikTok"
                    value={form.socials?.tiktok ?? ""}
                    onChange={(v) =>
                      set("socials", {
                        ...(form.socials || {}),
                        tiktok: v || null,
                      })
                    }
                  />
                  <FieldText
                    label="WhatsApp"
                    value={form.socials?.whatsapp ?? ""}
                    onChange={(v) =>
                      set("socials", {
                        ...(form.socials || {}),
                        whatsapp: v || null,
                      })
                    }
                  />
                  <FieldText
                    label="WA Group Ikhwan"
                    value={form.socials?.waIkhwan ?? ""}
                    onChange={(v) =>
                      set("socials", {
                        ...(form.socials || {}),
                        waIkhwan: v || null,
                      })
                    }
                  />
                  <FieldText
                    label="WA Group Akhwat"
                    value={form.socials?.waAkhwat ?? ""}
                    onChange={(v) =>
                      set("socials", {
                        ...(form.socials || {}),
                        waAkhwat: v || null,
                      })
                    }
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Batal
            </Button>
            <Button
              disabled={!canSubmit}
              onClick={submit}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {saving ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
      <DialogFooter />
    </Dialog>
  );
}

function FieldText({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl"
      />
    </div>
  );
}
function FieldNumber({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | "";
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl"
      />
    </div>
  );
}
function BlockTitle({ title }: { title: string }) {
  return <div className="font-semibold text-base opacity-90 mb-4">{title}</div>;
}