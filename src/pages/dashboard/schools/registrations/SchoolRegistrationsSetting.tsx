import * as React from "react";
import { useMemo, useState, useEffect } from "react";

/* ✅ Breadcrumb header */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* shadcn/ui */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* icons */
import { Copy, Save, Globe2, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CBadgeStatus from "@/components/costum/common/CBadgeStatus";

/* utils */
const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/* =====================================================================
 * Dummy data (selaras skema)
 * ===================================================================== */
const TERMS = [
  { id: "t1", year: "2025/2026", name: "Ganjil", active: true },
  { id: "t2", year: "2025/2026", name: "Genap", active: false },
];

const GB_HEADERS = [
  {
    id: "gb1",
    title: "Biaya Pendaftaran PMB 2025/2026",
    termId: "t1",
    amount: 150_000,
    active: true,
  },
  {
    id: "gb2",
    title: "Biaya Pendaftaran Gelombang 2",
    termId: "t1",
    amount: 175_000,
    active: true,
  },
  {
    id: "gb3",
    title: "Biaya Pendaftaran Kelas 2A",
    termId: "t2",
    amount: 150_000,
    active: false,
  },
];

/* =====================================================================
 * Small components
 * ===================================================================== */
function SectionTitle({ children }: React.PropsWithChildren) {
  return <h2 className="text-base font-semibold md:text-lg">{children}</h2>;
}

function Row({
  label,
  children,
  hint,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-2 md:grid-cols-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

/* =====================================================================
 * Main Page Component
 * ===================================================================== */
type Props = { showBack?: boolean; backTo?: string; backLabel?: string };

export default function SchoolRegistrationsSetting({
  showBack = false,
  backTo
}: Props) {
  const navigate = useNavigate();
  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  /* ✅ Tambah breadcrumb seperti SchoolAcademic */
  const { setHeader } = useDashboardHeader();
  useEffect(() => {
    setHeader({
      title: "PMB — Pengaturan",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Pendaftaran" },
        { label: "Pengaturan" },
      ],
      showBack,
    });
  }, [setHeader, showBack]);

  const activeTerm = useMemo(() => TERMS.find((t) => t.active) || TERMS[0], []);
  const [termId, setTermId] = useState<string>(activeTerm.id);

  const gbForTerm = useMemo(
    () => GB_HEADERS.filter((g) => (g.termId ?? termId) === termId),
    [termId]
  );
  const defaultGb = gbForTerm[0];

  // Form state (dummy)
  const [defaultFee, setDefaultFee] = useState<number>(
    defaultGb?.amount ?? 150_000
  );
  const [codeFmt, setCodeFmt] = useState("PMB-{{YEAR}}-{{SEQ4}}");
  const [allowOnline, setAllowOnline] = useState(true);
  const [requirePaymentFirst, setRequirePaymentFirst] = useState(false);
  const [autoCreateCharge, setAutoCreateCharge] = useState(true);
  const [channels, setChannels] = useState<string[]>([
    "gateway",
    "qris",
    "bank_transfer",
    "cash",
  ]);
  const [instruction, setInstruction] = useState(
    "Silakan isi formulir pendaftaran dengan benar. Setelah pembayaran terkonfirmasi, tim sekolah akan menghubungi Anda."
  );

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://schoolku.local";
  const registerUrl = `${baseUrl}/public/pmb/register?term=${termId}`;

  return (
    <div className="mx-auto w-full">
      {/* Header Page */}
      {/* Header Back seperti SchoolAcademic */}
      <div className="md:flex hidden gap-3 items-center">
        {showBack && (
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="cursor-pointer self-start"
          >
            <ArrowLeft size={20} />
          </Button>
        )}
        <div>
          <h1 className="text-lg font-semibold md:text-xl">
            PMB - Pengaturan
          </h1>
          <p className="mt-1 text-xs text-muted-foreground md:text-sm mb-4">
            Kelola preferensi PMB: biaya default, format kode, kanal pembayaran,
            dan tautan publik
          </p>
        </div>
      </div>

      {/* ===== Konteks Periode ===== */}
      <Card className="mb-4">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-base md:text-lg">
            Konteks Periode
          </CardTitle>
          <div className="w-full min-w-[220px] md:w-72">
            <Select value={termId} onValueChange={setTermId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                {TERMS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.year} — {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">
                Header Biaya Terpilih
              </div>
              <div className="text-sm font-medium">
                {defaultGb?.title || "-"}
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">
                Nominal Default
              </div>
              <div className="text-sm font-medium">
                {fmtIDR(defaultGb?.amount ?? 0)}
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground mb-1">Status</div>
              <div className="text-sm font-medium">
                <CBadgeStatus
                  status={
                    defaultGb?.active === true
                      ? "active"
                      : defaultGb?.active === false
                        ? "inactive"
                        : "pending"
                  }
                />
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* ===== Preferensi Biaya & Kode ===== */}
      <Card className="mb-4">
        <CardHeader>
          <SectionTitle>Preferensi Biaya & Kode</SectionTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row
            label="Biaya Pendaftaran Default"
            hint="Dipakai saat membuat General Billing kind=Pendaftaran"
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={defaultFee}
                onChange={(e) =>
                  setDefaultFee(parseInt(e.target.value || "0", 10))
                }
                className="max-w-[200px]"
              />
              <Badge variant="secondary">{fmtIDR(defaultFee)}</Badge>
            </div>
          </Row>
          <Row
            label="Format Kode Pendaftar"
            hint="Token: {{YEAR}}, {{SEQ4}}, {{TERM}}, dll."
          >
            <Input
              value={codeFmt}
              onChange={(e) => setCodeFmt(e.target.value)}
            />
          </Row>
        </CardContent>
      </Card>

      {/* ===== Pembukaan Pendaftaran & Tagihan ===== */}
      <Card className="mb-4">
        <CardHeader>
          <SectionTitle>Pembukaan Pendaftaran & Tagihan</SectionTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row label="Buka Pendaftaran Online">
            <Switch checked={allowOnline} onCheckedChange={setAllowOnline} />
          </Row>
          <Row label="Buat Tagihan Otomatis (charge)">
            <Switch
              checked={autoCreateCharge}
              onCheckedChange={setAutoCreateCharge}
            />
          </Row>
          <Row
            label="Wajib Bayar sebelum Submit"
            hint="Jika aktif, form pendaftaran selesai setelah payment=paid"
          >
            <Switch
              checked={requirePaymentFirst}
              onCheckedChange={setRequirePaymentFirst}
            />
          </Row>
        </CardContent>
      </Card>

      {/* ===== Kanal Pembayaran ===== */}
      <Card className="mb-4">
        <CardHeader>
          <SectionTitle>Kanal Pembayaran yang Diizinkan</SectionTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Channel
              item="gateway"
              label="Gateway (Midtrans/Xendit)"
              value={channels}
              setValue={setChannels}
            />
            <Channel
              item="qris"
              label="QRIS"
              value={channels}
              setValue={setChannels}
            />
            <Channel
              item="bank_transfer"
              label="Transfer Bank"
              value={channels}
              setValue={setChannels}
            />
            <Channel
              item="cash"
              label="Tunai"
              value={channels}
              setValue={setChannels}
            />
          </div>
        </CardContent>
      </Card>

      {/* ===== Tautan Publik ===== */}
      <Card className="mb-4">
        <CardHeader>
          <SectionTitle>Tautan Pendaftaran Publik</SectionTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="URL Pendaftaran" hint="Bagikan ke orang tua calon siswa">
            <div className="flex items-center gap-2">
              <Input readOnly value={registerUrl} />
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigator.clipboard?.writeText(registerUrl)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Salin
              </Button>
              <a
                href={registerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex"
              >
                <Button type="button" variant="outline">
                  <Globe2 className="mr-2 h-4 w-4" />
                  Buka
                </Button>
              </a>
            </div>
          </Row>
          <Row label="Instruksi Tambahan">
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              rows={4}
            />
          </Row>
        </CardContent>
      </Card>

      {/* ===== Preview Payload ===== */}
      <Card>
        <CardHeader>
          <SectionTitle>Preview Payload (dummy)</SectionTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap break-all rounded-md bg-muted p-3 text-xs">
            {JSON.stringify(
              {
                termId,
                settings: {
                  defaultFee,
                  codeFmt,
                  allowOnline,
                  autoCreateCharge,
                  requirePaymentFirst,
                  channels,
                  instruction,
                  defaultGbId: defaultGb?.id,
                },
              },
              null,
              2
            )}
          </pre>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="outline">
              <LinkIcon className="mr-2 h-4 w-4" />
              Uji Link
            </Button>
            <Button
              onClick={() =>
                alert(
                  "Simpan dummy. Sambungkan ke endpoint settings untuk produksi."
                )
              }
            >
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="h-6" />
    </div>
  );
}

/* =====================================================================
 * Channel component
 * ===================================================================== */
function Channel({
  item,
  label,
  value,
  setValue,
}: {
  item: string;
  label: string;
  value: string[];
  setValue: (v: string[]) => void;
}) {
  const checked = value.includes(item);
  return (
    <label className="flex items-center gap-2 rounded-lg border p-3">
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => {
          if (v) setValue([...value, item]);
          else setValue(value.filter((x) => x !== item));
        }}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
