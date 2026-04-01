import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, User, Library, Check, X, Heart, Clock, MessageSquare, Send, MessageCircle, Link, Mail, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserInfo, Article, Comment, Collection } from '../types';
import { apiFetch } from '../utils/api';

export const ArticleDetailPage = ({ articleId, user, onToast, onBack }: { articleId: number; user: UserInfo | null; onToast: (msg: string, type: 'ok' | 'err') => void; onBack: () => void }) => {
  const [data, setData] = useState<{ article: Article; content: string; comments: Comment[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [archiving, setArchiving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch(`/api/articles/${articleId}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [articleId]);

  useEffect(() => { load(); window.scrollTo(0, 0); }, [load]);

  const fetchCollections = async () => {
    try {
      const r = await apiFetch('/api/collections');
      if (r.ok) setCollections(await r.json());
    } catch { }
  };

  const archiveTo = async (colId: number | null) => {
    if (!data) return;
    setArchiving(true);
    try {
      const r = await apiFetch(`/api/articles/edit/${articleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.article.title,
          content: data.article.content,
          collection_id: colId
        })
      });
      if (r.ok) {
        onToast(colId ? '文章已成功归档' : '文章已从合集移除', 'ok');
        setShowArchive(false);
        load();
      } else {
        const d = await r.json();
        onToast(d.error || '归档失败', 'err');
      }
    } catch { onToast('网络错误', 'err'); } finally { setArchiving(false); }
  };

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
          {/* 归档按钮：仅作者和管理员可见 */}
          {(user?.id === article.user?.id || user?.username === 'admin') && (
            <>
              <div className="h-8 w-px bg-white/10" />
              <div className="relative">
                <button 
                  onClick={() => {
                    if (!showArchive) fetchCollections();
                    setShowArchive(!showArchive);
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all text-[10px] font-bold uppercase tracking-widest ${article.collection_id ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-on-surface-variant hover:bg-white/10 hover:border-primary/20 hover:text-primary'}`}
                >
                  <Library size={12} />
                  {article.collection_id ? '已归档' : '归档'}
                </button>
                
                <AnimatePresence>
                  {showArchive && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-3 w-64 p-4 rounded-2xl bg-surface-container border border-primary/20 shadow-2xl z-50 backdrop-blur-xl"
                    >
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40">选择目标合集</span>
                        <button onClick={() => setShowArchive(false)} className="text-on-surface-variant/40 hover:text-white"><X size={14} /></button>
                      </div>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-hide">
                        <button 
                          onClick={() => archiveTo(null)}
                          disabled={archiving || !article.collection_id}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group ${!article.collection_id ? 'bg-primary/5 text-primary/40 cursor-default' : 'hover:bg-white/5 text-on-surface-variant hover:text-primary'}`}
                        >
                          <span>不归档 / 移出合集</span>
                          {!article.collection_id && <Check size={12} />}
                        </button>
                        {collections.map(c => (
                          <button 
                            key={c.id}
                            onClick={() => archiveTo(c.id)}
                            disabled={archiving || article.collection_id === c.id}
                            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group ${article.collection_id === c.id ? 'bg-primary/10 text-primary cursor-default' : 'hover:bg-white/5 text-on-surface-variant hover:text-primary'}`}
                          >
                            <span className="truncate">{c.title}</span>
                            {article.collection_id === c.id && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                      {collections.length === 0 && (
                        <p className="text-[10px] text-center py-4 text-on-surface-variant/30 italic">暂无可选合集</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
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
