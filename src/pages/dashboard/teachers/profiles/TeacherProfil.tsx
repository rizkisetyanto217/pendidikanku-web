// src/pages/sekolahislamku/teacher/TeacherProfil.shadcn.tsx
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  MessageCircle,
  Camera,
  BookOpen,
  MapPin,
  GraduationCap,
  Calendar,
} from "lucide-react";

// shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

/* ================= Date/Time Utils ================ */

/* ==========================================
   MAIN COMPONENT
========================================== */
export default function TeacherProfil() {
  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [form, setForm] = useState<any>({
    user_teacher_name: "",
    user_teacher_field: "",
    user_teacher_short_bio: "",
    user_teacher_long_bio: "",
    user_teacher_greeting: "",
    user_teacher_education: "",
    user_teacher_activity: "",
    user_teacher_experience_years: 0,
    user_teacher_gender: "male",
    user_teacher_location: "",
    user_teacher_city: "",
    user_teacher_specialties: [],
    user_teacher_certificates: [],
    user_teacher_instagram_url: "",
    user_teacher_whatsapp_url: "",
    user_teacher_youtube_url: "",
    user_teacher_linkedin_url: "",
    user_teacher_github_url: "",
    user_teacher_telegram_username: "",
    user_teacher_title_prefix: "",
    user_teacher_title_suffix: "",
    user_teacher_is_verified: false,
    user_teacher_is_active: true,
  });

  const getInitials = (name: string) =>
    name
      ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
      : "U";

  /* ================= FETCH DATA ================= */
  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/u/user-teachers/list");
      const items = res.data?.data?.items || [];
      setTeacher(items.length > 0 ? items[0] : null);
    } catch (err) {
      console.error("❌ Gagal ambil data guru:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  /* ================= CREATE TEACHER PROFILE ================= */
  const handleCreateTeacher = async () => {
    try {
      setLoading(true);
      await api.post("/api/u/user-teachers", form);
      await fetchTeacherData();
    } catch (err) {
      console.error("❌ Gagal membuat profil guru:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI - FORM CREATE ================= */
  const renderCreateForm = () => (
    <div className="flex-1 flex flex-col space-y-6 min-w-0">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Buat Profil Guru</CardTitle>
          <Separator />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                placeholder="Masukkan nama lengkap"
                value={form.user_teacher_name}
                onChange={(e) =>
                  setForm({ ...form, user_teacher_name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bidang">Bidang</Label>
              <Input
                id="bidang"
                placeholder="Contoh: Fiqih, Tahfiz"
                value={form.user_teacher_field}
                onChange={(e) =>
                  setForm({ ...form, user_teacher_field: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio-singkat">Bio Singkat</Label>
              <Textarea
                id="bio-singkat"
                rows={3}
                placeholder="Deskripsi singkat tentang Anda"
                value={form.user_teacher_short_bio}
                onChange={(e) =>
                  setForm({ ...form, user_teacher_short_bio: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio-lengkap">Bio Lengkap</Label>
              <Textarea
                id="bio-lengkap"
                rows={5}
                placeholder="Ceritakan lebih detail tentang pengalaman dan keahlian Anda"
                value={form.user_teacher_long_bio}
                onChange={(e) =>
                  setForm({ ...form, user_teacher_long_bio: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="greeting">Salam Pembuka</Label>
              <Input
                id="greeting"
                placeholder="Assalamualaikum..."
                value={form.user_teacher_greeting}
                onChange={(e) =>
                  setForm({ ...form, user_teacher_greeting: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pendidikan">Pendidikan</Label>
                <Input
                  id="pendidikan"
                  placeholder="LIPIA 2018; Pesantren X"
                  value={form.user_teacher_education}
                  onChange={(e) =>
                    setForm({ ...form, user_teacher_education: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="kegiatan">Kegiatan Mengajar</Label>
                <Input
                  id="kegiatan"
                  placeholder="Mengajar di..."
                  value={form.user_teacher_activity}
                  onChange={(e) =>
                    setForm({ ...form, user_teacher_activity: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pengalaman">Tahun Pengalaman</Label>
                <Input
                  id="pengalaman"
                  type="number"
                  placeholder="0"
                  value={form.user_teacher_experience_years}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      user_teacher_experience_years: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="kota">Kota</Label>
                <Input
                  id="kota"
                  placeholder="Jakarta"
                  value={form.user_teacher_city}
                  onChange={(e) =>
                    setForm({ ...form, user_teacher_city: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="provinsi">Provinsi</Label>
                <Input
                  id="provinsi"
                  placeholder="DKI Jakarta"
                  value={form.user_teacher_location}
                  onChange={(e) =>
                    setForm({ ...form, user_teacher_location: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() =>
                  setForm({
                    user_teacher_name: "",
                    user_teacher_field: "",
                    user_teacher_short_bio: "",
                    user_teacher_long_bio: "",
                    user_teacher_greeting: "",
                    user_teacher_education: "",
                    user_teacher_activity: "",
                    user_teacher_experience_years: 0,
                    user_teacher_gender: "male",
                    user_teacher_location: "",
                    user_teacher_city: "",
                    user_teacher_specialties: [],
                    user_teacher_certificates: [],
                    user_teacher_instagram_url: "",
                    user_teacher_whatsapp_url: "",
                    user_teacher_youtube_url: "",
                    user_teacher_linkedin_url: "",
                    user_teacher_github_url: "",
                    user_teacher_telegram_username: "",
                    user_teacher_title_prefix: "",
                    user_teacher_title_suffix: "",
                    user_teacher_is_verified: false,
                    user_teacher_is_active: true,
                  })
                }
              >
                Reset
              </Button>
              <Button onClick={handleCreateTeacher} disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Profil Guru"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  /* ================= UI - TAMPIL DATA ================= */
  const renderProfileView = () => (
    <div className="flex-1 flex flex-col space-y-6 min-w-0">
      {/* Header Card dengan Avatar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full grid place-items-center text-white text-2xl font-semibold overflow-hidden bg-primary">
                {teacher.user_teacher_avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={teacher.user_teacher_avatar_url}
                    alt={teacher.user_teacher_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(teacher.user_teacher_name)
                )}
              </div>
              <Button
                size="icon"
                className="absolute -bottom-1 -right-1 rounded-full shadow-lg"
                title="Ganti foto"
              >
                <Camera className="size-4" />
              </Button>
            </div>

            {/* Nama & meta */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <h2 className="font-semibold text-xl md:text-2xl truncate">
                    {teacher.user_teacher_title_prefix}{" "}
                    {teacher.user_teacher_name}{" "}
                    {teacher.user_teacher_title_suffix}
                  </h2>
                  <p className="text-base mt-1 text-muted-foreground">
                    {teacher.user_teacher_field}
                  </p>
                </div>
                <Badge variant="outline">
                  {teacher.user_teacher_is_active ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>
                    {teacher.user_teacher_city}, {teacher.user_teacher_location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>
                    {teacher.user_teacher_experience_years} tahun pengalaman
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Separator className="mt-4" />
        </CardHeader>
        <CardContent />
      </Card>

      {/* Grid 2 Kolom: Salam & Info */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Salam Pembuka */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl grid place-items-center bg-muted text-primary">
                <MessageCircle className="size-4" />
              </div>
              <CardTitle className="text-base">Salam Pembuka</CardTitle>
            </div>
            <Separator />
          </CardHeader>
          <CardContent className="pt-4">
            <p className="italic leading-relaxed text-muted-foreground">
              "{teacher.user_teacher_greeting}"
            </p>
          </CardContent>
        </Card>

        {/* Informasi Singkat */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl grid place-items-center bg-muted">
                <BookOpen className="size-4" />
              </div>
              <CardTitle className="text-base">Informasi</CardTitle>
            </div>
            <Separator />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <GraduationCap className="size-4 mt-0.5 shrink-0 text-primary" />
                <div>
                  <span className="font-medium">Pendidikan: </span>
                  <span className="text-muted-foreground">
                    {teacher.user_teacher_education}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <BookOpen className="size-4 mt-0.5 shrink-0 text-primary" />
                <div>
                  <span className="font-medium">Kegiatan: </span>
                  <span className="text-muted-foreground">
                    {teacher.user_teacher_activity}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tentang (Full Width) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Tentang</CardTitle>
          <Separator />
        </CardHeader>
        <CardContent className="pt-4">
          <p className="leading-relaxed whitespace-pre-line text-muted-foreground">
            {teacher.user_teacher_long_bio}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  /* ================= RENDER FINAL ================= */
  return (
    <main className="md:py-8">
      <div className="mx-auto">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20 text-muted-foreground">
            Memuat data guru...
          </div>
        ) : teacher ? (
          renderProfileView()
        ) : (
          renderCreateForm()
        )}
      </div>
    </main>
  );
}
