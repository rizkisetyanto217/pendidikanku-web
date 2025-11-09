// src/components/CPendWebFooter.tsx
import * as React from "react";
import { NavLink } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Youtube,
  Facebook,
} from "lucide-react";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/* Asetmu */
import school from "@/assets/Gambar-Masjid.jpeg";

/* ================ Footer ================ */
export default function WebsiteFooter() {
  const year = new Date().getFullYear();

  const linkCls =
    "text-sm hover:underline underline-offset-4 text-muted-foreground hover:text-foreground";

  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand & mission */}
          <div>
            <div className="flex items-center gap-3 font-semibold text-lg">
              <img
                src={school}
                alt="Logo SekolahIslamku"
                className="h-12 w-12 rounded-full object-cover"
                loading="lazy"
              />
              <span>SekolahIslamku Suite</span>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Platform manajemen sekolah terpadu—PPDB, akademik, absensi,
              keuangan, dan komunikasi orang tua.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <SocialButton href="#" label="Instagram" Icon={Instagram} />
              <SocialButton href="#" label="YouTube" Icon={Youtube} />
              <SocialButton href="#" label="Facebook" Icon={Facebook} />
            </div>
          </div>

          {/* Produk */}
          <FooterCol title="Produk">
            <li>
              <NavLink to="/website/fitur" className={linkCls}>
                PPDB &amp; Penempatan
              </NavLink>
            </li>
            <li>
              <NavLink to="/website/fitur" className={linkCls}>
                Akademik &amp; Rapor
              </NavLink>
            </li>
            <li>
              <NavLink to="/website/fitur" className={linkCls}>
                Absensi &amp; Perizinan
              </NavLink>
            </li>
            <li>
              <NavLink to="/website/fitur" className={linkCls}>
                Keuangan &amp; SPP
              </NavLink>
            </li>
            <li>
              <NavLink to="/website/fitur" className={linkCls}>
                LMS &amp; E-Learning
              </NavLink>
            </li>
          </FooterCol>

          {/* Sumber daya */}
          <FooterCol title="Sumber Daya">
            <li>
              <a href="/website#demo" className={linkCls}>
                Jadwalkan Demo
              </a>
            </li>
            <li>
              <NavLink to="/website/dukung-kami" className={linkCls}>
                Dukung Kami
              </NavLink>
            </li>
            <li>
              <NavLink to="/website/fitur" className={linkCls}>
                Dokumentasi Singkat
              </NavLink>
            </li>
            <li>
              <NavLink to="/website/tentang" className={linkCls}>
                Rilis &amp; Perkembangan
              </NavLink>
            </li>
          </FooterCol>

          {/* Perusahaan */}
          <FooterCol title="Perusahaan">
            <li>
              <NavLink to="/website/tentang" className={linkCls}>
                Tentang
              </NavLink>
            </li>
            <li>
              <NavLink to="/website/fitur" className={linkCls}>
                Studi Kasus
              </NavLink>
            </li>
            <li>
              <NavLink to="/website/hubungi-kami" className={linkCls}>
                Hubungi Kami
              </NavLink>
            </li>
          </FooterCol>

          {/* Kontak */}
          <FooterCol title="Kontak">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5" />
              <span>Jl. Pendidikan No. 123, Indonesia</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a className="hover:underline" href="tel:+6281234567890">
                +62 812-3456-7890
              </a>
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a
                className="hover:underline"
                href="mailto:sales@sekolahislamku.id"
              >
                sales@sekolahislamku.id
              </a>
            </li>
          </FooterCol>
        </div>

        <Separator className="my-8" />

        <div className="text-xs flex flex-col items-center gap-2 md:flex-row md:justify-center md:gap-6 text-center text-muted-foreground">
          <div>© {year} SekolahIslamku Suite. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline hover:text-foreground">
              Kebijakan Privasi
            </a>
            <a href="#" className="hover:underline hover:text-foreground">
              Syarat &amp; Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ================ Subcomponents ================ */

function FooterCol({
  title,
  children,
}: React.PropsWithChildren<{ title: string }>) {
  return (
    <div>
      <h4 className="font-semibold mb-3">{title}</h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function SocialButton({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <Button
      asChild
      variant="outline"
      size="icon"
      className="rounded-xl h-9 w-9"
      aria-label={label}
    >
      <a href={href}>
        <Icon className="h-4 w-4" />
        <span className="sr-only">{label}</span>
      </a>
    </Button>
  );
}
