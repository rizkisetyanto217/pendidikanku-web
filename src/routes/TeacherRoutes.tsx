// src/routes/TeacherRoutes.tsx
import { Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

// Dashboard & Profil
import TeacherDashboard from "@/pages/dashboard/teachers/TeacherMainDashboard";

// Menu utama guru
import TeacherMenuGrids from "@/pages/dashboard/teachers/menus/TeacherMenuGrids";
import TeacherClass from "@/pages/dashboard/teachers/classes/TeacherClass";
import TeacherCSST from "@/pages/dashboard/teachers/csst/TeacherCSST";
import TeacherScheduleAgenda from "@/pages/dashboard/teachers/schedules/agendas/TeacherScheduleAgenda";
import TeacherProfil from "@/pages/dashboard/teachers/profiles/TeacherProfil";
import TeacherCSSTDetail from "@/pages/dashboard/teachers/csst/details/TeacherCSSTDetail";
import TeacherCSSTStudentList from "@/pages/dashboard/teachers/csst/menus/student-profiles/TeacherCSSTStudentList";
import TeacherCSSTStudentDetail from "@/pages/dashboard/teachers/csst/menus/student-profiles/details/TeacherCSSTStudentDetail";
import TeacherClassDetail from "@/pages/dashboard/teachers/classes/Details/TeacherClassDetail";
import TeacherScheduleRoutine from "@/pages/dashboard/teachers/schedules/routines/TeacherScheduleRoutine";
import TeacherQuizBuilder from "@/pages/dashboard/teachers/quiz/TeacherQuizBuilder";
import TeacherScheduleRoutineDetail from "@/pages/dashboard/teachers/schedules/routines/details/TeacherScheduleRoutineDetail";
import TeacherScheduleAgendaDetail from "@/pages/dashboard/teachers/schedules/agendas/details/TeacherScheduleAgendaDetail";
import TeacherCSSTAssessmentDetail from "@/pages/dashboard/teachers/csst/menus/assignments/details/TeacherCSSTAssignmentDetail";
import TeacherCSSTAssessmentForm from "@/pages/dashboard/teachers/csst/menus/assignments/details/TeacherCSSTAssessmentForm";
import TeacherCSSTAssignment from "@/pages/dashboard/teachers/csst/menus/assignments/TeacherCSSTAssignment";
import TeacherCSSTStudentAttendanceList from "@/pages/dashboard/teachers/csst/menus/student-attendances/TeacherCSSTStudentAttendanceList";
import TeacherCSSTMaterialList from "@/pages/dashboard/teachers/csst/menus/materials/TeacherCSSTMaterialList";
import TeacherCSSTBookList from "@/pages/dashboard/teachers/csst/menus/books/TeacherCSSTBookList";
import TeacherCSSTExam from "@/pages/dashboard/teachers/csst/menus/exams/TeacherCSSTExam";
import TeacherCSSTBookDetail from "@/pages/dashboard/teachers/csst/menus/books/details/TeacherCSSTBookDetail";
import TeacherCSSTManagement from "@/pages/dashboard/teachers/csst/menus/managements/TeacherCSSTManagement";
import Setting from "@/pages/dashboard/components/page/Setting";
import TeacherCSSTDailyReport from "@/pages/dashboard/teachers/csst/menus/daily-progress/TeacherCSSTDailyReport";
import TeacherCSSTDailyReportDetail from "@/pages/dashboard/teachers/csst/menus/daily-progress/details/TeacherCSSTDailyReportDetail";
import TeacherCSSTBookForm from "@/pages/dashboard/teachers/csst/menus/books/details/TeacherCSSTBookForm";
import TeacherCSSTMaterialForm from "@/pages/dashboard/teachers/csst/menus/materials/details/TeacherCSSTMaterialForm";
import TeacherCSSTStudentAttendanceDetail from "@/pages/dashboard/teachers/csst/menus/student-attendances/details/TeacherCSSTStudentAttendanceDetail";

export const TeacherRoutes = (
  <Route path="guru" element={<DashboardLayout />}>
    <Route path="pengaturan" element={<Setting />} />

    {/* Dashboard */}
    <Route path="dashboard" element={<TeacherDashboard />} />

    {/* Wali Kelas */}
    <Route path="wali-kelas">
      <Route index element={<TeacherClass />} />
      <Route path=":classSectionId" element={<TeacherClassDetail />} />
      <Route
        path=":classSectionId/murid"
        element={<TeacherCSSTStudentList />}
      />
      <Route
        path=":classSectionId/murid/:id"
        element={<TeacherCSSTStudentDetail />}
      />
    </Route>

    {/* Guru Mapel / CSST */}
    <Route path="guru-mapel">
      {/* index: list semua mapel yang diampu guru */}
      <Route index element={<TeacherCSST />} />

      {/* parent: detail mapel + tab internal, pakai Outlet */}
      <Route path=":csstId" element={<TeacherCSSTDetail />}>
        {/* default child kalau cuma /guru-mapel/:csstId */}
        <Route index element={<TeacherCSSTManagement />} />
        {/* atau kalau mau ringkasannya di komponen lain:
        <Route index element={<TeacherCSSTOverview />} /> */}

        {/* Kehadiran Murid */}
        <Route path="absensi" element={<TeacherCSSTStudentAttendanceList />} />
        <Route
          path="absensi/:id"
          element={<TeacherCSSTStudentAttendanceDetail />}
        />

        {/* Murid */}
        <Route path="murid" element={<TeacherCSSTStudentList />} />
        <Route path="murid/:id" element={<TeacherCSSTStudentDetail />} />

        {/* Daily progress */}
        <Route path="daily-progress" element={<TeacherCSSTDailyReport />} />
        <Route
          path="daily-progress/:id"
          element={<TeacherCSSTDailyReportDetail />}
        />

        {/* Kelola kelas (kalau mau sebagai tab terpisah, bisa tetap di sini) */}
        <Route path="kelola-kelas" element={<TeacherCSSTManagement />} />

        {/* Materi */}
        <Route path="materi" element={<TeacherCSSTMaterialList />} />
        <Route path="materi/new" element={<TeacherCSSTMaterialForm />} />
        <Route
          path="materi/edit/:materialId"
          element={<TeacherCSSTMaterialForm />}
        />

        {/* Ujian */}
        <Route path="ujian" element={<TeacherCSSTExam />} />

        {/* Buku */}
        <Route path="buku" element={<TeacherCSSTBookList />} />
        <Route path="buku/new" element={<TeacherCSSTBookForm />} />
        <Route path="buku/:bookId" element={<TeacherCSSTBookDetail />} />
        <Route path="buku/edit/:bookId" element={<TeacherCSSTBookForm />} />

        {/* Tugas / Assessment */}
        <Route path="tugas" element={<TeacherCSSTAssignment />} />
        <Route path="tugas/new" element={<TeacherCSSTAssessmentForm />} />
        <Route
          path="tugas/:assessmentId"
          element={<TeacherCSSTAssessmentDetail />}
        />
        <Route
          path="tugas/:assessmentId/:quizId"
          element={<TeacherQuizBuilder />}
        />
      </Route>
    </Route>

    {/* Jadwal */}
    <Route path="jadwal">
      <Route path="agenda" element={<TeacherScheduleAgenda />} />
      <Route path="agenda/:id" element={<TeacherScheduleAgendaDetail />} />
      <Route path="rutin" element={<TeacherScheduleRoutine />} />
      <Route
        path="rutin/:routineId"
        element={<TeacherScheduleRoutineDetail />}
      />
    </Route>

    {/* Profil */}
    <Route path="profil-guru" element={<TeacherProfil />} />

    {/* Menu Utama Guru */}
    <Route path="menu-utama">
      <Route index element={<TeacherMenuGrids />} />
      {/* Wali Kelas */}
      <Route path="wali-kelas">
        <Route index element={<TeacherClass />} />
        <Route path=":classSectionId" element={<TeacherClassDetail />} />
      </Route>

      {/* Guru Mapel / CSST */}
      <Route path="guru-mapel">
        <Route index element={<TeacherCSST />} />
        <Route path=":csstId" element={<TeacherCSSTDetail />} />

        {/* Kehadiran Murid */}
        <Route
          path=":csstId/semua-kehadiran"
          element={<TeacherCSSTStudentAttendanceList />}
        />
        <Route path=":csstId/murid" element={<TeacherCSSTStudentList />} />
        <Route
          path=":csstId/murid/:id"
          element={<TeacherCSSTStudentDetail />}
        />

        {/* Assignments */}
        <Route path=":csstId/tugas" element={<TeacherCSSTAssignment />} />
        <Route
          path=":csstId/tugas/new"
          element={<TeacherCSSTAssessmentForm />}
        />
        <Route
          path=":csstId/tugas/:assessmentId"
          element={<TeacherCSSTAssessmentDetail />}
        />
        <Route
          path=":csstId/tugas/:assessmentId/:quizId"
          element={<TeacherQuizBuilder />}
        />

        {/* Materi, Ujian, Buku */}
        <Route path=":csstId/materi" element={<TeacherCSSTMaterialList />} />
        <Route path=":csstId/ujian" element={<TeacherCSSTExam />} />
        <Route path=":csstId/buku" element={<TeacherCSSTBookList />} />
        <Route
          path=":csstId/buku/:bookId"
          element={<TeacherCSSTBookDetail />}
        />
      </Route>

      {/* Jadwal */}
      <Route path="agenda">
        <Route index element={<TeacherScheduleAgenda />} />
        <Route path="agenda/:id" element={<TeacherScheduleAgendaDetail />} />
        <Route path="rutin" element={<TeacherScheduleRoutine />} />
        <Route
          path="rutin/:routineId"
          element={<TeacherScheduleRoutineDetail />}
        />
      </Route>

      {/* Profil */}
      <Route path="profil-guru" element={<TeacherProfil />} />
    </Route>
  </Route>
);
