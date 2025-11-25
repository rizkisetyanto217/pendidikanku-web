// src/pages/sekolahislamku/pages/user/UnnasignedStudentProfileStudent.tsx
import { useMemo, useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";

import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type LocationState = {
  fromLogin?: boolean;
  identifier?: string;
};

type UserProfileResponse = {
  user_profile_id: string;
  user_profile_user_id: string;

  user_profile_full_name_snapshot?: string | null;
  user_profile_gender?: string | null; // "male" / "female"
  user_profile_date_of_birth?: string | null; // RFC3339
  user_profile_city?: string | null;
  user_profile_location?: string | null;
  user_profile_bio?: string | null;

  user_profile_whatsapp_url?: string | null;
  user_profile_parent_name?: string | null;
  user_profile_parent_whatsapp_url?: string | null;

  user_profile_avatar_url?: string | null;

  user_profile_is_completed: boolean;
  user_profile_created_at: string;
  user_profile_updated_at: string;
};

// helper: konversi nomor ke URL WA (biar lulus validate:"url")
function toWhatsappUrl(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  // 08xxxxxxxxx → 62xxxxxxxxx
  if (digits.startsWith("0")) {
    return `https://wa.me/62${digits.slice(1)}`;
  }
  // 62xxxxxxxxx → oke
  if (digits.startsWith("62")) {
    return `https://wa.me/${digits}`;
  }
  // fallback: langsung pakai digits
  return `https://wa.me/${digits}`;
}

// helper: dari URL WA → nomor lebih manusiawi (08xxxx)
function fromWhatsappUrl(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname !== "wa.me") return url; // bukan pattern standar
    const path = u.pathname.replace(/\//g, ""); // "62xxxx"
    if (!path) return "";
    if (path.startsWith("62")) {
      return "0" + path.slice(2);
    }
    return path;
  } catch {
    return url;
  }
}

// helper format tanggal -> "YYYY-MM-DD"
function formatDateForAPI(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function UnnasignedStudentProfileStudent() {
  const { school_slug } = useParams<{ school_slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as LocationState;

  // 🔍 mode khusus: kalau URL mengandung "-new"
  const isNewFlow = location.pathname.includes("profil-new");

  // error & success messages
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [loadingStudent, setLoadingStudent] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // ====== Form state: Murid ======
  const [studentName, setStudentName] = useState(""); // snapshot nama (non-edit backend sekarang, tapi tetap ditampilkan)
  const [studentGender, setStudentGender] = useState<"male" | "female" | "">(
    ""
  ); // user_profile_gender
  const [studentBirthDate, setStudentBirthDate] = useState<Date | undefined>(
    undefined
  ); // Date → user_profile_date_of_birth (YYYY-MM-DD)
  const [studentCity, setStudentCity] = useState(""); // user_profile_city
  const [studentPhone, setStudentPhone] = useState(""); // user_profile_whatsapp_url (dalam bentuk nomor)
  const [studentProgram, setStudentProgram] = useState(""); // bebas (tidak dikirim ke profile untuk sekarang)

  // optional (collapse)
  const [studentAddress, setStudentAddress] = useState(""); // user_profile_location
  const [studentParentName, setStudentParentName] = useState(""); // user_profile_parent_name
  const [studentParentPhone, setStudentParentPhone] = useState(""); // user_profile_parent_whatsapp_url (nomor)
  const [studentBio, setStudentBio] = useState(""); // user_profile_bio
  const [openOptional, setOpenOptional] = useState(false);

  // Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Nama sekolah dari slug (mirip di login)
  const schoolTitle = useMemo(() => {
    if (!school_slug) return "Madinah Salam";

    const parts = school_slug
      .split(/[-_]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length === 0) return "Madinah Salam";

    return parts.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }, [school_slug]);

  // handle perubahan file avatar
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  // 🔄 Fetch data profile awal saat pertama kali halaman muncul
  useEffect(() => {
    let isMounted = true;

    async function fetchInitialProfile() {
      setLoadingInitial(true);
      try {
        const res = await api.get<{
          success: boolean;
          message: string;
          data: UserProfileResponse | null;
        }>("/u/user-profile");

        const profile = res.data?.data;
        if (!profile || !isMounted) return;

        if (profile.user_profile_full_name_snapshot) {
          setStudentName(profile.user_profile_full_name_snapshot);
        }

        if (
          profile.user_profile_gender === "male" ||
          profile.user_profile_gender === "female"
        ) {
          setStudentGender(profile.user_profile_gender);
        }

        if (profile.user_profile_date_of_birth) {
          const d = new Date(profile.user_profile_date_of_birth);
          if (!isNaN(d.getTime())) {
            setStudentBirthDate(d);
          }
        }

        if (profile.user_profile_city) {
          setStudentCity(profile.user_profile_city);
        }

        if (profile.user_profile_location) {
          setStudentAddress(profile.user_profile_location);
        }

        if (profile.user_profile_bio) {
          setStudentBio(profile.user_profile_bio);
        }

        if (profile.user_profile_whatsapp_url) {
          setStudentPhone(fromWhatsappUrl(profile.user_profile_whatsapp_url));
        }

        if (profile.user_profile_parent_name) {
          setStudentParentName(profile.user_profile_parent_name);
        }

        if (profile.user_profile_parent_whatsapp_url) {
          setStudentParentPhone(
            fromWhatsappUrl(profile.user_profile_parent_whatsapp_url)
          );
        }

        if (profile.user_profile_avatar_url) {
          setAvatarPreview(profile.user_profile_avatar_url);
        }
      } catch (err) {
        console.warn(
          "[UnnasignedStudentProfileStudent] gagal fetch user-profile",
          err
        );
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    }

    fetchInitialProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmitStudent(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoadingStudent(true);

    try {
      const payload: Record<string, any> = {};

      // mapping ke UpdateUsersProfileRequest
      if (studentGender) {
        payload.user_profile_gender = studentGender;
      }

      if (studentBirthDate) {
        payload.user_profile_date_of_birth = formatDateForAPI(studentBirthDate);
      }

      if (studentCity) {
        payload.user_profile_city = studentCity;
      }

      if (studentAddress) {
        payload.user_profile_location = studentAddress;
      }

      if (studentBio) {
        payload.user_profile_bio = studentBio;
      }

      if (studentPhone) {
        const wa = toWhatsappUrl(studentPhone);
        if (wa) {
          payload.user_profile_whatsapp_url = wa;
        }
      }

      if (studentParentName) {
        payload.user_profile_parent_name = studentParentName;
      }

      if (studentParentPhone) {
        const waParent = toWhatsappUrl(studentParentPhone);
        if (waParent) {
          payload.user_profile_parent_whatsapp_url = waParent;
        }
      }

      // (opsional) simpan minat program ke interests:
      if (studentProgram.trim()) {
        payload.user_profile_interests = [studentProgram.trim()];
      }

      const formData = new FormData();
      formData.append("payload", JSON.stringify(payload));

      if (avatarFile) {
        // nama field bebas, backend ambil file image pertama
        formData.append("avatar", avatarFile);
      }

      await api.patch("/u/user-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // ✅ Kalau mode -new → setelah save langsung redirect ke /pendaftaran
      if (isNewFlow) {
        const base = school_slug ? `/${school_slug}` : "";
        navigate(`${base}/user-murid/pendaftaran`, { replace: true });
        return;
      }

      // mode biasa → cukup tampilkan success
      setSuccess("Profil berhasil diperbarui. ✅");
    } catch (err: any) {
      console.error(err);
      const backendMsg = err?.response?.data?.message as string | undefined;
      setError(
        backendMsg ||
        err?.message ||
        "Gagal menyimpan data profil. Silakan coba lagi."
      );
    } finally {
      setLoadingStudent(false);
    }
  }

  const submitDisabled =
    loadingStudent ||
    loadingInitial ||
    !studentGender ||
    !studentBirthDate ||
    !studentCity ||
    !studentPhone;

  // 🧱 Container: kalau -new → max-width & center
  const containerClass = isNewFlow
    ? "w-full max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-6"
    : "w-full px-4 md:px-6 lg:px-8 py-8 space-y-6";

  return (
    <div className={containerClass}>
      {/* Header brand */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grid place-items-center bg-primary text-primary-foreground">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">
              Pendaftaran Murid
            </h1>
            <p className="text-xs text-muted-foreground">
              {schoolTitle} — Data dasar untuk profil & pendaftaran murid.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs px-2 py-1 rounded-full border bg-card text-card-foreground">
          <ShieldCheck className="w-4 h-4" />
          Aman &amp; terenkripsi
        </div>
      </div>

      {/* Info akun yang sedang login (opsional) */}
      {state.identifier && (
        <Alert className="border-dashed">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Akun terhubung</AlertTitle>
          <AlertDescription className="text-sm">
            Kamu login sebagai:{" "}
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              {state.identifier}
            </span>
            . Data profil ini akan dikaitkan ke akun tersebut.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert error / success */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Gagal</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Berhasil</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="border-none bg-card/40">
        <CardHeader>
          <h2 className="text-lg font-semibold">Data profil & pendaftaran</h2>
          <p className="text-sm text-muted-foreground">
            Lengkapi data berikut untuk proses seleksi & komunikasi dari pihak
            sekolah. Gender + nomor WA akan menentukan status kelengkapan
            profil.
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={handleSubmitStudent}>
            {/* AVATAR + NAMA */}
            <div className="grid gap-4 sm:grid-cols-[auto,1fr] items-start">
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Foto profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>Foto</span>
                  )}
                </div>

                <input
                  id="avatar_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  className="text-[11px]"
                  onClick={() =>
                    document.getElementById("avatar_upload")?.click()
                  }
                >
                  Pilih / ganti foto
                </Button>
                <p className="text-[10px] text-muted-foreground text-center max-w-[140px]">
                  Format JPG/PNG, maksimal sekitar 2MB.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="student_name">Nama lengkap (snapshot)</Label>
                <Input
                  id="student_name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Sesuai identitas / akun"
                  disabled
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Nama diambil dari akun utama. Perubahan nama bisa diatur dari
                  pengaturan akun (bukan dari halaman ini).
                </p>
              </div>
            </div>

            {/* FIELD PENTING */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="student_gender">Jenis kelamin *</Label>
                <Select
                  value={studentGender}
                  onValueChange={(v: "male" | "female") => setStudentGender(v)}
                >
                  <SelectTrigger id="student_gender">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Laki-laki</SelectItem>
                    <SelectItem value="female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="student_birth">Tanggal lahir *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="student_birth"
                      variant="outline"
                      type="button"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !studentBirthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {studentBirthDate ? (
                        format(studentBirthDate, "dd/MM/yyyy")
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={studentBirthDate}
                      onSelect={setStudentBirthDate}
                      initialFocus
                      captionLayout="dropdown"
                      fromYear={1950}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="student_city">Kota / Domisili *</Label>
                <Input
                  id="student_city"
                  value={studentCity}
                  onChange={(e) => setStudentCity(e.target.value)}
                  placeholder="Contoh: Bandung, Kota"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="student_phone">Nomor WA aktif *</Label>
                <Input
                  id="student_phone"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Nomor ini akan dikonversi otomatis ke tautan WhatsApp
                  (https://wa.me/...). Pastikan nomor benar.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="student_program">
                  Program / kelas yang diminati
                </Label>
                <Input
                  id="student_program"
                  value={studentProgram}
                  onChange={(e) => setStudentProgram(e.target.value)}
                  placeholder="Contoh: Balaghoh Menengah, Tahfizh Malam, dll."
                />
              </div>
            </div>

            {/* OPSIONAL (COLLAPSIBLE) */}
            <Collapsible open={openOptional} onOpenChange={setOpenOptional}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 flex items-center justify-between text-xs"
                >
                  <span>Data tambahan (opsional)</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform",
                      openOptional && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="student_address">Alamat lengkap</Label>
                  <Textarea
                    id="student_address"
                    rows={3}
                    value={studentAddress}
                    onChange={(e) => setStudentAddress(e.target.value)}
                    placeholder="Tuliskan alamat lengkap atau minimal kecamatan & kota."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="student_parent_name">
                      Nama orang tua / wali
                    </Label>
                    <Input
                      id="student_parent_name"
                      value={studentParentName}
                      onChange={(e) => setStudentParentName(e.target.value)}
                      placeholder="Contoh: Ayah Ahmad"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="student_parent_phone">
                      Nomor WA orang tua / wali
                    </Label>
                    <Input
                      id="student_parent_phone"
                      value={studentParentPhone}
                      onChange={(e) => setStudentParentPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="student_bio">
                    Cerita singkat tentang dirimu
                  </Label>
                  <Textarea
                    id="student_bio"
                    rows={3}
                    value={studentBio}
                    onChange={(e) => setStudentBio(e.target.value)}
                    placeholder="Contoh: aktivitas harian, target belajar, dsb."
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            <CardFooter className="px-0 pt-4 justify-end">
              <Button
                type="submit"
                disabled={submitDisabled}
                className="w-full sm:w-auto ring-inset"
              >
                {loadingStudent || loadingInitial
                  ? "Mengirim..."
                  : "Simpan data profil"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}