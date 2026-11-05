import { BilingualText, useBilingualLabel, bilingualLabel } from '@/shared/components/common/BilingualText';
import { useEffect, useState } from 'react';
import { adminVocabularyService } from '@/features/vocabulary/api/adminVocabularyService';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { AdminVocabularyModal } from '@/features/vocabulary/components/admin/AdminVocabularyModal';
import { VOCABULARY_STATUSES } from '@/features/vocabulary/models/AdminVocabulary';
import { Breadcrumb, PageHeader } from '@/shared/components/common/Ui';
import { Link, useLocation } from 'react-router-dom';
import { getBackOfficeRoutes, ROUTES } from '@/constants/routes';
import { Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { canImportVocabulary, canReviewVocabulary, canWriteVocabulary } from '@/utils/permissions/contentAccess';
import { AdminActionButton, AdminActionGroup } from '@/shared/components/common/AdminTableActions';
import { AdminPagination } from '@/shared/components/common/AdminPagination';
import '@/features/vocabulary/components/admin/admin-vocabulary.css';

const emptyFilters = { keyword: '', status: '', partOfSpeech: '' };

export function AdminVocabularyPage() {
  const label = useBilingualLabel();
  const location = useLocation();
  const managementRoutes = getBackOfficeRoutes(location.pathname);
  const adminArea = location.pathname === ROUTES.ADMIN || location.pathname.startsWith(`${ROUTES.ADMIN}/`);
  const { user } = useAuth();
  const mayWrite = canWriteVocabulary(user);
  const mayImport = canImportVocabulary(user);
  const mayReview = canReviewVocabulary(user);
  const [query, setQuery] = useState(emptyFilters);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0), [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });
  const [revision, setRevision] = useState(0);
  const [resource, setResource] = useState({ data: [], loading: true, error: null });
  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState('');
  const reload = () => setRevision((value) => value + 1);

  useEffect(() => {
    const controller = new AbortController();
    setResource((state) => ({ ...state, loading: true, error: null }));
    adminVocabularyService.search({ ...query, page, size: 20 }, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) { setPageInfo(data); setResource({ data: data.content, loading: false, error: null }); }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResource({ data: [], loading: false, error });
      });
    return () => controller.abort();
  }, [query, revision, page]);



  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const filter = (field, value) => { setPage(0); setQuery((current) => ({ ...current, [field]: value })); };
  const saved = (response) => {
    setMessage(response?.message || bilingualLabel('Đã lưu từ vựng.', 'Vocabulary saved.'));
    setModal(null);
    reload();
  };
  async function transition(item, action) {
    const result = action === 'SUBMIT' ? await adminVocabularyService.submitReview(item.id)
      : action === 'ARCHIVE' ? await adminVocabularyService.archive(item.id)
        : action === 'RESTORE' ? await adminVocabularyService.restore(item.id)
          : action === 'REVISE' ? await adminVocabularyService.revise(item.id)
          : await adminVocabularyService.review(item.id, action);
    setMessage(action === 'SUBMIT' ? bilingualLabel('Đã gửi từ vựng đi duyệt.', 'Vocabulary submitted for review.')
      : action === 'APPROVE' ? bilingualLabel('Đã duyệt và công khai từ vựng.', 'Vocabulary approved and published.')
        : action === 'REJECT' ? bilingualLabel('Đã trả từ vựng về bản nháp.', 'Vocabulary returned to draft.')
          : action === 'ARCHIVE' ? bilingualLabel('Đã lưu trữ từ vựng.', 'Vocabulary archived.')
            : action === 'RESTORE' ? bilingualLabel('Đã khôi phục từ vựng về bản nháp.', 'Vocabulary restored to draft.')
              : bilingualLabel('Đã chuyển từ vựng về bản nháp để chỉnh sửa.', 'Vocabulary returned to draft for revision.'));
    reload();
    return result;
  }

  return <div className="admin-vocabulary-page">
    <Breadcrumb items={[{ label: adminArea ? label('Quản trị', 'Administration') : label('Nội dung', 'Content'), to: adminArea ? ROUTES.ADMIN : ROUTES.CONTENT_COURSES }, { label: label('Từ vựng', 'Vocabulary') }]} />
    <PageHeader eyebrow={<BilingualText vi="Từ vựng tiếng Việt" en="Vietnamese Vocabulary" />} title={<BilingualText vi="Quản lý từ vựng" en="Vocabulary Management" />} description={<BilingualText vi="Quản lý mục từ, nghĩa Việt–Anh và ví dụ song ngữ." en="Manage entries, Vietnamese–English definitions, and bilingual examples." />} actions={<>
      <Link className="button secondary" to={managementRoutes.regionalLanguage}><BilingualText vi="Từ ngữ vùng miền" en="Regional language" /></Link>
      {mayImport && <Link className="button secondary" to={managementRoutes.importData}><BilingualText vi="Nhập dữ liệu" en="Import data" /></Link>}
      {mayWrite && <button type="button" onClick={() => setModal({ mode: 'create' })}><Plus size={16} aria-hidden="true" /><BilingualText vi="Thêm từ vựng" en="Add vocabulary" /></button>}
    </>} />
    {message && <div className="success state" role="status"><BilingualText>{message}</BilingualText></div>}
    <form className="admin-card admin-vocabulary-filters" onSubmit={(event) => { event.preventDefault(); filter('keyword', keyword.trim()); }}>
      <div className="actions">
        <label style={{ flex: '1 1 220px' }}><BilingualText>{"Tìm kiếm"}</BilingualText><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder={label("Nhập từ khóa…")} /></label>
        <label style={{ flex: '1 1 150px' }}><BilingualText>{"Trạng thái"}</BilingualText><select value={query.status} onChange={(event) => filter('status', event.target.value)}><option value="">{label("Tất cả trạng thái")}</option>{VOCABULARY_STATUSES.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></label>
        <label style={{ flex: '1 1 140px' }}><BilingualText>{"Từ loại"}</BilingualText><input value={query.partOfSpeech} onChange={(event) => filter('partOfSpeech', event.target.value)} placeholder={label("Ví dụ: phrase")} /></label>
      </div>
      <div className="actions"><button type="submit"><BilingualText>{"Tìm kiếm"}</BilingualText></button><button type="button" className="secondary" onClick={() => { setPage(0); setKeyword(''); setQuery({ ...emptyFilters }); }}><BilingualText>{"Đặt lại bộ lọc"}</BilingualText></button></div>
    </form>
    <ResourceState resource={{ ...resource, reload }}>{(items) => items.length === 0
      ? <div className="state"><BilingualText>{"Không có từ vựng phù hợp."}</BilingualText></div>
      : <div className="admin-card admin-vocabulary-table-card"><table className="admin-table admin-vocabulary-table">
        <colgroup><col className="admin-vocabulary-col-word" /><col className="admin-vocabulary-col-type" /><col className="admin-vocabulary-col-status" /><col className="admin-vocabulary-col-actions" /></colgroup>
        <thead><tr><th><BilingualText>{"Từ vựng"}</BilingualText></th><th><BilingualText>{"Từ loại"}</BilingualText></th><th><BilingualText>{"Trạng thái"}</BilingualText></th><th><BilingualText>{"Thao tác"}</BilingualText></th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}>
          <td><strong>{item.word}</strong>{item.pronunciation && <div className="muted">{item.pronunciation}</div>}</td>
          <td>{item.partOfSpeech}</td>
          <td><span className={`admin-badge ${item.status === 'PUBLISHED' ? 'admin-badge-success' : item.status === 'ARCHIVED' ? 'admin-badge-danger' : 'admin-badge-warning'}`}><BilingualText>{item.status}</BilingualText></span></td>
          <td><AdminActionGroup><AdminActionButton tone="detail" onClick={() => setModal({ mode: 'view', id: item.id })}><BilingualText>{"Chi tiết"}</BilingualText></AdminActionButton>
            {mayWrite && item.status === 'DRAFT' && <><AdminActionButton tone="edit" onClick={() => setModal({ mode: 'edit', id: item.id })}><BilingualText vi="Sửa nháp" en="Edit draft" /></AdminActionButton><AdminActionButton tone="submit" onClick={() => transition(item, 'SUBMIT')}><BilingualText vi="Gửi duyệt" en="Submit" /></AdminActionButton></>}
            {mayWrite && item.status === 'PUBLISHED' && <AdminActionButton tone="edit" onClick={async () => { await transition(item, 'REVISE'); setModal({ mode: 'edit', id: item.id }); }}><BilingualText vi="Sửa nháp" en="Revise" /></AdminActionButton>}
            {mayWrite && ['DRAFT', 'PUBLISHED'].includes(item.status) && <AdminActionButton tone="delete" iconOnly title={label('Lưu trữ từ vựng', 'Archive vocabulary')} aria-label={label('Lưu trữ từ vựng', 'Archive vocabulary')} onClick={() => transition(item, 'ARCHIVE')} />}
            {mayWrite && item.status === 'ARCHIVED' && <AdminActionButton tone="restore" onClick={() => transition(item, 'RESTORE')}><BilingualText vi="Khôi phục" en="Restore" /></AdminActionButton>}
            {mayReview && item.status === 'PENDING_REVIEW' && <><AdminActionButton tone="approve" onClick={() => transition(item, 'APPROVE')}><BilingualText vi="Duyệt" en="Approve" /></AdminActionButton><AdminActionButton tone="edit" onClick={() => transition(item, 'REJECT')}><BilingualText vi="Trả nháp" en="Return" /></AdminActionButton></>}
          </AdminActionGroup></td>
        </tr>)}</tbody>
      </table><AdminPagination currentPage={page + 1} pageSize={20} totalItems={pageInfo.totalElements} onPageChange={(nextPage) => setPage(nextPage - 1)} /></div>}
    </ResourceState>
    {modal && <AdminVocabularyModal key={`${modal.mode}-${modal.id ?? 'new'}`} {...modal} canEdit={mayWrite} onClose={() => setModal(null)} onSaved={saved} onEdit={() => setModal({ mode: 'edit', id: modal.id })} />}
  </div>;
}
