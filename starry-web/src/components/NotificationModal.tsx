import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, ExternalLink, ChevronRight } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface Notification {
  id: number;
  type: string;
  content: string;
  article_id?: number;
  is_read: boolean;
  is_acknowledged: boolean;
  created_at: string;
}

export const NotificationModal = ({ onOpenReviews }: { onOpenReviews: () => void }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [show, setShow] = useState(false);

  const fetchNotifications = async () => {
    try {
      const r = await apiFetch('/api/notifications/unread');
      if (r.ok) {
        const data = await r.json();
        // 过滤出未确认的通知 (is_acknowledged = false)
        const unacknowledged = data.filter((n: Notification) => !n.is_acknowledged);
        if (unacknowledged.length > 0) {
          setNotifications(unacknowledged);
          setShow(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // 轮询通知 (可选)
    const timer = setInterval(fetchNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAcknowledge = async (id: number) => {
    try {
      await apiFetch(`/api/notifications/${id}/acknowledge`, { method: 'PUT' });
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notifications.length <= 1) setShow(false);
    } catch (err) {
      console.error('Failed to acknowledge notification:', err);
    }
  };

  const handleAcknowledgeAll = async () => {
    try {
      await Promise.all(notifications.map(n => 
        apiFetch(`/api/notifications/${n.id}/acknowledge`, { method: 'PUT' })
      ));
      setNotifications([]);
      setShow(false);
    } catch (err) {
      console.error('Failed to acknowledge all notifications:', err);
    }
  };

  if (!show || notifications.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#121214] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Bell size={20} className="animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface italic">星枢提醒</h3>
                <p className="text-xs text-on-surface-variant/60 tracking-wider uppercase">System Notifications</p>
              </div>
            </div>
            <button 
              onClick={() => setShow(false)}
              className="p-2 rounded-xl hover:bg-white/5 text-on-surface-variant/40 hover:text-on-surface transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3 group hover:border-primary/20 transition-colors">
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {n.content}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[10px] text-on-surface-variant/30 font-mono">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    {n.type === 'review_request' && (
                      <button 
                        onClick={() => {
                          onOpenReviews();
                          setShow(false);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-colors"
                      >
                        去审核 <ChevronRight size={12} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleAcknowledge(n.id)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-on-surface-variant/60 text-[10px] font-bold hover:bg-white/10 hover:text-on-surface transition-colors"
                    >
                      已知悉
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 bg-surface/30 flex items-center justify-end gap-4 border-t border-white/5">
            <button 
              onClick={handleAcknowledgeAll}
              className="px-6 py-2.5 rounded-xl bg-primary text-[#0a0a0c] text-xs font-bold tracking-widest uppercase shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
            >
              全部知悉
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
