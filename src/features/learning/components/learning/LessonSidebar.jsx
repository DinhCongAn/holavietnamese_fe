import { useState, useRef, useEffect, useMemo } from 'react';
import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { Link } from 'react-router-dom';
import { LessonStatus } from '@/features/learning/components/learning/LessonStatus';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  X,
  Play,
  Search,
  Check,
  Lock,
  ChevronLeft
} from 'lucide-react';

export function LessonSidebar({
  lessons = [],
  courseId,
  currentId,
  isOpen = true,
  onClose,
  courseTitle = '',
  isDrawer = false,
}) {
  useTextLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const activeItemRef = useRef(null);
  const listContainerRef = useRef(null);

  // Thống kê tiến độ
  const completedCount = useMemo(
    () => lessons.filter((l) => l.isCompleted || l.learningStatus === 'COMPLETED').length,
    [lessons]
  );
  const totalCount = lessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Lọc bài học theo từ khóa tìm kiếm
  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons;
    const query = searchQuery.toLowerCase().trim();
    return lessons.filter((l, idx) => {
      const order = String(l.lessonOrder || idx + 1);
      const titleVi = (l.titleVi || l.title || '').toLowerCase();
      const titleEn = (l.title || '').toLowerCase();
      return order.includes(query) || titleVi.includes(query) || titleEn.includes(query);
    });
  }, [lessons, searchQuery]);

  // Tự động cuộn bài học hiện tại vào tầm nhìn
  useEffect(() => {
    if (activeItemRef.current && listContainerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentId]);

  return (
    <nav
      className={`lesson-roadmap-card w-full bg-white flex flex-col shadow-sm select-none transition-all ${
        isDrawer
          ? 'h-full border-0 rounded-none'
          : 'h-[calc(100vh-140px)] max-h-[840px] min-h-[500px] rounded-3xl border border-[#E8E5DF] overflow-hidden'
      }`}
      aria-label={bilingualLabel("Lộ trình bài học trong khóa", "Course roadmap")}
    >
      {/* ==================== ROADMAP HEADER ==================== */}
      <div className="shrink-0 bg-[#FFFDF9] border-b border-[#E8E5DF]/60 p-4 sm:p-5 space-y-3">
        {/* Top bar: Title + Count Badge + Close button (Mobile) */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#FFF2D6] border border-[#E8E5DF]/80 flex items-center justify-center text-[#FF7A00] shrink-0 shadow-2xs">
              <BookOpen size={15} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-[#253044] tracking-tight m-0 whitespace-nowrap">
                  <BilingualText vi="Lộ trình bài học" en="Course Roadmap" />
                </h2>
                <span className="px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold shrink-0">
                  <BilingualText vi={`${totalCount} bài`} en={`${totalCount} lessons`} />
                </span>
              </div>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={isDrawer
                ? bilingualLabel("Đóng danh sách bài", "Close lesson list")
                : bilingualLabel("Thu gọn lộ trình khóa học", "Collapse course roadmap")}
              title={isDrawer
                ? bilingualLabel("Đóng danh sách bài", "Close lesson list")
                : bilingualLabel("Thu gọn lộ trình khóa học", "Collapse course roadmap")}
              className="inline-flex h-7 w-7 min-h-0 shrink-0 items-center justify-center rounded-full border border-[#E8E5DF] !bg-white !p-0 text-[#24382B] shadow-xs transition-all hover:!border-[#24382B] hover:!bg-[#24382B] hover:!text-white cursor-pointer"
            >
              {isDrawer
                ? <X size={16} aria-hidden="true" />
                : <ChevronLeft size={16} aria-hidden="true" />}
            </button>
          )}
        </div>

        {/* Course title */}
        {courseTitle && (
          <p className="text-xs font-semibold text-[#64748B] line-clamp-1 m-0" title={courseTitle}>
            {courseTitle}
          </p>
        )}

        {/* Progress Tracker Card */}
        <div className="bg-[#FFF7E8]/70 rounded-2xl border border-[#E8E5DF]/50 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#253044]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span><BilingualText vi={`${completedCount}/${totalCount} bài hoàn thành`} en={`${completedCount}/${totalCount} lessons completed`} /></span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#FFF2D6] text-[#EA580C] font-black text-xs">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-stone-200/70 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FFA000] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Search input (especially helpful for 20-30+ lessons) */}
        {totalCount > 5 && (
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={bilingualLabel("Tìm bài học...", "Search lessons...")}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#E8E5DF]/80 rounded-xl focus:outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] placeholder:text-stone-400 text-[#253044]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                aria-label={bilingualLabel("Xóa tìm kiếm", "Clear search")}
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ==================== LESSON LIST (SCROLLABLE) ==================== */}
      <div
        ref={listContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 roadmap-custom-scrollbar"
      >
        {filteredLessons.length === 0 ? (
          <div className="text-center py-8 text-xs text-stone-400 font-medium">
            <BilingualText vi="Không tìm thấy bài học nào phù hợp." en="No matching lessons found." />
          </div>
        ) : (
          filteredLessons.map((lesson, idx) => {
            const isCurrent = String(lesson.id) === String(currentId);
            const isCompleted = lesson.isCompleted || lesson.learningStatus === 'COMPLETED';
            const isLocked = Boolean(lesson.isLocked) && !isCurrent;
            const lessonNumber = lesson.lessonOrder || idx + 1;
            const LessonLink = isLocked ? 'div' : Link;

            return (
              <div
                key={lesson.id || idx}
                ref={isCurrent ? activeItemRef : null}
              >
                <LessonLink
                  aria-current={isCurrent ? 'page' : undefined}
                  {...(isLocked
                    ? {
                        role: 'link',
                        'aria-disabled': true,
                        title: bilingualLabel('Hoàn thành các bài trước để mở khóa', 'Complete previous lessons to unlock'),
                      }
                    : {
                        to: `/courses/${courseId}/lessons/${lesson.id}`,
                        onClick: () => onClose?.(),
                      })}
                  className={`group relative flex items-center justify-between gap-3 p-3 rounded-2xl text-xs sm:text-sm transition-all no-underline ${
                    isCurrent
                      ? 'bg-[#FFF7E8] border-2 border-[#FF7A00] border-l-4 border-l-[#FF7A00] shadow-xs'
                      : isLocked
                      ? 'bg-stone-50 border border-stone-200 opacity-70 cursor-not-allowed'
                      : isCompleted
                      ? 'bg-white hover:bg-emerald-50/40 border border-stone-200 hover:border-emerald-300 shadow-2xs'
                      : 'bg-white hover:bg-[#FFFDF9] border border-stone-200 hover:border-[#E8E5DF] shadow-2xs'
                  }`}
                >
                  {/* Left: Number Badge */}
                  <span
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black flex items-center justify-center shrink-0 transition-transform ${
                      isCurrent
                        ? 'bg-[#FF7A00] text-white shadow-xs ring-2 ring-[#FF7A00]/20 scale-105'
                        : isLocked
                        ? 'bg-stone-100 text-stone-400'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200'
                    }`}
                  >
                    {isCompleted ? <Check size={14} className="stroke-[3]" /> : isLocked ? <Lock size={13} /> : lessonNumber}
                  </span>

                  {/* Middle: Title & Meta Info */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p
                      className={`font-bold line-clamp-2 leading-snug m-0 ${
                        isCurrent
                          ? 'text-[#FF7A00]'
                          : isCompleted
                          ? 'text-stone-800 group-hover:text-emerald-900'
                          : 'text-stone-700 group-hover:text-[#253044]'
                      }`}
                    >
                      <BilingualText vi={lesson.titleVi || lesson.title} en={lesson.title} />
                    </p>

                    {/* Meta: Duration & Status Badge */}
                    <div className="flex items-center gap-2 text-[11px] text-stone-400">
                      {lesson.estimatedDuration && (
                        <span className="inline-flex items-center gap-1 font-medium text-stone-500">
                          <Clock size={11} className="text-stone-400" />
                          <span>{lesson.estimatedDuration}m</span>
                        </span>
                      )}

                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-[#FFF2D6] text-[#EA580C] font-black text-[10px]">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7A00] opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF7A00]" />
                          </span>
                          <span><BilingualText vi="Đang học" en="In progress" /></span>
                        </span>
                      )}

                      {!isCurrent && isCompleted && (
                        <span className="text-emerald-600 font-semibold text-[10px]">
                          <BilingualText vi="Hoàn thành" en="Completed" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Status Icon */}
                  <div className="shrink-0 flex items-center">
                    {isCurrent ? (
                      <span className="w-6 h-6 rounded-lg bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00]">
                        <Play size={11} className="fill-[#FF7A00] ml-0.5" />
                      </span>
                    ) : isLocked ? (
                      <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-400 flex items-center justify-center">
                        <Lock size={12} />
                      </span>
                    ) : isCompleted ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                        <CheckCircle2 size={13} className="text-emerald-700" />
                      </span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-stone-300 group-hover:border-[#FF7A00]/60 transition-colors" />
                    )}
                  </div>
                </LessonLink>
              </div>
            );
          })
        )}
      </div>

      {/* ==================== ROADMAP FOOTER ==================== */}
      <div className="shrink-0 p-3 bg-stone-50 border-t border-[#E8E5DF]/40 text-center text-[11px] font-semibold text-stone-500">
        {completedCount === totalCount && totalCount > 0 ? (
          <span className="text-emerald-700 font-bold">
            <BilingualText vi="Bạn đã hoàn thành toàn bộ khóa học!" en="You have completed the entire course!" />
          </span>
        ) : (
          <span>
            <BilingualText vi={<>Còn <strong className="text-[#FF7A00]">{totalCount - completedCount}</strong> bài học chưa hoàn thành</>} en={<><strong className="text-[#FF7A00]">{totalCount - completedCount}</strong> lessons remaining</>} />
          </span>
        )}
      </div>
    </nav>
  );
}

export default LessonSidebar;
