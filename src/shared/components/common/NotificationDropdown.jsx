import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Bell, BookOpen, CheckCheck, Flame, LockKeyhole, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { useNotifications } from '@/features/account/hooks/useNotifications';
import { formatRelativeTime } from '@/constants/notifications';

const TYPE_ICONS = {
  COURSE: BookOpen, LESSON: BookOpen, QUIZ: Sparkles, ACHIEVEMENT: Trophy,
  STREAK: Flame, SECURITY: LockKeyhole, CONTENT_REVIEW: ShieldCheck,
  SYSTEM: Sparkles, AI_ROLEPLAY: Sparkles,
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { notifications, unreadCount, busy, error, markAsRead, markAllAsRead } = useNotifications();

  const items = useMemo(() => {
    const list = unreadOnly ? notifications.filter((item) => !item.isRead) : notifications;
    return [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeA !== timeB) {
        return timeB - timeA;
      }
      return Number(b.id) - Number(a.id);
    });
  }, [notifications, unreadOnly]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const openNotification = async (item) => {
    if (!item.isRead) await markAsRead(item.id);
    setOpen(false);
    if (item.targetType === 'BADGE' && item.targetId) {
      navigate(`/achievements?badgeId=${encodeURIComponent(item.targetId)}`);
    } else if (item.type === 'ACHIEVEMENT') {
      navigate(item.linkUrl || '/achievements');
    } else if (item.linkUrl) {
      navigate(item.linkUrl);
    }
  };

  return (
    <div className="notification-menu relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="notification-menu__trigger relative p-2 rounded-xl !bg-transparent hover:!bg-[#FFF0DC] active:!bg-transparent text-[#253044] transition-colors !min-h-0 !border-0"
        aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell size={20} className={unreadCount ? 'text-[#EA580C]' : ''} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[19px] h-[19px] px-1 rounded-full bg-[#EA580C] text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="Thông báo gần đây"
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[#E8E5DF] bg-white shadow-[0_20px_50px_rgba(67,25,20,0.16)] text-left"
          >
            <header className="flex items-center justify-between gap-3 border-b border-[#E8E5DF] bg-[#FFFBF5] p-4">
              <div>
                <strong className="text-sm text-[#253044]">Thông báo</strong>
                <p className="text-[11px] text-[#64748B]">{unreadCount} thông báo chưa đọc</p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 text-xs font-bold !text-[#EA580C] hover:!text-[#C2410C] !bg-transparent hover:!bg-transparent active:!bg-transparent !border-0 !p-0 !min-h-0 disabled:opacity-50"
                >
                  <CheckCheck size={14} /> Đọc tất cả
                </button>
              )}
            </header>
            <div className="flex gap-2 border-b border-[#E8E5DF] bg-[#FFFBF5] p-2">
              <button
                type="button"
                onClick={() => setUnreadOnly(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all !min-h-0 ${
                  !unreadOnly
                    ? '!bg-white active:!bg-white !text-[#EA580C] border-2 border-[#EA580C] shadow-2xs'
                    : '!bg-white active:!bg-white !text-[#64748B] border border-[#E8E5DF] hover:!text-[#253044]'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setUnreadOnly(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all !min-h-0 ${
                  unreadOnly
                    ? '!bg-white active:!bg-white !text-[#EA580C] border-2 border-[#EA580C] shadow-2xs'
                    : '!bg-white active:!bg-white !text-[#64748B] border border-[#E8E5DF] hover:!text-[#253044]'
                }`}
              >
                Chưa đọc
              </button>
            </div>
            {error && <p className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700" role="alert">{error}</p>}
            <div className="max-h-[420px] overflow-y-auto divide-y divide-[#E8E5DF]">
              {items.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Bell className="mx-auto mb-3 text-[#C5BDB3]" />
                  <strong className="block text-sm text-[#253044]">{unreadOnly ? 'Bạn đã đọc hết thông báo' : 'Chưa có thông báo'}</strong>
                </div>
              ) : (
                items.map((item) => {
                  const Icon = (item.targetType === 'BADGE' || item.type === 'ACHIEVEMENT') ? Trophy : (TYPE_ICONS[item.type] || Bell);
                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openNotification(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openNotification(item);
                        }
                      }}
                      className={`relative flex items-start w-full gap-3 p-4 text-left transition-colors !bg-white hover:!bg-stone-50 active:!bg-white cursor-pointer focus:outline-none ${
                        !item.isRead ? 'border-l-4 border-l-[#EA580C]' : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF0DC] text-[#EA580C] mt-0.5">
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0 flex-1 text-left flex flex-col items-start">
                        <strong className={`w-full text-left truncate text-xs ${item.isRead ? 'text-[#253044]' : 'text-[#1E293B] font-bold'}`}>
                          {item.title}
                        </strong>
                        <span className="w-full text-left mt-1 line-clamp-2 block text-[11px] leading-relaxed text-[#64748B]">
                          {item.message}
                        </span>
                        <small className="w-full text-left mt-1.5 block text-[10px] text-stone-400">
                          {formatRelativeTime(item.createdAt)}
                        </small>
                      </div>
                      {!item.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#EA580C]" aria-label="Chưa đọc" />}
                    </div>
                  );
                })
              )}
            </div>
            <footer className="border-t border-[#E8E5DF] bg-[#FFFBF5] p-3 text-center">
              <Link to="/notifications" onClick={() => setOpen(false)} className="text-xs font-bold !text-[#EA580C] hover:!text-[#C2410C]">
                Xem tất cả thông báo
              </Link>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationDropdown;
