// src/lib/axios.ts
import axiosLib from "axios";
import type { AxiosError, AxiosInstance } from "axios";

/* ==========================================
   🔧 BASE (pakai Vite proxy di DEV)
========================================== */
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

const api: AxiosInstance = axiosLib.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 60_000,
});

const apiNoAuth: AxiosInstance = axiosLib.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 60_000,
});

/* ==========================================
   🛠️ URL helpers (robust untuk absolute/relative)
========================================== */
function pathOf(u: string): string {
  if (!u) return "/";
  try {
    if (u.startsWith("http://") || u.startsWith("https://")) {
      return new URL(u).pathname || "/";
    }
  } catch {}
  return u;
}
function stripApiPrefixOnce(p: string): string {
  return p.startsWith("/api/") ? p.slice(4) : p;
}
function stripApiPrefixAll(p: string): string {
  // buang semua /api/ paling depan agar tak jadi /api/api/...
  let out = p;
  while (out.startsWith("/api/")) out = out.slice(4);
  return out;
}
function normalizePath(u: string): string {
  return stripApiPrefixOnce(pathOf(u));
}
function isAuthPath(p: string): boolean {
  return p.startsWith("/auth/");
}
function isLoginPath(p: string): boolean {
  return p === "/auth/login";
}
function isRefreshPath(p: string): boolean {
  return p === "/auth/refresh-token";
}
const isFormData = (d: any) =>
  typeof FormData !== "undefined" && d instanceof FormData;

/* ==========================================
   🧰 COOKIE UTILS (non-HttpOnly, utk context)
========================================== */
function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
function setCookie(
  name: string,
  value: string,
  {
    days = 30,
    path = "/",
    secure = true,
    sameSite = "Lax" as "Lax" | "Strict" | "None",
  } = {}
) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie =
    `${name}=${encodeURIComponent(
      value
    )}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite};` +
    (secure ? " Secure;" : "");
}
function delCookie(name: string, path = "/") {
  document.cookie = `${name}=; Path=${path}; Max-Age=0; SameSite=Lax;`;
}

/* ==========================================
   🏷️ school CONTEXT (cookie + display)
========================================== */
const ACTIVE_school_COOKIE = "active_school_id";
const ACTIVE_ROLE_COOKIE = "active_role";

const ACTIVE_school_NAME_SS = "active_school_name";
const ACTIVE_school_ICON_SS = "active_school_icon";

export function setActiveschoolDisplay(name?: string, icon?: string) {
  if (typeof sessionStorage === "undefined") return;
  if (typeof name === "string")
    sessionStorage.setItem(ACTIVE_school_NAME_SS, name);
  if (typeof icon === "string")
    sessionStorage.setItem(ACTIVE_school_ICON_SS, icon);
}
export function getActiveschoolDisplay() {
  if (typeof sessionStorage === "undefined")
    return { name: null as string | null, icon: null as string | null };
  return {
    name: sessionStorage.getItem(ACTIVE_school_NAME_SS),
    icon: sessionStorage.getItem(ACTIVE_school_ICON_SS),
  };
}
export function clearActiveschoolDisplay() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(ACTIVE_school_NAME_SS);
  sessionStorage.removeItem(ACTIVE_school_ICON_SS);
}

export function getActiveschoolId(): string | null {
  return getCookie(ACTIVE_school_COOKIE);
}
export function getActiveRole(): string | null {
  return getCookie(ACTIVE_ROLE_COOKIE);
}

export function setActiveschoolContext(
  schoolId: string,
  role?: string,
  opts?: { name?: string; icon?: string }
) {
  if (schoolId) setCookie(ACTIVE_school_COOKIE, schoolId);
  if (role) setCookie(ACTIVE_ROLE_COOKIE, role);
  if (opts?.name || opts?.icon) setActiveschoolDisplay(opts.name, opts.icon);

  clearSimpleContextCache();
  window.dispatchEvent(
    new CustomEvent("school:changed", {
      detail: { schoolId, role, meta: opts },
    })
  );
}

export function clearActiveschoolContext() {
  delCookie(ACTIVE_school_COOKIE);
  delCookie(ACTIVE_ROLE_COOKIE);
  clearActiveschoolDisplay();

  clearSimpleContextCache();
  window.dispatchEvent(new CustomEvent("school:changed", { detail: null }));
}

/* ==========================================
   🔐 ACCESS TOKEN — PERSIST di sessionStorage
========================================== */
let accessToken: string | null = null;

export function setTokens(access: string) {
  accessToken = access;
  try {
    sessionStorage.setItem("access_token", access);
  } catch {}
  (api.defaults.headers.common as any).Authorization = `Bearer ${access}`;
  console.debug("[auth] set access token");
  window.dispatchEvent(new CustomEvent("auth:authorized"));
}
export function getAccessToken() {
  // fallback ke sessionStorage saat memory null (mis. setelah refresh tab)
  if (accessToken) return accessToken;
  try {
    const s = sessionStorage.getItem("access_token");
    if (s) {
      accessToken = s;
      (api.defaults.headers.common as any).Authorization = `Bearer ${s}`;
      return s;
    }
  } catch {}
  return null;
}
export function clearTokens() {
  accessToken = null;
  try {
    sessionStorage.removeItem("access_token");
  } catch {}
  delete (api.defaults.headers.common as any).Authorization;
  console.debug("[auth] cleared access token");
}

/* ==========================================
   🚦 REFRESH GUARD (matikan auto refresh saat logout/login)
========================================== */
let allowRefresh =
  typeof window !== "undefined"
    ? !/\/login(?:\?|$)/.test(window.location.pathname)
    : true;

export function setAllowRefresh(v: boolean) {
  allowRefresh = v;
}

/* ==========================================
   🔄 CSRF in-memory
========================================== */
let csrfTokenMem: string | null = null;

export async function ensureCsrf(): Promise<string | null> {
  if (csrfTokenMem) return csrfTokenMem;

  // 1) coba dari cookie
  const fromCookie = getCookie("XSRF-TOKEN");
  if (fromCookie) {
    csrfTokenMem = fromCookie;
    return csrfTokenMem;
  }

  // 2) seed dari /auth/csrf
  try {
    const res = await apiNoAuth.get("/auth/csrf", { withCredentials: true });
    csrfTokenMem =
      res.data?.data?.csrf_token ?? getCookie("XSRF-TOKEN") ?? null;
  } catch {
    csrfTokenMem = null;
  }
  return csrfTokenMem;
}

/* ==========================================
   👤 Simple Context (me/simple-context) + cache
========================================== */
export type Membership = {
  school_id: string;
  school_name: string;
  school_icon_url?: string;
  roles?: string[];
};

const CTX_TTL_MS = 5 * 60 * 1000; // 5 menit

export function clearSimpleContextCache() {
  _ctxCache = null;
}

type SimpleContextPayload = {
  user_id?: string;
  user_name?: string;
  name?: string;
  email?: string;
  avatar?: string;
  user_avatar_url?: string;
  profile_photo_url?: string;
  memberships: Membership[];
};

let _ctxCache: { at: number; data: SimpleContextPayload } | null = null;

export async function fetchSimpleContext(
  force = false
): Promise<SimpleContextPayload> {
  const now = Date.now();
  if (!force && _ctxCache && now - _ctxCache.at < CTX_TTL_MS) {
    return _ctxCache.data;
  }

  const res = await api.get("/auth/me/simple-context", {
    withCredentials: true,
  });

  const raw = res?.data?.data ?? res?.data ?? {};
  const data: SimpleContextPayload = {
    user_id: raw?.user_id,
    user_name: raw?.user_name,
    name: raw?.name,
    email: raw?.email,
    avatar: raw?.avatar,
    user_avatar_url: raw?.user_avatar_url,
    profile_photo_url: raw?.profile_photo_url,
    memberships: (raw?.memberships ?? []) as Membership[],
  };

  _ctxCache = { at: now, data };
  return data;
}

/* ==========================================
   🔄 REFRESH via Cookie HttpOnly + XSRF
========================================== */
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  if (!allowRefresh) return null; // ⬅️ guard
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;

  refreshPromise = (async () => {
    const xsrf = (await ensureCsrf()) || "";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (xsrf) headers["X-CSRF-Token"] = xsrf;

    try {
      const res = await apiNoAuth.post(
        "/auth/refresh-token",
        {},
        { headers, withCredentials: true }
      );
      const newAT = res.data?.data?.access_token ?? null;
      if (newAT) setTokens(newAT);

      // sinkronkan XSRF terbaru bila server set-cookie
      const fromCookie = getCookie("XSRF-TOKEN");
      if (fromCookie) csrfTokenMem = fromCookie;

      return newAT;
    } catch (err: any) {
      // Fallback 403 → seed ulang lalu retry sekali
      if (err?.response?.status === 403) {
        await apiNoAuth.get("/auth/csrf", { withCredentials: true });
        const token = getCookie("XSRF-TOKEN");
        if (token) csrfTokenMem = token;

        const res2 = await apiNoAuth
          .post(
            "/auth/refresh-token",
            {},
            {
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfTokenMem || "",
              },
              withCredentials: true,
            }
          )
          .catch(() => null);

        const newAT2 = res2?.data?.data?.access_token ?? null;
        if (newAT2) {
          setTokens(newAT2);
          const fromCookie2 = getCookie("XSRF-TOKEN");
          if (fromCookie2) csrfTokenMem = fromCookie2;
          return newAT2;
        }
      }

      // gagal total
      clearTokens();
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      return null;
    }
  })().finally(() => {
    isRefreshing = false;
    const p = refreshPromise;
    refreshPromise = null;
    return p;
  });

  return refreshPromise;
}

/* ==========================================
   🧩 REQUEST INTERCEPTOR
========================================== */
api.interceptors.request.use(async (config) => {
  // --- FIX double /api --- (kalau dev masih ada pemanggilan "/api/..."):
  if (typeof config.url === "string" && config.url.startsWith("/api/")) {
    config.url = stripApiPrefixAll(config.url);
  }

  const path = normalizePath(String(config.url || ""));
  const method = (config.method || "get").toUpperCase();

  const inAuth = isAuthPath(path);
  const onLogin = isLoginPath(path);
  const onRefresh = isRefreshPath(path);

  // 1) Authorization (kecuali login/refresh)
  if (!onLogin && !onRefresh) {
    const at = getAccessToken();
    if (at) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${at}`;
    }
  }

  // 2) CSRF utk non-auth & mutating
  const needsCsrf = !inAuth && !["GET", "HEAD", "OPTIONS"].includes(method);
  if (needsCsrf && !csrfTokenMem) {
    await ensureCsrf();
  }
  if (!inAuth && csrfTokenMem) {
    config.headers = config.headers ?? {};
    (config.headers as any)["X-CSRF-Token"] = csrfTokenMem;
  }

  // 3) Scope tenant (opsional, non-auth saja)
  if (!inAuth) {
    const sid = getActiveschoolId();
    if (sid) {
      config.headers = config.headers ?? {};
      (config.headers as any)["X-school-ID"] = sid; // sesuaikan dgn backend
    }
  }

  // 4) Content-Type default (skip FormData)
  if (!isFormData((config as any).data)) {
    const headers = (config.headers = config.headers ?? {});
    if (!("Content-Type" in (headers as any))) {
      (headers as any)["Content-Type"] = "application/json";
    }
  }

  return config;
});

/* ==========================================
   🔁 RESPONSE INTERCEPTOR
   - auto CSRF seed + retry
   - auto refresh + retry
   - tidak berlaku untuk /auth/*
========================================== */
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const res = error.response;
    const cfg: any = error.config || {};
    const normalized =
      typeof cfg.url === "string" ? stripApiPrefixOnce(pathOf(cfg.url)) : "";
    const inAuth = isAuthPath(normalized);
    const alreadyRetried = cfg._retried === true;

    // 403 → kemungkinan CSRF kedaluwarsa → seed ulang dan retry sekali (non-auth)
    if (res?.status === 403 && !alreadyRetried && !inAuth) {
      cfg._retried = true;
      try {
        await apiNoAuth.get("/auth/csrf", { withCredentials: true });
        const token = getCookie("XSRF-TOKEN");
        if (token) csrfTokenMem = token;
        cfg.headers = cfg.headers ?? {};
        cfg.headers["X-CSRF-Token"] = csrfTokenMem || "";
        return api(cfg);
      } catch {
        // fallthrough ke reject
      }
    }

    // 401 → coba refresh AT sekali lalu retry (non-auth)
    if (res?.status === 401 && !alreadyRetried && !inAuth && allowRefresh) {
      cfg._retried = true;
      const t = await doRefresh();
      if (t) {
        cfg.headers = cfg.headers ?? {};
        cfg.headers.Authorization = `Bearer ${t}`;
        return api(cfg);
      }
    }

    return Promise.reject(error);
  }
);

/* ==========================================
   🚪 LOGOUT
========================================== */
export async function apiLogout() {
  try {
    // stop auto-refresh seketika
    allowRefresh = false;

    const xsrf = csrfTokenMem || (await ensureCsrf()) || "";
    // pakai apiNoAuth supaya gak tergantung Authorization
    await apiNoAuth.post(
      "/auth/logout",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": xsrf,
        },
        withCredentials: true,
      }
    );
    console.log("✅ Logout server ok (refresh cookie seharusnya terhapus)");
  } catch (e) {
    console.warn("[logout] failed:", e);
  } finally {
    clearTokens();
    clearActiveschoolContext();
    clearSimpleContextCache();
    window.dispatchEvent(
      new CustomEvent("auth:logout", { detail: { source: "axios" } })
    );
    console.log("✅ Logout: access token dibersihkan");
  }
}

export default api;

/* ==========================================
   Utils
========================================== */
export async function restoreSession(): Promise<boolean> {
  // jika sudah ada (termasuk hasil bootstrap sessionStorage), langsung true
  if (!allowRefresh) return false;
  if (getAccessToken()) return true;
  const t0 = performance.now();
  const t = await doRefresh();
  console.debug(
    "[restoreSession] done in",
    Math.round(performance.now() - t0),
    "ms",
    "success:",
    !!t
  );
  return Boolean(t);
}

/* ==========================================
   🔰 BOOTSTRAP (saat halaman pertama kali load)
   - jika ada token di sessionStorage, set ke header
========================================== */
(() => {
  try {
    const saved = sessionStorage.getItem("access_token");
    if (saved) {
      accessToken = saved;
      (api.defaults.headers.common as any).Authorization = `Bearer ${saved}`;
      // tidak trigger event "auth:authorized" di sini agar tidak memicu efek tak diinginkan
      console.debug("[auth] bootstrap access token from sessionStorage");
    }
  } catch {}
})();
