import { useId } from 'react';
import { useTranslation } from 'react-i18next';

export function UkFlag({ className = '' }) {
  const clipId = useId();
  const diagId = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 30"
      className={`language-flag ${className}`.trim()}
      aria-hidden="true"
      focusable="false"
    >
      <clipPath id={clipId}>
        <rect width="60" height="30" rx="3" />
      </clipPath>
      <clipPath id={diagId}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${diagId})`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export function VnFlag({ className = '' }) {
  const clipId = useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 30 20"
      className={`language-flag ${className}`.trim()}
      aria-hidden="true"
      focusable="false"
    >
      <clipPath id={clipId}>
        <rect width="30" height="20" rx="2" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="30" height="20" fill="#DA251D" />
        <polygon
          fill="#FFFF00"
          points="15,4 16.35,8.15 20.71,8.15 17.18,10.71 18.53,14.85 15,12.29 11.47,14.85 12.82,10.71 9.29,8.15 13.65,8.15"
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
