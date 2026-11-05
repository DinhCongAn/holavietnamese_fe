import { useTranslation } from 'react-i18next';
import { BilingualText } from '@/shared/components/common/BilingualText';
import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { vocabularyReviewService } from '@/features/vocabulary/api/vocabularyReviewService';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { PageHeader, SpeakButton, EmptyState } from '@/shared/components/common/Ui';
import { ProgressBar } from '@/shared/components/common/ProgressBar';
import { FlipCard, FireworksBackground, CountingNumber, RippleButton } from '@/shared/components/common/animate';
import '@/features/vocabulary/components/vocabulary.css';
import { CircleCheck, RotateCcw, Gauge, Check, CheckCheck } from 'lucide-react';

export function VocabularyReviewPage() {
  const { user } = useAuth();
  const storageKey = `vocabulary-review:${user?.userId ?? user?.id ?? user?.username ?? 'current'}`;
  const resource = useAsyncResource(useCallback(async signal => {
    const session = await vocabularyReviewService.session(localStorage.getItem(storageKey) ?? sessionStorage.getItem(storageKey), { signal });
    if (!signal.aborted) localStorage.setItem(storageKey, session.sessionId);
    return session;
  }, [storageKey]));
  const restart = () => { localStorage.removeItem(storageKey); sessionStorage.removeItem(storageKey); resource.reload(); };
  return (
    <section className="vocabulary-ui vocabulary-review-page">
      <PageHeader
        eyebrow={<BilingualText vi="Ôn từng chút một" en="A little practice at a time" />}
        title={<BilingualText vi="Ôn tập từ vựng" en="Vocabulary review" />}
        description={<BilingualText vi="Một vài phút để những từ mới trở nên quen thuộc." en="A few minutes to make new words familiar." />}
        actions={
          <>
            <Link to={`${ROUTES.MY_LEARNING}?tab=vocabulary`} className="button secondary">
              <BilingualText vi="← Góc học tập" en="← My learning" />
            </Link>
            <Link to={ROUTES.VOCABULARY_NOTEBOOK} className="button secondary">
              <BilingualText vi="Sổ từ vựng" en="Vocabulary notebook" />
            </Link>
          </>
        }
      />
      <ResourceState resource={resource}>
        {session => session.entries.length || session.results.length ? (
          <ReviewDeck key={session.sessionId} session={session} onRestart={restart} />
        ) : (
          <EmptyState
            title={session.notebookCount
              ? <BilingualText vi="Bạn đã ôn hết các từ đến hạn" en="You have reviewed every word due today" />
              : <BilingualText vi="Sổ tay của bạn đang chờ từ đầu tiên" en="Your notebook is waiting for its first word" />}
            description={session.notebookCount
              ? <BilingualText vi="Lịch ôn tiếp theo đã được lưu trong sổ tay." en="Your next review schedule has been saved." />
              : <BilingualText vi="Thêm từ hoặc lưu từ trong khi học để bắt đầu ôn tập." en="Add or save a word while learning to begin reviewing." />}
          >
            <Link className="button" to={ROUTES.VOCABULARY_NOTEBOOK}>
              <BilingualText>{session.notebookCount ? 'Về sổ tay' : 'Thêm từ vựng'}</BilingualText>
            </Link>
          </EmptyState>
        )}
      </ResourceState>
    </section>
  );
}

function ReviewDeck({ session, onRestart }) {
  const { i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage || i18n.language).startsWith('vi') ? 'vi-VN' : 'en-US';
  const entries = session.entries;
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState(session.results);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const goodCount = results.filter(result => result.rating === 'GOOD' || result.rating === 'EASY').length;
  const moreCount = results.length - goodCount;

  const labels = {
    AGAIN: { vi: 'Ôn lại', en: 'Again' },
    HARD: { vi: 'Khó', en: 'Hard' },
    GOOD: { vi: 'Nhớ được', en: 'Good' },
    EASY: { vi: 'Dễ', en: 'Easy' }
  };
  const ratingIcons = { AGAIN: RotateCcw, HARD: Gauge, GOOD: Check, EASY: CheckCheck };

  if (index >= entries.length) {
    return (
      <div className="review-summary card relative overflow-hidden">
        <FireworksBackground active={true} />
        <span className="state-symbol" aria-hidden="true"><CircleCheck size={36} /></span>
        <p className="eyebrow"><BilingualText vi="Hoàn thành ôn tập" en="Review complete" /></p>
        <h2><BilingualText vi="Một chút tiến bộ hôm nay." en="A little progress today." /></h2>
        <div className="vocabulary-review-completion">
          <strong>100%</strong>
          <span><BilingualText vi="Hoàn thành phiên ôn tập" en="Review session complete" /></span>
        </div>
        <p>
          <BilingualText
            vi={<>Bạn đã ôn <CountingNumber value={results.length} /> từ trong phiên này.</>}
            en={<>You reviewed <CountingNumber value={results.length} /> words in this session.</>}
          />
        </p>
        <div className="vocabulary-review-statistics">
          <div>
            <strong><CountingNumber value={results.length} /></strong>
            <span><BilingualText vi="Tổng số từ đã ôn" en="Total words reviewed" /></span>
          </div>
          <div>
            <strong><CountingNumber value={goodCount} /></strong>
            <span><BilingualText vi="Nhớ được / Dễ" en="Good / Easy" /></span>
          </div>
          <div>
            <strong><CountingNumber value={moreCount} /></strong>
            <span><BilingualText vi="Ôn lại" en="Again" /></span>
          </div>
        </div>
        <p className="muted">
          <BilingualText
            vi={<>{moreCount} từ cần ôn thêm. Kết quả và lịch ôn đã được lưu.</>}
            en={<>{moreCount} words need more practice. Results and review schedules have been saved.</>}
          />
        </p>
        <div className="actions">
          <RippleButton variant="primary" size="md" onClick={onRestart}>
            <BilingualText vi="Ôn lại" en="Again" />
          </RippleButton>
          <Link className="button secondary" to={ROUTES.VOCABULARY_NOTEBOOK}>
            <BilingualText vi="Về sổ tay" en="Back to notebook" />
          </Link>
          <Link className="text-link" to={`${ROUTES.MY_LEARNING}?tab=vocabulary`}>
            <BilingualText vi="Về góc học tập" en="Back to my learning" />
          </Link>
        </div>
        <ul className="vocabulary-review-results">
          {results.map(result => (
            <li key={result.entryId}>
              <span>{result.word}</span>
              <span className={`vocabulary-rating vocabulary-rating--${result.rating.toLowerCase()}`}>
                <BilingualText vi={labels[result.rating]?.vi} en={labels[result.rating]?.en} /><br />
                <time dateTime={result.nextReviewAt}>{new Date(result.nextReviewAt).toLocaleString(locale)}</time>
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const word = entries[index];
  async function rate(value) {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      const result = await vocabularyReviewService.rate(word.id, session.sessionId, value);
      setResults(previous => [...previous, result]);
      setRevealed(false);
      setIndex(previous => previous + 1);
    } catch (failure) {
      setError(failure.message);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  const total = entries.length + session.results.length;

  return (
    <div className="review-workspace">
      <ProgressBar
        value={(results.length / total) * 100}
        label={`${results.length + 1} / ${total} ${locale === 'vi-VN' ? 'từ' : 'words'}`}
      />

      {/* 3D FlipCard for interactive Flashcard experience */}
      <FlipCard
        trigger="click"
        flipped={revealed}
        onFlip={(state) => setRevealed(state)}
        className="w-full max-w-lg mx-auto"
        innerClassName="min-h-[260px]"
        front={
          <article className="review-flashcard card w-full h-full flex flex-col items-center justify-center text-center p-6 sm:p-8 cursor-pointer select-none">
            <p className="eyebrow">{word.courseTitle || <BilingualText vi="Sổ tay của bạn" en="Your notebook" />}</p>
            <h2 lang="vi" className="text-3xl font-black text-surface-ink my-2">{word.word}</h2>
            <div onClick={(e) => e.stopPropagation()}>
              <SpeakButton text={word.word} audioUrl={word.audioUrl} />
            </div>
            <p className="muted text-sm my-1">{word.pronunciation}</p>
            <p className="review-question text-xs text-brand-600 font-semibold mt-3">
              <BilingualText vi="Chạm vào thẻ để lật xem nghĩa ↷" en="Tap card to flip for meaning ↷" />
            </p>
          </article>
        }
        back={
          <article className="review-flashcard card w-full h-full flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-brand-50 border-brand-300 cursor-pointer select-none">
            <p className="eyebrow text-brand-600"><BilingualText vi="Ý nghĩa & Ví dụ" en="Meaning & Example" /></p>
            <h3 className="text-xl font-bold text-surface-ink my-2">{word.meaning}</h3>
            {word.exampleSentence && (
              <blockquote className="text-xs text-surface-muted italic max-w-md bg-white/80 p-3 rounded-xl border border-brand-200 my-2">
                “{word.exampleSentence}”
              </blockquote>
            )}
            <p className="text-xs text-surface-muted mt-2">
              <BilingualText vi="Chạm để lật lại từ vựng ↶" en="Tap to flip back ↶" />
            </p>
          </article>
        }
      />

      {error && <p role="alert" className="text-xs text-red-600 text-center">{error}</p>}

      <div className="review-ratings mt-6">
        {Object.entries(labels).map(([id, item]) => {
          const Icon = ratingIcons[id];
          return (
            <button
              key={id}
              className={`secondary vocabulary-rating-action vocabulary-rating-action--${id.toLowerCase()} transition-transform active:scale-95`}
              disabled={!revealed || pending}
              onClick={() => rate(id)}
            >
              <Icon size={18} aria-hidden="true" />
              <BilingualText vi={item.vi} en={item.en} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default VocabularyReviewPage;
