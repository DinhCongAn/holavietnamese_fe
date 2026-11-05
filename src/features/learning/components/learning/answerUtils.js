import { bilingualLabel } from '@/shared/components/common/BilingualText';
export function answerPresent(answer) {
  if (typeof answer === 'string') return answer.trim().length > 0;
  if (!answer || typeof answer !== 'object') return false;
  if (answer.optionIds) return answer.optionIds.length > 0;
  if (answer.sequence) return answer.sequence.length > 0;
  if (answer.pairs) return Object.values(answer.pairs).some(Boolean);
  return typeof answer.text === 'string' && answer.text.trim().length > 0;
}
export function answerLabel(answer, options = []) {
  const label = id => { const option = options.find(item => String(item.id) === String(id)); return option?.textVi || option?.text || option?.textEn || String(id); };
  if (typeof answer === 'string') return answer;
  if (!answer) return bilingualLabel('Chưa trả lời', 'Not answered');
  if (answer.optionIds) return answer.optionIds.map(label).join(', ');
  if (answer.sequence) return answer.sequence.map(label).join(' ');
  if (answer.pairs) return Object.entries(answer.pairs).map(([left, right]) => `${label(left)} → ${label(right)}`).join('; ');
  return answer.text || answer.acceptedAnswers?.join(' / ') || bilingualLabel('Chưa trả lời', 'Not answered');
}
export function moveItem(items, index, direction) {
  const next = [...items], target = index + direction;
  if (target < 0 || target >= items.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
