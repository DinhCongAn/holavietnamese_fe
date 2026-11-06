import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { contentService } from '@/features/learning/api/contentService';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { Artwork, SpeakButton, Notice, EmptyState } from '@/shared/components/common/Ui';
import { RichText } from '@/shared/components/common/RichText';
import { SafeImportedHtml } from '@/shared/components/common/SafeImportedHtml';
import { ProgressBar } from '@/shared/components/common/ProgressBar';
import { QuestionInput } from '@/features/learning/components/learning/QuestionInput';
import { answerPresent } from '@/features/learning/components/learning/answerUtils';
import { vocabularyService } from '@/features/vocabulary/api/vocabularyService';
import { ContentImage } from '@/shared/components/common/ContentImage';
import { mediaSource } from '@/shared/components/common/mediaSource';
import { MediaPlayer } from '@/features/learning/components/learning/MediaPlayer';
import alphabetData from '@/features/alphabet/alphabet.json';
import { MessageCircle, BookOpen, FileText, CheckSquare, Award, Layers, LayoutGrid, Languages, Bookmark, CheckCircle2, ArrowLeft, ArrowRight, RotateCcw, Headphones, Check, Pause, Play, Lightbulb, AlertCircle, ZoomIn, X } from 'lucide-react';
import { getStoredAudioSpeed, isAutoTranslateEnabled, isPronunciationHintsEnabled } from '@/features/account/services/userSettingsService';

const alphabetAudioBySymbol = new Map(
  alphabetData.letters.map(({ symbol, id }) => [symbol, `/media/alphabet/${id}.wav`])
);

function alphabetAudioFor(item) {
  const symbol = item.wordVi;
  return typeof symbol === 'string' && item.meaningEn === symbol.toLocaleUpperCase('vi')
    ? alphabetAudioBySymbol.get(symbol)
    : undefined;
}

const practiceTypes = [
  'MULTIPLE_CHOICE',
  'FILL_BLANK',
  'MATCHING',
  'REORDER_SENTENCE',
  'LISTEN_AND_CHOOSE',
  'LISTEN_AND_TYPE',
  'LISTENING',
  'TRANSLATION',
  'PRACTICE',
];
const externalTypes = ['AI_CONVERSATION', 'AI_ROLEPLAY', 'PRONUNCIATION'];

/**
 * Tự động phát hiện thanh điệu tiếng Việt (Ngang, Huyền, Sắc, Hỏi, Ngã, Nặng)
 */
export function detectVietnameseTone(word = '') {
  const str = String(word).normalize('NFD');
  if (str.includes('\u0301'))
    return { key: 'SAC', nameVi: 'Thanh Sắc', nameEn: 'Rising Tone', symbol: '´', badgeClass: 'bg-orange-100 text-orange-800 border-orange-300' };
  if (str.includes('\u0300'))
    return { key: 'HUYEN', nameVi: 'Thanh Huyền', nameEn: 'Falling Tone', symbol: '`', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  if (str.includes('\u0309'))
    return { key: 'HOI', nameVi: 'Thanh Hỏi', nameEn: 'Dipping Tone', symbol: '̉', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300' };
  if (str.includes('\u0303'))
    return { key: 'NGA', nameVi: 'Thanh Ngã', nameEn: 'Glottal Tone', symbol: '~', badgeClass: 'bg-pink-100 text-pink-800 border-pink-300' };
  if (str.includes('\u0323'))
    return { key: 'NANG', nameVi: 'Thanh Nặng', nameEn: 'Dropping Tone', symbol: '.', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' };
  return { key: 'NGANG', nameVi: 'Thanh Ngang', nameEn: 'Level Tone', symbol: '—', badgeClass: 'bg-sky-100 text-sky-800 border-sky-300' };
}

function getActivityTypeIcon(type) {
  if (type === 'DIALOGUE') return MessageCircle;
  if (type === 'VOCABULARY' || type === 'FLASHCARD') return BookOpen;
  if (type === 'GRAMMAR') return FileText;
  if (practiceTypes.includes(type)) return CheckSquare;
  if (type === 'QUIZ') return Award;
  if (externalTypes.includes(type)) return MessageCircle;
  return BookOpen;
}

function activityContent(activity) {
  if (typeof activity?.contentJson !== 'string') return activity?.contentJson || {};
  try {
    return JSON.parse(activity.contentJson);
  } catch {
    return {};
  }
}

function activityHasImage(activity) {
  const content = activityContent(activity);
  return Boolean(
    content.imageUrl ||
    content.illustrations?.some((item) => item?.imageUrl) ||
    content.items?.some((item) => item?.imageUrl || item?.image)
  );
}

export function LessonActivities({
  lessonId,
  fallback,
  onProgress,
  previewLesson,
  previewAll = false,
  courseId,
  nextLessonId,
  onNextLesson,
  onLessonLoaded,
}) {
  const resource = useAsyncResource(
    useCallback(
      (signal) =>
        previewLesson
          ? Promise.resolve(previewLesson)
          : contentService.lesson(lessonId, signal),
      [lessonId, previewLesson]
    )
  );

  useEffect(() => {
    if (resource.data && String(resource.data.id) === String(lessonId)) {
      onLessonLoaded?.(resource.data);
    }
  }, [resource.data, lessonId, onLessonLoaded]);

  return (
    <ResourceState resource={resource}>
      {(lesson) =>
        lesson.activities?.length ? (
          previewAll ? (
            <LessonAllActivitiesPreview key={lesson.id} lesson={lesson} />
          ) : (
            <ActivityWorkspace
              key={lesson.id}
              lesson={lesson}
              preview={!!previewLesson}
              onProgress={onProgress}
              courseId={courseId}
              nextLessonId={nextLessonId || lesson.nextLessonId}
              onNextLesson={onNextLesson}
            />
          )
        ) : (
          fallback
        )
      }
    </ResourceState>
  );
}

function LessonAllActivitiesPreview({ lesson }) {
  return (
    <div className="activity-workspace space-y-6">
      <Notice>
        <BilingualText vi="Bản xem trước hiển thị toàn bộ hoạt động theo đúng thứ tự của bài học." en="This preview shows every activity in lesson order." />
      </Notice>
      {lesson.activities.map((activity, index) => (
        <PreviewActivityCard
          key={activity.id}
          activity={activity}
          index={index}
          lesson={lesson}
        />
      ))}
    </div>
  );
}

function PreviewActivityCard({ activity, index, lesson }) {
  const [answer, setAnswer] = useState({});
  const hasImage = activityHasImage(activity);
  return (
    <article className={`activity-card bg-white rounded-3xl border border-[#E8E5DF] p-6 sm:p-8 shadow-sm space-y-6 activity-${activity.activityType.toLowerCase()} ${hasImage ? 'activity-has-image' : 'activity-no-image'}`}>
      <div className="border-b border-[#E8E5DF]/40 pb-5 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#FFF2D6] text-[#EA580C] font-black text-xs uppercase tracking-wider border border-[#FFCD00]/50">
            <BilingualText vi={`Hoạt động ${index + 1} · ${activity.activityType.replaceAll('_', ' ')}`} en={`Activity ${index + 1} · ${activity.activityType.replaceAll('_', ' ')}`} />
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-bold">
            <BilingualText>{activity.status}</BilingualText>
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#253044] tracking-tight">
          <BilingualText vi={activity.titleVi || activity.title} en={activity.title} />
        </h2>
        {(activity.instructionVi || activity.instruction) && (
          <p className="lead text-sm sm:text-base text-[#64748B] leading-relaxed">
            <BilingualText vi={activity.instructionVi || activity.instruction} en={activity.instruction} />
          </p>
        )}
      </div>
      <ActivityBody
        activity={activity}
        lesson={lesson}
        lessonId={lesson.id}
        answer={answer}
        setAnswer={setAnswer}
        busy={false}
        preview
      />
    </article>
  );
}

function ActivityWorkspace({
  lesson,
  preview,
  onProgress,
  courseId,
  nextLessonId,
  onNextLesson,
}) {
  const [params, setParams] = useSearchParams();
  useTextLanguage();
  const workspaceRef = useRef(null);
  const activities = lesson.activities || [];
  const requested = activities.findIndex(
    (activity) => String(activity.id) === params.get('activity')
  );

  const defaultIndex = useMemo(() => {
    if (requested >= 0) return requested;
    const firstIncomplete = activities.findIndex(
      (act) => !lesson.progress?.activities?.some(
        (p) => String(p.activityId) === String(act.id) && p.status === 'COMPLETED'
      )
    );
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  }, [requested, activities, lesson.progress]);

  const [index, setIndex] = useState(defaultIndex);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [progress, setProgress] = useState(lesson.progress);
  const [answer, setAnswer] = useState({});

  const activity = activities[index] || activities[0];
  const exercise = practiceTypes.includes(activity?.activityType);
  const external = externalTypes.includes(activity?.activityType);
  const hasImage = activityHasImage(activity);

  // Do not expose the floating AI helper while the learner is on a quiz gate.
  useEffect(() => {
    const quizActive = activity?.activityType === 'QUIZ';
    document.body.classList.toggle('ai-quiz-active', quizActive);
    return () => document.body.classList.remove('ai-quiz-active');
  }, [activity?.id, activity?.activityType]);

  const change = (next) => {
    setIndex(next);
    setAnswer({});
    setError('');
    setFeedback('');
    if (!preview && activities[next]) {
      setParams({ activity: String(activities[next].id) }, { replace: true });
    }
    if (workspaceRef.current) {
      workspaceRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  async function complete() {
    setBusy(true);
    setError('');
    setFeedback('');
    try {
      const result = await contentService.completeActivity(
        activity.id,
        exercise ? answer : undefined
      );
      setProgress(result);
      onProgress?.(result);

      if (!result.activityCompleted) {
        setFeedback('Chưa chính xác. Hãy kiểm tra lại câu trả lời và thử lại nhé!');
        return;
      }

      setFeedback(
        isLastActivity
          ? 'Hoàn thành xuất sắc! Bạn đã hoàn thành toàn bộ hoạt động của bài học.'
          : 'Hoàn thành xuất sắc! Đã ghi nhận tiến độ hoạt động.'
      );

      if (index + 1 < activities.length) {
        setTimeout(() => {
          change(index + 1);
        }, 400);
      } else if (onNextLesson && (nextLessonId || lesson.nextLessonId)) {
        setTimeout(() => {
          onNextLesson();
        }, 650);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const completed = progress?.activities?.some(
    (item) => String(item.activityId) === String(activity?.id) && item.status === 'COMPLETED'
  );

  const isLastActivity = index + 1 === activities.length;

  return (
    <div ref={workspaceRef} className="activity-workspace space-y-6">
      {preview && (
        <Notice>
          <BilingualText>
            {"Chế độ xem trước: Các thao tác ở đây không ghi nhận điểm hoặc tiến độ học viên."}
          </BilingualText>
        </Notice>
      )}

      {/* Thông tin giới thiệu & Mục tiêu bài học (nếu có) */}
      {(lesson.objectiveVi || lesson.objectiveEn || lesson.descriptionVi || lesson.description || lesson.introduction?.textVi || lesson.content) && (
        <details className="lesson-overview-banner group rounded-2xl border border-[#E8E5DF] bg-gradient-to-r from-[#FFFDF9] to-[#FFF7E8] p-4 text-xs shadow-2xs open:shadow-xs transition-all">
          <summary className="flex items-center justify-between cursor-pointer list-none font-bold text-[#253044] select-none">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#FFF2D6] text-[#EA580C] flex items-center justify-center">
                <BookOpen size={13} />
              </span>
              <span>
                <BilingualText>{"Mục tiêu & Giới thiệu bài học"}</BilingualText>
              </span>
            </span>
            <span className="text-[11px] font-semibold text-[#EA580C] group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>

          <div className="pt-3.5 mt-2 border-t border-[#E8E5DF]/40 space-y-2 text-stone-700 leading-relaxed">
            {(lesson.objectiveVi || lesson.objectiveEn) && (
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#EA580C] shrink-0"><BilingualText>{"Mục tiêu:"}</BilingualText></span>
                <span className="font-medium text-[#253044]">
                  <BilingualText vi={lesson.objectiveVi} en={lesson.objectiveEn} />
                </span>
              </div>
            )}

            {(lesson.descriptionVi || lesson.description) && (
              <p className="m-0 text-[#64748B]">
                <BilingualText vi={lesson.descriptionVi || lesson.description} en={lesson.description} />
              </p>
            )}

            {lesson.introduction && (
              <div className="p-3 rounded-xl bg-white/80 border border-[#E8E5DF]/40 text-stone-800 space-y-1">
                <BilingualText vi={lesson.introduction.textVi} en={lesson.introduction.textEn} />
              </div>
            )}

            {lesson.content && (
              <p className="m-0 text-stone-700 whitespace-pre-line bg-white/60 p-3 rounded-xl border border-[#E8E5DF]/30">
                {lesson.content}
              </p>
            )}
          </div>
        </details>
      )}

      {/* Thanh tiến độ hoạt động trong bài */}
      <div className="bg-white rounded-2xl border border-[#E8E5DF] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
          <span className="flex items-center gap-1.5 text-[#253044]">
            <span><BilingualText vi={`Hoạt động ${index + 1} / ${activities.length}`} en={`Activity ${index + 1} / ${activities.length}`} /></span>
          </span>
          <span className="text-[#FF7A00] font-extrabold">{progress?.progressPercent ?? 0}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#FF7A00] transition-all duration-300"
            style={{ width: `${progress?.progressPercent ?? 0}%` }}
          />
        </div>

        {/* Thanh chuyển bước hoạt động (Segmented steps) */}
        <nav
          className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none"
          aria-label={bilingualLabel("Các hoạt động trong bài học", "Lesson activities")}
        >
          {activities.map((item, i) => {
            const Icon = getActivityTypeIcon(item.activityType);
            const isCurrent = i === index;
            const isDone = progress?.activities?.some(
              (p) => String(p.activityId) === String(item.id) && p.status === 'COMPLETED'
            );

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => change(i)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#FF7A00] text-white shadow-md'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    : 'bg-[#FFF7E8] hover:bg-[#FFF2D6] text-[#253044] border border-[#E8E5DF]/60'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={13} className={isCurrent ? 'text-white' : 'text-emerald-700'} />
                ) : (
                  <Icon size={13} />
                )}
                <span>{i + 1}. <BilingualText vi={item.titleVi || item.title} en={item.title} /></span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Khung nội dung chính của hoạt động */}
      <article key={activity.id} className={`activity-card bg-white rounded-3xl border border-[#E8E5DF] p-6 sm:p-8 shadow-sm space-y-6 activity-${activity.activityType.toLowerCase()} ${hasImage ? 'activity-has-image' : 'activity-no-image'} transition-all duration-300 ease-out animate-fade-in`}>
        {/* Header hoạt động */}
        <div className="border-b border-[#E8E5DF]/40 pb-5 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FFF2D6] text-[#EA580C] font-black text-xs uppercase tracking-wider border border-[#FFCD00]/50">
              <BilingualText vi={`Hoạt động ${index + 1} · ${activity.activityType.replaceAll('_', ' ')}`} en={`Activity ${index + 1} · ${activity.activityType.replaceAll('_', ' ')}`} />
            </span>
            {completed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <CheckCircle2 size={12} />
                <BilingualText vi="Đã hoàn thành" en="Completed" />
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#253044] tracking-tight">
            <BilingualText vi={activity.titleVi || activity.title} en={activity.title} />
          </h2>

          {(activity.instructionVi || activity.instruction) && (
            <p className="lead text-sm sm:text-base text-[#64748B] leading-relaxed">
              <BilingualText vi={activity.instructionVi || activity.instruction} en={activity.instruction} />
            </p>
          )}
        </div>

        {/* Thân hoạt động */}
        <ActivityBody
          key={activity.id}
          activity={activity}
          lesson={lesson}
          lessonId={lesson.id}
          answer={answer}
          setAnswer={setAnswer}
          busy={busy}
          preview={preview}
        />

        {/* Thông báo phản hồi */}
        {feedback && (
          <Notice kind={feedback.includes('Hoàn thành') || feedback.startsWith('Đã') ? 'success' : 'info'}>
            <BilingualText>{feedback}</BilingualText>
          </Notice>
        )}
        {error && (
          <Notice kind="error">
            <BilingualText>{error}</BilingualText>
          </Notice>
        )}
      </article>

      {/* Điều hướng hoạt động ở đáy thẻ */}
      <div className="lesson-navigation flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs">
        <button
          type="button"
          className="button secondary inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-[#253044] bg-[#FFF7E8] hover:bg-[#FFF2D6] border border-[#E8E5DF] disabled:opacity-40 transition-all cursor-pointer"
          disabled={index === 0 || busy}
          onClick={() => change(index - 1)}
        >
          <ArrowLeft size={14} />
          <BilingualText>{"Trước"}</BilingualText>
        </button>

        <span className="text-xs text-[#64748B] font-medium hidden sm:inline-block">
          <BilingualText>
            {preview ? 'Chế độ xem trước bài học' : 'Tiến độ được tự động lưu khi hoàn thành'}
          </BilingualText>
        </span>

        {preview ? (
          <button
            type="button"
            className="button inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#FF7A00] hover:bg-[#EA580C] transition-all cursor-pointer"
            disabled={index + 1 >= activities.length}
            onClick={() => change(index + 1)}
          >
            <BilingualText>{"Tiếp tục"}</BilingualText>
            <ArrowRight size={14} />
          </button>
        ) : external ? (
          <button
            type="button"
            className="button secondary inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#24382B] hover:bg-[#1a291f] transition-all cursor-pointer"
            disabled={index + 1 >= activities.length}
            onClick={() => change(index + 1)}
          >
            <BilingualText>{"Hoạt động tiếp theo"}</BilingualText>
            <ArrowRight size={14} />
          </button>
        ) : completed ? (
          isLastActivity ? (
            (nextLessonId || lesson.nextLessonId) && onNextLesson ? (
              <button
                type="button"
                onClick={onNextLesson}
                className="button inline-flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs sm:text-sm font-black text-white bg-[#24382B] hover:bg-[#1a291f] shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <BilingualText>{"Bài tiếp theo"}</BilingualText>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="button inline-flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 opacity-90 shadow-xs cursor-default"
              >
                <Check size={14} strokeWidth={3} />
                <BilingualText>{"Đã hoàn thành bài học"}</BilingualText>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => change(index + 1)}
              className="button inline-flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs sm:text-sm font-black text-white bg-[#FF7A00] hover:bg-[#EA580C] shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <BilingualText>{"Hoạt động tiếp theo"}</BilingualText>
              <ArrowRight size={14} />
            </button>
          )
        ) : (
          <button
            type="button"
            disabled={busy || (exercise && !answerPresent(answer))}
            onClick={complete}
            className={`button inline-flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs sm:text-sm font-black text-white shadow-md transition-all cursor-pointer ${
              busy || (exercise && !answerPresent(answer))
                ? 'opacity-50 cursor-not-allowed bg-stone-400'
                : 'bg-[#FF7A00] hover:bg-[#EA580C] hover:shadow-lg'
            }`}
          >
            {busy ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <BilingualText>{"Đang lưu…"}</BilingualText>
              </>
            ) : exercise ? (
              <>
                <CheckSquare size={14} />
                <BilingualText>{"Kiểm tra đáp án"}</BilingualText>
              </>
            ) : isLastActivity ? (
              <>
                <Check size={14} />
                <BilingualText>{"Hoàn thành hoạt động"}</BilingualText>
              </>
            ) : (
              <>
                <BilingualText>{"Hoàn thành hoạt động"}</BilingualText>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Thân hoạt động xử lý Dialogue, Vocabulary, Grammar và các bài tập
 */
function ActivityBody({ activity, lessonId, answer, setAnswer, busy, preview, lesson }) {
  useTextLanguage();
  const content = activityContent(activity);

  const type = activity.activityType;

  // Trạng thái phóng to hình ảnh (Lightbox modal)
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setZoomedImage(null);
    };
    if (zoomedImage) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [zoomedImage]);

  // Xử lý lưu từ vựng (tuân thủ contract kiểm thử: vocabularyService.saveWord(item, lessonId))
  const [saved, setSaved] = useState('');
  const [saveError, setSaveError] = useState('');

  async function saveWord(item) {
    try {
      await vocabularyService.saveWord(item, lessonId);
      setSaved(item.wordVi || item.word || 'Từ vựng');
      setTimeout(() => setSaved(''), 4000);
    } catch (error) {
      setSaveError(error.message);
      setTimeout(() => setSaveError(''), 4000);
    }
  }

  // 1. RENDERER CHO QUIZ
  if (type === 'QUIZ') {
    return (
      <div className="quiz-gate text-center py-10 px-4 space-y-4 bg-gradient-to-br from-[#FFF7E8] to-white rounded-2xl border border-[#E8E5DF]">
        <h2 className="text-xl sm:text-2xl font-black text-[#253044]">
          <BilingualText>{"Nhìn xem bạn đã nói được gì!"}</BilingualText>
        </h2>
        <p className="lead text-sm sm:text-base text-[#64748B] max-w-md mx-auto">
          <BilingualText>{"Củng cố kiến thức bằng một bài kiểm tra ngắn để kiểm tra độ hiểu bài."}</BilingualText>
        </p>
        <div className="pt-2">
          {activity.quizId ? (
            <Link
              className="button inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#FF7A00] hover:bg-[#EA580C] text-white font-black text-sm shadow-md"
              to={preview ? `/content/quizzes/${activity.quizId}/preview` : `/quizzes/${activity.quizId}`}
            >
              <BilingualText>{"Bắt đầu quiz ngay →"}</BilingualText>
            </Link>
          ) : (
            <EmptyState title={bilingualLabel("Quiz chưa được liên kết", "Quiz not linked")} />
          )}
        </div>
      </div>
    );
  }

  // 2. RENDERER CHO AI ROLEPLAY / AI TUTOR
  if (externalTypes.includes(type)) {
    return (
      <div className="quiz-gate text-center py-10 px-4 space-y-4 bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-200">
        <h2 className="text-xl sm:text-2xl font-black text-[#253044]">
          <BilingualText>{"Đến lượt bạn luyện nói & trò chuyện"}</BilingualText>
        </h2>
        <p className="text-sm text-[#64748B] max-w-md mx-auto">
          <BilingualText>{"Thực hành cùng AI Tutor trong môi trường đàm thoại trực tiếp."}</BilingualText>
        </p>
        <div className="pt-2">
          <Link
            className="button inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#24382B] hover:bg-[#1a291f] text-white font-black text-sm shadow-md"
            to={
              type === 'AI_ROLEPLAY' && content.scenarioId
                ? `/ai-roleplay/${content.scenarioId}`
                : type === 'AI_ROLEPLAY'
                ? '/ai-scenarios'
                : '/ai-tutor'
            }
          >
            <BilingualText>{"Bắt đầu luyện tập cùng AI →"}</BilingualText>
          </Link>
        </div>
      </div>
    );
  }

  // 3. RENDERER CHO TỪ VỰNG & FLASHCARD (VOCABULARY RENDERER)
  if (type === 'VOCABULARY' || type === 'FLASHCARD') {
    const vocabItems = content.items || content.vocabulary || content.words || activity.vocabulary || activity.items || [];
    return (
      <VocabularyRenderer
        items={vocabItems}
        lessonId={lessonId}
        preview={preview}
        saved={saved}
        saveError={saveError}
        onSaveWord={saveWord}
      />
    );
  }

  // 4. RENDERER CHO HỘI THOẠI (DIALOGUE RENDERER)
  if (type === 'DIALOGUE') {
    return <DialogueRenderer content={content} activity={activity} />;
  }

  // 5. RENDERER CHO NGỮ PHÁP (GRAMMAR RENDERER)
  if (type === 'GRAMMAR') {
    return <GrammarRenderer activity={activity} content={content} />;
  }

  // 6. RENDERER CHO PRACTICE & NỘI DUNG TỔNG HỢP KHÁC
  const questionType = ['LISTEN_AND_CHOOSE', 'LISTEN_AND_TYPE'].includes(type)
    ? 'LISTENING'
    : type === 'PRACTICE'
    ? content.questionType || 'FILL_BLANK'
    : type;

  const isPractice = practiceTypes.includes(type);

  return (
    <div className="space-y-6">
      <div className={isPractice || ['AUDIO', 'LISTENING', 'SOUND_PATTERN'].includes(type) ? 'activity-prompt' : 'activity-intro'}>
        <div className="space-y-4">
          {/* Badge phân loại chi tiết (giọng vùng miền, mẫu âm...) */}
          {(content.accent || type === 'AUDIO') && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold">
                <Headphones size={13} />
                <span><BilingualText>{content.accent || 'Bản ghi âm giọng chuẩn'}</BilingualText></span>
              </span>
              {content.sourceLesson && (
                <span className="text-xs text-[#64748B]">
                  <BilingualText vi={`Nguồn: ${content.sourceLesson}`} en={`Source: ${content.sourceLesson}`} />
                </span>
              )}
            </div>
          )}

          {type === 'SOUND_PATTERN' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              <span><BilingualText vi="Mẫu vần & Quy tắc ghép âm" en="Rhyme patterns & Sound combination rules" /></span>
            </div>
          )}

          {content.textVi && (
            <div className="editorial-phrase text-xl sm:text-2xl font-bold text-[#253044] leading-relaxed whitespace-pre-line">
              {content.textVi}
            </div>
          )}

          {(content.promptVi || content.prompt || content.promptEn) && (
            <h3 className="editorial-phrase text-lg sm:text-xl font-bold text-[#253044]">
              {content.promptVi || content.prompt || content.promptEn}
            </h3>
          )}

          {content.importedExact && content.html
            ? <SafeImportedHtml html={content.html} />
            : <RichText text={content.body || content.textEn || content.translation || ''} />}

          <MediaPlayer audioUrl={content.audioUrl} videoUrl={content.videoUrl} />

          {content.embedUrl && (
            <p className="text-sm">
              <a className="text-link" href={content.embedUrl} target="_blank" rel="noopener noreferrer">
                <BilingualText vi="Mở nội dung tương tác từ nguồn (cần kiểm tra)" en="Open source interactive content (review required)" />
              </a>
            </p>
          )}

          {content.imageUrl && (
            <div className="space-y-2 my-4">
              <div
                onClick={() => setZoomedImage(content.imageUrl)}
                className="group relative rounded-2xl border border-[#E8E5DF]/80 overflow-hidden bg-gradient-to-b from-[#FFFDF9] to-[#FFF7E8] p-3 flex justify-center shadow-xs hover:shadow-md transition-all cursor-pointer max-w-3xl mx-auto"
                title={bilingualLabel("Bấm để phóng to hình ảnh", "Click to enlarge image")}
              >
                <ContentImage
                  className="activity-content-image max-h-[500px] w-auto max-w-full object-contain rounded-xl group-hover:scale-[1.01] transition-transform"
                  src={content.imageUrl}
                  alt={content.captionVi || content.caption || content.captionEn || activity.titleVi || activity.title || bilingualLabel('Nội dung bài học', 'Lesson content')}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-[#253044] text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                    <ZoomIn size={14} className="text-[#FF7A00]" />
                    <span><BilingualText vi="Bấm để phóng to" en="Click to enlarge" /></span>
                  </span>
                </div>
              </div>
              {(content.captionVi || content.caption || content.captionEn || content.sourcePage) && (
                <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] px-1 max-w-3xl mx-auto">
                  <span className="italic flex items-center gap-1.5">
                    <BilingualText
                      vi={content.captionVi || content.caption}
                      en={content.captionEn}
                    />
                  </span>
                  {content.sourcePage && (
                    <span className="font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md text-[11px]">
                      <BilingualText vi={`Trang giáo trình: ${content.sourcePage}`} en={`Textbook page: ${content.sourcePage}`} />
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {(content.captionVi || content.caption || content.captionEn) && !content.imageUrl && (
            <p className="text-xs text-[#64748B] italic text-center">
              {content.captionVi || content.caption || content.captionEn}
            </p>
          )}

          {/* Hình minh họa giáo trình */}
          {content.illustrations?.length > 0 && (
            <section className="textbook-illustrations space-y-4 pt-5 border-t border-[#E8E5DF]/50" aria-label={bilingualLabel("Hình minh họa trong giáo trình", "Textbook illustrations")}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-[#FFF2D6] text-[#EA580C] border border-[#FFCD00]/40 flex items-center justify-center shrink-0 shadow-2xs">
                    <BookOpen size={14} />
                  </span>
                  <div>
                    <strong className="text-sm font-bold text-[#253044] block">
                      <BilingualText vi="Trang minh họa giáo trình Tiếng Việt" en="Textbook Illustrated Pages" />
                    </strong>
                    <small className="text-xs text-[#64748B]">
                      <BilingualText vi="Bấm vào từng trang để phóng to và đọc rõ bài học" en="Click any page to zoom in and read clearly" />
                    </small>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-bold">
                  <BilingualText vi={`${content.illustrations.length} hình`} en={`${content.illustrations.length} images`} />
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.illustrations.map((illustration, index) => (
                  <figure
                    key={`${illustration.imageUrl}-${index}`}
                    onClick={() => setZoomedImage(illustration.imageUrl)}
                    className="group rounded-2xl border border-[#E8E5DF] overflow-hidden bg-[#FFFDF9] hover:bg-white p-2.5 space-y-2 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative w-full overflow-hidden rounded-xl bg-stone-50/80 flex items-center justify-center min-h-[220px] max-h-[360px]">
                      <ContentImage
                        className="w-full h-full max-h-[360px] object-contain rounded-xl group-hover:scale-[1.02] transition-transform"
                        src={illustration.imageUrl}
                        alt={illustration.captionVi || illustration.captionEn || bilingualLabel(`Hình minh họa ${index + 1}`, `Illustration ${index + 1}`)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-[#253044] text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
                          <ZoomIn size={14} className="text-[#FF7A00]" />
                          <span><BilingualText vi="Bấm để phóng to" en="Click to enlarge" /></span>
                        </span>
                      </div>
                    </div>
                    <figcaption className="text-xs text-[#64748B] px-1 pt-1 flex items-center justify-between border-t border-[#E8E5DF]/30">
                      <span className="font-semibold text-[#253044] truncate mr-2">
                        <BilingualText vi={illustration.captionVi} en={illustration.captionEn} />
                      </span>
                      {illustration.sourcePage && (
                        <span className="font-bold text-[#EA580C] bg-[#FFF2D6] px-2 py-0.5 rounded-md text-[10px] shrink-0">
                          <BilingualText vi={`Trang ${illustration.sourcePage}`} en={`Page ${illustration.sourcePage}`} />
                        </span>
                      )}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Lời thoại transcript */}
          {(content.transcriptVi || content.transcript || content.transcriptEn) && (
            <details className="group rounded-2xl border border-[#E8E5DF] bg-[#FFFDF9] p-4 text-xs open:bg-white transition-all">
              <summary className="font-bold text-[#EA580C] cursor-pointer select-none">
                <BilingualText>{"Xem lời thoại (Transcript)"}</BilingualText>
              </summary>
              <p className="mt-3 text-stone-700 leading-relaxed border-t border-[#E8E5DF]/30 pt-2">
                {content.transcriptVi || content.transcript || content.transcriptEn}
              </p>
            </details>
          )}
        </div>

      </div>

      {/* Bài tập QuestionInput */}
      {isPractice && (
        <div className="pt-4 border-t border-[#E8E5DF]/40">
          <QuestionInput
            question={{ id: activity.id, questionType, options: content.options || [] }}
            answer={answer}
            onChange={setAnswer}
            disabled={busy}
          />
        </div>
      )}

      {/* Lightbox Modal phóng to ảnh */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col overflow-hidden border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 px-2 border-b border-stone-100 shrink-0">
              <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#FF7A00]" />
                <span><BilingualText vi="Hình ảnh minh họa bài học" en="Lesson illustration" /></span>
              </span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                title={bilingualLabel("Đóng xem ảnh", "Close image viewer")}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-2 flex items-center justify-center min-h-[300px]">
              <ContentImage
                src={zoomedImage}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-xs"
                alt={bilingualLabel("Hình minh họa phóng to", "Enlarged illustration")}
              />
            </div>

            <div className="pt-2 text-center text-[11px] text-stone-400 shrink-0">
              <BilingualText vi="Bấm phím ESC hoặc bấm ra ngoài để đóng" en="Press ESC or click outside to close" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * =========================================================================
 * SUB-COMPONENT: DIALOGUE RENDERER (HỘI THOẠI BONG BÓNG TIN NHẮN HIỆN ĐẠI)
 * =========================================================================
 */
function DialogueRenderer({ content = {}, activity = {} }) {
  useTextLanguage();
  const [translations, setTranslations] = useState(() => isAutoTranslateEnabled());
  const [activeLineIndex, setActiveLineIndex] = useState(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const playAllRef = useRef(null);

  const lines = useMemo(() => {
    if (Array.isArray(content)) return content;
    if (Array.isArray(content?.lines)) return content.lines;
    if (Array.isArray(content?.dialogue)) return content.dialogue;
    if (Array.isArray(activity?.dialogue)) return activity.dialogue;
    return [];
  }, [content, activity]);

  // Xác định danh sách người nói
  const speakers = useMemo(() => {
    const map = [];
    lines.forEach((l) => {
      const name = l.speaker || l.role || l.character || 'Người nói';
      if (!map.includes(name)) map.push(name);
    });
    return map;
  }, [lines]);

  // Dừng phát âm khi rời khỏi component
  useEffect(() => {
    return () => {
      if (playAllRef.current) {
        playAllRef.current.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Phát toàn bộ đoạn hội thoại tự động theo từng câu
  const togglePlayAll = async () => {
    if (isPlayingAll) {
      if (playAllRef.current) playAllRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlayingAll(false);
      setActiveLineIndex(null);
      return;
    }

    setIsPlayingAll(true);

    for (let i = 0; i < lines.length; i++) {
      setActiveLineIndex(i);
      const line = lines[i];
      const audioUrl = line.audioUrl || line.audio;
      const text = line.textVi || line.text || line.vietnameseText;

      await new Promise((resolve) => {
        if (audioUrl) {
          const src = mediaSource(audioUrl, 'audio');
          if (src) {
            const player = new Audio(src);
            player.playbackRate = getStoredAudioSpeed();
            playAllRef.current = player;
            player.onended = resolve;
            player.onerror = () => speakWithSpeechSynthesis(text, resolve);
            player.play().catch(() => speakWithSpeechSynthesis(text, resolve));
            return;
          }
        }
        speakWithSpeechSynthesis(text, resolve);
      });

      // Khoảng nghỉ tự nhiên giữa hai câu thoại
      await new Promise((r) => setTimeout(r, 650));
    }

    setIsPlayingAll(false);
    setActiveLineIndex(null);
  };

  const speakWithSpeechSynthesis = (text, callback) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = getStoredAudioSpeed();
      utterance.onend = callback;
      utterance.onerror = callback;
      window.speechSynthesis.speak(utterance);
    } else {
      callback();
    }
  };

  return (
    <div className="dialogue-renderer space-y-6">
      {/* Thanh công cụ hội thoại */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFF7E8] border border-[#E8E5DF] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-white border border-[#E8E5DF]/80 text-[#FF7A00] flex items-center justify-center">
            <MessageCircle size={15} />
          </span>
          <span className="font-bold text-[#253044]">
            <BilingualText vi={`Hội thoại thực tế (${lines.length} lượt thoại)`} en={`Real-life dialogue (${lines.length} lines)`} />
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Nút nghe toàn bộ */}
          <button
            type="button"
            onClick={togglePlayAll}
            className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              isPlayingAll
                ? 'bg-[#FF7A00] text-white shadow-xs animate-pulse'
                : 'bg-white hover:bg-stone-50 text-[#EA580C] border border-[#E8E5DF]'
            }`}
          >
            {isPlayingAll ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
            <span><BilingualText vi={isPlayingAll ? 'Dừng đọc' : 'Nghe toàn bộ'} en={isPlayingAll ? 'Stop' : 'Play all'} /></span>
          </button>

          {/* Nút bật/tắt bản dịch */}
          <button
            type="button"
            onClick={() => setTranslations((v) => !v)}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl font-bold bg-white hover:bg-stone-50 text-stone-700 border border-[#E8E5DF] transition-all cursor-pointer"
          >
            <Languages size={13} />
            <span><BilingualText vi={translations ? 'Ẩn bản dịch' : 'Hiện bản dịch'} en={translations ? 'Hide translations' : 'Show translations'} /></span>
          </button>
        </div>
      </div>

      {/* Luồng hội thoại bong bóng (Chat-style feed) */}
      <div className="dialogue-lines space-y-4 py-2">
        {lines.map((line, index) => {
          const speakerName = line.speaker || (index % 2 === 0 ? bilingualLabel('Người nói A', 'Speaker A') : bilingualLabel('Người nói B', 'Speaker B'));
          const isSecondSpeaker = speakers.indexOf(speakerName) % 2 === 1 || index % 2 === 1;
          const isActive = activeLineIndex === index;

          return (
            <div
              key={index}
              className={`flex items-start gap-3 transition-all ${
                isSecondSpeaker ? 'flex-row-reverse justify-start' : 'justify-start'
              }`}
            >
              {/* Avatar người nói */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs border ${
                  isSecondSpeaker
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-[#FFF2D6] text-[#EA580C] border-[#FFCD00]/60'
                }`}
                title={speakerName}
              >
                {speakerName[0]?.toUpperCase() || (isSecondSpeaker ? 'B' : 'A')}
              </div>

              {/* Bong bóng tin nhắn */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 space-y-2 border transition-all ${
                  isActive
                    ? 'ring-2 ring-[#FF7A00] shadow-md'
                    : isSecondSpeaker
                    ? 'bg-[#F0FDF4] border-emerald-200 text-emerald-950 rounded-tr-xs'
                    : 'bg-[#FFFDF9] border-[#E8E5DF] text-[#253044] rounded-tl-xs shadow-2xs'
                }`}
              >
                {/* Tên người nói */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className={`font-extrabold ${isSecondSpeaker ? 'text-emerald-800' : 'text-[#EA580C]'}`}>
                    {speakerName}
                  </span>

                  <SpeakButton
                    text={line.textVi || line.text || line.vietnameseText}
                    audioUrl={line.audioUrl || line.audio}
                    fallbackToSpeech={true}
                    className="p-1 hover:bg-black/5 rounded-full"
                  />
                </div>

                {/* Nội dung câu nói bằng tiếng Việt */}
                <p className="text-base sm:text-lg font-bold leading-relaxed m-0">
                  {line.textVi || line.text || line.vietnameseText}
                </p>

                {/* Bản dịch tiếng Anh */}
                {translations && (line.textEn || line.translation || line.meaningEn) && (
                  <p className="text-xs sm:text-sm text-[#64748B] italic pt-1.5 border-t border-black/5 m-0 leading-normal">
                    {line.textEn || line.translation || line.meaningEn}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mẹo Shadowing & phát âm */}
      {isPronunciationHintsEnabled() && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
          <Lightbulb size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong><BilingualText vi="Mẹo phát âm & Shadowing:" en="Pronunciation & Shadowing Tip:" /></strong> <BilingualText vi="Hãy bấm nghe từng câu thoại và lặp lại ngay theo giọng người bản xứ để luyện nhịp điệu và ngữ điệu tự nhiên." en="Listen to each dialogue line and repeat immediately after the native speaker to practice natural rhythm and intonation." />
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * =========================================================================
 * SUB-COMPONENT: VOCABULARY RENDERER (INTERACTIVE FLASHCARDS & GRID VIEW)
 * =========================================================================
 */
function VocabularyRenderer({ items = [], lessonId, preview, saved, saveError, onSaveWord }) {
  useTextLanguage();
  const [viewMode, setViewMode] = useState('flashcard'); // 'flashcard' | 'grid'
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (items.length === 0) {
    return (
      <EmptyState
        title={bilingualLabel("Chưa có từ vựng để hiển thị", "No vocabulary to display")}
        description={bilingualLabel("Bạn có thể mở sổ tay từ vựng để ôn lại các từ đã lưu.", "You can open your vocabulary notebook to review saved words.")}
      >
        <Link className="button secondary" to={ROUTES.VOCABULARY_NOTEBOOK}>
          <BilingualText>{"Mở sổ tay từ vựng"}</BilingualText>
        </Link>
      </EmptyState>
    );
  }

  const currentItem = items[cardIndex] || items[0];
  const wordVi = currentItem.wordVi || currentItem.word || '';
  const meaningEn = currentItem.meaningEn || currentItem.meaning || currentItem.definition || currentItem.translation || '';
  const exampleVi = currentItem.exampleVi || currentItem.example || '';
  const exampleEn = currentItem.exampleEn || currentItem.exampleTranslation || currentItem.translation || '';
  const audioUrl = currentItem.audioUrl || currentItem.audio || alphabetAudioFor(currentItem);
  const imageUrl = currentItem.imageUrl || currentItem.image;
  const pronunciation = currentItem.pronunciation || currentItem.ipa;
  const wordType = currentItem.wordType || currentItem.partOfSpeech || 'Từ vựng';
  const currentTone = detectVietnameseTone(wordVi);

  const nextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1 < items.length ? prev + 1 : 0));
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 >= 0 ? prev - 1 : items.length - 1));
  };

  return (
    <div className="vocabulary-renderer space-y-6">
      {/* Thanh điều khiển chế độ xem */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#FFF7E8] border border-[#E8E5DF]">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-[#FF7A00]" />
          <span className="text-xs font-bold text-[#253044]">
            <BilingualText vi={`Học ${items.length} từ vựng trọng tâm`} en={`Learn ${items.length} key vocabulary words`} />
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#E8E5DF]/80">
          <button
            type="button"
            onClick={() => setViewMode('flashcard')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'flashcard'
                ? 'bg-[#FF7A00] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers size={13} />
            <span><BilingualText vi="Thẻ Flashcard" en="Flashcard" /></span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#FF7A00] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutGrid size={13} />
            <span><BilingualText vi="Danh sách lưới" en="Grid view" /></span>
          </button>
        </div>
      </div>

      {/* Thông báo đã lưu từ vào sổ tay */}
      {saved && (
        <Notice kind="success">
          <BilingualText
            vi={<>Đã lưu thành công “{saved}” vào sổ tay từ vựng.</>}
            en={<>Saved “{saved}” to your vocabulary notebook.</>}
          />
        </Notice>
      )}
      {saveError && (
        <Notice kind="error">
          <BilingualText>{saveError}</BilingualText>
        </Notice>
      )}

      {/* CHẾ ĐỘ 1: THẺ TƯƠNG TÁC FLASHCARD */}
      {viewMode === 'flashcard' && (
        <div className="flashcard-workspace max-w-xl mx-auto space-y-5">
          {/* Thẻ Flashcard chính */}
          <div
            onClick={() => setIsFlipped((v) => !v)}
            className="group relative w-full min-h-[340px] p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-white to-[#FFF7E8] border-2 border-[#E8E5DF] hover:border-[#FF7A00]/60 shadow-lg cursor-pointer transition-all flex flex-col justify-between select-none"
          >
            {/* Header Thẻ: Loại từ & Thanh điệu */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#FFF2D6] text-[#EA580C] font-bold text-xs border border-[#FFCD00]/50">
                <BilingualText>{wordType}</BilingualText>
              </span>

              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${currentTone.badgeClass}`}>
                <BilingualText vi={`${currentTone.nameVi} (${currentTone.symbol})`} en={`${currentTone.nameEn} (${currentTone.symbol})`} />
              </span>
            </div>

            {/* Nội dung Mặt Trước / Mặt Sau */}
            {!isFlipped ? (
              // MẶT TRƯỚC: Tiếng Việt, Phát âm, Âm thanh
              <div className="text-center py-6 space-y-3">
                {imageUrl ? (
                  <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden border-2 border-[#E8E5DF]/80 shadow-xs mb-3 bg-[#FFFDF9] flex items-center justify-center p-1.5">
                    <ContentImage
                      className="w-full h-full object-contain rounded-xl"
                      src={imageUrl}
                      alt={wordVi || bilingualLabel('Hình minh họa từ vựng', 'Vocabulary illustration')}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-[#FFF7E8] via-[#FFF2D6] to-[#FFE8BD] border border-[#E8E5DF] flex flex-col items-center justify-center shadow-inner mb-3">
                    <span className="font-serif text-3xl font-black text-[#EA580C]">
                      {wordVi?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mt-0.5">
                      <BilingualText vi={currentTone.nameVi} en={currentTone.nameEn} />
                    </span>
                  </div>
                )}

                <h3 className="text-3xl sm:text-4xl font-black text-[#253044] tracking-tight">
                  {wordVi}
                </h3>

                {pronunciation && (
                  <p className="text-sm font-mono text-[#64748B] bg-stone-100 inline-block px-3 py-1 rounded-lg">
                    {pronunciation}
                  </p>
                )}

                <div className="pt-2 flex justify-center">
                  <div onClick={(e) => e.stopPropagation()}>
                    <SpeakButton
                      text={wordVi}
                      audioUrl={audioUrl}
                      fallbackToSpeech={true}
                      className="w-12 h-12 rounded-full bg-[#FF7A00] hover:bg-[#EA580C] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // MẶT SAU: Nghĩa tiếng Anh, Câu ví dụ
              <div className="text-center py-6 space-y-4">
                <span className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wider block">
                  <BilingualText vi="Ý nghĩa & Ví dụ" en="Meaning & Example" />
                </span>

                <h3 className="text-2xl sm:text-3xl font-black text-[#253044]">
                  {meaningEn}
                </h3>

                {exampleVi && (
                  <div className="bg-[#FFF7E8] rounded-2xl p-4 border border-[#E8E5DF]/60 text-left space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#EA580C]"><BilingualText vi="Ví dụ thực tế:" en="Real-world example:" /></span>
                      <div onClick={(e) => e.stopPropagation()}>
                        <SpeakButton
                          text={exampleVi}
                          fallbackToSpeech={true}
                          className="p-1"
                        />
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#253044] m-0">
                      {exampleVi}
                    </p>
                    {exampleEn && (
                      <p className="text-xs text-[#64748B] italic m-0">
                        {exampleEn}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer thẻ: Hướng dẫn lật & Nút lưu */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8E5DF]/40 text-xs text-[#64748B]">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#EA580C]">
                <RotateCcw size={12} />
                <span>{isFlipped ? <BilingualText vi="Bấm để xem lại mặt trước" en="Click to flip back" /> : <BilingualText vi="Bấm để lật xem nghĩa" en="Click to flip and reveal meaning" />}</span>
              </span>

              {!preview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveWord(currentItem);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-[#253044] border border-[#E8E5DF] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <Bookmark size={12} className="text-[#FF7A00]" />
                  <span><BilingualText vi="Lưu từ" en="Save word" /></span>
                </button>
              )}
            </div>
          </div>

          {currentItem.masterVocabularyId && <Link className="text-link" to={`/vocabulary/${currentItem.masterVocabularyId}`}><BilingualText vi="Xem từ trong danh mục" en="View dictionary entry" /></Link>}

          {/* Thanh điều hướng Thẻ (Prev / Next / Index) */}
          <div className="flex items-center justify-between gap-3 px-2">
            <button
              type="button"
              onClick={prevCard}
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-[#253044] bg-white hover:bg-[#FFF7E8] border border-[#E8E5DF] shadow-xs cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span><BilingualText vi="Từ trước" en="Previous" /></span>
            </button>

            <span className="text-xs font-extrabold text-[#64748B]">
              <BilingualText vi={`Thẻ ${cardIndex + 1} / ${items.length}`} en={`Card ${cardIndex + 1} / ${items.length}`} />
            </span>

            <button
              type="button"
              onClick={nextCard}
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#FF7A00] hover:bg-[#EA580C] shadow-xs cursor-pointer"
            >
              <span><BilingualText vi="Từ tiếp theo" en="Next" /></span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* CHẾ ĐỘ 2: DANH SÁCH LƯỚI TỔNG QUAN */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => {
            const itemWord = item.wordVi || item.word || '';
            const itemTone = detectVietnameseTone(itemWord);
            const itemMeaning = item.meaningEn || item.meaning || item.definition || item.translation || '';
            const itemExampleVi = item.exampleVi || item.example || '';
            const itemExampleEn = item.exampleEn || item.exampleTranslation || item.translation || '';
            const itemAudioUrl = item.audioUrl || item.audio || alphabetAudioFor(item);
            const itemImageUrl = item.imageUrl || item.image;
            const itemPronunciation = item.pronunciation || item.ipa;
            const itemWordType = item.wordType || item.partOfSpeech || 'Từ vựng';

            return (
              <div
                key={index}
                className="card activity-word bg-white rounded-2xl border border-[#E8E5DF] p-5 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge px-2.5 py-0.5 rounded-md bg-[#FFF2D6] text-[#EA580C] font-bold text-[10px] border border-[#FFCD00]/50">
                      <BilingualText>{itemWordType}</BilingualText>
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${itemTone.badgeClass}`}>
                      <BilingualText vi={itemTone.nameVi} en={itemTone.nameEn} />
                    </span>
                  </div>

                  {itemImageUrl ? (
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-[#E8E5DF]/60 bg-[#FFFDF9] flex items-center justify-center p-1">
                      <ContentImage
                        className="activity-word-image w-full h-full object-contain rounded-lg"
                        src={itemImageUrl}
                        alt={itemWord || bilingualLabel('Hình minh họa từ vựng', 'Vocabulary illustration')}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-20 rounded-xl bg-gradient-to-r from-[#FFFDF9] via-[#FFF8EC] to-[#FFFDF9] border border-[#E8E5DF]/40 flex items-center justify-center gap-3 px-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E5DF]/80 shadow-2xs flex items-center justify-center font-serif text-xl font-black text-[#EA580C] shrink-0">
                        {itemWord?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-[#253044] block"><BilingualText vi={itemTone.nameVi} en={itemTone.nameEn} /></span>
                        <span className="text-[10px] text-[#64748B] block"><BilingualText vi={itemTone.symbol ? `Dấu ${itemTone.symbol}` : 'Thanh ngang (không dấu)'} en={itemTone.symbol ? `Mark ${itemTone.symbol}` : 'Level tone (unmarked)'} /></span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h3 className="text-xl font-black text-[#253044] m-0">
                        {itemWord}
                      </h3>
                      {itemPronunciation && (
                        <small className="text-xs font-mono text-[#64748B]">
                          {itemPronunciation}
                        </small>
                      )}
                    </div>

                    <SpeakButton
                      text={itemWord}
                      audioUrl={itemAudioUrl}
                      fallbackToSpeech={true}
                    />
                  </div>

                  <p className="text-sm font-semibold text-stone-700 m-0 pt-1">
                    {itemMeaning}
                  </p>

                  {itemExampleVi && (
                    <div className="bg-[#FFF7E8] rounded-xl p-2.5 text-xs text-[#64748B] border border-[#E8E5DF]/40 mt-1">
                      <p className="font-semibold text-[#253044] m-0">{itemExampleVi}</p>
                      {itemExampleEn && <p className="italic m-0 text-stone-500">{itemExampleEn}</p>}
                    </div>
                  )}
                </div>

                {!preview && (
                  <div className="pt-3 border-t border-[#E8E5DF]/30">
                    <button
                      type="button"
                      onClick={() => onSaveWord(item)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#FFF7E8] hover:bg-[#FFF2D6] text-[#253044] border border-[#E8E5DF] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                    >
                      <Bookmark size={13} className="text-[#FF7A00]" />
                      <span><BilingualText vi="Lưu vào sổ tay" en="Save to notebook" /></span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * =========================================================================
 * SUB-COMPONENT: GRAMMAR RENDERER (CẤU TRÚC NGỮ PHÁP RÕ RÀNG, CHUYÊN NGHIỆP)
 * =========================================================================
 */
function GrammarRenderer({ activity = {}, content = {} }) {
  useTextLanguage();
  const grammarTopics = useMemo(() => {
    if (activity.grammarTopics?.length) return activity.grammarTopics;
    if (Array.isArray(content.grammarTopics) && content.grammarTopics.length) return content.grammarTopics;
    if (Array.isArray(content.topics) && content.topics.length) return content.topics;
    if (Array.isArray(content.grammar) && content.grammar.length) return content.grammar;
    if (content.grammar && typeof content.grammar === 'object') return [content.grammar];
    if (content.structurePattern || content.explanationVi || content.titleVi) return [content];
    if (activity.grammar && typeof activity.grammar === 'object') {
      return Array.isArray(activity.grammar) ? activity.grammar : [activity.grammar];
    }
    return [];
  }, [activity, content]);

  if (grammarTopics.length === 0) {
    return (
      <EmptyState
        title={bilingualLabel("Chưa có nội dung ngữ pháp", "No grammar content")}
        description={bilingualLabel("Nội dung ngữ pháp đang được biên soạn cho bài học này.", "Grammar content is being prepared for this lesson.")}
      />
    );
  }

  return (
    <div className="grammar-renderer space-y-8">
      {grammarTopics.map((topic, topicIdx) => {
        const titleVi = topic.titleVi || topic.title || '';
        const titleEn = topic.titleEn || topic.title || '';
        const pattern = topic.structurePattern || topic.pattern || '';
        const explanation = topic.explanationVi || topic.explanation || '';
        const explanationEn = topic.explanationEn || '';
        const commonMistakesVi = topic.commonMistakesVi || topic.commonMistakes || '';
        const commonMistakesEn = topic.commonMistakesEn || '';
        const examples = topic.examples || [];

        return (
          <section
            key={topic.id || topicIdx}
            className="bg-white rounded-3xl border border-[#E8E5DF] p-6 sm:p-8 shadow-xs space-y-6"
          >
            {/* Header Điểm Ngữ Pháp */}
            <div className="border-b border-[#E8E5DF]/40 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FFF2D6] text-[#FF7A00] flex items-center justify-center">
                  <FileText size={15} />
                </span>
                <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                  <BilingualText vi={`Điểm ngữ pháp trọng tâm ${grammarTopics.length > 1 ? `#${topicIdx + 1}` : ''}`.trim()} en={`Key Grammar Point ${grammarTopics.length > 1 ? `#${topicIdx + 1}` : ''}`.trim()} />
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-[#253044] tracking-tight">
                <BilingualText vi={titleVi} en={titleEn} />
              </h3>
            </div>

            {/* Công thức / Mẫu cấu trúc (Formula Banner) */}
            {pattern && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide block">
                  <BilingualText vi="Công thức cấu trúc:" en="Structure pattern:" />
                </span>
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFF7E8] to-[#FFF2D6] border-2 border-[#FFCD00]/70 shadow-xs flex items-center gap-3">
                  <span className="text-base sm:text-lg font-black text-[#253044] font-mono leading-snug">
                    {pattern}
                  </span>
                </div>
              </div>
            )}

            {/* Giải thích chi tiết cách dùng */}
            {(explanation || explanationEn) && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide block">
                  <BilingualText vi="Giải thích và cách dùng:" en="Explanation & usage:" />
                </span>
                <div className="text-sm sm:text-base text-[#253044] leading-relaxed bg-[#FFFDF9] p-4 rounded-2xl border border-[#E8E5DF]/40 space-y-1">
                  <RichText text={explanation} />
                  {explanationEn && explanationEn !== explanation && (
                    <p className="text-xs text-[#64748B] italic pt-1 border-t border-stone-200/50 m-0">
                      {explanationEn}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Cảnh báo lỗi thường gặp (Common Mistakes) */}
            {(commonMistakesVi || commonMistakesEn) && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs sm:text-sm">
                <AlertCircle size={17} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-rose-900 font-bold">
                    <BilingualText>{"Lỗi thường gặp cần tránh:"}</BilingualText>
                  </strong>
                  {commonMistakesVi && (
                    <p className="m-0 leading-relaxed font-medium">
                      {commonMistakesVi}
                    </p>
                  )}
                  {commonMistakesEn && (
                    <p className="m-0 text-rose-800/80 italic text-xs">
                      {commonMistakesEn}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Ví dụ thực tế trong câu giao tiếp */}
            {examples.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide block">
                  <BilingualText vi="Ví dụ thực tế trong hội thoại:" en="Real-life dialogue examples:" />
                </span>

                <div className="space-y-2.5">
                  {examples.map((example, i) => {
                    const exVi = example.vietnameseText || example.vietnamese || example.exampleVi || example.sentenceVi || example.textVi || '';
                    const exEn = example.translation || example.english || example.exampleEn || example.meaningEn || example.textEn || '';
                    const exNote = example.note || example.explanation || example.explanationVi || '';
                    const exAudio = example.audioUrl || example.audio;

                    return (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-stone-50/80 hover:bg-[#FFF7E8]/70 border border-stone-200 hover:border-[#E8E5DF] transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="text-base font-bold text-[#253044] m-0">
                            {exVi}
                          </p>
                          {exEn && (
                            <p className="text-xs sm:text-sm text-[#64748B] italic m-0">
                              {exEn}
                            </p>
                          )}
                          {exNote && (
                            <p className="text-[11px] text-amber-800 m-0 pt-0.5">
                              <span className="font-semibold text-amber-900 mr-1"><BilingualText vi="Gợi ý:" en="Hint:" /></span>{exNote}
                            </p>
                          )}
                        </div>

                        {exVi && (
                          <SpeakButton
                            text={exVi}
                            audioUrl={exAudio}
                            fallbackToSpeech={true}
                            className="shrink-0 p-1.5"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        );
      })}

      {/* Ghi chú văn hóa / Mẹo nhớ */}
      <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950">
        <Lightbulb size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <span>
          <strong><BilingualText vi="Lưu ý ngữ pháp:" en="Grammar Note:" /></strong> <BilingualText vi="Trong giao tiếp tiếng Việt, việc dùng đúng đại từ nhân xưng (anh, chị, em, cô, chú...) kết hợp cùng cấu trúc câu trên sẽ giúp câu nói tự nhiên và lịch sự hơn rất nhiều." en="In Vietnamese communication, using the correct personal pronouns (anh, chị, em, cô, chú...) combined with the sentence structure above makes your speech much more natural and polite." />
        </span>
      </div>
    </div>
  );
}
export default LessonActivities;
