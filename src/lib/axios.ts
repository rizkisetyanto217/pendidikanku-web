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
   🛠️ URL helpers
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
   🧰 COOKIE UTILS (non-HttpOnly)
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
   🏷️ school CONTEXT (COOKIE-BASED, UI ONLY)
========================================== */
const ACTIVE_school_COOKIE = "active_school_id";
const ACTIVE_ROLE_COOKIE = "active_role";

const ACTIVE_school_NAME_SS = "active_school_name";
const ACTIVE_school_ICON_SS = "active_school_icon";

export function setActiveschoolDisplay(name?: string, icon?: string) {
  if (typeof sessionStorage === "undefined") return;
  if (name) sessionStorage.setItem(ACTIVE_school_NAME_SS, name);
  if (icon) sessionStorage.setItem(ACTIVE_school_ICON_SS, icon);
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

  // School context sekarang UI-only (BE ambil dari JWT)
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
  window.dispatchEvent(new CustomEvent("school:changed", { detail: null }));
}

/* ==========================================
   🔐 ACCESS TOKEN — sessionStorage
========================================== */
let accessToken: string | null = null;

export function setTokens(access: string) {
  accessToken = access;
  try {
    sessionStorage.setItem("access_token", access);
  } catch {}
  (api.defaults.headers.common as any).Authorization = `Bearer ${access}`;
  window.dispatchEvent(new CustomEvent("auth:authorized"));
}

export function getAccessToken() {
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
}

/* ==========================================
   🚦 REFRESH GUARD
========================================== */
let allowRefresh =
  typeof window !== "undefined"
    ? !/\/login(?:\?|$)/.test(window.location.pathname)
    : true;

export function setAllowRefresh(v: boolean) {
  allowRefresh = v;
}

/* ==========================================
   🔄 CSRF MEM
========================================== */
let csrfTokenMem: string | null = null;

export async function ensureCsrf(): Promise<string | null> {
  if (csrfTokenMem) return csrfTokenMem;

  const fromCookie = getCookie("XSRF-TOKEN");
  if (fromCookie) {
    csrfTokenMem = fromCookie;
    return csrfTokenMem;
  }

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
   🔄 REFRESH TOKEN
========================================== */
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  if (!allowRefresh) return null;
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;

  refreshPromise = (async () => {
    const xsrf = (await ensureCsrf()) || "";

    try {
      const res = await apiNoAuth.post(
        "/auth/refresh-token",
        {},
        {
          headers: {
            "X-CSRF-Token": xsrf,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const newAT = res.data?.data?.access_token ?? null;
      if (newAT) setTokens(newAT);

      const newCookieToken = getCookie("XSRF-TOKEN");
      if (newCookieToken) csrfTokenMem = newCookieToken;

      return newAT;
    } catch (err: any) {
      if (err?.response?.status === 403) {
        await apiNoAuth.get("/auth/csrf", { withCredentials: true });
        csrfTokenMem = getCookie("XSRF-TOKEN") ?? null;

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

        const at2 = res2?.data?.data?.access_token ?? null;
        if (at2) {
          setTokens(at2);
          const newCookie2 = getCookie("XSRF-TOKEN");
          if (newCookie2) csrfTokenMem = newCookie2;
          return at2;
        }
      }

      clearTokens();
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      return null;
    }
  })().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
}

/* ==========================================
   🧩 REQUEST INTERCEPTOR
========================================== */
api.interceptors.request.use(async (config) => {
  if (typeof config.url === "string" && config.url.startsWith("/api/")) {
    config.url = stripApiPrefixAll(config.url);
  }

  const path = normalizePath(String(config.url || ""));
  const method = (config.method || "get").toUpperCase();
  const inAuth = isAuthPath(path);
  const onLogin = isLoginPath(path);
  const onRefresh = isRefreshPath(path);

  // --- Authorization ---
  if (!onLogin && !onRefresh) {
    const at = getAccessToken();
    if (at) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${at}`;
    }
  }

  // --- CSRF ---
  const needsCsrf = !inAuth && !["GET", "HEAD", "OPTIONS"].includes(method);
  if (needsCsrf && !csrfTokenMem) {
    await ensureCsrf();
  }
  if (!inAuth && csrfTokenMem) {
    config.headers = config.headers ?? {};
    (config.headers as any)["X-CSRF-Token"] = csrfTokenMem;
  }

  // --- Content-Type ---
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

    // --- CSRF retry ---
    if (res?.status === 403 && !alreadyRetried && !inAuth) {
      cfg._retried = true;
      try {
        await apiNoAuth.get("/auth/csrf", { withCredentials: true });
        const token = getCookie("XSRF-TOKEN");
        if (token) csrfTokenMem = token;
        cfg.headers = cfg.headers ?? {};
        cfg.headers["X-CSRF-Token"] = csrfTokenMem || "";
        return api(cfg);
      } catch {}
    }

    // --- Refresh retry ---
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
    allowRefresh = false;

    const xsrf = csrfTokenMem || (await ensureCsrf()) || "";

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
  } catch (e) {
    console.warn("[logout] failed:", e);
  } finally {
    clearTokens();
    clearActiveschoolContext();
    window.dispatchEvent(
      new CustomEvent("auth:logout", { detail: { source: "axios" } })
    );
  }
}

export default api;

/* ==========================================
   Utils
========================================== */
export async function restoreSession(): Promise<boolean> {
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
   🔰 BOOTSTRAP
========================================== */
(() => {
  try {
    const saved = sessionStorage.getItem("access_token");
    if (saved) {
      accessToken = saved;
      (api.defaults.headers.common as any).Authorization = `Bearer ${saved}`;
    }
  } catch {}
})();