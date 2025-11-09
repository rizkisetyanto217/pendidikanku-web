// src/components/common/public/MainNavbar.tsx
import * as React from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { NavLink } from "react-router-dom";
import school from "@/assets/Pendidikanku.jpeg";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/* ================= NAV ITEMS ================= */
const navItems = [
  { label: "Beranda", to: "/website", end: true },
  { label: "Dukungan", to: "/website/dukungan" },
  { label: "Panduan", to: "/website/panduan" },
  { label: "Fitur", to: "/website/fitur" },
  { label: "Tentang", to: "/website/about" },
  { label: "Kontak", to: "/website/hubungi-kami" },
];

type NavItemProps = {
  to: string;
  label: string;
  end?: boolean;
  onClick?: () => void;
};

/* ================= NAV ITEM LINK ================= */
function NavItemLink({ to, label, end, onClick }: NavItemProps) {
  return (
    <NavLink to={to} end={end} onClick={onClick} className="relative group">
      {({ isActive }) => (
        <span
          className={cn(
            "inline-block py-2 text-sm font-medium text-foreground/90",
            "hover:text-foreground transition-colors"
          )}
        >
          {label}
          {/* active underline */}
          <span
            className={cn(
              "absolute left-0 right-0 -bottom-1 h-0.5 rounded-full bg-primary transition-all duration-200 ease-out",
              isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-25"
            )}
            style={{ transformOrigin: "left" }}
          />
          {/* hover underline */}
          {!isActive && (
            <span className="absolute left-0 right-0 -bottom-1 h-px rounded-full bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out" />
          )}
        </span>
      )}
    </NavLink>
  );
}

/* ================= NAVBAR ================= */
export default function WebsiteNavbar() {
  // baca initial theme dari <html class="dark"> kalau ada
  const [dark, setDark] = React.useState<boolean>(() =>
    document.documentElement.classList.contains("dark")
  );
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  /* scroll detector */
  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* theme toggle (kompatibel dengan sistemmu) */
  const toggleTheme = () => {
    const root = document.documentElement;
    const next = !dark;
    setDark(next);
    if (next) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b"
          : "bg-transparent"
      )}
    >
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <NavLink
          to="/website"
          end
          className="flex items-center gap-2 font-bold text-lg text-foreground"
        >
          <img
            src={school}
            alt="Logo"
            className="h-12 w-12 rounded-full object-cover border"
          />
          <span>SekolahIslamku</span>
        </NavLink>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <NavItemLink
              key={item.label}
              to={item.to}
              end={item.end}
              label={item.label}
            />
          ))}
        </div>

        {/* Right Controls (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <NavLink to="/website/daftar-sekarang">
            <Button className="rounded-full h-9 px-4 text-sm font-medium">
              Daftar Sekarang
            </Button>
          </NavLink>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                {open ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="p-0">
              <SheetHeader className="px-6 pt-4 pb-2">
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-3 px-6 pb-6">
                {navItems.map((item) => (
                  <NavItemLink
                    key={item.label}
                    to={item.to}
                    end={item.end}
                    label={item.label}
                    onClick={() => setOpen(false)}
                  />
                ))}
                <NavLink
                  to="/website/daftar-sekarang"
                  onClick={() => setOpen(false)}
                >
                  <Button className="mt-2 w-full rounded-full h-9 text-sm font-medium">
                    Daftar Sekarang
                  </Button>
                </NavLink>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
