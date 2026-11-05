import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Bell, BookOpen, CheckCheck, Flame, LockKeyhole, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { useNotifications } from '@/features/account/hooks/useNotifications';
import { formatRelativeTime } from '@/constants/notifications';
import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';

const TYPE_ICONS = {
  COURSE: BookOpen,
  LESSON: BookOpen,
  QUIZ: Sparkles,
  ACHIEVEMENT: Trophy,
  STREAK: Flame,
  SECURITY: LockKeyhole,
  CONTENT_REVIEW: ShieldCheck,
};

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
        className="notification-menu__trigger relative flex items-center justify-center p-2 rounded-xl text-[#1E293B] hover:bg-[#F8FAFC] transition-colors focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none"
        aria-label={isVi ? `Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ''}` : `Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        style={{ backgroundColor: '#ffffff', minHeight: 'unset' }}
      >
        <Bell size={20} className={unreadCount ? 'text-[#1E293B]' : 'text-[#64748B]'} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[19px] h-[19px] px-1 rounded-full bg-[#1E293B] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
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
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="notification-dropdown absolute right-0 top-[calc(100%+8px)] z-[1050] w-[min(440px,calc(100vw-24px))] max-h-[min(650px,calc(100vh-100px))] flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] text-left"
            style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
          >
            {/* Header - Fixed */}
            <header
              className="flex-shrink-0 flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white px-4 py-3.5"
              style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
            >
              <div>
                <h3 className="text-base font-bold text-[#1E293B] leading-tight">
                  <BilingualText vi="Thông báo" en="Notifications" />
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5 font-normal">
                  <BilingualText
                    vi={`${unreadCount} thông báo chưa đọc`}
                    en={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
                  />
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E293B] bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 transition-colors focus:outline-none focus:ring-0 active:bg-white disabled:opacity-50"
                  style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0', minHeight: 'unset' }}
                >
                  <CheckCheck size={14} className="text-[#64748B]" />
                  <BilingualText vi="Đọc tất cả" en="Mark all read" />
                </button>
              )}
            </header>

            {/* Tabs - Fixed */}
            <div
              className="flex-shrink-0 flex items-center gap-6 px-4 border-b border-[#E2E8F0] bg-white"
              role="tablist"
              style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={!unreadOnly}
                onClick={() => setUnreadOnly(false)}
                className={`py-2.5 text-xs transition-colors focus:outline-none focus:ring-0 border-b-2 -mb-px flex items-center gap-1.5 ${
                  !unreadOnly
                    ? 'font-bold text-[#1E293B] border-[#1E293B]'
                    : 'font-medium text-[#64748B] hover:text-[#1E293B] border-transparent'
                }`}
                style={{ backgroundColor: '#ffffff', minHeight: 'unset' }}
              >
                <BilingualText vi="Tất cả" en="All" />
                <span className="px-1.5 py-0.2 rounded-full bg-[#F1F5F9] text-[10px] font-semibold text-[#64748B]">
                  {notifications.length}
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={unreadOnly}
                onClick={() => setUnreadOnly(true)}
                className={`py-2.5 text-xs transition-colors focus:outline-none focus:ring-0 border-b-2 -mb-px flex items-center gap-1.5 ${
                  unreadOnly
                    ? 'font-bold text-[#1E293B] border-[#1E293B]'
                    : 'font-medium text-[#64748B] hover:text-[#1E293B] border-transparent'
                }`}
                style={{ backgroundColor: '#ffffff', minHeight: 'unset' }}
              >
                <BilingualText vi="Chưa đọc" en="Unread" />
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#F1F5F9] text-[10px] font-semibold text-[#1E293B]">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {error && (
              <p className="flex-shrink-0 border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700" role="alert">
                <BilingualText>{error}</BilingualText>
              </p>
            )}

            {/* Notification List - Independent Scroll Area */}
            <div
              className="notification-scroll flex-1 overflow-y-auto divide-y divide-[#E2E8F0] bg-white"
              style={{ backgroundColor: '#ffffff' }}
            >
              {items.length === 0 ? (
                <div className="px-6 py-12 text-center bg-white flex flex-col items-center justify-center">
                  <div
                    className="w-12 h-12 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-3 text-[#94A3B8]"
                    style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
                  >
                    <Bell size={20} />
                  </div>
                  <strong className="block text-sm font-semibold text-[#1E293B]">
                    <BilingualText
                      vi={unreadOnly ? 'Bạn đã đọc hết thông báo' : 'Chưa có thông báo'}
                      en={unreadOnly ? 'You have read all notifications' : 'No notifications yet'}
                    />
                  </strong>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    <BilingualText
                      vi="Thông báo mới sẽ xuất hiện tại đây khi bạn học tập."
                      en="New notifications will appear here as you learn."
                    />
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const Icon = TYPE_ICONS[item.type] || Bell;
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
                      className="notification-item group relative flex items-start gap-3.5 p-3.5 text-left transition-colors bg-white hover:bg-[#F8FAFC] active:bg-white focus:outline-none focus:bg-[#F8FAFC] cursor-pointer"
                      style={{ backgroundColor: '#ffffff', minHeight: 'unset' }}
                    >
                      {/* Left: 40x40px Icon */}
                      <div
                        className="notification-icon-box flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] transition-colors group-hover:border-slate-300"
                        style={{
                          backgroundColor: '#F8FAFC',
                          borderColor: '#E2E8F0',
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          minHeight: '40px',
                        }}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                      </div>

                      {/* Right: Clean Content Stack */}
                      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={`text-xs leading-snug break-words ${
                              item.isRead ? 'font-medium text-[#334155]' : 'font-semibold text-[#1E293B]'
                            }`}
                            style={{ overflowWrap: 'anywhere' }}
                          >
                            {titleText}
                          </h4>
                          {!item.isRead && (
                            <span
                              className="notification-unread-dot mt-1 h-2 w-2 shrink-0 rounded-full bg-[#F97316]"
                              title={isVi ? 'Chưa đọc' : 'Unread'}
                              aria-label={isVi ? 'Chưa đọc' : 'Unread'}
                              style={{ backgroundColor: '#F97316' }}
                            />
                          )}
                        </div>

                        <p
                          className="text-[11px] leading-relaxed text-[#475569] break-words line-clamp-2 mt-0.5"
                          style={{ overflowWrap: 'anywhere' }}
                        >
                          {messageText}
                        </p>

                        <span className="text-[10px] leading-tight text-[#94A3B8] mt-1 font-normal">
                          {formatRelativeTime(item.createdAt, lang)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer - Fixed */}
            <footer
              className="flex-shrink-0 border-t border-[#E2E8F0] bg-white p-2"
              style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
            >
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="block w-full py-2.5 text-center text-xs font-semibold text-[#1E293B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors focus:outline-none focus:ring-0 active:bg-white"
                style={{ backgroundColor: '#ffffff' }}
              >
                <BilingualText vi="Xem tất cả thông báo" en="View all notifications" />
              </Link>
            </footer>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationDropdown;
