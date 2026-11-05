import { useCallback, useRef, useState } from 'react';
import { BilingualText, useBilingualLabel } from '@/shared/components/common/BilingualText';
import { PageHeader, Breadcrumb, EmptyState, Notice } from '@/shared/components/common/Ui';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { Modal } from '@/shared/components/common/Modal';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { adminRegionalVocabularyService } from '@/features/explore/regional/api/regionalVocabularyService';
import { adminVocabularyService } from '@/features/vocabulary/api/adminVocabularyService';
import { REGIONAL_REGIONS, REGIONAL_STATUSES, regionalDraft, regionalPayload } from '@/features/explore/regional/models/RegionalVocabulary';
import { getBackOfficeRoutes } from '@/constants/routes';
import '@/features/explore/regional/components/regional.css';
import { useAuth } from '@/features/auth/context/AuthContext';
import { canReviewVocabulary, canWriteVocabulary } from '@/utils/permissions/contentAccess';
import { AdminActionButton, AdminActionGroup } from '@/shared/components/common/AdminTableActions';
import { AdminPagination } from '@/shared/components/common/AdminPagination';
import { useLocation } from 'react-router-dom';

export function AdminRegionalLanguagePage() {
  const location = useLocation();
  const managementRoutes = getBackOfficeRoutes(location.pathname);
  const { user } = useAuth();
  const mayWrite = canWriteVocabulary(user);
  const mayReview = canReviewVocabulary(user);
  const label = useBilingualLabel();
  const [query, setQuery] = useState({ keyword: '', region: '', status: '', vocabularyId: '' });
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState(''), [viewing, setViewing] = useState(null), [editing, setEditing] = useState(null), [message, setMessage] = useState(''), [error, setError] = useState(null), [busy, setBusy] = useState(false);
  const actionPending = useRef(false);
  const resource = useAsyncResource(useCallback(signal => adminRegionalVocabularyService.list({ ...query, page, size: 20 }, { signal }), [query, page]));
  const masters = useAsyncResource(useCallback(signal => adminVocabularyService.list({}, { signal }), []));
  const filter = (key, value) => { setPage(0); setQuery(current => ({ ...current, [key]: value })); };
  async function transition(entry, action) {
    if (actionPending.current) return;
    actionPending.current = true; setBusy(true); setError(null); setMessage('');
    try {
      if (action === 'SUBMIT') await adminRegionalVocabularyService.submitReview(entry.id);
      else if (action === 'ARCHIVE') await adminRegionalVocabularyService.archive(entry.id);
      else if (action === 'RESTORE') await adminRegionalVocabularyService.restore(entry.id);
      else if (action === 'REVISE') await adminRegionalVocabularyService.revise(entry.id);
      else await adminRegionalVocabularyService.review(entry.id, action);
      setMessage(action === 'SUBMIT' ? label('Đã gửi biến thể đi duyệt.', 'Variant submitted for review.')
        : action === 'APPROVE' ? label('Đã duyệt và công khai biến thể.', 'Variant approved and published.')
          : action === 'REJECT' ? label('Đã trả biến thể về bản nháp.', 'Variant returned to draft.')
            : action === 'ARCHIVE' ? label('Đã lưu trữ biến thể.', 'Variant archived.')
              : action === 'RESTORE' ? label('Đã khôi phục biến thể về bản nháp.', 'Variant restored to draft.')
                : label('Đã chuyển biến thể về bản nháp để chỉnh sửa.', 'Variant returned to draft for revision.'));
      setPage(0);
      resource.reload();
    } catch (failure) {
      setError(failure);
    } finally {
      actionPending.current = false;
      setBusy(false);
    }
  }
  return <section className="admin-regional-page">
    <Breadcrumb items={[{ label: label('Từ vựng', 'Vocabulary'), to: managementRoutes.vocabulary }, { label: label('Từ ngữ vùng miền', 'Regional Expressions') }]} />
    <PageHeader
      eyebrow={<BilingualText vi="Tiếng Việt vùng miền" en="Regional Vietnamese" />}
      title={<BilingualText vi="Quản lý biến thể vùng miền" en="Manage regional variants" />}
      description={<BilingualText vi="Liên kết cách nói Bắc, Trung và Nam với từ vựng chuẩn." en="Link Northern, Central, and Southern expressions with standard vocabulary." />}
      actions={<>
        {mayWrite && <button disabled={busy} onClick={() => setEditing({})}><BilingualText vi="+ Thêm biến thể" en="+ Add variant" /></button>}
      </>}
    />
    {message && <Notice kind="success"><BilingualText>{message}</BilingualText></Notice>}{error && <Notice kind="error"><BilingualText>{error.message}</BilingualText></Notice>}
    <form className="admin-card regional-filters" onSubmit={event => { event.preventDefault(); filter('keyword', search.trim()); }}>
      <label><BilingualText>{"Tìm kiếm"}</BilingualText><input type="search" value={search} onChange={event => setSearch(event.target.value)} /></label>
      <label><BilingualText vi="Vùng miền" en="Region" /><select value={query.region} onChange={event => filter('region', event.target.value)}><option value="">{label("Tất cả vùng miền")}</option>{REGIONAL_REGIONS.map(item => <option value={item.value} key={item.value}>{label(item)}</option>)}</select></label>
      <label><BilingualText>{"Trạng thái"}</BilingualText><select value={query.status} onChange={event => filter('status', event.target.value)}><option value="">{label("Tất cả trạng thái")}</option>{REGIONAL_STATUSES.map(status => <option key={status} value={status}>{label(status)}</option>)}</select></label>
      <label><BilingualText>{"Từ chuẩn"}</BilingualText><select value={query.vocabularyId} disabled={masters.loading || !!masters.error} onChange={event => filter('vocabularyId', event.target.value)}><option value="">{label("Tất cả từ chuẩn", "All standard words")}</option>{(masters.data || []).map(master => <option value={master.id} key={master.id}>{master.word} · {label(master.partOfSpeech)}</option>)}</select></label>
      <button><BilingualText>{"Tìm kiếm"}</BilingualText></button><button className="secondary" type="button" onClick={() => { setPage(0); setSearch(''); setQuery({ keyword: '', region: '', status: '', vocabularyId: '' }); }}><BilingualText>{"Đặt lại"}</BilingualText></button>
    </form>
    {masters.error && <Notice kind="error">{masters.error.message} <button className="secondary" onClick={masters.reload}><BilingualText>{"Thử lại từ chuẩn"}</BilingualText></button></Notice>}
    <ResourceState resource={resource}>{data => (data.content || []).length ? <div className="admin-card regional-table"><table className="admin-table"><thead><tr><th><BilingualText>{"Từ chuẩn"}</BilingualText></th><th><BilingualText vi="Vùng miền" en="Region" /></th><th><BilingualText>{"Biến thể"}</BilingualText></th><th><BilingualText>{"Nghĩa"}</BilingualText></th><th><BilingualText>{"Trạng thái"}</BilingualText></th><th><BilingualText>{"Thao tác"}</BilingualText></th></tr></thead><tbody>{data.content.map(item => <tr key={item.id}><td>{item.masterWord}</td><td>{label(REGIONAL_REGIONS.find(region => region.value === item.region) || item.region)}</td><td><strong>{item.word}</strong></td><td>{item.meaning}</td><td>{label(item.status)}</td><td><AdminActionGroup>
      <AdminActionButton tone="detail" disabled={busy} onClick={() => setViewing(item.id)}><BilingualText vi="Chi tiết" en="Details" /></AdminActionButton>
      {mayWrite && item.status === 'DRAFT' && <><AdminActionButton tone="edit" disabled={busy} onClick={() => setEditing(item)}><BilingualText vi="Sửa nháp" en="Edit draft" /></AdminActionButton><AdminActionButton tone="submit" disabled={busy} onClick={() => transition(item, 'SUBMIT')}><BilingualText vi="Gửi duyệt" en="Submit" /></AdminActionButton></>}
      {mayWrite && item.status === 'PUBLISHED' && <AdminActionButton tone="edit" disabled={busy} onClick={async () => { await transition(item, 'REVISE'); setEditing({ ...item, status: 'DRAFT' }); }}><BilingualText vi="Sửa nháp" en="Revise" /></AdminActionButton>}
      {mayWrite && ['DRAFT', 'PUBLISHED'].includes(item.status) && <AdminActionButton tone="delete" iconOnly disabled={busy} title={label('Lưu trữ biến thể', 'Archive variant')} aria-label={label('Lưu trữ biến thể', 'Archive variant')} onClick={() => transition(item, 'ARCHIVE')} />}
      {mayWrite && item.status === 'ARCHIVED' && <AdminActionButton tone="restore" disabled={busy} onClick={() => transition(item, 'RESTORE')}><BilingualText vi="Khôi phục" en="Restore" /></AdminActionButton>}
      {mayReview && item.status === 'PENDING_REVIEW' && <><AdminActionButton tone="approve" disabled={busy} onClick={() => transition(item, 'APPROVE')}><BilingualText vi="Duyệt" en="Approve" /></AdminActionButton><AdminActionButton tone="edit" disabled={busy} onClick={() => transition(item, 'REJECT')}><BilingualText vi="Trả nháp" en="Return" /></AdminActionButton></>}
    </AdminActionGroup></td></tr>)}</tbody></table><AdminPagination currentPage={data.number + 1} pageSize={20} totalItems={data.totalElements} onPageChange={(nextPage) => setPage(nextPage - 1)} /></div> : <EmptyState title={<BilingualText vi="Chưa có biến thể phù hợp" en="No matching variants" />} />}</ResourceState>
    {viewing && <RegionalDetail id={viewing} onClose={() => setViewing(null)} />}
    {editing && <RegionalEditor entry={editing} masters={masters} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); setMessage(label('Đã lưu biến thể vùng miền.', 'Regional variant saved.')); resource.reload(); }} />}
  </section>;
}

function RegionalDetail({ id, onClose }) {
  const label = useBilingualLabel();
  const resource = useAsyncResource(useCallback(signal => adminRegionalVocabularyService.get(id, { signal }), [id]));
  return <Modal className="regional-detail-modal" title={label('Chi tiết biến thể vùng miền', 'Regional Variant Details')} onClose={onClose}>
    <ResourceState resource={resource}>{entry => <section className="regional-detail">
      <dl className="regional-detail-grid">
        <DetailField title={label('Từ vựng chuẩn', 'Standard vocabulary')} value={`${entry.masterWord} · ID #${entry.vocabularyId}`} />
        <DetailField title={label('Vùng sử dụng', 'Region')} value={label(REGIONAL_REGIONS.find(region => region.value === entry.region) || entry.region)} />
        <DetailField title={label('Biến thể', 'Variant')} value={entry.word} />
        <DetailField title={label('Phiên âm', 'Pronunciation')} value={entry.pronunciation} />
        <DetailField wide title={label('Nghĩa hoặc giải thích tiếng Việt', 'Vietnamese meaning or explanation')} value={entry.meaning} />
        <DetailField wide title={label('Nghĩa hoặc giải thích tiếng Anh', 'English meaning or explanation')} value={entry.meaningEn} />
        <DetailField wide title={label('Câu ví dụ tiếng Việt', 'Vietnamese example sentence')} value={entry.exampleSentence} />
        <DetailField wide title={label('Bản dịch câu ví dụ tiếng Anh', 'English example translation')} value={entry.exampleSentenceEn} />
        <DetailField wide title={label('Ghi chú cách dùng tiếng Việt', 'Vietnamese usage note')} value={entry.usageNote} />
        <DetailField wide title={label('Ghi chú cách dùng tiếng Anh', 'English usage note')} value={entry.usageNoteEn} />
        <DetailField wide title="Audio URL" value={entry.audioUrl} />
        <DetailField title={label('Trạng thái', 'Status')} value={label(entry.status)} />
        <DetailField title={label('Cập nhật gần nhất', 'Last updated')} value={entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : null} />
      </dl>
      <div className="actions"><button type="button" className="secondary" onClick={onClose}><BilingualText vi="Đóng" en="Close" /></button></div>
    </section>}</ResourceState>
  </Modal>;
}

function DetailField({ title, value, wide = false }) {
  return <div className={wide ? 'regional-detail-field regional-detail-field--wide' : 'regional-detail-field'}><dt>{title}</dt><dd>{value || '—'}</dd></div>;
}

function RegionalEditor({ entry, masters, onClose, onSaved }) {
  const label = useBilingualLabel();
  const [draft, setDraft] = useState(() => regionalDraft(entry)), [pending, setPending] = useState(false), [error, setError] = useState(null);
  const writing = useRef(false); const change = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  async function submit(event) {
    event.preventDefault(); if (writing.current) return;
    setError(null);
    try {
      const payload = regionalPayload(draft);
      writing.current = true;
      setPending(true);
      await (entry.id ? adminRegionalVocabularyService.update(entry.id, payload) : adminRegionalVocabularyService.create(payload));
      onSaved();
    } catch (failure) {
      setError(failure);
    } finally {
      writing.current = false;
      setPending(false);
    }
  }
  return <Modal title={entry.id ? label('Chỉnh sửa biến thể vùng miền', 'Edit Regional Variant') : label('Thêm biến thể vùng miền', 'Add Regional Variant')} onClose={onClose} busy={pending}>
    <form className="regional-form" onSubmit={submit}><fieldset disabled={pending}>
      <label><BilingualText>{"Từ vựng chuẩn *"}</BilingualText><select required value={draft.vocabularyId} disabled={masters.loading || !!masters.error} onChange={event => change('vocabularyId', event.target.value)}><option value="">{label("Chọn từ chuẩn", "Select standard word")}</option>{(masters.data || []).map(master => <option key={master.id} value={master.id}>{master.word} · {label(master.partOfSpeech)} · {label(master.status)}</option>)}</select></label>
      <label><BilingualText>{"Vùng sử dụng *"}</BilingualText><select required value={draft.region} onChange={event => change('region', event.target.value)}><option value="">{label("Chọn vùng miền", "Select region")}</option>{REGIONAL_REGIONS.map(item => <option key={item.value} value={item.value}>{label(item)}</option>)}</select></label>
      <label><BilingualText>{"Biến thể *"}</BilingualText><input required maxLength={200} value={draft.word} onChange={event => change('word', event.target.value)} /></label>
      <label><BilingualText>{"Phiên âm"}</BilingualText><input maxLength={200} value={draft.pronunciation} onChange={event => change('pronunciation', event.target.value)} /></label>
      <label><BilingualText vi="Nghĩa hoặc giải thích tiếng Việt *" en="Vietnamese meaning or explanation *" /><textarea required maxLength={1000} value={draft.meaning} onChange={event => change('meaning', event.target.value)} /></label>
      <label><BilingualText vi="Nghĩa hoặc giải thích tiếng Anh" en="English meaning or explanation" /><textarea maxLength={1000} value={draft.meaningEn} onChange={event => change('meaningEn', event.target.value)} /></label>
      <label><BilingualText vi="Câu ví dụ tiếng Việt" en="Vietnamese example sentence" /><textarea maxLength={2000} value={draft.exampleSentence} onChange={event => change('exampleSentence', event.target.value)} /></label>
      <label><BilingualText vi="Bản dịch câu ví dụ tiếng Anh" en="English example translation" /><textarea maxLength={2000} value={draft.exampleSentenceEn} onChange={event => change('exampleSentenceEn', event.target.value)} /></label>
      <label><BilingualText vi="Ghi chú cách dùng tiếng Việt" en="Vietnamese usage note" /><textarea maxLength={2000} value={draft.usageNote} onChange={event => change('usageNote', event.target.value)} /></label>
      <label><BilingualText vi="Ghi chú cách dùng tiếng Anh" en="English usage note" /><textarea maxLength={2000} value={draft.usageNoteEn} onChange={event => change('usageNoteEn', event.target.value)} /></label>
      <label><BilingualText>{"Audio URL"}</BilingualText><input maxLength={2048} value={draft.audioUrl} onChange={event => change('audioUrl', event.target.value)} /></label>
      <p><strong><BilingualText>{"Trạng thái:"}</BilingualText></strong> <BilingualText>{"DRAFT"}</BilingualText></p>
    </fieldset>{error && <Notice kind="error"><BilingualText>{error.message}</BilingualText></Notice>}
    <div className="actions"><button type="button" className="secondary" disabled={pending} onClick={onClose}><BilingualText>{"Hủy"}</BilingualText></button><button disabled={pending || masters.loading || !!masters.error}><BilingualText>{pending ? 'Đang lưu…' : 'Lưu biến thể'}</BilingualText></button></div></form>
  </Modal>;
}
