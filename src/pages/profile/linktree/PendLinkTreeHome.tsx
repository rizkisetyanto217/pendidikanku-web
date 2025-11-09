// src/pages/public/PublicLinktree.tsx
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  BookOpen,
  Share2,
  Phone,
  HeartHandshake,
  Copy,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

/* your components */
import PublicNavbar from "@/components/common/public/CPublicNavbar";
import BottomNavbar from "@/components/common/public/CButtonNavbar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import BorderLine from "@/components/common/main/CBorder";
import CartLink from "@/components/common/main/CCardLink";
import FormattedDate from "@/constants/formattedDate";
import SocialMediaModal from "@/components/pages/home/CSocialMediaModal";
import ShimmerImage from "@/components/common/main/CShimmerImage";

const currentUrl = typeof window !== "undefined" ? window.location.href : "";

/* =========================
   Types
========================= */
interface School {
  school_id: string;
  school_name: string;
  school_bio_short?: string;
  school_location?: string;
  school_image_url?: string;
  school_google_maps_url?: string;
  school_slug: string;
  school_instagram_url?: string;
  school_whatsapp_url?: string;
  school_youtube_url?: string;
  school_facebook_url?: string;
  school_tiktok_url?: string;
  school_donation_link?: string;
  school_created_at: string;
  school_whatsapp_group_ikhwan_url?: string;
  school_whatsapp_group_akhwat_url?: string;
}

interface Kajian {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_image_url: string;
  lecture_session_teacher_name: string;
  lecture_session_place: string;
  lecture_session_start_time: string;
}

type SosmedKind = "instagram" | "whatsapp" | "youtube" | "facebook" | "tiktok";

/* =========================
   Helpers
========================= */
function buildSosmedUrl(kind: SosmedKind, raw?: string): string | null {
  if (!raw) return null;
  const v0 = raw.trim();
  if (!v0) return null;

  const isURL = /^https?:\/\//i.test(v0);
  switch (kind) {
    case "instagram": {
      const v = v0.replace(/^@/, "");
      return isURL ? v0 : `https://instagram.com/${v}`;
    }
    case "whatsapp": {
      const digits = v0.replace(/[^\d]/g, "").replace(/^0/, "62");
      return isURL ? v0 : digits ? `https://wa.me/${digits}` : null;
    }
    case "youtube":
      return isURL ? v0 : `https://${v0}`;
    case "facebook":
      return isURL ? v0 : `https://facebook.com/${v0}`;
    case "tiktok": {
      const v = v0.replace(/^@/, "");
      return isURL ? v0 : `https://tiktok.com/@${v}`;
    }
    default:
      return null;
  }
}

function buildWhatsAppContact(raw?: string, message?: string): string | null {
  const base = buildSosmedUrl("whatsapp", raw);
  if (!base) return null;
  if (!message) return base;
  const text = encodeURIComponent(message);
  return base.includes("?") ? `${base}&text=${text}` : `${base}?text=${text}`;
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, []);
  return { copied, copy };
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 animate-pulse">
      <div className="h-40 rounded-2xl bg-muted" />
      <div className="h-4 w-40 mt-4 rounded bg-muted" />
      <div className="h-4 w-72 mt-2 rounded bg-muted" />
      <div className="h-10 mt-6 rounded-xl bg-muted" />
      <div className="h-8 mt-3 rounded-xl bg-muted" />
      <div className="h-32 mt-8 rounded-2xl bg-muted" />
    </div>
  );
}

/* =========================
   Component
========================= */
export default function PendLinkTreeHome() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [showSocialModal, setShowSocialModal] = useState(false);
  const { copied, copy } = useCopy();

  const [searchParams] = useSearchParams();
  const cacheKey = searchParams.get("k") || "default";

  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const {  isLoading: loadingUser } = useCurrentUser();

  const {
    data: schoolData,
    isLoading: loadingSchool,
    error: schoolError,
  } = useQuery<School>({
    queryKey: ["school", slug],
    queryFn: async () =>
      (await axios.get(`/public/schools/${slug}`)).data?.data,
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: kajianList, isLoading: loadingKajian } = useQuery<Kajian[]>({
    queryKey: ["kajianListBySlug", slug, cacheKey],
    queryFn: async () =>
      (
        await axios.get(`/public/lecture-sessions-u/mendatang/${slug}`)
      ).data?.data?.slice(0, 10) ?? [],
    enabled: !!slug,
    staleTime: 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const handleShareNativeOrMenu = () => {
    if (!schoolData) return;
    if (navigator.share) {
      navigator
        .share({ title: schoolData.school_name, url: currentUrl })
        .catch(() => {
          /* jika user cancel, diamkan saja */
        });
    }
  };

  const updateArrowVisibility = () => {
    const el = sliderRef.current;
    if (!el) return;
    const atStart = Math.floor(el.scrollLeft) <= 0;
    const atEnd = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth;
    setShowLeft(!atStart);
    setShowRight(!atEnd);
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    updateArrowVisibility();
    el.addEventListener("scroll", updateArrowVisibility);
    return () => el.removeEventListener("scroll", updateArrowVisibility);
  }, []);
  useEffect(() => {
    const t = setTimeout(updateArrowVisibility, 100);
    return () => clearTimeout(t);
  }, [kajianList]);

  const waURL = useMemo(
    () => buildSosmedUrl("whatsapp", schoolData?.school_whatsapp_url),
    [schoolData?.school_whatsapp_url]
  );
  const igURL = useMemo(
    () => buildSosmedUrl("instagram", schoolData?.school_instagram_url),
    [schoolData?.school_instagram_url]
  );
  const ytURL = useMemo(
    () => buildSosmedUrl("youtube", schoolData?.school_youtube_url),
    [schoolData?.school_youtube_url]
  );
  const fbURL = useMemo(
    () => buildSosmedUrl("facebook", schoolData?.school_facebook_url),
    [schoolData?.school_facebook_url]
  );
  const ttURL = useMemo(
    () => buildSosmedUrl("tiktok", schoolData?.school_tiktok_url),
    [schoolData?.school_tiktok_url]
  );

  const donateURL = schoolData?.school_donation_link || undefined;
  const openMapsHref = useMemo(() => {
    const q = schoolData?.school_location?.trim();
    if (!q) return undefined;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      q
    )}`;
  }, [schoolData?.school_location]);

  if (loadingSchool || loadingKajian || loadingUser) return <LoadingSkeleton />;
  if (schoolError || !schoolData)
    return (
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-20 text-center">
        <p className="text-lg font-medium">School tidak ditemukan.</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>
    );

  return (
    <>
      <PublicNavbar schoolName={schoolData.school_name} />

      <div className="mx-auto w-full max-w-2xl min-h-screen bg-background pt-16 pb-28">
        <div className="px-4">
          {/* HERO */}
          <Card className="relative overflow-hidden rounded-2xl border">
            <div className="h-40 w-full sm:h-52 bg-muted">
              <ShimmerImage
                src={schoolData.school_image_url || "/images/cover-school.jpg"}
                alt={schoolData.school_name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Share */}
            <div className="absolute right-3 top-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="backdrop-blur"
                    onClick={handleShareNativeOrMenu}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Bagikan
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => copy(currentUrl)}>
                    <Copy className="mr-2 h-4 w-4" />
                    <span>{copied ? "Tersalin!" : "Salin tautan"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {igURL && (
                    <DropdownMenuItem asChild>
                      <a href={igURL} target="_blank" rel="noreferrer">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Buka Instagram
                      </a>
                    </DropdownMenuItem>
                  )}
                  {fbURL && (
                    <DropdownMenuItem asChild>
                      <a href={fbURL} target="_blank" rel="noreferrer">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Buka Facebook
                      </a>
                    </DropdownMenuItem>
                  )}
                  {ttURL && (
                    <DropdownMenuItem asChild>
                      <a href={ttURL} target="_blank" rel="noreferrer">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Buka TikTok
                      </a>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Info ringkas */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-end gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-xl border bg-white/40 backdrop-blur">
                  <ShimmerImage
                    src={
                      schoolData.school_image_url || "/images/school-avatar.png"
                    }
                    alt={schoolData.school_name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="line-clamp-2 text-xl font-bold leading-tight text-white">
                    {schoolData.school_name}
                  </h1>
                  {schoolData.school_bio_short && (
                    <p className="line-clamp-1 text-sm text-white/90">
                      {schoolData.school_bio_short}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Action Chips */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {openMapsHref && (
              <Button asChild variant="outline" className="justify-center">
                <a
                  href={openMapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Peta
                </a>
              </Button>
            )}
            {schoolData.school_whatsapp_url && (
              <Button asChild variant="outline" className="justify-center">
                <a
                  href={
                    buildWhatsAppContact(
                      schoolData.school_whatsapp_url,
                      `Assalamualaikum, saya ingin bertanya tentang kegiatan di ${schoolData.school_name}.`
                    )!
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              className="justify-center"
              onClick={handleShareNativeOrMenu}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Bagikan
            </Button>
            {donateURL && (
              <Button asChild variant="outline" className="justify-center">
                <a href={donateURL} target="_blank" rel="noreferrer">
                  <HeartHandshake className="mr-2 h-4 w-4" />
                  Donasi
                </a>
              </Button>
            )}
          </div>

          {/* Sosmed icons */}
          {(waURL || igURL || ytURL || fbURL || ttURL) && (
            <div className="mt-4 flex items-center gap-3">
              {waURL && (
                <a
                  href={waURL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border p-2 hover:bg-accent hover:text-accent-foreground"
                >
                  <img
                    src="/icons/whatsapp.svg"
                    alt="WhatsApp"
                    className="h-5 w-5"
                  />
                </a>
              )}
              {igURL && (
                <a
                  href={igURL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border p-2 hover:bg-accent hover:text-accent-foreground"
                >
                  <img
                    src="/icons/instagram.svg"
                    alt="Instagram"
                    className="h-5 w-5"
                  />
                </a>
              )}
              {ytURL && (
                <a
                  href={ytURL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border p-2 hover:bg-accent hover:text-accent-foreground"
                >
                  <img
                    src="/icons/youtube.svg"
                    alt="YouTube"
                    className="h-5 w-5"
                  />
                </a>
              )}
              {fbURL && (
                <a
                  href={fbURL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border p-2 hover:bg-accent hover:text-accent-foreground"
                >
                  <img
                    src="/icons/facebook.svg"
                    alt="Facebook"
                    className="h-5 w-5"
                  />
                </a>
              )}
              {ttURL && (
                <a
                  href={ttURL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border p-2 hover:bg-accent hover:text-accent-foreground"
                >
                  <img
                    src="/icons/tiktok.svg"
                    alt="TikTok"
                    className="h-5 w-5"
                  />
                </a>
              )}
            </div>
          )}

          <BorderLine />

          {/* Slider Kajian */}
          <div className="relative">
            <h2 className="mt-2 mb-3 text-lg font-semibold">
              Kajian Mendatang
            </h2>

            {(!kajianList || kajianList.length === 0) && (
              <div className="mb-4 text-sm text-muted-foreground">
                Belum ada jadwal kajian.
              </div>
            )}

            {kajianList && kajianList.length > 0 && (
              <div className="relative">
                {showLeft && (
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() =>
                      sliderRef.current?.scrollBy({
                        left: -300,
                        behavior: "smooth",
                      })
                    }
                    className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full shadow"
                    aria-label="Scroll kiri"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                {showRight && (
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() =>
                      sliderRef.current?.scrollBy({
                        left: 300,
                        behavior: "smooth",
                      })
                    }
                    className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full shadow"
                    aria-label="Scroll kanan"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}

                <div className="overflow-hidden">
                  <div
                    ref={sliderRef}
                    className="no-scrollbar flex gap-3 overflow-x-auto pr-3 scroll-smooth snap-x"
                  >
                    {kajianList.map((kajian) => (
                      <Card
                        key={kajian.lecture_session_id}
                        onClick={() =>
                          navigate(
                            `/school/${slug}/jadwal-kajian/${kajian.lecture_session_id}`
                          )
                        }
                        className="w-[200px] cursor-pointer snap-start overflow-hidden rounded-xl border transition hover:opacity-90 sm:w-[220px] md:w-[240px]"
                      >
                        <ShimmerImage
                          src={kajian.lecture_session_image_url || ""}
                          alt={kajian.lecture_session_title}
                          className="aspect-[4/5] w-full object-cover"
                        />
                        <div className="p-2.5">
                          <h3
                            className="line-clamp-2 text-sm font-semibold"
                            title={kajian.lecture_session_title}
                          >
                            {kajian.lecture_session_title}
                          </h3>
                          <p
                            className="mt-1 line-clamp-1 text-xs text-muted-foreground"
                            title={kajian.lecture_session_teacher_name}
                          >
                            {kajian.lecture_session_teacher_name || "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {kajian.lecture_session_start_time ? (
                              <FormattedDate
                                value={kajian.lecture_session_start_time}
                              />
                            ) : (
                              "-"
                            )}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
                <div className="mt-3 text-right">
                  <button
                    onClick={() => navigate(`/school/${slug}/jadwal-kajian`)}
                    className="text-sm underline text-muted-foreground hover:opacity-80"
                  >
                    Lihat semua kajian
                  </button>
                </div>
              </div>
            )}
          </div>

          <BorderLine />

          {/* Info School */}
          <div className="mt-4 mb-4">
            <h2 className="text-lg font-semibold">Tentang School</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Dikelola oleh DKM School untuk ummat muslim
            </p>

            {schoolData.school_location && (
              <a
                href={openMapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-col gap-0.5 pb-2 pt-2 text-base text-foreground"
              >
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{schoolData.school_location}</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </span>
                <span className="mt-0.5 underline text-sm text-muted-foreground">
                  Lihat di Google Maps
                </span>
              </a>
            )}
          </div>

          <BorderLine />

          {/* MENU UTAMA */}
          <div>
            <h2 className="mb-2 text-lg font-semibold">Menu Utama</h2>
            <div className="space-y-2 pt-2">
              <CartLink
                label="Profil School"
                icon={<MapPin size={18} />}
                href={`/school/${schoolData.school_slug}/profil`}
              />
              <CartLink
                label="Jadwal Kajian"
                icon={<BookOpen size={18} />}
                href={`/school/${schoolData.school_slug}/jadwal-kajian`}
              />
              <CartLink
                label="Grup School & Sosial Media"
                icon={<Share2 size={18} />}
                onClick={() => setShowSocialModal(true)}
              />
              <CartLink
                label="Hubungi Kami"
                icon={<Phone size={18} />}
                href={
                  buildWhatsAppContact(
                    schoolData.school_whatsapp_url,
                    `Assalamualaikum, saya ingin bertanya tentang kegiatan di ${schoolData.school_name}.`
                  ) || `/school/${schoolData.school_slug}/profil`
                }
                internal={false}
              />
              {donateURL && (
                <CartLink
                  label="Donasi"
                  icon={<HeartHandshake size={18} />}
                  href={donateURL}
                  internal={false}
                />
              )}
            </div>
          </div>

          <SocialMediaModal
            show={showSocialModal}
            onClose={() => setShowSocialModal(false)}
            data={{
              school_instagram_url: schoolData.school_instagram_url,
              school_whatsapp_url: schoolData.school_whatsapp_url,
              school_youtube_url: schoolData.school_youtube_url,
              school_facebook_url: schoolData.school_facebook_url,
              school_tiktok_url: schoolData.school_tiktok_url,
              school_whatsapp_group_ikhwan_url:
                schoolData.school_whatsapp_group_ikhwan_url,
              school_whatsapp_group_akhwat_url:
                schoolData.school_whatsapp_group_akhwat_url,
            }}
          />

          <BottomNavbar />
        </div>
      </div>
    </>
  );
}
