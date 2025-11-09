// src/components/common/public/PublicNavbar.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import CMenuDropdown from "@/components/costum/CMenuDropdown";
import { Button } from "@/components/ui/button";

interface PublicNavbarProps {
  schoolName: string;
  schoolSlug?: string; // optional, fallback dari URL
  hideOnScroll?: boolean;
  showLogin?: boolean; // bisa sembunyikan tombol login
  loginEnabled?: boolean; // paksa enable/disable (default true)
  maxWidthClass?: string; // optional: kontrol lebar kontainer
}

export default function PublicNavbar({
  schoolName,
  schoolSlug,
  hideOnScroll = false,
  showLogin = true,
  loginEnabled = true,
  maxWidthClass = "max-w-2xl",
}: PublicNavbarProps) {
  const navigate = useNavigate();
  const { slug: slugFromParams } = useParams<{ slug?: string }>();

  // Resolve slug: props → useParams → pathname
  const resolvedSlug = useMemo(() => {
    if (schoolSlug && schoolSlug.trim()) return schoolSlug.trim();
    if (slugFromParams && slugFromParams.trim()) return slugFromParams.trim();
    const parts = (
      typeof window !== "undefined" ? window.location.pathname : ""
    )
      .split("/")
      .filter(Boolean);
    const schoolIdx = parts.indexOf("school");
    if (schoolIdx !== -1 && parts[schoolIdx + 1]) return parts[schoolIdx + 1];
    return "";
  }, [schoolSlug, slugFromParams]);

  const { data: user, isLoading } = useCurrentUser();
  const isLoggedIn = !!user;

  // Hide on scroll
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (!hideOnScroll) return;
    const onScroll = () => {
      const y = window.scrollY;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setVisible(y <= lastScrollY.current || y < 80);
          lastScrollY.current = y;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideOnScroll]);

  const handleLoginClick = () => {
    if (resolvedSlug) navigate(`/school/${resolvedSlug}/login`);
    else navigate(`/login`);
  };

  const willDisableLogin = !resolvedSlug || !loginEnabled;

  return (
    <div
      className={[
        "fixed top-0 left-0 right-0 z-50",
        "transition-transform duration-300",
        hideOnScroll && !visible ? "-translate-y-full" : "translate-y-0",
      ].join(" ")}
    >
      <div className={`mx-auto w-full ${maxWidthClass} px-4`}>
        <nav
          className={[
            "mt-2 h-14",
            "bg-background text-foreground",
            "border border-border shadow-sm",
            "rounded-2xl",
            "flex items-center justify-between gap-3 px-4",
          ].join(" ")}
          aria-label="Public navbar"
        >
          {/* Left: Brand / School Name */}
          <h2 className="text-base sm:text-lg font-semibold truncate">
            {schoolName}
          </h2>

          {/* Right: Login / User menu */}
          <div className="flex items-center gap-2">
            {!isLoading && isLoggedIn ? (
              <CMenuDropdown />
            ) : showLogin ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleLoginClick}
                  disabled={willDisableLogin}
                  title={
                    willDisableLogin
                      ? !resolvedSlug
                        ? "Menyiapkan halaman…"
                        : "Login dimatikan untuk halaman ini"
                      : "Login"
                  }
                >
                  Login
                </Button>
                <CMenuDropdown variant="icon" />
              </div>
            ) : (
              <CMenuDropdown variant="icon" />
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
