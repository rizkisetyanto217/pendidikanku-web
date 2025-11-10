import { Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import StudentDashboard from "@/pages/dashboard/students/StudentMainDashboard";
import StudentAllSchedule from "@/pages/dashboard/students/schedules/StudentSchedule";
import StudentDetailSchedule from "@/pages/dashboard/students/schedules/StudentDetailSchedule";
import StudentMenuGrids from "@/pages/dashboard/students/menus/StudentMenuGrids";
import StudentAssignment from "@/pages/dashboard/students/classes/my-classes/assignments/StudentAssignment";
import StudentFinance from "@/pages/dashboard/students/finances/StudentFinance";
import StudentListFinance from "@/pages/dashboard/students/finances/StudentListFinance";
import StudentProgress from "@/pages/dashboard/students/classes/progress/StudentProgress";
import StudentRaport from "@/pages/dashboard/students/classes/progress/raports/StudentRaport";
import StudentAbsence from "@/pages/dashboard/students/classes/progress/absences/StudentAbsence";
import StudentNotesSummary from "@/pages/dashboard/students/classes/progress/notes-summaries/StudentNotesSummary";
import StudentProfil from "@/pages/dashboard/students/profiles/StudentProfil";
import StudentMyClass from "@/pages/dashboard/students/classes/my-classes/StudentMyClass";
import StudentMaterial from "@/pages/dashboard/students/classes/my-classes/materials/StudentMaterial";
import StudentQuizPage from "@/pages/dashboard/students/classes/StudentQuizPage";
import StudentAttandenceClass from "@/pages/dashboard/students/classes/my-classes/attendances/StudentAttandenceClass";

// ======================
// Routing untuk halaman MURID (Student Dashboard)
// ======================

export const StudentRoutes = (
  // Route utama: semua path di bawah "/murid"
  <Route path="murid" element={<DashboardLayout />}>
    {/* =====================
        DASHBOARD UTAMA
    ===================== */}
    {/* Halaman utama dashboard murid */}
    <Route path="dashboard" element={<StudentDashboard />} />

    {/* =====================
        PROGRESS AKADEMIK
    ===================== */}
    {/* Detail perkembangan belajar murid */}
    <Route path="progress" element={<StudentProgress />} />
    {/* Halaman raport */}
    <Route path="progress/raport" element={<StudentRaport />} />
    {/* Halaman absensi */}
    <Route path="progress/absensi" element={<StudentAbsence />} />
    {/* Halaman catatan hasil belajar */}
    <Route path="progress/catatan-hasil" element={<StudentNotesSummary />} />

    {/* =====================
        JADWAL & DETAILNYA
    ===================== */}
    {/* Detail perkembangan belajar murid */}
    <Route path="jadwal" element={<StudentAllSchedule />} />
    <Route path="jadwal/:id" element={<StudentDetailSchedule />} />

    {/* =====================
        TUGAS / ASSIGNMENT
    ===================== */}
    {/* Daftar tugas */}
    <Route path="tugas" element={<StudentAssignment />} />

    {/* =====================
        KEUANGAN / TAGIHAN
    ===================== */}
    {/* Halaman keuangan ringkas */}
    <Route path="keuangan" element={<StudentFinance />} />
    {/* Daftar seluruh tagihan */}
    <Route path="keuangan-list" element={<StudentListFinance />} />
    {/* Detail tagihan berdasarkan ID */}

    {/* =====================
        PROFIL & MENU LAINNYA
    ===================== */}
    {/* Profil murid */}
    <Route path="profil-murid" element={<StudentProfil />} />
    {/* Detail umum murid */}

    {/* === Guru === */}
    <Route path="kelas">
      <Route path="progress">
        <Route index element={<StudentProgress />} />
        <Route path="raport" element={<StudentRaport />} />
        <Route path="absensi" element={<StudentAbsence />} />
        <Route path="catatan-hasil" element={<StudentNotesSummary />} />
      </Route>
      <Route path="tugas">
        <Route index element={<StudentAssignment />} />
      </Route>
      <Route path="ujian">
        <Route index element={<StudentAssignment />} />
      </Route>
    </Route>

    {/* =====================
        MENU UTAMA KELAS SAYA
    ===================== */}
    <Route path="menu-utama">
      {/* Halaman utama menu grid murid */}
      <Route index element={<StudentMenuGrids />} />

      {/* Halaman daftar kelas */}
      <Route path="kelas-saya" element={<StudentMyClass />} />

      {/* Halaman keuangan ringkas */}
      <Route path="keuangan" element={<StudentFinance />} />

      {/* Jadwal utama (khusus tampilan kelas saya / tab jadwal) */}
      <Route path="jadwal" element={<StudentAllSchedule />} />

      {/* Detail per kelas (dengan dynamic :id) */}
      <Route path="kelas-saya/:id/materi" element={<StudentMaterial />} />
      <Route path="kelas-saya/:id/tugas" element={<StudentAssignment />} />
      <Route path="kelas-saya/:id/quiz" element={<StudentQuizPage />} />
      <Route
        path="kelas-saya/:id/kehadiran"
        element={<StudentAttandenceClass />}
      />

      {/* Detail perkembangan belajar murid */}
      <Route path="progress" element={<StudentProgress />} />
      {/* Halaman raport */}
      <Route path="progress/raport" element={<StudentRaport />} />
      {/* Halaman absensi */}
      <Route path="progress/absensi" element={<StudentAbsence />} />
      {/* Halaman catatan hasil belajar */}
      <Route path="progress/catatan-hasil" element={<StudentNotesSummary />} />

      <Route path="tugas" element={<StudentAssignment />} />

      {/* Profil murid dari menu utama */}
      <Route path="profil-murid" element={<StudentProfil />} />

      {/* Sertifikat murid (sementara dinonaktifkan)
      <Route path="sertifikat-murid" element={<StudentCertificate />} /> */}
    </Route>
  </Route>
);