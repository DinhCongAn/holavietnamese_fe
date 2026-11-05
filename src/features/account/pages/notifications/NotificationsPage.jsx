import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Award,
  Bell,
  BookOpen,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
} from 'lucide-react';
import { useNotifications } from '@/features/account/hooks/useNotifications';
import { formatRelativeTime } from '@/constants/notifications';

const PAGE_SIZE = 10;
const TYPE_META = {
  SYSTEM: ['Hệ thống', Bell],
  WELCOME: ['Chào mừng', Sparkles],
  COURSE: ['Khóa học', BookOpen],
  LESSON: ['Bài học', BookOpen],
  QUIZ: ['Kiểm tra', Award],
  ACHIEVEMENT: ['Thành tích', Trophy],
  STREAK: ['Chuỗi học', Flame],
  CONTENT_REVIEW: ['Duyệt nội dung', ShieldCheck],
  SECURITY: ['Bảo mật', LockKeyhole],
};

export function NotificationsPage() {
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
    if (item.targetType === 'BADGE' && item.targetId) {
      navigate(`/achievements?badgeId=${encodeURIComponent(item.targetId)}`);
    } else if (item.type === 'ACHIEVEMENT') {
      navigate(item.linkUrl || '/achievements');
    } else if (item.linkUrl) {
      navigate(item.linkUrl);
    }
  };

  const sortedNotifications = useMemo(() => {
    return [...pageData.content].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeA !== timeB) {
        return timeB - timeA;
      }
      return Number(b.id) - Number(a.id);
    });
  }, [pageData.content]);

  return (
    <main className="notifications-page min-h-screen bg-[#FFFCF7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#FFF0DC] px-3 py-1 text-xs font-bold text-[#C2410C]">
              <Bell size={13} /> TRUNG TÂM THÔNG BÁO
            </span>
            <h1 className="text-3xl font-black tracking-tight text-[#253044]">Thông báo của bạn</h1>
            <p className="mt-1 text-sm text-[#64748B]">Theo dõi bài học, thành tích và các cập nhật quan trọng.</p>
          </div>
          <button
            type="button"
            disabled={busy || unreadCount === 0}
            onClick={markAllAsRead}
            className="inline-flex items-center justify-center gap-2 rounded-xl !bg-white hover:!bg-stone-50 active:!bg-white !text-[#EA580C] hover:!text-[#C2410C] border-2 border-[#EA580C] hover:border-[#C2410C] px-4 py-2.5 text-sm font-bold shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-40 disabled:border-stone-300 disabled:!text-stone-400 disabled:!bg-white !min-h-0"
          >
            <CheckCheck size={17} /> Đánh dấu tất cả đã đọc
          </button>
        </header>

        <section className="overflow-hidden rounded-3xl border border-[#E8E5DF] bg-white shadow-[0_12px_40px_rgba(67,25,20,0.06)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#E8E5DF] bg-[#FFFBF5] p-4">
            <div className="flex gap-2" role="tablist" aria-label="Lọc thông báo">
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'all'}
                onClick={() => selectFilter('all')}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all !min-h-0 ${
                  filter === 'all'
                    ? '!bg-white active:!bg-white !text-[#EA580C] border-2 border-[#EA580C] shadow-xs'
                    : '!bg-white active:!bg-white !text-[#64748B] border border-[#E8E5DF] hover:!text-[#253044] hover:border-stone-300'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filter === 'unread'}
                onClick={() => selectFilter('unread')}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all !min-h-0 ${
                  filter === 'unread'
                    ? '!bg-white active:!bg-white !text-[#EA580C] border-2 border-[#EA580C] shadow-xs'
                    : '!bg-white active:!bg-white !text-[#64748B] border border-[#E8E5DF] hover:!text-[#253044] hover:border-stone-300'
                }`}
              >
                Chưa đọc
                <span className="ml-1.5 rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-bold text-[#EA580C]">
                  {unreadCount}
                </span>
              </button>
            </div>
            <span className="hidden text-xs text-[#64748B] sm:block">{pageData.totalElements} thông báo</span>
          </div>

          {error && <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700" role="alert">{error}</div>}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center" aria-label="Đang tải thông báo">
              <span className="h-9 w-9 animate-spin rounded-full border-4 border-[#EA580C] border-t-transparent" />
            </div>
          ) : sortedNotifications.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFF0DC] text-[#EA580C]">
                {filter === 'unread' ? <Check size={30} /> : <Bell size={28} />}
              </span>
              <h2 className="font-black text-[#253044]">{filter === 'unread' ? 'Bạn đã đọc hết thông báo' : 'Chưa có thông báo nào'}</h2>
              <p className="mt-1 text-sm text-[#64748B]">Thông báo mới sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8E5DF]">
              <AnimatePresence initial={false}>
                {sortedNotifications.map((item) => {
                  const [metaLabel, MetaIcon] = TYPE_META[item.type] || TYPE_META.SYSTEM;
                  const label = (item.targetType === 'BADGE' || item.type === 'ACHIEVEMENT') ? 'Thành tích' : metaLabel;
                  const Icon = (item.targetType === 'BADGE' || item.type === 'ACHIEVEMENT') ? Trophy : MetaIcon;
                  const isUnread = !item.isRead;

                  return (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onClick={() => openItem(item)}
                      style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', textAlign: 'left' }}
                      className={`group relative flex items-start gap-4 p-5 transition-all text-left cursor-pointer ${
                        isUnread
                          ? '!bg-[#FFFDFB] border-l-4 border-l-[#EA580C] hover:!bg-[#FFF9F2]'
                          : '!bg-white border-l-4 border-l-transparent hover:!bg-stone-50/80'
                      }`}
                    >
                      {/* Left Icon */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-[#FFF0DC] text-[#EA580C] mt-0.5">
                        <Icon size={20} />
                      </div>

                      {/* Content Details */}
                      <div
                        className="min-w-0 flex-1 flex flex-col items-start text-left"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', width: '100%' }}
                      >
                        {/* Meta Line: Category Tag + MỚI badge + Relative Time */}
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="inline-flex items-center rounded-md bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 text-[11px] font-bold text-[#EA580C] uppercase tracking-wide">
                            {label}
                          </span>
                          {isUnread && (
                            <span className="inline-flex items-center rounded-full bg-[#EA580C] px-2 py-0.5 text-[10px] font-black text-white shadow-2xs">
                              MỚI
                            </span>
                          )}
                          <span className="text-stone-300">·</span>
                          <time className="text-xs font-medium text-[#94A3B8]">
                            {formatRelativeTime(item.createdAt)}
                          </time>
                        </div>

                        {/* Title */}
                        <h3 className={`w-full text-left text-base font-bold transition-colors group-hover:text-[#EA580C] m-0 ${
                          isUnread ? 'text-[#0F172A]' : 'text-[#334155]'
                        }`}>
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="w-full text-left mt-1 text-sm leading-relaxed text-[#64748B] m-0">
                          {item.message}
                        </p>
                      </div>

                      {/* Right Action Buttons */}
                      <div
                        className="flex shrink-0 items-center gap-1.5 pt-0.5 ml-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isUnread && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(item.id);
                            }}
                            title="Đánh dấu đã đọc"
                            aria-label="Đánh dấu đã đọc"
                            className="icon-action-btn read-btn"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(item.id);
                          }}
                          title="Xóa thông báo"
                          aria-label="Xóa thông báo"
                          className="icon-action-btn delete-btn"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {pageData.totalPages > 1 && (
            <nav className="flex items-center justify-between border-t border-[#E8E5DF] bg-[#FFFBF5] p-4" aria-label="Phân trang thông báo">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((value) => value - 1)}
                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold !bg-white hover:!bg-stone-50 active:!bg-white !text-[#253044] border border-[#E8E5DF] hover:border-[#EA580C] hover:!text-[#EA580C] disabled:opacity-40 disabled:hover:border-[#E8E5DF] disabled:hover:!text-[#253044] transition-colors !min-h-0 shadow-2xs"
              >
                <ChevronLeft size={15} /> Trước
              </button>
              <span className="text-xs font-bold text-[#64748B]">
                Trang {pageData.page} / {pageData.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= pageData.totalPages || loading}
                onClick={() => setPage((value) => value + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold !bg-white hover:!bg-stone-50 active:!bg-white !text-[#253044] border border-[#E8E5DF] hover:border-[#EA580C] hover:!text-[#EA580C] disabled:opacity-40 disabled:hover:border-[#E8E5DF] disabled:hover:!text-[#253044] transition-colors !min-h-0 shadow-2xs"
              >
                Sau <ChevronRight size={15} />
              </button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}

export default NotificationsPage;
