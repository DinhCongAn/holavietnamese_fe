import { useCallback } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Breadcrumb, EmptyState, PageHeader } from '@/shared/components/common/Ui';
import { Modal } from '@/shared/components/common/Modal';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { ImportJobResult, IMPORT_STATUS_LABELS } from '@/features/content-import/components/ImportJobResult';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { contentImportService } from '@/features/content-import/api/contentImportService';
import { getBackOfficeRoutes } from '@/constants/routes';
import { BilingualText, useBilingualLabel } from '@/shared/components/common/BilingualText';
import { useTranslation } from 'react-i18next';
import '@/features/content-import/components/content-import.css';
import { AdminPagination } from '@/shared/components/common/AdminPagination';
import { AdminActionButton, AdminActionGroup } from '@/shared/components/common/AdminTableActions';

export function AdminImportHistoryPage() {
  const label = useBilingualLabel();
  const location = useLocation();
  const managementRoutes = getBackOfficeRoutes(location.pathname);
  const { i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('vi') ? 'vi-VN' : 'en-US';
  const [params, setParams] = useSearchParams();
  const rawPage = Number(params.get('page') || 0), page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const selected = params.get('id');
  const resource = useAsyncResource(useCallback(signal => contentImportService.history(page, { signal }), [page]));

  return <section className="content-import-page content-import-detail">
    <Breadcrumb items={[{ label: label('Từ vựng', 'Vocabulary'), to: managementRoutes.vocabulary }, { label: label('Nhập dữ liệu', 'Import Data'), to: managementRoutes.importData }, { label: label('Lịch sử', 'History') }]} />
    <PageHeader
      eyebrow={<BilingualText vi="Quản lý nội dung" en="Content Management" />}
      title={<BilingualText vi="Lịch sử import" en="Import History" />}
      description={<BilingualText vi="Xem bản xem trước, kết quả và lỗi của những lần nhập dữ liệu." en="View previews, results, and logs of data import operations." />}
      actions={<Link className="button" to={managementRoutes.importData}><BilingualText vi="Nhập dữ liệu" en="Import Data" /></Link>}
    />
    <ResourceState resource={resource}>{data => data.content.length ? <>
      <div className="admin-card import-history-card">
        <div className="import-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th><BilingualText>{"Thời gian"}</BilingualText></th>
                <th><BilingualText>{"Người thực hiện"}</BilingualText></th>
                <th><BilingualText>{"Loại"}</BilingualText></th>
                <th><BilingualText>{"File"}</BilingualText></th>
                <th><BilingualText>{"Trạng thái"}</BilingualText></th>
                <th><BilingualText>{"Đã nhập / lỗi"}</BilingualText></th>
                <th><BilingualText>{"Chi tiết"}</BilingualText></th>
              </tr>
            </thead>
            <tbody>
              {data.content.map(job => <tr key={job.id}>
                <td>{new Date(job.createdAt).toLocaleString(locale)}</td>
                <td>{job.actorName}</td>
                <td>{job.module === 'VOCABULARY' ? label('Từ vựng chuẩn', 'Standard Vocabulary') : job.module}</td>
                <td>{job.filename}</td>
                <td>{label(IMPORT_STATUS_LABELS[job.status] || job.status)}</td>
                <td>{job.importedRows} / {job.failedRows}</td>
                <td><AdminActionGroup><AdminActionButton tone="detail" onClick={() => setParams({ page: String(page), id: job.id })}><BilingualText vi="Xem" en="View" /></AdminActionButton></AdminActionGroup></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <AdminPagination currentPage={page + 1} pageSize={20} totalItems={data.totalElements ?? data.content.length} onPageChange={(nextPage) => setParams({ page: String(nextPage - 1) })} />
      </div>
    </> : <EmptyState title={<BilingualText vi="Chưa có lịch sử import" en="No import history yet" />} />}</ResourceState>
    {selected && <ImportDetail key={selected} id={selected} onClose={() => setParams({ page: String(page) })} />}
  </section>;
}

function ImportDetail({ id, onClose }) {
  const label = useBilingualLabel();
  const resource = useAsyncResource(useCallback(signal => contentImportService.get(id, { signal }), [id]));
  return <Modal className="import-detail-modal" title={label("Chi tiết lần import", "Import Details")} onClose={onClose}><ResourceState resource={resource}>{job => <ImportJobResult job={job} />}</ResourceState></Modal>;
}
