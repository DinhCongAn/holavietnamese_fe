import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, BookOpen, Check, CheckCheck, ChevronLeft, ChevronRight, Flame, LockKeyhole, ShieldCheck, Sparkles, Trash2, Trophy } from 'lucide-react';
import { useNotifications } from '@/features/account/hooks/useNotifications';
import { formatRelativeTime } from '@/constants/notifications';
import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';

const PAGE_SIZE = 10;
const TYPE_META = {
  SYSTEM: ['Hệ thống', 'System', Bell],
  WELCOME: ['Chào mừng', 'Welcome', Sparkles],
  COURSE: ['Khóa học', 'Course', BookOpen],
  LESSON: ['Bài học', 'Lesson', BookOpen],
  QUIZ: ['Bài kiểm tra', 'Quiz', Sparkles],
  ACHIEVEMENT: ['Thành tích', 'Achievement', Trophy],
  STREAK: ['Chuỗi học', 'Streak', Flame],
  CONTENT_REVIEW: ['Duyệt nội dung', 'Content Review', ShieldCheck],
  SECURITY: ['Bảo mật', 'Security', LockKeyhole],
};

export function NotificationsPage() {
  const lang = useTextLanguage();
  const isVi = lang === 'vi';
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { pageData, unreadCount, loading, busy, error, loadPage, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

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
    <main className="notifications-page min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span
              className="mb-2 inline-flex items-center gap-2 rounded-full bg-white border border-[#E2E8F0] px-3 py-1 text-xs font-semibold text-[#64748B] shadow-xs"
              style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
            >
              <Bell size={13} />
              <BilingualText vi="TRUNG TÂM THÔNG BÁO" en="NOTIFICATION CENTER" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E293B]">
              <BilingualText vi="Thông báo của bạn" en="Your Notifications" />
            </h1>
            <p className="mt-1 text-sm text-[#475569]">
              <BilingualText vi="Theo dõi bài học, thành tích và các cập nhật quan trọng." en="Keep track of lessons, achievements, and important updates." />
            </p>
          </div>

          <button
            type="button"
            disabled={busy || unreadCount === 0}
            onClick={markAllAsRead}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs font-semibold text-[#334155] shadow-xs hover:bg-[#F8FAFC] hover:text-[#1E293B] focus:outline-none focus:ring-0 active:bg-white disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0', minHeight: 'unset' }}
          >
            <CheckCheck size={16} className="text-[#64748B]" />
            <BilingualText vi="Đánh dấu tất cả đã đọc" en="Mark all as read" />
          </button>
        </header>

        {/* Tab & Controls Bar */}
        <div
          className="mb-6 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs"
          style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
        >
          <div className="flex items-center justify-between gap-3 px-6 py-1">
            <div className="flex gap-8" role="tablist" aria-label={isVi ? 'Lọc thông báo' : 'Filter notifications'}>
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'all'}
                onClick={() => selectFilter('all')}
                className={`py-3 text-sm transition-colors focus:outline-none border-b-2 -mb-px flex items-center gap-2 ${
                  filter === 'all'
                    ? 'font-bold text-[#1E293B] border-[#1E293B]'
                    : 'font-medium text-[#334155] hover:text-[#1E293B] border-transparent'
                }`}
                style={{ backgroundColor: '#ffffff', minHeight: 'unset', padding: '12px 0' }}
              >
                <BilingualText vi="Tất cả" en="All" />
                <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-semibold text-[#64748B]">
                  {pageData.totalElements}
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={filter === 'unread'}
                onClick={() => selectFilter('unread')}
                className={`py-3 text-sm transition-colors focus:outline-none border-b-2 -mb-px flex items-center gap-2 ${
                  filter === 'unread'
                    ? 'font-bold text-[#1E293B] border-[#1E293B]'
                    : 'font-medium text-[#334155] hover:text-[#1E293B] border-transparent'
                }`}
                style={{ backgroundColor: '#ffffff', minHeight: 'unset', padding: '12px 0' }}
              >
                <BilingualText vi="Chưa đọc" en="Unread" />
                {unreadCount > 0 && (
                  <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-semibold text-[#334155]">
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
            <div className="border-t border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700" role="alert">
              <BilingualText>{error}</BilingualText>
            </div>
          )}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white p-12">
            <span className="h-8 w-8 animate-spin rounded-full border-3 border-slate-300 border-t-slate-800" />
          </div>
        ) : pageData.content.length === 0 ? (
          <div
            className="rounded-2xl border border-[#E2E8F0] bg-white p-12 text-center shadow-xs flex flex-col items-center justify-center"
            style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
          >
            <span
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8FAFC] text-slate-500 border border-[#E2E8F0]"
              style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
            >
              {filter === 'unread' ? <Check size={26} /> : <Bell size={26} />}
            </span>
            <h2 className="font-bold text-base text-[#1E293B]">
              <BilingualText
                vi={filter === 'unread' ? 'Bạn đã đọc hết thông báo' : 'Chưa có thông báo nào'}
                en={filter === 'unread' ? 'You have read all notifications' : 'No notifications yet'}
              />
            </h2>
            <p className="mt-1 text-sm text-[#475569]">
              <BilingualText
                vi="Thông báo mới sẽ xuất hiện tại đây khi bạn học tập."
                en="New notifications will appear here as you learn."
              />
            </p>
          </div>
        ) : (
          /* Cards List - Separate Cards with Generous Spacing */
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {pageData.content.map((item) => {
                const [labelVi, labelEn, Icon] = TYPE_META[item.type] || TYPE_META.SYSTEM;
                const titleText = bilingualLabel(item.title);
                const messageText = bilingualLabel(item.message);

                return (
                  <motion.article
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="notification-card group relative flex items-start gap-4 p-5 sm:p-6 bg-white border border-[#E2E8F0] rounded-xl transition-colors hover:bg-[#F8FAFC]"
                    style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
                  >
                    {/* Khu vực 1 – Icon (44x44px) */}
                    <div
                      className="notification-icon-box flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] transition-colors group-hover:border-slate-300"
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderColor: '#E2E8F0',
                        width: '44px',
                        height: '44px',
                        minWidth: '44px',
                        minHeight: '44px',
                      }}
                    >
                      <Icon size={20} strokeWidth={1.8} />
                    </div>

                    {/* Khu vực 2 – Thông tin & Khu vực 3 – Hành động */}
                    <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                      {/* Dòng 1: PHÂN LOẠI THÔNG BÁO [Bên trái] & HÀNH ĐỘNG [Bên phải] */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                            <BilingualText vi={labelVi} en={labelEn} />
                          </span>
                          {!item.isRead && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] px-2 py-0.5 text-[10px] font-semibold text-[#1E293B]"
                              style={{ backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }}
                            >
                              <span
                                className="notification-unread-dot h-1.5 w-1.5 rounded-full bg-[#F97316]"
                                style={{ backgroundColor: '#F97316' }}
                              />
                              <BilingualText vi="Chưa đọc" en="Unread" />
                            </span>
                          )}
                        </div>

                        {/* Khu vực 3 – Hành động: Nút đánh dấu đã đọc & Nút xóa */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {!item.isRead && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => markAsRead(item.id)}
                              title={isVi ? 'Đánh dấu đã đọc' : 'Mark as read'}
                              aria-label={isVi ? 'Đánh dấu đã đọc' : 'Mark as read'}
                              className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E293B] focus:outline-none transition-colors"
                              style={{
                                backgroundColor: '#ffffff',
                                borderColor: '#E2E8F0',
                                minHeight: 'unset',
                                width: '32px',
                                height: '32px',
                                padding: 0,
                              }}
                            >
                              <Check size={15} />
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => deleteNotification(item.id)}
                            title={isVi ? 'Xóa thông báo' : 'Delete notification'}
                            aria-label={isVi ? 'Xóa thông báo' : 'Delete notification'}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-white border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#DC2626] focus:outline-none transition-colors"
                            style={{
                              backgroundColor: '#ffffff',
                              borderColor: '#E2E8F0',
                              minHeight: 'unset',
                              width: '32px',
                              height: '32px',
                              padding: 0,
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Dòng 2 & 3 & 4: Tiêu đề, Mô tả, Thời gian */}
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
                        {/* Tiêu đề thông báo nổi bật */}
                        <h3
                          className={`text-base sm:text-lg font-bold leading-snug break-words ${
                            item.isRead ? 'text-[#334155]' : 'text-[#1E293B]'
                          }`}
                          style={{ overflowWrap: 'anywhere' }}
                        >
                          {titleText}
                        </h3>

                        {/* Nội dung mô tả thông báo (xuống dòng tự nhiên, thoáng đãng) */}
                        <p
                          className="mt-1.5 text-sm sm:text-base leading-relaxed text-[#475569] break-words"
                          style={{ overflowWrap: 'anywhere' }}
                        >
                          {messageText}
                        </p>

                        {/* Thời gian */}
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
            className="mt-6 flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-xs"
            aria-label={isVi ? 'Phân trang thông báo' : 'Notifications pagination'}
            style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
          >
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => value - 1)}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-[#1E293B] border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] focus:outline-none active:bg-white disabled:opacity-40 transition-colors"
              style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0', minHeight: 'unset' }}
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
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-[#1E293B] border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] focus:outline-none active:bg-white disabled:opacity-40 transition-colors"
              style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0', minHeight: 'unset' }}
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
