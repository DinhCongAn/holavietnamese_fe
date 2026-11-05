import { bilingualLabel } from '@/shared/components/common/BilingualText';

export const DESTINATION_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'];
export const DESTINATION_REGIONS = [
  { value: 'NORTH', vi: 'Miền Bắc', en: 'North' },
  { value: 'CENTRAL', vi: 'Miền Trung', en: 'Central' },
  { value: 'SOUTH', vi: 'Miền Nam', en: 'South' },
];

export function destinationDraft(entry) {
  return {
    nameVi: entry?.nameVi ?? '',
    nameEn: entry?.nameEn ?? '',
    slug: entry?.slug ?? '',
    region: entry?.region ?? '',
    shortDescriptionVi: entry?.shortDescriptionVi ?? '',
    shortDescriptionEn: entry?.shortDescriptionEn ?? '',
    descriptionVi: entry?.descriptionVi ?? '',
    descriptionEn: entry?.descriptionEn ?? '',
    imageUrl: entry?.imageUrl ?? '',
    status: entry?.status ?? 'DRAFT',
  };
}

export function destinationPayload(draft) {
  const text = (value, label, max, required = false) => {
    const trimmed = (value ?? '').trim();
    if (required && !trimmed) throw new Error(bilingualLabel(`${label} không được để trống.`, `${bilingualLabel(label)} cannot be empty.`));
    if (max && trimmed.length > max) throw new Error(bilingualLabel(`${label} tối đa ${max} ký tự.`, `${bilingualLabel(label)} max ${max} characters.`));
    return trimmed || null;
  };
  if (!DESTINATION_REGIONS.some(item => item.value === draft.region)) throw new Error(bilingualLabel('Vui lòng chọn vùng miền.', 'Please select a region.'));
  if (!DESTINATION_STATUSES.includes(draft.status)) throw new Error(bilingualLabel('Trạng thái không hợp lệ.', 'Invalid status.'));
  // Only DestinationRequest fields; timestamps and slug normalization belong to the backend.
  return {
    nameVi: text(draft.nameVi, 'Tên tiếng Việt', 150, true),
    nameEn: text(draft.nameEn, 'Tên tiếng Anh', 150, true),
    slug: text(draft.slug, 'Slug', 180, true),
    region: draft.region,
    shortDescriptionVi: text(draft.shortDescriptionVi, 'Mô tả ngắn tiếng Việt', 500),
    shortDescriptionEn: text(draft.shortDescriptionEn, 'Mô tả ngắn tiếng Anh', 500),
    descriptionVi: text(draft.descriptionVi),
    descriptionEn: text(draft.descriptionEn),
    imageUrl: text(draft.imageUrl, 'Đường dẫn ảnh', 2048),
    status: draft.status,
  };
}

export const destinationDate = value => value ? new Date(value).toLocaleString(bilingualLabel('vi', 'en') === 'en' ? 'en-US' : 'vi-VN') : '—';
