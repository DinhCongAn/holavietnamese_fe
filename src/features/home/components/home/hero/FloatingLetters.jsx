import React from 'react';
import { useTextLanguage } from '@/shared/components/common/BilingualText';
import { motion } from 'motion/react';
import { audioFeedback } from '@/utils/audioFeedback';

// Speak utility for native Vietnamese speech synthesis
const speakVietnamese = (text, rate = 0.9) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  }
};

/**
 * Floating 3D Vietnamese Diacritic Letters
 * Ă – Â – Ê – Ô – Ơ – Ư – Đ
 * Features:
 * - 3D clay-pill typography with gradient and specular highlight
 * - Independent float frequencies & subtle tilt
 * - Click & hover sound effects (real Vietnamese pronunciation)
 * - Safe layout positions orbiting the hero card
 */
export function FloatingLetters({ className = '' }) {
  const isVi = useTextLanguage() === 'vi';
  const letters = [
    {
      char: 'Ă',
      name: 'Á trăng khuyết (Short A)',
      sound: 'á',
      pos: 'top-[-16px] left-[10%]',
      color: 'from-[#FF8008] via-[#FF7A00] to-[#C2410C]',
      shadow: 'rgba(218,37,29,0.3)',
      delay: 0,
      duration: 4.2,
      rotate: -6,
    },
    {
      char: 'Â',
      name: 'A đội mũ (Mid central vowel)',
      sound: 'ớ',
      pos: 'top-[8%] right-[-14px]',
      color: 'from-[#FFB86B] via-[#E18700] to-[#B45309]',
      shadow: 'rgba(225,135,0,0.3)',
      delay: 0.6,
      duration: 4.8,
      rotate: 8,
    },
    {
      char: 'Ê',
      name: 'E có mũ (Close-mid front vowel)',
      sound: 'ê',
      pos: 'top-[36%] left-[-22px]',
      color: 'from-[#FF8A65] via-[#E64A19] to-[#BF360C]',
      shadow: 'rgba(230,74,25,0.3)',
      delay: 1.2,
      duration: 5.1,
      rotate: -10,
      hideOnMobile: true,
    },
    {
      char: 'Ô',
      name: 'O có mũ (Close-mid back vowel)',
      sound: 'ô',
      pos: 'top-[52%] right-[-24px]',
      color: 'from-[#FACC15] via-[#EAB308] to-[#CA8A04]',
      shadow: 'rgba(234,179,8,0.35)',
      delay: 0.4,
      duration: 4.6,
      rotate: 12,
    },
    {
      char: 'Ơ',
      name: 'O có râu (Unrounded back vowel)',
      sound: 'ơ',
      pos: 'bottom-[22%] left-[-16px]',
      color: 'from-[#FDBA74] via-[#FF7A00] to-[#EA580C]',
      shadow: 'rgba(255,122,0,0.3)',
      delay: 1.5,
      duration: 5.4,
      rotate: -8,
      hideOnMobile: true,
    },
    {
      char: 'Ư',
      name: 'U có râu (Close back unrounded)',
      sound: 'ư',
      pos: 'bottom-[8%] right-[-10px]',
      color: 'from-[#FDBA74] via-[#F97316] to-[#C2410C]',
      shadow: 'rgba(249,115,22,0.3)',
      delay: 0.9,
      duration: 4.4,
      rotate: 9,
    },
    {
      char: 'Đ',
      name: 'D có gạch (Hard D plosive)',
      sound: 'đờ',
      pos: 'bottom-[-16px] left-[32%]',
      color: 'from-[#FCD34D] via-[#F59E0B] to-[#D97706]',
      shadow: 'rgba(245,158,11,0.35)',
      delay: 1.8,
      duration: 5.0,
      rotate: -5,
      hideOnMobile: true,
    },
  ];

  const handleClick = (item) => {
    audioFeedback.playPopSound(1.3);
    speakVietnamese(item.sound);
  };

  return (
    <div className={`pointer-events-none absolute inset-0 select-none overflow-visible z-20 ${className}`}>
      {letters.map((item) => (
        <motion.button
          key={item.char}
          type="button"
          onClick={() => handleClick(item)}
          initial={{ y: 0, rotate: item.rotate }}
          animate={{
            y: [-6, 6, -6],
            rotate: [item.rotate - 3, item.rotate + 3, item.rotate - 3],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={{
            scale: 1.25,
            rotate: 0,
            transition: { duration: 0.2 },
          }}
          whileTap={{ scale: 0.92 }}
          className={`pointer-events-auto absolute ${item.pos} ${item.hideOnMobile ? 'hidden sm:block' : 'block'} group/letter cursor-pointer`}
          title={isVi ? `Bấm để nghe phát âm chữ: ${item.char} (${item.name})` : `Click to hear letter: ${item.char} (${item.name})`}
          aria-label={isVi ? `Phát âm chữ cái tiếng Việt ${item.char}` : `Pronounce Vietnamese letter ${item.char}`}

        >
          {/* 3D Clay Pill Body */}
          <div
            className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-black text-sm sm:text-lg border-2 border-white/60 transition-transform`}
            style={{
              boxShadow: `0 10px 22px ${item.shadow}, inset 0 2px 4px rgba(255,255,255,0.7), inset 0 -3px 4px rgba(0,0,0,0.25)`,
            }}
          >
            <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] transform-gpu group-hover/letter:scale-110 transition-transform">
              {item.char}
            </span>
          </div>

          {/* Mini Sound Wave Badge on Hover */}
          <span className="absolute -bottom-2 -right-1.5 w-4 h-4 rounded-full bg-white text-[#FF7A00] text-[9px] font-bold flex items-center justify-center shadow-xs opacity-0 group-hover/letter:opacity-100 transition-opacity">
            🔊
          </span>
        </motion.button>
      ))}
    </div>
  );
}
