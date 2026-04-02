import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Library, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserInfo, Article, Collection } from '../types';
import { apiFetch } from '../utils/api';

export const StoriesPage = ({ user, onToast, onViewArticle }: { user: UserInfo | null; onToast: (msg: string, type: 'ok' | 'err') => void; onViewArticle: (id: number) => void }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showArchive, setShowArchive] = useState<number | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [archiving, setArchiving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch('/api/articles').then(r => r.json()).then(data => setArticles(Array.isArray(data) ? data : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const fetchCollections = async () => {
    try {
      const r = await apiFetch('/api/collections');
      if (r.ok) setCollections(await r.json());
    } catch { }
  };

  const archiveTo = async (article: Article, colId: number | null) => {
    setArchiving(true);
    try {
      const r = await apiFetch(`/api/articles/edit/${article.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          collection_id: colId
        })
      });
      if (r.ok) {
        onToast(colId ? '文章已成功归档' : '文章已从合集移除', 'ok');
        setShowArchive(null);
        load();
      }
    } catch { onToast('网络错误', 'err'); } finally { setArchiving(false); }
  };

  const del = async (id: number) => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    setDeleting(id);
    try {
      const r = await apiFetch(`/articles/delete/${id}`, { method: 'POST' });
      if (r.ok || r.redirected) { onToast('删除成功', 'ok'); load(); }
      else onToast('删除失败', 'err');
    } catch { onToast('网络错误', 'err'); } finally { setDeleting(null); }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-32 space-y-16">
      <header className="space-y-4">
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">故事库</h2>
        <h1 className="font-headline text-6xl italic">时间的长河</h1>
      </header>
      {loading ? (
        <div className="text-center py-24 text-on-surface-variant/40">加载中...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-24 text-on-surface-variant/40">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-headline text-2xl italic">暂无文章</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {articles.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="group article-card-surface p-10 flex items-start justify-between cursor-pointer"
              onClick={() => onViewArticle(a.id)}>
              <div className="flex items-start gap-8">
                <span className="font-mono text-primary text-sm opacity-40 mt-1 select-none">{String(i + 1).padStart(2, '0')}</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{a.user?.nickname || '作者'}</p>
                    {a.review_status === 0 && <span className="text-[9px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20 font-bold uppercase tracking-tighter">待审核</span>}
                    {a.review_status === 2 && <span className="text-[9px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20 font-bold uppercase tracking-tighter">已驳回</span>}
                  </div>
                  <h3 className="font-headline text-3xl italic group-hover:text-primary transition-colors">{a.title}</h3>
                  <p className="text-sm text-on-surface-variant/70 max-w-xl line-clamp-2 leading-relaxed">{a.content?.replace(/[#*`]/g, '').slice(0, 150)}...</p>
                  <div className="flex items-center gap-4 pt-2">
                    <p className="text-[10px] text-on-surface-variant/40">{new Date(a.created_at).toLocaleDateString('zh-CN')}</p>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">点击阅读 →</span>
                  </div>
                </div>
              </div>
              {user && (user.id === a.user?.id || user.username === 'admin') && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-1" onClick={e => e.stopPropagation()}>
                  <div className="relative">
                    <button onClick={e => { e.stopPropagation(); if (showArchive === a.id) setShowArchive(null); else { setShowArchive(a.id); fetchCollections(); } }}
                      className={`p-2 rounded-lg transition-colors ${a.collection_id ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10 text-on-surface-variant hover:text-primary'}`}>
                      <Library size={16} />
                    </button>
                    <AnimatePresence>
                      {showArchive === a.id && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-56 p-3 rounded-xl bg-surface-container border border-primary/20 shadow-2xl z-50 backdrop-blur-xl">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40 mb-3 border-b border-white/5 pb-2">归档至合集</p>
                          <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
                            <button onClick={() => archiveTo(a, null)} className={`w-full text-left px-3 py-2 rounded-lg text-[11px] transition-all flex items-center justify-between ${!a.collection_id ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-on-surface-variant hover:text-primary'}`}>
                              <span>移出合集</span>
                              {!a.collection_id && <Check size={10} />}
                            </button>
                            {collections.map(c => (
                              <button key={c.id} onClick={() => archiveTo(a, c.id)} className={`w-full text-left px-3 py-2 rounded-lg text-[11px] transition-all flex items-center justify-between ${a.collection_id === c.id ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-on-surface-variant hover:text-primary'}`}>
                                <span className="truncate">{c.title}</span>
                                {a.collection_id === c.id && <Check size={10} />}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <button onClick={e => { e.stopPropagation(); del(a.id); }} disabled={deleting === a.id}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
