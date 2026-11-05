import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, RotateCcw, Check, CheckCircle2 } from 'lucide-react';
import { audioFeedback } from '@/utils/audioFeedback';
import { speakVietnamese } from '@/utils/speech';
import { useTranslation } from 'react-i18next';

/**
 * 10-Second Hands-on Mini Lesson Widget (Order Iced Milk Coffee)
 */
export function HeroInteractiveWidget() {
  const navigate = useNavigate();
  const { t } = useTranslation('home');
  const exercises = [
    { prompt: 'I would like an iced milk coffee please', phrase: 'Cho tôi một ly cà phê sữa đá', target: ['Cho', 'tôi', 'một ly', 'cà phê sữa đá'], bank: ['cà phê sữa đá', 'Cho', 'bát phở', 'tôi', 'một ly'] },
    { prompt: 'Thank you very much', phrase: 'Cảm ơn bạn rất nhiều', target: ['Cảm ơn', 'bạn', 'rất nhiều'], bank: ['rất nhiều', 'Xin chào', 'Cảm ơn', 'bạn'] },
  ];
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const exercise = exercises[exerciseIndex];
  const targetWords = exercise.target;
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [availableTokens, setAvailableTokens] = useState(exercises[0].bank);
  const [status, setStatus] = useState('idle');

  const handleSelectToken = (token) => {
    if (status === 'correct') return;
    audioFeedback.playTap();
    setSelectedTokens((prev) => [...prev, token]);
    setAvailableTokens((prev) => {
      const idx = prev.indexOf(token);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
    setStatus('idle');
  };

  const handleRemoveToken = (token) => {
    if (status === 'correct') return;
    audioFeedback.playTap();
    setSelectedTokens((prev) => {
      const idx = prev.indexOf(token);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
    setAvailableTokens((prev) => [...prev, token]);
    setStatus('idle');
  };

  const handleCheck = () => {
    const isCorrect =
      selectedTokens.length === targetWords.length &&
      selectedTokens.every((val, idx) => val === targetWords[idx]);

    if (isCorrect) {
      audioFeedback.playSuccessChime();
      setStatus('correct');
      speakVietnamese(exercise.phrase);
    } else {
      audioFeedback.playErrorSound();
      setStatus('incorrect');
    }
  };

  const handleReset = () => {
    setSelectedTokens([]);
    setAvailableTokens(exercise.bank);
    setStatus('idle');
  };

  const handleContinue = () => {
    if (exerciseIndex === exercises.length - 1) {
      navigate('/welcome');
      return;
    }
    const nextIndex = exerciseIndex + 1;
    setExerciseIndex(nextIndex);
    setSelectedTokens([]);
    setAvailableTokens(exercises[nextIndex].bank);
    setStatus('idle');
  };

  return (
    <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl border border-[#E8E5DF]/80 shadow-[0_20px_50px_rgba(67,25,20,0.08)] p-6 sm:p-7 space-y-4 text-left transition-all">
      {/* Top Header Tag with Dual Speed Controls */}
      <div className="flex items-center justify-between border-b border-[#E8E5DF]/40 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" />
          <span className="text-[11px] font-black uppercase tracking-wider text-[#EA580C]">
            {t('widget.badge')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => speakVietnamese(exercise.phrase, 0.9)}
            className="!min-h-0 !min-w-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF0DC] hover:bg-[#FDE1B3] active:bg-[#FCD8A2] text-[#EA580C] border border-[#EA580C]/30 transition-all text-[11px] font-bold shadow-2xs cursor-pointer"
            title={t('widget.normalAudio')}
            aria-label={t('widget.normalAudio')}
          >
            <Volume2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
            <span>1.0x</span>
          </button>
          <button
            type="button"
            onClick={() => speakVietnamese(exercise.phrase, 0.6)}
            className="!min-h-0 !min-w-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFCF7] hover:bg-[#E8E5DF] text-[#64748B] hover:text-[#253044] transition-all text-[11px] font-bold border border-[#E8E5DF]/60 cursor-pointer"
            title={t('widget.slowAudio')}
            aria-label={t('widget.slowAudio')}
          >
            <Volume2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} /><span>0.6x</span>
          </button>
        </div>
      </div>

      {/* Target prompt */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
          {t('widget.translate')}
        </p>
        <p className="text-base sm:text-lg font-black text-[#253044] mt-0.5">
          “{exercise.prompt}”
        </p>
      </div>

      {/* Answer Drop Slot */}
      <div className="min-h-[58px] p-2.5 rounded-2xl bg-[#FFFCF7] border-2 border-dashed border-[#E8E5DF] flex flex-wrap items-center gap-2">
        {selectedTokens.length === 0 ? (
          <span className="text-xs text-[#64748B]/60 italic select-none pl-1">
            {t('widget.empty')}
          </span>
        ) : (
          selectedTokens.map((token, idx) => (
            <motion.button
              layout
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={`${token}-${idx}`}
              type="button"
              onClick={() => handleRemoveToken(token)}
              className="px-3.5 py-1.5 rounded-xl bg-white border-2 border-[#EA580C] text-[#EA580C] font-black text-xs shadow-[0_2px_0_#EA580C] hover:bg-[#FFF0DC] active:translate-y-0.5 transition-all"
            >
              {token}
            </motion.button>
          ))
        )}
      </div>

      {/* Available Word Bank Tokens */}
      <div className="flex flex-wrap gap-2 pt-1">
        {availableTokens.map((token, idx) => (
          <motion.button
            layout
            key={`${token}-${idx}`}
            type="button"
            onClick={() => handleSelectToken(token)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF7E8] border border-[#E8E5DF] hover:border-[#EA580C] text-[#253044] font-bold text-xs shadow-[0_2px_0_#E8E5DF] hover:shadow-[0_2px_0_#EA580C] active:translate-y-0.5 transition-all"
          >
            {token}
          </motion.button>
        ))}
      </div>

      {/* Feedback Alert */}
      <AnimatePresence>
        {status === 'correct' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="font-bold">{t('widget.correct')}</span>
            </div>
            <span className="font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg shrink-0">
              +15 XP
            </span>
          </motion.div>
        )}

        {status === 'incorrect' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between"
            role="alert"
          >
            <span>{t('widget.answer', { answer: targetWords.join(' + ') })}</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold underline text-red-700 ml-2"
            >
              {t('widget.retry')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="!min-h-0 !min-w-0 p-2.5 rounded-xl text-[#64748B] hover:text-[#253044] hover:bg-[#FFF7E8] transition-colors shrink-0 cursor-pointer"
          title={t('widget.reset')}
          aria-label={t('widget.reset')}
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
        </button>

        <button
          type="button"
          disabled={selectedTokens.length === 0}
          onClick={status === 'correct' ? handleContinue : handleCheck}
          className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
            status === 'correct'
              ? 'bg-emerald-600 text-white shadow-[0_4px_0_#047857]'
              : selectedTokens.length > 0
              ? 'bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-[0_4px_0_#C2410C] active:translate-y-1 active:shadow-none'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
          }`}
        >
          {status === 'correct' ? (
            <>
              <Check size={16} />
              <span>{exerciseIndex === exercises.length - 1 ? t('widget.fullLesson') : t('widget.next')}</span>
            </>
          ) : (
            <span>{t('widget.check')}</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default HeroInteractiveWidget;
