const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD 
  ? `https://api.${window.location.hostname.replace('www.', '')}` 
  : '');

export async function apiFetch(path: string, opts?: RequestInit) {
  // 如果路径以 /api/ 开头，但在生产环境，我们需要去掉它，因为后端没带 /api
  const finalPath = import.meta.env.PROD ? path.replace(/^\/api/, '') : path;
  
  // 添加超时处理
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000); // 15秒超时

  try {
    const r = await fetch(API + finalPath, { 
      credentials: 'include', 
      signal: controller.signal,
      ...opts 
    });
    clearTimeout(id);
    return r;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}
