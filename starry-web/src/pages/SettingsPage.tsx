import React from 'react';
import { User, Check } from 'lucide-react';
import { UserInfo } from '../types';

export const SettingsPage = ({ user }: { user: UserInfo | null }) => (
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
        <p className="text-sm text-on-surface-variant/60">Fade Under © 2024 · 为静谧时刻打造</p>
      </section>
    </div>
  </div>
);
