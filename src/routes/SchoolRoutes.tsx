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

    {/* === Profil Sekolah === */}
    <Route path="profil">
      <Route path="profil-sekolah" element={<SchoolProfile />} />
      <Route path="guru">
        <Route index element={<SchoolTeacher />} />
        <Route path=":id" element={<SchoolDetailTeacher />} />
      </Route>
    </Route>

    {/* === Menu utama (akses cepat) === */}
    <Route path="menu-utama">
      <Route index element={<SchoolMenuGrids />} />

      {/* Profil & Keuangan */}
      <Route path="profil-sekolah" element={<SchoolProfile showBack />} />
      <Route path="keuangan" element={<SchoolFinance />} />
      <Route path="keuangan/detail/:id" element={<SchoolDetailBill />} />
      <Route path="spp" element={<SchoolSpp />} />

      {/* Guru */}
      <Route path="guru" element={<SchoolTeacher />} />
      <Route path="guru/:id" element={<SchoolDetailTeacher />} />

      {/* Akademik */}
      <Route path="tahun-akademik" element={<SchoolAcademic />} />
      <Route path="tahun-akademik/detail/:id" element={<SchoolDetailAcademic />} />

      {/* Buku */}
      <Route path="buku" element={<SchoolBooks />} />
      <Route path="buku/detail/:id" element={<SchoolBookDetail />} />

      {/* Ruangan */}
      <Route path="ruangan" element={<SchoolRoom />} />
      <Route path="ruangan/detail/:id" element={<SchoolDetailRoom />} />

      {/* Mata Pelajaran */}
      <Route path="pelajaran" element={<SchoolSubject />} />

      {/* Kelas */}
      <Route path="kelas" element={<SchoolClass />} />
      <Route path="kelas/kelola/:id" element={<SchoolSection />} />
      <Route path="kelas/section/:id" element={<SchoolSectionDetail />} />
      <Route path="kelas/tingkat/:levelId" element={<SchoolParent />} />

      {/* Jadwal */}
      <Route path="jadwal" element={<SchoolSchedule />} />

      {/* Pendaftaran */}
      <Route path="pendaftaran" element={<SchoolRegistrationsPeriod />} />
      <Route path="pendaftaran/murid" element={<SchoolRegistrationsListStudent />} />
      <Route path="pendaftaran/pengaturan" element={<SchoolRegistrationsSetting />} />
    </Route>

    {/* === Global Routes (opsional, jika di luar menu utama) === */}
    <Route path="akademik">
      <Route path="tahun-akademik" element={<SchoolAcademic />} />
      <Route path="tahun-akademik/detail/:id" element={<SchoolDetailAcademic />} />

    </Route>

    <Route path="kelas">
      <Route path="data-kelas" element={<SchoolClass />} />
      <Route path="data-kelas/tingkat/:levelId" element={<SchoolParent />} />
      <Route path="daftar-kelas" element={<SchoolSection />} />
      <Route path="daftar-kelas/section/:id" element={<SchoolSectionDetail />} />
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
  </Route>
);
