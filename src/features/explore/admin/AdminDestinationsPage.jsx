import { useCallback, useState } from 'react';
import { generatePath, useLocation } from 'react-router-dom';
import { BilingualText, useBilingualLabel, bilingualLabel } from '@/shared/components/common/BilingualText';
import { ContentImage } from '@/shared/components/common/ContentImage';
import { Modal } from '@/shared/components/common/Modal';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { DestinationForm } from '@/features/explore/components/DestinationForm';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { destinationDate, DESTINATION_REGIONS, DESTINATION_STATUSES } from '@/features/explore/models/Destination';
import { adminDestinationService } from '@/features/explore/api/destinationService';
import { getBackOfficeRoutes } from '@/constants/routes';
import { useAuth } from '@/features/auth/context/AuthContext';
import { canReviewExplore, canWriteExplore } from '@/utils/permissions/contentAccess';
import { toast } from 'sonner';
import { AdminPagination } from '@/shared/components/common/AdminPagination';
import { AdminActionButton, AdminActionGroup, AdminActionLink } from '@/shared/components/common/AdminTableActions';

const emptyFilters = { keyword: '', status: '', region: '' };

export function AdminDestinationsPage() {
  const label = useBilingualLabel();
  const location = useLocation();
  const managementRoutes = getBackOfficeRoutes(location.pathname);
  const { user } = useAuth();
  const mayWrite = canWriteExplore(user);
  const mayReview = canReviewExplore(user);
  const [query, setQuery] = useState(emptyFilters);
  const [keyword, setKeyword] = useState('');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const resource = useAsyncResource(useCallback(signal => adminDestinationService.list(query, { signal }), [query]));
  const filter = (field, value) => {
    setQuery(current => ({ ...current, [field]: value }));
    setCurrentPage(1);
  };

  function saved() {
    setCreating(false);
    toast.success(bilingualLabel('Đã tạo điểm đến thành công.', 'Destination created successfully.'));
    resource.reload();
  }

  async function transition(item, action) {
    try {
      if (action === 'SUBMIT') await adminDestinationService.submitReview(item.id);
      else if (action === 'ARCHIVE') await adminDestinationService.archive(item.id);
      else if (action === 'RESTORE') await adminDestinationService.restore(item.id);
      else if (action === 'REVISE') await adminDestinationService.revise(item.id);
      else await adminDestinationService.review(item.id, action);

      const msg = action === 'SUBMIT'
        ? bilingualLabel('Đã gửi điểm đến đi duyệt.', 'Destination submitted for review.')
        : action === 'APPROVE'
        ? bilingualLabel('Đã duyệt và công khai điểm đến.', 'Destination approved and published.')
        : action === 'REJECT'
        ? bilingualLabel('Đã trả điểm đến về bản nháp.', 'Destination returned to draft.')
        : action === 'ARCHIVE'
        ? bilingualLabel('Đã lưu trữ điểm đến.', 'Destination archived.')
        : action === 'RESTORE'
        ? bilingualLabel('Đã khôi phục điểm đến về bản nháp.', 'Destination restored to draft.')
        : bilingualLabel('Đã chuyển điểm đến về bản nháp để chỉnh sửa.', 'Destination returned to draft for revision.');

      toast.success(msg);
      resource.reload();
    } catch (err) {
      toast.error(bilingualLabel(err.message || 'Lỗi khi cập nhật trạng thái điểm đến.'));
    }
  }

  const getStatusBadge = (status) => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      height: '28px',
      padding: '0 11px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 700,
      whiteSpace: 'nowrap',
      lineHeight: 1,
    };

    switch (status) {
      case 'PUBLISHED':
        return (
          <span
            style={{
              ...baseStyle,
              background: '#dcfce7',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            <span>{label('Đã xuất bản', 'Published')}</span>
          </span>
        );
      case 'PENDING_REVIEW':
        return (
          <span
            style={{
              ...baseStyle,
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
            <span>{label('Chờ duyệt', 'Pending Review')}</span>
          </span>
        );
      case 'DRAFT':
        return (
          <span
            style={{
              ...baseStyle,
              background: '#fef3c7',
              color: '#b45309',
              border: '1px solid #fde68a',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
            <span>{label('Bản nháp', 'Draft')}</span>
          </span>
        );
      case 'ARCHIVED':
        return (
          <span
            style={{
              ...baseStyle,
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
            <span>{label('Đã lưu trữ', 'Archived')}</span>
          </span>
        );
      default:
        return (
          <span
            style={{
              ...baseStyle,
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
            }}
          >
            <span>{status}</span>
          </span>
        );
    }
  };

  const thStyle = {
    padding: '14px 14px',
    whiteSpace: 'nowrap',
    fontSize: '11.5px',
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--color-ink)',
    borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
  };

  const tdStyle = {
    padding: '16px 14px',
    verticalAlign: 'middle',
    borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
  };

  return (
    <div className="admin-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-red-hover)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <BilingualText vi="KHÁM PHÁ VIỆT NAM • ĐIỂM ĐẾN" en="EXPLORE VIETNAM • DESTINATIONS" />
          </span>
          <h1 style={{ margin: '4px 0 6px 0', fontSize: '32px' }}>
            <BilingualText vi="Quản lý điểm đến" en="Manage destinations" />
          </h1>
          <p style={{ margin: 0, color: 'var(--color-forest)', fontSize: '14px' }}>
            <BilingualText
              vi="Quản lý danh mục các điểm đến văn hóa, du lịch, phong tục tập quán và hoạt động trải nghiệm địa phương."
              en="Manage cultural destinations, travel spots, regional customs, and local interactive activities."
            />
          </p>
        </div>

        {mayWrite && (
          <button
            type="button"
            className="button"
            onClick={() => setCreating(true)}
            style={{ fontSize: '13px', minHeight: '40px', height: '40px', padding: '0 16px', cursor: 'pointer' }}
          >
            <span>{label('+ Thêm điểm đến mới', '+ Add new destination')}</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="admin-card" style={{ marginBottom: '24px', padding: '18px 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={label('Tìm theo tên tiếng Việt hoặc tiếng Anh...', 'Search by Vietnamese or English name...')}
            value={keyword}
            onChange={event => setKeyword(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                filter('keyword', keyword.trim());
              }
            }}
          />

          <select value={query.region} onChange={event => filter('region', event.target.value)}>
            <option value="">{label('Tất cả vùng miền', 'All regions')}</option>
            {DESTINATION_REGIONS.map(region => (
              <option key={region.value} value={region.value}>
                {label(region)}
              </option>
            ))}
          </select>

          <select value={query.status} onChange={event => filter('status', event.target.value)}>
            <option value="">{label('Tất cả trạng thái', 'All statuses')}</option>
            {DESTINATION_STATUSES.map(status => (
              <option key={status} value={status}>
                {label(status)}
              </option>
            ))}
          </select>

          {(keyword || query.status || query.region) && (
            <button
              type="button"
              className="button secondary"
              style={{ fontSize: '12px', minHeight: '40px', height: '40px', padding: '0 14px', whiteSpace: 'nowrap' }}
              onClick={() => {
                setKeyword('');
                setQuery({ ...emptyFilters });
                setCurrentPage(1);
              }}
            >
              <span>{label('Đặt lại', 'Reset')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Destinations Table */}
      <ResourceState resource={resource}>
        {items => {
          if (items.length === 0) {
            return (
              <div className="admin-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
                {label('Không tìm thấy điểm đến nào phù hợp.', 'No matching destinations found.')}
              </div>
            );
          }

          const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
          const safePage = Math.min(currentPage, totalPages);
          const pagedItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);

          return (
            <div className="admin-card" style={{ padding: 0, overflowX: 'auto' }}>
              <table className="admin-table" style={{ width: '100%', minWidth: '1180px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: '26%', paddingLeft: '20px' }}>
                      {label('Điểm đến & Hình ảnh', 'Destination & Image')}
                    </th>
                    <th style={{ ...thStyle, width: '16%' }}>
                      {label('Tên tiếng Anh', 'English Name')}
                    </th>
                    <th style={{ ...thStyle, width: '12%' }}>
                      {label('Vùng miền', 'Region')}
                    </th>
                    <th style={{ ...thStyle, width: '11%', textAlign: 'center' }}>
                      {label('Trạng thái', 'Status')}
                    </th>
                    <th style={{ ...thStyle, width: '11%' }}>
                      {label('Cập nhật', 'Last Updated')}
                    </th>
                    <th style={{ ...thStyle, width: '24%', minWidth: '285px', textAlign: 'right', paddingRight: '20px' }}>
                      {label('Thao tác', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedItems.map(item => {
                    const detailPath = generatePath(managementRoutes.destinationDetail, { id: String(item.id) });
                    const regionObj = DESTINATION_REGIONS.find(r => r.value === item.region);

                    return (
                      <tr key={item.id}>
                        <td style={{ ...tdStyle, paddingLeft: '20px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <ContentImage
                              src={item.imageUrl}
                              alt={item.nameVi}
                              style={{ width: '56px', height: '42px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ display: 'block', color: 'var(--color-ink)', fontSize: '14px', lineHeight: 1.35, marginBottom: '2px' }}>
                                {item.nameVi}
                              </strong>
                              <span style={{ fontSize: '11.5px', color: 'var(--color-forest)' }}>
                                ID: #{item.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td style={tdStyle}>
                          <span style={{ fontSize: '13px', color: 'var(--color-ink)', fontWeight: 500 }}>
                            {item.nameEn || '—'}
                          </span>
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#c2410c',
                              background: '#fff7ed',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              border: '1px solid #ffedd5',
                            }}
                          >
                            📍 {regionObj ? label(regionObj) : item.region}
                          </span>
                        </td>

                        <td style={{ ...tdStyle, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {getStatusBadge(item.status)}
                        </td>

                        <td style={{ ...tdStyle, fontSize: '12px', color: 'var(--color-forest)', whiteSpace: 'nowrap' }}>
                          {destinationDate(item.updatedAt)}
                        </td>

                        <td className="admin-destination-actions" style={{ ...tdStyle, textAlign: 'right', paddingRight: '20px', whiteSpace: 'nowrap' }}>
                          <AdminActionGroup>
                            <AdminActionLink to={detailPath} tone="detail" title={label('Xem chi tiết điểm đến', 'View destination detail')}>
                              {label('Chi tiết', 'Detail')}
                            </AdminActionLink>

                            {mayWrite && item.status === 'DRAFT' && (
                              <>
                                <AdminActionLink to={`${detailPath}?edit=1`} tone="edit" title={label('Chỉnh sửa điểm đến', 'Edit destination')}>
                                  {label('Sửa nháp', 'Edit draft')}
                                </AdminActionLink>
                                <AdminActionButton tone="submit" title={label('Gửi điểm đến đi duyệt', 'Submit destination for review')} onClick={() => transition(item, 'SUBMIT')}>
                                  {label('Gửi duyệt', 'Submit')}
                                </AdminActionButton>
                              </>
                            )}

                            {mayWrite && item.status === 'PUBLISHED' && (
                              <AdminActionButton tone="edit" title={label('Chuyển về nháp để sửa', 'Return to draft to revise')} onClick={() => transition(item, 'REVISE')}>
                                {label('Sửa nháp', 'Revise')}
                              </AdminActionButton>
                            )}

                            {mayWrite && ['DRAFT', 'PUBLISHED'].includes(item.status) && (
                              <AdminActionButton tone="delete" iconOnly aria-label={label('Lưu trữ điểm đến', 'Archive destination')} title={label('Lưu trữ điểm đến', 'Archive destination')} onClick={() => transition(item, 'ARCHIVE')} />
                            )}

                            {mayWrite && item.status === 'ARCHIVED' && (
                              <AdminActionButton tone="restore" title={label('Khôi phục bản nháp', 'Restore draft')} onClick={() => transition(item, 'RESTORE')}>
                                {label('Khôi phục', 'Restore')}
                              </AdminActionButton>
                            )}

                            {mayReview && item.status === 'PENDING_REVIEW' && (
                              <>
                                <AdminActionButton tone="approve" title={label('Phê duyệt & công khai', 'Approve & publish')} onClick={() => transition(item, 'APPROVE')}>
                                  {label('Duyệt', 'Approve')}
                                </AdminActionButton>
                                <AdminActionButton tone="edit" title={label('Trả về bản nháp', 'Return to draft')} onClick={() => transition(item, 'REJECT')}>
                                  {label('Từ chối', 'Reject')}
                                </AdminActionButton>
                              </>
                            )}
                          </AdminActionGroup>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <AdminPagination
                currentPage={safePage}
                pageSize={pageSize}
                totalItems={items.length}
                onPageChange={setCurrentPage}
              />
            </div>
          );
        }}
      </ResourceState>

      {creating && (
        <Modal
          title={label('Thêm điểm đến mới', 'Add New Destination')}
          busy={busy}
          onClose={() => setCreating(false)}
        >
          <DestinationForm onSaved={saved} onCancel={() => setCreating(false)} onBusyChange={setBusy} />
        </Modal>
      )}
    </div>
  );
}
