import { Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import StudentDashboard from "@/pages/dashboard/students/StudentMainDashboard";
import StudentAllSchedule from "@/pages/dashboard/students/academics/schedules/StudentSchedule";
import StudentDetailSchedule from "@/pages/dashboard/students/academics/schedules/StudentDetailSchedule";
import StudentMenuGrids from "@/pages/dashboard/students/menus/StudentMenuGrids";
import StudentAssignment from "@/pages/dashboard/students/assignments/StudentAssignment";
import StudentFinance from "@/pages/dashboard/students/finances/StudentFinance";
import StudentListFinance from "@/pages/dashboard/students/finances/StudentListFinance";
import StudentProgress from "@/pages/dashboard/students/progress/StudentProgress";
import StudentRaport from "@/pages/dashboard/students/progress/raports/StudentRaport";
import StudentAbsence from "@/pages/dashboard/students/progress/absences/StudentAbsence";
import StudentNotesSummary from "@/pages/dashboard/students/progress/notes-summaries/StudentNotesSummary";
import StudentProfil from "@/pages/dashboard/students/profiles/StudentProfil";
import StudentMyClass from "@/pages/dashboard/students/classes/StudentMyClass";
import StudentMaterial from "@/pages/dashboard/students/classes/StudentMaterial";
import StudentQuizPage from "@/pages/dashboard/students/classes/StudentQuizPage";
import StudentAttandenceClass from "@/pages/dashboard/students/classes/StudentAttandenceClass";
// import StudentProgressDetail from "@/pages/pendidikanku-dashboard/dashboard-students/progress/StudentProgress";
// import StudentAllSchedule from "@/pages/pendidikanku-dashboard/dashboard-students/academic/book/StudentAllSchedule";
// import StudentProfil from "@/pages/pendidikanku-dashboard/dashboard-students/profil/StudentProfil";
// import StudentAssignmentClass from "@/pages/pendidikanku-dashboard/dashboard-students/assignment/StudentAssignmentClass";
// import StudentDetailSchedule from "@/pages/pendidikanku-dashboard/dashboard-students/academic/schedule/StudentDetailSchedule";
// import StudentAnnouncements from "@/pages/pendidikanku-dashboard/dashboard-students/announcement/StudentAnnouncement";

// import StudentRaport from "@/pages/pendidikanku-dashboard/dashboard-students/progress/raport/StudentRaport";

// import StudentFInance from "@/pages/pendidikanku-dashboard/dashboard-students/finance/StudentFinance";
// import StudentSchedule from "@/pages/pendidikanku-dashboard/dashboard-students/schedule/StudentSchedule";
// import StudentListFinance from "@/pages/pendidikanku-dashboard/dashboard-students/finance/StudentListFinance";

// import StudentAbsence from "@/pages/pendidikanku-dashboard/dashboard-students/progress/absence/StudentAbsence";
// import StudentNotesSummary from "@/pages/pendidikanku-dashboard/dashboard-students/progress/notes-summary/StudentNotesSummary";
// import StudentMenuGrids from "@/pages/pendidikanku-dashboard/dashboard-students/menu/StudentMenuGrids";
// import StudentMyClass from "@/pages/pendidikanku-dashboard/dashboard-students/class/StudentMyClass";
// import StudentMaterial from "@/pages/pendidikanku-dashboard/dashboard-students/class/StudentMaterial";
// import StudentQuizPage from "@/pages/pendidikanku-dashboard/dashboard-students/class/StudentQuizPage";
// import StudentAttandenceClass from "@/pages/pendidikanku-dashboard/dashboard-students/class/StudentAttandenceClass";
// import StudentCertificate from "@/pages/pendidikanku-dashboard/dashboard-students/certificate/StudentCertificate";
// import StudentRoutesPlayground from "@/pages/pendidikanku-dashboard/dashboard-students/StudentRoutesPlayground";

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
    <Route index element={<StudentDashboard />} />

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
