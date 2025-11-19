// src/routes/TeacherRoutes.tsx
import { Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

// Dashboard & Profil
import TeacherDashboard from "@/pages/dashboard/teachers/TeacherMainDashboard";

// Menu utama guru
import TeacherMenuGrids from "@/pages/dashboard/teachers/menus/TeacherMenuGrids";
import TeacherClass from "@/pages/dashboard/teachers/classes/TeacherClassFromSections";
import TeacherSubjects from "@/pages/dashboard/teachers/csst/TeacherCSST";
import TeacherSchedule from "@/pages/dashboard/teachers/schedules/agendas/TeacherScheduleAgenda";

import TeacherProfil from "@/pages/dashboard/teachers/profiles/TeacherProfil";

import TeacherDetailClass from "@/pages/dashboard/teachers/csst/details/TeacherCSSTDetail";

import TeacherManagementClass from "@/pages/dashboard/teachers/csst/managements/TeacherCSSTManagement";
import TeacherDetailClassQuiz from "@/pages/dashboard/teachers/csst/TeacherDetailClassQuiz";
import TeacherClassStudentsList from "@/pages/dashboard/teachers/csst/menus/student/TeacherCSSTStudentList";
import TeacherClassStudentAttendanceList from "@/pages/dashboard/teachers/csst/menus/attendances/TeacherCSSTStudentAttendanceList";
import TeacherMaterialList from "@/pages/dashboard/teachers/csst/menus/material/TeacherCSSTMaterialList";
import TeacherExamList from "@/pages/dashboard/teachers/csst/menus/exams/TeacherCSSTExamList";
import TeacherBookList from "@/pages/dashboard/teachers/csst/menus/books/TeacherCSSTBookList";
import TeacherDetailClassStudent from "@/pages/dashboard/teachers/csst/menus/student/TeacherCSSTStudentDetail";
import TeacherDetailBook from "@/pages/dashboard/teachers/csst/menus/books/TeacherCSSTBookDetail";
import TeacherClassAttendance from "@/pages/dashboard/teachers/csst/menus/attendances/TeacherCSSTStudentAttandence";
import TeacherAssignment from "@/pages/dashboard/teachers/csst/menus/assignments/TeacherCSSTAssignment";

import TeacherClassDetail from "@/pages/dashboard/teachers/classes/Details/TeacherClassesDetail";
import TeacherScheduleRoutine from "@/pages/dashboard/teachers/schedules/routines/TeacherScheduleRoutine";
import TeacherScheduleAgenda from "@/pages/dashboard/teachers/schedules/agendas/TeacherScheduleAgenda";
import TeacherQuizBuilder from "@/pages/dashboard/teachers/quiz/TeacherQuizBuilder";
import TeacherScheduleRoutineDetail from "@/pages/dashboard/teachers/schedules/routines/details/TeacherScheduleRoutineDetail";
import TeacherScheduleAgendaDetail from "@/pages/dashboard/teachers/schedules/agendas/details/TeacherScheduleAgendaDetail";
import TeacherCSSTAssessmentDetail from "@/pages/dashboard/teachers/csst/menus/assignments/details/TeacherCSSTAssessmentDetail";
import QuizBuilder from "@/pages/dashboard/teachers/quiz/TeacherQuizBuilder";
import TeacherCSSTAssessmentCreate from "@/pages/dashboard/teachers/csst/menus/assignments/details/TeacherCSSTAssessmentCreate";
import TeacherCSSTDetail from "@/pages/dashboard/teachers/classes/Details/TeacherClassesDetail";

export const TeacherRoutes = (
  <Route path="guru" element={<DashboardLayout />}>
    {/* Dashboard */}
    <Route path="dashboard" element={<TeacherDashboard />} />

    <Route path="kelas">
      <Route index element={<TeacherClass />} />
      {/* <Route path=":id" element={<TeacherDetailClass />} /> */}
      <Route path="guru-mapel">
        <Route index element={<TeacherSubjects />} />
      </Route>
      <Route path="jadwal" element={<TeacherSchedule />} />
    </Route>

    {/* Profil & Penilaian */}
    <Route path="profil-guru" element={<TeacherProfil />} />

    {/* Wali Kelas */}
    <Route path="wali-kelas">
      <Route index element={<TeacherClass />} />
      <Route path=":classSectionId" element={<TeacherClassDetail />} />
    </Route>

    <Route path="kelola-kelas/:name" element={<TeacherManagementClass />} />
    <Route path="quizClass/detail" element={<TeacherDetailClassQuiz />} />

    {/* Guru Mapel */}
    <Route path="guru-mapel">
      <Route index element={<TeacherSubjects />} />

      {/* Detail 1 mapel (CSST) */}
      <Route path=":csstId" element={<TeacherCSSTDetail />} />

      {/* Turunan dari CSST yang sama */}
      <Route
        path=":csstId/absensi-hari-ini"
        element={<TeacherClassAttendance />}
      />
      <Route path=":csstId/quiz" element={<TeacherDetailClassQuiz />} />
      <Route path=":csstId/murid" element={<TeacherClassStudentsList />} />
      <Route path=":csstId/murid/:id" element={<TeacherDetailClassStudent />} />
      <Route path=":csstId/tugas" element={<TeacherAssignment />} />
      <Route
        path=":csstId/tugas/:assessmentId"
        element={<TeacherCSSTAssessmentDetail />}
      />
      <Route
        path=":csstId/tugas/:assessmentId/:quizId"
        element={<QuizBuilder />}
      />
      <Route path=":csstId/tugas/new" element={<TeacherCSSTAssessmentCreate />} />

      <Route
        path=":csstId/semua-kehadiran"
        element={<TeacherClassStudentAttendanceList />}
      />
      <Route path=":csstId/materi" element={<TeacherMaterialList />} />
      <Route path=":csstId/ujian" element={<TeacherExamList />} />
      <Route path=":csstId/buku" element={<TeacherBookList />} />
      <Route path=":csstId/buku/:bookId" element={<TeacherDetailBook />} />
    </Route>

    {/* === Jadwal Sekolah === */}
    <Route path="jadwal">
      <Route path="agenda" element={<TeacherScheduleAgenda />} />
      <Route path="agenda/:id" element={<TeacherScheduleAgendaDetail />} />
      <Route path="rutin" element={<TeacherScheduleRoutine />} />
      <Route
        path="rutin/:routineId"
        element={<TeacherScheduleRoutineDetail />}
      />
    </Route>

    {/* Menu Utama Guru */}
    <Route path="menu-utama">
      <Route index element={<TeacherMenuGrids />} />
      <Route path="wali-kelas">
        <Route index element={<TeacherClass showBack />} />
        <Route path=":id" element={<TeacherDetailClass />} />
      </Route>
      <Route path="guru-mapel">
        <Route index element={<TeacherSubjects showBack />} />
      </Route>
      <Route path="agenda" element={<TeacherScheduleAgenda showBack />} />
      <Route path="agenda/:id" element={<TeacherScheduleAgendaDetail />} />
      <Route path="rutin" element={<TeacherScheduleRoutine showBack />} />
      <Route path="rutin/:routineId" element={<TeacherScheduleRoutineDetail />} />
      <Route path="profil-guru" element={<TeacherProfil />} />
      {/* <Route path="pengaturan" element={<TeacherSettings />} /> */}
      <Route path="tugas" element={<TeacherAssignment />} />
      {/* <Route path="sertifikat" element={<TeacherCertificate />} /> */}
      <Route path="kehadiran" element={<TeacherClassAttendance />} />
      <Route path="quizClass/detail" element={<TeacherDetailClassQuiz />} />
    </Route>

    <Route path="quiz" element={<TeacherQuizBuilder />} />
  </Route>
);