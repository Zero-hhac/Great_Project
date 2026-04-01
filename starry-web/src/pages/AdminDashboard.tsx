import React, { useState, useEffect, useCallback } from 'react';
import { Shield, RefreshCw, AlertCircle, BarChart3, Users, FileText, MessageCircle, Activity, Heart, Trash2, Search, User, ArrowUpRight, Star, PieChart as PieChartIcon, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { UserInfo, AdminTab } from '../types';
import { apiFetch } from '../utils/api';
import { CHART_COLORS, PIE_COLORS } from '../constants';

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

export const AdminDashboard = ({ user }: { user: UserInfo | null }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  async function fetchWithStatus(path: string) {
    const r = await apiFetch(path);
    if (!r.ok) {
      const body = await r.json().catch(() => ({}));
      throw new Error(body.error || `请求 ${path} 失败 (${r.status})`);
    }
    return r.json();
  }

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 检查当前用户是否为管理员
      if (user?.username !== 'admin') {
        throw new Error('权限不足，请使用管理员账号登录');
      }

      const [sRes, uRes, aRes, cRes, activityRes] = await Promise.all([
        fetchWithStatus('/api/admin/stats'),
        fetchWithStatus('/api/admin/users'),
        fetchWithStatus('/api/admin/articles'),
        fetchWithStatus('/api/admin/comments'),
        fetchWithStatus('/api/admin/user-activity'),
      ]);
      setStats(sRes);
      setUsers(Array.isArray(uRes) ? uRes : []);
      setArticles(Array.isArray(aRes) ? aRes : []);
      setComments(Array.isArray(cRes) ? cRes : []);
      setUserActivity(Array.isArray(activityRes?.users) ? activityRes.users : []);
      setUserGrowth(Array.isArray(activityRes?.user_growth) ? activityRes.user_growth : []);
      setActiveUsers(Array.isArray(activityRes?.active_users) ? activityRes.active_users : []);
    } catch (e: any) {
      setError(e.message || '连接服务器失败');
      console.error('[Admin] fetchAll error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = useCallback(async (type: 'user' | 'article' | 'comment', id: number) => {
    if (!confirm('确定要删除吗？此操作不可恢复。')) return;
    try {
      const r = await apiFetch(`/api/admin/${type}s/${id}`, { method: 'DELETE' });
      if (r.ok) {
        setToast({ msg: '删除成功', type: 'ok' });
        fetchAll();
      } else {
        const data = await r.json();
        setToast({ msg: data.error || '删除失败', type: 'err' });
      }
    } catch {
      setToast({ msg: '网络错误', type: 'err' });
    }
  }, [fetchAll]);

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredArticles = articles.filter(a =>
    a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.user?.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredComments = comments.filter(c =>
    c.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user?.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.article_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pieData = stats ? [
    { name: '文章', value: Number(stats.total_articles) || 0 },
    { name: '评论', value: Number(stats.total_comments) || 0 },
    { name: '用户', value: Number(stats.total_users) || 0 },
    { name: '点赞', value: Number(stats.total_likes) || 0 },
  ].filter(d => d.value > 0) : [];

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="p-32 text-center text-primary italic animate-pulse">调取星枢数据中...</div>;

  if (error) return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-32 text-center space-y-6">
      <AlertCircle size={48} className="mx-auto text-red-400" />
      <h2 className="text-xl font-bold text-on-surface">数据加载失败</h2>
      <p className="text-on-surface-variant max-w-md mx-auto">{error}</p>
      <button onClick={fetchAll}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition">
        <RefreshCw size={16} /> 重新加载
      </button>
    </div>
  );

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '概览', icon: <BarChart3 size={16} /> },
    { id: 'users', label: '用户', icon: <Users size={16} /> },
    { id: 'articles', label: '文章', icon: <FileText size={16} /> },
    { id: 'comments', label: '评论', icon: <MessageCircle size={16} /> },
    { id: 'activity', label: '活跃度', icon: <Activity size={16} /> },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-24 md:py-32 space-y-8">
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] tracking-[0.2em] uppercase font-bold">
          <Shield size={12} /> 管理中枢
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-headline text-4xl md:text-6xl italic">星枢概览</h1>
            <p className="text-on-surface-variant/60 text-sm mt-2">在这里审视Fade Under的一切流动与共鸣。</p>
          </div>
          <button onClick={fetchAll} className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase hover:bg-primary/20 transition-colors">
            <RefreshCw size={14} /> 刷新数据
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-2xl bg-surface/50 border border-white/5 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-[#0a0a0c] shadow-lg shadow-primary/20'
                : 'text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-white/[0.03]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Search bar for data tabs */}
      {activeTab !== 'overview' && (
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30" />
          <input
            type="text"
            placeholder={activeTab === 'users' ? '搜索用户...' : activeTab === 'articles' ? '搜索文章...' : '搜索评论...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface/80 border border-white/5 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      )}

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid - 4 cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                label: '注册用户',
                value: stats?.total_users,
                today: stats?.today?.users,
                icon: <Users size={20} />,
                gradient: 'stat-card-blue',
                iconBg: 'bg-blue-500/10 text-blue-400',
              },
              {
                label: '发布文章',
                value: stats?.total_articles,
                today: stats?.today?.articles,
                icon: <FileText size={20} />,
                gradient: 'stat-card-teal',
                iconBg: 'bg-primary/10 text-primary',
              },
              {
                label: '互动评论',
                value: stats?.total_comments,
                today: stats?.today?.comments,
                icon: <MessageCircle size={20} />,
                gradient: 'stat-card-purple',
                iconBg: 'bg-purple-500/10 text-purple-400',
              },
              {
                label: '累计点赞',
                value: stats?.total_likes,
                today: null,
                icon: <Heart size={20} />,
                gradient: '',
                iconBg: 'bg-red-500/10 text-red-400',
                border: 'border-red-500/20',
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`p-5 md:p-6 rounded-2xl bg-surface/60 backdrop-blur-sm border border-white/5 space-y-4 hover:border-white/10 transition-colors ${card.gradient}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                    {card.icon}
                  </div>
                  {card.today != null && Number(card.today) > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                      <ArrowUpRight size={10} /> +{card.today}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-headline italic">{card.value ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/50 font-bold mt-1">{card.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Articles Trend */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 p-6 rounded-2xl bg-surface/60 backdrop-blur-sm border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline text-xl italic">发文趋势</h3>
                  <p className="text-[10px] tracking-wider uppercase text-on-surface-variant/40 font-bold mt-1">近 7 天真实数据</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold">
                  <span className="flex items-center gap-1.5 text-primary"><span className="w-2 h-2 rounded-full bg-primary" /> 文章</span>
                  <span className="flex items-center gap-1.5 text-purple-400"><span className="w-2 h-2 rounded-full bg-purple-400" /> 评论</span>
                </div>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.weekly_articles}>
                    <defs>
                      <linearGradient id="gradArticles" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f0b952" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#f0b952" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradComments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(20,21,32,0.95)', border: '1px solid rgba(240,185,82,0.2)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ fontSize: '12px' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="count" name="文章" stroke="#f0b952" fillOpacity={1} fill="url(#gradArticles)" strokeWidth={2} dot={{ fill: '#f0b952', r: 3 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.weekly_comments}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(20,21,32,0.95)', border: '1px solid rgba(240,185,82,0.2)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ fontSize: '12px' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="count" name="评论" stroke="#a78bfa" fillOpacity={1} fill="url(#gradComments)" strokeWidth={2} dot={{ fill: '#a78bfa', r: 3 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Content Distribution Pie + Today Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-6 rounded-2xl bg-surface/60 backdrop-blur-sm border border-white/5 space-y-6">
              <div>
                <h3 className="font-headline text-xl italic">内容分布</h3>
                <p className="text-[10px] tracking-wider uppercase text-on-surface-variant/40 font-bold mt-1">平台数据总览</p>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(20,20,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.4)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-xs text-on-surface-variant/60">{d.name}</span>
                    <span className="text-xs font-bold ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>

              {/* Today stats */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <p className="text-[10px] tracking-wider uppercase text-on-surface-variant/40 font-bold">今日动态</p>
                {[
                  { label: '新用户', value: stats?.today?.users, color: 'text-blue-400' },
                  { label: '新文章', value: stats?.today?.articles, color: 'text-primary' },
                  { label: '新评论', value: stats?.today?.comments, color: 'text-purple-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant/50">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>+{item.value ?? 0}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Row: Top Articles + Recent Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Articles */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-6 rounded-2xl bg-surface/60 backdrop-blur-sm border border-white/5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline text-xl italic">热门文章</h3>
                  <p className="text-[10px] tracking-wider uppercase text-on-surface-variant/40 font-bold mt-1">按点赞排序 TOP 5</p>
                </div>
                <Star size={16} className="text-yellow-400/40" />
              </div>
              <div className="space-y-3">
                {stats?.top_articles?.length > 0 ? stats.top_articles.map((a: any, i: number) => (
                  <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-primary/10 text-primary' : 'bg-white/5 text-on-surface-variant/30'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-red-400/70">
                      <Heart size={12} /> {a.likes_count}
                    </span>
                  </div>
                )) : (
                  <p className="text-xs text-on-surface-variant/30 text-center py-8">暂无文章数据</p>
                )}
              </div>
            </motion.div>

            {/* Recent Users */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="p-6 rounded-2xl bg-surface/60 backdrop-blur-sm border border-white/5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline text-xl italic">最近注册</h3>
                  <p className="text-[10px] tracking-wider uppercase text-on-surface-variant/40 font-bold mt-1">最新加入的 5 位用户</p>
                </div>
                <Users size={16} className="text-blue-400/40" />
              </div>
              <div className="space-y-3">
                {stats?.recent_users?.length > 0 ? stats.recent_users.map((u: any) => (
                  <div key={u.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-surface flex-shrink-0">
                      {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={16} className="text-on-surface-variant/20" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.nickname || u.username}</p>
                      <p className="text-[10px] text-on-surface-variant/40">@{u.username}</p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant/30 whitespace-nowrap">{formatDate(u.created_at)}</span>
                  </div>
                )) : (
                  <p className="text-xs text-on-surface-variant/30 text-center py-8">暂无用户数据</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ── Users Tab ── */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-surface/60 backdrop-blur-sm border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-headline text-xl italic">用户管理</h3>
            <span className="text-[10px] tracking-wider uppercase text-on-surface-variant/40 font-bold">共 {filteredUsers.length} 位用户</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/30">
                  <th className="py-3 px-6 font-bold">用户</th>
                  <th className="py-3 px-4 font-bold">邮箱</th>
                  <th className="py-3 px-4 font-bold">GitHub</th>
                  <th className="py-3 px-4 font-bold">注册时间</th>
                  <th className="py-3 px-6 font-bold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-surface flex-shrink-0">
                          {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={14} className="text-on-surface-variant/20" /></div>}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{u.nickname || '未设置'}</p>
                          <p className="text-[10px] text-on-surface-variant/40">@{u.username}</p>
                        </div>
                        {u.username === 'admin' && (
                          <span className="text-[8px] tracking-wider uppercase font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">管理员</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant/50">{u.email || '—'}</td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant/50">{u.github || '—'}</td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant/30">{formatDate(u.created_at)}</td>
                    <td className="py-4 px-6 text-right">
                      {u.username !== 'admin' && (
                        <button onClick={() => handleDelete('user', u.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Articles Tab ── */}
      {activeTab === 'articles' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-surface/60 backdrop-blur-sm border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-headline text-xl italic">文章管理</h3>
            <span className="text-[10px] tracking-wider uppercase text-on-surface-variant/40 font-bold">共 {filteredArticles.length} 篇文章</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/30">
                  <th className="py-3 px-6 font-bold">文章标题</th>
                  <th className="py-3 px-4 font-bold">作者</th>
                  <th className="py-3 px-4 font-bold">
                    <span className="flex items-center gap-1"><Heart size={10} /> 点赞</span>
                  </th>
                  <th className="py-3 px-4 font-bold">发布时间</th>
                  <th className="py-3 px-6 font-bold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredArticles.map(a => (
                  <tr key={a.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium truncate max-w-xs">{a.title}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-surface flex-shrink-0">
                          {a.user?.avatar ? <img src={a.user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={10} className="text-on-surface-variant/20" /></div>}
                        </div>
                        <span className="text-xs text-on-surface-variant/60">{a.user?.nickname || a.user?.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-bold text-red-400/70">{a.likes_count ?? 0}</span>
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant/30">{formatDate(a.created_at)}</td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => handleDelete('article', a.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Comments Tab ── */}
      {activeTab === 'comments' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-surface/60 backdrop-blur-sm border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-headline text-xl italic">评论管理</h3>
            <span className="text-[10px] tracking-wider uppercase text-on-surface-variant/40 font-bold">共 {filteredComments.length} 条评论</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/30">
                  <th className="py-3 px-6 font-bold">评论内容</th>
                  <th className="py-3 px-4 font-bold">评论者</th>
                  <th className="py-3 px-4 font-bold">所属文章</th>
                  <th className="py-3 px-4 font-bold">
                    <span className="flex items-center gap-1"><Heart size={10} /> 点赞</span>
                  </th>
                  <th className="py-3 px-4 font-bold">时间</th>
                  <th className="py-3 px-6 font-bold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredComments.map(c => (
                  <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <p className="text-sm truncate max-w-xs">{c.content}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-surface flex-shrink-0">
                          {c.user?.avatar ? <img src={c.user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={10} className="text-on-surface-variant/20" /></div>}
                        </div>
                        <span className="text-xs text-on-surface-variant/60">{c.user?.nickname || c.user?.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-xs text-on-surface-variant/40 truncate max-w-[150px]">{c.article_title || '—'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-bold text-red-400/70">{c.likes_count ?? 0}</span>
                    </td>
                    <td className="py-4 px-4 text-xs text-on-surface-variant/30 whitespace-nowrap">{formatDate(c.created_at)}</td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => handleDelete('comment', c.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Activity Tab ── */}
      {activeTab === 'activity' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* 活跃度趋势图 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-surface/60 backdrop-blur-sm border border-white/5 space-y-6">
              <div>
                <h3 className="font-headline text-xl italic">用户增长趋势</h3>
                <p className="text-[10px] tracking-wider uppercase text-on-surface-variant/40 font-bold mt-1">近 30 天新增用户</p>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowth}>
                    <defs>
                      <linearGradient id="gradUserGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(20,21,32,0.95)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ fontSize: '12px' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="count" name="新增用户" stroke="#60a5fa" fillOpacity={1} fill="url(#gradUserGrowth)" strokeWidth={2} dot={{ fill: '#60a5fa', r: 3 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface/60 backdrop-blur-sm border border-white/5 space-y-6">
              <div>
                <h3 className="font-headline text-xl italic">每日活跃用户</h3>
                <p className="text-[10px] tracking-wider uppercase text-on-surface-variant/40 font-bold mt-1">近 30 天有活动的用户数</p>
              </div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeUsers}>
                    <defs>
                      <linearGradient id="gradActiveUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(20,21,32,0.95)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ fontSize: '12px' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}
                    />
                    <Area type="monotone" dataKey="count" name="活跃用户" stroke="#a78bfa" fillOpacity={1} fill="url(#gradActiveUsers)" strokeWidth={2} dot={{ fill: '#a78bfa', r: 3 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 用户活跃度排行榜 */}
          <div className="rounded-2xl bg-surface/60 backdrop-blur-sm border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-headline text-xl italic">用户活跃度排行</h3>
              <span className="text-[10px] tracking-wider uppercase text-on-surface-variant/40 font-bold">基于发文、评论、获赞综合计算</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/30">
                    <th className="py-3 px-6 font-bold w-16">排名</th>
                    <th className="py-3 px-4 font-bold">用户</th>
                    <th className="py-3 px-4 font-bold text-center">文章</th>
                    <th className="py-3 px-4 font-bold text-center">评论</th>
                    <th className="py-3 px-4 font-bold text-center">获赞</th>
                    <th className="py-3 px-4 font-bold text-center">活跃度</th>
                    <th className="py-3 px-4 font-bold">最后活跃</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {userActivity.slice(0, 10).map((u, index) => (
                    <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-gray-400/20 text-gray-300' :
                          index === 2 ? 'bg-orange-700/20 text-orange-400' :
                          'bg-surface text-on-surface-variant/40'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface flex-shrink-0">
                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={16} className="text-on-surface-variant/20" /></div>}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{u.nickname || u.username}</p>
                            <p className="text-[10px] text-on-surface-variant/40">@{u.username}</p>
                          </div>
                          {u.username === 'admin' && (
                            <span className="text-[8px] tracking-wider uppercase font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">管理员</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-bold text-primary">{u.article_count}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-bold text-blue-400">{u.comment_count}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-bold text-red-400">{u.total_likes}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-2 bg-surface rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (u.activity_score / (userActivity[0]?.activity_score || 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-primary">{u.activity_score}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-on-surface-variant/30">
                        {u.last_active_at ? formatDate(u.last_active_at) : '暂无活动'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
