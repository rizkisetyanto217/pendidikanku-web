import { Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import StudentDashboard from "@/pages/dashboard/students/StudentMainDashboard";
import StudentAllSchedule from "@/pages/dashboard/students/schedules/agendas/StudentScheduleAgenda";
import StudentDetailSchedule from "@/pages/dashboard/students/schedules/agendas/StudentScheduleAgendaDetail";
import StudentMenuGrids from "@/pages/dashboard/students/menus/StudentMenuGrids";
import StudentClassesAssignment from "@/pages/dashboard/students/classes/my-classes/assignments/StudentClassesAssignment";
import StudentFinance from "@/pages/dashboard/students/administration/StudentFinance";
import StudentListFinance from "@/pages/dashboard/students/administration/StudentFinanceList";
import StudentProgress from "@/pages/dashboard/students/classes/progress/StudentProgress";
import StudentRaport from "@/pages/dashboard/students/classes/progress/raports/StudentProgressRaport";
import StudentAbsence from "@/pages/dashboard/students/classes/progress/absences/StudentProgessAbsence";
import StudentNotesSummary from "@/pages/dashboard/students/classes/progress/notes-summaries/StudentNotesSummary";
import StudentProfil from "@/pages/dashboard/students/profiles/StudentProfil";
import StudentMyClass from "@/pages/dashboard/students/classes/my-classes/StudentMyClass";
import StudentMaterial from "@/pages/dashboard/students/classes/my-classes/materials/StudentClassesMaterial";
import StudentQuizPage from "@/pages/dashboard/students/classes/StudentQuizPage";
import StudentClassesAttandence from "@/pages/dashboard/students/classes/my-classes/attendances/StudentClassesAttandence";
import StudentExam from "@/pages/dashboard/students/classes/my-classes/exams/StudentClassesExam";
import StudentClassesContact from "@/pages/dashboard/students/classes/contacts/StudentClassesContact";
import StudentScheduleAgenda from "@/pages/dashboard/students/schedules/agendas/StudentScheduleAgenda";
import StudentScheduleRoutine from "@/pages/dashboard/students/schedules/routine/StudentScheduleRoutine";
import StudentEnrollment from "@/pages/dashboard/students/administration/StudentAdministrationEnrollment";
import StudentReEnrollment from "@/pages/dashboard/students/administration/StudentAdministrationReEnrollment";

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
    <Route path="tugas" element={<StudentClassesAssignment />} />

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
      {/* Halaman daftar kelas */}
      <Route path="kelas-saya" element={<StudentMyClass />} />
      <Route path="progress">
        <Route index element={<StudentProgress />} />
        <Route path="raport" element={<StudentRaport />} />
        <Route path="absensi" element={<StudentAbsence />} />
        <Route path="catatan-hasil" element={<StudentNotesSummary />} />
      </Route>
      <Route path="tugas">
        <Route index element={<StudentClassesAssignment />} />
      </Route>
      <Route path="ujian">
        <Route index element={<StudentExam />} />
      </Route>
      <Route path="kontak">
        <Route index element={<StudentClassesContact />} />
      </Route>
    </Route>

    {/* === Jadwal Sekolah === */}
    <Route path="jadwal">
      <Route path="agenda" element={<StudentScheduleAgenda />} />
      <Route path="rutin" element={<StudentScheduleRoutine />} />
    </Route>

    {/* === Jadwal Sekolah === */}
    <Route path="administrasi">
      <Route path="pendaftaran" element={<StudentEnrollment />} />
      <Route path="daftar-ulang" element={<StudentReEnrollment />} />
      {/* Halaman keuangan ringkas */}
      <Route path="keuangan" element={<StudentFinance />} />
      {/* Daftar seluruh tagihan */}
      <Route path="keuangan-list" element={<StudentListFinance />} />
      {/* Detail tagihan berdasarkan ID */}
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
      <Route
        path="kelas-saya/:id/tugas"
        element={<StudentClassesAssignment />}
      />
      <Route path="kelas-saya/:id/quiz" element={<StudentQuizPage />} />
      <Route
        path="kelas-saya/:id/kehadiran"
        element={<StudentClassesAttandence />}
      />

      {/* Detail perkembangan belajar murid */}
      <Route path="progress" element={<StudentProgress />} />
      {/* Halaman raport */}
      <Route path="progress/raport" element={<StudentRaport />} />
      {/* Halaman absensi */}
      <Route path="progress/absensi" element={<StudentAbsence />} />
      {/* Halaman catatan hasil belajar */}
      <Route path="progress/catatan-hasil" element={<StudentNotesSummary />} />

      {/* Profil murid dari menu utama */}
      <Route path="profil-murid" element={<StudentProfil />} />

      {/* Sertifikat murid (sementara dinonaktifkan)
      <Route path="sertifikat-murid" element={<StudentCertificate />} /> */}
    </Route>
  </Route>
);
