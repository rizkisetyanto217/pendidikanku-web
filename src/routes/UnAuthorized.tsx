// // src/pages/Unauthorized.tsx
// import React, { useMemo, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   ShieldAlert,
//   ArrowLeft,
//   Home,
//   Building2,
//   Landmark,
//   KeyRound,
//   UsersRound,
//   CheckCircle2,
// } from "lucide-react";

// import useHtmlThema from "@/hooks/useHTMLThema";
// import { pickTheme, ThemeName } from "@/constants/thema";

// type LocState = { need?: string[]; from?: string };

// // helper slug
// function slugify(s: string) {
//   return (s || "")
//     .toLowerCase()
//     .replace(/[^\w\s-]/g, "")
//     .trim()
//     .replace(/\s+/g, "-");
// }

// export default function Unauthorized() {
//   const nav = useNavigate();
//   const loc = useLocation();
//   const state = (loc.state || {}) as LocState;

//   const { isDark, themeName } = useHtmlThema();
//   const theme = pickTheme(themeName as ThemeName, isDark);

//   // tokens warna biar konsisten dark/light
//   const text = {
//     title: isDark ? "#fff" : theme.black1,
//     body: isDark ? theme.silver2 : theme.black2,
//   };
//   const surface = {
//     card: theme.white1,
//     cardAlt: theme.white2,
//     border: theme.white3,
//   };

//   const badgeStyle = useMemo(
//     () => ({
//       backgroundColor: isDark ? "rgba(255,255,255,.08)" : theme.white1,
//       borderColor: surface.border,
//       color: isDark ? "#fff" : theme.black1,
//     }),
//     [isDark, surface.border, theme, text]
//   );

//   // ===== states: pilih aksi =====
//   type Mode = "none" | "create-school" | "join-school";
//   const [mode, setMode] = useState<Mode>("none");

//   // ====== form DKM (dummy) ======
//   const [mName, setMName] = useState("school Al-Hikmah");
//   const [mCity, setMCity] = useState("Bandung");
//   const [mAddress, setMAddress] = useState("Jl. Contoh No. 123");
//   const [schoolCreatedSlug, setschoolCreatedSlug] = useState<string | null>(
//     null
//   );

//   const createschool = (e: React.FormEvent) => {
//     e.preventDefault();
//     const slug = slugify(mName) || "school-baru";
//     // dummy “berhasil”
//     setschoolCreatedSlug(slug);
//   };

//   // ====== form join sekolah (dummy) ======
//   const [code, setCode] = useState("");
//   const [joinAs, setJoinAs] = useState<"teacher" | "student">("teacher");
//   const [joined, setJoined] = useState<{ slug: string; school: string } | null>(
//     null
//   );

//   const submitJoin = (e: React.FormEvent) => {
//     e.preventDefault();
//     // dummy resolver kode
//     // contoh kode: ALHIKMAH-2025  -> slug "al-hikmah"
//     let school = "SDIT Al-Hikmah";
//     let slug = "al-hikmah";
//     if (!/alhikmah|al-hikmah|hikmah|2025/i.test(code)) {
//       school = "Contoh School";
//       slug = "contoh-school";
//     }
//     setJoined({ slug, school });
//   };

//   // ===== UI =====
//   return (
//     <div
//       className="min-h-screen grid place-items-center px-6 py-10"
//       style={{ backgroundColor: theme.white2 }}
//     >
//       <div
//         className="w-full max-w-3xl rounded-2xl border shadow-sm p-6 md:p-8"
//         style={{ backgroundColor: surface.card, borderColor: surface.border }}
//       >
//         {/* Header — Access Denied */}
//         <div className="max-w-xl mx-auto text-center">
//           <div
//             className="mx-auto mb-4 h-14 w-14 grid place-items-center rounded-2xl"
//             style={{ backgroundColor: theme.error2, color: theme.error1 }}
//           >
//             <ShieldAlert size={28} />
//           </div>

//           <h1 className="text-2xl font-bold mb-2" style={{ color: text.title }}>
//             Akses Ditolak
//           </h1>
//           <p className="text-sm" style={{ color: text.body }}>
//             Anda sudah masuk, tetapi tidak memiliki izin untuk mengakses halaman
//             ini.
//             {state.need?.length ? (
//               <>
//                 {" "}
//                 (dibutuhkan: <b>{state.need.join(", ")}</b>)
//               </>
//             ) : null}
//           </p>

//           <div className="mt-6 flex gap-2 justify-center">
//             <button
//               onClick={() =>
//                 state.from ? nav(state.from, { replace: true }) : nav(-1)
//               }
//               className="inline-flex items-center gap-2 rounded-lg border px-4 py-2"
//               style={{
//                 borderColor: surface.border,
//                 color: text.title,
//                 backgroundColor: surface.cardAlt,
//               }}
//             >
//               <ArrowLeft size={16} /> Kembali
//             </button>
//             <button
//               onClick={() => nav("/")}
//               className="inline-flex items-center gap-2 rounded-lg px-4 py-2"
//               style={{ backgroundColor: theme.primary, color: "#fff" }}
//             >
//               <Home size={16} /> Beranda
//             </button>
//           </div>
//         </div>

//         {/* Divider */}
//         <div className="my-8 flex items-center gap-3">
//           <div
//             className="h-px flex-1"
//             style={{ backgroundColor: surface.border }}
//           />
//           <span
//             className="text-xs px-2 py-1 rounded-full border"
//             style={badgeStyle}
//           >
//             Belum gabung kemanapun?
//           </span>
//           <div
//             className="h-px flex-1"
//             style={{ backgroundColor: surface.border }}
//           />
//         </div>

//         {/* Pilihan Aksi */}
//         <div className="grid md:grid-cols-2 gap-4">
//           {/* Card: Jadi DKM */}
//           <button
//             onClick={() => setMode("create-school")}
//             className={`text-left rounded-2xl border p-4 transition hover:shadow-sm ${
//               mode === "create-school" ? "ring-2" : ""
//             }`}
//             style={{
//               borderColor:
//                 mode === "create-school" ? theme.primary : surface.border,
//               backgroundColor: surface.cardAlt,
//             }}
//           >
//             <div className="flex items-center gap-3 mb-1">
//               <div
//                 className="h-10 w-10 grid place-items-center rounded-xl"
//                 style={{
//                   backgroundColor: theme.primary2,
//                   color: theme.primary,
//                 }}
//               >
//                 <Landmark size={18} />
//               </div>
//               <div>
//                 <div className="font-semibold" style={{ color: text.title }}>
//                   Saya Pengurus DKM
//                 </div>
//                 <div className="text-xs" style={{ color: text.body }}>
//                   Buat profil school (dummy)
//                 </div>
//               </div>
//             </div>
//             <p className="text-xs" style={{ color: text.body }}>
//               Cocok untuk takmir/pengurus: kelola profil, program, dan
//               operasional.
//             </p>
//           </button>

//           {/* Card: Masuk Guru/Murid */}
//           <button
//             onClick={() => setMode("join-school")}
//             className={`text-left rounded-2xl border p-4 transition hover:shadow-sm ${
//               mode === "join-school" ? "ring-2" : ""
//             }`}
//             style={{
//               borderColor:
//                 mode === "join-school" ? theme.primary : surface.border,
//               backgroundColor: surface.cardAlt,
//             }}
//           >
//             <div className="flex items-center gap-3 mb-1">
//               <div
//                 className="h-10 w-10 grid place-items-center rounded-xl"
//                 style={{
//                   backgroundColor: theme.primary2,
//                   color: theme.primary,
//                 }}
//               >
//                 <UsersRound size={18} />
//               </div>
//               <div>
//                 <div className="font-semibold" style={{ color: text.title }}>
//                   Saya Guru / Murid
//                 </div>
//                 <div className="text-xs" style={{ color: text.body }}>
//                   Masuk dengan kode akses sekolah (dummy)
//                 </div>
//               </div>
//             </div>
//             <p className="text-xs" style={{ color: text.body }}>
//               Masukkan kode akses dari sekolah Anda untuk bergabung sebagai guru
//               atau siswa.
//             </p>
//           </button>
//         </div>

//         {/* ===== Panel: Create school (DKM) ===== */}
//         {mode === "create-school" && (
//           <div
//             className="mt-6 rounded-2xl border p-5"
//             style={{
//               borderColor: surface.border,
//               backgroundColor: surface.card,
//             }}
//           >
//             <div className="flex items-center gap-2 mb-3">
//               <Building2 size={18} />
//               <h3 className="font-semibold" style={{ color: text.title }}>
//                 Buat school (Dummy)
//               </h3>
//             </div>

//             {schoolCreatedSlug ? (
//               <div
//                 className="rounded-xl p-4 border mb-3"
//                 style={{
//                   backgroundColor: theme.success2,
//                   borderColor: theme.success1,
//                   color: isDark ? "#bfffe8" : theme.success1,
//                 }}
//               >
//                 <div className="flex items-center gap-2 font-medium">
//                   <CheckCircle2 size={18} />
//                   school berhasil dibuat!
//                 </div>
//                 <div className="text-sm mt-1">
//                   Slug: <code>{schoolCreatedSlug}</code>
//                 </div>
//                 <div className="mt-3 flex gap-2">
//                   <button
//                     onClick={() => nav(`/${schoolCreatedSlug}/sekolah`)}
//                     className="rounded-lg px-4 py-2 text-sm"
//                     style={{ backgroundColor: theme.primary, color: "#fff" }}
//                   >
//                     Masuk ke Dashboard DKM
//                   </button>
//                   <button
//                     onClick={() => {
//                       setschoolCreatedSlug(null);
//                       setMode("none");
//                     }}
//                     className="rounded-lg px-4 py-2 text-sm border"
//                     style={{
//                       borderColor: surface.border,
//                       backgroundColor: surface.cardAlt,
//                       color: text.title,
//                     }}
//                   >
//                     Selesai
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <form
//                 onSubmit={createschool}
//                 className="grid sm:grid-cols-2 gap-3"
//               >
//                 <Field
//                   label="Nama school"
//                   value={mName}
//                   onChange={setMName}
//                   placeholder="cth. school Al-Hikmah"
//                   surface={surface}
//                   text={text}
//                 />
//                 <Field
//                   label="Kota/Kabupaten"
//                   value={mCity}
//                   onChange={setMCity}
//                   placeholder="cth. Bandung"
//                   surface={surface}
//                   text={text}
//                 />
//                 <div className="sm:col-span-2">
//                   <Field
//                     label="Alamat"
//                     value={mAddress}
//                     onChange={setMAddress}
//                     placeholder="Jl. Contoh No. 123"
//                     surface={surface}
//                     text={text}
//                   />
//                 </div>

//                 <div className="sm:col-span-2 flex justify-end">
//                   <button
//                     type="submit"
//                     className="rounded-lg px-5 py-2.5 text-sm"
//                     style={{ backgroundColor: theme.primary, color: "#fff" }}
//                   >
//                     Buat school (Dummy)
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         )}

//         {/* ===== Panel: Join Sekolah (Guru/Murid) ===== */}
//         {mode === "join-school" && (
//           <div
//             className="mt-6 rounded-2xl border p-5"
//             style={{
//               borderColor: surface.border,
//               backgroundColor: surface.card,
//             }}
//           >
//             <div className="flex items-center gap-2 mb-3">
//               <KeyRound size={18} />
//               <h3 className="font-semibold" style={{ color: text.title }}>
//                 Masuk ke Sekolah dengan Kode (Dummy)
//               </h3>
//             </div>

//             {joined ? (
//               <div
//                 className="rounded-xl p-4 border mb-3"
//                 style={{
//                   backgroundColor: theme.success2,
//                   borderColor: theme.success1,
//                   color: isDark ? "#bfffe8" : theme.success1,
//                 }}
//               >
//                 <div className="flex items-center gap-2 font-medium">
//                   <CheckCircle2 size={18} />
//                   Berhasil bergabung ke <b className="ml-1">{joined.school}</b>.
//                 </div>
//                 <div className="mt-3 flex gap-2">
//                   <button
//                     onClick={() =>
//                       nav(
//                         `/${joined.slug}/${joinAs === "teacher" ? "guru" : "murid"}`
//                       )
//                     }
//                     className="rounded-lg px-4 py-2 text-sm"
//                     style={{ backgroundColor: theme.primary, color: "#fff" }}
//                   >
//                     Masuk Sekarang
//                   </button>
//                   <button
//                     onClick={() => {
//                       setJoined(null);
//                       setMode("none");
//                       setCode("");
//                     }}
//                     className="rounded-lg px-4 py-2 text-sm border"
//                     style={{
//                       borderColor: surface.border,
//                       backgroundColor: surface.cardAlt,
//                       color: text.title,
//                     }}
//                   >
//                     Selesai
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <form onSubmit={submitJoin} className="grid sm:grid-cols-2 gap-3">
//                 <div className="sm:col-span-2">
//                   <Field
//                     label="Kode Akses Sekolah"
//                     value={code}
//                     onChange={setCode}
//                     placeholder="cth. ALHIKMAH-2025"
//                     surface={surface}
//                     text={text}
//                     leadingIcon={<KeyRound size={16} />}
//                   />
//                   <p className="text-xs mt-1" style={{ color: text.body }}>
//                     Contoh kode: <code>ALHIKMAH-2025</code> (dummy).
//                   </p>
//                 </div>

//                 <div>
//                   <Label text="Masuk sebagai" textColor={text.title} />
//                   <select
//                     value={joinAs}
//                     onChange={(e) => setJoinAs(e.target.value as any)}
//                     className="w-full rounded-lg border px-3 py-2.5 outline-none"
//                     style={{
//                       borderColor: surface.border,
//                       backgroundColor: surface.cardAlt,
//                       color: text.title,
//                     }}
//                   >
//                     <option value="teacher">Guru</option>
//                     <option value="student">Murid</option>
//                   </select>
//                 </div>

//                 <div className="sm:col-span-2 flex justify-end">
//                   <button
//                     type="submit"
//                     disabled={!code.trim()}
//                     className="rounded-lg px-5 py-2.5 text-sm disabled:opacity-60"
//                     style={{ backgroundColor: theme.primary, color: "#fff" }}
//                   >
//                     Gabung (Dummy)
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         )}

//         <p className="mt-6 text-center text-xs" style={{ color: text.body }}>
//           Jika merasa ini keliru, hubungi admin untuk meminta akses.
//         </p>
//       </div>
//     </div>
//   );
// }

// /* ===== sub components ===== */
// function Label({ text, textColor }: { text: string; textColor: string }) {
//   return (
//     <label
//       className="block text-sm font-medium mb-1"
//       style={{ color: textColor }}
//     >
//       {text}
//     </label>
//   );
// }

// function Field({
//   label,
//   value,
//   onChange,
//   placeholder,
//   surface,
//   text,
//   leadingIcon,
// }: {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
//   placeholder?: string;
//   surface: { border: string; cardAlt: string };
//   text: { title: string };
//   leadingIcon?: React.ReactNode;
// }) {
//   return (
//     <div>
//       <Label text={label} textColor={text.title} />
//       <div className="relative">
//         {leadingIcon ? (
//           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-70">
//             {leadingIcon}
//           </span>
//         ) : null}
//         <input
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           placeholder={placeholder}
//           className={`w-full rounded-lg border px-3 py-2.5 outline-none ${leadingIcon ? "pl-9" : ""}`}
//           style={{
//             borderColor: surface.border,
//             backgroundColor: surface.cardAlt,
//           }}
//         />
//       </div>
//     </div>
//   );
// }
