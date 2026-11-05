import { BilingualText, useBilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/shared/components/common/Modal';
import { adminVocabularyService } from '@/features/vocabulary/api/adminVocabularyService';
import { newExample, newMeaning, vocabularyDraft, vocabularyPayload } from '@/features/vocabulary/models/AdminVocabulary';
import { DictionaryAttribution } from '@/features/vocabulary/components/DictionaryElements';
import '@/features/vocabulary/components/dictionary.css';

const dateText = (value) => value ? new Date(value).toLocaleString('vi-VN') : '—';

function VocabularyDetail({ entry, onEdit, canEdit }) {
  const lang = useTextLanguage();
  const dateText = (value) => value ? new Date(value).toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN') : '—';
  return <div className="admin-vocabulary-detail">
    <dl>
      <dt>ID</dt><dd>{entry.id}</dd><dt><BilingualText>{"Từ vựng"}</BilingualText></dt><dd>{entry.word}</dd>
      <dt><BilingualText>{"Phiên âm"}</BilingualText></dt><dd>{entry.pronunciation || '—'}</dd><dt><BilingualText>{"Từ loại"}</BilingualText></dt><dd>{entry.partOfSpeech}</dd>
      <dt><BilingualText>{"Audio URL"}</BilingualText></dt><dd style={{ overflowWrap: 'anywhere' }}>{entry.audioUrl || '—'}</dd>
      <dt><BilingualText>{"Trạng thái"}</BilingualText></dt><dd><BilingualText>{entry.status}</BilingualText></dd>
      <dt><BilingualText>{"Ngày xuất bản"}</BilingualText></dt><dd>{dateText(entry.publishedAt)}</dd><dt><BilingualText>{"Ngày lưu trữ"}</BilingualText></dt><dd>{dateText(entry.archivedAt)}</dd>
      <dt><BilingualText>{"Ngày tạo"}</BilingualText></dt><dd>{dateText(entry.createdAt)}</dd><dt><BilingualText>{"Cập nhật lần cuối"}</BilingualText></dt><dd>{dateText(entry.updatedAt)}</dd>
    </dl>
    {(entry.meanings ?? []).map((meaning, index) => <section className="admin-card" key={meaning.id ?? index} style={{ marginBottom: 14 }}>
      <h3><BilingualText>{"Nghĩa"}</BilingualText>{index + 1}: {meaning.translationEn}</h3>
      {meaning.definitionVi && <p lang="vi" style={{ whiteSpace: 'pre-wrap' }}><strong><BilingualText vi="Định nghĩa Việt–Việt: " en="Vietnamese-Vietnamese definition: " /></strong>{meaning.definitionVi}</p>}
      <p><BilingualText>{"Định nghĩa:"}</BilingualText>{meaning.definitionEn || '—'}</p><p><BilingualText>{"Ghi chú sử dụng:"}</BilingualText>{meaning.usageNote || '—'}</p><p><BilingualText>{"Thứ tự:"}</BilingualText>{meaning.displayOrder ?? 0}</p>
      {(meaning.examples ?? []).map((example, exampleIndex) => <div key={example.id ?? exampleIndex}>
        <h4><BilingualText>{"Ví dụ"}</BilingualText>{exampleIndex + 1}</h4><p lang="vi">{example.exampleVi}</p><p>{example.translationEn}</p>
        <p style={{ overflowWrap: 'anywhere' }}><BilingualText>{"Audio URL:"}</BilingualText>{example.audioUrl || '—'}</p><p><BilingualText>{"Thứ tự:"}</BilingualText>{example.displayOrder ?? 0}</p>
      </div>)}
    </section>)}
    <DictionaryAttribution source={entry.source} />
    {canEdit && entry.status === 'DRAFT' && <div className="actions"><button type="button" onClick={onEdit}><BilingualText>{"Sửa từ vựng"}</BilingualText></button></div>}
  </div>;
}

export function AdminVocabularyModal({ mode, id, onClose, onSaved, onEdit, canEdit = false }) {
  const label = useBilingualLabel();
  const submitting = useRef(false);
  const [entry, setEntry] = useState(null);
  const [draft, setDraft] = useState(() => vocabularyDraft());
  const [loading, setLoading] = useState(mode !== 'create');
  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'create') return;
    const controller = new AbortController();
    setLoading(true); setLoadError('');
    adminVocabularyService.get(id, { signal: controller.signal }).then((value) => {
      if (!controller.signal.aborted) { setEntry(value); setDraft(vocabularyDraft(value)); setLoading(false); }
    }).catch((failure) => {
      if (!controller.signal.aborted) { setLoadError(failure.message); setLoading(false); }
    });
    return () => controller.abort();
  }, [id, mode, revision]);

  const change = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const changeMeaning = (index, field, value) => setDraft((current) => ({ ...current, meanings: current.meanings.map((meaning, i) => i === index ? { ...meaning, [field]: value } : meaning) }));
  const changeExample = (meaningIndex, index, field, value) => setDraft((current) => ({ ...current, meanings: current.meanings.map((meaning, i) => i === meaningIndex ? { ...meaning, examples: meaning.examples.map((example, j) => j === index ? { ...example, [field]: value } : example) } : meaning) }));

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true; setError('');
    try {
      const payload = vocabularyPayload(draft);
      setPending(true);
      const response = mode === 'edit' ? await adminVocabularyService.update(id, payload) : await adminVocabularyService.create(payload);
      onSaved(response);
    } catch (failure) { setError(failure.message); } finally { submitting.current = false; setPending(false); }
  }

  const title = mode === 'view' ? 'Chi tiết từ vựng' : mode === 'edit' ? 'Cập nhật từ vựng' : 'Thêm từ vựng';
  return <Modal title={label(title)} onClose={onClose} busy={pending}>
    {loading ? <div className="state" role="status"><BilingualText>{"Đang tải từ vựng…"}</BilingualText></div> : loadError
      ? <div className="state" role="alert"><p><BilingualText>{loadError}</BilingualText></p><button type="button" onClick={() => setRevision((value) => value + 1)}><BilingualText>{"Thử lại"}</BilingualText></button></div>
      : mode === 'view' ? <VocabularyDetail entry={entry} onEdit={onEdit} canEdit={canEdit} />
      : <form className="admin-vocabulary-form" onSubmit={submit}>
        <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <label><BilingualText>{"Từ vựng"}</BilingualText><input value={draft.word} onChange={(event) => change('word', event.target.value)} required maxLength={200} lang="vi" /></label>
          <label><BilingualText>{"Phiên âm"}</BilingualText><input value={draft.pronunciation} onChange={(event) => change('pronunciation', event.target.value)} maxLength={200} /></label>
          <label><BilingualText>{"Từ loại"}</BilingualText><input value={draft.partOfSpeech} onChange={(event) => change('partOfSpeech', event.target.value)} required maxLength={40} placeholder={label("Ví dụ: phrase, noun, verb")} /></label>
          <label><BilingualText>{"Audio URL"}</BilingualText><input value={draft.audioUrl} onChange={(event) => change('audioUrl', event.target.value)} maxLength={2048} /></label>
          <p><strong><BilingualText>{"Trạng thái:"}</BilingualText></strong> <BilingualText>{"DRAFT"}</BilingualText></p>
          {draft.meanings.map((meaning, meaningIndex) => <section className="admin-card" key={meaningIndex} style={{ marginBottom: 14 }}>
            <div className="row"><h3><BilingualText>{"Nghĩa"}</BilingualText>{meaningIndex + 1}</h3><button type="button" className="secondary" disabled={draft.meanings.length === 1} onClick={() => change('meanings', draft.meanings.filter((_, index) => index !== meaningIndex))}><BilingualText>{"Xóa nghĩa"}</BilingualText>{meaningIndex + 1}</button></div>
            <label><BilingualText vi="Định nghĩa Việt–Việt" en="Vietnamese-Vietnamese definition" /><textarea value={meaning.definitionVi} onChange={event => changeMeaning(meaningIndex, 'definitionVi', event.target.value)} rows={4} maxLength={10000} lang="vi" /></label>
            <label><BilingualText>{"Bản dịch tiếng Anh"}</BilingualText><input value={meaning.translationEn} onChange={(event) => changeMeaning(meaningIndex, 'translationEn', event.target.value)} maxLength={500} /></label>
            <p className="muted"><BilingualText vi="Mỗi nghĩa cần định nghĩa tiếng Việt hoặc thông tin tiếng Anh có căn cứ. Không tự gán bản dịch khi chưa xác định đúng nghĩa." en="Each meaning requires a Vietnamese definition or grounded English info. Do not invent translations when meaning is uncertain." /></p>
            <label><BilingualText vi="Nhãn cách dùng" en="Usage labels" /><input value={meaning.labelsInput ?? (meaning.labels || []).join(', ')} onChange={event => changeMeaning(meaningIndex, 'labelsInput', event.target.value)} placeholder={label("Nhãn từ nguồn, cách nhau bằng dấu phẩy", "Labels from source, comma separated")} /></label>
            <label><BilingualText>{"Định nghĩa tiếng Anh"}</BilingualText><textarea value={meaning.definitionEn} onChange={(event) => changeMeaning(meaningIndex, 'definitionEn', event.target.value)} rows={2} /></label>
            <label><BilingualText>{"Ghi chú sử dụng"}</BilingualText><textarea value={meaning.usageNote} onChange={(event) => changeMeaning(meaningIndex, 'usageNote', event.target.value)} rows={2} /></label>
            <label><BilingualText>{"Thứ tự nghĩa"}</BilingualText><input type="number" min={0} step={1} value={meaning.displayOrder} onChange={(event) => changeMeaning(meaningIndex, 'displayOrder', event.target.value)} /></label>
            {meaning.examples.map((example, exampleIndex) => <fieldset key={exampleIndex} style={{ margin: '0 0 14px', minWidth: 0 }}>
              <legend><BilingualText>{"Ví dụ"}</BilingualText>{exampleIndex + 1}</legend>
              <label><BilingualText>{"Ví dụ tiếng Việt"}</BilingualText><textarea lang="vi" value={example.exampleVi} onChange={(event) => changeExample(meaningIndex, exampleIndex, 'exampleVi', event.target.value)} required rows={2} /></label>
              <label><BilingualText>{"Bản dịch ví dụ"}</BilingualText><textarea value={example.translationEn} onChange={(event) => changeExample(meaningIndex, exampleIndex, 'translationEn', event.target.value)} rows={2} /></label>
              <label><BilingualText>{"Audio URL của ví dụ"}</BilingualText><input value={example.audioUrl} onChange={(event) => changeExample(meaningIndex, exampleIndex, 'audioUrl', event.target.value)} maxLength={2048} /></label>
              <label><BilingualText>{"Thứ tự ví dụ"}</BilingualText><input type="number" min={0} step={1} value={example.displayOrder} onChange={(event) => changeExample(meaningIndex, exampleIndex, 'displayOrder', event.target.value)} /></label>
              <button type="button" className="secondary" onClick={() => changeMeaning(meaningIndex, 'examples', meaning.examples.filter((_, index) => index !== exampleIndex))}><BilingualText>{"Xóa ví dụ"}</BilingualText>{exampleIndex + 1}</button>
            </fieldset>)}
            <button type="button" className="secondary" onClick={() => changeMeaning(meaningIndex, 'examples', [...meaning.examples, newExample()])}><BilingualText>{"+ Thêm ví dụ"}</BilingualText></button>
          </section>)}
          <button type="button" className="secondary" onClick={() => change('meanings', [...draft.meanings, newMeaning()])}><BilingualText>{"+ Thêm nghĩa"}</BilingualText></button>
        </fieldset>
        {error && <p role="alert"><BilingualText>{error}</BilingualText></p>}
        <div className="actions" style={{ marginTop: 20 }}><button type="button" className="secondary" disabled={pending} onClick={onClose}><BilingualText>{"Hủy"}</BilingualText></button><button type="submit" disabled={pending}><BilingualText>{pending ? 'Đang lưu…' : 'Lưu từ vựng'}</BilingualText></button></div>
      </form>}
  </Modal>;
}
