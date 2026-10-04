const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

/**
 * Convierte una ruta relativa del backend (/api/images/123/raw, /uploads/x.jpg)
 * en una URL absoluta apuntando al API. data:/https:/blob: se devuelven igual.
 */
export function imgSrc(url) {
  if (!url || typeof url !== "string") return "";
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return url;
}

export default imgSrc;
