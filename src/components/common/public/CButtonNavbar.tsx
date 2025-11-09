// src/components/common/mobile/CBottomNavbar.tsx
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Home, Calendar, BookOpen, FileText } from "lucide-react";
// (opsional) kalau punya cn: import { cn } from "@/lib/utils";

type BottomNavbarProps = {
  hideOnScroll?: boolean;
  className?: string;
};

export default function CBottomNavbar({
  hideOnScroll = false,
  className = "",
}: BottomNavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();

  // ===== Hide on scroll =====
  const lastScrollY = useRef(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!hideOnScroll) return;
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(!(y > lastScrollY.current && y > 80));
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideOnScroll]);

  // ===== Tabs =====
  const tabs = [
    { key: "beranda", label: "Beranda", icon: Home, path: `/school/${slug}` },
    { key: "materi", label: "Kajian", icon: BookOpen, path: `/school/${slug}/soal-materi` },
    // { key: "donasi", label: "Donasi", icon: MapPin, path: `/school/${slug}/donasi` },
    { key: "post", label: "Postingan", icon: Calendar, path: `/school/${slug}/post` },
    { key: "aktivitas", label: "Aktivitas", icon: FileText, path: `/school/${slug}/aktivitas` },
  ] as const;

  const activeKey = React.useMemo(() => {
    const p = location.pathname;
    if (p.includes("/post")) return "post";
    // if (p.includes("/donasi")) return "donasi";
    if (p.includes("/soal-materi") || p.includes("/tema")) return "materi";
    if (p.includes("/aktivitas")) return "aktivitas";
    return "beranda";
  }, [location.pathname]);

  return (
    <nav
      className={[
        "fixed bottom-0 left-0 right-0 z-50",
        "mx-auto w-full max-w-2xl",
        "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70",
        "transition-transform duration-300",
        hideOnScroll && !visible ? "translate-y-full" : "translate-y-0",
        className,
      ].join(" ")}
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom) + 6px)",
      }}
      role="navigation"
      aria-label="Menu bawah"
    >
      <div className="flex justify-between gap-2 sm:justify-center sm:gap-6 px-3 py-2 sm:py-3">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = t.key === activeKey;
          return (
            <button
              key={t.key}
              onClick={() => navigate(t.path)}
              className={[
                "group relative flex flex-1 sm:flex-initial items-center justify-center",
                "sm:px-5 py-2 sm:py-3 rounded-xl transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={[
                  "h-5 w-5 sm:h-6 sm:w-6 transition",
                  active ? "text-primary" : "group-hover:text-foreground",
                ].join(" ")}
              />
              <span
                className={[
                  "ml-0 sm:ml-2 mt-1 sm:mt-0 text-xs sm:text-sm font-medium",
                  active ? "text-primary" : "text-foreground/80",
                ].join(" ")}
              >
                {t.label}
              </span>

              {/* active indicator (atas) */}
              <span
                className={[
                  "pointer-events-none absolute -top-[1px] left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full",
                  active ? "bg-primary" : "bg-transparent",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
