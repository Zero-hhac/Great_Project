import React, { useState, useEffect, useCallback } from 'react';
import { Home, BookOpen, Library, Settings, Mail, Share2, Heart, Github, ThumbsUp, Search, Menu, Bookmark, User, ChevronRight, PenTool, Send, LogOut, Edit3, Trash2, Plus, X, Check, AlertCircle, ArrowLeft, Clock, MessageSquare, MessageCircle, Link, Image as ImageIcon, Shield, BarChart3, Users, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────
type Page = 'home' | 'stories' | 'collections' | 'write' | 'settings' | 'profile' | 'article' | 'admin';
type AuthPage = 'login' | 'register';

interface UserInfo { id: number; username: string; nickname: string; avatar: string; cover?: string; bio: string; email?: string; qq?: string; github?: string; }
interface Article { id: number; title: string; content: string; created_at: string; user: UserInfo; likes_count: number; is_liked: boolean; }
interface Comment { id: number; content: string; created_at: string; user: UserInfo; likes_count: number; is_liked: boolean; }

const PAGE_BGS: Record<Page, string> = {
  home: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&q=80&w=2600',
  stories: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=2600',
  collections: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2600',
  write: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2600',
  settings: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2600',
  profile: 'https://images.unsplash.com/photo-1506744626753-1fa44df62243?auto=format&fit=crop&q=80&w=2600',
  article: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2600',
  admin: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2600'
};

// ─── API helpers ─────────────────────────────────────────────────────────────
const API = 'http://localhost:8080';

async function apiFetch(path: string, opts?: RequestInit) {
  const r = await fetch(API + path, { credentials: 'include', ...opts });
  return r;
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: 'ok' | 'err'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${type === 'ok' ? 'bg-green-900/80 border-green-500/30 text-green-300' : 'bg-red-900/80 border-red-500/30 text-red-300'}`}>
      {type === 'ok' ? <Check size={16} /> : <AlertCircle size={16} />}
      <span className="text-sm font-medium">{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
    </motion.div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) => (
  <button onClick={onClick}
    className={`group flex items-center gap-4 py-3 px-4 rounded-lg transition-all hover:translate-x-1 duration-200 w-full text-left ${active ? 'text-primary bg-surface/50' : 'text-on-surface-variant hover:bg-surface-container'}`}>
    <span className={active ? 'text-primary' : ''}>{icon}</span>
    <span className="font-label tracking-widest uppercase text-[10px] font-medium">{label}</span>
  </button>
);

const Sidebar = ({ activePage, onNavigate, user }: { activePage: Page; onNavigate: (p: Page) => void; user: UserInfo | null }) => (
  <aside className="hidden lg:flex flex-col w-80 p-8 gap-10 fixed left-0 top-0 h-full border-r border-white/5 z-50 overflow-hidden shadow-2xl">
    <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(16, 16, 18, 0.8), rgba(16, 16, 18, 0.95)), url("https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
    <div className="flex flex-col gap-2 relative z-10">
      <span className="text-xl font-headline italic text-primary cursor-pointer" onClick={() => onNavigate('home')}>宏大叙事</span>
      <p className="text-[10px] font-label tracking-[0.3em] uppercase text-on-surface-variant/40">数字避风港</p>
    </div>
    <nav className="flex flex-col gap-1 relative z-10">
      <NavItem icon={<Home size={18} />} label="首页" active={activePage === 'home'} onClick={() => onNavigate('home')} />
      <NavItem icon={<BookOpen size={18} />} label="故事" active={activePage === 'stories'} onClick={() => onNavigate('stories')} />
      <NavItem icon={<Library size={18} />} label="合集" active={activePage === 'collections'} onClick={() => onNavigate('collections')} />
      <NavItem icon={<PenTool size={18} />} label="写作" active={activePage === 'write'} onClick={() => onNavigate('write')} />
      {user?.username === 'admin' && <NavItem icon={<Shield size={18} />} label="管理" active={activePage === 'admin'} onClick={() => onNavigate('admin')} />}
      <NavItem icon={<Settings size={18} />} label="设置" active={activePage === 'settings'} onClick={() => onNavigate('settings')} />
    </nav>
    <div className="mt-auto flex flex-col gap-6 relative z-10">
      <div className={`p-6 rounded-xl bg-surface/30 border border-outline/10 cursor-pointer hover:bg-surface/50 transition-all group ${activePage === 'profile' ? 'border-primary/50' : ''}`} onClick={() => onNavigate('profile')}>
        <div className="flex items-center gap-3 mb-4">
          {user?.avatar ? <img className="w-10 h-10 rounded-full object-cover" src={user.avatar} alt="avatar" /> : <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"><User size={18} /></div>}
          <div>
            <p className="text-sm font-headline group-hover:text-primary transition-colors">{user?.nickname || '用户'}</p>
            <p className="text-[10px] tracking-tighter text-on-surface-variant uppercase">@{user?.username}</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
);

const MobileNavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-on-surface-variant/60'}`}>
    {icon}<span className="text-[8px] font-label uppercase tracking-tighter">{label}</span>
  </button>
);

const MobileNav = ({ activePage, onNavigate }: { activePage: Page; onNavigate: (p: Page) => void }) => (
  <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 overflow-hidden shadow-2xl border-t border-white/5">
    <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(16, 16, 18, 0.92), rgba(16, 16, 18, 0.98)), url("https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=1200")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
    <div className="flex justify-around items-center p-4 relative z-10">
      <MobileNavItem icon={<Home size={20} />} label="首页" active={activePage === 'home'} onClick={() => onNavigate('home')} />
      <MobileNavItem icon={<BookOpen size={20} />} label="故事" active={activePage === 'stories'} onClick={() => onNavigate('stories')} />
      <MobileNavItem icon={<PenTool size={20} />} label="写作" active={activePage === 'write'} onClick={() => onNavigate('write')} />
      {user?.username === 'admin' && <MobileNavItem icon={<Shield size={20} />} label="管理" active={activePage === 'admin'} onClick={() => onNavigate('admin')} />}
      <MobileNavItem icon={<Library size={20} />} label="合集" active={activePage === 'collections'} onClick={() => onNavigate('collections')} />
      <MobileNavItem icon={<Settings size={20} />} label="设置" active={activePage === 'settings'} onClick={() => onNavigate('settings')} />
    </div>
  </nav>
);

// ─── UserMenu ────────────────────────────────────────────────────────────────
const UserMenu = ({ onNavigate, user, onLogout }: { onNavigate: (p: Page) => void; user: UserInfo | null; onLogout: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 text-primary hover:opacity-80 transition-all"><Menu size={20} /></button>
      <AnimatePresence>
        {open && (<>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-4 w-64 bg-surface-container border border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                {user?.avatar ? <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-primary/20" /> : <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"><User size={18} /></div>}
                <div>
                  <p className="text-sm font-headline">{user?.nickname || '用户'}</p>
                  <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">@{user?.username}</p>
                </div>
              </div>
            </div>
            <div className="p-2">
              <button onClick={() => { onNavigate('profile'); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface transition-colors text-left group">
                <User size={18} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-label uppercase tracking-widest font-bold">个人主页</span>
              </button>
              {user?.username === 'admin' && (
                <button onClick={() => { onNavigate('admin'); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-primary transition-colors text-left group">
                  <Shield size={18} />
                  <span className="text-[10px] font-label uppercase tracking-widest font-bold">管理后台</span>
                </button>
              )}
              <button onClick={() => { onNavigate('write'); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface transition-colors text-left group">
                <PenTool size={18} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-label uppercase tracking-widest font-bold">写文章</span>
              </button>
              <button onClick={() => { onNavigate('settings'); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface transition-colors text-left group">
                <Settings size={18} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-label uppercase tracking-widest font-bold">偏好设置</span>
              </button>
            </div>
            <div className="p-2 border-t border-white/5">
              <button onClick={() => { onLogout(); setOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors text-left group">
                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                <span className="text-[10px] font-label uppercase tracking-widest font-bold">退出登录</span>
              </button>
            </div>
          </motion.div>
        </>)}
      </AnimatePresence>
    </div>
  );
};

const TopBar = ({ onNavigate, user, onLogout }: { onNavigate: (p: Page) => void; user: UserInfo | null; onLogout: () => void }) => (
  <header className="lg:hidden sticky top-0 w-full z-50 shadow-md">
    <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(16, 16, 18, 0.9), rgba(16, 16, 18, 0.98)), url("https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=2000")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
    <div className="flex justify-between items-center px-6 py-4 relative z-10">
      <h1 className="font-headline italic text-xl text-on-surface cursor-pointer" onClick={() => onNavigate('home')}>宏大叙事</h1>
      <div className="flex items-center gap-2">
        <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><Search size={20} /></button>
        <UserMenu onNavigate={onNavigate} user={user} onLogout={onLogout} />
      </div>
    </div>
  </header>
);

const DesktopTopBar = ({ onNavigate, user, onLogout }: { onNavigate: (p: Page) => void; user: UserInfo | null; onLogout: () => void }) => (
  <nav className="fixed top-0 w-full z-50 lg:pl-80 shadow-md">
    <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(16, 16, 18, 0.92), rgba(16, 16, 18, 0.98)), url("https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=2000")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
    <div className="flex justify-between items-center px-8 h-20 w-full max-w-screen-2xl mx-auto relative z-10">
      <div className="text-2xl font-headline text-primary italic cursor-pointer" onClick={() => onNavigate('home')}>宏大叙事</div>
      <div className="hidden md:flex items-center gap-8">
        <button onClick={() => onNavigate('stories')} className="text-on-surface-variant hover:text-on-surface transition-colors font-label text-[10px] tracking-widest uppercase">随笔</button>
        <button onClick={() => onNavigate('collections')} className="text-on-surface-variant hover:text-on-surface transition-colors font-label text-[10px] tracking-widest uppercase">归档</button>
        <button onClick={() => onNavigate('write')} className="text-on-surface-variant hover:text-on-surface transition-colors font-label text-[10px] tracking-widest uppercase">写作</button>
        <UserMenu onNavigate={onNavigate} user={user} onLogout={onLogout} />
      </div>
    </div>
  </nav>
);

// ─── Auth pages ───────────────────────────────────────────────────────────────
const AuthPage = ({ onLogin }: { onLogin: (u: UserInfo) => void }) => {
  const [mode, setMode] = useState<AuthPage>('login');
  const [form, setForm] = useState({ username: '', password: '', nickname: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    setError(''); setLoading(true);
    try {
      const path = mode === 'login' ? '/api/login' : '/api/register';
      const body: Record<string, string> = { username: form.username, password: form.password };
      if (mode === 'register') body.nickname = form.nickname || form.username;
      const r = await apiFetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await r.json();
      if (!r.ok) { setError(data.error || '操作失败'); return; }
      // Fetch user profile
      const pr = await apiFetch('/api/user/profile');
      const user = await pr.json();
      onLogin(user);
    } catch { setError('网络错误，请检查后端服务'); } finally { setLoading(false); }
  };

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        onKeyDown={e => e.key === 'Enter' && handle()}
        className="w-full bg-surface/30 border border-white/5 rounded-xl p-4 focus:border-primary/50 outline-none transition-all placeholder:text-white/10 text-white"
        placeholder={type === 'password' ? '••••••••' : label} />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2600" className="w-full h-full object-cover" alt="bg" />
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-10 relative z-10">
        <div className="text-center space-y-3">
          <div className="text-3xl font-headline text-primary italic tracking-tight">宏大叙事</div>
          <h1 className="font-headline text-5xl italic text-white">{mode === 'login' ? '继续您的叙事' : '加入叙事'}</h1>
        </div>
        <div className="space-y-5">
          {field('用户名', 'username')}
          {mode === 'register' && field('昵称（可选）', 'nickname')}
          {field('密码', 'password', 'password')}
          {error && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle size={14} />{error}</p>}
          <button onClick={handle} disabled={loading}
            className="w-full py-4 bg-primary text-on-primary rounded-xl font-label text-[10px] tracking-widest uppercase font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-primary/20">
            {loading ? '请稍候...' : mode === 'login' ? '登录账户' : '立即注册'}
          </button>
        </div>
        <p className="text-center text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-primary hover:underline ml-1">{mode === 'login' ? '立即注册' : '返回登录'}</button>
        </p>
      </motion.div>
    </div>
  );
};

// ─── Home page ────────────────────────────────────────────────────────────────
const HomePage = ({ onNavigate, onViewArticle }: { onNavigate: (p: Page) => void; onViewArticle: (id: number) => void }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  useEffect(() => {
    apiFetch('/api/articles').then(r => r.json()).then(data => setArticles(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto px-8 pt-32 pb-24 space-y-20">
      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] tracking-[0.2em] uppercase font-bold">最新叙事</div>
        <h1 className="font-headline text-6xl md:text-8xl italic leading-[1.1] text-white">宏大叙事</h1>
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

// ─── Stories page ─────────────────────────────────────────────────────────────
const StoriesPage = ({ user, onToast, onViewArticle }: { user: UserInfo | null; onToast: (msg: string, type: 'ok' | 'err') => void; onViewArticle: (id: number) => void }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch('/api/articles').then(r => r.json()).then(data => setArticles(Array.isArray(data) ? data : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

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
                  <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{a.user?.nickname || '作者'}</p>
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

// ─── Article Detail page ──────────────────────────────────────────────────────
const ArticleDetailPage = ({ articleId, user, onToast, onBack }: { articleId: number; user: UserInfo | null; onToast: (msg: string, type: 'ok' | 'err') => void; onBack: () => void }) => {
  const [data, setData] = useState<{ article: Article; content: string; comments: Comment[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch(`/api/articles/${articleId}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [articleId]);

  useEffect(() => { load(); window.scrollTo(0, 0); }, [load]);

  const postComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const r = await apiFetch('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: articleId, content: comment }),
      });
      if (r.ok) { setComment(''); onToast('评论成功', 'ok'); load(); }
      else { const d = await r.json(); onToast(d.error || '评论失败', 'err'); }
    } catch { onToast('网络错误', 'err'); } finally { setPosting(false); }
  };

  const toggleArticleLike = async () => {
    if (!user) { onToast('请先登录', 'err'); return; }
    try {
      const r = await apiFetch(`/api/articles/${articleId}/like`, { method: 'POST' });
      const d = await r.json();
      if (r.ok) {
        setData(prev => prev ? { ...prev, article: { ...prev.article, is_liked: d.status === 'liked', likes_count: d.likes_count } } : null);
      } else { onToast(d.error || '操作失败', 'err'); }
    } catch { onToast('网络错误', 'err'); }
  };

  const toggleCommentLike = async (commentId: number) => {
    if (!user) { onToast('请先登录', 'err'); return; }
    try {
      const r = await apiFetch(`/api/comments/${commentId}/like`, { method: 'POST' });
      const d = await r.json();
      if (r.ok) {
        setData(prev => prev ? {
          ...prev,
          comments: prev.comments.map(c => c.id === commentId ? { ...c, is_liked: d.status === 'liked', likes_count: d.likes_count } : c)
        } : null);
      } else { onToast(d.error || '操作失败', 'err'); }
    } catch { onToast('网络错误', 'err'); }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-8 pt-40 pb-24">
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-surface rounded w-1/4" />
        <div className="h-12 bg-surface rounded w-3/4" />
        <div className="h-4 bg-surface rounded w-1/2" />
        <div className="space-y-3 pt-8">
          {[...Array(8)].map((_, i) => <div key={i} className="h-4 bg-surface rounded" />)}
        </div>
      </div>
    </div>
  );

  if (!data) return (
    <div className="max-w-3xl mx-auto px-8 pt-40 pb-24 text-center">
      <p className="font-headline text-4xl italic text-on-surface-variant/40">文章不存在</p>
      <button onClick={onBack} className="mt-8 flex items-center gap-2 mx-auto text-primary hover:underline"><ArrowLeft size={16} />返回</button>
    </div>
  );

  const { article, content, comments } = data;
  const readTime = Math.max(1, Math.ceil(article.content?.split(/\s+/).length / 200));

  return (
    <div className="max-w-screen-xl mx-auto px-8 pt-28 pb-32">
      {/* Back button */}
      <button onClick={onBack} className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-14 font-label text-[10px] uppercase tracking-widest group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />返回列表
      </button>

      {/* Hero — 文章标题区 */}
      <header className="max-w-3xl space-y-6 mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] tracking-[0.2em] uppercase font-bold">
          {article.user?.nickname || '作者'} · 随笔
        </div>
        {/* 标题：大号斜体，符合杂志感 */}
        <h1 className="font-headline text-4xl md:text-6xl italic leading-[1.15] text-white tracking-tight">
          {article.title}
        </h1>
        {/* 元信息行 */}
        <div className="flex flex-wrap items-center gap-6 pt-5 border-t border-white/10">
          <div className="flex items-center gap-3">
            {article.user?.avatar
              ? <img src={article.user.avatar} alt="author" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" />
              : <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"><User size={18} /></div>
            }
            <div>
              <p className="text-xs text-on-surface-variant/40 uppercase tracking-widest font-bold mb-0.5">作者</p>
              <p className="text-sm font-label text-on-surface font-semibold">{article.user?.nickname || article.user?.username}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-xs text-on-surface-variant/40 uppercase tracking-widest font-bold mb-0.5">发布于</p>
            <p className="text-sm font-label text-on-surface">
              {new Date(article.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-on-surface-variant/60">
            <Clock size={14} />
            <span className="text-sm font-label">{readTime} 分钟阅读</span>
          </div>
        </div>
      </header>

      {/* 两栏布局：正文 + 侧边栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">

        {/* ── 正文区 ── */}
        <article className="lg:col-span-8 min-w-0">
          {/* ★ 核心：应用中文阅读排版 */}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* 文章点赞按钮 */}
          <div className="mt-16 flex justify-center">
            <button onClick={toggleArticleLike} className={`group flex flex-col items-center gap-3 transition-colors ${article.is_liked ? 'text-rose-500' : 'text-on-surface-variant hover:text-rose-400'}`}>
              <div className={`p-4 rounded-full border transition-all duration-300 ${article.is_liked ? 'bg-rose-500/10 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'border-white/10 group-hover:bg-surface/80 group-hover:border-rose-400/30'}`}>
                <Heart size={26} strokeWidth={article.is_liked ? 0 : 2} className={`transition-all duration-300 ${article.is_liked ? "fill-rose-500 scale-110" : ""}`} />
              </div>
              <span className="text-[11px] tracking-widest font-bold uppercase">{article.likes_count > 0 ? `${article.likes_count} 喜欢` : '点赞'}</span>
            </button>
          </div>

          {/* ── 评论区 ── */}
          <div className="mt-20 pt-14 border-t border-white/8">
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare size={18} className="text-primary" />
              <h2 className="font-headline text-2xl italic">评论</h2>
              <span className="text-sm text-on-surface-variant/40 font-label">{comments.length} 条</span>
            </div>

            {/* 评论输入框 */}
            <div className="mb-10 space-y-3 p-6 article-card-surface">
              <p className="text-xs text-on-surface-variant/40 uppercase tracking-widest font-bold">发表评论</p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="写下你的想法..."
                rows={4}
                className="w-full bg-transparent text-sm leading-relaxed outline-none transition-colors placeholder:text-white/20 resize-none text-on-surface/80"
              />
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-xs text-on-surface-variant/30">{comment.length} 字</span>
                <button onClick={postComment} disabled={posting || !comment.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-full font-label text-[10px] tracking-widest uppercase font-bold hover:opacity-90 transition-opacity disabled:opacity-40">
                  <Send size={12} />{posting ? '发送中...' : '发表'}
                </button>
              </div>
            </div>

            {/* 评论列表 */}
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare size={32} className="mx-auto mb-3 text-on-surface-variant/20" />
                <p className="text-on-surface-variant/40 italic text-sm">暂无评论，来写第一条吧</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((c, idx) => (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-4 p-5 article-card-surface">
                    <div className="flex-shrink-0 pt-0.5">
                      {c.user?.avatar
                        ? <img src={c.user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        : <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary"><User size={15} /></div>
                      }
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-3">
                          <span className="text-sm font-label font-bold">{c.user?.nickname || c.user?.username}</span>
                          <span className="text-[11px] text-on-surface-variant/30">{new Date(c.created_at).toLocaleDateString('zh-CN')}</span>
                        </div>
                        <button onClick={() => toggleCommentLike(c.id)} className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${c.is_liked ? 'text-rose-500' : 'text-on-surface-variant/40 hover:text-rose-400'}`}>
                          <Heart size={14} strokeWidth={c.is_liked ? 0 : 2} className={c.is_liked ? "fill-rose-500" : ""} />
                          {c.likes_count > 0 && <span>{c.likes_count}</span>}
                        </button>
                      </div>
                      <p className="text-sm text-on-surface-variant/70 leading-relaxed">{c.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* ── 侧边栏 ── */}
        <aside className="lg:col-span-4">
          <div className="sticky top-32 space-y-5">
            {/* 作者卡片 */}
            <div className="p-6 rounded-2xl bg-surface-container border border-white/5 space-y-5">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">关于作者</p>
              <div className="flex items-center gap-4">
                {article.user?.avatar
                  ? <img src={article.user.avatar} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  : <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><User size={24} /></div>
                }
                <div>
                  <p className="font-headline text-lg">{article.user?.nickname || article.user?.username}</p>
                  <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest">@{article.user?.username}</p>
                </div>
              </div>
              {article.user?.bio && <p className="text-sm text-on-surface-variant/60 leading-relaxed border-t border-white/5 pt-4">{article.user.bio}</p>}
              {(article.user?.email || article.user?.qq || article.user?.github) && (
                <div className="pt-5 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-on-surface-variant/50">
                    <Link size={14} className="text-primary/70" />
                    <span>联系我</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {article.user.email && (
                      <a href={`mailto:${article.user.email}`} className="flex items-center gap-4 p-3 rounded-xl bg-surface/30 border border-white/5 hover:border-primary/30 hover:bg-surface/60 transition-all group">
                        <Mail size={16} className="text-on-surface-variant/50 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-label text-on-surface-variant/80 group-hover:text-on-surface transition-colors truncate">{article.user.email}</span>
                      </a>
                    )}
                    {article.user.qq && (
                      <a href={`http://wpa.qq.com/msgrd?v=3&uin=${article.user.qq}&site=qq&menu=yes`} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-3 rounded-xl bg-surface/30 border border-white/5 hover:border-primary/30 hover:bg-surface/60 transition-all group">
                        <MessageCircle size={16} className="text-on-surface-variant/50 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-label text-on-surface-variant/80 group-hover:text-on-surface transition-colors truncate">{article.user.qq}</span>
                      </a>
                    )}
                    {article.user.github && (
                      <a href={article.user.github.startsWith('http') ? article.user.github : `https://${article.user.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-3 rounded-xl bg-surface/30 border border-white/5 hover:border-primary/30 hover:bg-surface/60 transition-all group">
                        <Github size={16} className="text-on-surface-variant/50 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-label text-on-surface-variant/80 group-hover:text-on-surface transition-colors truncate">{article.user.github.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 rounded-2xl border border-white/5 bg-surface/20 space-y-4">
              <h4 className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">文章信息</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant/50">评论数</span>
                  <span className="text-primary font-bold">{comments.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant/50">阅读时间</span>
                  <span className="text-primary font-bold">{readTime} 分钟</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant/50">发布于</span>
                  <span className="text-on-surface/70">{new Date(article.created_at).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ─── Write page ───────────────────────────────────────────────────────────────
const WritePage = ({ onToast, onNavigate }: { onToast: (msg: string, type: 'ok' | 'err') => void; onNavigate: (p: Page) => void }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const publish = async () => {
    if (!title.trim() || !content.trim()) { onToast('标题和内容不能为空', 'err'); return; }
    setLoading(true);
    try {
      const r = await apiFetch('/api/articles/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content }) });
      if (r.ok) { onToast('发布成功！', 'ok'); setTitle(''); setContent(''); onNavigate('stories'); }
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

const CUTE_COVERS = [
  { name: '猫咪', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=2600' },
  { name: '兔子', url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=2600' },
  { name: '治愈云朵', url: 'https://images.unsplash.com/photo-1519750783826-e2420f4d687f?auto=format&fit=crop&q=80&w=2600' },
  { name: '星空', url: 'https://images.unsplash.com/photo-1470252649358-96949c93046c?auto=format&fit=crop&q=80&w=2600' }
];

// ─── Profile page ─────────────────────────────────────────────────────────────
const ProfilePage = ({ user, setUser, onToast, onViewArticle }: { user: UserInfo | null; setUser: (u: UserInfo) => void; onToast: (msg: string, type: 'ok' | 'err') => void; onViewArticle: (id: number) => void }) => {
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
          <img alt="cover" className="w-full h-full object-cover transition-transform duration-1000 group-hover/header:scale-110" src={user?.cover || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2600"} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-[#0e0e10]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-purple-500/20 mix-blend-overlay" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-end gap-8 w-full">
          <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-[#0e0e10] shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-surface flex-shrink-0 group/avatar relative">
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
            className="flex items-center gap-3 px-8 py-4 rounded-full vibrant-gradient text-on-primary font-label text-[11px] tracking-widest uppercase font-bold hover:shadow-[0_0_30px_rgba(107,216,203,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl">
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

// ─── Collections page ─────────────────────────────────────────────────────────
const CollectionsPage = () => {
  const collections = [
    { id: 1, title: '自然与荒野', count: 12, description: '探索大地的原始力量，从冰川到森林的静谧之旅。' },
    { id: 2, title: '城市孤独', count: 8, description: '在繁华都市的缝隙中，寻找那些被遗忘的灵魂。' },
    { id: 3, title: '数字时代的哲学', count: 15, description: '当比特构筑世界，我们如何定义真实与存在？' },
    { id: 4, title: '远古的回响', count: 10, description: '追寻历史的足迹，倾听那些尘封已久的古老叙事。' },
    { id: 5, title: '光影随笔', count: 20, description: '用镜头和文字，捕捉那些转瞬即逝的视觉诗篇。' },
  ];
  return (
    <div className="max-w-screen-xl mx-auto px-8 py-32 space-y-20">
      <header className="space-y-4">
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">精选合集</h2>
        <h1 className="font-headline text-6xl italic">叙事的主题</h1>
      </header>
      <div className="grid grid-cols-1 gap-6">
        {collections.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            className="group article-card-surface p-12 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-12">
              <span className="font-mono text-primary text-sm opacity-40">0{i + 1}</span>
              <div className="space-y-2">
                <h3 className="font-headline text-4xl italic group-hover:text-primary transition-colors">{c.title}</h3>
                <p className="text-sm text-on-surface-variant/60 max-w-md">{c.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">查看 {c.count} 篇随笔</span>
              <ChevronRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── Admin Dashboard ─────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/admin/stats').then(r => r.json()),
      apiFetch('/api/admin/users').then(r => r.json())
    ]).then(([s, u]) => {
      setStats(s);
      setUsers(u);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-32 text-center text-primary italic animate-pulse">调取星枢数据中...</div>;

  return (
    <div className="max-w-screen-xl mx-auto px-8 py-32 space-y-16">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] tracking-[0.2em] uppercase font-bold">
          <Shield size={12} /> 管理中枢
        </div>
        <h1 className="font-headline text-6xl italic">星枢概览</h1>
        <p className="text-on-surface-variant/60 max-w-xl">在这里审视星野叙事的一切流动与共鸣。</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: '注册用户', value: stats?.total_users, icon: <Users className="text-blue-400" /> },
          { label: '发布文章', value: stats?.total_articles, icon: <BookOpen className="text-primary" /> },
          { label: '互动评论', value: stats?.total_comments, icon: <MessageCircle className="text-purple-400" /> }
        ].map((item, i) => (
          <div key={i} className="p-8 article-card-surface space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-bold">{item.label}</span>
              {item.icon}
            </div>
            <p className="text-5xl font-headline italic">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 article-card-surface space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-2xl italic">流量趋势 (7D)</h3>
            <Activity size={18} className="text-primary opacity-40" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.traffic}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6bd8cb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6bd8cb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#6bd8cb', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="views" stroke="#6bd8cb" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 article-card-surface space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-2xl italic">注册动态 (7D)</h3>
            <Users size={18} className="text-blue-400 opacity-40" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.reg_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161618', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#3a86ff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3a86ff" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="p-8 article-card-surface space-y-8">
        <h3 className="font-headline text-2xl italic">用户名册</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40">
                <th className="pb-4 font-bold">用户</th>
                <th className="pb-4 font-bold">账号</th>
                <th className="pb-4 font-bold">注册时间</th>
                <th className="pb-4 font-bold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-surface">
                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <User size={14} className="m-auto mt-2 opacity-20" />}
                      </div>
                      <span className="text-sm font-medium">{u.nickname}</span>
                    </div>
                  </td>
                  <td className="py-4 text-xs text-on-surface-variant/60">@{u.username}</td>
                  <td className="py-4 text-xs text-on-surface-variant/40">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Settings page ────────────────────────────────────────────────────────────
const SettingsPage = ({ user }: { user: UserInfo | null }) => (
  <div className="max-w-screen-xl mx-auto px-8 py-32 space-y-20">
    <header className="space-y-4">
      <h2 className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">偏好设置</h2>
      <h1 className="font-headline text-6xl italic">定制您的体验</h1>
    </header>
    <div className="max-w-2xl space-y-12">
      <section className="space-y-6">
        <h3 className="text-sm font-label uppercase tracking-widest text-on-surface-variant/40">账户信息</h3>
        <div className="p-8 rounded-xl bg-surface border border-white/5 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {user?.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={32} className="text-primary" />}
          </div>
          <div>
            <p className="font-headline text-xl">{user?.nickname || user?.username}</p>
            <p className="text-xs text-on-surface-variant/60">@{user?.username}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
            <Check size={12} />已登录
          </div>
        </div>
      </section>
      <section className="space-y-6">
        <h3 className="text-sm font-label uppercase tracking-widest text-on-surface-variant/40">阅读偏好</h3>
        <div className="space-y-4">
          {[['深色模式', '为深夜阅读优化视觉体验', true], ['专注模式', '阅读时隐藏所有侧边栏和干扰', false]].map(([name, desc, on]) => (
            <div key={name as string} className="flex items-center justify-between p-6 rounded-xl bg-surface border border-white/5">
              <div><p className="font-headline text-lg">{name as string}</p><p className="text-xs text-on-surface-variant/60">{desc as string}</p></div>
              <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${on ? 'bg-primary' : 'bg-surface-container'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-on-primary transition-all ${on ? 'right-1' : 'left-1'}`} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-4 pt-8 border-t border-white/5">
        <p className="text-[10px] text-on-surface-variant/30 uppercase tracking-widest">关于</p>
        <p className="text-sm text-on-surface-variant/60">宏大叙事 © 2024 · 为静谧时刻打造</p>
      </section>
    </div>
  </div>
);

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [prevPage, setPrevPage] = useState<Page>('stories');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const showToast = useCallback((msg: string, type: 'ok' | 'err') => setToast({ msg, type }), []);

  const viewArticle = useCallback((id: number) => {
    setPrevPage(currentPage as Page);
    setSelectedArticleId(id);
    setCurrentPage('article');
  }, [currentPage]);

  // Check login on mount
  useEffect(() => {
    apiFetch('/api/user/profile').then(async r => {
      if (r.ok) setUser(await r.json());
    }).catch(() => {}).finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    const handler = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLogout = async () => {
    try { await apiFetch('/logout', { method: 'POST' }); } catch {}
    setUser(null);
  };

  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0e0e10]"><div className="text-primary font-headline text-2xl italic animate-pulse">宏大叙事</div></div>;
  }

  if (!user) {
    return <AuthPage onLogin={u => { setUser(u); setCurrentPage('home'); }} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={setCurrentPage} onViewArticle={viewArticle} />;
      case 'stories': return <StoriesPage user={user} onToast={showToast} onViewArticle={viewArticle} />;
      case 'collections': return <CollectionsPage />;
      case 'write': return <WritePage onToast={showToast} onNavigate={setCurrentPage} />;
      case 'admin': return user?.username === 'admin' ? <AdminDashboard /> : <HomePage onNavigate={setCurrentPage} onViewArticle={viewArticle} />;
      case 'profile': return <ProfilePage user={user} setUser={u => setUser(u)} onToast={showToast} onViewArticle={viewArticle} />;
      case 'settings': return <SettingsPage user={user} />;
      case 'article': return selectedArticleId ? <ArticleDetailPage articleId={selectedArticleId} user={user} onToast={showToast} onBack={() => setCurrentPage(prevPage)} /> : <HomePage onNavigate={setCurrentPage} onViewArticle={viewArticle} />;
      default: return <HomePage onNavigate={setCurrentPage} onViewArticle={viewArticle} />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="reading-progress" style={{ width: `${scrollProgress}%` }} />
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
      <Sidebar activePage={currentPage} onNavigate={setCurrentPage} user={user} />
      <MobileNav activePage={currentPage} onNavigate={setCurrentPage} />
      <TopBar onNavigate={setCurrentPage} user={user} onLogout={handleLogout} />
      <DesktopTopBar onNavigate={setCurrentPage} user={user} onLogout={handleLogout} />
      <main className="lg:ml-80 min-h-screen relative flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: `linear-gradient(to right bottom, rgba(16, 16, 18, 0.75), rgba(16, 16, 18, 0.95)), url("${PAGE_BGS[currentPage]}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', transition: 'background-image 0.8s ease-in-out' }} />
        <div className="relative z-10 flex-1 flex flex-col min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div key={currentPage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex-1">
              {renderPage()}
            </motion.div>
          </AnimatePresence>
          <footer className="w-full py-20 border-t border-white/5 relative overflow-hidden flex flex-col items-center justify-center gap-8 mt-20">
            <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(16, 16, 18, 0.8), rgba(16, 16, 18, 0.95)), url("https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=2400")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="relative z-10 flex flex-col items-center gap-8">
              <div className="font-headline text-lg text-on-surface-variant/60 italic">宏大叙事</div>
              <div className="flex gap-12 text-[10px] tracking-widest uppercase text-on-surface-variant/40 font-label">
                <a className="hover:text-primary transition-colors duration-500" href="#">隐私</a>
                <a className="hover:text-primary transition-colors duration-500" href="#">条款</a>
              </div>
              <p className="text-[10px] text-on-surface-variant/40 font-label">© 2024 宏大叙事. 为静谧时刻打造.</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
