import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, User, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Collection, Article } from '../types';
import { apiFetch } from '../utils/api';

export const CollectionDetailPage = ({ colId, onViewArticle, onBack }: { colId: number; onViewArticle: (id: number) => void; onBack: () => void }) => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    console.log('[CollectionDetail] Loading articles for colId:', colId);
    try {
      // 获取合集信息
      const [cRes, aRes] = await Promise.all([
        apiFetch('/api/collections'),
        apiFetch(`/api/collections/${colId}/articles`)
      ]);
      
      if (cRes.ok && aRes.ok) {
        const cols = await cRes.json();
        const arts = await aRes.json();
        console.log('[CollectionDetail] Articles received:', arts);
        const target = cols.find((c: any) => c.id === colId);
        setCollection(target);
        setArticles(Array.isArray(arts) ? arts : []);
      }
    } catch (err) {
      console.error('[CollectionDetail] Load error:', err);
    } finally { setLoading(false); }
  }, [colId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="p-32 text-center text-primary italic animate-pulse">调取星枢合集数据中...</div>;

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-32 space-y-16">
      <header className="space-y-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-on-surface-variant/40 hover:text-primary transition-colors font-label text-[10px] uppercase tracking-widest group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 返回合集列表
        </button>
        <div className="space-y-2">
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">合集归档</h2>
          <h1 className="font-headline text-6xl italic leading-tight text-white">{collection?.title || '未命名合集'}</h1>
          <p className="text-on-surface-variant/60 max-w-2xl text-lg italic leading-relaxed">{collection?.description || '暂无描述'}</p>
        </div>
        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={14} />
            </div>
            <span className="text-xs font-bold text-on-surface-variant/60">创建者：{collection?.user?.nickname || collection?.user?.username}</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">{articles.length} 篇叙事</span>
        </div>
      </header>

      <section>
        {articles.length === 0 ? (
          <div className="p-20 text-center rounded-[2rem] border border-dashed border-white/10">
            <BookOpen size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-on-surface-variant/40 italic">笔尖尚且静默，合集中暂无篇章...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }} onClick={() => onViewArticle(a.id)}
                className="group article-card-surface p-8 space-y-4 cursor-pointer">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-primary/30 text-xs select-none">#{String(i + 1).padStart(2, '0')}</span>
                  <p className="text-[10px] text-on-surface-variant/30">{new Date(a.created_at).toLocaleDateString('zh-CN')}</p>
                </div>
                <h3 className="font-headline text-2xl italic group-hover:text-primary transition-colors line-clamp-2">{a.title}</h3>
                <p className="text-sm text-on-surface-variant/60 line-clamp-3 leading-relaxed">{a.content?.replace(/[#*`]/g, '').slice(0, 100)}...</p>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {a.user?.avatar ? <img src={a.user.avatar} className="w-5 h-5 rounded-full object-cover" /> : <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary"><User size={10} /></div>}
                    <span className="text-[10px] text-on-surface-variant/40 font-bold">{a.user?.nickname || a.user?.username}</span>
                  </div>
                  <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase tracking-widest">阅读全文 →</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
