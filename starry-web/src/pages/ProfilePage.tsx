import React, { useState, useEffect } from 'react';
import { User, Edit3, X, Check, PenTool, BookOpen, ChevronRight, Clock, Github, Mail, Link, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserInfo, Article } from '../types';
import { apiFetch } from '../utils/api';
import { CUTE_COVERS } from '../constants';

export const ProfilePage = ({ user, setUser, onToast, onViewArticle }: { user: UserInfo | null; setUser: (u: UserInfo) => void; onToast: (msg: string, type: 'ok' | 'err') => void; onViewArticle: (id: number) => void }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nickname: user?.nickname || '', avatar: user?.avatar || '', cover: user?.cover || '', bio: user?.bio || '', email: user?.email || '', qq: user?.qq || '', github: user?.github || '' });
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    setForm({ nickname: user?.nickname || '', avatar: user?.avatar || '', cover: user?.cover || '', bio: user?.bio || '', email: user?.email || '', qq: user?.qq || '', github: user?.github || '' });
  }, [user]);

  useEffect(() => {
    if (user) apiFetch('/api/articles').then(r => r.json()).then(data => setArticles((Array.isArray(data) ? data : []).filter((a: Article) => a.user?.id === user.id))).catch(() => {});
  }, [user]);

  const save = async () => {
    setLoading(true);
    try {
      const r = await apiFetch('/api/user/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const d = await r.json();
      if (r.ok) { setUser(d.user); onToast('个人信息已更新', 'ok'); setEditing(false); }
      else onToast(d.error || '保存失败', 'err');
    } catch { onToast('网络错误', 'err'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-32 space-y-16">
      <header className="relative h-96 w-full rounded-[2.5rem] overflow-hidden flex items-end p-12 group/header">
        <div className="absolute inset-0 z-0">
          <img alt="cover" className="w-full h-full object-cover transition-transform duration-1000 group-hover/header:scale-110" src={user?.cover || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2600"} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-amber-500/20 mix-blend-overlay" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-end gap-8 w-full">
          <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-[#0a0b10] shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-surface flex-shrink-0 group/avatar relative">
            {user?.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-on-surface-variant bg-gradient-to-br from-primary/10 to-purple-500/10"><User size={48} /></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
          </div>
          <div className="pb-2 flex-1 space-y-2">
            <h1 className="font-headline text-5xl md:text-6xl italic text-white tracking-tight drop-shadow-2xl">{user?.nickname || user?.username}</h1>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">@{user?.username}</span>
              {user?.github && <span className="text-[10px] uppercase tracking-[0.4em] text-blue-400 font-bold px-3 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 backdrop-blur-md">Developer</span>}
            </div>
          </div>
          <button onClick={() => setEditing(!editing)}
            className="flex items-center gap-3 px-8 py-4 rounded-full vibrant-gradient text-on-primary font-label text-[11px] tracking-widest uppercase font-bold hover:shadow-[0_0_30px_rgba(240,185,82,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl">
            {editing ? <X size={16} /> : <Edit3 size={16} />}
            {editing ? '取消编辑' : '编辑个人资料'}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="overflow-hidden">
            <div className="p-10 rounded-[2rem] bg-surface-container/50 border border-primary/20 backdrop-blur-xl space-y-8 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary"><Edit3 size={24} /></div>
                <h3 className="font-headline text-3xl italic">完善您的叙事身份</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  ['显示昵称', 'nickname', 'text', <User size={16} />],
                  ['头像链接', 'avatar', 'url', <Link size={16} />],
                  ['联系邮箱', 'email', 'email', <Mail size={16} />],
                  ['QQ 账号', 'qq', 'text', <MessageCircle size={16} />],
                  ['GitHub 地址', 'github', 'url', <Github size={16} />],
                  ['背景图链接', 'cover', 'url', <ImageIcon size={16} />]
                ].map(([label, key, type, icon]) => (
                  <div key={key as string} className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold flex items-center gap-2">
                      {icon as React.ReactNode} {label as string}
                    </label>
                    <input type={type as string} value={(form as Record<string, string>)[key as string]} onChange={e => setForm(f => ({ ...f, [key as string]: e.target.value }))}
                      className="w-full bg-surface/40 border border-white/5 rounded-2xl px-5 py-4 focus:border-primary/50 focus:bg-surface/60 outline-none transition-all text-white placeholder:text-white/10 shadow-inner" placeholder={label as string} />
                  </div>
                ))}
              </div>

              {/* 快速选择可爱背景 */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold flex items-center gap-2">
                  ✨ 快速选择可爱背景
                </label>
                <div className="flex flex-wrap gap-3">
                  {CUTE_COVERS.map(cover => (
                    <button key={cover.name} onClick={() => setForm(f => ({ ...f, cover: cover.url }))}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${form.cover === cover.url ? 'bg-primary/20 border-primary text-primary' : 'bg-surface/40 border-white/5 text-on-surface-variant hover:border-primary/30'}`}>
                      {cover.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold flex items-center gap-2">
                  <PenTool size={16} /> 个人简介
                </label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4}
                  className="w-full bg-surface/40 border border-white/5 rounded-2xl px-5 py-4 focus:border-primary/50 focus:bg-surface/60 outline-none transition-all text-white placeholder:text-white/10 resize-none shadow-inner" placeholder="用一两句话描述您的叙事风格..." />
              </div>
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
                <button onClick={save} disabled={loading}
                  className="flex items-center gap-3 px-10 py-4 bg-primary text-on-primary rounded-full font-label text-[11px] tracking-widest uppercase font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20">
                  {loading ? '同步中...' : <><Check size={16} /> 保存所有更改</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          {user?.bio && (
            <section className="space-y-6">
              <h3 className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold flex items-center gap-2"><PenTool size={14} className="text-primary" /> 个人简介</h3>
              <div className="p-10 rounded-[2rem] article-card-surface relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity"><PenTool size={80} /></div>
                <p className="text-on-surface text-xl leading-relaxed italic font-body font-light relative z-10">{user.bio}</p>
              </div>
            </section>
          )}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold flex items-center gap-2"><BookOpen size={14} className="text-primary" /> 我的叙事 ({articles.length})</h3>
              <button onClick={() => onViewArticle(articles[0]?.id)} className="text-[10px] uppercase tracking-widest text-primary font-bold hover:underline">浏览全部作品</button>
            </div>
            {articles.length === 0 ? (
              <div className="p-20 text-center rounded-[2rem] border border-dashed border-white/10">
                <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-on-surface-variant/40 italic">笔尖尚且静默，等待您的第一章...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {articles.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} onClick={() => onViewArticle(a.id)}
                    className="p-8 article-card-surface flex items-center justify-between cursor-pointer group">
                    <div className="space-y-3">
                      <h4 className="font-headline text-2xl italic group-hover:text-gradient-vibrant transition-all">{a.title}</h4>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-on-surface-variant/30 flex items-center gap-1"><Clock size={12} /> {new Date(a.created_at).toLocaleDateString('zh-CN')}</span>
                        <span className="text-[10px] text-primary/50 font-bold uppercase tracking-widest">阅读全文 →</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary/20 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-transparent group-hover:border-primary/20">
                      <ChevronRight size={20} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
        <aside className="lg:col-span-4 space-y-8">
          <div className="p-10 rounded-[2.5rem] bg-surface-container border border-white/5 space-y-10 sticky top-32 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            <h3 className="font-headline text-2xl italic relative z-10">叙事数据</h3>
            <div className="grid grid-cols-1 gap-6 relative z-10">
              <div className="p-6 rounded-3xl stat-card-teal group transition-transform hover:-translate-y-1">
                <p className="text-4xl font-headline italic text-primary mb-1">{articles.length}</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">已发布篇章</p>
              </div>
              <div className="p-6 rounded-3xl stat-card-blue group transition-transform hover:-translate-y-1">
                <p className="text-4xl font-headline italic text-blue-400 mb-1">1.2k</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">被阅读次数</p>
              </div>
              <div className="p-6 rounded-3xl stat-card-purple group transition-transform hover:-translate-y-1">
                <p className="text-4xl font-headline italic text-purple-400 mb-1">156</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">收获的共鸣</p>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/5 space-y-6 relative z-10">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">数字足迹</p>
              <div className="flex flex-col gap-3">
                {user?.github && (
                  <a href={user.github} className="flex items-center gap-4 p-4 rounded-2xl bg-surface/50 border border-white/5 hover:border-blue-400/30 transition-all group">
                    <div className="p-2 rounded-lg bg-blue-400/10 text-blue-400"><Github size={18} /></div>
                    <span className="text-xs font-label text-on-surface-variant/80 group-hover:text-white transition-colors">GitHub 档案</span>
                  </a>
                )}
                {user?.email && (
                  <a href={`mailto:${user.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-surface/50 border border-white/5 hover:border-primary/30 transition-all group">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary"><Mail size={18} /></div>
                    <span className="text-xs font-label text-on-surface-variant/80 group-hover:text-white transition-colors">发送邮件</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
