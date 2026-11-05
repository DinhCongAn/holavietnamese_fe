export function bilingualPair(value) {
  if (!value) return null;
  if (Array.isArray(value)) return value.length >= 2 ? [value[0], value[1]] : null;
  if (typeof value === 'object' && value.vi !== undefined) return [value.vi, value.en ?? value.vi];
  return null;
}

export function bilingualLabel(value, enFallback) {
  if (value && typeof value === 'object' && value.vi) {
    return value.vi;
  }
  if (enFallback !== undefined) {
    return value;
  }
  const pair = bilingualPair(value);
  if (!pair) return value;
  return pair[0];
}

export function vietnameseLabel(value, enFallback) {
  return bilingualLabel(value, enFallback);
}

export function englishLabel(value) {
  if (value && typeof value === 'object' && value.en) return value.en;
  const pair = bilingualPair(value);
  return pair ? pair[1] : value;
}

export function useTextLanguage() {
  return 'vi';
}

export function useBilingualLabel() {
  return (vi, en) => bilingualLabel(vi, en);
}

export function BilingualText({ children, vi, en }) {
  if (vi !== undefined || en !== undefined) {
    return bilingualLabel(vi, en);
  }
  return children;
}
