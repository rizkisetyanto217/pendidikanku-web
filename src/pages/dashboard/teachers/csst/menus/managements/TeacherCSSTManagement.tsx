// src/pages/sekolahislamku/teachers/TeacherCSSTManagement.tsx
import { useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, BookOpen, Calendar, Loader2 } from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// ✅ komponen = value import (tanpa 'type')
import ModalEditManagementClass from "@/pages/dashboard/teachers/csst/menus/managements/components/CTeacherModalEditManagementClass";

// ✅ ClassInfo = type-only import (pakai 'type')
import type { ClassInfo } from "@/pages/dashboard/teachers/csst/menus/managements/components/CTeacherModalEditManagementClass";

import AddStudent from "@/pages/dashboard/teachers/csst/menus/managements/components/CTeacherAddStudent";
import CBadgeStatus from "@/components/costum/common/CBadgeStatus";

const TeacherCSSTManagement = () => {
  const { className } = useParams();
  const location = useLocation() as {
    state?: { className?: string; students?: number; lastSubject?: string };
  };
  const navigate = useNavigate();
  const { toast } = useToast();

  const info = location.state;
  // ✨ state local override (tanpa sumber data baru)
  const [overrides, setOverrides] = useState<ClassInfo | null>(null);
  const view = useMemo(() => {
    return {
      className:
        overrides?.className ?? info?.className ?? String(className ?? ""),
      students:
        typeof overrides?.students === "number"
          ? overrides?.students
          : typeof info?.students === "number"
            ? info?.students
            : undefined,
      lastSubject: overrides?.lastSubject ?? info?.lastSubject ?? undefined,
    };
  }, [overrides, info, className]);

  // modal edit
  const [editOpen, setEditOpen] = useState(false);

  // modal tambah siswa
  const [openAdd, setOpenAdd] = useState(false);

  // konfirmasi & loading state (pengganti SweetAlert)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const doDelete = async () => {
    try {
      setDeleting(true);
      // TODO: panggil API delete di sini
      // await axios.delete(`/api/kelas/${id}`);
      await new Promise((r) => setTimeout(r, 900)); // simulasi delay
      toast({
        title: "Terhapus",
        description: "Kelas berhasil dihapus.",
      });
      navigate(-1);
    } catch (e: any) {
      toast({
        title: "Gagal menghapus",
        description: e?.message ?? "Terjadi kesalahan saat menghapus kelas.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="w-full bg-background text-foreground">
      {/* Modal Edit */}
      <ModalEditManagementClass
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Kelas"
        defaultValue={{
          className: view.className,
          students: view.students,
          lastSubject: view.lastSubject,
        }}
        onSubmit={(val) => setOverrides(val)}
      />

      {/* Modal Tambah Siswa */}
      <AddStudent
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={(val) => {
          console.log("Student added:", val);
        }}
      />

      {/* Dialog kecil untuk loading hapus */}
      <Dialog open={deleting}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Menghapus…</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm text-muted-foreground">
              Mohon tunggu sebentar.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <main className="w-full ">
        <div className="mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Konten utama */}
          <section className="flex-1 flex flex-col space-y-6 min-w-0">
            {/* Header tombol kembali */}
            <div className="md:flex hidden gap-3 items-center">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="gap-1 h-9"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Pengelolaan Kelas</h1>
            </div>

            {/* Card informasi kelas */}
            <Card>
              <CardHeader className="border-b bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Informasi Kelas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Nama Kelas */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      NAMA KELAS
                    </div>
                    <p className="text-xl font-bold">
                      {info?.className ?? String(className)}
                    </p>
                  </div>

                  {/* Jumlah Siswa */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      JUMLAH SISWA
                    </div>
                    <p className="text-xl font-bold flex items-center gap-2 text-muted-foreground">
                      {typeof info?.students === "number" ? (
                        <>
                          {info?.students}
                          <span className="text-sm font-normal opacity-80">
                            siswa
                          </span>
                        </>
                      ) : (
                        <span className="text-base opacity-60">
                          Tidak ada data
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Pelajaran Terakhir */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      PELAJARAN TERAKHIR
                    </div>
                    <p className="text-lg font-semibold">
                      {info?.lastSubject ?? (
                        <span className="opacity-60 font-normal">
                          Belum ada pelajaran
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => setOpenAdd(true)}
                    className="px-6"
                  >
                    Tambah Siswa
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setEditOpen(true)}
                    className="px-6"
                  >
                    Edit Kelas
                  </Button>

                  {/* Ganti Swal confirm → AlertDialog */}
                  <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="px-6">
                        Hapus Kelas
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus kelas?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Kelas “{view.className || className}” akan dihapus.
                          Tindakan ini tidak bisa dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={doDelete}
                          disabled={deleting}
                          className="gap-2"
                        >
                          {deleting && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          Ya, hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>

            {/* Dua kartu: Statistik & Aksi cepat */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-foreground/70" />
                    Statistik Singkat
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">
                        Status Kelas
                      </span>
                      <CBadgeStatus status="active" className="text-xs" />
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">
                        Kehadiran Hari Ini
                      </span>
                      <span className="font-medium">-</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">
                        Tugas Pending
                      </span>
                      <span className="font-medium">-</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    Aksi Cepat
                  </h3>
                  <div className="space-y-3">
                    <button
                      className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-all"
                      onClick={() => alert("Lihat daftar siswa")}
                    >
                      <div className="font-medium">Lihat Daftar Siswa</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Kelola data siswa dalam kelas
                      </div>
                    </button>
                    <button
                      className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-all"
                      onClick={() => alert("Buat jadwal")}
                    >
                      <div className="font-medium">Atur Jadwal Pelajaran</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Kelola jadwal mata pelajaran
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TeacherCSSTManagement;
