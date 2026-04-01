import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, PenTool, Settings, LogOut } from 'lucide-react';
import { Page, UserInfo } from '../../types';

interface UserMenuProps {
  onNavigate: (p: Page) => void;
  user: UserInfo | null;
  onLogout: () => void;
}

export const UserMenu = ({ onNavigate, user, onLogout }: UserMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="avatar" className="w-5 h-5 rounded-full object-cover" />
        ) : (
          <User size={18} />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-3 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden border border-primary/15"
              style={{ background: 'linear-gradient(180deg, rgba(24,26,40,0.98), rgba(20,21,32,0.99))' }}
            >
              {/* 用户信息头部 */}
              <div className="p-5 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-12 h-12 rounded-xl object-cover border-2 border-primary/30" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/20 flex items-center justify-center text-primary border border-primary/20">
                        <User size={20} />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#181a28]" />
                  </div>
                  <div>
                    <p className="text-sm font-headline text-white">{user?.nickname || '用户'}</p>
                    <p className="text-[10px] text-primary/60 uppercase tracking-widest">@{user?.username}</p>
                  </div>
                </div>
              </div>

              {/* 菜单项 */}
              <div className="p-2">
                <button
                  onClick={() => { onNavigate('profile'); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 text-left group transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <User size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">个人主页</span>
                    <p className="text-[10px] text-on-surface-variant/40">查看和编辑资料</p>
                  </div>
                </button>

                {user?.username === 'admin' && (
                  <button
                    onClick={() => { onNavigate('admin'); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 text-left group transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                      <Shield size={16} />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">管理后台</span>
                      <p className="text-[10px] text-on-surface-variant/40">管理内容和用户</p>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => { onNavigate('write'); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 text-left group transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    <PenTool size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">写文章</span>
                    <p className="text-[10px] text-on-surface-variant/40">开始新的创作</p>
                  </div>
                </button>

                <button
                  onClick={() => { onNavigate('settings'); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 text-left group transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                    <Settings size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">偏好设置</span>
                    <p className="text-[10px] text-on-surface-variant/40">个性化你的体验</p>
                  </div>
                </button>
              </div>

              {/* 退出按钮 */}
              <div className="p-2 border-t border-primary/10">
                <button
                  onClick={() => { onLogout(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-left group transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover:bg-red-500/20 transition-colors">
                    <LogOut size={16} />
                  </div>
                  <span className="text-sm font-medium text-red-400 group-hover:text-red-300 transition-colors">退出登录</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
