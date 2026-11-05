import React from 'react';
import { BilingualText, useTextLanguage } from '@/shared/components/common/BilingualText';
import { motion } from 'motion/react';
import { audioFeedback } from '@/utils/audioFeedback';

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
 * Culture3DElements - Contextual 3D cultural badges tailored per slide.
 * Clean, lightweight, floating gently with audio pronunciation on tap.
 */
export function Culture3DElements({ slideIndex = 0 }) {
  const isVi = useTextLanguage() === 'vi';
  // Elements per slide:
  // Slide 0: Nón Lá & Hoa Sen
  // Slide 1: Sóng âm & Micro
  // Slide 2: Phở Bò & Cà Phê Phin
  // Slide 3: Huy hiệu Level & Ngôi sao XP
  // Slide 4: AI Trợ giảng & Trống đồng
  const cultureConfig = [
    // Slide 1 - Welcome to Vietnam
    [
      {
        icon: '🎋',
        label: 'Nón lá',
        sub: 'Conical Hat',
        pos: 'top-6 -left-3 sm:-left-6',
        delay: 0.2,
        pronounce: 'Nón lá',
      },
      {
        icon: '🪷',
        label: 'Hoa sen',
        sub: 'Lotus Flower',
        pos: 'bottom-8 -right-2 sm:-right-5',
        delay: 0.5,
        pronounce: 'Hoa sen',
      },
    ],
    // Slide 2 - Speak with Confidence
    [
      {
        icon: '🎙️',
        label: 'Thu âm chuẩn',
        sub: 'Voice Match',
        pos: 'top-6 -left-3 sm:-left-6',
        delay: 0.2,
        pronounce: 'Thu âm',
      },
      {
        icon: '🌊',
        label: '6 Thanh điệu',
        sub: 'Pitch Waves',
        pos: 'bottom-8 -right-2 sm:-right-5',
        delay: 0.5,
        pronounce: 'Sáu thanh điệu',
      },
    ],
    // Slide 3 - Discover Vietnamese Culture
    [
      {
        icon: '🍜',
        label: 'Phở bò',
        sub: 'Beef Pho',
        pos: 'top-6 -left-3 sm:-left-6',
        delay: 0.2,
        pronounce: 'Phở bò',
      },
      {
        icon: '☕',
        label: 'Cà phê phin',
        sub: 'Filter Coffee',
        pos: 'bottom-8 -right-2 sm:-right-5',
        delay: 0.5,
        pronounce: 'Cà phê phin',
      },
    ],
    // Slide 4 - Learning Journey
    [
      {
        icon: '🏆',
        label: 'Khung CEFR',
        sub: 'A1 → B2',
        pos: 'top-6 -left-3 sm:-left-6',
        delay: 0.2,
        pronounce: 'Lộ trình chuẩn',
      },
      {
        icon: '💎',
        label: '1,500+ XP',
        sub: 'Level Quests',
        pos: 'bottom-8 -right-2 sm:-right-5',
        delay: 0.5,
        pronounce: 'Điểm kinh nghiệm',
      },
    ],
    // Slide 5 - AI Conversation Practice
    [
      {
        icon: '🤖',
        label: 'AI Tutor 24/7',
        sub: isVi ? 'Sửa lỗi tức thì' : 'Instant Feedback',
        pos: 'top-6 -left-3 sm:-left-6',
        delay: 0.2,
        pronounce: 'Gia sư nhân tạo',
      },
      {
        icon: '💬',
        label: 'Phản xạ tự nhiên',
        sub: 'Real Dialogues',
        pos: 'bottom-8 -right-2 sm:-right-5',
        delay: 0.5,
        pronounce: 'Giao tiếp đời thực',
      },
    ],
  ];

  const currentElements = cultureConfig[slideIndex] || cultureConfig[0];

  const handleClick = (item) => {
    audioFeedback.playTap();
    speakVietnamese(item.pronounce);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-24 select-none">
      {currentElements.map((item, idx) => (
        <motion.button
          key={`${slideIndex}-${idx}`}
          type="button"
          onClick={() => handleClick(item)}
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -5, 0],
          }}
          transition={{
            opacity: { duration: 0.4, delay: item.delay },
            scale: { duration: 0.4, delay: item.delay },
            y: {
              duration: 4,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
          className={`pointer-events-auto absolute ${item.pos} px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_12px_28px_rgba(67,25,20,0.1)] flex items-center gap-2 cursor-pointer group/culture`}
          title={isVi ? `Bấm để nghe phát âm "${item.pronounce}"` : `Click to hear pronunciation "${item.pronounce}"`}
          aria-label={isVi ? `Chi tiết văn hóa ${item.label}` : `Cultural item ${item.sub || item.label}`}

        >
          <span className="text-lg group-hover/culture:scale-125 transition-transform">
            {item.icon}
          </span>
          <div className="text-left">
            <span className="block text-xs font-black text-[#253044] leading-tight">
              {item.label}
            </span>
            <span className="block text-[10px] text-[#64748B] font-semibold leading-none">
              {item.sub}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
