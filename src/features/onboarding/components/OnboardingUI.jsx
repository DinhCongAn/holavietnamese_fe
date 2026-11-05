import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, Check, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BuffaloMascot } from '@/shared/components/mascot';
import { useOnboarding } from '../context/OnboardingContext';
import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { LanguageSwitcher } from '@/shared/components/common/LanguageSwitcher';

const steps = [
  '/onboarding/reason', '/onboarding/level', '/onboarding/benefits',
  '/onboarding/daily-goal', '/onboarding/learning-path',
];

export function Brand({ light = false, compact = false, className = '' }) {
  return (
    <Link
      to="/"
      className={`ob-brand site-brand ${light ? 'is-light' : ''} ${compact ? 'is-compact' : ''} ${className}`.trim()}
      aria-label="HolaVietnamese"
    >
      <img
        src="/design/hola-vietnamese-logo.png"
        alt="Hola Vietnamese"
        className="ob-brand-logo site-brand__logo"
      />
      <img
        src="/design/hola-vietnamese-icon.png"
        alt="Hola Vietnamese"
        className="ob-brand-icon site-brand__icon"
      />
    </Link>
  );
}

export function Mascot({ message, compact = false, celebration = false }) {
  return (
    <div className={`ob-mascot-wrap ${compact ? 'is-compact' : ''} ${celebration ? 'is-celebrating' : ''}`}>
      {message && <div className="ob-speech">{message}</div>}
      <BuffaloMascot
        variant={celebration ? 'happy' : compact ? 'teaching' : 'welcome'}
        size={compact ? 'medium' : 'large'}
        animated
        className="ob-mascot"
        accessibilityLabel="Nghé, the HolaVietnamese water buffalo mascot"
      />
    </div>
  );
}

export function OnboardingLayout({ children, title, eyebrow, mascotMessage, wide = false, hideProgress = false, backTo, progressStep }) {
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const { reset } = useOnboarding();
  const stepIndex = steps.indexOf(location.pathname);
  const currentStep = progressStep ?? Math.max(stepIndex + 1, 1);
  const previous = backTo || (stepIndex > 0 ? steps[stepIndex - 1] : '/welcome');

  const restart = () => {
    if (window.confirm(bilingualLabel('Bắt đầu lại? Tiến trình khảo sát hiện tại của bạn sẽ bị xóa.', 'Start over? Your current onboarding progress will be cleared.'))) {
      reset();
      navigate('/welcome');
    }
  };

  return (
    <div className="ob-shell">
      <header className="ob-topbar">
        <Brand />
        {!hideProgress && (
          <div className="ob-progress-block" aria-label={bilingualLabel(`Bước ${stepIndex + 1} / ${steps.length}`, `Onboarding step ${stepIndex + 1} of ${steps.length}`)}>
            <div className="ob-progress-track">
              <motion.span
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            <small>
              <BilingualText
                vi={`Bước ${Math.max(stepIndex + 1, 1)} / ${steps.length}`}
                en={`${Math.max(stepIndex + 1, 1)} of ${steps.length}`}
              />
            </small>
          </div>
        )}
        <div className="ob-topbar-actions">
          <LanguageSwitcher compact />
          <button className="ob-reset" type="button" onClick={restart}>
            <RotateCcw size={15} />
            <span><BilingualText vi="Bắt đầu lại" en="Start over" /></span>
          </button>
        </div>
      </header>
      <main className={`ob-main ${wide ? 'is-wide' : ''}`}>
        {!hideProgress && (
          <button className="ob-back" type="button" onClick={() => navigate(previous)}>
            <ArrowLeft size={17} />
            <span><BilingualText vi="Quay lại" en="Back" /></span>
          </button>
        )}
        <AnimatePresence mode="wait">
          <motion.section
            key={location.pathname}
            className="ob-page"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {(eyebrow || title) && (
              <div className="ob-heading">
                <div>
                  <span className="ob-eyebrow">{eyebrow}</span>
                  <h1>{title}</h1>
                </div>
                {mascotMessage && <Mascot compact message={mascotMessage} />}
              </div>
            )}
            {children}
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}

export function SelectionCard({
  selected,
  disabled = false,
  onClick,
  icon: Icon,
  title,
  titleVi,
  detail,
  detailVi,
  badge,
  badgeVi,
  style,
  color,
  bg,
}) {
  return (
    <motion.button
      type="button"
      className={`ob-selection answer-card ${selected ? 'is-selected selected' : ''}`}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      aria-pressed={selected}
      aria-selected={selected}
      data-state={selected ? 'checked' : 'unchecked'}
      style={{ backgroundColor: '#ffffff', ...style }}
    >
      <span
        className="ob-selection-icon"
        style={color ? { color, backgroundColor: bg || `${color}18` } : undefined}
      >
        {Icon ? <Icon size={24} /> : null}
      </span>
      <span className="ob-selection-copy">
        <strong><BilingualText vi={titleVi || title} en={title} /></strong>
        {detail && <small><BilingualText vi={detailVi || detail} en={detail} /></small>}
      </span>
      {badge && <em><BilingualText vi={badgeVi || badge} en={badge} /></em>}
      <span className="ob-check">
        <Check size={16} strokeWidth={2.8} color={selected ? "#FFFFFF" : "transparent"} />
      </span>
    </motion.button>
  );
}

export function PrimaryButton({
  children = <BilingualText vi="TIẾP TỤC" en="CONTINUE" />,
  disabled,
  onClick,
  type = 'button',
  className = '',
}) {
  return (
    <motion.button
      type={type}
      className={`ob-primary ${className}`}
      disabled={disabled}
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
    >
      <span className="ob-primary-text">{children}</span>
      <span className="ob-primary-arrow" aria-hidden="true">→</span>
    </motion.button>
  );
}

export function LessonHeader({ current, total, onExit, sound, onSound }) {
  return (
    <header className="ob-lesson-header">
      <div className="flex items-center gap-2.5 shrink-0">
        <button type="button" onClick={onExit} aria-label={bilingualLabel("Thoát bài học", "Exit lesson")}>
          <X size={20} />
        </button>
        <Brand compact className="ob-lesson-brand" />
      </div>
      <div className="ob-lesson-progress">
        <motion.span
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      <div className="ob-lesson-actions">
        <LanguageSwitcher compact />
        <button
          type="button"
          onClick={onSound}
          aria-label={sound ? bilingualLabel('Tắt âm', 'Mute sound') : bilingualLabel('Bật âm', 'Turn on sound')}
        >
          {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
        </button>
      </div>
    </header>
  );
}

export function Confetti() {
  return (
    <div className="ob-confetti" aria-hidden="true">
      {Array.from({ length: 24 }, (_, index) => (
        <i key={index} style={{ '--i': index }} />
      ))}
    </div>
  );
}
