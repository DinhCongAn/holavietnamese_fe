import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, BookOpen, Check, CheckCheck, ChevronLeft, ChevronRight, Flame, LockKeyhole, ShieldCheck, Sparkles, Trash2, Trophy } from 'lucide-react';
import { useNotifications } from '@/features/account/hooks/useNotifications';
import { formatRelativeTime } from '@/constants/notifications';

const PAGE_SIZE = 10;
const TYPE_META = {
  SYSTEM: ['Hệ thống', Bell], WELCOME: ['Chào mừng', Sparkles], COURSE: ['Khóa học', BookOpen],
  LESSON: ['Bài học', BookOpen], QUIZ: ['Bài kiểm tra', Sparkles], ACHIEVEMENT: ['Thành tích', Trophy],
  STREAK: ['Chuỗi học', Flame], CONTENT_REVIEW: ['Duyệt nội dung', ShieldCheck], SECURITY: ['Bảo mật', LockKeyhole],
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
    if (item.linkUrl) navigate(item.linkUrl);
  };

  return (
    <main className="min-h-screen bg-[#FFFCF7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#FFF0DC] px-3 py-1 text-xs font-bold text-[#C2410C]"><Bell size={13} /> TRUNG TÂM THÔNG BÁO</span>
            <h1 className="text-3xl font-black tracking-tight text-[#253044]">Thông báo của bạn</h1>
            <p className="mt-1 text-sm text-[#64748B]">Theo dõi bài học, thành tích và các cập nhật quan trọng.</p>
          </div>
          <button type="button" disabled={busy || unreadCount === 0} onClick={markAllAsRead}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EA580C] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#C2410C] disabled:cursor-not-allowed disabled:opacity-50">
            <CheckCheck size={17} /> Đánh dấu tất cả đã đọc
          </button>
        </header>

        <section className="overflow-hidden rounded-3xl border border-[#E8E5DF] bg-white shadow-[0_12px_40px_rgba(67,25,20,0.06)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#E8E5DF] bg-[#FFF7E8] p-4">
            <div className="flex gap-2" role="tablist" aria-label="Lọc thông báo">
              <button type="button" role="tab" aria-selected={filter === 'all'} onClick={() => selectFilter('all')}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${filter === 'all' ? 'bg-[#EA580C] text-white' : 'bg-white text-[#64748B] hover:text-[#253044]'}`}>Tất cả</button>
              <button type="button" role="tab" aria-selected={filter === 'unread'} onClick={() => selectFilter('unread')}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${filter === 'unread' ? 'bg-[#EA580C] text-white' : 'bg-white text-[#64748B] hover:text-[#253044]'}`}>Chưa đọc <span className="ml-1 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">{unreadCount}</span></button>
            </div>
            <span className="hidden text-xs text-[#64748B] sm:block">{pageData.totalElements} thông báo</span>
          </div>

          {error && <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700" role="alert">{error}</div>}
          {loading ? (
            <div className="flex min-h-64 items-center justify-center" aria-label="Đang tải thông báo"><span className="h-9 w-9 animate-spin rounded-full border-4 border-[#EA580C] border-t-transparent" /></div>
          ) : pageData.content.length === 0 ? (
            <div className="px-6 py-20 text-center"><span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFF0DC] text-[#EA580C]">{filter === 'unread' ? <Check size={30} /> : <Bell size={28} />}</span>
              <h2 className="font-black text-[#253044]">{filter === 'unread' ? 'Bạn đã đọc hết thông báo' : 'Chưa có thông báo nào'}</h2>
              <p className="mt-1 text-sm text-[#64748B]">Thông báo mới sẽ xuất hiện tại đây.</p></div>
          ) : (
            <div className="divide-y divide-[#E8E5DF]">
              <AnimatePresence initial={false}>
                {pageData.content.map((item) => {
                  const [label, Icon] = TYPE_META[item.type] || TYPE_META.SYSTEM;
                  return <motion.article key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
                    className={`group flex gap-4 p-4 transition-colors sm:p-5 ${item.isRead ? 'bg-white hover:bg-stone-50' : 'bg-orange-50/60 hover:bg-orange-50'}`}>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-[#FFF0DC] text-[#EA580C]"><Icon size={20} /></span>
                    <button type="button" onClick={() => openItem(item)} className="min-w-0 flex-1 text-left">
                      <span className="mb-1 flex flex-wrap items-center gap-2"><span className="text-[10px] font-black uppercase tracking-wider text-[#EA580C]">{label}</span>
                        {!item.isRead && <span className="rounded-full bg-[#EA580C] px-2 py-0.5 text-[9px] font-black text-white">MỚI</span>}
                        <time className="text-[11px] text-stone-400">{formatRelativeTime(item.createdAt)}</time></span>
                      <strong className={`block text-sm sm:text-base ${item.isRead ? 'text-[#253044]' : 'text-[#C2410C]'}`}>{item.title}</strong>
                      <span className="mt-1 block text-sm leading-relaxed text-[#64748B]">{item.message}</span>
                    </button>
                    <div className="flex shrink-0 items-start gap-1">
                      {!item.isRead && <button type="button" disabled={busy} onClick={() => markAsRead(item.id)} title="Đánh dấu đã đọc" aria-label="Đánh dấu đã đọc" className="rounded-lg p-2 text-[#64748B] hover:bg-white hover:text-emerald-700 disabled:opacity-50"><Check size={17} /></button>}
                      <button type="button" disabled={busy} onClick={() => deleteNotification(item.id)} title="Xóa thông báo" aria-label="Xóa thông báo" className="rounded-lg p-2 text-[#64748B] hover:bg-red-50 hover:text-red-700 disabled:opacity-50"><Trash2 size={17} /></button>
                    </div>
                  </motion.article>;
                })}
              </AnimatePresence>
            </div>
          )}

          {pageData.totalPages > 1 && <nav className="flex items-center justify-between border-t border-[#E8E5DF] bg-[#FFF7E8] p-4" aria-label="Phân trang thông báo">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-[#253044] hover:bg-white disabled:opacity-40"><ChevronLeft size={15} /> Trước</button>
            <span className="text-xs font-bold text-[#64748B]">Trang {pageData.page} / {pageData.totalPages}</span>
            <button type="button" disabled={page >= pageData.totalPages || loading} onClick={() => setPage((value) => value + 1)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-[#253044] hover:bg-white disabled:opacity-40">Sau <ChevronRight size={15} /></button>
          </nav>}
        </section>
      </div>
    </main>
  );
}

export default NotificationsPage;
