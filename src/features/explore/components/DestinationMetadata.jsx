import { BilingualText } from '@/shared/components/common/BilingualText';
import { useTranslation } from 'react-i18next';
import { destinationDate, DESTINATION_REGIONS } from '@/features/explore/models/Destination';

export function DestinationRegion({ value }) {
  const region = DESTINATION_REGIONS.find(item => item.value === value);
  return region ? <BilingualText vi={region.vi} en={region.en} /> : value || '—';
}

export function DestinationStatusBadge({ status }) {
  return <span className={`admin-badge ${status === 'PUBLISHED' ? 'admin-badge-success' : status === 'ARCHIVED' ? 'admin-badge-danger' : 'admin-badge-warning'}`}><BilingualText>{status}</BilingualText></span>;
}

export function DestinationMetadata({ entry }) {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || 'en';
  return <dl>
    <dt>ID</dt><dd>{entry.id}</dd>
    <dt><BilingualText vi="Ngày xuất bản" en="Published" /></dt><dd>{destinationDate(entry.publishedAt, language)}</dd>
    <dt><BilingualText vi="Ngày lưu trữ" en="Archived" /></dt><dd>{destinationDate(entry.archivedAt, language)}</dd>
    <dt><BilingualText vi="Ngày tạo" en="Created" /></dt><dd>{destinationDate(entry.createdAt, language)}</dd>
    <dt><BilingualText vi="Cập nhật lần cuối" en="Last updated" /></dt><dd>{destinationDate(entry.updatedAt, language)}</dd>
  </dl>;
}
