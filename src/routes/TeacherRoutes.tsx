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
      <Route index element={<TeacherCSST />} />

      <Route path=":csstId">
        <Route index element={<TeacherCSSTDetail />} />

        {/* Murid */}
        <Route path="murid" element={<TeacherCSSTStudentList />} />
        <Route path="murid/:id" element={<TeacherCSSTStudentDetail />} />

        {/* Daily progress */}
        <Route path="daily-progress" element={<TeacherCSSTDailyReport />} />
        <Route
          path="daily-progress/:id"
          element={<TeacherCSSTDailyReportDetail />}
        />

        {/* Absensi */}
        <Route path="absensi" element={<TeacherCSSTStudentAttendanceList />} />
        <Route
          path="absensi/:id"
          element={<TeacherCSSTStudentAttendanceDetail />}
        />

        {/* Ujian */}
        <Route path="ujian" element={<TeacherCSSTExam />} />

        {/* Materi */}
        <Route path="materi" element={<TeacherCSSTMaterialList />} />
        <Route path="materi/new" element={<TeacherCSSTMaterialForm />} />
        <Route
          path="materi/edit/:materialId"
          element={<TeacherCSSTMaterialForm />}
        />

        {/* Buku */}
        <Route path="buku" element={<TeacherCSSTBookList />} />
        <Route path="buku/new" element={<TeacherCSSTBookForm />} />
        <Route path="buku/:bookId" element={<TeacherCSSTBookDetail />} />
        <Route path="buku/edit/:bookId" element={<TeacherCSSTBookForm />} />

        {/* Tugas */}
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

        {/* Kelola */}
        <Route path="kelola-kelas" element={<TeacherCSSTManagement />} />
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

    {/* Menu Utama*/}
    <Route path="menu-utama">
      <Route index element={<TeacherMenuGrids />} />

      {/* Wali Kelas */}
      <Route path="wali-kelas">
        <Route index element={<TeacherClass showBack />} />
        <Route path=":classSectionId" element={<TeacherClassDetail />} />
      </Route>

      {/* Guru Mapel / CSST */}
      <Route path="guru-mapel">
        <Route index element={<TeacherCSST showBack />} />

        <Route path=":csstId">
          <Route index element={<TeacherCSSTDetail />} />

          {/* Murid */}
          <Route path="murid" element={<TeacherCSSTStudentList />} />
          <Route path="murid/:id" element={<TeacherCSSTStudentDetail />} />

          {/* Daily progress */}
          <Route path="daily-progress" element={<TeacherCSSTDailyReport />} />
          <Route
            path="daily-progress/:id"
            element={<TeacherCSSTDailyReportDetail />}
          />

          {/* Absensi */}
          <Route path="absensi" element={<TeacherCSSTStudentAttendanceList />} />
          <Route
            path="absensi/:id"
            element={<TeacherCSSTStudentAttendanceDetail />}
          />

          {/* Ujian */}
          <Route path="ujian" element={<TeacherCSSTExam />} />

          {/* Materi */}
          <Route path="materi" element={<TeacherCSSTMaterialList />} />
          <Route path="materi/new" element={<TeacherCSSTMaterialForm />} />
          <Route
            path="materi/edit/:materialId"
            element={<TeacherCSSTMaterialForm />}
          />

          {/* Buku */}
          <Route path="buku" element={<TeacherCSSTBookList />} />
          <Route path="buku/new" element={<TeacherCSSTBookForm />} />
          <Route path="buku/:bookId" element={<TeacherCSSTBookDetail />} />
          <Route path="buku/edit/:bookId" element={<TeacherCSSTBookForm />} />

          {/* Tugas */}
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

          {/* Kelola */}
          <Route path="kelola-kelas" element={<TeacherCSSTManagement />} />
        </Route>
      </Route>

      {/* Jadwal */}
      <Route path="agenda" element={<TeacherScheduleAgenda showBack />} />
      <Route path="agenda/:id" element={<TeacherScheduleAgendaDetail />} />
      <Route path="rutin" element={<TeacherScheduleRoutine showBack />} />
      <Route path="rutin/:routineId" element={<TeacherScheduleRoutineDetail />} />

      {/* Profil */}
      <Route path="profil-guru" element={<TeacherProfil showBack />} />
    </Route>

  </Route>
);
