import { bilingualLabel } from '@/shared/components/common/BilingualText';

export const VOCABULARY_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'];

export const newExample = () => ({ exampleVi: '', translationEn: '', audioUrl: '', displayOrder: 0 });
export const newMeaning = () => ({ translationEn: '', definitionEn: '', definitionVi: '', labels: [], usageNote: '', displayOrder: 0, examples: [] });

export function vocabularyDraft(entry) {
  return {
    word: entry?.word ?? '',
    pronunciation: entry?.pronunciation ?? '',
    partOfSpeech: entry?.partOfSpeech ?? '',
    audioUrl: entry?.audioUrl ?? '',
    status: entry?.status ?? 'DRAFT',
    meanings: entry ? (entry.meanings ?? []).map((meaning) => ({
      translationEn: meaning.translationEn ?? '',
      definitionEn: meaning.definitionEn ?? '',
      definitionVi: meaning.definitionVi ?? '',
      labels: meaning.labels ?? [],
      usageNote: meaning.usageNote ?? '',
      displayOrder: meaning.displayOrder ?? 0,
      examples: (meaning.examples ?? []).map((example) => ({
        exampleVi: example.exampleVi ?? '',
        translationEn: example.translationEn ?? '',
        audioUrl: example.audioUrl ?? '',
        displayOrder: example.displayOrder ?? 0,
      })),
    })) : [newMeaning()],
  };
}

export function vocabularyPayload(draft) {
  const required = (value, label, maxLength) => {
    const text = value.trim();
    if (!text) throw new Error(bilingualLabel(`${label} không được để trống.`, `${bilingualLabel(label)} cannot be empty.`));
    if (maxLength && text.length > maxLength) throw new Error(bilingualLabel(`${label} tối đa ${maxLength} ký tự.`, `${bilingualLabel(label)} max ${maxLength} characters.`));
    return text;
  };
  const optional = (value) => value.trim() || null;
  const order = (value) => {
    if (value === '' || value == null) return null;
    const number = Number(value);
    if (!Number.isInteger(number) || number < 0) throw new Error(bilingualLabel('Thứ tự phải là số nguyên không âm.', 'Order index must be a non-negative integer.'));
    return number;
  };
  if (!draft.meanings.length) throw new Error(bilingualLabel('Cần ít nhất một nghĩa.', 'At least one meaning is required.'));
  for (const meaning of draft.meanings) if (![meaning.translationEn, meaning.definitionVi, meaning.definitionEn].some(value => value?.trim())) throw new Error(bilingualLabel('Mỗi nghĩa cần định nghĩa tiếng Việt hoặc nghĩa tiếng Anh.', 'Each meaning requires either a Vietnamese definition or an English meaning.'));
  return {
    word: required(draft.word, 'Từ vựng', 200),
    pronunciation: optional(draft.pronunciation),
    partOfSpeech: required(draft.partOfSpeech, 'Từ loại', 40),
    audioUrl: optional(draft.audioUrl),
    status: draft.status,
    meanings: draft.meanings.map((meaning) => ({
      translationEn: meaning.translationEn.trim() ? required(meaning.translationEn, 'Bản dịch nghĩa', 500) : null,
      definitionEn: optional(meaning.definitionEn),
      definitionVi: optional(meaning.definitionVi || ''),
      labels: meaning.labelsInput == null ? (meaning.labels || []) : meaning.labelsInput.split(',').map(value => value.trim()).filter(Boolean),
      usageNote: optional(meaning.usageNote),
      displayOrder: order(meaning.displayOrder),
      examples: meaning.examples.map((example) => ({
        exampleVi: required(example.exampleVi, 'Ví dụ tiếng Việt'),
        translationEn: optional(example.translationEn),
        audioUrl: optional(example.audioUrl),
        displayOrder: order(example.displayOrder),
      })),
    })),
  };
}
