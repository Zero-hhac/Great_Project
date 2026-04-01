import { Home, BookOpen, Library, Settings, PenTool, Shield } from 'lucide-react';
import { Page, UserInfo } from '../../types';

interface MobileNavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const MobileNavItem = ({ icon, label, active = false, onClick }: MobileNavItemProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
      active ? 'text-primary bg-primary/10' : 'text-on-surface-variant/60 hover:text-primary'
    }`}
  >
    {icon}
    <span className="text-[9px] font-label uppercase tracking-tight font-bold">{label}</span>
    {active && <div className="w-1 h-1 rounded-full bg-primary" />}
  </button>
);

interface MobileNavProps {
  activePage: Page;
  onNavigate: (p: Page) => void;
  user: UserInfo | null;
}

export const MobileNav = ({ activePage, onNavigate, user }: MobileNavProps) => (
  <nav
    className="lg:hidden fixed bottom-0 left-0 w-full z-50 border-t border-primary/15"
    style={{ background: 'linear-gradient(to top, rgba(14,15,24,0.99), rgba(20,21,32,0.98))' }}
  >
    <div className="flex justify-around items-center p-3 relative z-10">
      <MobileNavItem icon={<Home size={22} />} label="首页" active={activePage === 'home'} onClick={() => onNavigate('home')} />
      <MobileNavItem icon={<BookOpen size={22} />} label="故事" active={activePage === 'stories'} onClick={() => onNavigate('stories')} />
      <MobileNavItem icon={<PenTool size={22} />} label="写作" active={activePage === 'write'} onClick={() => onNavigate('write')} />
      {user?.username === 'admin' && <MobileNavItem icon={<Shield size={22} />} label="管理" active={activePage === 'admin'} onClick={() => onNavigate('admin')} />}
      <MobileNavItem icon={<Library size={22} />} label="合集" active={activePage === 'collections' || activePage === 'collection_detail'} onClick={() => onNavigate('collections')} />
      <MobileNavItem icon={<Settings size={22} />} label="设置" active={activePage === 'settings'} onClick={() => onNavigate('settings')} />
    </div>
  </nav>
);
