// src/routes/UnnasignedRoutes.tsx
import { Route, Navigate } from "react-router-dom";

import UnnasignedInfo from "@/pages/dashboard/unnasigned/students/UnnasignedStudentInfo";
import UnnasignedStudentClassDetail from "@/pages/dashboard/unnasigned/students/details/UnnasignedStudentClassDetail";
import UnnasignedStudentFeesDetail from "@/pages/dashboard/unnasigned/students/details/UnnasignedStudentFeesDetail";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import UnnasignedStudentDashboard from "@/pages/dashboard/unnasigned/students/UnnasignedStudentDashboard";
import UnnasignedStudentPaymentResult from "@/pages/dashboard/unnasigned/students/payments/UnnasignedStudentPaymentResult";
import UnnasignedStudentProfileStudent from "@/pages/dashboard/unnasigned/students/profiles/UnnasignedStudentProfileStudent";

import UnassignedTeacherJoin from "@/pages/dashboard/unnasigned/teachers/UnnasignedTeacherJoin";
import UnnasignedStudentProfileTeacher from "@/pages/dashboard/unnasigned/teachers/profiles/UnnasignedStudentProfileTeacher";

// Cluster rute untuk PMB / Pendaftaran
// Base path: /:school_slug
export const UnnasignedRoutes = (
  <>
    {/* =========================
        PROFIL TANPA DASHBOARD LAYOUT
        (tidak ada sidebar) — first-time users
    ========================== */}
    {/* /:school_slug/user-murid/profil-new */}
    <Route
      path="user-murid/profil-new"
      element={<UnnasignedStudentProfileStudent />}
    />

    {/* /:school_slug/user-guru/profil-new */}
    <Route
      path="user-guru/profil-new"
      element={<UnnasignedStudentProfileTeacher />}
    />

    {/* =========================
        CLUSTER USER MURID
        Base: /:school_slug/user-murid
        (sudah lewat tahap isi profil)
    ========================== */}
    <Route path="user-murid" element={<DashboardLayout />}>
      {/* index: /:school_slug/user-murid → ke halaman pendaftaran */}
      <Route index element={<Navigate to="pendaftaran" replace />} />

      <Route path="dashboard" element={<UnnasignedStudentDashboard />} />

      {/* /:school_slug/user-murid/pendaftaran → info PMB / daftar program */}
      <Route path="pendaftaran" element={<UnnasignedInfo />} />

      {/* /:school_slug/user-murid/pendaftaran/:id */}
      <Route
        path="pendaftaran/:id"
        element={<UnnasignedStudentClassDetail />}
      />

      {/* /:school_slug/user-murid/pendaftaran/:id/biaya */}
      <Route
        path="pendaftaran/:id/biaya"
        element={<UnnasignedStudentFeesDetail />}
      />

      {/* /:school_slug/user-murid/profil → profil di dalam layout (sidebar sudah ada) */}
      <Route path="profil" element={<UnnasignedStudentProfileStudent />} />

      {/* HALAMAN HASIL PEMBAYARAN */}
      <Route
        path="pendaftaran/selesai"
        element={<UnnasignedStudentPaymentResult />}
      />
    </Route>

    {/* =========================
        CLUSTER USER GURU
        Base: /:school_slug/user-guru
        (sudah lewat tahap isi profil guru)
    ========================== */}
    <Route path="user-guru" element={<DashboardLayout />}>
      {/* index: /:school_slug/user-guru → langsung ke halaman bergabung */}
      <Route index element={<Navigate to="bergabung" replace />} />

      {/* /:school_slug/user-guru/bergabung → join pakai kode guru / kode kelas */}
      <Route path="bergabung" element={<UnassignedTeacherJoin />} />

      {/* /:school_slug/user-guru/profil → profil guru di dalam layout */}
      <Route path="profil" element={<UnnasignedStudentProfileTeacher />} />
    </Route>
  </>
);