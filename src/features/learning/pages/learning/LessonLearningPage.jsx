import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { learningService } from '@/features/learning/api/learningService';
import { useLearning } from '@/features/learning/hooks/useLearning';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { LessonSidebar } from '@/features/learning/components/learning/LessonSidebar';
import { LessonContent } from '@/features/learning/components/learning/LessonContent';
import { LessonNavigation } from '@/features/learning/components/learning/LessonNavigation';
import { vocabularyService } from '@/features/vocabulary/api/vocabularyService';
import { LessonActivities } from '@/features/learning/components/learning/LessonActivities';
import { useAiSidebar } from '@/features/ai/context/AiSidebarContext';
import { ArrowLeft, CheckCircle2, Bookmark, ChevronLeft, ChevronRight, Check, AlertCircle, Lock } from 'lucide-react';

function LessonContextSyncer({ lesson, course, contentLesson, courseId }) {
  const { setLearningContext } = useAiSidebar();
  useEffect(() => {
    if (lesson) {
      const rawContent = contentLesson?.content || lesson.content || lesson.summary || lesson.description || '';
      setLearningContext({
        courseId: courseId || course?.id,
        courseTitle: course?.titleVi || course?.title || '',
        lessonId: lesson.id,
        lessonTitle: lesson.titleVi || lesson.title || '',
        lessonContent: rawContent,
        vocabulary: lesson.vocabulary || contentLesson?.vocabulary || [],
      });
    }
    return () => {
      setLearningContext(null);
    };
  }, [lesson, course, contentLesson, courseId, setLearningContext]);
  return null;
}

export function LessonLearningPage() {
  useTextLanguage();
  const { courseId, lessonId } = useParams();
  return <LessonScreen key={courseId} courseId={courseId} lessonId={lessonId} />;
}

function LessonScreen({ courseId, lessonId }) {
  const navigate = useNavigate();
  const resource = useLearning(courseId, lessonId);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [savingSelection, setSavingSelection] = useState(false);
  const [selectionAction, setSelectionAction] = useState(null);
  const [saveNotice, setSaveNotice] = useState(null);
  const [contentLesson, setContentLesson] = useState(null);
  const lessonContentRef = useRef(null);
  const saveNoticeTimeoutRef = useRef(null);

  // Trạng thái mở/đóng thanh bên (Sidebar danh sách bài học)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mặc định mở thanh bên trên màn hình lớn
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    setSelectionAction(null);
  }, [lessonId]);

  useEffect(() => () => window.clearTimeout(saveNoticeTimeoutRef.current), []);

  function showSaveNotice(type, text) {
    window.clearTimeout(saveNoticeTimeoutRef.current);
    setSaveNotice({ type, text });
    saveNoticeTimeoutRef.current = window.setTimeout(() => setSaveNotice(null), 5000);
  }

  function captureSelectedVocabulary() {
    window.setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setSelectionAction(null);
        return;
      }

      const range = selection.getRangeAt(0);
      if (!lessonContentRef.current?.contains(range.commonAncestorContainer)) {
        setSelectionAction(null);
        return;
      }

      const word = selection.toString().replace(/\s+/g, ' ').trim();
      if (!word || word.length > 200) {
        setSelectionAction(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      setSelectionAction({
        word,
        context: (range.commonAncestorContainer.parentElement?.textContent || word)
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 500),
        left: Math.min(Math.max(rect.left + rect.width / 2, 88), window.innerWidth - 88),
        top: Math.max(rect.top - 12, 56),
      });
    }, 0);
  }

  async function saveSelectedVocabulary(selection = selectionAction) {
    if (!selection?.word || savingSelection) return;
    setSavingSelection(true);
    setSaveNotice(null);
    window.getSelection()?.removeAllRanges();
    try {
      const enriched = await vocabularyService.enrichWord({
        word: selection.word,
        context: selection.context,
        lessonTitle: resource.data?.lesson?.titleVi || resource.data?.lesson?.title || '',
      });
      await vocabularyService.add({
        lessonId: Number(lessonId),
        word: selection.word,
        meaning: enriched.meaning,
        pronunciation: enriched.pronunciation || '',
        exampleSentence: enriched.exampleSentence || '',
        note: enriched.note || '',
      });
      showSaveNotice('success', bilingualLabel(
        `Đã dịch và lưu “${selection.word}” vào sổ tay thành công.`,
        `Successfully translated and saved “${selection.word}” to your notebook.`,
      ));
    } catch (e) {
      showSaveNotice('error', bilingualLabel(
        `Lưu “${selection.word}” thất bại. ${e.message || 'Vui lòng thử lại.'}`,
        `Failed to save “${selection.word}”. ${e.message || 'Please try again.'}`,
      ));
    } finally {
      setSavingSelection(false);
      setSelectionAction(null);
    }
  }

  function saveSelectionFromPointer(event) {
    event.preventDefault();
    event.stopPropagation();
    void saveSelectedVocabulary(selectionAction);
  }

  function saveSelectionFromKeyboard(event) {
    if (event.detail === 0) void saveSelectedVocabulary(selectionAction);
  }

  async function complete() {
    setPending(true);
    setError('');
    try {
      await learningService.complete(lessonId);
      resource.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <ResourceState resource={resource}>
      {({ course, lesson, lessons, progress, locked, requiredLesson }) => {
        if (locked) {
          const requiredLessonUrl = requiredLesson
            ? `/courses/${courseId}/lessons/${requiredLesson.id}`
            : `/courses/${courseId}`;

          return (
            <section className="max-w-2xl mx-auto rounded-3xl border border-amber-200 bg-white p-6 sm:p-8 shadow-sm text-center space-y-5">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <Lock size={26} />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#253044] m-0">
                  <BilingualText vi="Bài học chưa được mở khóa" en="Lesson is locked" />
                </h1>
                <p className="text-sm text-[#64748B] m-0">
                  <BilingualText
                    vi={requiredLesson
                      ? `Bạn cần hoàn thành “${requiredLesson.titleVi || requiredLesson.title}” trước khi học bài này.`
                      : 'Bạn cần hoàn thành các bài học đứng trước trước khi học bài này.'}
                    en={requiredLesson
                      ? `Complete “${requiredLesson.title || requiredLesson.titleVi}” before opening this lesson.`
                      : 'Complete the previous lessons before opening this lesson.'}
                  />
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Link className="button secondary" to={`/courses/${courseId}`}>
                  <ArrowLeft size={14} />
                  <BilingualText vi="Về khóa học" en="Back to course" />
                </Link>
                <Link className="button" to={requiredLessonUrl}>
                  <BilingualText vi="Học bài cần hoàn thành" en="Open required lesson" />
                </Link>
              </div>
            </section>
          );
        }

        return (
          <>
            <LessonContextSyncer lesson={lesson} course={course} contentLesson={contentLesson} courseId={courseId} />
          <div className="lesson-learning-screen w-full max-w-none space-y-4 transition-all duration-300">
            {/* ===================== TOP HEADER BAR ===================== */}
            <header className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#E8E5DF] p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs sticky top-2 z-30 transition-all">
              {/* Cụm trái: Nút quay lại & Tiêu đề bài học */}
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  to={`/courses/${courseId}`}
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors no-underline shrink-0"
                >
                  <ArrowLeft size={14} />
                  <span className="hidden sm:inline">
                    <BilingualText vi="Khóa học" en="Course" />
                  </span>
                </Link>

                <div className="h-4 w-[1px] bg-stone-200 hidden sm:block shrink-0" />

                <div className="min-w-0 flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 shrink-0">
                    <BilingualText
                      vi={`BÀI ${lesson.lessonOrder || ''}`}
                      en={`LESSON ${lesson.lessonOrder || ''}`}
                    />
                  </span>
                  <h1 className="text-sm sm:text-base font-extrabold text-stone-900 truncate tracking-tight m-0">
                    <BilingualText vi={lesson.titleVi || lesson.title} en={lesson.title} />
                  </h1>
                </div>
              </div>

              {/* Cụm phải: Tiến độ học & Nút tiện ích */}
              <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                {/* Chỉ số tiến độ hoàn thành khóa học */}
                <div
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-stone-50 border border-stone-200/60 text-xs font-medium text-stone-600"
                  title={bilingualLabel(`${progress?.completedLessons || 0}/${progress?.totalLessons || 0} bài đã xong`, `${progress?.completedLessons || 0}/${progress?.totalLessons || 0} lessons completed`)}
                >
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>
                    {progress?.completedLessons || 0}/{progress?.totalLessons || 0}{' '}
                    <span className="hidden lg:inline">
                      <BilingualText vi="bài" en="lessons" />
                    </span>
                  </span>
                  <div className="w-12 h-1.5 bg-stone-200 rounded-full overflow-hidden hidden sm:block ml-0.5">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress?.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>

                {/* Trên màn hình nhỏ, nút này mở drawer danh sách bài. Desktop dùng nút trong Course Roadmap. */}
                <button
                  type="button"
                  onClick={() => setSidebarOpen((v) => !v)}
                  className="lg:hidden ml-auto inline-flex h-9 w-9 min-h-0 items-center justify-center rounded-full border border-[#E8E5DF] !bg-white !p-0 text-[#24382B] shadow-xs transition-all hover:!border-[#24382B] hover:!bg-[#24382B] hover:!text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24382B] cursor-pointer"
                  title={sidebarOpen ? bilingualLabel('Ẩn danh sách bài', 'Hide lesson list') : bilingualLabel('Hiện danh sách bài', 'Show lesson list')}
                  aria-label={sidebarOpen ? bilingualLabel('Ẩn danh sách bài', 'Hide lesson list') : bilingualLabel('Hiện danh sách bài', 'Show lesson list')}
                  aria-expanded={sidebarOpen}
                >
                  {sidebarOpen ? <ChevronLeft size={18} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
                </button>
              </div>
            </header>

            {/* Thông báo kết quả AI dịch và lưu từ luôn hiển thị trong khung nhìn hiện tại. */}
            {saveNotice && (
              <div
                role={saveNotice.type === 'success' ? 'status' : 'alert'}
                aria-live={saveNotice.type === 'success' ? 'polite' : 'assertive'}
                className={`fixed bottom-5 right-5 z-[80] max-w-sm p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xl animate-bounce-subtle ${
                  saveNotice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {saveNotice.type === 'success'
                  ? <Check size={16} className="text-emerald-600 shrink-0" />
                  : <AlertCircle size={16} className="text-rose-600 shrink-0" />}
                <span>{saveNotice.text}</span>
              </div>
            )}

            {/* Thông báo lỗi nếu có */}
            {error && (
              <p role="alert" className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold">
                <BilingualText>{error}</BilingualText>
              </p>
            )}

            {/* ===================== MAIN LAYOUT ===================== */}
            <div className="relative">
              <div className="flex gap-4 items-start">
                {/* 1. Sidebar máy tính để bàn (Desktop) */}
                {sidebarOpen && (
                  <aside className="w-80 shrink-0 hidden lg:block sticky top-20 self-start">
                    <LessonSidebar
                      lessons={lessons}
                      courseId={courseId}
                      currentId={lesson.id}
                      onClose={() => setSidebarOpen(false)}
                      courseTitle={course?.titleVi || course?.title}
                    />
                  </aside>
                )}

                {!sidebarOpen && (
                  <aside className="hidden lg:flex w-10 shrink-0 sticky top-20 self-start justify-center pt-4">
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(true)}
                      className="inline-flex h-9 w-9 min-h-0 items-center justify-center rounded-full border border-[#E8E5DF] !bg-white !p-0 text-[#24382B] shadow-sm transition-all hover:!border-[#24382B] hover:!bg-[#24382B] hover:!text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24382B] cursor-pointer"
                      title={bilingualLabel('Mở lộ trình khóa học', 'Show course roadmap')}
                      aria-label={bilingualLabel('Mở lộ trình khóa học', 'Show course roadmap')}
                      aria-expanded="false"
                    >
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  </aside>
                )}

                {/* 2. Nội dung bài học chính */}
                <main
                  ref={lessonContentRef}
                  className="flex-1 min-w-0 space-y-4"
                  onMouseUp={captureSelectedVocabulary}
                  onTouchEnd={captureSelectedVocabulary}
                >
                  {/* Hoạt động bài học (Activities) */}
                  <LessonActivities
                    onLessonLoaded={setContentLesson}
                    onActivityChange={(result) => {
                      if (result.completed) resource.reload();
                    }}
                    lessonId={lesson.id}
                    courseId={courseId}
                    nextLessonId={lesson.nextLessonId}
                    onNextLesson={() => {
                      if (lesson.nextLessonId) {
                        navigate(`/courses/${courseId}/lessons/${lesson.nextLessonId}`);
                      }
                    }}
                    fallback={
                      <div className="card">
                        <LessonContent lesson={lesson} />
                      </div>
                    }
                  />

                  {/* Bài có hoạt động được tự hoàn thành từ tiến độ hoạt động và quiz. */}
                  <LessonNavigation
                    lesson={lesson}
                    pending={pending}
                    onComplete={complete}
                    courseId={courseId}
                    showComplete={String(contentLesson?.id) === String(lesson.id) && !contentLesson.activities?.length}
                  />
                </main>
              </div>

              {/* 3. Mobile / Tablet Drawer cho Sidebar */}
              {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                  />

                  {/* Drawer Content */}
                  <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl z-10 flex flex-col">
                    <LessonSidebar
                      lessons={lessons}
                      courseId={courseId}
                      currentId={lesson.id}
                      onClose={() => setSidebarOpen(false)}
                      courseTitle={course?.titleVi || course?.title}
                      isDrawer
                    />
                  </div>
                </div>
              )}
            </div>

            {selectionAction && (
              <button
                type="button"
                className="fixed z-[70] -translate-x-1/2 -translate-y-full inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-stone-800 shadow-xl hover:bg-amber-50"
                style={{ left: selectionAction.left, top: selectionAction.top }}
                onPointerDown={saveSelectionFromPointer}
                onClick={saveSelectionFromKeyboard}
                disabled={savingSelection}
                aria-label={bilingualLabel(`Lưu “${selectionAction.word}” vào sổ tay`, `Save “${selectionAction.word}” to notebook`)}
              >
                <Bookmark size={14} className="text-amber-600" />
                <BilingualText
                  vi={savingSelection ? 'AI đang dịch và lưu…' : 'AI dịch & lưu vào sổ tay'}
                  en={savingSelection ? 'AI is translating and saving…' : 'AI translate & save'}
                />
              </button>
            )}
          </div>
          </>
        );
      }}
    </ResourceState>
  );
}
export default LessonLearningPage;
