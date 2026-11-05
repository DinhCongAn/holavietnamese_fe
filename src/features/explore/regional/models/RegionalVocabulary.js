import { bilingualLabel } from '@/shared/components/common/BilingualText';

export const REGIONAL_REGIONS = [
  { value: 'NORTH', vi: 'Miền Bắc', en: 'North' },
  { value: 'CENTRAL', vi: 'Miền Trung', en: 'Central' },
  { value: 'SOUTH', vi: 'Miền Nam', en: 'South' },
];
export const REGIONAL_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'];
export function regionalDraft(entry) {
  return Object.fromEntries(['vocabularyId', 'region', 'word', 'meaning', 'meaningEn', 'pronunciation', 'audioUrl', 'exampleSentence', 'exampleSentenceEn', 'usageNote', 'usageNoteEn', 'status']
    .map(key => [key, entry?.[key] ?? (key === 'status' ? 'DRAFT' : '')]));
}
export function regionalPayload(draft) {
  if (!/^\d+$/.test(String(draft.vocabularyId)) || !Number.isSafeInteger(Number(draft.vocabularyId)) || Number(draft.vocabularyId) < 1) throw new Error(bilingualLabel('Vui lòng chọn từ vựng chuẩn.', 'Please select a standard word.'));
  if (!REGIONAL_REGIONS.some(region => region.value === draft.region)) throw new Error(bilingualLabel('Vui lòng chọn miền Bắc, Trung hoặc Nam.', 'Please select North, Central, or South.'));
  if (!REGIONAL_STATUSES.includes(draft.status)) throw new Error(bilingualLabel('Trạng thái không hợp lệ.', 'Invalid status.'));
  const text = (key, max, required = false) => {
    const value = (draft[key] ?? '').trim();
    if (required && !value) throw new Error(bilingualLabel('Từ biến thể và nghĩa không được để trống.', 'Variant word and meaning cannot be empty.'));
    if (value.length > max) throw new Error(bilingualLabel(`${key}: tối đa ${max} ký tự.`, `${key}: max ${max} characters.`));
    return value || null;
  };
  const exampleSentence = text('exampleSentence', 2000);
  const exampleSentenceEn = text('exampleSentenceEn', 2000);
  if (exampleSentenceEn && !exampleSentence) throw new Error('Bản dịch ví dụ tiếng Anh cần có câu ví dụ tiếng Việt.');
  return { vocabularyId: Number(draft.vocabularyId), region: draft.region, status: draft.status,
    word: text('word', 200, true), meaning: text('meaning', 1000, true), meaningEn: text('meaningEn', 1000), pronunciation: text('pronunciation', 200),
    audioUrl: text('audioUrl', 2048), exampleSentence, exampleSentenceEn,
    usageNote: text('usageNote', 2000), usageNoteEn: text('usageNoteEn', 2000) };
}
