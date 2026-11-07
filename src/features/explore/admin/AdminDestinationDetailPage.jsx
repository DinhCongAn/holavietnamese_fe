import { useCallback, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { ContentImage } from '@/shared/components/common/ContentImage';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { Breadcrumb, EmptyState, Notice, PageHeader } from '@/shared/components/common/Ui';
import { DestinationForm } from '@/features/explore/components/DestinationForm';
import { DestinationContentEditor } from '@/features/explore/components/DestinationContentEditor';
import { DestinationMetadata, DestinationRegion, DestinationStatusBadge } from '@/features/explore/components/DestinationMetadata';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { adminDestinationService } from '@/features/explore/api/destinationService';
import { getBackOfficeRoutes } from '@/constants/routes';
import '@/features/explore/components/destinations.css';
import { useAuth } from '@/features/auth/context/AuthContext';
import { canManageExploreLinks, canReviewExplore, canWriteExplore } from '@/utils/permissions/contentAccess';

export function AdminDestinationDetailPage() {
  useTextLanguage();
  const location = useLocation();
  const managementRoutes = getBackOfficeRoutes(location.pathname);
  const { user } = useAuth();
  const mayWrite = canWriteExplore(user);
  const mayReview = canReviewExplore(user);
  const mayManageLinks = canManageExploreLinks(user);
  const mayEditCompleteDestination = mayWrite && mayManageLinks;
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const editing = params.get('edit') === '1';
  const [message, setMessage] = useState('');
  const resource = useAsyncResource(useCallback(signal => adminDestinationService.get(id, { signal }), [id]));
  function saved() {
    setMessage(bilingualLabel('Đã lưu điểm đến và toàn bộ nội dung liên kết.', 'Destination and all linked content saved.'));
    setParams({});
    resource.reload();
  }
  async function transition(action) {
    if (action === 'SUBMIT') await adminDestinationService.submitReview(id);
    else if (action === 'REVISE') await adminDestinationService.revise(id);
    else await adminDestinationService.review(id, action);
    setMessage(action === 'SUBMIT' ? bilingualLabel('Đã gửi điểm đến đi duyệt.', 'Destination submitted for review.')
      : action === 'APPROVE' ? bilingualLabel('Đã duyệt và công khai điểm đến.', 'Destination approved and published.')
        : action === 'REJECT' ? bilingualLabel('Đã trả điểm đến về bản nháp.', 'Destination returned to draft.')
          : bilingualLabel('Đã chuyển điểm đến về bản nháp để chỉnh sửa.', 'Destination returned to draft for revision.'));
    resource.reload();
  }

  if (resource.error?.status === 404) return <EmptyState title={bilingualLabel("Không tìm thấy điểm đến", "Destination not found")}><Link className="button secondary" to={managementRoutes.destinations}><BilingualText vi="Về danh sách điểm đến" en="Back to destinations" /></Link></EmptyState>;

  return <div className="admin-destinations-page admin-destination-detail-page">
    <Breadcrumb items={[{ label: bilingualLabel('Điểm đến', 'Destinations'), to: managementRoutes.destinations }, { label: editing ? bilingualLabel('Chỉnh sửa', 'Edit') : bilingualLabel('Chi tiết', 'Details') }]} />
    <ResourceState resource={resource}>{entry => <>
      <PageHeader eyebrow={<BilingualText vi="Quản lý điểm đến" en="Destination Management" />} title={<BilingualText vi={entry.nameVi} en={entry.nameEn} />} actions={!editing && <div className="actions">
        {mayEditCompleteDestination && entry.status === 'DRAFT' && <><button type="button" className="secondary" onClick={() => { setMessage(''); setParams({ edit: '1' }); }}><BilingualText vi="Chỉnh sửa điểm đến" en="Edit destination" /></button><button type="button" onClick={() => transition('SUBMIT')}><BilingualText vi="Gửi duyệt" en="Submit for review" /></button></>}
        {mayEditCompleteDestination && entry.status === 'PUBLISHED' && <button type="button" onClick={async () => { await transition('REVISE'); setParams({ edit: '1' }); }}><BilingualText vi="Chỉnh sửa lại" en="Revise" /></button>}
        {mayReview && entry.status === 'PENDING_REVIEW' && <><button type="button" onClick={() => transition('APPROVE')}><BilingualText vi="Phê duyệt & công khai" en="Approve & publish" /></button><button type="button" className="secondary" onClick={() => transition('REJECT')}><BilingualText vi="Trả về bản nháp" en="Return to draft" /></button></>}
      </div>} />
      {message && <Notice kind="success"><BilingualText>{message}</BilingualText></Notice>}
      <section className="admin-card">
        {editing && mayEditCompleteDestination && entry.status === 'DRAFT' ? <DestinationForm key={entry.id} entry={entry} onSaved={saved} onCancel={() => setParams({})} /> : <>
          <ContentImage src={entry.imageUrl} alt={entry.nameVi} className="figma-art" style={{ maxHeight: 280, objectFit: 'cover', borderRadius: 8 }} loading="eager" />
          <dl><dt><BilingualText vi="Tên tiếng Việt" en="Vietnamese name" /></dt><dd lang="vi">{entry.nameVi}</dd><dt><BilingualText vi="Tên tiếng Anh" en="English name" /></dt><dd lang="en">{entry.nameEn}</dd><dt>Slug</dt><dd>{entry.slug}</dd><dt><BilingualText vi="Vùng miền" en="Region" /></dt><dd><DestinationRegion value={entry.region} /></dd><dt><BilingualText>Trạng thái</BilingualText></dt><dd><DestinationStatusBadge status={entry.status} /></dd><dt><BilingualText vi="Đường dẫn ảnh" en="Image URL" /></dt><dd style={{ overflowWrap: 'anywhere' }}>{entry.imageUrl || '—'}</dd></dl>
          {[['shortDescriptionVi', 'Mô tả ngắn tiếng Việt', 'Short description in Vietnamese', 'vi'], ['shortDescriptionEn', 'Mô tả ngắn tiếng Anh', 'Short description in English', 'en'], ['descriptionVi', 'Mô tả tiếng Việt', 'Vietnamese description', 'vi'], ['descriptionEn', 'Mô tả tiếng Anh', 'English description', 'en']].map(([field, vi, en, lang]) => <section key={field}><h2><BilingualText vi={vi} en={en} /></h2><p lang={lang} style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{entry[field] || '—'}</p></section>)}
        </>}
      </section>
      <section className="admin-card" style={{ marginTop: 20 }}><DestinationMetadata entry={entry} /></section>
      {!editing && <DestinationContentEditor key={entry.id} destinationId={entry.id} editable={false} />}
      <div className="actions" style={{ marginTop: 20 }}><Link className="button secondary" to={managementRoutes.destinations}><BilingualText vi="Về danh sách điểm đến" en="Back to destinations" /></Link></div>
    </>}</ResourceState>
  </div>;
}
