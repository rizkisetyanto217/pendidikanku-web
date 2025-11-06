// src/pages/sekolahislamku/school/SchoolProfile.shadcn.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Image as ImageIcon,
  X,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== shadcn/ui =====
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

/* ================= Helpers ================= */


const fullAddress = (p?: SchoolProfileForm["address"]) => {
  if (!p) return "-";
  const parts = [
    p.line,
    p.village,
    p.district,
    p.city,
    p.province,
    p.postal,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "-";
};

const isoToYmd = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");
const ymdToIsoUTC = (ymd: string | null | undefined) =>
  ymd ? new Date(`${ymd}T00:00:00.000Z`).toISOString() : null;

/* ================= Types ================= */
export type SchoolProfileForm = {
  name: string;
  npsn?: string | null;
  accreditation?: "A" | "B" | "C" | "-" | "" | null;
  foundedAt?: string | null; // ISO

  address?: {
    line?: string | null;
    village?: string | null;
    district?: string | null;
    city?: string | null;
    province?: string | null;
    postal?: string | null;
  };

  contact?: {
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  };

  headmaster?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  };

  vision?: string | null;
  mission?: string[] | null;
  logoUrl?: string | null;

  mapEmbedUrl?: string | null;
  gallery?: Array<{ id: string; url: string; caption?: string }>;
};

type SchoolProfileProps = {
  showBack?: boolean; // default: false
  backTo?: string; // optional: kalau diisi, navigate ke path ini, kalau tidak pakai nav(-1)
  backLabel?: string; // teks tombol
};

/* ================= Page ================= */
const SchoolProfile: React.FC<SchoolProfileProps> = ({
  showBack = false,
  backTo,
}) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  // ------ DATA DUMMY disimpan di state ------
  const [data, setData] = useState<SchoolProfileForm>({
    name: "Sekolah Islamku",
    npsn: "20251234",
    accreditation: "A",
    foundedAt: "2010-07-01T00:00:00.000Z",
    address: {
      line: "Jl. Cendekia No. 10",
      village: "Mekarjaya",
      district: "Cibeunying",
      city: "Bandung",
      province: "Jawa Barat",
      postal: "40111",
    },
    contact: {
      phone: "0812-3456-7890",
      email: "info@sekolahislamku.sch.id",
      website: "https://sekolahislamku.sch.id",
    },
    headmaster: {
      name: "Ust. Ahmad Fulan, S.Pd",
      phone: "0812-1111-2222",
      email: "ahmad@sekolahislamku.sch.id",
    },
    vision:
      "Mewujudkan generasi berakhlak mulia, berilmu, dan berdaya saing global.",
    mission: [
      "Pendidikan berlandaskan Al-Qur'an dan Sunnah.",
      "Mengembangkan karakter berakhlak mulia.",
    ],
    logoUrl: null,
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.1804!2d110.370!3d-7.867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNTInMDAuMCJTIDExMMKwMjInMTIuMCJF!5e0!3m2!1sen!2sid!4v1690000000000",
    gallery: [
      {
        id: "g1",
        url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop",
        caption: "Perpustakaan",
      },
      {
        id: "g2",
        url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop",
        caption: "Lapangan",
      },
      {
        id: "g3",
        url: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop",
        caption: "Kelas",
      },
    ],
  });

  const [editOpen, setEditOpen] = useState(false);
  const foundedYear = useMemo(() => {
    if (!data?.foundedAt) return "-";
    const d = new Date(data.foundedAt);
    return Number.isNaN(d.getTime()) ? "-" : d.getFullYear();
  }, [data?.foundedAt]);

  return (
    <div className="w-full">
      <main className="w-full">
        <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Main Content */}
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Header Section */}
            <div className="md:flex hidden gap-3 items-center">
              {showBack && (
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  className="cursor-pointer self-start"
                  size="icon"
                >
                  <ArrowLeft size={20} />
                </Button>
              )}
              <h1 className="font-semibold text-lg md:text-xl">
                Profil Sekolah
              </h1>
            </div>

            {/* Header Card */}
            <Card className="overflow-hidden">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Logo */}
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl grid place-items-center overflow-hidden border shrink-0 mx-auto sm:mx-0 bg-card text-card-foreground">
                    {data?.logoUrl ? (
                      <img
                        src={data.logoUrl}
                        alt="Logo Sekolah"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 size={28} />
                    )}
                  </div>

                  {/* Info Sekolah */}
                  <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight">
                      {data?.name ?? "Sekolah"}
                    </h1>

                    {/* Badges */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center sm:justify-start">
                      {data?.accreditation && (
                        <Badge variant="default">
                          Akreditasi {data.accreditation}
                        </Badge>
                      )}
                      <Badge variant="outline">Berdiri {foundedYear}</Badge>
                    </div>

                    {/* NPSN & Alamat */}
                    <div className="space-y-2">
                      {data?.npsn && (
                        <div className="flex justify-center sm:justify-start">
                          <Badge variant="outline">
                            <span>NPSN: {data.npsn}</span>
                          </Badge>
                        </div>
                      )}
                      <div className="text-sm flex items-start justify-center sm:justify-start gap-1 text-muted-foreground">
                        <MapPin size={14} className="mt-0.5 shrink-0" />
                        <span className="text-center sm:text-left leading-relaxed">
                          {fullAddress(data?.address)}
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
                    Kontak Sekolah
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <InfoRow
                    icon={<Phone size={16} />}
                    label="Telepon"
                    value={data?.contact?.phone ?? "-"}
                  />
                  <InfoRow
                    icon={<Mail size={16} />}
                    label="Email"
                    value={data?.contact?.email ?? "-"}
                  />
                  <InfoRow
                    icon={<Globe size={16} />}
                    label="Website"
                    value={
                      data?.contact?.website ? (
                        <a
                          href={data.contact.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 underline break-all text-primary"
                        >
                          {data.contact.website}{" "}
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
                  <InfoRow
                    icon={<UserCog size={16} />}
                    label="Nama"
                    value={data?.headmaster?.name ?? "-"}
                  />
                  <InfoRow
                    icon={<Phone size={16} />}
                    label="Kontak"
                    value={data?.headmaster?.phone ?? "-"}
                  />
                  <InfoRow
                    icon={<Mail size={16} />}
                    label="Email"
                    value={data?.headmaster?.email ?? "-"}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Visi & Misi */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Visi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {data?.vision ?? "-"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Misi</CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.mission?.length ? (
                    <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed text-muted-foreground">
                      {data.mission.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-muted-foreground">-</div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Peta & Galeri */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Navigation size={18} />
                    Lokasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.mapEmbedUrl ? (
                    <div className="rounded-xl overflow-hidden border">
                      <iframe
                        src={data.mapEmbedUrl}
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
                    <EmptyBlock icon={<Navigation />} text="Belum ada peta." />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ImageIcon size={18} />
                    Galeri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.gallery && data.gallery.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 md:gap-3">
                      {data.gallery.slice(0, 6).map((g) => (
                        <figure
                          key={g.id}
                          className="rounded-lg overflow-hidden border"
                        >
                          <img
                            src={g.url}
                            alt={g.caption ?? "Foto"}
                            className="w-full h-24 sm:h-32 lg:h-28 object-cover"
                            loading="lazy"
                          />
                          {g.caption && (
                            <figcaption
                              className="px-2 py-1 text-sm truncate text-muted-foreground"
                              title={g.caption}
                            >
                              {g.caption}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  ) : (
                    <EmptyBlock icon={<ImageIcon />} text="Belum ada foto." />
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Actions */}
            <div className="flex items-center justify-center sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setEditOpen(true)}
                className="w-full sm:w-auto"
              >
                Edit Profil
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* ===== Modal Edit Profil (shadcn Dialog) ===== */}
      <ModalEditProfilSchool
        open={editOpen}
        onOpenChange={setEditOpen}
        initial={data}
        onSubmit={(v) => {
          setData(v); // TODO: ganti ke PUT API
          setEditOpen(false);
        }}
      />
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
   ModalEditProfilSchool — shadcn Dialog + form controls
   ========================================================= */
function ModalEditProfilSchool({
  open,
  onOpenChange,
  initial,
  onSubmit,
  saving = false,
  error = null,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: SchoolProfileForm;
  onSubmit: (v: SchoolProfileForm) => void | Promise<void>;
  saving?: boolean;
  error?: string | null;
}) {
  const [form, setForm] = useState<SchoolProfileForm>(initial);
  const [missionText, setMissionText] = useState(
    (initial.mission ?? []).join("\n")
  );

  useEffect(() => {
    if (!open) return;
    setForm(initial);
    setMissionText((initial.mission ?? []).join("\n"));
  }, [open, initial]);

  const canSubmit = !!form.name && !saving;

  const set = <K extends keyof SchoolProfileForm>(
    k: K,
    v: SchoolProfileForm[K]
  ) => setForm((s) => ({ ...s, [k]: v }));

  const setAddr = <K extends keyof NonNullable<SchoolProfileForm["address"]>>(
    k: K,
    v: NonNullable<SchoolProfileForm["address"]>[K]
  ) => setForm((s) => ({ ...s, address: { ...(s.address ?? {}), [k]: v } }));

  const setContact = <
    K extends keyof NonNullable<SchoolProfileForm["contact"]>
  >(
    k: K,
    v: NonNullable<SchoolProfileForm["contact"]>[K]
  ) => setForm((s) => ({ ...s, contact: { ...(s.contact ?? {}), [k]: v } }));

  const setHead = <
    K extends keyof NonNullable<SchoolProfileForm["headmaster"]>
  >(
    k: K,
    v: NonNullable<SchoolProfileForm["headmaster"]>[K]
  ) =>
    setForm((s) => ({ ...s, headmaster: { ...(s.headmaster ?? {}), [k]: v } }));

  const missionsFromText = (s: string) =>
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="space-y-6 sm:space-y-8">
              {!!error && (
                <div className="rounded-lg px-4 py-3 text-sm bg-destructive/10 text-destructive">
                  {error}
                </div>
              )}

              {/* Identitas Sekolah */}
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
                    onChange={(v) => set("npsn", v)}
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
                        <SelectItem value="-">-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">
                      Tanggal Berdiri
                    </Label>
                    <Input
                      type="date"
                      value={isoToYmd(form.foundedAt)}
                      onChange={(e) =>
                        set("foundedAt", ymdToIsoUTC(e.target.value))
                      }
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </section>

              {/* Alamat */}
              <section>
                <BlockTitle title="Alamat" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FieldText
                      label="Alamat"
                      value={form.address?.line ?? ""}
                      onChange={(v) => setAddr("line", v)}
                    />
                  </div>
                  <FieldText
                    label="Kelurahan / Desa"
                    value={form.address?.village ?? ""}
                    onChange={(v) => setAddr("village", v)}
                  />
                  <FieldText
                    label="Kecamatan"
                    value={form.address?.district ?? ""}
                    onChange={(v) => setAddr("district", v)}
                  />
                  <FieldText
                    label="Kota / Kabupaten"
                    value={form.address?.city ?? ""}
                    onChange={(v) => setAddr("city", v)}
                  />
                  <FieldText
                    label="Provinsi"
                    value={form.address?.province ?? ""}
                    onChange={(v) => setAddr("province", v)}
                  />
                  <FieldText
                    label="Kode Pos"
                    value={form.address?.postal ?? ""}
                    onChange={(v) => setAddr("postal", v)}
                  />
                </div>
              </section>

              {/* Kontak */}
              <section>
                <BlockTitle title="Kontak" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldText
                    label="Telepon"
                    value={form.contact?.phone ?? ""}
                    onChange={(v) => setContact("phone", v)}
                  />
                  <FieldText
                    label="Email"
                    value={form.contact?.email ?? ""}
                    onChange={(v) => setContact("email", v)}
                  />
                  <div className="sm:col-span-2">
                    <FieldText
                      label="Website"
                      value={form.contact?.website ?? ""}
                      onChange={(v) => setContact("website", v)}
                      placeholder="https://…"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldText
                      label="URL Logo (opsional)"
                      value={form.logoUrl ?? ""}
                      onChange={(v) => set("logoUrl", v)}
                    />
                  </div>
                </div>
              </section>

              {/* Kepala Sekolah */}
              <section>
                <BlockTitle title="Kepala Sekolah" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FieldText
                      label="Nama"
                      value={form.headmaster?.name ?? ""}
                      onChange={(v) => setHead("name", v)}
                    />
                  </div>
                  <FieldText
                    label="Telepon"
                    value={form.headmaster?.phone ?? ""}
                    onChange={(v) => setHead("phone", v)}
                  />
                  <FieldText
                    label="Email"
                    value={form.headmaster?.email ?? ""}
                    onChange={(v) => setHead("email", v)}
                  />
                </div>
              </section>

              {/* Visi & Misi */}
              <section>
                <BlockTitle title="Visi & Misi" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Visi</Label>
                    <Textarea
                      rows={5}
                      value={form.vision ?? ""}
                      onChange={(e) => set("vision", e.target.value)}
                      className="rounded-xl resize-none"
                      placeholder="Tulis visi sekolah…"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">
                      Misi (satu baris satu poin)
                    </Label>
                    <Textarea
                      rows={5}
                      value={missionText}
                      onChange={(e) => setMissionText(e.target.value)}
                      className="rounded-xl resize-none"
                      placeholder={"Tulis misi 1\nTulis misi 2\n…"}
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
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
              onClick={() =>
                onSubmit({
                  ...form,
                  npsn: form.npsn?.trim() || null,
                  vision: (form.vision?.trim() || null) as string | null,
                  mission: missionsFromText(missionText),
                })
              }
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {saving ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
      <DialogFooter /> {/* (opsional) menjaga struktur konsisten */}
    </Dialog>
  );
}

/* ---- sub-komponen kecil untuk modal ---- */
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

function BlockTitle({ title }: { title: string }) {
  return <div className="font-semibold text-base opacity-90 mb-4">{title}</div>;
}
