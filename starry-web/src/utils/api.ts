const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD 
  ? 'https://great-project-3j4m.onrender.com' 
  : '');

export async function apiFetch(path: string, opts?: RequestInit) {
  // 如果路径以 /api/ 开头，但在生产环境，我们需要去掉它，因为后端没带 /api
  const finalPath = import.meta.env.PROD ? path.replace(/^\/api/, '') : path;
  const r = await fetch(API + finalPath, { credentials: 'include', ...opts });
  return r;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}
