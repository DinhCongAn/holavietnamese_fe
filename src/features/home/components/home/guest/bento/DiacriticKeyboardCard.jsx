import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
﻿import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Keyboard, Delete, Volume2 } from 'lucide-react';
import { audioFeedback } from '@/utils/audioFeedback';
import { speakVietnamese } from '@/utils/speech';
import { DIACRITIC_CHARS, SAMPLE_PRESET_WORDS } from '@/features/home/components/home/data/homeData';

/**
 * Bento 3: Virtual Diacritic Keyboard Notepad Card
 */
export function DiacriticKeyboardCard() {
  const [typedText, setTypedText] = useState('Phở bò');

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="w-full bg-white/92 backdrop-blur-xs border border-[#E8E5DF]/70 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(67,25,20,0.04)] flex flex-col justify-between space-y-4 text-left"
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-[#EA580C]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">
              <BilingualText vi="Trợ lý gõ dấu ảo" en="Virtual Diacritic Assistant" />
            </span>
          </div>
          <span className="text-[10px] font-semibold text-[#64748B]"><BilingualText vi="Không cần Unikey" en="No Unikey required" /></span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-[#253044]">
          <BilingualText vi="Bàn phím gõ dấu 1-chạm tương tác" en="One-touch Interactive Diacritic Keyboard" />
        </h3>
        <p className="text-xs text-[#64748B]">
          <BilingualText vi="Bấm phím để chèn dấu tiếng Việt và phát âm ngay lập tức:" en="Press keys to insert Vietnamese accents and pronounce immediately:" />
        </p>
      </div>

      {/* Interactive Notepad Display */}
      <div className="p-3 rounded-2xl bg-[#FFFCF7] border border-[#E8E5DF] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold uppercase text-[#64748B]"><BilingualText vi="Khung gõ thử:" en="Practice typing:" /></span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTypedText((prev) => prev.slice(0, -1));
                audioFeedback.playTap();
              }}
              className="text-[11px] text-[#64748B] hover:text-[#EA580C] font-bold flex items-center gap-0.5 cursor-pointer"
              title={bilingualLabel("Xóa ký tự cuối", "Delete last character")}
            >
              <Delete size={12} />
              <span><BilingualText vi="Xóa" en="Delete" /></span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTypedText('');
                audioFeedback.playTap();
              }}
              className="text-[11px] text-[#64748B] hover:text-[#EA580C] font-bold cursor-pointer"
            >
              <BilingualText vi="Làm trống" en="Clear" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-[#E8E5DF]/60">
          <span className="font-black text-[#253044] text-base truncate">
            {typedText || <span className="text-stone-300 font-normal italic"><BilingualText vi="Bấm phím bên dưới…" en="Press keys below…" /></span>}
          </span>
          <button
            type="button"
            onClick={() => {
              if (typedText) speakVietnamese(typedText);
            }}
            disabled={!typedText}
            className="!min-h-0 !min-w-0 !p-0 w-8 h-8 rounded-lg bg-[#FFF0DC] hover:bg-[#FDE1B3] active:bg-[#FCD8A2] text-[#EA580C] border border-[#EA580C]/30 flex items-center justify-center transition-colors shrink-0 disabled:opacity-40 cursor-pointer"
            title={bilingualLabel("Phát âm từ vừa gõ", "Pronounce typed word")}
            aria-label={bilingualLabel("Phát âm từ vừa gõ", "Pronounce typed word")}
          >
            <Volume2 className="w-4 h-4 shrink-0" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Mechanical Keyboard Keycaps */}
      <div className="grid grid-cols-6 gap-1.5">
        {DIACRITIC_CHARS.map((char) => (
          <button
            key={char}
            type="button"
            onClick={() => {
              setTypedText((prev) => prev + char);
              speakVietnamese(char);
              audioFeedback.playTap();
            }}
            className="py-2 rounded-xl bg-white hover:bg-[#FFF7E8] active:bg-[#FFF0DC] border border-[#E8E5DF] hover:border-[#EA580C] active:border-[#EA580C] font-black text-sm text-[#253044] hover:text-[#EA580C] shadow-[0_2px_0_#E8E5DF] hover:shadow-[0_2px_0_#EA580C] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            {char}
          </button>
        ))}
      </div>

      {/* Preset Words */}
      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
        <span className="text-[10px] text-[#64748B] font-bold shrink-0"><BilingualText vi="Từ mẫu:" en="Sample words:" /></span>
        {SAMPLE_PRESET_WORDS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => {
              setTypedText(w);
              speakVietnamese(w);
              audioFeedback.playTap();
            }}
            className="px-2.5 py-0.5 rounded-lg bg-[#FFF7E8] hover:bg-[#FFF0DC] border border-[#E8E5DF]/80 text-[#253044] text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
          >
            {w}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default DiacriticKeyboardCard;
