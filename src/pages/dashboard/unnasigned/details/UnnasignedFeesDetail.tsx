// src/pages/dashboard/unnasigned/details/UnnasignedFeesDetail.tsx

import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Receipt,
  GraduationCap,
  Info,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { PMBClassRow } from "../UnnasignedInfo";

function formatRupiah(amount: number): string {
  return amount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

/* =========================
   API Types (disederhanakan)
========================= */

type FeeRuleAmountOption = {
  code: string;
  label: string;
  amount: number;
};

type ApiFeeRule = {
  fee_rule_id: string;
  fee_rule_school_id: string;
  fee_rule_scope: string;
  fee_rule_term_id: string | null;
  fee_rule_general_billing_kind_id: string | null;
  fee_rule_bill_code: string | null;
  fee_rule_option_code: string | null;
  fee_rule_is_default: boolean;

  fee_rule_amount_options: FeeRuleAmountOption[];

  fee_rule_gbk_code_snapshot: string | null;
  fee_rule_gbk_name_snapshot: string | null;
  fee_rule_gbk_category_snapshot: string | null; // "registration", "spp", dll
  fee_rule_gbk_is_global_snapshot: boolean;
  fee_rule_gbk_visibility_snapshot: string | null;
  fee_rule_gbk_is_recurring_snapshot: boolean;
  fee_rule_gbk_requires_month_year_snapshot: boolean;
  fee_rule_gbk_requires_option_code_snapshot: boolean;
  fee_rule_gbk_default_amount_idr_snapshot: number | null;

  fee_rule_created_at: string;
  fee_rule_updated_at: string;
};

type ApiClass = {
  class_id: string;
  class_school_id: string;
  class_name: string;
  class_slug: string;
  class_start_date: string;
  class_end_date: string;
  class_registration_opens_at: string | null;
  class_registration_closes_at: string | null;
  class_quota_total: number | null;
  class_quota_taken: number;
  class_delivery_mode: "online" | "offline" | "hybrid";
  class_status: "active" | "inactive" | string;
  class_class_parent_id: string;
  class_parent_code_snapshot: string | null;
  class_parent_name_snapshot: string;
  class_parent_slug_snapshot: string | null;
  class_parent_level_snapshot: number;
  class_academic_term_id: string;
  class_academic_term_academic_year_snapshot: string;
  class_academic_term_name_snapshot: string;
  class_academic_term_slug_snapshot: string;
  class_academic_term_angkatan_snapshot: string;
  class_notes?: string | null;
};

type ApiTerm = {
  academic_term_id: string;
  academic_term_school_id: string;
  academic_term_academic_year: string;
  academic_term_name: string;
  academic_term_start_date: string;
  academic_term_end_date: string;
  academic_term_is_active: boolean;
  academic_term_angkatan: number | null;
  academic_term_slug: string | null;
};

type ApiTermItem = {
  term: ApiTerm;
  classes?: ApiClass[];
  fee_rules?: ApiFeeRule[];
};

type ApiListResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};

export default function PendWebPMBFeesDetail() {
  const { school_slug, id } = useParams<{ school_slug: string; id: string }>();
  const navigate = useNavigate();

  const slug = school_slug ?? "sekolah";

  // === Fetch term + classes + fee_rules ===
  // disamakan dengan PendWebPMBInfo: BE baca school dari JWT, bukan slug path
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pmb-fees-detail", slug],
    queryFn: async () => {
      const res = await api.get<ApiListResponse<ApiTermItem>>(
        "/u/academic-terms/list",
        {
          params: {
            include: "classes,fee_rules",
            per_page: 50,
          },
        }
      );
      return res.data;
    },
    enabled: true,
  });

  // ===== Bentuk data yang dibutuhkan untuk halaman ini =====
  const view = useMemo(() => {
    if (!data || !id) return null;

    for (const item of data.data) {
      const term = item.term;
      const classes = item.classes ?? [];
      const feeRules = item.fee_rules ?? [];

      for (const c of classes) {
        if (c.class_id !== id) continue;

        // fallback periode daftar kelas → kalau kosong pakai term
        const regOpen =
          c.class_registration_opens_at ?? term.academic_term_start_date;
        const regClose =
          c.class_registration_closes_at ?? term.academic_term_end_date;

        // hitung apakah pendaftaran masih dibuka (logic selaras dengan UnnasignedInfo)
        const now = new Date();
        const openAt = regOpen ? new Date(regOpen) : null;
        const closeAt = regClose ? new Date(regClose) : null;

        const isOpenForRegistration = (() => {
          if (c.class_status.toLowerCase() !== "active") return false;
          if (openAt && now < openAt) return false;
          if (closeAt && now > closeAt) return false;
          if (
            c.class_quota_total != null &&
            c.class_quota_taken >= c.class_quota_total
          ) {
            return false;
          }
          return true;
        })();

        const angkatan =
          c.class_academic_term_angkatan_snapshot ||
          (term.academic_term_angkatan != null
            ? String(term.academic_term_angkatan)
            : "");

        const cls: PMBClassRow = {
          class_id: c.class_id,
          class_slug: c.class_slug,
          class_name: c.class_name,
          class_class_parent_name_snapshot: c.class_parent_name_snapshot,
          class_class_parent_level_snapshot: c.class_parent_level_snapshot,
          class_academic_term_name_snapshot:
            c.class_academic_term_name_snapshot || term.academic_term_name,
          class_academic_term_angkatan_snapshot: angkatan,
          class_delivery_mode: c.class_delivery_mode,
          class_registration_opens_at: regOpen,
          class_registration_closes_at: regClose,
          class_quota_total: c.class_quota_total,
          class_quota_taken: c.class_quota_taken,
          class_notes: c.class_notes ?? null,
          // NEW: selaras dengan tipe PMBClassRow terbaru
          is_open_for_registration: isOpenForRegistration,
        };

        // fee_rules yang relevan untuk term ini
        const termFeeRules = feeRules.filter(
          (fr) =>
            fr.fee_rule_term_id === term.academic_term_id ||
            fr.fee_rule_scope === "term"
        );

        return {
          cls,
          term,
          feeRules: termFeeRules,
        };
      }
    }

    return null;
  }, [data, id]);

  function handlePayNow() {
    // TODO:
    // - di step berikutnya user milih opsi biaya (T1/T2/T3)
    // - kirim ke backend → create payment (registration-enroll)
    // - redirect ke Midtrans Snap
    // placeholder sekarang:
    // console.log("Bayar sekarang untuk class_id:", view?.cls.class_id);
  }

  // ===== STATE: loading / error / not found =====

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 md:py-14 md:px-6 space-y-6">
        <div>
          <Link
            to={`/${slug}/pmb`}
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Kembali ke daftar program
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Memuat rincian biaya...
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Silakan tunggu sebentar.</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !view) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 md:py-14 md:px-6 space-y-6">
        <div>
          <Link
            to={`/${slug}/pmb`}
            className="text-xs text-muted-foreground hover:underline"
          >
            ← Kembali ke daftar program
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Rincian biaya tidak dapat ditampilkan
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Maaf, tidak dapat menemukan informasi biaya untuk program yang
              kamu pilih.
            </p>
            <p>Silakan kembali ke detail program atau hubungi admin sekolah.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { cls, feeRules } = view;

  // Untuk summary kecil di bawah: ambil minimal amount (optional)
  const minAmount =
    feeRules
      .flatMap((fr) => fr.fee_rule_amount_options ?? [])
      .reduce<number | null>((min, opt) => {
        if (min === null) return opt.amount;
        return opt.amount < min ? opt.amount : min;
      }, null) ?? undefined;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 md:py-14 md:px-6 space-y-8">
      {/* breadcrumb */}
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/${slug}/pmb/${cls.class_id}`}
          className="text-xs text-muted-foreground hover:underline"
        >
          ← Kembali ke detail program
        </Link>
      </div>

      {/* header */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs bg-background/60 backdrop-blur">
          <Badge variant="outline" className="gap-1 px-2 py-0.5">
            <GraduationCap className="w-3 h-3" />
            PMB {slug}
          </Badge>
          <span className="text-muted-foreground">
            Rincian komponen biaya awal
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {cls.class_name}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {cls.class_class_parent_name_snapshot} •{" "}
          {cls.class_academic_term_name_snapshot}
        </p>
      </header>

      {/* table biaya */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="w-9 h-9 rounded-full grid place-items-center bg-primary/10">
            <Receipt className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base md:text-lg">
              Komponen biaya yang diatur sekolah
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Data diambil langsung dari aturan biaya (fee rules) periode ini.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm md:text-base">
          {feeRules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada aturan biaya yang terhubung dengan periode ini. Silakan
              hubungi admin sekolah untuk informasi nominal pendaftaran.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-card/40">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/60">
                  <tr className="text-xs md:text-sm">
                    <th className="px-4 py-3 text-left font-medium">
                      Komponen
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Pilihan / Keterangan
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Nominal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {feeRules.map((fr) => {
                    const category = fr.fee_rule_gbk_category_snapshot ?? "";
                    const isRegistration =
                      category.toLowerCase() === "registration";
                    const isSpp = category.toLowerCase() === "spp";

                    const title =
                      fr.fee_rule_gbk_name_snapshot ||
                      fr.fee_rule_option_code ||
                      fr.fee_rule_gbk_code_snapshot ||
                      "Komponen biaya";

                    const options = fr.fee_rule_amount_options ?? [];

                    if (options.length === 0) {
                      // fallback kalau nggak ada amount_options
                      const baseAmount =
                        fr.fee_rule_gbk_default_amount_idr_snapshot;
                      return (
                        <tr
                          key={fr.fee_rule_id}
                          className="border-t border-border/60"
                        >
                          <td className="px-4 py-3 align-top">
                            <div className="font-medium">{title}</div>
                            <div className="mt-1 inline-flex flex-wrap items-center gap-2">
                              {isRegistration && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  PENDAFTARAN
                                </Badge>
                              )}
                              {isSpp && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  SPP
                                </Badge>
                              )}
                              {fr.fee_rule_gbk_is_recurring_snapshot && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] bg-blue-600/15 text-blue-500"
                                >
                                  BERKALA
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground align-top">
                            {fr.fee_rule_gbk_category_snapshot
                              ? `Kategori: ${fr.fee_rule_gbk_category_snapshot}`
                              : "Mengikuti ketentuan sekolah."}
                          </td>
                          <td className="px-4 py-3 text-right align-top font-medium">
                            {baseAmount != null
                              ? formatRupiah(baseAmount)
                              : "-"}
                          </td>
                        </tr>
                      );
                    }

                    // kalau punya amount_options → render satu baris per opsi
                    return options.map((opt) => (
                      <tr
                        key={`${fr.fee_rule_id}-${opt.code}`}
                        className="border-t border-border/60"
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium">{title}</div>
                          <div className="mt-1 inline-flex flex-wrap items-center gap-2">
                            {isRegistration && (
                              <Badge variant="outline" className="text-[10px]">
                                PENDAFTARAN
                              </Badge>
                            )}
                            {isSpp && (
                              <Badge variant="outline" className="text-[10px]">
                                SPP
                              </Badge>
                            )}
                            {fr.fee_rule_gbk_is_recurring_snapshot && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-blue-600/15 text-blue-500"
                              >
                                BERKALA
                              </Badge>
                            )}
                            {opt.code && (
                              <Badge variant="outline" className="text-[10px]">
                                {opt.code}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground align-top">
                          {opt.label || "Pilihan nominal"}
                        </td>
                        <td className="px-4 py-3 text-right align-top font-medium">
                          {formatRupiah(opt.amount)}
                        </td>
                      </tr>
                    ));
                  })}

                  {/* baris summary kecil (opsional) */}
                  {minAmount !== undefined && (
                    <tr className="border-t border-border/80 bg-muted/40">
                      <td className="px-4 py-3 font-semibold" colSpan={2}>
                        Perkiraan minimal pembayaran awal
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-500">
                        {formatRupiah(minAmount)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
            <Info className="w-3 h-3 mt-[2px]" />
            <span>
              Nominal dan komponen di atas langsung mengikuti pengaturan admin
              sekolah di dashboard Madinah Salam. Pada langkah berikutnya, kamu
              bisa memilih opsi biaya yang tersedia sebelum melanjutkan ke
              pembayaran.
            </span>
          </p>

          {/* Tombol ke Midtrans */}
          <div className="pt-2 flex flex-col gap-2">
            <Button
              className="w-full md:w-auto"
              size="lg"
              onClick={handlePayNow}
              disabled={feeRules.length === 0}
            >
              Lanjut ke Pembayaran
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <button
              type="button"
              className="text-xs text-muted-foreground hover:underline self-start"
              onClick={() => navigate(`/${slug}/pmb/${cls.class_id}`)}
            >
              Kembali tanpa membayar
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}