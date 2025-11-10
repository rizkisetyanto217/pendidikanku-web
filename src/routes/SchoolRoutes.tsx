import { Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

// Pages
import SchoolDashboard from "@/pages/dashboard/schools/SchoolMainDashboard";
import SchoolProfile from "@/pages/dashboard/schools/profiles/schools/SchoolProfile";
import SchoolFinance from "@/pages/dashboard/schools/finances/SchoolFinance";
import SchoolDetailBill from "@/pages/dashboard/schools/finances/SchoolDetailBill";
import SchoolSpp from "@/pages/dashboard/schools/finances/SchoolSpp";
import SchoolTeacher from "@/pages/dashboard/schools/profiles/teachers/SchoolTeacher";
import SchoolDetailTeacher from "@/pages/dashboard/schools/profiles/teachers/details/SchoolDetailTeacher";
import SchoolMenuGrids from "@/pages/dashboard/schools/menus/SchoolMenuGrids";
import SchoolClass from "@/pages/dashboard/schools/classes/data-class/SchoolClass";
import SchoolSection from "@/pages/dashboard/schools/classes/class-list/section/SchoolSection";
import SchoolSectionDetail from "@/pages/dashboard/schools/classes/class-list/section/SchoolSectionDetail";
import SchoolParent from "@/pages/dashboard/schools/classes/data-class/parent/SchoolParent";

import SchoolAcademic from "@/pages/dashboard/schools/academics/SchoolAcademic";
import SchoolDetailAcademic from "@/pages/dashboard/schools/academics/SchoolDetailAcademic";
import SchoolManagementAcademicDetail from "@/pages/dashboard/schools/academics/SchoolManagementAcademic";
import SchoolBooks from "@/pages/dashboard/schools/academics/books/SchoolBooks";
import SchoolRoom from "@/pages/dashboard/schools/academics/rooms/SchoolRoom";
import SchoolSubject from "@/pages/dashboard/schools/academics/subjects/SchoolSubject";
import SchoolDetailRoom from "@/pages/dashboard/schools/academics/rooms/SchoolDetailRoom";
import SchoolBookDetail from "@/pages/dashboard/schools/academics/books/detail/SchoolDetailBook";

import SchoolSchedule from "@/pages/dashboard/schools/schedules/SchoolSchedule";
import SchoolRegistrationsPeriod from "@/pages/dashboard/schools/registrations/SchoolRegistrationsPeriod";
import SchoolRegistrationsListStudent from "@/pages/dashboard/schools/registrations/SchoolRegistrationsListStudent";
import SchoolRegistrationsSetting from "@/pages/dashboard/schools/registrations/SchoolRegistrationsSetting";

export const SchoolRoutes = (
  <Route path="sekolah" element={<DashboardLayout />}>
    {/* === Dashboard Utama === */}
    <Route path="dashboard" element={<SchoolDashboard />} />

    {/* === Jadwal === */}
    <Route path="jadwal" element={<SchoolSchedule />} />
    {/* <Route
      path="jadwal/detail/:scheduleId"
      element={<SchoolDetailSchedule />}
    /> */}

    {/* === Profil Sekolah === */}

    {/* === Guru === */}
    <Route path="profil">
      <Route path="profil-sekolah" element={<SchoolProfile />} />
      <Route path="guru">
        <Route index element={<SchoolTeacher />} />
        <Route path=":id" element={<SchoolDetailTeacher />} />
      </Route>
    </Route>

    <Route path="menu" element={<SchoolMenuGrids />} />

    {/* === Akademik === */}
    <Route path="akademik">
      <Route path="tahun-akademik">
        <Route index element={<SchoolAcademic />} />
        <Route path="detail/:id" element={<SchoolDetailAcademic />} />
        <Route path="kelola" element={<SchoolManagementAcademicDetail />} />
      </Route>
      {/* === Buku === */}
      <Route path="buku">
        <Route index element={<SchoolBooks />} />
        <Route path="detail/:id" element={<SchoolBookDetail />} />
      </Route>
      <Route path="ruangan">
        <Route index element={<SchoolRoom />} />
        <Route path="detail/:id" element={<SchoolDetailRoom />} />
      </Route>
      <Route path="mata-pelajaran">
        <Route index element={<SchoolSubject />} />
      </Route>
    </Route>

    {/* === Guru === */}
    <Route path="kelas">
      <Route path="data-kelas">
        <Route index element={<SchoolClass />} />
        <Route path="tingkat/:levelId" element={<SchoolParent />} />
      </Route>
      <Route path="daftar-kelas">
        <Route index element={<SchoolSection />} />
        <Route path="section/:id" element={<SchoolSectionDetail />} />
      </Route>
    </Route>


    {/* === Keuangan === */}
    <Route path="keuangan">
      <Route path="spp" element={<SchoolSpp />} />
      <Route path="lainnya" element={<SchoolFinance />}>
        <Route path=":id" element={<SchoolDetailBill />} />
      </Route>
      {/* Masih kurang pengaturan  */}
    </Route>

    <Route path="pendaftaran">
      <Route index element={<SchoolRegistrationsPeriod />} />
      <Route path="murid" element={<SchoolRegistrationsListStudent />} />
      <Route path="pengaturan" element={<SchoolRegistrationsSetting />} />
    </Route>

    {/* === MENU UTAMA === */}
    <Route path="menu-utama">
      <Route index element={<SchoolMenuGrids />} />
      <Route path="profil-sekolah" element={<SchoolProfile showBack />} />
      <Route path="keuangan" element={<SchoolFinance />} />
      <Route path="keuangan/detail/:id" element={<SchoolDetailBill />} />
      <Route path="guru" element={<SchoolTeacher />} />
      {/* <Route path="all-announcement" element={<AllAnnouncement />} /> */}
      <Route path="sekolah" element={<SchoolDashboard showBack />} />
      <Route path="ruangan" element={<SchoolRoom />} />
      <Route path="ruangan/:id" element={<SchoolDetailRoom />} />
      <Route path="spp" element={<SchoolSpp />} />
      <Route path="pelajaran" element={<SchoolSubject />} />
      {/* <Route path="statistik" element={<SchoolStatistik />} /> */}
      <Route path="jadwal" element={<SchoolSchedule />} />

      <Route path="buku">
        <Route index element={<SchoolBooks />} />
        <Route path="detail/:id" element={<SchoolBookDetail />} />
      </Route>

      <Route path="kelas">
        <Route index element={<SchoolClass />} />
        <Route path="kelola/:id" element={<SchoolSection />} />
        <Route path="section/:id" element={<SchoolSectionDetail />} />
        <Route path="tingkat/:levelId" element={<SchoolParent />} />
        <Route path="kelas/:classId" element={<SchoolClass />} />
      </Route>

      <Route path="pendaftaran">
        <Route index element={<SchoolRegistrationsPeriod />} />
        <Route path="murid" element={<SchoolRegistrationsListStudent />} />
        <Route path="pengaturan" element={<SchoolRegistrationsSetting />} />
      </Route>
    </Route>
  </Route>
);