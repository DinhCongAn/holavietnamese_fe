import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Check, Lock } from 'lucide-react';

export function LessonNavigation({ lesson, pending, onComplete, showComplete = true }) {
  useTextLanguage();
  const path = (id) => `/courses/${lesson.courseId}/lessons/${id}`;

  return (
    <div className="lesson-navigation flex items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E5DF] shadow-sm">
      {/* Nút Bài trước */}
      <div>
        {lesson.previousLessonId ? (
          <Link
            className="button secondary inline-flex items-center gap-2 py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold text-[#253044] bg-[#FFF7E8] hover:bg-[#FFF2D6] border border-[#E8E5DF] hover:border-[#EA580C] transition-all no-underline shadow-2xs active:scale-95"
            to={path(lesson.previousLessonId)}
          >
            <ArrowLeft size={15} />
            <BilingualText>{"Bài trước"}</BilingualText>
          </Link>
        ) : (
          <span className="w-20 sm:w-24 inline-block" />
        )}
      </div>

      {/* Nút Hoàn thành bài học / Đã hoàn thành */}
      <div className="flex items-center gap-3">
        {lesson.isCompleted ? (
          <span role="status" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700">
            <Check size={16} strokeWidth={3} />
            <BilingualText>{"Đã hoàn thành bài học"}</BilingualText>
          </span>
        ) : showComplete ? (
        <button
          type="button"
          disabled={pending || lesson.isCompleted}
          onClick={onComplete}
          className={`button inline-flex items-center justify-center gap-2 py-3 px-5 sm:px-7 rounded-2xl text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer active:scale-95 ${
            lesson.isCompleted
              ? 'bg-emerald-600 text-white cursor-default opacity-95 shadow-emerald-900/10'
              : 'bg-[#FF7A00] hover:bg-[#EA580C] text-white hover:shadow-lg'
          }`}
        >
          {pending ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <BilingualText>{"Đang lưu…"}</BilingualText>
            </>
          ) : lesson.isCompleted ? (
            <>
              <Check size={16} strokeWidth={3} />
              <BilingualText>{"Đã hoàn thành bài học"}</BilingualText>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <BilingualText>{"Hoàn thành bài học"}</BilingualText>
            </>
          )}
        </button>
        ) : null}
      </div>

      {/* Nút Bài tiếp theo */}
      <div>
        {lesson.nextLessonId && lesson.isCompleted ? (
          <Link
            className="button secondary inline-flex items-center gap-2 py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#24382B] hover:bg-[#1a291f] shadow-sm hover:shadow-md transition-all no-underline active:scale-95"
            to={path(lesson.nextLessonId)}
          >
            <BilingualText>{"Bài tiếp theo"}</BilingualText>
            <ArrowRight size={15} />
          </Link>
        ) : lesson.nextLessonId ? (
          <button
            type="button"
            disabled
            title={bilingualLabel("Hoàn thành bài học hiện tại để mở bài tiếp theo", "Complete the current lesson to unlock the next one")}
            className="button secondary inline-flex items-center gap-2 py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold text-stone-400 bg-stone-100 border border-stone-200 cursor-not-allowed"
          >
            <BilingualText vi="Hoàn thành bài này trước" en="Complete this lesson first" />
            <Lock size={14} />
          </button>
        ) : (
          <span className="w-20 sm:w-24 inline-block" />
        )}
      </div>
    </div>
  );
}

export default LessonNavigation;
