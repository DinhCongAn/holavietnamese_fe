import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { ContentImage } from '@/shared/components/common/ContentImage';
import { MediaPlayer } from '@/features/learning/components/learning/MediaPlayer';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { contentService } from '@/features/learning/api/contentService';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { PageHeader, Notice, EmptyState, Artwork } from '@/shared/components/common/Ui';
import { ProgressBar } from '@/shared/components/common/ProgressBar';
import { QuestionInput } from '@/features/learning/components/learning/QuestionInput';
import { answerLabel, answerPresent } from '@/features/learning/components/learning/answerUtils';
import { Modal } from '@/shared/components/common/Modal';
import { Award, Clock, RotateCcw, BookOpen, CheckCircle2, ArrowRight, ArrowLeft, Check, AlertCircle, Play } from 'lucide-react';

/**
 * =========================================================================
 * 1. QUIZ OVERVIEW / START SCREEN (QuizPage)
 * =========================================================================
 */
export function QuizPage() {
  const { courseId, lessonId, quizId } = useParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const resource = useAsyncResource(
    useCallback((signal) => contentService.quiz(quizId, signal), [quizId])
  );

  useEffect(() => {
    if (resource.data) {
      const cId = courseId || resource.data.courseId;
      const lId = lessonId || resource.data.lessonId;
      if (!courseId && cId) {
        const canonical = lId
          ? `/courses/${cId}/lessons/${lId}/quizzes/${quizId}`
          : `/courses/${cId}/quizzes/${quizId}`;
        navigate(canonical, { replace: true });
      }
    }
  }, [resource.data, courseId, lessonId, quizId, navigate]);

  async function start(restart = false) {
    setBusy(true);
    setError('');
    try {
      const attempt = await contentService.startQuiz(quizId, restart);
      const cId = courseId || attempt.courseId || resource.data?.courseId;
      const lId = lessonId || attempt.lessonId || resource.data?.lessonId;
      const attemptUrl = cId && lId
        ? `/courses/${cId}/lessons/${lId}/quiz-attempts/${attempt.id}`
        : cId
        ? `/courses/${cId}/quiz-attempts/${attempt.id}`
        : `/quiz-attempts/${attempt.id}`;
      navigate(attemptUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ResourceState resource={resource}>
      {(quiz) => {
        const cId = courseId || quiz.courseId;
        const lId = lessonId || quiz.lessonId;
        const backUrl = lId && cId
          ? `/courses/${cId}/lessons/${lId}`
          : cId
          ? `/courses/${cId}`
          : '/my-learning';

        return (
          <section className="quiz-start-screen w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <Link
                to={backUrl}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#253044] transition-colors no-underline"
              >
                <ArrowLeft size={14} />
                <span>
                  <BilingualText
                    vi={lId ? 'Về bài học' : cId ? 'Về khóa học' : 'Về góc học tập'}
                    en={lId ? 'Back to lesson' : cId ? 'Back to course' : 'Back to My Learning'}
                  />
                </span>
              </Link>
            </div>

            {/* Main Quiz Hero Card */}
            <div className="quiz-gate card relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFCF7] via-[#FFFCF7] to-[#FFF7E8] border border-[#E8E5DF] p-6 sm:p-10 shadow-sm space-y-8">
              {/* Dong Son background watermark */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 opacity-5 pointer-events-none select-none hidden sm:block">
                <Artwork kind="dong-son" className="w-full h-full object-contain" />
              </div>

              {/* Title & Badge */}
              <div className="text-center space-y-3 max-w-2xl mx-auto relative z-10">
                <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#FFF0DC] text-[#C2410C] border border-[#FFCD00]/50 font-extrabold text-xs uppercase tracking-wider shadow-2xs">
                  <BilingualText vi="Kiểm tra năng lực" en="Knowledge Check" />
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#253044] tracking-tight leading-tight">
                  <BilingualText vi={quiz.titleVi || quiz.title} en={quiz.title} />
                </h1>

                <p className="lead text-sm sm:text-base text-[#64748B] leading-relaxed">
                  <BilingualText
                    vi={quiz.descriptionVi || quiz.description || 'Một cơ hội để nhìn lại những điều bạn đã học và củng cố phản xạ ngôn ngữ.'}
                    en={quiz.description || 'A chance to review what you have learned and reinforce your language skills.'}
                  />
                </p>
              </div>

              {/* Key Exam Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 relative z-10">
                <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF]/80 shadow-2xs text-center space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] block uppercase tracking-wider">
                    <BilingualText vi="Số câu hỏi" en="Total questions" />
                  </span>
                  <strong className="text-base sm:text-lg font-black text-[#253044]">
                    <BilingualText vi={`${quiz.questionCount} câu`} en={`${quiz.questionCount} questions`} />
                  </strong>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF]/80 shadow-2xs text-center space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] block uppercase tracking-wider">
                    <BilingualText vi="Điểm đạt" en="Passing score" />
                  </span>
                  <strong className="text-base sm:text-lg font-black text-emerald-700">
                    {quiz.passingScore}%
                  </strong>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF]/80 shadow-2xs text-center space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] block uppercase tracking-wider">
                    <BilingualText vi="Thời gian" en="Time limit" />
                  </span>
                  <strong className="text-base sm:text-lg font-black text-[#253044]">
                    {quiz.timeLimitMinutes ? <BilingualText vi={`${quiz.timeLimitMinutes} phút`} en={`${quiz.timeLimitMinutes} min`} /> : <BilingualText vi="Tự do" en="Untimed" />}
                  </strong>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF]/80 shadow-2xs text-center space-y-1">
                  <span className="text-[11px] font-bold text-[#64748B] block uppercase tracking-wider">
                    <BilingualText vi="Lần làm bài" en="Max attempts" />
                  </span>
                  <strong className="text-base sm:text-lg font-black text-[#253044]">
                    {quiz.maxAttempts ? <BilingualText vi={`${quiz.maxAttempts} lần`} en={`${quiz.maxAttempts} attempts`} /> : <BilingualText vi="Vô hạn" en="Unlimited" />}
                  </strong>
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-[#E8E5DF]/60 space-y-2 relative z-10 text-xs sm:text-sm text-[#253044]">
                <strong className="font-bold text-[#C2410C] flex items-center gap-1.5">
                  <BilingualText>{"Lưu ý trước khi làm bài:"}</BilingualText>
                </strong>
                <ul className="space-y-1 text-xs text-[#64748B] pl-5 list-disc">
                  <li>
                    <BilingualText>{"Hệ thống tự động lưu câu trả lời mỗi khi bạn chuyển câu."}</BilingualText>
                  </li>
                  <li>
                    <BilingualText>{"Bạn có thể tự do bấm chọn lại các câu trước để kiểm tra đáp án."}</BilingualText>
                  </li>
                  <li>
                    <BilingualText>{"Khi hoàn thành tất cả các câu, bấm nút Nộp bài để xem ngay kết quả chi tiết."}</BilingualText>
                  </li>
                </ul>
              </div>

              {/* Active Attempt In-Progress Banner */}
              {quiz.activeAttempt && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-[#253044] space-y-2 relative z-10">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs sm:text-sm">
                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                    <span>
                      <BilingualText
                        vi="Bạn có bài làm dở dang chưa nộp"
                        en="You have an in-progress attempt"
                      />
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/80 m-0">
                    <BilingualText
                      vi={`Bài làm trước đó đã lưu ${quiz.activeAttempt.answeredCount || 0} câu trả lời. Bạn có thể tiếp tục làm hoặc bắt đầu lại từ đầu.`}
                      en={`Your previous session saved ${quiz.activeAttempt.answeredCount || 0} answers. You can resume or start fresh.`}
                    />
                  </p>
                </div>
              )}

              {error && (
                <Notice kind="error">
                  <BilingualText>{error}</BilingualText>
                </Notice>
              )}

              {/* CTA Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
                <button
                  type="button"
                  onClick={() => start(false)}
                  disabled={busy}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-3.5 px-8 rounded-2xl bg-[#F97316] hover:bg-[#C2410C] text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  {busy ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <BilingualText vi="Đang chuẩn bị đề thi…" en="Preparing quiz…" />
                    </>
                  ) : quiz.activeAttempt ? (
                    <>
                      <Play size={16} fill="white" />
                      <BilingualText vi="Tiếp tục bài làm →" en="Resume Quiz →" />
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="white" />
                      <BilingualText vi="Bắt đầu quiz ngay →" en="Start quiz now →" />
                    </>
                  )}
                </button>

                {quiz.activeAttempt && (
                  <button
                    type="button"
                    onClick={() => start(true)}
                    disabled={busy}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white hover:bg-stone-50 text-[#C2410C] border border-[#F97316]/40 font-bold text-xs shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                  >
                    <RotateCcw size={14} />
                    <BilingualText vi="Làm lại từ đầu ↻" en="Start Over ↻" />
                  </button>
                )}

                {cId && (
                  <Link
                    to={lId ? `/courses/${cId}/lessons/${lId}` : `/courses/${cId}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white hover:bg-stone-50 text-[#253044] border border-[#E8E5DF] font-bold text-xs shadow-2xs transition-all no-underline"
                  >
                    <BilingualText
                      vi={lId ? '← Về bài học' : '← Về khóa học'}
                      en={lId ? '← Back to lesson' : '← Back to course'}
                    />
                  </Link>
                )}
              </div>
            </div>
          </section>
        );
      }}
    </ResourceState>
  );
}

/**
 * =========================================================================
 * 2. QUIZ ATTEMPT SCREEN (QuizAttemptPage)
 * =========================================================================
 */
export function QuizAttemptPage() {
  const { courseId, lessonId, attemptId } = useParams();
  const navigate = useNavigate();
  const resource = useAsyncResource(
    useCallback((signal) => contentService.attempt(attemptId, signal), [attemptId])
  );

  useEffect(() => {
    if (resource.data && resource.data.status !== 'SUBMITTED') {
      const cId = courseId || resource.data.courseId;
      const lId = lessonId || resource.data.lessonId;
      if (!courseId && cId) {
        const canonical = lId
          ? `/courses/${cId}/lessons/${lId}/quiz-attempts/${attemptId}`
          : `/courses/${cId}/quiz-attempts/${attemptId}`;
        navigate(canonical, { replace: true });
      }
    }
  }, [resource.data, courseId, lessonId, attemptId, navigate]);

  return (
    <ResourceState resource={resource}>
      {(attempt) => {
        const cId = courseId || attempt.courseId;
        const lId = lessonId || attempt.lessonId;
        const resultUrl = cId && lId
          ? `/courses/${cId}/lessons/${lId}/quiz-attempts/${attempt.id}/result`
          : cId
          ? `/courses/${cId}/quiz-attempts/${attempt.id}/result`
          : `/quiz-attempts/${attempt.id}/result`;

        return attempt.status === 'SUBMITTED' ? (
          <Navigate to={resultUrl} replace />
        ) : (
          <Attempt key={attempt.id} attempt={attempt} courseId={cId} lessonId={lId} />
        );
      }}
    </ResourceState>
  );
}

function Attempt({ attempt, courseId, lessonId }) {
  const navigate = useNavigate();
  const questions = attempt.questions || [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(
    Object.fromEntries(questions.map((question) => [question.questionId, question.answer]))
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [restartConfirm, setRestartConfirm] = useState(false);
  const [remaining, setRemaining] = useState(null);

  // Timer countdown
  useEffect(() => {
    if (!attempt.expiresAt) return;
    const offset = new Date(attempt.serverTime).getTime() - Date.now();
    const update = () =>
      setRemaining(
        Math.max(
          0,
          Math.ceil((new Date(attempt.expiresAt).getTime() - Date.now() - offset) / 1000)
        )
      );
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [attempt.expiresAt, attempt.serverTime]);

  if (!questions.length) {
    return (
      <EmptyState title={bilingualLabel("Quiz chưa có câu hỏi", "Quiz has no questions")}>
        <Link className="button secondary" to={courseId && lessonId ? `/courses/${courseId}/lessons/${lessonId}` : courseId ? `/courses/${courseId}` : '/my-learning'}>
          <BilingualText
            vi={lessonId ? 'Về bài học' : courseId ? 'Về khóa học' : 'Về góc học tập'}
            en={lessonId ? 'Back to lesson' : courseId ? 'Back to course' : 'Back to My Learning'}
          />
        </Link>
      </EmptyState>
    );
  }

  const question = questions[index];
  const expired = remaining === 0;

  async function saveCurrent() {
    const answer = answers[question.questionId];
    if (answer !== question.answer) {
      await contentService.answer(
        attempt.id,
        question.questionId,
        answerPresent(answer) ? answer : {}
      );
    }
  }

  async function changeQuestion(next) {
    setBusy(true);
    setError('');
    try {
      if (!expired) await saveCurrent();
      setIndex(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    setBusy(true);
    setError('');
    try {
      if (!expired) await saveCurrent();
      const result = await contentService.submit(attempt.id);
      const cId = courseId || result.courseId || attempt.courseId;
      const lId = lessonId || result.lessonId || attempt.lessonId;
      const resultUrl = cId && lId
        ? `/courses/${cId}/lessons/${lId}/quiz-attempts/${result.id}/result`
        : cId
        ? `/courses/${cId}/quiz-attempts/${result.id}/result`
        : `/quiz-attempts/${result.id}/result`;
      navigate(resultUrl);
    } catch (err) {
      setError(err.message);
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  }

  async function restart() {
    setBusy(true);
    setError('');
    try {
      const newAttempt = await contentService.restartAttempt(attempt.id);
      const cId = courseId || newAttempt.courseId || attempt.courseId;
      const lId = lessonId || newAttempt.lessonId || attempt.lessonId;
      const attemptUrl = cId && lId
        ? `/courses/${cId}/lesson/${lId}/quiz-attempts/${newAttempt.id}`
        : cId
        ? `/courses/${cId}/quiz-attempts/${newAttempt.id}`
        : `/quiz-attempts/${newAttempt.id}`;
      navigate(attemptUrl, { replace: true });
    } catch (err) {
      setError(err.message);
      setRestartConfirm(false);
    } finally {
      setBusy(false);
    }
  }

  const answeredCount = Object.values(answers).filter(answerPresent).length;
  const isLastQuestion = index + 1 === questions.length;
  const isUrgentTimer = remaining !== null && remaining <= 60;
  const isCriticalTimer = remaining !== null && remaining <= 20;

  return (
    <section className="quiz-workspace-container w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Sticky Header with Title and Countdown Timer */}
      <header className="sticky top-4 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E8E5DF] p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-[#FFF0DC] text-[#C2410C] flex items-center justify-center shrink-0 border border-[#FFCD00]/50 shadow-2xs font-bold text-xs">
            <Award size={16} />
          </span>
          <div className="truncate">
            <h1 className="text-sm sm:text-base font-black text-[#253044] truncate m-0">
              <BilingualText vi={attempt.quizTitleVi || attempt.quizTitle} en={attempt.quizTitle} />
            </h1>
            <p className="text-[11px] text-[#64748B] m-0 font-medium">
              <BilingualText
                vi={`Câu ${index + 1} / ${questions.length} · Đã làm: ${answeredCount}/${questions.length} câu`}
                en={`Question ${index + 1} / ${questions.length} · Answered: ${answeredCount}/${questions.length}`}
              />
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          {remaining !== null && (
            <div
              className={`badge flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                isCriticalTimer
                  ? 'bg-rose-600 text-white animate-pulse shadow-md'
                  : isUrgentTimer
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-stone-100 text-stone-700 border border-stone-200'
              }`}
              title={bilingualLabel("Thời gian còn lại", "Remaining time")}
            >
              <Clock size={13} className={isCriticalTimer ? 'text-white' : 'text-stone-500'} />
              <span>
                {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setRestartConfirm(true)}
            disabled={busy}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-200 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            title={bilingualLabel("Hủy bài làm này và bắt đầu lại từ đầu", "Discard and start over")}
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline"><BilingualText vi="Làm lại từ đầu" en="Start Over" /></span>
          </button>

          <button
            type="button"
            onClick={() => setConfirm(true)}
            disabled={busy}
            className="px-3.5 py-1.5 rounded-xl bg-[#F97316] hover:bg-[#C2410C] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <BilingualText vi="Nộp bài" en="Submit" />
          </button>
        </div>
      </header>

      {/* Progress Bar & Question Jump Palette */}
      <div className="bg-white rounded-2xl border border-[#E8E5DF] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#64748B]">
          <span><BilingualText vi="Tiến độ làm bài" en="Quiz progress" /></span>
          <span className="text-[#F97316]">{Math.round((answeredCount / questions.length) * 100)}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#F97316] transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Quick Jump Pills */}
        <div className="pt-2 flex flex-wrap gap-2 items-center">
          <span className="text-[11px] font-bold text-[#64748B] mr-1 hidden sm:inline">
            <BilingualText vi="Chọn câu:" en="Jump to:" />
          </span>
          {questions.map((q, qIdx) => {
            const isCurrent = qIdx === index;
            const isAnswered = answerPresent(answers[q.questionId]);

            return (
              <button
                key={q.questionId || qIdx}
                type="button"
                disabled={busy}
                onClick={() => changeQuestion(qIdx)}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#F97316] text-white shadow-xs scale-105 ring-2 ring-[#F97316]/20'
                    : isAnswered
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-[#FFFCF7] text-[#253044] border border-[#E8E5DF]/70 hover:bg-[#FFF0DC]'
                }`}
                title={bilingualLabel(`Chuyển đến câu ${qIdx + 1}${isAnswered ? ' (Đã trả lời)' : ''}`, `Go to question ${qIdx + 1}${isAnswered ? ' (Answered)' : ''}`)}
              >
                {qIdx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <Notice kind="error">
          <BilingualText>{error}</BilingualText>
        </Notice>
      )}

      {expired && (
        <Notice kind="error">
          <BilingualText>
            {"Đã hết thời gian làm bài! Vui lòng nộp các câu trả lời đã lưu để hệ thống chấm điểm."}
          </BilingualText>
        </Notice>
      )}

      {/* Main Question Card */}
      <article className="quiz-question card bg-white rounded-3xl border border-[#E8E5DF] p-6 sm:p-8 shadow-sm space-y-6">
        {/* Question Header & Type Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E5DF]/40 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FFF0DC] text-[#C2410C] font-black text-xs uppercase tracking-wider border border-[#FFCD00]/50">
              <BilingualText vi={`Câu ${index + 1}`} en={`Question ${index + 1}`} /> · {question.questionType?.replaceAll('_', ' ') || <BilingualText vi="TRẮC NGHIỆM" en="MULTIPLE CHOICE" />}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-bold text-xs">
              {question.points || 1} <BilingualText>{"điểm"}</BilingualText>
            </span>
          </div>

          <span className="text-xs text-[#64748B] font-medium">
            <BilingualText vi={`${answeredCount}/${questions.length} câu đã trả lời`} en={`${answeredCount}/${questions.length} answered`} />
          </span>
        </div>

        {/* Prompt */}
        <div className="space-y-3">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#253044] leading-snug">
            <BilingualText vi={question.promptVi || question.prompt} en={question.prompt} />
          </h2>

          {question.imageUrl && (
            <div className="rounded-2xl border border-[#E8E5DF]/60 overflow-hidden bg-[#FFFDF9] p-3 max-h-80 flex justify-center shadow-2xs">
              <ContentImage
                className="question-media max-h-72 w-auto object-contain rounded-xl"
                src={question.imageUrl}
                alt={bilingualLabel("Hình minh họa câu hỏi", "Question illustration")}
              />
            </div>
          )}

          {question.audioUrl && (
            <div className="pt-1">
              <MediaPlayer audioUrl={question.audioUrl} />
            </div>
          )}
        </div>

        {/* Interactive Answer Inputs */}
        <div className="pt-2">
          <QuestionInput
            question={question}
            answer={answers[question.questionId]}
            disabled={busy || expired}
            onChange={(answer) =>
              setAnswers((previous) => ({
                ...previous,
                [question.questionId]: answer,
              }))
            }
          />
        </div>
      </article>

      {/* Navigation Dock at Bottom */}
      <div className="lesson-navigation flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E8E5DF] shadow-xs">
        <button
          type="button"
          disabled={busy || index === 0}
          onClick={() => changeQuestion(index - 1)}
          className="button secondary inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-[#253044] bg-[#FFFCF7] hover:bg-[#FFF0DC] border border-[#E8E5DF] disabled:opacity-40 transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <BilingualText>{"Câu trước"}</BilingualText>
        </button>

        <span className="text-xs text-[#64748B] font-medium hidden sm:inline-block text-center">
          <BilingualText>{"Đáp án được tự động lưu mỗi khi chuyển câu"}</BilingualText>
        </span>

        {isLastQuestion || expired ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirm(true)}
            className="button inline-flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs sm:text-sm font-black text-white bg-[#F97316] hover:bg-[#C2410C] shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <CheckCircle2 size={15} />
            <BilingualText>{"Nộp bài thi →"}</BilingualText>
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => changeQuestion(index + 1)}
            className="button inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#F97316] hover:bg-[#C2410C] shadow-sm transition-all cursor-pointer"
          >
            <BilingualText>{"Câu tiếp theo"}</BilingualText>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirm && (
        <Modal title={bilingualLabel("Xác nhận nộp bài kiểm tra?", "Confirm quiz submission?")} busy={busy} onClose={() => setConfirm(false)}>
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-[#FFFCF7] border border-[#E8E5DF] text-xs sm:text-sm text-[#253044] space-y-2">
              <p className="m-0 font-semibold">
                <BilingualText
                  vi={`Bạn đã trả lời ${answeredCount} / ${questions.length} câu hỏi.`}
                  en={`You have answered ${answeredCount} / ${questions.length} questions.`}
                />
              </p>
              {answeredCount < questions.length && (
                <p className="m-0 text-amber-800 font-medium flex items-center gap-1.5 text-xs">
                  <AlertCircle size={14} className="shrink-0 text-amber-600" />
                  <span>
                    <BilingualText
                      vi={`Vẫn còn ${questions.length - answeredCount} câu chưa có câu trả lời. Bạn có chắc muốn nộp ngay?`}
                      en={`There are still ${questions.length - answeredCount} unanswered questions. Are you sure you want to submit now?`}
                    />
                  </span>
                </p>
              )}
            </div>

            <p className="text-xs text-[#64748B] m-0">
              <BilingualText
                vi="Sau khi nộp, hệ thống sẽ tự động chấm điểm và cung cấp giải thích chi tiết cho từng câu."
                en="After submitting, the system will automatically grade and provide detailed explanations for each question."
              />
            </p>

            <div className="actions flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="button secondary px-4 py-2 rounded-xl text-xs font-bold text-[#253044] bg-stone-100 hover:bg-stone-200 border border-stone-300 cursor-pointer"
                disabled={busy}
                onClick={() => setConfirm(false)}
              >
                <BilingualText vi="Kiểm tra lại bài" en="Review quiz" />
              </button>
              <button
                type="button"
                className="button px-5 py-2 rounded-xl text-xs font-black text-white bg-[#F97316] hover:bg-[#C2410C] shadow-sm cursor-pointer"
                disabled={busy}
                onClick={finish}
              >
                <BilingualText
                  vi={busy ? 'Đang nộp…' : 'Xác nhận nộp'}
                  en={busy ? 'Submitting…' : 'Confirm submission'}
                />
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Restart Confirmation Modal */}
      {restartConfirm && (
        <Modal title={bilingualLabel("Làm lại bài từ đầu?", "Start over from scratch?")} busy={busy} onClose={() => setRestartConfirm(false)}>
          <div className="space-y-4 py-2">
            <p className="text-xs sm:text-sm text-[#253044] m-0 leading-relaxed">
              <BilingualText
                vi="Hành động này sẽ hủy bài làm hiện tại cùng tất cả câu trả lời bạn đã chọn, và mở một bài làm hoàn toàn mới. Bạn có chắc chắn muốn làm lại?"
                en="This will discard your current attempt and all saved answers, and start a completely new session. Are you sure you want to start over?"
              />
            </p>
            <div className="actions flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="button secondary px-4 py-2 rounded-xl text-xs font-bold text-[#253044] bg-stone-100 hover:bg-stone-200 border border-stone-300 cursor-pointer"
                disabled={busy}
                onClick={() => setRestartConfirm(false)}
              >
                <BilingualText vi="Giữ bài làm" en="Keep current attempt" />
              </button>
              <button
                type="button"
                className="button px-5 py-2 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 shadow-sm cursor-pointer"
                disabled={busy}
                onClick={restart}
              >
                <BilingualText
                  vi={busy ? 'Đang tạo mới…' : 'Làm lại từ đầu'}
                  en={busy ? 'Creating new…' : 'Start over'}
                />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

/**
 * =========================================================================
 * 3. QUIZ RESULT SCREEN (QuizResultPage)
 * =========================================================================
 */
export function QuizResultPage() {
  const { courseId, lessonId, attemptId } = useParams();
  const navigate = useNavigate();
  const resource = useAsyncResource(
    useCallback((signal) => contentService.result(attemptId, signal), [attemptId])
  );

  useEffect(() => {
    if (resource.data) {
      const cId = courseId || resource.data.courseId;
      const lId = lessonId || resource.data.lessonId;
      if (!courseId && cId) {
        const canonical = lId
          ? `/courses/${cId}/lessons/${lId}/quiz-attempts/${attemptId}/result`
          : `/courses/${cId}/quiz-attempts/${attemptId}/result`;
        navigate(canonical, { replace: true });
      }
    }
  }, [resource.data, courseId, lessonId, attemptId, navigate]);

  return (
    <ResourceState resource={resource}>
      {(result) => <Result result={result} courseId={courseId} lessonId={lessonId} />}
    </ResourceState>
  );
}

function Result({ result, courseId, lessonId }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const cId = courseId || result.courseId;
  const lId = lessonId || result.lessonId;
  const [nextLessonId, setNextLessonId] = useState(result.nextLessonId || null);

  useEffect(() => {
    if (result.nextLessonId) {
      setNextLessonId(result.nextLessonId);
      return;
    }
    const targetLessonId = lId || result.lessonId;
    if (targetLessonId) {
      contentService.lesson(targetLessonId).then((data) => {
        if (data?.nextLessonId) {
          setNextLessonId(data.nextLessonId);
        }
      }).catch(() => {});
    }
  }, [result.nextLessonId, lId, result.lessonId]);

  async function retry() {
    setBusy(true);
    try {
      const attempt = await contentService.startQuiz(result.quizId);
      const targetCId = cId || attempt.courseId;
      const targetLId = lId || attempt.lessonId;
      const attemptUrl = targetCId && targetLId
        ? `/courses/${targetCId}/lessons/${targetLId}/quiz-attempts/${attempt.id}`
        : targetCId
        ? `/courses/${targetCId}/quiz-attempts/${attempt.id}`
        : `/quiz-attempts/${attempt.id}`;
      navigate(attemptUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const back =
    lId && cId
      ? `/courses/${cId}/lessons/${lId}`
      : cId
      ? `/courses/${cId}`
      : '/my-learning';

  const percentage = Math.round(Number(result.percentage || 0));
  const passed = Boolean(result.passed);
  const currentLessonUrl =
    lId && cId
      ? `/courses/${cId}/lessons/${lId}`
      : cId
      ? `/courses/${cId}`
      : '/my-learning';

  const nextLessonUrl =
    nextLessonId && cId
      ? `/courses/${cId}/lessons/${nextLessonId}`
      : cId
      ? `/courses/${cId}`
      : currentLessonUrl;

  const continueUrl = passed ? nextLessonUrl : currentLessonUrl;

  return (
    <section className="quiz-result-screen w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to={back}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#253044] transition-colors no-underline"
        >
          <ArrowLeft size={14} />
          <span>
            <BilingualText
              vi={lId ? 'Về bài học' : cId ? 'Về khóa học' : 'Về góc học tập'}
              en={lId ? 'Back to lesson' : cId ? 'Back to course' : 'Back to My Learning'}
            />
          </span>
        </Link>
      </div>

      {/* Main Result Celebration Card */}
      <div className="quiz-result card relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFCF7] via-[#FFFCF7] to-[#FFF7E8] border border-[#E8E5DF] p-6 sm:p-10 shadow-sm text-center space-y-6">
        {/* Celebration / Outcome Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-2xs mx-auto border"
          style={{
            backgroundColor: passed ? '#DDF4E7' : '#FFF0EE',
            color: passed ? '#22A06B' : '#DA251D',
            borderColor: passed ? '#a7f3d0' : '#fecaca',
          }}
        >
          {passed ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <BilingualText
            vi={passed ? 'Hoàn thành xuất sắc' : 'Cần ôn tập thêm'}
            en={passed ? 'Passed' : 'Keep Trying'}
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#253044] tracking-tight">
          <BilingualText vi={result.quizTitleVi || result.quizTitle} en={result.quizTitle} />
        </h1>

        <p className="text-sm text-[#64748B] max-w-xl mx-auto">
          <BilingualText
            vi={passed
              ? 'Tuyệt vời! Bạn đã làm chủ tốt các kiến thức trong bài học này.'
              : 'Từng bước nhỏ đều có ý nghĩa. Hãy xem lại các câu trả lời để củng cố kiến thức nhé!'}
            en={passed
              ? 'Great job! You have successfully mastered the knowledge in this lesson.'
              : 'Every small step counts. Review your answers to strengthen your knowledge!'}
          />
        </p>

        {/* Circular Score Badge */}
        <div className="flex justify-center my-4">
          <div
            className={`quiz-score relative flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 shadow-md transition-all ${
              passed
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-amber-50 border-amber-500 text-amber-800'
            }`}
          >
            <span className="text-4xl font-black tracking-tight">{percentage}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-80">
              <BilingualText vi={passed ? 'Đạt chuẩn' : 'Chưa đạt'} en={passed ? 'Passed' : 'Needs Practice'} />
            </span>
          </div>
        </div>

        {/* 3 KPI Breakdown Cards */}
        <div className="grid grid-cols-3 gap-3.5 max-w-lg mx-auto">
          <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-center shadow-2xs space-y-0.5">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block tracking-wider">
              <BilingualText vi="Câu đúng" en="Correct" />
            </span>
            <strong className="text-xl font-black text-emerald-800">{result.correctCount}</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-rose-200 text-center shadow-2xs space-y-0.5">
            <span className="text-[10px] font-bold text-rose-700 uppercase block tracking-wider">
              <BilingualText vi="Câu sai" en="Incorrect" />
            </span>
            <strong className="text-xl font-black text-rose-800">{result.incorrectCount}</strong>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 text-center shadow-2xs space-y-0.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase block tracking-wider">
              <BilingualText vi="Chưa làm" en="Unanswered" />
            </span>
            <strong className="text-xl font-black text-stone-700">{result.unansweredCount}</strong>
          </div>
        </div>

        {error && (
          <Notice kind="error">
            <BilingualText>{error}</BilingualText>
          </Notice>
        )}

        {/* Action Buttons */}
        <div className="quiz-result-actions flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#E8E5DF]/40">
          <Link
            to={continueUrl}
            className="button inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-[#F97316] hover:bg-[#C2410C] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all no-underline cursor-pointer"
          >
            <BilingualText
              vi={passed ? (nextLessonId ? 'Tiếp tục học ngay →' : 'Hoàn thành khóa học →') : 'Ôn tập lại bài học →'}
              en={passed ? (nextLessonId ? 'Continue learning →' : 'Complete course →') : 'Review lesson →'}
            />
          </Link>

          {passed && nextLessonId && (
            <Link
              to={currentLessonUrl}
              className="button secondary inline-flex items-center gap-2 py-3 px-5 rounded-2xl bg-white hover:bg-stone-50 text-[#253044] border border-[#E8E5DF] font-bold text-xs sm:text-sm shadow-2xs transition-all no-underline"
            >
              <BilingualText vi="Xem lại bài vừa học" en="Review completed lesson" />
            </Link>
          )}

          <a
            href="#review-answers"
            className="button secondary inline-flex items-center gap-2 py-3 px-5 rounded-2xl bg-white hover:bg-stone-50 text-[#253044] border border-[#E8E5DF] font-bold text-xs sm:text-sm shadow-2xs transition-all no-underline"
          >
            <BilingualText vi="Xem chi tiết đáp án ↓" en="View detailed answers ↓" />
          </a>

          <button
            type="button"
            disabled={busy || !result.canRetry}
            onClick={retry}
            className="secondary inline-flex items-center gap-2 py-3 px-5 rounded-2xl bg-[#FFFCF7] hover:bg-[#FFF0DC] text-[#253044] border border-[#E8E5DF] font-bold text-xs sm:text-sm disabled:opacity-40 transition-all cursor-pointer"
          >
            <RotateCcw size={14} className={busy ? 'animate-spin' : ''} />
            <BilingualText
              vi={busy ? 'Đang chuẩn bị…' : 'Làm lại quiz'}
              en={busy ? 'Preparing…' : 'Retake quiz'}
            />
          </button>
        </div>
      </div>

      {/* Review Answers Section */}
      <section className="quiz-workspace space-y-4" id="review-answers">
        <div className="flex items-center gap-2 border-b border-[#E8E5DF]/50 pb-3">
          <BookOpen size={20} className="text-[#F97316]" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#253044] m-0">
              <BilingualText vi="Xem lại câu trả lời và giải thích chi tiết" en="Review answers and detailed explanations" />
            </h2>
            <p className="text-xs text-[#64748B] m-0">
              <BilingualText vi="Đối chiếu câu trả lời của bạn với đáp án chính xác của hệ thống." en="Compare your answers with the correct solutions." />
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {result.questions?.map((question, qIdx) => {
            const isCorrect = Boolean(question.isCorrect);

            return (
              <details
                className="answer-review card group rounded-2xl border border-[#E8E5DF] bg-white p-5 shadow-2xs open:shadow-xs transition-all"
                key={question.questionId || qIdx}
                open
              >
                <summary className="flex items-start justify-between gap-3 cursor-pointer select-none list-none font-bold text-sm sm:text-base text-[#253044]">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`answer-mark w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-black text-xs ${
                        isCorrect
                          ? 'correct bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {isCorrect ? '✓' : '✕'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#C2410C]">
                          <BilingualText vi={`Câu ${qIdx + 1}`} en={`Question ${qIdx + 1}`} />
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <BilingualText vi={isCorrect ? 'Chính xác' : 'Chưa đúng'} en={isCorrect ? 'Correct' : 'Incorrect'} />
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-[#253044] leading-snug">
                        <BilingualText vi={question.promptVi || question.prompt} en={question.prompt} />
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-stone-400 group-open:rotate-180 transition-transform mt-1">
                    ▼
                  </span>
                </summary>

                {/* Question Details Body */}
                <div className="mt-4 pt-4 border-t border-[#E8E5DF]/40 space-y-3 text-xs sm:text-sm pl-10">
                  {/* Learner's Answer */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <strong className="text-stone-600 block text-[11px] uppercase tracking-wider mb-0.5">
                      <BilingualText vi="Bạn trả lời:" en="Your answer:" />
                    </strong>
                    <span className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {answerLabel(question.answer, question.options)}
                    </span>
                  </div>

                  {/* Correct Answer */}
                  {!isCorrect && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <strong className="text-emerald-800 block text-[11px] uppercase tracking-wider mb-0.5">
                        <BilingualText vi="Đáp án chính xác:" en="Correct answer:" />
                      </strong>
                      <span className="font-bold text-emerald-900">
                        {answerLabel(question.correctAnswer, question.options)}
                      </span>
                    </div>
                  )}

                  {/* Explanation */}
                  {(question.explanationVi || question.explanation) && (
                    <div className="p-3.5 rounded-xl bg-[#FFFCF7] border border-[#FFCD00]/50 text-[#253044] flex items-start gap-2.5">
                        <div className="space-y-0.5">
                        <strong className="text-xs font-bold text-[#C2410C] block">
                          <BilingualText vi="Giải thích:" en="Explanation:" />
                        </strong>
                        <p className="text-xs text-[#64748B] m-0 leading-relaxed">
                          <BilingualText
                            vi={question.explanationVi || question.explanation}
                            en={question.explanation || question.explanationVi}
                          />
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </section>
  );
}

export default QuizPage;
