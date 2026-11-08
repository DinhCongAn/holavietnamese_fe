import { BilingualText, useBilingualLabel, bilingualLabel } from '@/shared/components/common/BilingualText';
import { useEffect, useState } from 'react';
import { adminVocabularyService } from '@/features/vocabulary/api/adminVocabularyService';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { AdminVocabularyModal } from '@/features/vocabulary/components/admin/AdminVocabularyModal';
import { VOCABULARY_STATUSES } from '@/features/vocabulary/models/AdminVocabulary';
import { Breadcrumb, PageHeader } from '@/shared/components/common/Ui';
import { Link, useLocation } from 'react-router-dom';
import { getBackOfficeRoutes, ROUTES } from '@/constants/routes';
import { Plus, Search, X, RotateCcw, Eye, Pencil, Trash2, Check, CheckCheck, RotateCcw as RestoreIcon, Send, MapPin, Upload } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { canImportVocabulary, canReviewVocabulary, canWriteVocabulary } from '@/utils/permissions/contentAccess';
import { AdminActionButton, AdminActionGroup } from '@/shared/components/common/AdminTableActions';
import { AdminPagination } from '@/shared/components/common/AdminPagination';
import { AdminFilterSelect } from '@/shared/components/common/AdminFilterSelect';
import { useConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import '@/features/vocabulary/components/admin/admin-vocabulary.css';

const emptyFilters = { keyword: '', status: '', partOfSpeech: '' };
const PAGE_SIZE = 10;

const VOCABULARY_STATUS_DOTS = {
  DRAFT: '#F59E0B',
  PENDING_REVIEW: '#3B82F6',
  PUBLISHED: '#10B981',
  ARCHIVED: '#64748B',
};

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
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });
  const [revision, setRevision] = useState(0);
  const [resource, setResource] = useState({ data: [], loading: true, error: null });
  const [modal, setModal] = useState(null);
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState(null);
  const [bulkApproving, setBulkApproving] = useState(false);
  const { confirm, confirmationDialog } = useConfirmDialog();
  const reload = () => setRevision((value) => value + 1);

  useEffect(() => {
    const controller = new AbortController();
    setResource((state) => ({ ...state, loading: true, error: null }));
    adminVocabularyService
      .search({ ...query, page, size: PAGE_SIZE }, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setPageInfo(data);
          setResource({ data: data.content, loading: false, error: null });
        }
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

  const filter = (field, value) => {
    setPage(0);
    setQuery((current) => ({ ...current, [field]: value }));
  };

  const saved = (response) => {
    setMessage(response?.message || bilingualLabel('Đã lưu từ vựng.', 'Vocabulary saved.'));
    setModal(null);
    reload();
  };

  async function transition(item, action) {
    const result =
      action === 'SUBMIT'
        ? await adminVocabularyService.submitReview(item.id)
        : action === 'ARCHIVE'
        ? await adminVocabularyService.archive(item.id)
        : action === 'RESTORE'
        ? await adminVocabularyService.restore(item.id)
        : action === 'REVISE'
        ? await adminVocabularyService.revise(item.id)
        : await adminVocabularyService.review(item.id, action);
    setMessage(
      action === 'SUBMIT'
        ? bilingualLabel('Đã gửi từ vựng đi duyệt.', 'Vocabulary submitted for review.')
        : action === 'APPROVE'
        ? bilingualLabel('Đã duyệt và công khai từ vựng.', 'Vocabulary approved and published.')
        : action === 'REJECT'
        ? bilingualLabel('Đã trả từ vựng về bản nháp.', 'Vocabulary returned to draft.')
        : action === 'ARCHIVE'
        ? bilingualLabel('Đã lưu trữ từ vựng.', 'Vocabulary archived.')
        : action === 'RESTORE'
        ? bilingualLabel('Đã khôi phục từ vựng về bản nháp.', 'Vocabulary restored to draft.')
        : bilingualLabel('Đã chuyển từ vựng về bản nháp để chỉnh sửa.', 'Vocabulary returned to draft for revision.')
    );
    reload();
    return result;
  }

  async function approveAllPending() {
    if (
      bulkApproving ||
      !(await confirm({
        title: label('Duyệt toàn bộ từ đang chờ?', 'Approve all pending vocabulary?'),
        description: label(
          'Tất cả từ vựng đang ở trạng thái Chờ duyệt trong hệ thống sẽ được chuyển sang Đã xuất bản. Thao tác áp dụng cho toàn bộ dữ liệu, không chỉ trang hoặc bộ lọc hiện tại.',
          'Every vocabulary entry awaiting review will be published. This applies to all matching records, not only the current page or filter.',
        ),
        confirmLabel: label('Duyệt toàn bộ', 'Approve all'),
        tone: 'warning',
      }))
    ) return;

    setBulkApproving(true);
    setActionError(null);
    try {
      const approved = await adminVocabularyService.approveAllPending();
      setMessage(
        approved > 0
          ? label(`Đã duyệt và xuất bản ${approved} từ vựng.`, `Approved and published ${approved} vocabulary entries.`)
          : label('Không có từ vựng nào đang chờ duyệt.', 'No vocabulary entries are awaiting review.'),
      );
      setPage(0);
      reload();
    } catch (error) {
      setActionError(error);
    } finally {
      setBulkApproving(false);
    }
  }

  const vocabularyStatusOptions = [
    { value: '', label: label('Tất cả trạng thái', 'All statuses'), dotColor: '#94A3B8' },
    ...VOCABULARY_STATUSES.map((st) => ({
      value: st,
      label: label(
        st === 'DRAFT'
          ? 'Bản nháp (DRAFT)'
          : st === 'PENDING_REVIEW'
          ? 'Chờ duyệt (PENDING)'
          : st === 'PUBLISHED'
          ? 'Đã xuất bản (PUBLISHED)'
          : st === 'ARCHIVED'
          ? 'Lưu trữ (ARCHIVED)'
          : st,
        st
      ),
      dotColor: VOCABULARY_STATUS_DOTS[st] || '#94A3B8',
    })),
  ];

  return (
    <div className="admin-vocabulary-page">
      <Breadcrumb
        items={[
          {
            label: adminArea ? label('Quản trị', 'Administration') : label('Nội dung', 'Content'),
            to: adminArea ? ROUTES.ADMIN : ROUTES.CONTENT_COURSES,
          },
          { label: label('Từ vựng', 'Vocabulary') },
        ]}
      />
      <PageHeader
        eyebrow={<BilingualText vi="Từ vựng tiếng Việt" en="Vietnamese Vocabulary" />}
        title={<BilingualText vi="Quản lý từ vựng" en="Vocabulary Management" />}
        description={
          <BilingualText
            vi="Quản lý mục từ, nghĩa Việt–Anh và ví dụ song ngữ."
            en="Manage entries, Vietnamese–English definitions, and bilingual examples."
          />
        }
        actions={
          <>
            {mayReview && (
              <button
                type="button"
                disabled={bulkApproving}
                onClick={approveAllPending}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <CheckCheck size={16} aria-hidden="true" />
                <BilingualText
                  vi={bulkApproving ? 'Đang duyệt…' : 'Duyệt toàn bộ'}
                  en={bulkApproving ? 'Approving…' : 'Approve all'}
                />
              </button>
            )}
            <Link
              className="button secondary"
              to={managementRoutes.regionalLanguage}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <MapPin size={16} aria-hidden="true" />
              <BilingualText vi="Từ vựng vùng miền" en="Regional vocabulary" />
            </Link>
            {mayImport && (
              <Link
                className="button secondary"
                to={managementRoutes.importData}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Upload size={16} aria-hidden="true" />
                <BilingualText vi="Nhập dữ liệu" en="Import data" />
              </Link>
            )}
            {mayWrite && (
              <button
                type="button"
                onClick={() => setModal({ mode: 'create' })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={16} aria-hidden="true" />
                <BilingualText vi="Thêm từ vựng" en="Add vocabulary" />
              </button>
            )}
          </>
        }
      />

      {actionError && (
        <div className="error state" role="alert">
          <BilingualText>
            {actionError?.response?.data?.message || actionError?.message || label('Không thể thực hiện thao tác.', 'Unable to complete the action.')}
          </BilingualText>
        </div>
      )}

      {message && (
        <div className="success state" role="status">
          <BilingualText>{message}</BilingualText>
        </div>
      )}

      {/* Filter Toolbar matching the exact ratio & style of AdminUsersPage */}
      <form
        className="admin-card"
        onSubmit={(event) => {
          event.preventDefault();
          filter('keyword', keyword.trim());
        }}
        style={{
          position: 'relative',
          zIndex: 40,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input on the Left */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 280px',
            maxWidth: '380px',
            minWidth: '220px',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              pointerEvents: 'none',
            }}
          />
          <input
            aria-label={label("Tìm từ vựng", "Search vocabulary")}
            placeholder={label("Nhập từ vựng, nghĩa tiếng Anh…", "Search word, meaning…")}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            style={{
              width: '100%',
              height: '40px',
              minHeight: '40px',
              maxHeight: '40px',
              padding: '0 36px 0 36px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              fontSize: '13px',
              color: '#1E293B',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {keyword && (
            <button
              type="button"
              onClick={() => {
                setKeyword('');
                filter('keyword', '');
              }}
              aria-label={label("Xóa tìm kiếm", "Clear search")}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                padding: '4px',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                minHeight: '24px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Part of Speech, Status Dropdown, Search & Reset on the Right */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginLeft: 'auto',
            flexWrap: 'wrap',
          }}
        >
          <input
            aria-label={label("Từ loại", "Part of speech")}
            placeholder={label("Từ loại (noun, verb…)", "Part of speech…")}
            value={query.partOfSpeech}
            onChange={(event) => filter('partOfSpeech', event.target.value)}
            style={{
              height: '40px',
              minHeight: '40px',
              maxHeight: '40px',
              width: '150px',
              padding: '0 12px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              fontSize: '13px',
              color: '#1E293B',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          <AdminFilterSelect
            ariaLabel={label("Trạng thái", "Status")}
            value={query.status}
            options={vocabularyStatusOptions}
            onChange={(val) => filter('status', val)}
            minWidth="190px"
            align="right"
          />

          <button
            type="submit"
            style={{
              height: '40px',
              minHeight: '40px',
              maxHeight: '40px',
              padding: '0 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FF7A00 0%, #EA580C 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            <Search size={15} strokeWidth={2.3} />
            <span><BilingualText>{"Tìm kiếm"}</BilingualText></span>
          </button>

          {(keyword || query.status || query.partOfSpeech) && (
            <button
              type="button"
              onClick={() => {
                setPage(0);
                setKeyword('');
                setQuery({ ...emptyFilters });
              }}
              style={{
                height: '40px',
                minHeight: '40px',
                maxHeight: '40px',
                padding: '0 14px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#64748B',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <RotateCcw size={14} />
              <span><BilingualText vi="Đặt lại" en="Reset" /></span>
            </button>
          )}
        </div>
      </form>

      <ResourceState resource={{ ...resource, reload }}>
        {(items) =>
          items.length === 0 ? (
            <div className="state">
              <BilingualText>{"Không có từ vựng phù hợp."}</BilingualText>
            </div>
          ) : (
            <div className="admin-card admin-vocabulary-table-card">
              <table className="admin-table admin-vocabulary-table">
                <colgroup>
                  <col className="admin-vocabulary-col-word" />
                  <col className="admin-vocabulary-col-type" />
                  <col className="admin-vocabulary-col-status" />
                  <col className="admin-vocabulary-col-actions" />
                </colgroup>
                <thead>
                  <tr>
                    <th><BilingualText>{"Từ vựng"}</BilingualText></th>
                    <th><BilingualText>{"Từ loại"}</BilingualText></th>
                    <th><BilingualText>{"Trạng thái"}</BilingualText></th>
                    <th style={{ textAlign: 'right' }}><BilingualText>{"Thao tác"}</BilingualText></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.word}</strong>
                        {item.pronunciation && <div className="muted">{item.pronunciation}</div>}
                      </td>
                      <td>{item.partOfSpeech}</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            item.status === 'PUBLISHED'
                              ? 'admin-badge-success'
                              : item.status === 'ARCHIVED'
                              ? 'admin-badge-danger'
                              : 'admin-badge-warning'
                          }`}
                        >
                          <BilingualText>{item.status}</BilingualText>
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <AdminActionGroup>
                          {mayWrite && item.status === 'DRAFT' && (
                            <>
                              <AdminActionButton tone="submit" icon={Send} onClick={() => transition(item, 'SUBMIT')}>
                                <BilingualText vi="Gửi duyệt" en="Submit" />
                              </AdminActionButton>
                              <AdminActionButton tone="neutral" icon={Pencil} onClick={() => setModal({ mode: 'edit', id: item.id })}>
                                <BilingualText vi="Sửa" en="Edit" />
                              </AdminActionButton>
                            </>
                          )}
                          {mayWrite && item.status === 'PUBLISHED' && (
                            <AdminActionButton
                              tone="edit"
                              icon={Pencil}
                              onClick={async () => {
                                await transition(item, 'REVISE');
                                setModal({ mode: 'edit', id: item.id });
                              }}
                            >
                              <BilingualText vi="Sửa nháp" en="Revise" />
                            </AdminActionButton>
                          )}
                          {mayWrite && ['DRAFT', 'PUBLISHED'].includes(item.status) && (
                            <AdminActionButton
                              tone="delete"
                              icon={Trash2}
                              iconOnly
                              title={label('Lưu trữ từ vựng', 'Archive vocabulary')}
                              aria-label={label('Lưu trữ từ vựng', 'Archive vocabulary')}
                              onClick={() => transition(item, 'ARCHIVE')}
                            />
                          )}
                          {mayWrite && item.status === 'ARCHIVED' && (
                            <AdminActionButton tone="restore" icon={RestoreIcon} onClick={() => transition(item, 'RESTORE')}>
                              <BilingualText vi="Khôi phục" en="Restore" />
                            </AdminActionButton>
                          )}
                          {mayReview && item.status === 'PENDING_REVIEW' && (
                            <>
                              <AdminActionButton tone="approve" icon={Check} onClick={() => transition(item, 'APPROVE')}>
                                <BilingualText vi="Duyệt" en="Approve" />
                              </AdminActionButton>
                              <AdminActionButton tone="warning" icon={RestoreIcon} onClick={() => transition(item, 'REJECT')}>
                                <BilingualText vi="Từ chối" en="Reject" />
                              </AdminActionButton>
                            </>
                          )}
                          <AdminActionButton
                            tone="detail"
                            icon={Eye}
                            title={label('Xem chi tiết từ vựng', 'View vocabulary details')}
                            onClick={() => setModal({ mode: 'view', id: item.id })}
                          >
                            <BilingualText vi="Xem" en="View" />
                          </AdminActionButton>
                        </AdminActionGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <AdminPagination
                currentPage={page + 1}
                pageSize={PAGE_SIZE}
                totalItems={pageInfo.totalElements}
                onPageChange={(nextPage) => setPage(nextPage - 1)}
              />
            </div>
          )
        }
      </ResourceState>

      {modal && (
        <AdminVocabularyModal
          key={`${modal.mode}-${modal.id ?? 'new'}`}
          {...modal}
          canEdit={mayWrite}
          onClose={() => setModal(null)}
          onSaved={saved}
          onEdit={() => setModal({ mode: 'edit', id: modal.id })}
        />
      )}
      {confirmationDialog}
    </div>
  );
}

export default AdminVocabularyPage;
