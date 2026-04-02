import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Page, Collection } from '../types';
import { apiFetch } from '../utils/api';

export const WritePage = ({ onToast, onNavigate }: { onToast: (msg: string, type: 'ok' | 'err') => void; onNavigate: (p: Page) => void }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);

  useEffect(() => {
    apiFetch('/api/collections').then(r => r.json()).then(data => setCollections(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const publish = async () => {
    if (!title.trim() || !content.trim()) { onToast('标题和内容不能为空', 'err'); return; }
    setLoading(true);
    try {
      const r = await apiFetch('/api/articles/create', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ title, content, collection_id: selectedCol }) 
      });
      if (r.ok) { 
        const data = await r.json();
        if (data.review_status === 0) {
          onToast('文章已提交，等待管理员审核', 'ok');
        } else {
          onToast('发布成功！', 'ok');
        }
        setTitle(''); setContent(''); 
        onNavigate('stories'); 
      }
      else { const d = await r.json(); onToast(d.error || '发布失败', 'err'); }
    } catch { onToast('网络错误', 'err'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-32 space-y-16">
      <header className="space-y-4">
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">创作中心</h2>
        <h1 className="font-headline text-6xl italic">书写您的叙事</h1>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">标题</label>
            <input type="text" placeholder="输入您的标题..." value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-transparent border-b border-white/10 py-4 font-headline text-4xl italic focus:border-primary outline-none transition-colors placeholder:text-white/10" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">归属合集（可选）</label>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedCol(null)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${selectedCol === null ? 'bg-primary/20 border-primary text-primary' : 'bg-surface/40 border-white/5 text-on-surface-variant hover:border-primary/30'}`}>
                无合集
              </button>
              {collections.map(c => (
                <button key={c.id} onClick={() => setSelectedCol(c.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${selectedCol === c.id ? 'bg-primary/20 border-primary text-primary' : 'bg-surface/40 border-white/5 text-on-surface-variant hover:border-primary/30'}`}>
                  {c.title}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">正文（支持 Markdown）</label>
            <textarea placeholder="开始您的创作..." value={content} onChange={e => setContent(e.target.value)}
              className="w-full bg-transparent border border-white/5 rounded-xl p-8 min-h-[500px] text-lg leading-relaxed focus:border-primary/30 outline-none transition-colors placeholder:text-white/10 resize-none" />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={publish} disabled={loading}
              className="flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-full font-label text-[10px] tracking-widest uppercase font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
              <Send size={16} />{loading ? '发布中...' : '发布作品'}
            </button>
            <button onClick={() => { setTitle(''); setContent(''); }} className="px-8 py-4 border border-white/10 text-on-surface-variant rounded-full font-label text-[10px] tracking-widest uppercase font-bold hover:bg-surface transition-colors">清空</button>
          </div>
        </div>
        <aside className="lg:col-span-4">
          <div className="p-8 rounded-xl bg-surface-container border border-white/5 space-y-4 sticky top-32">
            <h3 className="font-headline text-2xl italic">写作提示</h3>
            <div className="space-y-3 text-sm text-on-surface-variant/60">
              <p>• 支持 <span className="text-primary">Markdown</span> 格式</p>
              <p>• <code className="bg-surface px-1 rounded text-[11px]">**粗体**</code> 或 <code className="bg-surface px-1 rounded text-[11px]">*斜体*</code></p>
              <p>• <code className="bg-surface px-1 rounded text-[11px]"># 标题</code> 添加层级标题</p>
              <p>• 字数：{content.length} 字</p>
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] text-on-surface-variant/30 italic">"写作是唯一的、真正的自由。"</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
