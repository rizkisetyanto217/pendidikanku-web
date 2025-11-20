// src/pages/common/UserHelpPage.tsx (atau ganti file yang lama)

import { useMemo, useState, type ReactNode } from "react";
import {
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  Copy,
  Check,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* shadcn/ui */
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export type HelpContact = {
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string; // +62...
  whatsapp?: string; // nomor only (tanpa +)
  note?: string;
  hours?: string; // "Sen-Jum 08.00–17.00"
};

export type HelpFaq = {
  id: string;
  question: string;
  answer: string | React.ReactNode;
  tags?: string[];
};

type Props = {
  /** Opsional — jika kosong akan pakai dummy */
  contacts?: HelpContact[];
  faqs?: HelpFaq[];

  /** Title/desc opsional */
  title?: string;
  description?: string;
};

const DUMMY_CONTACTS: HelpContact[] = [
  {
    id: "c1",
    name: "Admin Akademik",
    role: "Tata Usaha",
    email: "madinahsalam@gmail.com",
    phone: "+62 21 555 7777",
    whatsapp: "6281212345678",
    hours: "Sen–Jum 08.00–16.00",
    note: "Pertanyaan seputar jadwal, perkuliahan, dan KHS.",
  },
  {
    id: "c2",
    name: "Admin Keuangan",
    role: "Bendahara",
    email: "keuangan@kampus.ac.id",
    phone: "+62 812 9999 8888",
    whatsapp: "6281299998888",
    hours: "Sen–Jum 09.00–17.00",
    note: "Tagihan, pembayaran, dan bukti transfer.",
  },
];

const DUMMY_FAQS: HelpFaq[] = [
  {
    id: "f1",
    question: "Bagaimana cara reset kata sandi akun?",
    answer:
      "Buka halaman Login → klik 'Lupa kata sandi' → masukkan email → cek kotak masuk dan ikuti instruksi reset.",
    tags: ["akun", "login", "sandi"],
  },
  {
    id: "f2",
    question: "Mengapa absensi saya tidak muncul?",
    answer:
      "Pastikan Anda memilih periode tanggal yang tepat. Jika masih tidak muncul, hubungi wali kelas atau admin akademik untuk sinkronisasi.",
    tags: ["absensi", "jadwal"],
  },
  {
    id: "f3",
    question: "Bagaimana cara melihat dan mengunduh KHS?",
    answer:
      "Masuk ke halaman Progress → tab 'Nilai & IPS' → tombol 'KHS'. Anda dapat mengunduh dalam bentuk PDF.",
    tags: ["nilai", "khs", "progress"],
  },
];

function Copyable({
  value,
  children,
}: {
  value: string;
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          // ignore
        }
      }}
      title="Salin"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span className="sr-only">Salin</span>
      {children}
    </Button>
  );
}

export default function Help({
  contacts = DUMMY_CONTACTS,
  faqs = DUMMY_FAQS,
  title = "Bantuan",
  description = "Butuh bantuan? Hubungi admin atau lihat pertanyaan yang sering diajukan.",
}: Props) {
  const [qFaq, setQFaq] = useState("");

  const faqFiltered = useMemo(() => {
    const q = qFaq.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        (typeof f.answer === "string" && f.answer.toLowerCase().includes(q)) ||
        (f.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  }, [faqs, qFaq]);

  return (
    <div className="container max-w-5xl py-6 space-y-6">
      {/* Header page */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold inline-flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid grid-cols-2 gap-2 mb-4 w-full sm:w-auto">
          <TabsTrigger value="contact">Kontak Admin</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* ===== Kontak Admin ===== */}
        <TabsContent value="contact" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Kontak Resmi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border bg-card/60 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-medium flex items-center gap-2">
                      {c.name}
                      {c.role && (
                        <Badge variant="secondary" className="uppercase">
                          {c.role}
                        </Badge>
                      )}
                    </div>
                    {(c.note || c.hours) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {c.note}
                        {c.note && c.hours ? " • " : ""}
                        {c.hours}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {c.phone && (
                      <a
                        className={cn(
                          "inline-flex items-center gap-1 text-sm rounded-md border px-2 py-1",
                          "hover:bg-muted/50"
                        )}
                        href={`tel:${c.phone.replace(/\s+/g, "")}`}
                        title="Telepon"
                      >
                        <Phone className="h-4 w-4" /> {c.phone}
                      </a>
                    )}
                    {c.email && (
                      <a
                        className={cn(
                          "inline-flex items-center gap-1 text-sm rounded-md border px-2 py-1",
                          "hover:bg-muted/50"
                        )}
                        href={`mailto:${c.email}`}
                        title="Email"
                      >
                        <Mail className="h-4 w-4" /> {c.email}
                      </a>
                    )}
                    {c.whatsapp && (
                      <a
                        className={cn(
                          "inline-flex items-center gap-1 text-sm rounded-md border px-2 py-1",
                          "hover:bg-muted/50"
                        )}
                        href={`https://wa.me/${c.whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </a>
                    )}
                    {(c.email || c.phone) && (
                      <Copyable value={c.email || c.phone || ""} />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground">
            Butuh eskalasi? Balas email/WA dengan subjek <b>[URGENT]</b>.
          </div>
        </TabsContent>

        {/* ===== FAQ ===== */}
        <TabsContent value="faq" className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Cari FAQ (mis. ‘absensi’, ‘KHS’, ‘login’)"
              value={qFaq}
              onChange={(e) => setQFaq(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Pertanyaan yang Sering Diajukan
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {faqFiltered.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  Tidak ada pertanyaan yang cocok dengan pencarian.
                </div>
              ) : (
                <Accordion type="single" collapsible>
                  {faqFiltered.map((f) => (
                    <AccordionItem key={f.id} value={f.id}>
                      <AccordionTrigger className="px-4">
                        {f.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 text-sm leading-relaxed">
                        {typeof f.answer === "string" ? (
                          <p>{f.answer}</p>
                        ) : (
                          f.answer
                        )}
                        {f.tags && f.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {f.tags.map((t) => (
                              <Badge key={t} variant="outline">
                                #{t}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
