import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCheck,
  Flame,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useNotifications } from '@/features/account/hooks/useNotifications';
import { formatRelativeTime } from '@/constants/notifications';
import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';

const TYPE_STYLES = {
  COURSE: {
    icon: GraduationCap,
    bg: 'bg-orange-50 text-[#EA580C] border-orange-200/80',
    badgeVi: 'Khóa học',
    badgeEn: 'Course',
  },
  LESSON: {
    icon: BookOpen,
    bg: 'bg-amber-50 text-amber-600 border-amber-200/80',
    badgeVi: 'Bài học',
    badgeEn: 'Lesson',
  },
  QUIZ: {
    icon: Sparkles,
    bg: 'bg-orange-50 text-[#EA580C] border-orange-200/80',
    badgeVi: 'Bài kiểm tra',
    badgeEn: 'Quiz',
  },
  ACHIEVEMENT: {
    icon: Trophy,
    bg: 'bg-yellow-50 text-amber-700 border-amber-200/80',
    badgeVi: 'Thành tích',
    badgeEn: 'Achievement',
  },
  STREAK: {
    icon: Flame,
    bg: 'bg-rose-50 text-rose-600 border-rose-200/80',
    badgeVi: 'Chuỗi học',
    badgeEn: 'Streak',
  },
  WELCOME: {
    icon: Sparkles,
    bg: 'bg-teal-50 text-teal-600 border-teal-200/80',
    badgeVi: 'Chào mừng',
    badgeEn: 'Welcome',
  },
  SECURITY: {
    icon: LockKeyhole,
    bg: 'bg-blue-50 text-blue-600 border-blue-200/80',
    badgeVi: 'Bảo mật',
    badgeEn: 'Security',
  },
  CONTENT_REVIEW: {
    icon: ShieldCheck,
    bg: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
    badgeVi: 'Kiểm duyệt',
    badgeEn: 'Review',
  },
  SYSTEM: {
    icon: Bell,
    bg: 'bg-stone-50 text-stone-600 border-stone-200/80',
    badgeVi: 'Hệ thống',
    badgeEn: 'System',
  },
};

function resolveNotificationStyle(type) {
  return TYPE_STYLES[type] || TYPE_STYLES.SYSTEM;
}

export function NotificationDropdown() {
  const lang = useTextLanguage();
  const isVi = lang === 'vi';
  const [open, setOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { notifications, unreadCount, busy, error, markAsRead, markAllAsRead } = useNotifications();

  const items = useMemo(
    () => (unreadOnly ? notifications.filter((item) => !item.isRead) : notifications),
    [notifications, unreadOnly]
  );

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
    if (item.linkUrl) {
      setOpen(false);
      navigate(item.linkUrl);
    }
  };

  return (
    <div className="notification-menu relative" ref={rootRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`notification-menu__trigger relative flex h-10 w-10 items-center justify-center rounded-2xl border transition-all ${
          open
            ? 'border-[#EA580C] bg-[#FFF7ED] text-[#EA580C] shadow-[0_2px_10px_rgba(234,88,12,0.15)]'
            : 'border-[#E8E5DF] bg-white text-[#253044] hover:border-[#EA580C]/40 hover:bg-[#FFFBF5] hover:text-[#EA580C] shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
        }`}
        aria-label={
          isVi
            ? `Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ''}`
            : `Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`
        }
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell size={18} strokeWidth={2} className={unreadCount > 0 ? 'text-[#EA580C]' : 'text-[#64748B]'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-[#EA580C] to-[#F97316] px-1 text-[10px] font-bold text-white shadow-[0_2px_6px_rgba(234,88,12,0.35)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label={isVi ? 'Thông báo gần đây' : 'Recent notifications'}
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="notification-dropdown absolute right-0 top-[calc(100%+10px)] z-[1050] flex w-[min(420px,calc(100vw-24px))] max-h-[min(620px,calc(100vh-100px))] flex-col overflow-hidden rounded-[24px] border border-[#E8E5DF] bg-white text-left shadow-[0_22px_60px_-10px_rgba(37,48,68,0.18),0_8px_22px_-6px_rgba(37,48,68,0.08)]"
          >
            {/* Header */}
            <header className="flex flex-shrink-0 items-center justify-between border-b border-[#F0ECE4] bg-white px-5 py-4">
              <div className="flex items-center gap-2.5">
                <h3 className="text-[16px] font-bold tracking-tight text-[#253044]">
                  <BilingualText vi="Thông báo" en="Notifications" />
                </h3>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-[11px] font-bold text-[#EA580C]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#EA580C]" />
                    <BilingualText
                      vi={`${unreadCount} mới`}
                      en={`${unreadCount} new`}
                    />
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-2.5 py-1.5 text-xs font-semibold text-[#EA580C] transition-all hover:bg-[#FFEDD5] active:scale-[0.98] disabled:opacity-50"
                >
                  <CheckCheck size={14} strokeWidth={2.2} />
                  <BilingualText vi="Đọc tất cả" en="Mark all read" />
                </button>
              )}
            </header>

            {/* Segmented Filter Control */}
            <div className="flex-shrink-0 bg-white px-4 pt-3 pb-2.5">
              <div
                className="flex items-center gap-1 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-1"
                role="tablist"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={!unreadOnly}
                  onClick={() => setUnreadOnly(false)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                    !unreadOnly
                      ? 'bg-white text-[#253044] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#E8E5DF]/70'
                      : 'text-[#64748B] hover:text-[#253044]'
                  }`}
                >
                  <BilingualText vi="Tất cả" en="All" />
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      !unreadOnly ? 'bg-[#FAF8F5] text-[#253044]' : 'bg-[#EAE6DF]/70 text-[#64748B]'
                    }`}
                  >
                    {notifications.length}
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={unreadOnly}
                  onClick={() => setUnreadOnly(true)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                    unreadOnly
                      ? 'bg-white text-[#EA580C] shadow-[0_2px_8px_rgba(234,88,12,0.1)] border border-[#FED7AA]/80'
                      : 'text-[#64748B] hover:text-[#EA580C]'
                  }`}
                >
                  <BilingualText vi="Chưa đọc" en="Unread" />
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-gradient-to-r from-[#EA580C] to-[#F97316] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="flex-shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700" role="alert">
                <BilingualText>{error}</BilingualText>
              </p>
            )}

            {/* Notification List */}
            <div className="notification-scroll flex-1 overflow-y-auto divide-y divide-[#F3EFE9] bg-white">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] text-[#EA580C]">
                    <Bell size={24} strokeWidth={1.8} />
                  </div>
                  <strong className="block text-sm font-bold text-[#253044]">
                    <BilingualText
                      vi={unreadOnly ? 'Bạn đã đọc hết thông báo' : 'Chưa có thông báo nào'}
                      en={unreadOnly ? 'All caught up!' : 'No notifications yet'}
                    />
                  </strong>
                  <p className="mt-1 text-xs text-[#828F9E]">
                    <BilingualText
                      vi="Thông báo học tập và thành tích sẽ xuất hiện tại đây."
                      en="Lesson updates and achievements will appear here."
                    />
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const styleMeta = resolveNotificationStyle(item.type);
                  const Icon = styleMeta.icon;
                  const titleText = bilingualLabel(item.title);
                  const messageText = bilingualLabel(item.message);

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
                      className={`notification-item group relative flex items-start gap-3.5 px-4 py-3.5 text-left transition-colors cursor-pointer ${
                        item.isRead
                          ? 'bg-white hover:bg-[#FAF8F5]'
                          : 'bg-gradient-to-r from-[#FFFBF5] via-[#FFF9F2] to-[#FFF4E5]/80 hover:from-[#FFF7ED] hover:to-[#FFF0DC] border-l-4 border-l-[#EA580C]'
                      }`}
                    >
                      {/* Left: Themed Icon Box */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-200 group-hover:scale-105 ${styleMeta.bg}`}
                      >
                        <Icon size={19} strokeWidth={2} />
                      </div>

                      {/* Right: Content Stack */}
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={`text-xs leading-snug break-words ${
                              item.isRead ? 'font-semibold text-[#3B4758]' : 'font-bold text-[#1E293B]'
                            }`}
                            style={{ overflowWrap: 'anywhere' }}
                          >
                            {titleText}
                          </h4>

                          {!item.isRead && (
                            <span
                              className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-[#EA580C] ring-4 ring-[#EA580C]/20"
                              title={isVi ? 'Chưa đọc' : 'Unread'}
                              aria-label={isVi ? 'Chưa đọc' : 'Unread'}
                            />
                          )}
                        </div>

                        <p
                          className="mt-0.5 text-[11.5px] leading-relaxed text-[#5F6D7E] break-words line-clamp-2"
                          style={{ overflowWrap: 'anywhere' }}
                        >
                          {messageText}
                        </p>

                        <div className="mt-1 flex items-center justify-between text-[10.5px] text-[#94A3B8]">
                          <span>{formatRelativeTime(item.createdAt, lang)}</span>
                          {item.linkUrl && (
                            <span className="flex items-center gap-0.5 font-medium text-[#EA580C] opacity-0 transition-opacity group-hover:opacity-100">
                              <BilingualText vi="Chi tiết" en="Details" />
                              <ArrowRight size={11} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <footer className="flex-shrink-0 border-t border-[#F0ECE4] bg-white p-2.5">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-center text-xs font-bold text-[#EA580C] transition-colors hover:bg-[#FFF7ED] active:scale-[0.99]"
              >
                <BilingualText vi="Xem tất cả thông báo" en="View all notifications" />
                <ArrowRight size={14} />
              </Link>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationDropdown;
