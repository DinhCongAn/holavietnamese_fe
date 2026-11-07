import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  BookOpen,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
} from 'lucide-react';
import { useNotifications } from '@/features/account/hooks/useNotifications';
import { formatRelativeTime } from '@/constants/notifications';
import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';

const PAGE_SIZE = 10;

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

export function NotificationsPage() {
  const lang = useTextLanguage();
  const isVi = lang === 'vi';
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { pageData, unreadCount, loading, busy, error, loadPage, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  useEffect(() => {
    loadPage({ page, size: PAGE_SIZE, isRead: filter === 'unread' ? false : undefined });
  }, [page, filter, loadPage]);

  useEffect(() => {
    if (pageData.totalPages > 0 && page > pageData.totalPages) setPage(pageData.totalPages);
  }, [page, pageData.totalPages]);

  const selectFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  const openItem = async (item) => {
    if (!item.isRead) await markAsRead(item.id);
    if (item.linkUrl) navigate(item.linkUrl);
  };

  return (
    <main className="notifications-page min-h-screen bg-[#FAF8F5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-3 py-1 text-xs font-bold text-[#EA580C] shadow-xs">
              <Bell size={13} strokeWidth={2.2} />
              <BilingualText vi="TRUNG TÂM THÔNG BÁO" en="NOTIFICATION CENTER" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[#253044] sm:text-3xl">
              <BilingualText vi="Thông báo của bạn" en="Your Notifications" />
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              <BilingualText
                vi="Theo dõi bài học, thành tích và các cập nhật quan trọng."
                en="Keep track of lessons, achievements, and important updates."
              />
            </p>
          </div>

          <button
            type="button"
            disabled={busy || unreadCount === 0}
            onClick={markAllAsRead}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-4 py-2.5 text-xs font-bold text-[#EA580C] shadow-xs transition-all hover:bg-[#FFEDD5] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck size={16} strokeWidth={2.2} />
            <BilingualText vi="Đánh dấu tất cả đã đọc" en="Mark all as read" />
          </button>
        </header>

        {/* Tab & Controls Bar */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-[#E8E5DF] bg-white p-2 shadow-xs">
          <div className="flex items-center justify-between gap-3 px-2">
            <div
              className="flex items-center gap-1.5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] p-1"
              role="tablist"
              aria-label={isVi ? 'Lọc thông báo' : 'Filter notifications'}
            >
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'all'}
                onClick={() => selectFilter('all')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  filter === 'all'
                    ? 'border border-[#E8E5DF]/70 bg-white text-[#253044] shadow-xs'
                    : 'text-[#64748B] hover:text-[#253044]'
                }`}
              >
                <BilingualText vi="Tất cả" en="All" />
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    filter === 'all' ? 'bg-[#FAF8F5] text-[#253044]' : 'bg-[#EAE6DF]/70 text-[#64748B]'
                  }`}
                >
                  {pageData.totalElements}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={filter === 'unread'}
                onClick={() => selectFilter('unread')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  filter === 'unread'
                    ? 'border border-[#FED7AA]/80 bg-white text-[#EA580C] shadow-xs'
                    : 'text-[#64748B] hover:text-[#EA580C]'
                }`}
              >
                <BilingualText vi="Chưa đọc" en="Unread" />
                {unreadCount > 0 && (
                  <span className="rounded-full bg-gradient-to-r from-[#EA580C] to-[#F97316] px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            <span className="hidden text-xs font-medium text-[#64748B] sm:block">
              <BilingualText
                vi={`Trang ${pageData.page} / ${pageData.totalPages || 1}`}
                en={`Page ${pageData.page} / ${pageData.totalPages || 1}`}
              />
            </span>
          </div>

          {error && (
            <div className="mt-2 border-t border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700" role="alert">
              <BilingualText>{error}</BilingualText>
            </div>
          )}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-[#E8E5DF] bg-white p-12 shadow-xs">
            <span className="h-8 w-8 animate-spin rounded-full border-3 border-orange-200 border-t-[#EA580C]" />
          </div>
        ) : pageData.content.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E8E5DF] bg-white p-12 text-center shadow-xs">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] text-[#EA580C]">
              {filter === 'unread' ? <Check size={28} strokeWidth={2.2} /> : <Bell size={28} strokeWidth={2} />}
            </span>
            <h2 className="text-base font-bold text-[#253044]">
              <BilingualText
                vi={filter === 'unread' ? 'Bạn đã đọc hết thông báo' : 'Chưa có thông báo nào'}
                en={filter === 'unread' ? 'You have read all notifications' : 'No notifications yet'}
              />
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              <BilingualText
                vi="Thông báo mới sẽ xuất hiện tại đây khi bạn học tập."
                en="New notifications will appear here as you learn."
              />
            </p>
          </div>
        ) : (
          /* Cards List */
          <div className="flex flex-col gap-3.5">
            <AnimatePresence initial={false}>
              {pageData.content.map((item) => {
                const styleMeta = resolveNotificationStyle(item.type);
                const Icon = styleMeta.icon;
                const titleText = bilingualLabel(item.title);
                const messageText = bilingualLabel(item.message);

                return (
                  <motion.article
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={`notification-card group relative flex items-start gap-4 rounded-2xl p-5 transition-all sm:p-6 ${
                      item.isRead
                        ? 'border border-[#E8E5DF] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-[#FED7AA]/70 hover:shadow-xs'
                        : 'border border-[#FED7AA] border-l-4 border-l-[#EA580C] bg-gradient-to-r from-white via-[#FFFBF5] to-[#FFF7ED]/50 shadow-[0_4px_16px_-4px_rgba(234,88,12,0.08)]'
                    }`}
                  >
                    {/* Icon Box (44x44px) */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-200 group-hover:scale-105 ${styleMeta.bg}`}
                    >
                      <Icon size={21} strokeWidth={2} />
                    </div>

                    {/* Content Stack & Action Buttons */}
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      {/* Top Row: Type Pill + Unread Pill & Action Buttons */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                            <BilingualText vi={styleMeta.badgeVi} en={styleMeta.badgeEn} />
                          </span>

                          {!item.isRead && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-bold text-[#EA580C]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#EA580C]" />
                              <BilingualText vi="Chưa đọc" en="Unread" />
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {!item.isRead && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => markAsRead(item.id)}
                              title={isVi ? 'Đánh dấu đã đọc' : 'Mark as read'}
                              aria-label={isVi ? 'Đánh dấu đã đọc' : 'Mark as read'}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8E5DF] bg-white text-[#64748B] transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none"
                            >
                              <Check size={15} strokeWidth={2.2} />
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => deleteNotification(item.id)}
                            title={isVi ? 'Xóa thông báo' : 'Delete notification'}
                            aria-label={isVi ? 'Xóa thông báo' : 'Delete notification'}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E8E5DF] bg-white text-[#64748B] transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 focus:outline-none"
                          >
                            <Trash2 size={15} strokeWidth={2} />
                          </button>
                        </div>
                      </div>

                      {/* Content Area (Clickable) */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => openItem(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openItem(item);
                          }
                        }}
                        className="cursor-pointer focus:outline-none"
                      >
                        {/* Title */}
                        <h3
                          className={`text-base font-bold leading-snug break-words sm:text-lg ${
                            item.isRead ? 'text-[#3B4758]' : 'text-[#1E293B]'
                          }`}
                          style={{ overflowWrap: 'anywhere' }}
                        >
                          {titleText}
                        </h3>

                        {/* Message Description */}
                        <p
                          className="mt-1 text-sm leading-relaxed text-[#5F6D7E] break-words"
                          style={{ overflowWrap: 'anywhere' }}
                        >
                          {messageText}
                        </p>

                        {/* Timestamp */}
                        <div className="mt-2 text-xs font-normal text-[#94A3B8]">
                          {formatRelativeTime(item.createdAt, lang)}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {pageData.totalPages > 1 && (
          <nav
            className="mt-6 flex items-center justify-between rounded-2xl border border-[#E8E5DF] bg-white p-4 shadow-xs"
            aria-label={isVi ? 'Phân trang thông báo' : 'Notifications pagination'}
          >
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => value - 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-[#E8E5DF] bg-white px-3.5 py-2 text-xs font-semibold text-[#253044] transition-colors hover:border-[#EA580C]/50 hover:bg-[#FFFBF5] hover:text-[#EA580C] focus:outline-none disabled:opacity-40"
            >
              <ChevronLeft size={15} />
              <BilingualText vi="Trước" en="Previous" />
            </button>
            <span className="text-xs font-semibold text-[#64748B]">
              <BilingualText
                vi={`Trang ${pageData.page} / ${pageData.totalPages}`}
                en={`Page ${pageData.page} / ${pageData.totalPages}`}
              />
            </span>
            <button
              type="button"
              disabled={page >= pageData.totalPages || loading}
              onClick={() => setPage((value) => value + 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-[#E8E5DF] bg-white px-3.5 py-2 text-xs font-semibold text-[#253044] transition-colors hover:border-[#EA580C]/50 hover:bg-[#FFFBF5] hover:text-[#EA580C] focus:outline-none disabled:opacity-40"
            >
              <BilingualText vi="Sau" en="Next" />
              <ChevronRight size={15} />
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}

export default NotificationsPage;
