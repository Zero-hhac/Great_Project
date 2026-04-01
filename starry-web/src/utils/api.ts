const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD 
  ? 'https://api.hahahahaha.icu' 
  : '');

export async function apiFetch(path: string, opts?: RequestInit) {
  const r = await fetch(API + path, { credentials: 'include', ...opts });
  return r;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}
