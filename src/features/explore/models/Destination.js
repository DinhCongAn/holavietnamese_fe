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
    if (required && !trimmed) throw new Error(`${label} không được để trống.`);
    if (max && trimmed.length > max) throw new Error(`${label} tối đa ${max} ký tự.`);
    return trimmed || null;
  };
  if (!DESTINATION_REGIONS.some(item => item.value === draft.region)) throw new Error('Vui lòng chọn vùng miền.');
  if (!DESTINATION_STATUSES.includes(draft.status)) throw new Error('Trạng thái không hợp lệ.');
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

export const destinationDate = (value, language = 'vi') => value
  ? new Date(value).toLocaleString(String(language).startsWith('vi') ? 'vi-VN' : 'en-US')
  : '—';
