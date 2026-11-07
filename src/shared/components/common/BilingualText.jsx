import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { UI_TRANSLATIONS } from '@/shared/components/common/uiTranslations';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

const TextLanguageContext = createContext('bilingual');

export function BilingualTextProvider({ language, children }) {
  const { i18n: activeI18n } = useTranslation();
  const [lang, setLang] = useState(() =>
    (activeI18n?.resolvedLanguage || activeI18n?.language || i18n.language || 'en').startsWith('vi') ? 'vi' : 'en'
  );

  useEffect(() => {
    const syncLang = (nextLang) => {
      const raw = nextLang || activeI18n?.resolvedLanguage || activeI18n?.language || i18n.language || 'en';
      setLang(String(raw).startsWith('vi') ? 'vi' : 'en');
    };
    syncLang();
    i18n.on('languageChanged', syncLang);
    return () => {
      i18n.off('languageChanged', syncLang);
    };
  }, [activeI18n]);

  const currentLang = (activeI18n?.resolvedLanguage || activeI18n?.language || lang || 'en').startsWith('vi') ? 'vi' : 'en';
  const effectiveLanguage = language || lang || currentLang;
  return <TextLanguageContext.Provider value={effectiveLanguage}>{children}</TextLanguageContext.Provider>;
}

export function useTextLanguage() {
  const { i18n: activeI18n } = useTranslation();
  const contextLanguage = useContext(TextLanguageContext);
  if (contextLanguage === 'vi' || contextLanguage === 'en') {
    return contextLanguage;
  }
  return (activeI18n?.resolvedLanguage || activeI18n?.language || i18n.language || 'en').startsWith('vi') ? 'vi' : 'en';
}

const patterns = [
  [/^Xin chào, (.+)!$/, match => `Hello, ${match[1]}!`],
  [/^Đã lưu “(.+)” vào sổ tay\.$/, match => `Saved “${match[1]}” to your notebook.`],
  [/^Đã xóa “(.+)” khỏi sổ tay\.$/, match => `Removed “${match[1]}” from your notebook.`],
  [/^Nghĩa (\d+):$/, match => `Meaning ${match[1]}:`],
  [/^(\d+) phút$/, match => `${match[1]} minutes`],
  [/^(\d+) phút đọc$/, match => `${match[1]} min read`],
  [/^(\d+) lượt xem$/, match => `${match[1]} views`],
  [/^(\d+) từ vựng$/, match => `${match[1]} words`],
  [/^(\d+) từ$/, match => `${match[1]} words`],
  [/^(\d+) chủ đề$/, match => `${match[1]} topics`],
  [/^(\d+) kịch bản$/, match => `${match[1]} scenarios`],
  [/^(\d+) khóa học$/, match => `${match[1]} courses`],
  [/^(\d+) danh mục$/, match => `${match[1]} categories`],
  [/^(\d+) điểm đến$/, match => `${match[1]} destinations`],
  [/^(\d+) bài viết$/, match => `${match[1]} articles`],
  [/^Cấp (\d+)$/i, match => `Level ${match[1]}`],
  [/^Chặng (\d+)$/i, match => `Stage ${match[1]}`],
  [/^Bước (\d+)$/i, match => `Step ${match[1]}`],
  [/^Phần (\d+)$/i, match => `Part ${match[1]}`],
  [/^Lần thử (\d+)$/i, match => `Attempt ${match[1]}`],
  [/^Cấp độ (.+)$/, match => `Level ${match[1]}`],
  [/^Lựa chọn (\d+)$/, match => `Option ${match[1]}`],
  [/^Mục (\d+)$/, match => `Item ${match[1]}`],
  [/^Tối đa (\d+) lần$/, match => `Up to ${match[1]} attempts`],
  [/^Còn (\d+) phút để ngày hôm nay thêm ý nghĩa\.$/, match => `${match[1]} minutes left to make today count.`],
  [/^Thêm (\d+) phút cho hành trình của bạn\.$/, match => `Add ${match[1]} minutes to your journey.`],
  [/^Mã xác nhận 6 số đã được gửi tới (.+)\.$/, match => `A six-digit verification code was sent to ${match[1]}.`],
  [/^Biên tập: (.*)$/, match => `Editing: ${match[1]}`],
  [/^(\d+) min$/, match => `${match[1]} minutes`],
  [/^(\d+) \/ (\d+) hoạt động$/, match => `${match[1]} / ${match[2]} activities`],
  [/^(\d+) \/ (\d+) từ$/, match => `${match[1]} / ${match[2]} words`],
  [/^(\d+) \/ (\d+) bài học đã hoàn thành$/, match => `${match[1]} / ${match[2]} lessons completed`],
  [/^Đã hoàn thành (\d+)\/([^\s]+) bài học \((\d+)%\)$/, match => `Completed ${match[1]}/${match[2]} lessons (${match[3]}%)`],
  [/^(\d+) bài học$/, match => `${match[1]} lessons`],
  [/^(\d+) bài$/, match => `${match[1]} lessons`],
  [/^(\d+) câu hỏi$/, match => `${match[1]} questions`],
  [/^(\d+) học phần$/, match => `${match[1]} modules`],
  [/^(\d+) ngày trước$/, match => `${match[1]} days ago`],
  [/^(\d+) giờ trước$/, match => `${match[1]} hours ago`],
  [/^(\d+) phút trước$/, match => `${match[1]} minutes ago`],
  [/^Học phần (\d+)$/i, match => `Module ${match[1]}`],
  [/^Bài (\d+)$/i, match => `Lesson ${match[1]}`],
  [/^Câu (\d+)$/i, match => `Question ${match[1]}`],
  [/^Đưa học phần (\d+) lên$/, match => `Move module ${match[1]} up`],
  [/^Đưa học phần (\d+) xuống$/, match => `Move module ${match[1]} down`],
  [/^Đưa bài (\d+) lên$/, match => `Move lesson ${match[1]} up`],
  [/^Đưa bài (\d+) xuống$/, match => `Move lesson ${match[1]} down`],
  [/^Đưa câu (\d+) lên$/, match => `Move question ${match[1]} up`],
  [/^Đưa câu (\d+) xuống$/, match => `Move question ${match[1]} down`],
  [/^Gỡ câu (\d+)$/, match => `Remove question ${match[1]}`],
  [/^Điểm câu (\d+)$/, match => `Points for question ${match[1]}`],
  [/^Xem trước (.*)$/, match => `Preview ${match[1]}`],
  [/^Lưu trữ “(.*)”\? Nội dung sẽ ngừng hiển thị với học viên\.$/, match => `Archive “${match[1]}”? Content will no longer appear for learners.`],
  [/^Tạo (.+)$/, match => `Create ${UI_TRANSLATIONS[match[1]]?.[1] || match[1]}`],
  [/^Tìm (.+)$/, match => `Search ${UI_TRANSLATIONS[match[1]]?.[1] || match[1]}`],
  [/^(\d+) mục còn thiếu$/, match => `${match[1]} items remaining`],
  [/^Xóa nghĩa (\d+)$/, match => `Delete meaning ${match[1]}`],
  [/^Xóa ví dụ (\d+)$/, match => `Delete example ${match[1]}`],
  [/^Xóa dòng (\d+)$/, match => `Delete row ${match[1]}`],
  [/^Xóa lựa chọn (\d+)$/, match => `Delete option ${match[1]}`],
  [/^Đáp án đúng (\d+)$/, match => `Correct option ${match[1]}`],
  [/^Cột lựa chọn (\d+)$/, match => `Column for option ${match[1]}`],
  [/^Đưa từ (\d+) lên$/, match => `Move word ${match[1]} up`],
  [/^Đưa từ (\d+) xuống$/, match => `Move word ${match[1]} down`],
  [/^Mục tiêu (\d+)\.\.\.$/, match => `Objective ${match[1]}`],
  [/^Bỏ liên kết (.+)$/, match => `Unlink ${match[1]}`],
];

const englishPatterns = [
  [
    /^Ready for today(?:'s|’s) Vietnamese lesson\??$/i,
    () => ['Sẵn sàng cho bài học tiếng Việt hôm nay?', "Ready for today's Vietnamese lesson?"],
  ],
  [
    /^Continue ["“](.+)["”] and keep your learning streak going\.?$/i,
    match => [`Tiếp tục khóa học "${match[1]}" để duy trì chuỗi học tập của bạn.`, `Continue "${match[1]}" and keep your learning streak going.`],
  ],
  [
    /^Keep your learning streak burning every day\.?$/i,
    () => ['Duy trì ngọn lửa học tập mỗi ngày.', 'Keep your learning streak burning every day.'],
  ],
];

const REVERSE_TRANSLATIONS = {};
for (const key of Object.keys(UI_TRANSLATIONS)) {
  const pair = UI_TRANSLATIONS[key];
  if (pair && pair[1] && !REVERSE_TRANSLATIONS[pair[1]]) {
    REVERSE_TRANSLATIONS[pair[1]] = pair;
  }
}

export function bilingualPair(value) {
  if (typeof value !== 'string') return null;
  const text = value.replace(/\s+/g, ' ').trim();
  const normalizedApos = text.replace(/’/g, "'");
  if (UI_TRANSLATIONS[text]) return UI_TRANSLATIONS[text];
  if (UI_TRANSLATIONS[normalizedApos]) return UI_TRANSLATIONS[normalizedApos];
  if (REVERSE_TRANSLATIONS[text]) return REVERSE_TRANSLATIONS[text];
  if (REVERSE_TRANSLATIONS[normalizedApos]) return REVERSE_TRANSLATIONS[normalizedApos];
  for (const [pattern, getPair] of englishPatterns) {
    const match = text.match(pattern);
    if (match) return getPair(match);
  }
  for (const [pattern, translate] of patterns) {
    const match = text.match(pattern);
    if (match) return [/^\d+ min$/.test(text) ? text.replace(' min', ' phút') : text, translate(match)];
  }
  return null;
}

// Native select options and placeholders accept text rather than nested markup.
export function bilingualLabel(value, enFallback) {
  if (value && typeof value === 'object' && value.vi) {
    const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('vi') ? 'vi' : 'en';
    return currentLang === 'vi' ? value.vi : (value.en || value.vi);
  }
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('vi') ? 'vi' : 'en';
  if (enFallback !== undefined) {
    return currentLang === 'vi' ? value : enFallback;
  }
  const pair = bilingualPair(value);
  if (!pair) return value;
  return currentLang === 'vi' ? pair[0] : pair[1];
}

export function vietnameseLabel(value, enFallback) {
  return bilingualLabel(value, enFallback);
}

export function englishLabel(value) {
  if (value && typeof value === 'object' && (value.en || value.vi)) return value.en || value.vi;
  return bilingualPair(value)?.[1] ?? value;
}

export function useBilingualLabel() {
  const { i18n: activeI18n } = useTranslation();
  const contextLanguage = useContext(TextLanguageContext);
  const currentLang = contextLanguage === 'vi' || contextLanguage === 'en'
    ? contextLanguage
    : ((activeI18n?.resolvedLanguage || activeI18n?.language || 'en').startsWith('vi') ? 'vi' : 'en');
  return useCallback((value, enFallback) => {
    if (value && typeof value === 'object' && value.vi) {
      return currentLang === 'vi' ? value.vi : (value.en || value.vi);
    }
    if (enFallback !== undefined) {
      return currentLang === 'vi' ? value : enFallback;
    }
    if (currentLang === 'vi') return bilingualPair(value)?.[0] ?? value;
    const pair = bilingualPair(value);
    if (!pair) return value;
    return pair[1];
  }, [currentLang]);
}

export function BilingualText({ children, vi, en, className = '' }) {
  const { i18n: activeI18n } = useTranslation();
  const contextLanguage = useContext(TextLanguageContext);
  const currentLang = contextLanguage === 'vi' || contextLanguage === 'en'
    ? contextLanguage
    : ((activeI18n?.resolvedLanguage || activeI18n?.language || 'en').startsWith('vi') ? 'vi' : 'en');

  const pair = en ? [vi ?? children, en] : bilingualPair(vi !== undefined ? vi : children);
  if (!pair || (typeof pair[0] === 'string' && pair[0].toLowerCase() === pair[1].toLowerCase())) {
    return children ?? vi ?? null;
  }
  return (
    <span className={`bilingual-text ${className}`.trim()}>
      <span className="bilingual-text__current" lang={currentLang}>
        {currentLang === 'vi' ? pair[0] : pair[1]}
      </span>
    </span>
  );
}
