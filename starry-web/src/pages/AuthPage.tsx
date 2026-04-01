import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserInfo, AuthPage as AuthPageType } from '../types';
import { apiFetch } from '../utils/api';

export const AuthPage = ({ onLogin }: { onLogin: (u: UserInfo) => void }) => {
  const [mode, setMode] = useState<AuthPageType>('login');
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
          <div className="text-3xl font-headline text-primary italic tracking-tight">Fade Under</div>
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
