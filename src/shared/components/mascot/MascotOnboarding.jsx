import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  Compass,
  Layers,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BuffaloMascot } from '@/shared/components/mascot/BuffaloMascot';
import { BilingualText } from '@/shared/components/common/BilingualText';

const STORAGE_KEY = 'hola-nghe-guide-completed';

const STEP_EXTRAS = [
  {
    icon: Compass,
    badgeVi: 'Khởi đầu tự tin',
    badgeEn: 'Confident start',
    tipVi: 'Khám phá giao diện học tập trực quan và lộ trình cá nhân hóa.',
    tipEn: 'Explore the intuitive learning dashboard and personalized path.',
    mascotTagVi: 'Chào mừng bạn!',
    mascotTagEn: 'Welcome aboard!',
  },
  {
    icon: BookOpen,
    badgeVi: 'Lộ trình CEFR A1–C2',
    badgeEn: 'CEFR A1–C2 Roadmap',
    tipVi: 'Bài học 5–10 phút chia theo từng cấp độ và tình huống giao tiếp.',
    tipEn: 'Bite-sized 5–10 min lessons organized by level and realistic contexts.',
    mascotTagVi: 'Lộ trình chuẩn',
    mascotTagEn: 'Standard path',
  },
  {
    icon: Volume2,
    badgeVi: 'Luyện 6 thanh điệu',
    badgeEn: 'Master 6 tones',
    tipVi: 'Luyện nghe và phát âm chuẩn với đường cao độ thanh điệu trực quan.',
    tipEn: 'Train your ear and pronunciation with interactive pitch curve graphs.',
    mascotTagVi: 'Chuẩn phát âm',
    mascotTagEn: 'Clear tones',
  },
  {
    icon: Layers,
    badgeVi: 'Ghi nhớ dài hạn',
    badgeEn: 'Spaced repetition',
    tipVi: 'Sổ từ vựng thông minh nhắc nhở bạn ôn tập đúng thời điểm vàng.',
    tipEn: 'Smart vocabulary notebook prompts you to review at the optimal time.',
    mascotTagVi: 'Nhớ từ vựng',
    mascotTagEn: 'Retain words',
  },
  {
    icon: Bot,
    badgeVi: 'Gia sư AI 24/7',
    badgeEn: '24/7 AI Speaking Partner',
    tipVi: 'Luyện hội thoại tương tác không sợ sai, nhận phản hồi ngữ điệu tức thì.',
    tipEn: 'Practice conversations with zero pressure and get instant feedback.',
    mascotTagVi: 'Luyện nói cùng AI',
    mascotTagEn: 'Speak with AI',
  },
];

export function MascotOnboarding() {
  const { t } = useTranslation('learner');
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);
  const steps = t('mascot.guide.steps', { returnObjects: true });

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) !== '1') {
      setOpen(true);
    }
  }, []);

  const close = () => {
    window.localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight' && Array.isArray(steps) && step < steps.length - 1) {
        setStep((s) => s + 1);
      }
      if (e.key === 'ArrowLeft' && step > 0) {
        setStep((s) => s - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, step, steps]);

  if (dismissed) return null;

  const totalSteps = Array.isArray(steps) ? steps.length : 5;

  return (
    <>
      {/* 1. Floating Replay Widget - Clean, elegant, cream background matching user original design */}
      {!open && (
        <aside
          role="complementary"
          aria-label={t('mascot.guide.replay', 'Xem lại hướng dẫn của Nghé')}
          className="nghe-guide-replay-container group !bg-[#FFFDF9] !border-[#F0DFCF] !rounded-[22px] !shadow-[0_8px_24px_-4px_rgba(69,31,20,0.12),0_2px_6px_rgba(69,31,20,0.04)] hover:!border-[#F97316]/60 hover:!shadow-[0_12px_28px_-4px_rgba(69,31,20,0.18)] transition-all duration-200"
          style={{
            position: 'fixed',
            zIndex: 75,
            right: 'clamp(16px, 3vw, 32px)',
            bottom: 'calc(clamp(16px, 3vw, 32px) + 52px + 12px)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px 5px 8px',
            backgroundColor: '#FFFDF9',
            border: '1px solid #F0DFCF',
            borderRadius: '22px',
          }}
        >
          {/* Clickable Area */}
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setOpen(true);
            }}
            title={t('mascot.guide.replay', 'Xem lại hướng dẫn của Nghé')}
            className="nghe-guide-replay !bg-transparent !border-0 !p-0 !min-h-0 !shadow-none flex items-center gap-2 cursor-pointer text-left focus:outline-none"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
              minHeight: 'unset',
              boxShadow: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {/* Mascot Nghé - Full body, unclipped */}
            <div className="flex items-center justify-center shrink-0">
              <BuffaloMascot variant="welcome" size="tiny" animated />
            </div>

            {/* Label */}
            <span
              className="text-[13px] font-bold text-[#253044] tracking-tight group-hover:text-[#EA580C] transition-colors whitespace-nowrap"
              style={{ color: '#253044', fontSize: '13px', fontWeight: 700 }}
            >
              {t('mascot.guide.replay', 'Xem lại hướng dẫn của Nghé')}
            </span>
          </button>

          {/* Dismiss button (X) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            aria-label={t('mascot.guide.skip', 'Đóng')}
            title={t('mascot.guide.skip', 'Đóng')}
            className="nghe-guide-replay__dismiss !bg-transparent !border-0 !p-1 !min-h-0 !shadow-none rounded-full text-[#94A3B8] hover:text-[#253044] hover:!bg-[#F0E6D8] transition-colors cursor-pointer flex items-center justify-center ml-0.5"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: '3px',
              minHeight: 'unset',
              width: '22px',
              height: '22px',
              boxShadow: 'none',
              color: '#94A3B8',
              borderRadius: '50%',
            }}
          >
            <X size={13} strokeWidth={2.4} />
          </button>
        </aside>
      )}

      {/* 2. Onboarding Guide Modal */}
      <AnimatePresence>
        {open && Array.isArray(steps) && steps[step] && (
          <div
            className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nghe-guide-title"
          >
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[660px] overflow-hidden rounded-[26px] border border-[#FED7AA] bg-white shadow-[0_25px_60px_-12px_rgba(37,48,68,0.22),0_8px_24px_rgba(234,88,12,0.1)] text-left"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#FED7AA' }}
            >
              {/* Top Accent Gradient Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#F59E0B]" />

              {/* Close Button (X) */}
              <button
                type="button"
                onClick={close}
                aria-label={t('mascot.guide.skip', 'Bỏ qua')}
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#E8E5DF] bg-[#FAF8F5] text-[#64748B] hover:border-[#FED7AA] hover:bg-[#FFF7ED] hover:text-[#EA580C] transition-colors focus:outline-none"
                style={{
                  backgroundColor: '#FAF8F5',
                  borderColor: '#E8E5DF',
                  minHeight: 'unset',
                  width: '32px',
                  height: '32px',
                  padding: 0,
                }}
              >
                <X size={16} strokeWidth={2.2} />
              </button>

              {/* Card Body */}
              <div className="grid grid-cols-1 sm:grid-cols-[190px_1fr] gap-6 p-6 sm:p-7 items-center">
                {/* Left: Mascot Hero Box */}
                <div
                  className="flex flex-col items-center justify-center rounded-2xl border border-[#FED7AA]/60 bg-gradient-to-b from-[#FFF7ED] via-[#FFFBF5] to-white p-4 text-center shadow-inner"
                  style={{ backgroundColor: '#FFFBF5', borderColor: '#FED7AA' }}
                >
                  <div className="h-[135px] flex items-center justify-center">
                    <BuffaloMascot
                      variant={steps[step].variant || 'teaching'}
                      size="large"
                      animated
                    />
                  </div>
                  <span
                    className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#FED7AA] bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#EA580C] shadow-xs"
                    style={{ backgroundColor: '#ffffff', borderColor: '#FED7AA', color: '#EA580C' }}
                  >
                    <Sparkles size={11} />
                    <BilingualText
                      vi={STEP_EXTRAS[step]?.mascotTagVi || 'Gia sư Nghé'}
                      en={STEP_EXTRAS[step]?.mascotTagEn || 'Nghé Tutor'}
                    />
                  </span>
                </div>

                {/* Right: Step Content Stack */}
                <div className="flex flex-col min-w-0">
                  {/* Step Progress & Indicators */}
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-2.5 py-0.5 text-xs font-bold text-[#EA580C]"
                      style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA', color: '#EA580C' }}
                    >
                      {t('mascot.guide.progress', { current: step + 1, total: totalSteps })}
                    </span>

                    {/* 5 Segmented Progress Bars */}
                    <div className="flex items-center gap-1.5" aria-hidden="true">
                      {Array.from({ length: totalSteps }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            idx === step
                              ? 'w-6 bg-[#EA580C]'
                              : idx < step
                              ? 'w-3 bg-[#FED7AA]'
                              : 'w-3 bg-[#E8E5DF]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <h2
                    id="nghe-guide-title"
                    className="mt-2.5 text-xl sm:text-2xl font-black tracking-tight text-[#253044]"
                    style={{ color: '#253044' }}
                  >
                    {steps[step].title}
                  </h2>

                  {/* Description */}
                  <p
                    className="mt-1.5 text-sm leading-relaxed text-[#5F6D7E]"
                    style={{ color: '#5F6D7E' }}
                  >
                    {steps[step].text}
                  </p>

                  {/* Extra Feature Tip Box */}
                  {STEP_EXTRAS[step] && (
                    <div
                      className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-[#FED7AA]/60 bg-[#FFFDF9] p-3 text-xs"
                      style={{ backgroundColor: '#FFFDF9', borderColor: '#FED7AA' }}
                    >
                      {(() => {
                        const StepIcon = STEP_EXTRAS[step].icon;
                        return (
                          <div
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[#FED7AA] bg-[#FFF7ED] text-[#EA580C]"
                            style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA', color: '#EA580C' }}
                          >
                            <StepIcon size={13} strokeWidth={2.2} />
                          </div>
                        );
                      })()}
                      <div className="min-w-0 flex-1">
                        <strong className="block font-bold text-[#253044]" style={{ color: '#253044' }}>
                          <BilingualText
                            vi={STEP_EXTRAS[step].badgeVi}
                            en={STEP_EXTRAS[step].badgeEn}
                          />
                        </strong>
                        <span className="text-[11.5px] leading-relaxed text-[#64748B]" style={{ color: '#64748B' }}>
                          <BilingualText
                            vi={STEP_EXTRAS[step].tipVi}
                            en={STEP_EXTRAS[step].tipEn}
                          />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-[#F0ECE4]">
                    <button
                      type="button"
                      onClick={close}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#828F9E] hover:text-[#253044] rounded-lg transition-colors focus:outline-none"
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#828F9E',
                        minHeight: 'unset',
                        boxShadow: 'none',
                      }}
                    >
                      {t('mascot.guide.skip', 'Bỏ qua')}
                    </button>

                    <div className="flex items-center gap-2">
                      {step > 0 && (
                        <button
                          type="button"
                          onClick={() => setStep((s) => s - 1)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E5DF] bg-white px-3.5 py-2 text-xs font-bold text-[#475569] hover:bg-[#FAF8F5] hover:border-[#CBD5E1] transition-all focus:outline-none active:scale-[0.98]"
                          style={{
                            backgroundColor: '#ffffff',
                            borderColor: '#E8E5DF',
                            color: '#475569',
                            minHeight: 'unset',
                          }}
                        >
                          <ArrowLeft size={14} strokeWidth={2.2} />
                          {t('mascot.guide.back', 'Quay lại')}
                        </button>
                      )}

                      {step < totalSteps - 1 ? (
                        <button
                          type="button"
                          onClick={() => setStep((s) => s + 1)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F97316] px-4 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(234,88,12,0.3)] hover:from-[#C2410C] hover:to-[#EA580C] hover:shadow-[0_6px_18px_rgba(234,88,12,0.4)] transition-all focus:outline-none active:scale-[0.98]"
                          style={{
                            backgroundColor: '#EA580C',
                            color: '#ffffff',
                            border: 'none',
                            minHeight: 'unset',
                          }}
                        >
                          {t('mascot.guide.next', 'Tiếp theo')}
                          <ArrowRight size={14} strokeWidth={2.2} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={close}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F97316] px-4 py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(234,88,12,0.3)] hover:from-[#C2410C] hover:to-[#EA580C] hover:shadow-[0_6px_18px_rgba(234,88,12,0.4)] transition-all focus:outline-none active:scale-[0.98]"
                          style={{
                            backgroundColor: '#EA580C',
                            color: '#ffffff',
                            border: 'none',
                            minHeight: 'unset',
                          }}
                        >
                          <Sparkles size={14} strokeWidth={2.2} />
                          {t('mascot.guide.finish', 'Bắt đầu học')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MascotOnboarding;
