// src/pages/sekolahislamku/pages/classes/SchoolRoomForm.tsx
import * as React from "react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { getActiveschoolId } from "@/lib/axios";
import { ArrowLeft, Info, Loader2, MapPin, Video } from "lucide-react";

/* Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* Current user context */
import { useCurrentUser } from "@/hooks/useCurrentUser";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

/* custom */
import CActionsButton from "@/components/costum/common/buttons/CActionsButton";
import CPicturePreview from "@/components/costum/common/CPicturePreview";

/* ===================== TYPES ===================== */
type RoomApi = {
  class_room_id: string;
  class_room_school_id: string;

  class_room_name: string;
  class_room_code?: string | null;
  class_room_slug?: string | null;

  class_room_capacity?: number | null;
  class_room_location?: string | null;
  class_room_description?: string | null;

  class_room_is_virtual: boolean;
  class_room_is_active: boolean;

  class_room_platform?: string | null;
  class_room_join_url?: string | null;
  class_room_meeting_id?: string | null;
  class_room_passcode?: string | null;

  class_room_features?: string[] | null;

  class_room_image_url?: string | null; // kalau ada
  class_room_created_at?: string;
  class_room_updated_at?: string;
};

type RoomDetailResponse = {
  success?: boolean;
  message?: string;
  data?: RoomApi;
  [k: string]: any;
};

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

function splitFeatures(s: string): string[] {
  return (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

/* ===================== PAGE ===================== */
const SchoolRoomForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ id?: string }>();

  const { data: currentUser } = useCurrentUser();
  const membership = currentUser?.membership ?? null;
  const schoolIdFromMembership = membership?.school_id ?? null;
  const schoolSlug = membership?.school_slug ?? "";
  const schoolId = schoolIdFromMembership || getActiveschoolId() || null;

  const roomId = params.id;
  const isEditMode = Boolean(roomId && roomId !== "new");

  const qc = useQueryClient();
  const { setHeader } = useDashboardHeader();

  // kalau navigate dari list bisa bawa state
  const stateRoom = (location.state as { room?: RoomApi } | undefined)?.room;

  useEffect(() => {
    setHeader({
      title: isEditMode ? "Edit Ruangan" : "Tambah Ruangan",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        {
          label: "Ruangan",
          href: schoolSlug
            ? `/${schoolSlug}/sekolah/akademik/ruangan`
            : undefined,
        },
        { label: isEditMode ? "Edit" : "Tambah" },
      ],
      showBack: true,
    });
  }, [setHeader, isEditMode, schoolSlug]);

  /* ===================== DETAIL QUERY ===================== */
  const detailQ = useQuery<RoomApi, Error>({
    queryKey: ["class-room-detail", schoolId, roomId],
    enabled: isEditMode && !!roomId && !stateRoom,
    queryFn: async () => {
      // sesuaikan kalau endpoint detail kamu beda
      const res = await axios.get<RoomDetailResponse>(
        `/api/u/class-rooms/${roomId}`
      );
      const raw = (res.data as any).data ?? (res.data as any);
      return raw as RoomApi;
    },
  });

  const room = useMemo<RoomApi | undefined>(() => {
    if (stateRoom) return stateRoom;
    if (!isEditMode) return undefined;
    return detailQ.data;
  }, [stateRoom, detailQ.data, isEditMode]);

  /* ===================== FORM STATE ===================== */
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [capacity, setCapacity] = useState<string>(""); // string biar bisa kosong
  const [locationText, setLocationText] = useState("");
  const [description, setDescription] = useState("");

  const [isVirtual, setIsVirtual] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // virtual fields
  const [platform, setPlatform] = useState("");
  const [joinUrl, setJoinUrl] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [passcode, setPasscode] = useState("");

  // features input (comma separated)
  const [featuresText, setFeaturesText] = useState("");

  // image
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);

  // hydrate saat edit
  useEffect(() => {
    if (!room) return;

    setName(room.class_room_name ?? "");
    setCode(room.class_room_code ?? "");
    setCapacity(
      room.class_room_capacity === null ||
        room.class_room_capacity === undefined
        ? ""
        : String(room.class_room_capacity)
    );
    setLocationText(room.class_room_location ?? "");
    setDescription(room.class_room_description ?? "");

    setIsVirtual(Boolean(room.class_room_is_virtual));
    setIsActive(Boolean(room.class_room_is_active));

    setPlatform(room.class_room_platform ?? "");
    setJoinUrl(room.class_room_join_url ?? "");
    setMeetingId(room.class_room_meeting_id ?? "");
    setPasscode(room.class_room_passcode ?? "");

    setFeaturesText((room.class_room_features ?? []).join(", "));

    // preview lama (kalau backend punya field image_url)
    setPreview((room as any).class_room_image_url ?? null);
  }, [room]);

  const capacityNum = useMemo(() => {
    const n = Number(capacity);
    return Number.isFinite(n) ? n : NaN;
  }, [capacity]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (capacity !== "" && (!Number.isFinite(capacityNum) || capacityNum < 0))
      return false;

    // kalau virtual, join_url minimal ada biar masuk akal
    if (isVirtual && !joinUrl.trim()) return false;

    return true;
  }, [name, capacity, capacityNum, isVirtual, joinUrl]);

  const loadingDetail = isEditMode && !room && detailQ.isLoading;
  const detailError = isEditMode && !room && detailQ.isError;

  /* ===================== MUTATIONS ===================== */
  const createMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const { data } = await axios.post(`/api/a/class-rooms`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["class-rooms-list"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, fd }: { id: string; fd: FormData }) => {
      const { data } = await axios.patch(`/api/a/class-rooms/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["class-rooms-list"] });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleBack = () => {
    if (schoolSlug) navigate(`/${schoolSlug}/sekolah/akademik/ruangan`);
    else navigate(-1);
  };

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    if (newFile) setPreview(URL.createObjectURL(newFile));
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();

    // required-ish
    fd.set("class_room_name", name.trim());
    fd.set("class_room_is_virtual", String(Boolean(isVirtual)));
    fd.set("class_room_is_active", String(Boolean(isActive)));

    // optional common
    if (code.trim()) fd.set("class_room_code", code.trim());
    if (capacity !== "" && Number.isFinite(capacityNum))
      fd.set("class_room_capacity", String(capacityNum));
    if (locationText.trim()) fd.set("class_room_location", locationText.trim());
    if (description.trim())
      fd.set("class_room_description", description.trim());

    // features (array) — aman: kirim JSON string biar backend gampang parse
    const features = splitFeatures(featuresText);
    if (features.length > 0)
      fd.set("class_room_features", JSON.stringify(features));

    // virtual extras
    if (isVirtual) {
      if (platform.trim()) fd.set("class_room_platform", platform.trim());
      if (joinUrl.trim()) fd.set("class_room_join_url", joinUrl.trim());
      if (meetingId.trim()) fd.set("class_room_meeting_id", meetingId.trim());
      if (passcode.trim()) fd.set("class_room_passcode", passcode.trim());
    }

    // image
    if (file) {
      fd.set("file", file); // <--- ganti key kalau backend kamu beda
    }

    return fd;
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      if (!canSubmit) return;

      const fd = buildFormData();

      if (isEditMode && roomId) {
        updateMutation.mutate(
          { id: roomId, fd },
          {
            onSuccess: () => handleBack(),
            onError: (err: any) => setSubmitError(extractErrorMessage(err)),
          }
        );
      } else {
        createMutation.mutate(fd, {
          onSuccess: () => handleBack(),
          onError: (err: any) => setSubmitError(extractErrorMessage(err)),
        });
      }
    },
    [canSubmit, isEditMode, roomId, updateMutation, createMutation]
  );

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Header + Back */}
          <div className="md:flex hidden items-center gap-3">
            <Button onClick={handleBack} variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="font-semibold text-lg md:text-xl">
                {isEditMode ? "Edit Ruangan" : "Tambah Ruangan"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? "Perbarui informasi ruangan kelas."
                  : "Tambahkan ruangan baru (fisik / virtual)."}
              </p>
            </div>
          </div>

          {loadingDetail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="animate-spin h-4 w-4" />
              Memuat data ruangan…
            </div>
          )}

          {detailError && (
            <div className="rounded-xl border p-4 text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" /> Gagal memuat data ruangan.
              </div>
              <pre className="text-xs opacity-70 overflow-auto">
                {extractErrorMessage(detailQ.error)}
              </pre>
              <Button size="sm" onClick={() => detailQ.refetch()}>
                Coba lagi
              </Button>
            </div>
          )}

          {/* FORM CARD */}
          <Card className="border">
            <form id="roomForm" onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  {isEditMode ? "Form Edit Ruangan" : "Form Tambah Ruangan"}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Cover / Image */}
                <div className="space-y-2">
                  <Label>Gambar Ruangan (opsional)</Label>
                  <CPicturePreview
                    file={file}
                    preview={preview}
                    onFileChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload untuk cover/thumbnail ruangan. Kosongkan jika tidak
                    ingin mengubah.
                  </p>
                </div>

                {/* Basic */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="class_room_name">Nama Ruangan *</Label>
                    <Input
                      id="class_room_name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="cth. Ruang Kelas 1 / Kelas Zoom 1"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="class_room_code">Kode (opsional)</Label>
                    <Input
                      id="class_room_code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="cth. RK-1 / CR-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="class_room_capacity">
                      Kapasitas (opsional)
                    </Label>
                    <Input
                      id="class_room_capacity"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      placeholder="cth. 30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="class_room_location">
                      Lokasi (opsional)
                    </Label>
                    <Input
                      id="class_room_location"
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      placeholder="Gedung A, Lantai 1 / Link"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="class_room_description">
                    Deskripsi (opsional)
                  </Label>
                  <Textarea
                    id="class_room_description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Keterangan ruangan"
                    className="min-h-[90px]"
                  />
                </div>

                {/* Features */}
                <div className="space-y-1.5">
                  <Label htmlFor="class_room_features">
                    Fitur (pisahkan dengan koma)
                  </Label>
                  <Input
                    id="class_room_features"
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    placeholder="AC, Proyektor, Papan Tulis"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nanti dikirim sebagai array: ["AC","Proyektor",...]
                  </p>
                </div>

                {/* Flags */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Tipe Ruangan</Label>
                    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
                      <Checkbox
                        id="class_room_is_virtual"
                        checked={isVirtual}
                        onCheckedChange={(c) => setIsVirtual(Boolean(c))}
                      />
                      <label
                        htmlFor="class_room_is_virtual"
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Virtual (Zoom/Meet)
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Jika virtual, isi Join URL (minimal).
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
                      <Checkbox
                        id="class_room_is_active"
                        checked={isActive}
                        onCheckedChange={(c) => setIsActive(Boolean(c))}
                      />
                      <label
                        htmlFor="class_room_is_active"
                        className="text-sm font-medium cursor-pointer"
                      >
                        {isActive ? "Aktif" : "Nonaktif"}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Virtual fields */}
                {isVirtual && (
                  <div className="rounded-xl border p-4 space-y-4">
                    <div className="text-sm font-medium">Detail Virtual</div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="class_room_platform">Platform</Label>
                        <Input
                          id="class_room_platform"
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          placeholder="zoom / google_meet"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="class_room_join_url">Join URL *</Label>
                        <Input
                          id="class_room_join_url"
                          value={joinUrl}
                          onChange={(e) => setJoinUrl(e.target.value)}
                          placeholder="https://zoom.us/j/..."
                          required={isVirtual}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="class_room_meeting_id">
                          Meeting ID
                        </Label>
                        <Input
                          id="class_room_meeting_id"
                          value={meetingId}
                          onChange={(e) => setMeetingId(e.target.value)}
                          placeholder="123-456-7890"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="class_room_passcode">Passcode</Label>
                        <Input
                          id="class_room_passcode"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          placeholder="abcd1234"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Ringkasan */}
                <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs md:text-sm text-muted-foreground flex gap-2">
                  <Info className="h-4 w-4 mt-[2px]" />
                  <div>
                    <div className="font-medium">Ringkasan</div>
                    <div className="mt-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">
                          {name || "Nama belum diisi"}
                        </span>
                        {locationText && (
                          <span className="flex items-center gap-1 text-[11px] md:text-xs">
                            <MapPin className="h-3 w-3" />
                            {locationText}
                          </span>
                        )}
                      </div>
                      <div>
                        Tipe:{" "}
                        <span className="font-medium">
                          {isVirtual ? "Virtual" : "Fisik"}
                        </span>{" "}
                        • Kapasitas:{" "}
                        <span className="font-medium">
                          {capacity === "" ? "-" : capacity}
                        </span>{" "}
                        • Status:{" "}
                        <span className="font-medium">
                          {isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2 text-xs whitespace-pre-wrap">
                    <span className="font-medium">Gagal menyimpan:</span>{" "}
                    {submitError}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-end gap-2">
                <CActionsButton
                  onCancel={handleBack}
                  onSave={() => {
                    document
                      .getElementById("roomForm")
                      ?.dispatchEvent(
                        new Event("submit", { cancelable: true, bubbles: true })
                      );
                  }}
                  loadingSave={isSubmitting}
                />
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SchoolRoomForm;
