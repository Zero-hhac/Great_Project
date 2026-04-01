import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Page, UserInfo } from './types';
import { apiFetch } from './utils/api';
import { PAGE_BGS } from './constants';
import { Toast } from './components/common';
import { Sidebar, MobileNav, TopBar, DesktopTopBar } from './components/layout';
import {
  AuthPage,
  HomePage,
  StoriesPage,
  ArticleDetailPage,
  WritePage,
  ProfilePage,
  CollectionsPage,
  CollectionDetailPage,
  AdminDashboard,
  SettingsPage,
} from './pages';

export default function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [prevPage, setPrevPage] = useState<Page>('stories');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const showToast = useCallback((msg: string, type: 'ok' | 'err') => setToast({ msg, type }), []);

  const viewArticle = useCallback(
    (id: number) => {
      setPrevPage(currentPage as Page);
      setSelectedArticleId(id);
      setCurrentPage('article');
    },
    [currentPage]
  );

  const viewCollection = useCallback(
    (id: number) => {
      setPrevPage(currentPage as Page);
      setSelectedCollectionId(id);
      setCurrentPage('collection_detail');
    },
    [currentPage]
  );

  const goBack = useCallback(() => {
    setCurrentPage(prevPage);
  }, [prevPage]);

  useEffect(() => {
    apiFetch('/api/user/profile')
      .then(async r => {
        if (r.ok) setUser(await r.json());
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
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
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch {}
    setUser(null);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0e10]">
        <div className="text-primary font-headline text-2xl italic animate-pulse">Fade Under</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={u => { setUser(u); setCurrentPage('home'); }} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} onViewArticle={viewArticle} />;
      case 'stories':
        return <StoriesPage user={user} onToast={showToast} onViewArticle={viewArticle} />;
      case 'collections':
        return <CollectionsPage onToast={showToast} onViewCollection={viewCollection} />;
      case 'collection_detail':
        return selectedCollectionId ? (
          <CollectionDetailPage colId={selectedCollectionId} onViewArticle={viewArticle} onBack={() => setCurrentPage('collections')} />
        ) : (
          <CollectionsPage onToast={showToast} onViewCollection={viewCollection} />
        );
      case 'write':
        return <WritePage onToast={showToast} onNavigate={setCurrentPage} />;
      case 'admin':
        return user?.username === 'admin' ? (
          <AdminDashboard user={user} />
        ) : (
          <HomePage onNavigate={setCurrentPage} onViewArticle={viewArticle} />
        );
      case 'profile':
        return <ProfilePage user={user} setUser={u => setUser(u)} onToast={showToast} onViewArticle={viewArticle} />;
      case 'settings':
        return <SettingsPage user={user} />;
      case 'article':
        return selectedArticleId ? (
          <ArticleDetailPage articleId={selectedArticleId} user={user} onToast={showToast} onBack={() => setCurrentPage(prevPage)} />
        ) : (
          <HomePage onNavigate={setCurrentPage} onViewArticle={viewArticle} />
        );
      default:
        return <HomePage onNavigate={setCurrentPage} onViewArticle={viewArticle} />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="reading-progress" style={{ width: `${scrollProgress}%` }} />
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
      <Sidebar activePage={currentPage} onNavigate={p => { setPrevPage(currentPage); setCurrentPage(p); }} user={user} />
      <MobileNav activePage={currentPage} onNavigate={p => { setPrevPage(currentPage); setCurrentPage(p); }} user={user} />
      <TopBar onNavigate={p => { setPrevPage(currentPage); setCurrentPage(p); }} user={user} onLogout={handleLogout} onBack={goBack} />
      <DesktopTopBar onNavigate={p => { setPrevPage(currentPage); setCurrentPage(p); }} user={user} onLogout={handleLogout} onBack={goBack} />
      <main className="lg:ml-80 min-h-screen relative flex flex-col overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: PAGE_BGS[currentPage]
              ? `linear-gradient(to right bottom, rgba(16, 16, 18, 0.75), rgba(16, 16, 18, 0.95)), url("${PAGE_BGS[currentPage]}")`
              : 'none',
            backgroundColor: PAGE_BGS[currentPage] ? undefined : '#131315',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            transition: 'background-image 0.8s ease-in-out',
          }}
        />
        <div className="relative z-10 flex-1 flex flex-col min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
          <footer className="w-full py-24 border-t border-white/5 relative overflow-hidden flex flex-col items-center justify-center gap-10 mt-20">
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c] via-[#101012]/95 to-[#08080a]" />
              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-10">
              <div className="font-headline text-2xl text-primary/60 italic tracking-widest">Fade Under</div>
              <div className="flex gap-16 text-[11px] tracking-[0.3em] uppercase text-on-surface-variant/30 font-label font-bold">
                <a className="hover:text-primary transition-all duration-500 hover:tracking-[0.4em]" href="#">隐私政策</a>
                <a className="hover:text-primary transition-all duration-500 hover:tracking-[0.4em]" href="#">服务条款</a>
                <a className="hover:text-primary transition-all duration-500 hover:tracking-[0.4em]" href="#">关于我们</a>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] text-on-surface-variant/20 font-label uppercase tracking-widest">Digital Sanctuary for Your Thoughts</p>
                <p className="text-[10px] text-on-surface-variant/20 font-label tracking-widest">© 2026 Fade Under. 为静谧时刻打造.</p>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
