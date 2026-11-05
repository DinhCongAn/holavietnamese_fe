import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useRef, useState } from 'react'
import { vocabularyService } from '@/features/vocabulary/api/vocabularyService'
import { Modal } from '@/shared/components/common/Modal'
export function VocabularyForm({ entry, initialValues, lessonId = null, lessons = [], lessonOptions, onSaved, onClose }) {
  useTextLanguage();
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)
  const values = entry || initialValues || {}
  async function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    const form = new FormData(event.currentTarget)
    const selectedLesson = form.get('lessonId')
    const data = { lessonId: lessonId ?? (selectedLesson ? Number(selectedLesson) : null),
      ...(entry?.masterVocabularyId != null ? { masterVocabularyId: entry.masterVocabularyId } : {}),
      ...Object.fromEntries(['word', 'meaning', 'pronunciation', 'exampleSentence', 'note'].map(key => [key, form.get(key)])) }
    submitting.current = true; setPending(true); setError('')
    try {
      const saved = entry ? await vocabularyService.update(entry.id, data) : await vocabularyService.add(data)
      onSaved(saved)
    } catch (e) { setError(e.message) } finally { submitting.current = false; setPending(false) }
  }
  return <Modal title={entry ? 'Chỉnh sửa từ vựng' : 'Lưu từ vựng'} onClose={onClose} busy={pending}><form className="vocabulary-notebook-form" onSubmit={submit}>
    <label><BilingualText>{"Từ tiếng Việt"}</BilingualText><input name="word" defaultValue={values.word || ''} required maxLength={200} autoFocus lang="vi" disabled={pending} readOnly={entry?.masterVocabularyId != null} /></label>
    <label><BilingualText>{"Nghĩa"}</BilingualText><textarea name="meaning" defaultValue={values.meaning || ''} required maxLength={1000} rows={2} disabled={pending} readOnly={entry?.masterVocabularyId != null} /></label>
    <label><BilingualText>{"Phát âm"}</BilingualText><input name="pronunciation" defaultValue={values.pronunciation || ''} maxLength={200} disabled={pending} /></label>
    <label><BilingualText>{"Câu ví dụ"}</BilingualText><textarea name="exampleSentence" defaultValue={values.exampleSentence || ''} maxLength={2000} rows={2} lang="vi" disabled={pending} /></label>
    <label><BilingualText>{"Ghi chú"}</BilingualText><textarea name="note" defaultValue={values.note || ''} maxLength={2000} rows={2} disabled={pending} /></label>
    {lessonId == null && <label><BilingualText>{"Bài học (không bắt buộc)"}</BilingualText><select name="lessonId" defaultValue={entry?.lessonId || ''} disabled={pending}><option value="">{bilingualLabel("Từ vựng cá nhân")}</option>
      {entry?.lessonId && !lessons.some(l => l.id === entry.lessonId) && <option value={entry.lessonId}>{entry.lessonTitle}</option>}
      {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select></label>}
    {lessonId == null && lessonOptions?.loading && <p className="muted" role="status"><BilingualText>{"Đang tải danh sách bài học…"}</BilingualText></p>}
    {lessonId == null && lessonOptions?.error && <p role="alert"><BilingualText>{"Không thể tải danh sách bài học."}</BilingualText><button type="button" className="secondary" disabled={pending} onClick={lessonOptions.reload}><BilingualText>{"Thử lại"}</BilingualText></button></p>}
    {error && <p role="alert"><BilingualText>{error}</BilingualText></p>}<div className="actions"><button type="button" className="secondary" onClick={onClose} disabled={pending}><BilingualText>{"Hủy"}</BilingualText></button><button disabled={pending}><BilingualText>{pending ? 'Đang lưu…' : 'Lưu từ vựng'}</BilingualText></button></div>
  </form></Modal>
}
