// src/pages/dasboard/schools/types/schoolProfile.ts

/* ===================== API TYPES ===================== */

export type ApiSchoolProfile = {
  school_profile_id: string;
  school_profile_school_id: string;

  school_profile_description: string | null;
  school_profile_founded_year: number | null;

  // kontak & sosial
  school_profile_contact_phone: string | null;
  school_profile_google_maps_url: string | null;
  school_profile_instagram_url: string | null;
  school_profile_whatsapp_url: string | null;
  school_profile_youtube_url: string | null;
  school_profile_facebook_url: string | null;
  school_profile_tiktok_url: string | null;
  school_profile_whatsapp_group_ikhwan_url: string | null;
  school_profile_whatsapp_group_akhwat_url: string | null;
  school_profile_website_url: string | null;

  // koordinat
  school_profile_latitude: number | null;
  school_profile_longitude: number | null;

  // profil sekolah resmi
  school_profile_school_npsn: string | null;
  school_profile_school_nss: string | null;
  school_profile_school_accreditation: string | null;
  school_profile_school_principal_user_id: string | null; // UUID string
  school_profile_school_email: string | null;
  school_profile_school_address: string | null;
  school_profile_school_student_capacity: number | null;
  school_profile_school_is_boarding: boolean;

  school_profile_created_at: string;
  school_profile_updated_at: string;
};

export type ApiSchool = {
  school_id: string;
  school_name: string;
  school_bio_short: string;
  school_domain: string;
  school_slug: string;
  school_location: string;
  school_city: string;
  school_number: number;

  school_is_active: boolean;
  school_is_verified: boolean;
  school_verification_status: string;
  school_verification_notes: string;

  school_contact_person_name: string;
  school_contact_person_phone: string;

  school_is_islamic_school: boolean;
  school_tenant_profile: string;

  school_levels: string[];

  school_has_teacher_code: boolean;
  school_teacher_code_set_at: string | null;

  school_icon_url: string;
  school_icon_object_key: string;
  school_icon_url_old: string;
  school_icon_object_key_old: string;
  school_icon_delete_pending_until: string | null;

  school_logo_url: string;
  school_logo_object_key: string;
  school_logo_url_old: string;
  school_logo_object_key_old: string;

  school_background_url: string;
  school_background_object_key: string;
  school_background_url_old: string;
  school_background_object_key_old: string;

  school_created_at: string;
  school_updated_at: string;

  // nested profile dari endpoint ?include=profile
  school_profile?: ApiSchoolProfile | null;
};

/* ===================== UI Shape ===================== */

export type SchoolUiSocials = {
  instagram?: string | null;
  youtube?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
  waIkhwan?: string | null;
  waAkhwat?: string | null;
};

export type SchoolUi = {
  id: string;
  name: string;

  // ⬇️ ini yang baru
  profileId: string | null;

  description: string | null;
  foundedYear: number | null;

  address: string | null;
  city: string | null;

  npsn: string | null;
  nss: string | null;
  accreditation: string | null;
  principalUserId: string | null;
  capacity: number | null;
  isBoarding: boolean;

  contactPhone: string | null;
  contactEmail: string | null;
  website: string | null;

  mapsUrl: string | null;
  socials: SchoolUiSocials | null;

  logoUrl: string | null;
};

/* ===================== Helpers ===================== */

const emptyToNull = (v: string | null | undefined): string | null => {
  if (v == null) return null;
  const t = v.trim();
  return t === "" ? null : t;
};

/* ===================== Adapt: API -> UI ===================== */
export const adaptToUi = (school: ApiSchool): SchoolUi => {
  const p = school.school_profile ?? null;

  return {
    id: school.school_id,
    name: school.school_name,

    // ⬇️ ini yang baru
    profileId: p?.school_profile_id || null,

    description: p?.school_profile_description ?? null,
    foundedYear: p?.school_profile_founded_year ?? null,

    // alamat resmi ambil dari profile, kota dari school utama
    address: p?.school_profile_school_address ?? null,
    city: emptyToNull(school.school_city) ?? null,

    npsn: p?.school_profile_school_npsn ?? null,
    nss: p?.school_profile_school_nss ?? null,
    accreditation: p?.school_profile_school_accreditation ?? null,
    principalUserId: p?.school_profile_school_principal_user_id ?? null,
    capacity: p?.school_profile_school_student_capacity ?? null,
    isBoarding: p?.school_profile_school_is_boarding ?? false,

    // kontak
    contactPhone:
      p?.school_profile_contact_phone ??
      emptyToNull(school.school_contact_person_phone),
    contactEmail: p?.school_profile_school_email ?? null,
    website: p?.school_profile_website_url ?? null,

    mapsUrl: p?.school_profile_google_maps_url ?? null,

    socials: {
      instagram: p?.school_profile_instagram_url ?? null,
      youtube: p?.school_profile_youtube_url ?? null,
      facebook: p?.school_profile_facebook_url ?? null,
      tiktok: p?.school_profile_tiktok_url ?? null,
      whatsapp: p?.school_profile_whatsapp_url ?? null,
      waIkhwan: p?.school_profile_whatsapp_group_ikhwan_url ?? null,
      waAkhwat: p?.school_profile_whatsapp_group_akhwat_url ?? null,
    },

    // logo: pakai logo kalau ada, fallback ke icon
    logoUrl:
      emptyToNull(school.school_logo_url) ??
      emptyToNull(school.school_icon_url) ??
      null,
  };
};

/* ===================== Adapt: UI -> API PATCH ===================== */

export function adaptFromUi(ui: SchoolUi): {
  schoolsPatch: Partial<ApiSchool>;
  profilePatch: Partial<ApiSchoolProfile>;
} {
  const schoolsPatch: Partial<ApiSchool> = {
    school_name: ui.name,
    school_city: ui.city ?? "",
    // kalau mau, bisa ditambah mapping ke school_bio_short / school_location, dll.
  };

  const profilePatch: Partial<ApiSchoolProfile> = {
    school_profile_description: emptyToNull(ui.description),
    school_profile_founded_year: ui.foundedYear ?? null,

    school_profile_school_address: emptyToNull(ui.address),
    school_profile_school_student_capacity: ui.capacity ?? null,
    school_profile_school_is_boarding: ui.isBoarding,

    school_profile_school_npsn: emptyToNull(ui.npsn),
    school_profile_school_nss: emptyToNull(ui.nss),
    school_profile_school_accreditation: emptyToNull(ui.accreditation),
    school_profile_school_principal_user_id: emptyToNull(
      ui.principalUserId ?? null
    ),

    // kontak & website
    school_profile_contact_phone: emptyToNull(ui.contactPhone),
    school_profile_school_email: emptyToNull(ui.contactEmail),
    school_profile_website_url: emptyToNull(ui.website),

    // maps
    school_profile_google_maps_url: emptyToNull(ui.mapsUrl),

    // sosial
    school_profile_instagram_url: emptyToNull(ui.socials?.instagram),
    school_profile_youtube_url: emptyToNull(ui.socials?.youtube),
    school_profile_facebook_url: emptyToNull(ui.socials?.facebook),
    school_profile_tiktok_url: emptyToNull(ui.socials?.tiktok),
    school_profile_whatsapp_url: emptyToNull(ui.socials?.whatsapp),
    school_profile_whatsapp_group_ikhwan_url: emptyToNull(ui.socials?.waIkhwan),
    school_profile_whatsapp_group_akhwat_url: emptyToNull(ui.socials?.waAkhwat),
  };

  return { schoolsPatch, profilePatch };
}
