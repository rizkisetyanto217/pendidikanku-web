// src/pages/sekolahislamku/dashboard-school/rooms/DetailRoomSchool.shadcn.tsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Users 
} from "lucide-react";

/* === header layout hook === */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ===================== TYPES (UI) ================= */
export type Room = {
  id: string;
  school_id?: string;
  name: string;
  code?: string;
  slug?: string;
  description?: string;
  capacity: number;
  location?: string | null;
  is_virtual?: boolean;
  is_active: boolean;

  image_url?: string | null;

  features?: string[];
  platform?: string | null; // zoom | google_meet | ms_teams | dll
  join_url?: string | null;
  meeting_id?: string | null;
  passcode?: string | null;

  schedule?: {
    label: string;
    day?: string;
    date?: string;
    from: string;
    to: string;
    group?: string;
  }[];

  notes?: Array<{ ts?: string; text?: string }>;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

/* ===================== DUMMY DATA =====================

   Skenario:
   - virtual-1  => Ruangan Virtual (is_virtual: true) + platform & join_url
   - offline-1  => Ruangan Offline (is_virtual: false)

   Field disesuaikan dengan skema tabel class_rooms:
   class_room_*  → kita representasikan di objek Room agar 1:1 secara makna
   (name, code, slug, location, capacity, description, is_virtual, is_active, 
   image_url, features, schedule, notes, metadata timestamps)
=======================================================*/
const DUMMY_ROOMS: Record<string, Room> = {
  "virtual-1": {
    id: "virtual-1",
    school_id: "0c864ac5-74f4-4a2a-9f1d-c88b7fb7ad12",
    name: "Ruang Virtual — Balaghoh B",
    code: "VR-BAL-B-01",
    slug: "vr-balaghoh-b",
    description:
      "Ruang daring untuk kelas Balaghoh B. Mohon masuk 5 menit sebelum mulai. Kamera on saat diskusi.",
    capacity: 120,
    location: "Online",
    is_virtual: true,
    is_active: true,

    image_url:
      "https://dummyimage.com/1200x400/0f592a/ffffff&text=Virtual+Room",

    features: ["Rekaman Otomatis", "Breakout Rooms", "Screen Sharing", "Chat"],
    platform: "zoom",
    join_url: "https://us02web.zoom.us/j/123456789?pwd=abcDEF123",
    meeting_id: "123-456-789",
    passcode: "BALB2025",

    schedule: [
      {
        label: "Pertemuan Rutin",
        day: "senin",
        from: "19:30",
        to: "21:00",
        group: "A",
      },
      { label: "Sesi Tanya Jawab", day: "kamis", from: "20:00", to: "21:00" },
    ],
    notes: [
      {
        ts: "2025-11-10T19:00:00Z",
        text: "Harap update Zoom ke versi terbaru.",
      },
      {
        ts: "2025-11-11T12:15:00Z",
        text: "Gunakan earphone untuk mengurangi noise.",
      },
    ],
    created_at: "2025-09-01T08:00:00Z",
    updated_at: "2025-11-01T10:30:00Z",
    deleted_at: null,
  },

  "offline-1": {
    id: "offline-1",
    school_id: "0c864ac5-74f4-4a2a-9f1d-c88b7fb7ad12",
    name: "Ruang Kelas — 2B",
    code: "CR-2B-01",
    slug: "kelas-2b-01",
    description:
      "Ruang kelas lantai 2, dekat perpustakaan. Cocok untuk kelas teori dan diskusi.",
    capacity: 36,
    location: "Gedung Utama Lt.2 — Sayap Timur",
    is_virtual: false,
    is_active: true,

    image_url: "https://dummyimage.com/1200x400/ffde59/111&text=Classroom+2B",

    features: ["AC", "Proyektor", "Whiteboard", "Colokan Meja", "Wi-Fi"],
    platform: null,
    join_url: null,
    meeting_id: null,
    passcode: null,

    schedule: [
      { label: "Pelajaran Pagi", day: "selasa", from: "08:00", to: "09:40" },
      { label: "Pelajaran Siang", day: "jumat", from: "13:00", to: "14:40" },
    ],
    notes: [
      {
        ts: "2025-11-05T07:30:00Z",
        text: "Spidol baru sudah diletakkan di laci.",
      },
      {
        ts: "2025-11-08T15:10:00Z",
        text: "Proyektor diganti — lebih terang.",
      },
    ],
    created_at: "2025-08-20T07:00:00Z",
    updated_at: "2025-10-28T09:20:00Z",
    deleted_at: null,
  },
};

/* ============== REUSABLE COMPONENTS ============== */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">{title}</h3>
      <Separator />
      {children}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return <Badge variant="default">Aktif</Badge>;
  }
  return <Badge variant="outline">Nonaktif</Badge>;
}

/* ===================== PAGE =======================

   Cara uji cepat:
   - /rooms/virtual-1  → skenario ruangan virtual
   - /rooms/offline-1  → skenario ruangan offline
====================================================*/
export default function SchoolRoomDetail() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const { setHeader } = useDashboardHeader();
    useEffect(() => {
      setHeader({
        title: "Detail Ruangan",
        breadcrumbs: [
          { label: "Dashboard", href: "dashboard" },
          { label: "Akademik" },
          { label: "Ruangan", href: "akademik/ruangan" },
          { label: "Detail" },
        ],
        showBack: true,
      });
    }, [setHeader]);

  const room = (id && DUMMY_ROOMS[id]) || null;

  // Not found
  if (!room) {
    return (
      <main className="px-4 md:px-6 md:py-8">
        <div className="max-w-screen-2xl mx-auto">
          <Card>
            <CardContent className="py-10 text-center">
              <Building2 className="mx-auto mb-3 opacity-40" size={48} />
              <h2 className="text-lg font-semibold">Ruangan tidak ditemukan</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Gunakan ID <code>virtual-1</code> atau <code>offline-1</code>{" "}
                untuk mencoba skenario.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate(-1)} variant="outline">
                  Kembali
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className=" md:py-8">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="md:flex hidden items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            title="Kembali"
            className="shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-base truncate">{room.name}</h1>
            {room.code && (
              <p className="text-sm text-muted-foreground mt-1">
                Kode: {room.code}
              </p>
            )}
          </div>
        </div>

        {/* Hero Image (opsional) */}
        {room.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={room.image_url}
            alt={room.name}
            className="w-full h-40 md:h-56 object-cover rounded-xl border"
          />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg grid place-items-center bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Kapasitas</div>
                <div className="text-lg font-semibold">{room.capacity}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg grid place-items-center bg-primary/10 text-primary">
                <MapPin className="size-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Lokasi</div>
                <div className="text-sm font-medium">
                  {room.location || "—"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Informasi Dasar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informasi Dasar</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Nama Ruangan" value={room.name} />
                <InfoRow label="Kode" value={room.code ?? "—"} />
                <InfoRow label="Kapasitas" value={`${room.capacity} siswa`} />
                <InfoRow label="Lokasi" value={room.location ?? "—"} />
                <InfoRow
                  label="Status"
                  value={<StatusBadge active={room.is_active} />}
                />
              </div>

              {room.description && (
                <div className="pt-4">
                  <InfoSection title="Deskripsi">
                    <p className="text-sm">{room.description}</p>
                  </InfoSection>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Virtual Room Info (skenario virtual) */}
          {room.is_virtual && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Informasi Virtual Room
                </CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow label="Platform" value={room.platform ?? "—"} />
                  <InfoRow label="Meeting ID" value={room.meeting_id ?? "—"} />
                  <InfoRow label="Passcode" value={room.passcode ?? "—"} />
                  <InfoRow
                    label="Join URL"
                    value={
                      room.join_url ? (
                        <a
                          href={room.join_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline break-all"
                        >
                          {room.join_url}
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features */}
        {room.features && room.features.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fasilitas</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Separator className="mb-3" />
              <div className="flex flex-wrap gap-2">
                {room.features.map((feature, idx) => (
                  <Badge key={idx} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule */}
        {room.schedule && room.schedule.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Jadwal</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Separator className="mb-3" />
              {room.schedule.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border bg-card text-card-foreground"
                >
                  <div className="font-medium text-sm mb-0.5">
                    {s.label || "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {s.day ?? s.date ?? "—"} • {s.from} – {s.to}
                    {s.group ? ` • Grup ${s.group}` : ""}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {room.notes && room.notes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Catatan</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Separator className="mb-3" />
              {room.notes.map((note, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-card">
                  <div className="text-xs text-muted-foreground mb-1">
                    {note.ts
                      ? new Date(note.ts).toLocaleString("id-ID", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "—"}
                  </div>
                  <div className="text-sm">{note.text ?? "—"}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Separator className="mb-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                label="Dibuat pada"
                value={
                  room.created_at
                    ? new Date(room.created_at).toLocaleString("id-ID")
                    : "—"
                }
              />
              <InfoRow
                label="Diperbarui pada"
                value={
                  room.updated_at
                    ? new Date(room.updated_at).toLocaleString("id-ID")
                    : "—"
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
