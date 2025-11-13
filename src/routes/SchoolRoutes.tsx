import { Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";

// Pages
import SchoolDashboard from "@/pages/dashboard/schools/SchoolMainDashboard";
import SchoolProfile from "@/pages/dashboard/schools/profiles/schools/SchoolProfile";
import SchoolFinance from "@/pages/dashboard/schools/finances/others/SchoolFinance";
import SchoolDetailBill from "@/pages/dashboard/schools/finances/others/SchoolDetailBill";
import SchoolSpp from "@/pages/dashboard/schools/finances/Spp/SchoolFinanceSpp";
import SchoolTeacher from "@/pages/dashboard/schools/profiles/teachers/SchoolTeacher";
import SchoolDetailTeacher from "@/pages/dashboard/schools/profiles/teachers/details/SchoolDetailTeacher";
import SchoolMenuGrids from "@/pages/dashboard/schools/menus/SchoolMenuGrids";

import SchoolSectionDetail from "@/pages/dashboard/schools/classes/class-sections/section/SchoolClassesSectionDetail";

import SchoolAcademic from "@/pages/dashboard/schools/academics/academics/SchoolAcademic";
import SchoolDetailAcademic from "@/pages/dashboard/schools/academics/academics/SchoolAcademicDetail";

import SchoolBooks from "@/pages/dashboard/schools/academics/books/SchoolBooks";
import SchoolRoom from "@/pages/dashboard/schools/academics/rooms/SchoolRoom";
import SchoolSubject from "@/pages/dashboard/schools/academics/subjects/SchoolSubject";
import SchoolDetailRoom from "@/pages/dashboard/schools/academics/rooms/SchoolRoomDetail";
import SchoolBookDetail from "@/pages/dashboard/schools/academics/books/detail/SchoolBookDetail";

import SchoolSchedule from "@/pages/dashboard/schools/schedules/agendas/SchoolScheduleAgenda";
import SchoolRegistrationsPeriod from "@/pages/dashboard/schools/registrations/SchoolRegistrationsPeriod";
import SchoolRegistrationsListStudent from "@/pages/dashboard/schools/registrations/SchoolRegistrationsStudent";
import SchoolRegistrationsSetting from "@/pages/dashboard/schools/registrations/SchoolRegistrationsSetting";
import SchoolScheduleAgenda from "@/pages/dashboard/schools/schedules/agendas/SchoolScheduleAgenda";
import SchoolScheduleRoutine from "@/pages/dashboard/schools/schedules/routines/SchoolScheduleRoutine";
import SchoolSubjectDetail from "@/pages/dashboard/schools/academics/subjects/SchoolSubjectDetail";
import SchoolAcademicManage from "@/pages/dashboard/schools/academics/academics/SchoolAcademicManage";
import SchoolCampaign from "@/pages/dashboard/schools/campaign/SchoolCampaign";
import SchoolClassParent from "@/pages/dashboard/schools/classes/class-parents/SchoolClassParent";
import SchoolClass from "@/pages/dashboard/schools/classes/classes/SchoolClass";
import SchoolClassesSection from "@/pages/dashboard/schools/classes/class-sections/SchoolClassSections";
import SchoolCSST from "@/pages/dashboard/schools/classes/class-section-subject-teachers/SchoolCSST";
import SchoolCampaignDetail from "@/pages/dashboard/schools/campaign/SchoolCampaignDetail";

export const SchoolRoutes = (
  <Route path="sekolah" element={<DashboardLayout />}>
    {/* === Dashboard Utama === */}
    <Route path="dashboard" element={<SchoolDashboard />} />

    {/* === Jadwal === */}
    <Route path="jadwal" element={<SchoolSchedule />} />

    {/* === Profil Sekolah === */}
    <Route path="profil">
      <Route path="profil-sekolah" element={<SchoolProfile />} />
      <Route path="guru">
        <Route index element={<SchoolTeacher />} />
        <Route path=":id" element={<SchoolDetailTeacher />} />
      </Route>
    </Route>

    {/* === Global Routes (opsional, jika di luar menu utama) === */}
    <Route path="akademik">
      <Route path="tahun-akademik" element={<SchoolAcademic />} />
      <Route path="tahun-akademik/:id" element={<SchoolDetailAcademic />} />
      <Route path="tahun-akademik/manage" element={<SchoolAcademicManage />} />
      <Route path="ruangan" element={<SchoolRoom />} />
      <Route path="ruangan/:id" element={<SchoolDetailRoom />} />
      <Route path="buku" element={<SchoolBooks />} />
      <Route path="mata-pelajaran" element={<SchoolSubject />} />
      <Route path="mata-pelajaran/:id" element={<SchoolSubjectDetail />} />
    </Route>

    <Route path="kelas">
      <Route
        path="daftar-kelas/section/:id"
        element={<SchoolSectionDetail />}
      />
      <Route path="level" element={<SchoolClassParent />} />
      <Route path="daftar-kelas" element={<SchoolClass />} />
      <Route path="semua-kelas" element={<SchoolClassesSection />} />
      <Route path="pelajaran" element={<SchoolCSST />} />
    </Route>

    <Route path="keuangan">
      <Route path="spp" element={<SchoolSpp />} />
      <Route path="lainnya" element={<SchoolFinance />} />
      <Route path="lainnya/:id" element={<SchoolDetailBill />} />
    </Route>

    <Route path="pendaftaran">
      <Route index element={<SchoolRegistrationsPeriod />} />
      <Route path="murid" element={<SchoolRegistrationsListStudent />} />
      <Route path="pengaturan" element={<SchoolRegistrationsSetting />} />
    </Route>

    {/* === Jadwal Sekolah === */}
    <Route path="jadwal">
      <Route path="agenda" element={<SchoolScheduleAgenda />} />
      <Route path="rutin" element={<SchoolScheduleRoutine />} />
    </Route>

    {/* === Campaign Sekolah === */}
    <Route path="dukungan">
      <Route path="donasi" element={<SchoolCampaign />} />
      <Route path="donasi/detail" element={<SchoolCampaignDetail />} />
    </Route>

    {/* === Menu utama (akses cepat) === */}
    <Route path="menu-utama">
      <Route index element={<SchoolMenuGrids />} />

      {/* === Profil Sekolah === */}
      <Route path="profil">
        <Route path="profil-sekolah" element={<SchoolProfile showBack />} />
        <Route path="guru">
          <Route index element={<SchoolTeacher showBack />} />
          <Route path=":id" element={<SchoolDetailTeacher />} />
        </Route>
      </Route>

      {/* Guru */}
      <Route path="guru" element={<SchoolTeacher />} />
      <Route path="guru/:id" element={<SchoolDetailTeacher />} />

      {/* Akademik */}
      <Route path="tahun-akademik" element={<SchoolAcademic showBack />} />
      <Route
        path="tahun-akademik/detail/:id"
        element={<SchoolDetailAcademic />}
      />

      {/* Buku */}
      <Route path="buku" element={<SchoolBooks />} />
      <Route path="buku/:id" element={<SchoolBookDetail />} />

      {/* Ruangan */}
      <Route path="ruangan" element={<SchoolRoom />} />
      <Route path="ruangan/:id" element={<SchoolDetailRoom />} />

      {/* Mata Pelajaran */}
      <Route path="pelajaran" element={<SchoolSubject />} />

      {/* Kelas */}
      <Route path="kelas" element={<SchoolClass showBack />} />
      <Route path="kelas/section/:id" element={<SchoolSectionDetail />} />
      {/* Jadwal */}
      <Route path="jadwal" element={<SchoolSchedule />} />

      {/* Pendaftaran */}
      <Route path="pendaftaran" element={<SchoolRegistrationsPeriod />} />
      <Route
        path="pendaftaran/murid"
        element={<SchoolRegistrationsListStudent />}
      />
      <Route
        path="pendaftaran/pengaturan"
        element={<SchoolRegistrationsSetting />}
      />
    </Route>
  </Route>
);
