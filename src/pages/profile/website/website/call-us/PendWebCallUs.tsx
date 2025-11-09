// src/pages/ContactUs.tsx
import * as React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Instagram,
  Youtube,
  Facebook,
  
} from "lucide-react";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/hooks/use-toast";

/* Komponenmu */
import WebsiteNavbar from "@/components/common/public/CWebsiteNavbar";
import WebsiteFooter from "@/pages/profile/website/website/components/CPendWebFooter";

const FullBleed: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen ${className}`}>
    {children}
  </div>
);

const Section: React.FC<
  React.PropsWithChildren<{ id?: string; className?: string }>
> = ({ id, className = "", children }) => (
  <section id={id} className={`px-4 sm:px-6 lg:px-8 ${className}`}>
    <div className="w-full">{children}</div>
  </section>
);

export default function PendWebCallUs() {
  const { toast } = useToast();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: sambungkan ke endpoint mu di sini (fetch/axios)
    toast({
      title: "Pesan terkirim",
      description: "Terima kasih! Kami akan menghubungi Anda kembali.",
    });
    (e.currentTarget as HTMLFormElement).reset();
  }

  return (
    <FullBleed>
      <div className="min-h-screen overflow-x-hidden w-screen bg-gradient-to-b from-background to-background/60 text-foreground">
        {/* Navbar */}
        <WebsiteNavbar />
        <div style={{ height: "5.5rem" }} />

        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <AspectRatio ratio={16 / 9}>
              <img
                src="https://images.unsplash.com/photo-1544717305-996b815c338c?q=80&w=2400&auto=format&fit=crop"
                alt="Hero background"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </AspectRatio>
          </div>

          <Section className="relative py-14 sm:py-20 lg:py-24">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Hubungi Kami
              </h1>
              <p className="mt-3 text-muted-foreground">
                Tim SekolahIslamku siap membantu. Pilih kanal komunikasi yang paling nyaman.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button asChild className="rounded-full">
                  <a href="tel:+6281234567890">
                    <Phone className="h-4 w-4 mr-2" /> Telepon Sekarang
                  </a>
                </Button>
                <Button asChild variant="secondary" className="rounded-full">
                  <a href="mailto:sales@sekolahislamku.id">
                    <Mail className="h-4 w-4 mr-2" /> Kirim Email
                  </a>
                </Button>
              </div>
            </div>
          </Section>
        </div>

        {/* Content */}
        <Section className="py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cards */}
            <div className="lg:col-span-1 space-y-4">
              <ContactItem
                icon={<Phone className="h-5 w-5" />}
                title="Telepon"
                value="+62 812-3456-7890"
                href="tel:+6281234567890"
              />
              <ContactItem
                icon={<Mail className="h-5 w-5" />}
                title="Email"
                value="sales@sekolahislamku.id"
                href="mailto:sales@sekolahislamku.id"
              />
              <ContactItem
                icon={<MapPin className="h-5 w-5" />}
                title="Alamat"
                value="Jl. Pendidikan No. 123, Indonesia"
              />
              <ContactItem
                icon={<Clock className="h-5 w-5" />}
                title="Jam Operasional"
                value="Senin–Jumat 09.00–17.00 WIB"
              />

              {/* Socials */}
              <Card>
                <CardContent className="p-4">
                  <div className="font-semibold mb-3">Ikuti Kami</div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <SocialIcon href="#" label="Instagram">
                      <Instagram className="h-4 w-4" />
                    </SocialIcon>
                    <SocialIcon href="#" label="YouTube">
                      <Youtube className="h-4 w-4" />
                    </SocialIcon>
                    <SocialIcon href="#" label="Facebook">
                      <Facebook className="h-4 w-4" />
                    </SocialIcon>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Form + Map */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="rounded-3xl">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5" />
                    <div className="font-semibold">Kirim Pesan</div>
                  </div>

                  <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs text-muted-foreground">
                        Nama Lengkap
                      </Label>
                      <Input id="name" name="name" required className="rounded-xl" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs text-muted-foreground">
                        Email
                      </Label>
                      <Input id="email" name="email" type="email" required className="rounded-xl" />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="subject" className="text-xs text-muted-foreground">
                        Subjek
                      </Label>
                      <Input id="subject" name="subject" required className="rounded-xl" />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="message" className="text-xs text-muted-foreground">
                        Pesan
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        className="rounded-xl resize-y"
                      />
                    </div>

                    <div className="md:col-span-2 mt-2 flex items-center gap-3">
                      <Button type="submit" className="rounded-full">
                        <Send className="h-4 w-4 mr-2" /> Kirim Pesan
                      </Button>
                      <Button asChild variant="link" className="px-0">
                        <a
                          href="https://wa.me/6281234567890"
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm"
                        >
                          atau chat via WhatsApp
                        </a>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="rounded-3xl overflow-hidden">
                <AspectRatio ratio={16 / 9}>
                  {/* Map placeholder (ganti dengan embed map sekolah jika sudah ada) */}
                  <img
                    src="https://images.unsplash.com/photo-1496568816309-51d7c20e2b18?q=80&w=1600&auto=format&fit=crop"
                    alt="Lokasi kantor"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </AspectRatio>
                <Separator />
                <div className="p-4 text-sm text-muted-foreground">
                  *Ganti gambar ini dengan embed peta lokasi sekolah/kantor Anda.
                </div>
              </Card>
            </div>
          </div>
        </Section>

        {/* FOOTER */}
        <WebsiteFooter />
      </div>
    </FullBleed>
  );
}

/* ======================= Sub-components ======================= */

function ContactItem({
  icon,
  title,
  value,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
}) {
  const Inner = (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{value}</div>
      </div>
    </div>
  );

  return (
    <Card className="rounded-2xl hover:shadow-sm transition">
      <CardContent className="p-4">
        {href ? (
          <a href={href} className="block">
            {Inner}
          </a>
        ) : (
          Inner
        )}
      </CardContent>
    </Card>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="p-2 rounded-xl border hover:bg-accent transition inline-flex"
    >
      {children}
      <span className="sr-only">{label}</span>
    </a>
  );
}
