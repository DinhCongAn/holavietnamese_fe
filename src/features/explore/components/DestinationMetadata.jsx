import { BilingualText, useTextLanguage } from '@/shared/components/common/BilingualText';
import { destinationDate, DESTINATION_REGIONS } from '@/features/explore/models/Destination';

export function DestinationRegion({ value }) {
  const region = DESTINATION_REGIONS.find(item => item.value === value);
  return region ? <BilingualText vi={region.vi} en={region.en} /> : value || '—';
}

export function DestinationStatusBadge({ status }) {
  return <span className={`admin-badge ${status === 'PUBLISHED' ? 'admin-badge-success' : status === 'ARCHIVED' ? 'admin-badge-danger' : 'admin-badge-warning'}`}><BilingualText>{status}</BilingualText></span>;
}

export function DestinationMetadata({ entry }) {
  useTextLanguage();
  return <dl>
    <dt>ID</dt><dd>{entry.id}</dd>
    <dt><BilingualText>Ngày xuất bản</BilingualText></dt><dd>{destinationDate(entry.publishedAt)}</dd>
    <dt><BilingualText>Ngày lưu trữ</BilingualText></dt><dd>{destinationDate(entry.archivedAt)}</dd>
    <dt><BilingualText>Ngày tạo</BilingualText></dt><dd>{destinationDate(entry.createdAt)}</dd>
    <dt><BilingualText>Cập nhật lần cuối</BilingualText></dt><dd>{destinationDate(entry.updatedAt)}</dd>
  </dl>;
}
