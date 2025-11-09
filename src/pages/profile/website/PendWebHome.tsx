// src/pages/public/SchoolkuHome.shadcn.tsx
import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";

/* Icons */
import {
  MapPin,
  BookOpen,
  CreditCard,
  FileText,
  Phone,
  Share2,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Copy,
} from "lucide-react";

/* Komponen lokal (kalau masih mau dipakai) */
import LinktreeNavbar from "@/components/common/public/CLintreeNavbar";
import ShimmerImage from "@/components/common/main/CShimmerImage";

/* =========================================================
   Helpers
========================================================= */
const isMobileUA = () =>
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

async function robustCopy(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-999999px";
    ta.style.top = "-999999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (ok) return true;
  } catch {}
  try {
    const result = window.prompt("Salin teks berikut:", text);
    return result !== null;
  } catch {
    return false;
  }
}

function openWhatsAppNumber(phoneDigits: string, message?: string) {
  const digits = phoneDigits.replace(/[^\d]/g, "");
  const txt = message ? `&text=${encodeURIComponent(message)}` : "";

  if (isMobileUA()) {
    const deep = `whatsapp://send?phone=${digits}${txt}`;
    try {
      window.location.href = deep;
    } catch {
      window.open(
        `https://web.whatsapp.com/send?phone=${digits}${txt}`,
        "_blank"
      );
    }
  } else {
    window.open(
      `https://web.whatsapp.com/send?phone=${digits}${txt}`,
      "_blank",
      "noopener,noreferrer"
    );
  }
}

async function shareViaNative(title: string, text: string, url: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/* =========================================================
   Page
========================================================= */
export default function SchoolkuHome() {
  const { slug } = useParams();
  const { toast } = useToast();

  // Demo data — sambungkan ke API kalau sudah ready
  const schoolku = {
    schoolku_name: "schoolKu",
    schoolku_description:
      "Lembaga untuk Digitalisasi sekolah dan Lembaga Islam Indonesia",
    schoolku_image_url: "/image/Gambar-school.jpeg",
    schoolku_instagram_url: "https://instagram.com/schoolbaitussalam",
    schoolku_whatsapp_url: "https://wa.me/6281234567890",
    schoolku_youtube_url: "https://youtube.com/@schoolbaitussalam",
    schoolku_donation_url: "",
  };

  const shareUrl = useMemo(
    () => (typeof window !== "undefined" ? window.location.href : ""),
    []
  );
  const shareTitle = schoolku.schoolku_name;
  const shareText = useMemo(
    () => `${schoolku.schoolku_name} — ${schoolku.schoolku_description}`,
    [schoolku.schoolku_name, schoolku.schoolku_description]
  );

  // ====== Share handlers (pakai toast) ======
  const onShareClickNative = async () => {
    const ok = await shareViaNative(shareTitle, shareText, shareUrl);
    if (!ok) {
      // Kalau Web Share API gagal, buka dialog via trigger default (UI tetap)
      toast({
        title: "Fitur bagikan bawaan tidak tersedia",
        description: "Pakai dialog share di bawah ya.",
      });
    }
  };

  const onCopyText = async () => {
    const ok = await robustCopy(`${shareText}\n${shareUrl}`);
    toast({
      title: ok ? "Teks tersalin" : "Gagal menyalin",
      description: ok
        ? "Silakan tempel di aplikasi pilihanmu."
        : "Coba lagi ya.",
    });
  };

  const onCopyLink = async () => {
    const ok = await robustCopy(shareUrl);
    toast({
      title: ok ? "Link tersalin" : "Gagal menyalin",
      description: ok
        ? "URL siap dibagikan."
        : "Coba lagi atau salin manual dari kolom di dialog.",
    });
  };

  const onShareViaWA = () => {
    const text = `${shareText}\n${shareUrl}`;
    if (isMobileUA()) {
      try {
        window.location.href = `whatsapp://send?text=${encodeURIComponent(
          text
        )}`;
      } catch {
        window.open(
          `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`,
          "_blank"
        );
      }
    } else {
      window.open(
        `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  useEffect(() => {
    // contoh: kalau butuh lifecycle ringan
  }, [slug]);

  return (
    <>
      <LinktreeNavbar />

      {/* ===== HERO ===== */}
      <section className="relative w-full mt-24">
        {/* Cover image */}
        <div className="h-44 sm:h-56 w-full overflow-hidden">
          <AspectRatio ratio={16 / 9}>
            <div className="h-full w-full bg-center bg-cover">
              <ShimmerImage
                src={schoolku.schoolku_image_url}
                alt="Cover sekolah"
                className="h-full w-full object-cover"
              />
            </div>
          </AspectRatio>
        </div>

        {/* overlay gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent" />

        {/* Avatar + title */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="-mt-10 sm:-mt-14 flex items-end gap-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-2 ring-background shadow-md bg-card">
              <ShimmerImage
                src={schoolku.schoolku_image_url}
                alt="Logo / Foto"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="pb-1">
              <h1 className="text-xl sm:text-2xl font-semibold drop-shadow text-foreground">
                {schoolku.schoolku_name}
              </h1>
              <p className="text-xs sm:text-sm line-clamp-2 drop-shadow text-foreground/90">
                {schoolku.schoolku_description}
              </p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="max-w-2xl mx-auto px-4 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            onClick={() =>
              openWhatsAppNumber(
                "6281234567890",
                `Assalamualaikum, saya ingin bertanya tentang kegiatan di ${schoolku.schoolku_name}.`
              )
            }
            className="rounded-xl"
          >
            <img src="/icons/whatsapp.svg" alt="WA" className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="rounded-xl"
                onClick={onShareClickNative}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Bagikan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Bagikan Halaman Ini</DialogTitle>
                <DialogDescription>
                  Salin teks/link atau kirim lewat WhatsApp.
                </DialogDescription>
              </DialogHeader>

              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="text-sm whitespace-pre-wrap">
                    {shareText}
                    {"\n"}
                    {shareUrl}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Button className="w-full" onClick={onCopyText}>
                  <Copy className="mr-2 h-4 w-4" />
                  Salin Teks
                </Button>

                <div className="flex items-center gap-2">
                  <Input readOnly value={shareUrl} className="flex-1" />
                  <Button variant="secondary" onClick={onCopyLink}>
                    <Copy className="mr-2 h-4 w-4" />
                    Salin Link
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={onShareViaWA}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Bagikan via WhatsApp
                </Button>
              </div>

              <DialogFooter className="sm:justify-start">
                <p className="text-xs text-muted-foreground">
                  Tips: tombol “Bagikan” di atas akan pakai Web Share API jika
                  tersedia.
                </p>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button asChild variant="secondary" className="rounded-xl">
            <a href="/school" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Eksplor sekolah
            </a>
          </Button>

          <Button asChild variant="secondary" className="rounded-xl">
            <a
              href={schoolku.schoolku_instagram_url}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="/icons/instagram.svg"
                alt="IG"
                className="w-4 h-4 mr-2"
              />
              IG
            </a>
          </Button>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <main className="w-full max-w-2xl mx-auto pb-28 px-4">
        <div className="pt-6" />

        {/* Menu Utama */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Menu Utama</h2>

          <Card className="divide-y">
            <MenuRow
              to="/profil"
              icon={<MapPin className="h-4 w-4" />}
              label="Profil Kami"
            />
            <MenuRow
              to="/website"
              icon={<ExternalLink className="h-4 w-4" />}
              label="Website"
            />
            <MenuRow
              to="/school"
              icon={<BookOpen className="h-4 w-4" />}
              label="Sekolah yang bekerjasama"
            />
            <MenuRow
              to="/program"
              icon={<CreditCard className="h-4 w-4" />}
              label="Ikut Program Digitalisasi 100 sekolah"
            />
            <MenuRow
              to="/finansial"
              icon={<FileText className="h-4 w-4" />}
              label="Laporan Keuangan"
            />
            <MenuRow
              icon={<Phone className="h-4 w-4" />}
              label="Kontak Kami"
              onClick={() => openWhatsAppNumber("6281234567890")}
            />
          </Card>
        </section>

        {/* Optional: Donasi */}
        {Boolean(schoolku.schoolku_donation_url) && (
          <>
            <Separator className="my-6" />
            <Card className="hover:shadow transition">
              <Button
                asChild
                variant="ghost"
                className="justify-between h-auto p-4"
              >
                <a
                  href={schoolku.schoolku_donation_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="inline-flex items-center gap-3">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-left">
                      <span className="font-semibold block">
                        Dukung Program
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Klik untuk berdonasi
                      </span>
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
            </Card>
          </>
        )}
      </main>
    </>
  );
}

/* =========================================================
   Subcomponents
========================================================= */
type MenuRowProps = {
  label: string;
  icon: React.ReactNode;
  to?: string;
  onClick?: () => void;
};

function MenuRow({ label, icon, to, onClick }: MenuRowProps) {
  const content = (
    <div className="flex w-full items-center justify-between py-3 px-4">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );

  if (to) {
    return (
      <Button
        asChild
        variant="ghost"
        className="h-auto rounded-none justify-start"
      >
        <Link to={to}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className="h-auto rounded-none justify-start"
      onClick={onClick}
    >
      {content}
    </Button>
  );
}
