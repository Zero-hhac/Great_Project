import React from 'react';
import { Home, BookOpen, Library, Settings, PenTool, Shield, User, ChevronRight, Star } from 'lucide-react';
import { Page, UserInfo } from '../../types';

interface NavItemProps {
  icon: React.ReactElement;
  label: string;
  active?: boolean;
  onClick: () => void;
}

export const NavItem = ({ icon, label, active = false, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`group flex items-center gap-5 py-4 px-6 rounded-2xl transition-all duration-300 w-full text-left ${
      active
        ? 'text-primary bg-primary/10 border border-primary/30 shadow-lg shadow-primary/10'
        : 'text-on-surface-variant hover:bg-white/[0.05] hover:text-primary hover:translate-x-1.5 border border-transparent hover:border-primary/10'
    }`}
  >
    <span
      className={`transition-all duration-300 group-hover:scale-110 ${
        active ? 'text-primary drop-shadow-[0_0_8px_rgba(240,185,82,0.5)]' : 'group-hover:text-primary'
      }`}
    >
      {React.cloneElement(icon, { size: 22 } as any)}
    </span>
    <span className="font-label tracking-[0.2em] uppercase text-xs font-bold">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
  </button>
);

interface SidebarProps {
  activePage: Page;
  onNavigate: (p: Page) => void;
  user: UserInfo | null;
}

export const Sidebar = ({ activePage, onNavigate, user }: SidebarProps) => (
  <aside
    className="hidden lg:flex flex-col w-80 p-6 gap-8 fixed left-0 top-0 h-full border-r border-primary/15 z-[60] overflow-hidden"
    style={{ background: 'linear-gradient(180deg, rgba(20,21,32,0.98) 0%, rgba(14,15,24,0.99) 100%)' }}
  >
    {/* 装饰性背景 */}
    <div className="absolute inset-0 pointer-events-none opacity-30">
      <div className="absolute top-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
    </div>

    {/* Logo 区域 */}
    <div className="flex flex-col gap-1 relative z-10 px-2">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
          <Star size={20} className="text-[#0a0b10]" />
        </div>
        <div>
          <span className="text-xl font-headline italic text-primary">Fade Under</span>
          <p className="text-[9px] font-label tracking-[0.3em] uppercase text-on-surface-variant/50">FADE UNDER</p>
        </div>
      </div>
    </div>

    {/* 导航菜单 */}
    <nav className="flex flex-col gap-2 relative z-10">
      <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-on-surface-variant/30 px-6 mb-2">导航</p>
      <NavItem icon={<Home size={18} />} label="首页" active={activePage === 'home'} onClick={() => onNavigate('home')} />
      <NavItem icon={<BookOpen size={18} />} label="故事" active={activePage === 'stories'} onClick={() => onNavigate('stories')} />
      <NavItem icon={<Library size={18} />} label="合集" active={activePage === 'collections' || activePage === 'collection_detail'} onClick={() => onNavigate('collections')} />
      <NavItem icon={<PenTool size={18} />} label="写作" active={activePage === 'write'} onClick={() => onNavigate('write')} />
      {user?.username === 'admin' && <NavItem icon={<Shield size={18} />} label="管理" active={activePage === 'admin'} onClick={() => onNavigate('admin')} />}
      <NavItem icon={<Settings size={18} />} label="设置" active={activePage === 'settings'} onClick={() => onNavigate('settings')} />
    </nav>

    {/* 用户卡片 */}
    <div className="mt-auto relative z-10">
      <div
        className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 group ${
          activePage === 'profile'
            ? 'bg-primary/10 border border-primary/30 shadow-lg shadow-primary/10'
            : 'bg-white/[0.03] border border-white/[0.06] hover:bg-primary/5 hover:border-primary/20'
        }`}
        onClick={() => onNavigate('profile')}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            {user?.avatar ? (
              <img className="w-12 h-12 rounded-xl object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-colors" src={user.avatar} alt="avatar" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center text-primary border border-primary/20">
                <User size={20} />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#141520]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-headline group-hover:text-primary transition-colors truncate">{user?.nickname || '用户'}</p>
            <p className="text-[10px] text-on-surface-variant/50 truncate">@{user?.username}</p>
          </div>
          <ChevronRight size={16} className="text-on-surface-variant/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  </aside>
);
