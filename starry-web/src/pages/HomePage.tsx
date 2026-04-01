import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import { Page, Article } from '../types';
import { apiFetch } from '../utils/api';

export const HomePage = ({ onNavigate, onViewArticle }: { onNavigate: (p: Page) => void; onViewArticle: (id: number) => void }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  useEffect(() => {
    apiFetch('/api/articles').then(r => r.json()).then(data => setArticles(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto px-8 pt-32 pb-24 space-y-20">
      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] tracking-[0.2em] uppercase font-bold">最新叙事</div>
        <h1 className="font-headline text-6xl md:text-8xl italic leading-[1.1] text-white">Fade Under</h1>
        <p className="text-on-surface-variant/60 max-w-xl text-lg leading-relaxed">记录生命中那些值得被铭记的瞬间，用文字构建属于你的数字避风港。</p>
        <button onClick={() => onNavigate('write')} className="flex items-center gap-3 px-8 py-4 bg-primary text-on-primary rounded-full font-label text-[10px] tracking-widest uppercase font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
          <PenTool size={16} />开始写作
        </button>
      </header>
      <section>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">近期文章</h2>
          <button onClick={() => onNavigate('stories')} className="text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors font-bold flex items-center gap-1">查看全部 <ChevronRight size={14} /></button>
        </div>
        {articles.length === 0 ? (
          <div className="text-center py-24 text-on-surface-variant/40">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-headline text-2xl italic">还没有文章</p>
            <p className="text-sm mt-2">成为第一个开始叙事的人</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(0, 6).map(a => (
              <motion.div key={a.id} whileHover={{ scale: 1.02 }} onClick={() => onViewArticle(a.id)}
                className="group article-card-surface p-8 space-y-4 cursor-pointer">
                <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{a.user?.nickname || '作者'}</p>
                <h3 className="font-headline text-2xl italic group-hover:text-primary transition-colors line-clamp-2">{a.title}</h3>
                <p className="text-sm text-on-surface-variant/60 line-clamp-3 leading-relaxed">{a.content?.replace(/[#*`]/g, '').slice(0, 120)}...</p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-on-surface-variant/30">{new Date(a.created_at).toLocaleDateString('zh-CN')}</p>
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
