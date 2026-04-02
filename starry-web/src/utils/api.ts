const API = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path: string, opts?: RequestInit) {
  // 在生产环境下，不再删除 /api 前缀，因为我们要靠 Nginx 的 location /api/ 来转发
  const finalPath = path;
  
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
