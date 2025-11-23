// src/routes/StudentRoutes.tsx
import { Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import StudentDashboard from "@/pages/dashboard/students/StudentMainDashboard";
import StudentAllSchedule from "@/pages/dashboard/students/schedules/agendas/StudentScheduleAgenda";
import StudentDetailSchedule from "@/pages/dashboard/students/schedules/agendas/StudentScheduleAgendaDetail";
import StudentMenuGrids from "@/pages/dashboard/students/menus/StudentMenuGrids";
import StudentClassesAssignment from "@/pages/dashboard/students/classes/my-classes/csst/assignments/StudentClassesAssignment";
import StudentFinance from "@/pages/dashboard/students/administration/StudentFinance";
import StudentListFinance from "@/pages/dashboard/students/administration/StudentFinanceList";
import StudentProgress from "@/pages/dashboard/students/classes/progress/StudentProgress";
import StudentRaport from "@/pages/dashboard/students/classes/progress/raports/StudentProgressRaport";
import StudentAbsence from "@/pages/dashboard/students/classes/progress/absences/StudentProgessAbsence";
import StudentNotesSummary from "@/pages/dashboard/students/classes/progress/notes-summaries/StudentNotesSummary";
import StudentProfil from "@/pages/dashboard/students/profiles/StudentProfil";
import StudentMyClass from "@/pages/dashboard/students/classes/my-classes/StudentMyClass";
import StudentMaterial from "@/pages/dashboard/students/classes/my-classes/csst/materials/StudentClassesMaterial";
import StudentClassesAttandence from "@/pages/dashboard/students/classes/my-classes/csst/attendances/StudentClassesAttandence";
import StudentExam from "@/pages/dashboard/students/classes/my-classes/csst/exams/StudentClassesExam";
import StudentClassesContact from "@/pages/dashboard/students/classes/contacts/StudentClassesContact";
import StudentScheduleAgenda from "@/pages/dashboard/students/schedules/agendas/StudentScheduleAgenda";
import StudentScheduleRoutine from "@/pages/dashboard/students/schedules/routine/StudentScheduleRoutine";
import StudentEnrollment from "@/pages/dashboard/students/administration/StudentAdministrationEnrollment";
import StudentReEnrollment from "@/pages/dashboard/students/administration/StudentAdministrationReEnrollment";
import Setting from "@/pages/dashboard/components/page/Setting";
import StudentChooseClassSection from "@/pages/dashboard/students/classes/my-classes/class-sections/StudentChooseClassSection";
import StudentCSST from "@/pages/dashboard/students/classes/my-classes/csst/StudentCSST";
import StudentClassSection from "@/pages/dashboard/students/classes/my-classes/class-sections/StudentClassSection";
import StudentQuiz from "@/pages/dashboard/students/classes/my-classes/quiz/StudentQuiz";
import StudentQuizReview from "@/pages/dashboard/students/classes/my-classes/quiz/StudentQuizReview";

// ======================
// Routing untuk halaman MURID (Student Dashboard)
// ======================

export const StudentRoutes = (
  // Route utama: semua path di bawah "/:school_slug/murid"
  <Route path="murid" element={<DashboardLayout />}>
    <Route path="pengaturan" element={<Setting />} />

    {/* =====================
        DASHBOARD UTAMA
    ===================== */}
    <Route path="dashboard" element={<StudentDashboard />} />

    {/* =====================
        PROGRESS AKADEMIK
    ===================== */}
    <Route path="progress" element={<StudentProgress />} />
    <Route path="progress/raport" element={<StudentRaport />} />
    <Route path="progress/absensi" element={<StudentAbsence />} />
    <Route path="progress/catatan-hasil" element={<StudentNotesSummary />} />

    {/* =====================
        JADWAL & DETAILNYA
    ===================== */}
    <Route path="jadwal" element={<StudentAllSchedule />} />
    <Route path="jadwal/:id" element={<StudentDetailSchedule />} />

    {/* =====================
        TUGAS / ASSIGNMENT
    ===================== */}
    <Route path="tugas" element={<StudentClassesAssignment />} />

    {/* =====================
        KEUANGAN / TAGIHAN
    ===================== */}
    <Route path="keuangan" element={<StudentFinance />} />
    <Route path="keuangan-list" element={<StudentListFinance />} />

    {/* =====================
        PROFIL
    ===================== */}
    <Route path="profil-murid" element={<StudentProfil />} />

    {/* ==================================================
        GRUP 1: /murid/kelas/...
        (versi "biasa", tanpa menu utama)
       ================================================== */}
    <Route path="kelas">
      {/* /:school_slug/murid/kelas/kelas-saya */}

      <Route path="kelas-saya">
        <Route index element={<StudentMyClass />} />
        <Route
          path=":enrollment_id/pilih-kelas"
          element={<StudentChooseClassSection />} // atau StudentChooseClassSection versi-mu
        />
        <Route path="rombel/:sectionId" element={<StudentClassSection />} />
        <Route path="mapel/:csstId" element={<StudentCSST />} />
      </Route>

      <Route path="progress">
        <Route index element={<StudentProgress />} />
        <Route path="raport" element={<StudentRaport />} />
        <Route path="absensi" element={<StudentAbsence />} />
        <Route path="catatan-hasil" element={<StudentNotesSummary />} />
      </Route>

      <Route path="tugas">
        <Route index element={<StudentClassesAssignment />} />
      </Route>

      <Route path="quiz">
        <Route index element={<StudentQuiz />} />
        <Route path="review" element={<StudentQuizReview />} />
      </Route>

      <Route path="ujian">
        <Route index element={<StudentExam />} />
      </Route>

      <Route path="kontak">
        <Route index element={<StudentClassesContact />} />
      </Route>
    </Route>

    {/* === Jadwal Sekolah (shortcut) === */}
    <Route path="jadwal">
      <Route path="agenda" element={<StudentScheduleAgenda />} />
      <Route path="rutin" element={<StudentScheduleRoutine />} />
    </Route>

    {/* === Administrasi === */}
    <Route path="administrasi">
      <Route path="pendaftaran" element={<StudentEnrollment />} />
      <Route path="daftar-ulang" element={<StudentReEnrollment />} />
      <Route path="keuangan" element={<StudentFinance />} />
      <Route path="keuangan-list" element={<StudentListFinance />} />
    </Route>

    {/* ==================================================
        GRUP 2: /murid/menu-utama/...
        (versi "Menu Utama Kelas Saya" dengan showBack)
       ================================================== */}
    <Route path="menu-utama">
      {/* /:school_slug/murid/menu-utama */}
      <Route index element={<StudentMenuGrids />} />

      {/* /:school_slug/murid/menu-utama/kelas-saya */}
      <Route path="kelas-saya" element={<StudentMyClass showBack />} />

      {/* /:school_slug/murid/menu-utama/kelas-saya/:enrollment_id/pilih-kelas */}
      <Route
        path="kelas-saya/:enrollment_id/pilih-kelas"
        element={<StudentChooseClassSection />}
      />

      {/* Keuangan dari menu utama */}
      <Route path="keuangan" element={<StudentFinance />} />

      {/* Jadwal dari menu utama */}
      <Route path="jadwal" element={<StudentAllSchedule showBack />} />
      <Route path="rutin" element={<StudentScheduleRoutine showBack />} />

      {/* Tugas & ujian */}
      <Route path="tugas" element={<StudentClassesAssignment showBack />} />
      <Route path="ujian" element={<StudentExam showBack />} />

      {/* Detail per kelas */}
      <Route path="kelas-saya/:id/materi" element={<StudentMaterial />} />
      <Route
        path="kelas-saya/:id/tugas"
        element={<StudentClassesAssignment />}
      />
      <Route path="kelas-saya/:id/quiz" element={<StudentQuiz />} />
      <Route
        path="kelas-saya/:id/kehadiran"
        element={<StudentClassesAttandence />}
      />

      {/* Progress dari menu utama */}
      <Route path="progress" element={<StudentProgress showBack />} />
      <Route path="raport" element={<StudentRaport />} />
      <Route path="absensi" element={<StudentAbsence />} />
      <Route path="catatan-hasil" element={<StudentNotesSummary />} />

      {/* Profil dari menu utama */}
      <Route path="profil-murid" element={<StudentProfil />} />

      {/* /:school_slug/murid/menu-utama/mapel-saya/:csst_id */}
      <Route path="mapel/:csstId" element={<StudentCSST />} />
    </Route>
  </Route>
);
