import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { Notice } from '@/shared/components/common/Ui';
import { vocabularyService } from '@/features/vocabulary/api/vocabularyService';
import { Bookmark, BookmarkCheck } from 'lucide-react';

export function SaveVocabularyButton({ entry, compact = false, initialSavedEntry = null, checking = false, checkError, onSaved, onDeleted }) {
  useTextLanguage();
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [savedEntry, setSavedEntry] = useState(initialSavedEntry);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!checking) setSavedEntry(initialSavedEntry);
  }, [initialSavedEntry, checking, entry.id]);

  async function save() {
    if (submitting.current) return;
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location.pathname + location.search } });
      return;
    }
    submitting.current = true;
    setPending(true);
    setError('');
    setMessage('');
    try {
      if (savedEntry) {
        await vocabularyService.delete(savedEntry.id);
        setSavedEntry(null);
        setMessage(`Đã xóa “${savedEntry.word}” khỏi sổ tay.`);
        onDeleted?.(savedEntry);
      } else {
        const saved = await vocabularyService.saveWord(entry);
        if (!saved?.id) throw new Error('Máy chủ chưa xác nhận từ vựng đã được lưu. Vui lòng thử lại.');
        setSavedEntry(saved);
        setMessage(`Đã lưu “${saved.word}” vào sổ tay.`);
        onSaved?.(saved);
      }
    } catch (failure) {
      setError(failure.message);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return <>
    <div className={compact ? 'vocabulary-card-save' : 'actions vocabulary-detail-save'}>
      <button type="button" className={compact ? `vocabulary-save-icon${savedEntry ? ' is-saved' : ''}` : undefined}
        aria-label={compact ? (pending ? (savedEntry ? bilingualLabel('Đang xóa…', 'Removing…') : bilingualLabel('Đang lưu…', 'Saving…')) : savedEntry ? bilingualLabel(`Xóa “${entry.word}” khỏi sổ tay`, `Remove “${entry.word}” from notebook`) : bilingualLabel(`Lưu “${entry.word}” vào sổ tay`, `Save “${entry.word}” to notebook`)) : undefined}
        aria-pressed={!!savedEntry} aria-busy={pending}
        title={savedEntry ? bilingualLabel('Xóa khỏi sổ tay', 'Remove from notebook') : bilingualLabel('Lưu vào sổ tay', 'Save to notebook')}
        disabled={loading || pending || checking || Boolean(checkError)} onClick={save}>
        {savedEntry ? <BookmarkCheck size={18} aria-hidden="true" /> : <Bookmark size={18} aria-hidden="true" />}
        <span className={compact ? 'sr-only' : undefined}><BilingualText>{pending ? (savedEntry ? 'Đang xóa…' : 'Đang lưu…') : savedEntry ? 'Đã lưu vào sổ tay' : 'Lưu vào sổ tay'}</BilingualText></span>
      </button>
    </div>
    {message && <Notice kind="success"><BilingualText>{message}</BilingualText> {savedEntry && <Link to={ROUTES.VOCABULARY_NOTEBOOK}><BilingualText>{"Mở sổ tay"}</BilingualText></Link>}</Notice>}
    {error && <Notice kind="error"><BilingualText>{error}</BilingualText></Notice>}
  </>;
}
