// src/routes/TeacherRoutes.tsx
import { Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

// Dashboard & Profil
import TeacherDashboard from "@/pages/dashboard/teachers/TeacherMainDashboard";

// Menu utama guru
import TeacherMenuGrids from "@/pages/dashboard/teachers/menus/TeacherMenuGrids";
import TeacherClass from "@/pages/dashboard/teachers/classes/TeacherClassFromSections";
import TeacherCSST from "@/pages/dashboard/teachers/csst/TeacherCSST";
import TeacherScheduleAgenda from "@/pages/dashboard/teachers/schedules/agendas/TeacherScheduleAgenda";
import TeacherProfil from "@/pages/dashboard/teachers/profiles/TeacherProfil";
import TeacherCSSTDetail from "@/pages/dashboard/teachers/csst/details/TeacherCSSTDetail";
import TeacherCSSTStudentList from "@/pages/dashboard/teachers/csst/menus/student-profiles/TeacherCSSTStudentList";
import TeacherCSSTStudentDetail from "@/pages/dashboard/teachers/csst/menus/student-profiles/TeacherCSSTStudentDetail";
import TeacherClassDetail from "@/pages/dashboard/teachers/classes/Details/TeacherClassDetail";
import TeacherScheduleRoutine from "@/pages/dashboard/teachers/schedules/routines/TeacherScheduleRoutine";
import TeacherQuizBuilder from "@/pages/dashboard/teachers/quiz/TeacherQuizBuilder";
import TeacherScheduleRoutineDetail from "@/pages/dashboard/teachers/schedules/routines/details/TeacherScheduleRoutineDetail";
import TeacherScheduleAgendaDetail from "@/pages/dashboard/teachers/schedules/agendas/details/TeacherScheduleAgendaDetail";
import TeacherCSSTAssessmentDetail from "@/pages/dashboard/teachers/csst/menus/assignments/details/TeacherCSSTAssignmentDetail";
import TeacherCSSTAssessmentCreate from "@/pages/dashboard/teachers/csst/menus/assignments/details/TeacherCSSTAsseignmentCreate";
import TeacherCSSTAssignment from "@/pages/dashboard/teachers/csst/menus/assignments/TeacherCSSTAssignment";
import TeacherCSSTStudentAttendanceList from "@/pages/dashboard/teachers/csst/menus/student-attendances/TeacherCSSTStudentAttendanceList";
import TeacherCSSTMaterialList from "@/pages/dashboard/teachers/csst/menus/materials/TeacherCSSTMaterialList";
import TeacherCSSTBookList from "@/pages/dashboard/teachers/csst/menus/books/TeacherCSSTBookList";
import TeacherCSSTExam from "@/pages/dashboard/teachers/csst/menus/exams/TeacherCSSTExam";
import TeacherCSSTBookDetail from "@/pages/dashboard/teachers/csst/menus/books/TeacherCSSTBookDetail";
import TeacherCSSTManagement from "@/pages/dashboard/teachers/csst/menus/managements/TeacherCSSTManagement";
// import TeacherCSSTDailyReport from "@/pages/dashboard/teachers/csst/menus/daily-progress/TeacherCSSTDailyReport";
import Setting from "@/pages/dashboard/components/page/Setting";
import TeacherCSSTDailyReport from "@/pages/dashboard/teachers/csst/menus/daily-progress/TeacherCSSTDailyReport";

export const TeacherRoutes = (
  <Route path="guru" element={<DashboardLayout />}>
    <Route path="pengaturan" element={<Setting />} />

    {/* Dashboard */}
    <Route path="dashboard" element={<TeacherDashboard />} />

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
        path=":csstId/absensi"
        element={<TeacherCSSTStudentAttendanceList />}
      />
      <Route path=":csstId/murid" element={<TeacherCSSTStudentList />} />
      <Route path=":csstId/murid/:id" element={<TeacherCSSTStudentDetail />} />
      <Route path=":csstId/kehadiran" element={<TeacherCSSTDailyReport />} />
      <Route path=":csstId/kelola-kelas" element={<TeacherCSSTManagement />} />

      {/* Materi, Ujian, Buku */}
      <Route path=":csstId/materi" element={<TeacherCSSTMaterialList />} />
      <Route path=":csstId/ujian" element={<TeacherCSSTExam />} />
      <Route path=":csstId/buku" element={<TeacherCSSTBookList />} />
      <Route path=":csstId/buku/:bookId" element={<TeacherCSSTBookDetail />} />

      {/* Assignments */}
      <Route path=":csstId/tugas" element={<TeacherCSSTAssignment />} />
      <Route
        path=":csstId/tugas/new"
        element={<TeacherCSSTAssessmentCreate />}
      />
      <Route
        path=":csstId/tugas/:assessmentId"
        element={<TeacherCSSTAssessmentDetail />}
      />
      <Route
        path=":csstId/tugas/:assessmentId/:quizId"
        element={<TeacherQuizBuilder />}
      />
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
          element={<TeacherCSSTAssessmentCreate />}
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
