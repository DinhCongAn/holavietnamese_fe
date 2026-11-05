import { BilingualText } from '@/shared/components/common/BilingualText';
﻿import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Volume2, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import { speakVietnamese } from '@/utils/speech';

/**
 * 3D Hero Console "Tiếp Tục Bài Học"
 */
export function ContinueLessonConsole({ currentLesson }) {
  const courseTitle = currentLesson?.courseTitle || 'Tiếng Việt Sơ Cấp A1';
  const lessonTitle = currentLesson?.titleVi || currentLesson?.title || 'Gọi Cà Phê & Nhận Diện Dấu Thanh';
  const progressPercent = currentLesson?.progressPercent || 60;

  return (
    <motion.section
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-3xl bg-white/92 backdrop-blur-xs border border-[#E8E5DF]/70 p-6 sm:p-8 shadow-[0_8px_30px_rgb(67,25,20,0.04)] space-y-6 text-left"
    >
      {/* Subtle Heritage Dong Son Watermark Inlay */}
      <div
        className="pointer-events-none absolute -right-16 -bottom-16 w-64 h-64 select-none opacity-[0.06]"
        style={{
          backgroundImage: `url('/design/dong-son-drum.webp')`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
        }}
        aria-hidden="true"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#24382B] text-[#FFF7E8] text-[10px] font-black uppercase tracking-wider">
              <BilingualText vi={currentLesson?.courseTitle || 'Tiếng Việt Sơ Cấp A1'} en={currentLesson?.courseTitleEn || currentLesson?.courseTitle || 'Elementary Vietnamese A1'} />
            </span>
            <span className="text-[11px] font-bold text-[#EA580C]">
              <BilingualText vi="Chương 1 • Bài 3" en="Chapter 1 • Lesson 3" />
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#253044] leading-snug">
            <BilingualText vi={currentLesson?.titleVi || currentLesson?.title || 'Gọi Cà Phê & Nhận Diện Dấu Thanh'} en={currentLesson?.titleEn || currentLesson?.title || 'Ordering Coffee & Recognizing Tones'} />
          </h2>
        </div>

        <button
          type="button"
          onClick={() => speakVietnamese('Cho tôi một ly cà phê sữa đá ít đường nhé')}
          className="!min-h-0 !min-w-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0DC] text-[#EA580C] hover:bg-[#FDE1B3] active:bg-[#FCD8A2] border border-[#EA580C]/30 transition-all text-xs font-bold shrink-0 cursor-pointer"
        >
          <Volume2 className="w-4 h-4 shrink-0" strokeWidth={2.2} />
          <span><BilingualText vi="Nghe câu mẫu" en="Listen to audio" /></span>
        </button>
      </div>

      {/* Focal Sentence Card */}
      <div className="p-3.5 rounded-2xl bg-[#FFFCF7] border border-[#E8E5DF]/50 flex items-center justify-between text-xs sm:text-sm">
        <p className="text-[#253044] font-medium italic">
          “Cho tôi một ly cà phê sữa đá ít đường nhé!”
        </p>
        <span className="text-[11px] text-[#64748B] shrink-0 ml-2">
          Iced milk coffee with less sugar
        </span>
      </div>

      {/* Progress Bar with Milestones */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-[#64748B] font-semibold">
          <span><BilingualText vi="Tiến độ bài học:" en="Lesson progress:" /> <strong>{progressPercent}%</strong></span>
          <span><BilingualText vi="Còn 2 câu hỏi để hoàn thành" en="2 questions left to complete" /></span>
        </div>
        <div className="w-full bg-[#EEE3D1] h-3 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-[#EA580C] h-full rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3 Stations Preview Ribbon */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="truncate font-semibold"><BilingualText vi="1. Flashcard Phở" en="1. Phở Flashcard" /></span>
        </div>
        <div className="p-2.5 rounded-xl bg-[#FFF7E8] border-2 border-[#EA580C] text-[#EA580C] text-xs flex items-center gap-2 shadow-xs">
          <Play size={14} fill="currentColor" className="shrink-0" />
          <span className="truncate font-bold"><BilingualText vi="2. Ghép Cà Phê" en="2. Match Cà Phê" /></span>
        </div>
        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-400 text-xs flex items-center gap-2">
          <span>🔒</span>
          <span className="truncate font-semibold"><BilingualText vi="3. Thử Thanh Điệu" en="3. Try Tones" /></span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#E8E5DF]/40">
        <Link
          to="/edtech/lesson"
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-sm shadow-[0_4px_0_#C2410C] active:translate-y-1 active:shadow-none transition-all hover:scale-102"
        >
          <Play size={16} fill="currentColor" />
          <span><BilingualText vi="HỌC TIẾP NGAY (5 PHÚT)" en="CONTINUE NOW (5 MINS)" /></span>
          <ArrowRight size={16} />
        </Link>
        <Link to="/courses" className="text-xs font-bold text-[#EA580C] hover:underline">
          <BilingualText vi="Xem toàn bộ giáo trình →" en="View full curriculum →" />
        </Link>
      </div>
    </motion.section>
  );
}

export default ContinueLessonConsole;
