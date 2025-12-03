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

import SchoolSectionDetail from "@/pages/dashboard/schools/classes/class-sections/details/SchoolClassSectionDetail";

import SchoolAcademic from "@/pages/dashboard/schools/academics/academics/SchoolAcademic";
import SchoolDetailAcademic from "@/pages/dashboard/schools/academics/academics/details/SchoolAcademicDetail";

import SchoolBooks from "@/pages/dashboard/schools/academics/books/SchoolBooks";
import SchoolRoom from "@/pages/dashboard/schools/academics/rooms/SchoolRoom";
import SchoolSubject from "@/pages/dashboard/schools/academics/subjects/SchoolSubject";
import SchoolDetailRoom from "@/pages/dashboard/schools/academics/rooms/details/SchoolRoomDetail";
import SchoolBookDetail from "@/pages/dashboard/schools/academics/books/details/SchoolBookDetail";

import SchoolSchedule from "@/pages/dashboard/schools/schedules/agendas/SchoolScheduleAgenda";
import SchoolRegistrationsPeriod from "@/pages/dashboard/schools/registrations/SchoolRegistrationsPeriod";
import SchoolRegistrationsListStudent from "@/pages/dashboard/schools/registrations/student-list/SchoolRegistrationsStudent";
import SchoolRegistrationsSetting from "@/pages/dashboard/schools/registrations/SchoolRegistrationsSetting";
import SchoolScheduleAgenda from "@/pages/dashboard/schools/schedules/agendas/SchoolScheduleAgenda";
import SchoolScheduleRoutine from "@/pages/dashboard/schools/schedules/routines/SchoolScheduleRoutine";
import SchoolSubjectDetail from "@/pages/dashboard/schools/academics/subjects/details/SchoolSubjectDetail";
import SchoolCampaign from "@/pages/dashboard/schools/campaign/SchoolCampaign";
import SchoolClassParent from "@/pages/dashboard/schools/classes/class-parents/SchoolClassParent";
import SchoolClass from "@/pages/dashboard/schools/classes/classes/SchoolClass";
import SchoolClassesSection from "@/pages/dashboard/schools/classes/class-sections/SchoolClassSections";
import SchoolCSST from "@/pages/dashboard/schools/classes/class-section-subject-teachers/SchoolCSST";
import SchoolCampaignDetail from "@/pages/dashboard/schools/campaign/SchoolCampaignDetail";
import Setting from "@/pages/dashboard/components/page/Setting";
import Help from "@/pages/dashboard/components/page/Help";
import SchoolClassParentDetail from "@/pages/dashboard/schools/classes/class-parents/details/SchoolClassParentDetail";
import SchoolClassDetail from "@/pages/dashboard/schools/classes/classes/details/SchoolClassDetail";
import SchoolClassSectionDetail from "@/pages/dashboard/schools/classes/class-sections/details/SchoolClassSectionDetail";
import SchoolCSSTDetail from "@/pages/dashboard/schools/classes/class-section-subject-teachers/details/SchoolCSSTDetail";
import SchoolAcademicTermForm from "@/pages/dashboard/schools/academics/academics/details/SchoolAcademicForms";
import SchoolBookForm from "@/pages/dashboard/schools/academics/books/details/SchoolBookForm";
import SchoolRoomForm from "@/pages/dashboard/schools/academics/rooms/details/SchoolRoomForm";
import SchoolSubjectForm from "@/pages/dashboard/schools/academics/subjects/details/SchoolSubjectForm";
import SchoolClassParentForm from "@/pages/dashboard/schools/classes/class-parents/details/SchoolClassParentForm";
import SchoolCSSTForm from "@/pages/dashboard/schools/classes/class-section-subject-teachers/details/SchoolCSSTForm";
import SchoolClassForm from "@/pages/dashboard/schools/classes/classes/details/SchoolClassForm";
import SchoolClassSectionForm from "@/pages/dashboard/schools/classes/class-sections/details/SchoolClassSectionForm";
import SchoolClassStudentList from "@/pages/dashboard/schools/classes/classes/student-list/SchoolClassStudentList";
import SchoolRegistrationPaymentDetail from "@/pages/dashboard/schools/registrations/student-list/SchoolRegistrationsStudentDetail";
import SchoolClassSection from "@/pages/dashboard/schools/classes/class-sections/SchoolClassSections";

export const SchoolRoutes = (
  <Route path="sekolah" element={<DashboardLayout />}>
    {/* === Dashboard Utama === */}
    <Route path="dashboard" element={<SchoolDashboard />} />
    <Route path="pengaturan" element={<Setting />} />
    <Route path="bantuan" element={<Help />} />

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

    {/* === Akademik === */}
    <Route path="akademik">
      <Route index path="tahun-akademik" element={<SchoolAcademic />} />
      <Route path="tahun-akademik/:id" element={<SchoolDetailAcademic />} />
      <Route path="tahun-akademik/new" element={<SchoolAcademicTermForm />} />
      <Route path="tahun-akademik/edit/:id" element={<SchoolAcademicTermForm />} />

      {/* === Ruangan === */}
      <Route path="ruangan" element={<SchoolRoom />} />
      <Route path="ruangan/:id" element={<SchoolDetailRoom />} />
      <Route path="ruangan/new" element={<SchoolRoomForm />} />
      <Route path="ruangan/edit/:id" element={<SchoolRoomForm />} />

      {/* === Buku === */}
      <Route path="buku" element={<SchoolBooks />} />
      <Route path="buku/:id" element={<SchoolBookDetail />} />
      <Route path="buku/new" element={<SchoolBookForm />} />
      <Route path="buku/edit/:id" element={<SchoolBookForm />} />

      {/* === Mata Pelajaran === */}
      <Route path="mata-pelajaran" element={<SchoolSubject />} />
      <Route path="mata-pelajaran/:id" element={<SchoolSubjectDetail />} />
      <Route path="mata-pelajaran/new" element={<SchoolSubjectForm />} />
      <Route path="mata-pelajaran/edit/:id" element={<SchoolSubjectForm />} />
    </Route>

    <Route path="kelas">
      {/* LEVEL (Class Parent) */}
      <Route path="level">
        <Route index element={<SchoolClassParent />} />
        <Route path="new" element={<SchoolClassParentForm />} />
        <Route path="edit/:classParentId" element={<SchoolClassParentForm />} />

        <Route path=":classParentId" element={<SchoolClassParentDetail />} />
      </Route>

      {/* DAFTAR KELAS (Class) */}
      <Route path="daftar-kelas">
        {/* /kelas/daftar-kelas */}
        <Route index element={<SchoolClass />} />
        <Route path="new" element={<SchoolClassForm />} />
        <Route path="edit/:classId" element={<SchoolClassForm />} />
        <Route path=":classId" element={<SchoolClassDetail />} />
        <Route path=":classId/murid" element={<SchoolClassStudentList />} />
        <Route path="section/:id" element={<SchoolSectionDetail />} />
      </Route>

      {/* SEMUA KELAS (Class Sections) */}
      <Route path="semua-kelas">
        {/* /kelas/semua-kelas */}
        <Route index element={<SchoolClassesSection />} />

        {/* /kelas/semua-kelas/new */}
        <Route path="new" element={<SchoolClassSectionForm />} />

        {/* /kelas/semua-kelas/edit/:classSectionId */}
        <Route
          path="edit/:classSectionId"
          element={<SchoolClassSectionDetail />}
        // kalau maksudnya form:
        // element={<SchoolClassSectionForm />}
        />

        {/* /kelas/semua-kelas/:classSectionId */}
        <Route path=":classSectionId" element={<SchoolClassSectionDetail />} />
      </Route>

      {/* PELAJARAN (CSST) */}
      <Route path="pelajaran">
        {/* /kelas/pelajaran */}
        <Route index element={<SchoolCSST />} />

        {/* /kelas/pelajaran/new */}
        <Route path="new" element={<SchoolCSSTForm />} />

        {/* /kelas/pelajaran/:csstId */}
        <Route path=":csstId" element={<SchoolCSSTDetail />} />

        {/* /kelas/pelajaran/:csstId/edit */}
        <Route path=":csstId/edit" element={<SchoolCSSTForm />} />
      </Route>
    </Route>

    <Route path="keuangan">
      <Route path="spp" element={<SchoolSpp />} />
      <Route path="non-spp" element={<SchoolFinance />} />
      <Route path="non-spp/:id" element={<SchoolDetailBill />} />
    </Route>

    <Route path="pendaftaran">
      <Route index element={<SchoolRegistrationsPeriod />} />

      <Route path="murid">
        <Route index element={<SchoolRegistrationsListStudent />} />
        <Route
          path="pembayaran"
          element={<SchoolRegistrationPaymentDetail />}
        />
      </Route>

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
      <Route
        path="donasi/:campaignSlugOrId"
        element={<SchoolCampaignDetail />}
      />
    </Route>

    {/* === Menu utama (akses cepat) === */}
    <Route path="menu-utama">
      <Route index element={<SchoolMenuGrids />} />

      {/* === Profil Sekolah === */}
      <Route path="profil">
        <Route path="profil-sekolah" element={<SchoolProfile showBack />} />
        <Route path="guru">
          <Route index element={<SchoolTeacher showBack />} />
          <Route path="guru/:id" element={<SchoolDetailTeacher />} />
        </Route>
      </Route>

      {/* spp */}
      <Route path="spp" element={<SchoolSpp showBack />} />

      {/* Guru */}
      <Route path="guru" element={<SchoolTeacher showBack />} />
      <Route path="guru/:id" element={<SchoolDetailTeacher />} />

      {/* Akademik */}
      <Route path="tahun-akademik" element={<SchoolAcademic showBack />} />
      <Route path="tahun-akademik/:id" element={<SchoolDetailAcademic />} />

      {/* Buku */}
      <Route path="buku" element={<SchoolBooks showBack />} />
      <Route path="buku/:id" element={<SchoolBookDetail />} />

      {/* Ruangan */}
      <Route path="ruangan" element={<SchoolRoom showBack />} />
      <Route path="ruangan/:id" element={<SchoolDetailRoom />} />

      {/* Mata Pelajaran */}
      <Route path="mata-pelajaran" element={<SchoolSubject showBack />} />
      <Route path="mata-pelajaran/:id" element={<SchoolSubjectDetail />} />

      {/* Kelas */}
      <Route path="level" element={<SchoolClassParent />} />
      <Route
        path="level/:classParentId"
        element={<SchoolClassParentDetail />}
      />
      <Route path="daftar-kelas" element={<SchoolClass />} />
      <Route path="daftar-kelas/:classId" element={<SchoolClassDetail />} />
      <Route path="semua-kelas" element={<SchoolClassSection />} />
      <Route
        path="semua-kelas/:classSectionId"
        element={<SchoolClassSectionDetail />}
      />
      <Route path="pelajaran" element={<SchoolCSST />} />
      <Route path="pelajaran/:csstId" element={<SchoolCSSTDetail />} />

      {/* Jadwal */}
      <Route path="agenda" element={<SchoolScheduleAgenda showBack />} />
      <Route path="rutin" element={<SchoolScheduleRoutine showBack />} />

      {/* Jadwal */}
      <Route path="donasi" element={<SchoolCampaign showBack />} />
      <Route path="donasi/detail" element={<SchoolCampaignDetail />} />

      {/* Pendaftaran */}
      <Route
        path="pendaftaran"
        element={<SchoolRegistrationsPeriod showBack />}
      />
      <Route
        path="pendaftaran/murid"
        element={<SchoolRegistrationsListStudent showBack />}
      />
      <Route
        path="pendaftaran/murid/pembayaran"
        element={<SchoolRegistrationPaymentDetail showBack />}
      />
      <Route
        path="pendaftaran/pengaturan"
        element={<SchoolRegistrationsSetting showBack />}
      />
    </Route>
  </Route>
);
