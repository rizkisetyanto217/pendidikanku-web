// src/pages/public/Contact.tsx
import * as React from "react";
import { Phone, Mail, MapPin } from "lucide-react";

/* shadcn/ui */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/hooks/use-toast";

/* Komponenmu */
import WebsiteNavbar from "@/components/common/public/CWebsiteNavbar";
import WebsiteFooter from "@/pages/profile/website/website/components/CPendWebFooter";

const FullBleed: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`relative left-1/2 right-1/2 -mx-[50vw] w-screen ${className}`}
  >
    {children}
  </div>
);

export default function PendWebContact() {
  const { toast } = useToast();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: sambungkan ke backend-mu di sini.
    toast({
      title: "Pesan terkirim",
      description: "Terima kasih! Kami akan merespons secepatnya.",
    });
    (e.currentTarget as HTMLFormElement).reset();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WebsiteNavbar />
      <div className="h-16" />

      <FullBleed>
        {/* HERO */}
        <section className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="mx-auto h-12 w-12 mb-4 opacity-90" />
          <h1 className="text-3xl md:text-4xl font-bold">Hubungi Kami</h1>
          <p className="mt-3 max-w-2xl mx-auto text-sm md:text-base opacity-90">
            Ada pertanyaan, masukan, atau ingin bekerja sama? Tim kami siap
            membantu Anda.
          </p>
        </section>

        {/* INFO GRID */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="rounded-2xl text-center">
              <CardContent className="p-6">
                <Phone className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Telepon</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Hubungi tim kami melalui nomor berikut:
                </p>
                <Button asChild className="rounded-full">
                  <a href="tel:+628123456789">+62 812 3456 789</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl text-center">
              <CardContent className="p-6">
                <Mail className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Email</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Kirimkan pertanyaan atau saran melalui email:
                </p>
                <Button asChild className="rounded-full" variant="secondary">
                  <a href="mailto:support@sekolahislamku.id">
                    support@sekolahislamku.id
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl text-center">
              <CardContent className="p-6">
                <MapPin className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-2">Alamat</h3>
                <p className="text-sm text-muted-foreground">
                  Jl. Pendidikan No. 123, Jakarta, Indonesia
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FORM + MAP (opsional map placeholder) */}
        <section className="w-full px-4 sm:px-6 lg:px-8 pb-16">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="rounded-3xl">
              <CardContent className="p-6 md:p-8">
                <h3 className="font-semibold text-lg mb-4">Kirim Pesan</h3>
                <form onSubmit={onSubmit} className="grid gap-4 text-sm">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-xs text-muted-foreground"
                    >
                      Nama Anda
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-xs text-muted-foreground"
                    >
                      Email Anda
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="message"
                      className="text-xs text-muted-foreground"
                    >
                      Pesan Anda
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      className="rounded-xl resize-y"
                    />
                  </div>
                  <Button type="submit" className="rounded-full h-11">
                    Kirim Pesan
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-3xl overflow-hidden">
              <AspectRatio ratio={16 / 9}>
                {/* Ganti dengan embed peta (Google Maps/Leaflet) bila siap */}
                <img
                  src="https://images.unsplash.com/photo-1496568816309-51d7c20e2b18?q=80&w=1600&auto=format&fit=crop"
                  alt="Lokasi kantor"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </AspectRatio>
              <div className="p-4 text-sm text-muted-foreground">
                *Ganti gambar ini dengan embed peta lokasi sekolah/kantor Anda.
              </div>
            </Card>
          </div>
        </section>

        {/* FOOTER */}
        <WebsiteFooter />
      </FullBleed>
    </div>
  );
}
