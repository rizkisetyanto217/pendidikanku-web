// src/components/share/ShareBCLectureButton.tsx
import * as React from "react";
import { Share2, Copy, MessageCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

type MinimalSession = { startTime: string; place?: string };

type SocialLinks = {
  maps?: string;
  instagram?: string;
  whatsapp?: string;
  youtube?: string;
  facebook?: string;
  tiktok?: string;
  groupIkhwan?: string;
  groupAkhwat?: string;
  website?: string;
};

type Props = {
  lectureTitle: string;
  teacherNames?: string;
  nextDateIso?: string;
  place?: string;
  sessions?: MinimalSession[];
  url?: string;
  buttonLabel?: string;
  className?: string;
  /** visual: "primary" -> Button default, "soft" -> secondary, "ghost" -> ghost */
  variant?: "primary" | "soft" | "ghost";
  schoolSlug?: string; // contoh: "school-ar-raudhah"
  socialLinks?: SocialLinks; // bila ada, skip fetch
  prefetchOnHover?: boolean; // default true
};

/* ================= Helpers ================= */
const formatTanggalId = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  const tanggal = d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const jam = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${tanggal} • ${jam} WIB`;
};

const pickNext = (sessions?: MinimalSession[]) => {
  if (!sessions?.length) return undefined as Date | undefined;
  const items = sessions
    .filter((s) => !!s.startTime)
    .map((s) => new Date(s.startTime))
    .sort((a, b) => a.getTime() - b.getTime());
  const now = Date.now();
  return items.find((d) => d.getTime() >= now) ?? items[0];
};

const isValid = (v?: string) => {
  if (!v) return false;
  const s = v.trim().toLowerCase();
  if (!s || s === "update") return false;
  return (
    s.startsWith("http") || s.startsWith("wa.me") || s.startsWith("maps.app")
  );
};

/* ================= Component ================= */
export default function ShareBCLectureButton({
  lectureTitle,
  teacherNames,
  nextDateIso,
  place,
  sessions,
  url,
  buttonLabel = "Bagikan",
  className,
  variant = "ghost",
  schoolSlug,
  socialLinks,
  prefetchOnHover = true,
}: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [copiedBC, setCopiedBC] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const shareUrl = React.useMemo(
    () => url || (typeof window !== "undefined" ? window.location.href : ""),
    [url]
  );

  const nearestDateIso = React.useMemo(() => {
    if (nextDateIso) return nextDateIso;
    const d = pickNext(sessions);
    return d?.toISOString();
  }, [nextDateIso, sessions]);

  const nearestPlace = React.useMemo(() => {
    if (place) return place;
    if (!sessions?.length || !nearestDateIso) return undefined;
    const hit = sessions.find(
      (s) => new Date(s.startTime).toISOString() === nearestDateIso
    );
    return hit?.place;
  }, [place, sessions, nearestDateIso]);

  /* ===== fetch publik school (lazy saat modal dibuka) ===== */
  const shouldFetch = open && !socialLinks && !!schoolSlug;
  const { data: school } = useQuery({
    queryKey: ["school-public", schoolSlug],
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const res = await axios.get(`/public/schools/${schoolSlug}`);
      return res.data?.data as {
        school_name?: string;
        school_google_maps_url?: string;
        school_instagram_url?: string;
        school_whatsapp_url?: string;
        school_youtube_url?: string;
        school_facebook_url?: string;
        school_tiktok_url?: string;
        school_whatsapp_group_ikhwan_url?: string;
        school_whatsapp_group_akhwat_url?: string;
        school_domain?: string;
      };
    },
  });

  // Prefetch on hover
  const handleMouseEnter = async () => {
    if (!prefetchOnHover || !schoolSlug || socialLinks) return;
    await qc.prefetchQuery({
      queryKey: ["school-public", schoolSlug],
      staleTime: 5 * 60 * 1000,
      queryFn: async () => {
        const res = await axios.get(`/public/schools/${schoolSlug}`);
        return res.data?.data;
      },
    });
  };

  // normalize API → SocialLinks
  const normalizedFromApi: SocialLinks | undefined = React.useMemo(() => {
    if (!school) return undefined;
    const website = school.school_domain
      ? school.school_domain.startsWith("http")
        ? school.school_domain
        : `https://${school.school_domain}`
      : undefined;
    return {
      maps: school.school_google_maps_url,
      instagram: school.school_instagram_url,
      whatsapp: school.school_whatsapp_url,
      youtube: school.school_youtube_url,
      facebook: school.school_facebook_url,
      tiktok: school.school_tiktok_url,
      groupIkhwan: school.school_whatsapp_group_ikhwan_url,
      groupAkhwat: school.school_whatsapp_group_akhwat_url,
      website,
    };
  }, [school]);

  const finalSocials = socialLinks ?? normalizedFromApi;
  const schoolName = school?.school_name;

  const socialsBlock = React.useMemo(() => {
    if (!finalSocials) return [];
    const lines: string[] = [];
    if (isValid(finalSocials.maps)) lines.push(`🗺️ Maps: ${finalSocials.maps}`);
    if (isValid(finalSocials.whatsapp))
      lines.push(`💬 WhatsApp: ${finalSocials.whatsapp}`);
    if (isValid(finalSocials.groupIkhwan))
      lines.push(`👥 Grup Ikhwan: ${finalSocials.groupIkhwan}`);
    if (isValid(finalSocials.groupAkhwat))
      lines.push(`👩 Grup Akhwat: ${finalSocials.groupAkhwat}`);
    if (isValid(finalSocials.instagram))
      lines.push(`📸 Instagram: ${finalSocials.instagram}`);
    if (isValid(finalSocials.youtube))
      lines.push(`▶️ YouTube: ${finalSocials.youtube}`);
    if (isValid(finalSocials.facebook))
      lines.push(`📘 Facebook: ${finalSocials.facebook}`);
    if (isValid(finalSocials.tiktok))
      lines.push(`🎵 TikTok: ${finalSocials.tiktok}`);
    if (isValid(finalSocials.website))
      lines.push(`🌐 Website: ${finalSocials.website}`);
    return lines;
  }, [finalSocials]);

  const bcText = React.useMemo(() => {
    const waktu = formatTanggalId(nearestDateIso);
    const lines = [
      `*${lectureTitle || "Kajian sekolah"}*`,
      teacherNames ? `👤 Pemateri: *${teacherNames}*` : null,
      nearestDateIso ? `🗓️ Waktu: ${waktu}` : null,
      nearestPlace ? `📍 Tempat: ${nearestPlace}` : null,
      "",
      "InsyaAllah kajian terbuka untuk umum. Yuk hadir & ajak keluarga/teman.",
      "",
      shareUrl ? `🔗 Info lengkap: ${shareUrl}` : null,
    ].filter(Boolean) as string[];

    if (socialsBlock.length) {
      lines.push("");
      lines.push(`Kontak & Sosial${schoolName ? ` — ${schoolName}` : ""}:`);
      lines.push(...socialsBlock);
    }
    return lines.join("\n");
  }, [
    lectureTitle,
    teacherNames,
    nearestDateIso,
    nearestPlace,
    shareUrl,
    socialsBlock,
    schoolName,
  ]);

  /* ===== Copy / Share ===== */
  const copy = async (txt: string, onOk: () => void) => {
    try {
      await navigator.clipboard.writeText(txt);
      onOk();
    } catch {
      const ta = document.createElement("textarea");
      ta.value = txt;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      onOk();
    }
  };
  const handleCopyBC = () =>
    copy(bcText, () => {
      setCopiedBC(true);
      setTimeout(() => setCopiedBC(false), 1500);
    });
  const handleCopyLink = () =>
    copy(shareUrl, () => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    });
  const handleWhatsApp = () =>
    window.open(
      `https://wa.me/?text=${encodeURIComponent(bcText)}`,
      "_blank",
      "noopener,noreferrer"
    );

  // map variant → shadcn button variants/classes
  const triggerVariant =
    variant === "primary"
      ? "default"
      : variant === "soft"
      ? "secondary"
      : "ghost";

  return (
    <>
      <Button
        variant={triggerVariant as any}
        className={["gap-2", className || ""].join(" ")}
        onMouseEnter={prefetchOnHover ? handleMouseEnter : undefined}
        onClick={() => setOpen(true)}
        aria-label="Bagikan tema kajian ini"
      >
        <Share2 className="h-4 w-4" />
        <span>{buttonLabel}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bagikan Tema Kajian</DialogTitle>
            <DialogDescription>
              Salin broadcast atau kirim langsung via WhatsApp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              readOnly
              value={bcText}
              className="min-h-40 resize-none"
            />
            <Separator />
            <div className="grid gap-2">
              <Button onClick={handleCopyBC} className="w-full gap-2">
                <Copy className="h-4 w-4" />
                {copiedBC ? "Broadcast Tersalin!" : "Salin Broadcast"}
              </Button>

              {shareUrl && (
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="w-full gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copiedLink ? "Link Tersalin!" : "Salin Link"}
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={handleWhatsApp}
                className="w-full gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Kirim via WhatsApp
              </Button>
            </div>
          </div>

          <DialogFooter />
        </DialogContent>
      </Dialog>
    </>
  );
}
