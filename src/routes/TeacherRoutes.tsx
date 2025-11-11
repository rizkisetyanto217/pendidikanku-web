// src/routes/TeacherRoutes.tsx
import { Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

// Dashboard & Profil
import TeacherDashboard from "@/pages/dashboard/teachers/TeacherMainDashboard";

// Menu utama guru
import TeacherMenuGrids from "@/pages/dashboard/teachers/menus/TeacherMenuGrids";
import TeacherClass from "@/pages/dashboard/teachers/classes/TeacherClass";
import TeacherSubjects from "@/pages/dashboard/teachers/csst/TeacherCSST";
import TeacherSchedule from "@/pages/dashboard/teachers/schedules/TeacherSchedule";

import TeacherProfil from "@/pages/dashboard/teachers/profiles/TeacherProfil";

import TeacherDetailClass from "@/pages/dashboard/teachers/csst/details/TeacherCSSTDetail";

import TeacherManagementClass from "@/pages/dashboard/teachers/csst/managements/TeacherCSSTManagement";
import TeacherDetailClassQuiz from "@/pages/dashboard/teachers/csst/TeacherDetailClassQuiz";
import TeacherClassStudentsList from "@/pages/dashboard/teachers/csst/menus/student/TeacherCSSTStudentList";
import TeacherClassStudentAttendanceList from "@/pages/dashboard/teachers/csst/menus/attendances/TeacherCSSTStudentAttendanceList";
import TeacherMaterialList from "@/pages/dashboard/teachers/csst/menus/material/TeacherCSSTMaterialList";
import TeacherExamList from "@/pages/dashboard/teachers/csst/menus/exams/TeacherCSSTExamList";
import TeacherBookList from "@/pages/dashboard/teachers/csst/menus/books/TeacherCSSTBookList";
import TeacherDetailClassStudent from "@/pages/dashboard/teachers/csst/menus/student/TeacherCSSTDetailStudent";
import TeacherDetailBook from "@/pages/dashboard/teachers/csst/menus/books/TeacherCSSTDetailBook";
import TeacherClassAttendance from "@/pages/dashboard/teachers/csst/menus/attendances/TeacherCSSTStudentAttandence";
import TeacherAssignment from "@/pages/dashboard/teachers/csst/menus/assignments/TeacherCSSTAssignment";
import TeacherDetailAssignement from "@/pages/dashboard/teachers/csst/menus/assignments/TeacherCSSTDetailAssignment";
import TeacherClassDetail from "@/pages/dashboard/teachers/classes/Details/TeacherClassDetail";
import TeacherScheduleRoutine from "@/pages/dashboard/teachers/schedules/TeacherScheduleRoutine";

export const TeacherRoutes = (
  <Route path="guru" element={<DashboardLayout />}>
    {/* Dashboard */}
    <Route path="dashboard" element={<TeacherDashboard />} />

    {/* Menu Utama Guru */}
    <Route path="menu-utama">
      <Route index element={<TeacherMenuGrids />} />
      <Route path="kelas">
        <Route index element={<TeacherClass />} />
        <Route path=":id" element={<TeacherDetailClass />} />
      </Route>
      <Route path="guru-mapel">
        <Route index element={<TeacherSubjects />} />
      </Route>
      <Route path="jadwal" element={<TeacherSchedule />} />
      <Route path="profil-guru" element={<TeacherProfil />} />
      {/* <Route path="pengaturan" element={<TeacherSettings />} /> */}
      <Route path="tugas" element={<TeacherAssignment />} />
      {/* <Route path="sertifikat" element={<TeacherCertificate />} /> */}
      <Route path="kehadiran" element={<TeacherClassAttendance />} />
      <Route path="quizClass/detail" element={<TeacherDetailClassQuiz />} />
    </Route>
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
      <Route path=":id" element={<TeacherClassDetail />} />
    </Route>

    <Route path="kelola-kelas/:name" element={<TeacherManagementClass />} />
    <Route path="quizClass/detail" element={<TeacherDetailClassQuiz />} />

    {/* Guru Mapel */}
    <Route path="guru-mapel">
      <Route index element={<TeacherSubjects />} />
      <Route path=":id" element={<TeacherDetailClass />} />
      <Route path=":id/absensi-hari-ini" element={<TeacherClassAttendance />} />
      <Route path=":id/quiz" element={<TeacherDetailClassQuiz />} />
      <Route path=":id/murid" element={<TeacherClassStudentsList />} />
      <Route path=":id/murid/:id" element={<TeacherDetailClassStudent />} />
      <Route path=":id/tugas" element={<TeacherAssignment />} />
      <Route path=":id/tugas/detail" element={<TeacherDetailAssignement />} />
      <Route
        path=":id/semua-kehadiran"
        element={<TeacherClassStudentAttendanceList />}
      />
      <Route path=":id/materi" element={<TeacherMaterialList />} />
      <Route path=":id/ujian" element={<TeacherExamList />} />
      <Route path=":id/buku" element={<TeacherBookList />} />
      <Route path=":id/buku/:bookId" element={<TeacherDetailBook />} />
    </Route>

    {/* Jadwal */}
    <Route path="jadwal" element={<TeacherSchedule />} />
    <Route path="jadwal-rutin" element={<TeacherScheduleRoutine />} />
  </Route>
);