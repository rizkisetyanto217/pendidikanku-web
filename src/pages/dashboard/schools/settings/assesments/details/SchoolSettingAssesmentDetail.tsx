// src/pages/dashboard/school/assessment/SchoolSettingAssesmentDetail.tsx
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Settings2,
  ListChecks,
  BookOpenCheck,
  Pencil,
} from "lucide-react";
import axios from "@/lib/axios";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/* Layout header hook */
import { useDashboardHeader } from "@/components/layout/dashboard/DashboardLayout";

/* Simple badge untuk boolean */
import { cn } from "@/lib/utils";

/* =================== Types =================== */

type AssessmentTypeApi = {
  assessment_type_id: string;
  assessment_type_school_id: string;
  assessment_type_key: string;
  assessment_type_name: string;
  assessment_type_weight_percent: number;
  assessment_type: string;
  assessment_type_shuffle_questions: boolean;
  assessment_type_shuffle_options: boolean;
  assessment_type_show_correct_after_submit: boolean;
  assessment_type_strict_mode: boolean;
  assessment_type_attempts_allowed: number;
  assessment_type_require_login: boolean;
  assessment_type_is_active: boolean;
  assessment_type_is_graded: boolean;
  assessment_type_allow_late_submission: boolean;
  assessment_type_late_penalty_percent: number;
  assessment_type_passing_score_percent: number;
  assessment_type_score_aggregation_mode:
    | "first"
    | "latest"
    | "highest"
    | "average";
  assessment_type_show_score_after_submit: boolean;
  assessment_type_show_correct_after_closed: boolean;
  assessment_type_allow_review_before_submit: boolean;
  assessment_type_require_complete_attempt: boolean;
  assessment_type_show_details_after_all_attempts: boolean;
  assessment_type_created_at: string;
  assessment_type_updated_at: string;
};

type AssessmentTypesResponse = {
  success: boolean;
  message?: string;
  data: AssessmentTypeApi[];
};

/* =================== Helpers =================== */

function formatAggMode(
  mode: AssessmentTypeApi["assessment_type_score_aggregation_mode"]
) {
  switch (mode) {
    case "first":
      return "Attempt pertama";
    case "latest":
      return "Attempt terakhir";
    case "highest":
      return "Nilai tertinggi";
    case "average":
      return "Rata-rata semua attempt";
    default:
      return mode;
  }
}

function formatType(t: string) {
  switch (t) {
    case "daily_exam":
      return "Ulangan Harian";
    case "mid_exam":
      return "UTS / Ujian Tengah";
    case "final_exam":
      return "UAS / Ujian Akhir";
    default:
      return t;
  }
}

const BoolPill: React.FC<{ value: boolean }> = ({ value }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
      value
        ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/30"
        : "bg-zinc-500/10 text-zinc-400 ring-zinc-500/30"
    )}
  >
    {value ? "Ya" : "Tidak"}
  </span>
);

/* =================== Page =================== */

type Props = { showBack?: boolean; backTo?: string };

const SchoolSettingAssesmentDetail: React.FC<Props> = ({
  showBack = true,
  backTo,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleBack = () => (backTo ? navigate(backTo) : navigate(-1));

  const goEdit = () => {
    if (!id) return;
    // dari /pengaturan/tugas/:id → lompat ke /pengaturan/tugas/edit/:id
    navigate(`../edit/${id}`);
  };

  const { setHeader } = useDashboardHeader();

  const qAssessmentType = useQuery({
    queryKey: ["assessment-type-detail", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await axios.get<AssessmentTypesResponse>(
        "/api/u/assessment-types/list",
        {
          params: { id },
        }
      );
      const item = res.data?.data?.[0];
      if (!item) throw new Error("Tipe penilaian tidak ditemukan");
      return item;
    },
  });

  const data = qAssessmentType.data;

  useEffect(() => {
    setHeader({
      title: data ? data.assessment_type_name : "Detail Tipe Penilaian",
      breadcrumbs: [
        { label: "Dashboard", href: "dashboard" },
        { label: "Akademik" },
        { label: "Tipe Penilaian", href: "/sekolah/pengaturan/tugas" },
        { label: data?.assessment_type_name ?? "Detail" },
      ],
      showBack,
    });
  }, [data, setHeader, showBack]);

  return (
    <div className="w-full overflow-x-hidden bg-background text-foreground">
      <main className="w-full">
        <div className="mx-auto flex flex-col gap-4 lg:gap-6">
          {/* Top header (local) */}
          <div className="md:flex hidden gap-3 items-center">
            {showBack && (
              <Button
                onClick={handleBack}
                variant="ghost"
                size="icon"
                className="cursor-pointer self-start"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="font-semibold text-lg md:text-xl">
                {data?.assessment_type_name ?? "Detail Tipe Penilaian"}
              </h1>
              {data && (
                <p className="text-xs text-muted-foreground mt-1">
                  Kode:{" "}
                  <span className="font-mono">{data.assessment_type_key}</span>{" "}
                  • Jenis: {formatType(data.assessment_type)}
                </p>
              )}
            </div>
          </div>

          {/* Loading / error */}
          {qAssessmentType.isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat pengaturan tipe penilaian…
            </div>
          )}

          {qAssessmentType.isError && !qAssessmentType.isLoading && (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-sm">Gagal memuat data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-destructive">
                  {(qAssessmentType.error as Error).message}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => qAssessmentType.refetch()}
                >
                  Coba lagi
                </Button>
              </CardContent>
            </Card>
          )}

          {data && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              {/* ================== Blok 1: Pengaturan Penilaian ================== */}
              <Card className="h-fit">
                <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-500/15 p-2">
                      <Settings2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-sm md:text-base">
                        Pengaturan Penilaian
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Bobot nilai, kelulusan, dan aturan penilaian.
                      </p>
                    </div>
                  </div>
                  <Button
            
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={goEdit}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Nama Tipe
                      </div>
                      <div className="font-medium">
                        {data.assessment_type_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Kode</div>
                      <div className="font-mono text-xs">
                        {data.assessment_type_key}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Bobot dalam rapor
                      </div>
                      <div className="font-medium">
                        {data.assessment_type_weight_percent}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Aktif</div>
                      <BoolPill value={data.assessment_type_is_active} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Dinilai (masuk skor)
                      </div>
                      <BoolPill value={data.assessment_type_is_graded} />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Minimal kelulusan
                      </div>
                      <div className="font-medium">
                        {data.assessment_type_passing_score_percent}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Cara agregasi nilai
                      </div>
                      <div className="font-medium">
                        {formatAggMode(
                          data.assessment_type_score_aggregation_mode
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Wajib login
                      </div>
                      <BoolPill value={data.assessment_type_require_login} />
                    </div>
                  </div>

                  <div className="border-t pt-3 mt-2 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Izinkan pengumpulan terlambat
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Jika diizinkan, nilai bisa dikurangi sesuai penalti.
                        </p>
                      </div>
                      <BoolPill
                        value={data.assessment_type_allow_late_submission}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Penalti keterlambatan
                        </div>
                      </div>
                      <div className="font-medium">
                        {data.assessment_type_late_penalty_percent}%
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Tampilkan nilai setelah submit
                        </div>
                      </div>
                      <BoolPill
                        value={data.assessment_type_show_score_after_submit}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Wajib menyelesaikan seluruh attempt
                        </div>
                      </div>
                      <BoolPill
                        value={data.assessment_type_require_complete_attempt}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          Tampilkan detail setelah semua attempt habis
                        </div>
                      </div>
                      <BoolPill
                        value={
                          data.assessment_type_show_details_after_all_attempts
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ================== Blok 2: Pengaturan Quiz / Ulangan ================== */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-sky-500/15 p-2">
                        <BookOpenCheck className="h-4 w-4 text-sky-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm md:text-base">
                          Pengaturan Quiz & Ulangan
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Perilaku soal, opsi, dan attempt.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={goEdit}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Acak urutan soal
                          </div>
                        </div>
                        <BoolPill
                          value={data.assessment_type_shuffle_questions}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Acak urutan opsi jawaban
                          </div>
                        </div>
                        <BoolPill
                          value={data.assessment_type_shuffle_options}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Mode ketat (strict mode)
                          </div>
                        </div>
                        <BoolPill value={data.assessment_type_strict_mode} />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Jumlah attempt diizinkan
                          </div>
                        </div>
                        <div className="font-medium">
                          {data.assessment_type_attempts_allowed ?? 0}
                        </div>
                      </div>
                    </div>

                    <div className="border-t mt-3 pt-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Izinkan review sebelum submit
                          </div>
                        </div>
                        <BoolPill
                          value={
                            data.assessment_type_allow_review_before_submit
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Tampilkan jawaban benar setelah submit
                          </div>
                        </div>
                        <BoolPill
                          value={data.assessment_type_show_correct_after_submit}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Tampilkan jawaban benar setelah kuis ditutup
                          </div>
                        </div>
                        <BoolPill
                          value={data.assessment_type_show_correct_after_closed}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ringkas info singkat di samping */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-amber-500/15 p-2">
                        <ListChecks className="h-4 w-4 text-amber-400" />
                      </div>
                      <div>
                        <CardTitle className="text-sm md:text-base">
                          Ringkasan
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Gambaran cepat tipe penilaian ini.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={goEdit}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Tipe penilaian
                      </span>
                      <span className="font-medium">
                        {formatType(data.assessment_type)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Bobot
                      </span>
                      <span className="font-medium">
                        {data.assessment_type_weight_percent}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Status
                      </span>
                      <BoolPill value={data.assessment_type_is_active} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        Dinilai di rapor
                      </span>
                      <BoolPill value={data.assessment_type_is_graded} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SchoolSettingAssesmentDetail;
