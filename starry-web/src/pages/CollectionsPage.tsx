import React, { useState, useEffect, useCallback } from 'react';
import { Library, Plus, X, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collection } from '../types';
import { apiFetch } from '../utils/api';

export const CollectionsPage = ({ onToast, onViewCollection }: { onToast: (msg: string, type: 'ok' | 'err') => void; onViewCollection: (id: number) => void }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCol, setNewCol] = useState({ title: '', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch('/api/collections');
      if (r.ok) {
        const data = await r.json();
        setCollections(Array.isArray(data) ? data : []);
      }
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!newCol.title.trim()) return;
    try {
      const r = await apiFetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCol)
      });
      if (r.ok) {
        onToast('合集创建成功', 'ok');
        setNewCol({ title: '', description: '' });
        setShowCreate(false);
        load();
      }
    } catch { onToast('创建失败', 'err'); }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-32 space-y-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">精选合集</h2>
          <h1 className="font-headline text-6xl italic leading-tight">叙事的主题</h1>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 text-primary rounded-full font-label text-[10px] tracking-widest uppercase font-bold hover:bg-primary/20 transition-all">
          <Plus size={16} /> 创建新合集
        </button>
      </header>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="p-8 rounded-3xl bg-surface-container border border-primary/20 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-2xl italic">定义新的叙事维度</h3>
              <button onClick={() => setShowCreate(false)} className="text-on-surface-variant/40 hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">合集名称</label>
                <input type="text" value={newCol.title} onChange={e => setNewCol(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-surface/50 border border-white/5 rounded-xl px-4 py-3 focus:border-primary/30 outline-none text-sm" placeholder="例如：极简主义..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">描述</label>
                <input type="text" value={newCol.description} onChange={e => setNewCol(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-surface/50 border border-white/5 rounded-xl px-4 py-3 focus:border-primary/30 outline-none text-sm" placeholder="简短描述这个合集的灵魂..." />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={create} className="px-8 py-3 bg-primary text-on-primary rounded-full font-label text-[10px] tracking-widest uppercase font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">确认创建</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-20 text-on-surface-variant/30 italic">寻找主题中...</div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20 article-card-surface">
          <Library size={48} className="mx-auto mb-4 opacity-10" />
          <p className="text-on-surface-variant/40 italic">尚无合集，点击上方按钮开启新的叙事维度</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {collections.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => onViewCollection(c.id)}
              className="group article-card-surface p-12 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-12">
                <span className="font-mono text-primary text-sm opacity-40 select-none">{String(i + 1).padStart(2, '0')}</span>
                <div className="space-y-2">
                  <h3 className="font-headline text-4xl italic group-hover:text-primary transition-colors">{c.title}</h3>
                  <p className="text-sm text-on-surface-variant/60 max-w-md leading-relaxed">{c.description || '这个合集还未被定义。'}</p>
                  <div className="flex items-center gap-2 pt-2 text-[10px] text-on-surface-variant/30 uppercase tracking-widest font-bold">
                    <User size={10} /> {c.user?.nickname || c.user?.username}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">归档于此</span>
                <ChevronRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
