// src/types/school.ts
export type ApiSchool = {
    school_id: string;
    school_name: string;
    school_bio_short?: string | null;
    school_location?: string | null;
    school_city?: string | null;
    school_domain?: string | null;
    school_slug: string;
    school_is_active: boolean;
    school_is_verified: boolean;
    school_verification_status: "pending" | "approved" | "rejected";
    school_verified_at?: string | null;
    school_contact_person_name?: string | null;
    school_contact_person_phone?: string | null;
    school_icon_url?: string | null;
    school_logo_url?: string | null;
    school_background_url?: string | null;
    // ...others omitted
};

export type ApiSchoolProfile = {
    school_profile_id: string;
    school_profile_school_id: string;
    school_profile_description?: string | null;
    school_profile_founded_year?: number | null;
    school_profile_address?: string | null;

    school_profile_contact_phone?: string | null;
    school_profile_contact_email?: string | null;

    school_profile_google_maps_url?: string | null;
    school_profile_instagram_url?: string | null;
    school_profile_whatsapp_url?: string | null;
    school_profile_youtube_url?: string | null;
    school_profile_facebook_url?: string | null;
    school_profile_tiktok_url?: string | null;
    school_profile_whatsapp_group_ikhwan_url?: string | null;
    school_profile_whatsapp_group_akhwat_url?: string | null;
    school_profile_website_url?: string | null;

    school_profile_school_npsn?: string | null;
    school_profile_school_nss?: string | null;
    school_profile_school_accreditation?:
    | "A"
    | "B"
    | "C"
    | "Ungraded"
    | "-"
    | null;
    school_profile_school_principal_user_id?: string | null;
    school_profile_school_student_capacity?: number | null;
    school_profile_school_is_boarding: boolean;

    school_profile_latitude?: number | null;
    school_profile_longitude?: number | null;

    school_profile_school_email?: string | null;
    school_profile_school_address?: string | null;
};

export type SchoolUi = {
    id: string;
    name: string;
    npsn?: string | null;
    accreditation?: "A" | "B" | "C" | "Ungraded" | "-" | null;
    foundedYear?: number | null;

    address?: string | null; // gabungan/tampilan
    city?: string | null;

    contactPhone?: string | null;
    contactEmail?: string | null;
    website?: string | null;

    principalUserId?: string | null;

    description?: string | null;

    mapsUrl?: string | null;

    capacity?: number | null;
    isBoarding?: boolean;

    socials?: {
        instagram?: string | null;
        youtube?: string | null;
        facebook?: string | null;
        tiktok?: string | null;
        whatsapp?: string | null;
        waIkhwan?: string | null;
        waAkhwat?: string | null;
    };

    logoUrl?: string | null;
};

export function adaptToUi(s: ApiSchool, p?: ApiSchoolProfile | null): SchoolUi {
    return {
        id: s.school_id,
        name: s.school_name,
        npsn: p?.school_profile_school_npsn ?? null,
        accreditation: p?.school_profile_school_accreditation ?? null,
        foundedYear: p?.school_profile_founded_year ?? null,

        address:
            p?.school_profile_school_address ??
            p?.school_profile_address ??
            s.school_location ??
            null,
        city: s.school_city ?? null,

        contactPhone:
            p?.school_profile_contact_phone ?? s.school_contact_person_phone ?? null,
        contactEmail:
            p?.school_profile_school_email ?? p?.school_profile_contact_email ?? null,
        website: p?.school_profile_website_url ?? null,

        principalUserId: p?.school_profile_school_principal_user_id ?? null,

        description: p?.school_profile_description ?? null,

        mapsUrl: p?.school_profile_google_maps_url ?? null,

        capacity: p?.school_profile_school_student_capacity ?? null,
        isBoarding: !!p?.school_profile_school_is_boarding,

        socials: {
            instagram: p?.school_profile_instagram_url ?? null,
            youtube: p?.school_profile_youtube_url ?? null,
            facebook: p?.school_profile_facebook_url ?? null,
            tiktok: p?.school_profile_tiktok_url ?? null,
            whatsapp: p?.school_profile_whatsapp_url ?? null,
            waIkhwan: p?.school_profile_whatsapp_group_ikhwan_url ?? null,
            waAkhwat: p?.school_profile_whatsapp_group_akhwat_url ?? null,
        },

        logoUrl: s.school_logo_url ?? s.school_icon_url ?? null,
    };
}

export function adaptFromUi(ui: SchoolUi): {
    schoolsPatch: Partial<ApiSchool>;
    profilePatch: Partial<ApiSchoolProfile>;
} {
    return {
        schoolsPatch: {
            // untuk sekarang hanya name yang kita izinkan ubah dari UI di tabel schools
            school_name: ui.name,
            // opsional: school_location bisa diisi ringkas, tapi kita prioritaskan di profile
        },
        profilePatch: {
            school_profile_school_npsn: ui.npsn ?? null,
            school_profile_school_accreditation: ui.accreditation ?? null,
            school_profile_founded_year: ui.foundedYear ?? null,

            school_profile_school_address: ui.address ?? null,
            school_profile_contact_phone: ui.contactPhone ?? null,
            school_profile_school_email: ui.contactEmail ?? null,
            school_profile_website_url: ui.website ?? null,

            school_profile_school_principal_user_id: ui.principalUserId ?? null,

            school_profile_description: ui.description ?? null,

            school_profile_google_maps_url: ui.mapsUrl ?? null,

            school_profile_school_student_capacity: ui.capacity ?? null,
            school_profile_school_is_boarding: !!ui.isBoarding,

            school_profile_instagram_url: ui.socials?.instagram ?? null,
            school_profile_youtube_url: ui.socials?.youtube ?? null,
            school_profile_facebook_url: ui.socials?.facebook ?? null,
            school_profile_tiktok_url: ui.socials?.tiktok ?? null,
            school_profile_whatsapp_url: ui.socials?.whatsapp ?? null,
            school_profile_whatsapp_group_ikhwan_url: ui.socials?.waIkhwan ?? null,
            school_profile_whatsapp_group_akhwat_url: ui.socials?.waAkhwat ?? null,
        },
    };
}