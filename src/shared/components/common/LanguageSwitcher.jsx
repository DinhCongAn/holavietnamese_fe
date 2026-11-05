import { useId } from 'react';
import { useTranslation } from 'react-i18next';

export function UkFlag({ className = '' }) {
  const clipId = useId();
  const diagId = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 40"
      className={`language-flag ${className}`.trim()}
      aria-hidden="true"
      focusable="false"
    >
      <clipPath id={clipId}>
        <rect width="60" height="40" rx="4" />
      </clipPath>
      <clipPath id={diagId}>
        <path d="M30,20 h30 v20 z v20 h-30 z h-30 v-20 z v-20 h30 z" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="60" height="40" fill="#012169" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="8" />
        <path d="M0,0 L60,40 M60,0 L0,40" clipPath={`url(#${diagId})`} stroke="#C8102E" strokeWidth="5.33" />
        <path d="M30,0 v40 M0,20 h60" stroke="#FFFFFF" strokeWidth="13.33" />
        <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="8" />
      </g>
    </svg>
  );
}

export function VnFlag({ className = '' }) {
  const clipId = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 40"
      className={`language-flag ${className}`.trim()}
      aria-hidden="true"
      focusable="false"
    >
      <clipPath id={clipId}>
        <rect width="60" height="40" rx="4" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="60" height="40" fill="#DA251D" />
        <polygon
          fill="#FFFF00"
          points="30,8 32.7,16.3 41.42,16.3 34.36,21.42 37.06,29.7 30,24.58 22.94,29.7 25.64,21.42 18.58,16.3 27.3,16.3"
        />
      </g>
    </svg>
  );
}

export function LanguageSwitcher({ compact = false, className = '' }) {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage?.startsWith('vi') ? 'vi' : 'en';
  const changeLanguage = (next) => {
    if (next !== language) i18n.changeLanguage(next);
  };

  return (
    <div
      className={`language-switcher ${compact ? 'is-compact' : ''} ${className}`.trim()}
      role="group"
      aria-label={language === 'vi' ? 'Chọn ngôn ngữ giao diện' : 'Choose interface language'}
    >
      <button
        type="button"
        className={`secondary ${language === 'en' ? 'is-active' : ''}`}
        aria-pressed={language === 'en'}
        onClick={() => changeLanguage('en')}
        title="English"
        style={language === 'en' ? {
          background: 'linear-gradient(135deg, #ff7a00 0%, #ea580c 100%)',
          color: '#ffffff',
          borderColor: 'transparent',
          boxShadow: '0 4px 10px rgba(234, 88, 12, 0.28)',
          cursor: 'default',
        } : undefined}
      >
        <UkFlag />
        <b>EN</b>
      </button>
      <button
        type="button"
        className={`secondary ${language === 'vi' ? 'is-active' : ''}`}
        aria-pressed={language === 'vi'}
        onClick={() => changeLanguage('vi')}
        title="Tiếng Việt"
        style={language === 'vi' ? {
          background: 'linear-gradient(135deg, #ff7a00 0%, #ea580c 100%)',
          color: '#ffffff',
          borderColor: 'transparent',
          boxShadow: '0 4px 10px rgba(234, 88, 12, 0.28)',
          cursor: 'default',
        } : undefined}
      >
        <VnFlag />
        <b>VI</b>
      </button>
    </div>
  );
}

export default LanguageSwitcher;
