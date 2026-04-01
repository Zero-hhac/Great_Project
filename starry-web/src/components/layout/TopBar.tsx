import { ArrowLeft, Search, Star, PenTool } from 'lucide-react';
import { Page, UserInfo } from '../../types';
import { UserMenu } from '../common/UserMenu';

interface TopBarProps {
  onNavigate: (p: Page) => void;
  user: UserInfo | null;
  onLogout: () => void;
  onBack: () => void;
}

export const TopBar = ({ onNavigate, user, onLogout, onBack }: TopBarProps) => (
  <header
    className="lg:hidden sticky top-0 w-full z-50 border-b border-primary/10"
    style={{ background: 'linear-gradient(to bottom, rgba(20,21,32,0.98), rgba(14,15,24,0.95))' }}
  >
    <div className="flex justify-between items-center px-5 py-3 relative z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-on-surface-variant hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
            <Star size={16} className="text-[#0a0b10]" />
          </div>
          <h1 className="font-headline italic text-lg text-primary">Fade Under</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-on-surface-variant hover:text-primary hover:border-primary/20 transition-all">
          <Search size={18} />
        </button>
        <UserMenu onNavigate={onNavigate} user={user} onLogout={onLogout} />
      </div>
    </div>
  </header>
);

export const DesktopTopBar = ({ onNavigate, user, onLogout, onBack }: TopBarProps) => (
  <nav
    className="fixed top-0 w-full z-50 lg:pl-80 border-b border-primary/10"
    style={{ background: 'linear-gradient(to bottom, rgba(20,21,32,0.98), rgba(14,15,24,0.95))' }}
  >
    <div className="flex justify-between items-center px-8 h-16 w-full max-w-screen-2xl mx-auto relative z-10">
      <div className="flex items-center gap-6">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-on-surface-variant hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={() => onNavigate('stories')}
          className="px-4 py-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all font-label text-[10px] tracking-widest uppercase font-bold"
        >
          随笔
        </button>
        <button
          onClick={() => onNavigate('collections')}
          className="px-4 py-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all font-label text-[10px] tracking-widest uppercase font-bold"
        >
          归档
        </button>
        <button
          onClick={() => onNavigate('write')}
          className="px-5 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all font-label text-[10px] tracking-widest uppercase font-bold flex items-center gap-2"
        >
          <PenTool size={14} /> 写作
        </button>
        <div className="w-px h-6 bg-white/10 mx-2" />
        <UserMenu onNavigate={onNavigate} user={user} onLogout={onLogout} />
      </div>
    </div>
  </nav>
);
