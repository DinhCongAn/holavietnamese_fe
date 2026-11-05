import React, { useState } from 'react';
import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { ToneCurveGraph } from './ToneCurveGraph';
import { VIETNAMESE_TONES } from '@/features/home/components/home/data/vietnameseTones';
import { audioFeedback } from '@/utils/audioFeedback';
import { speakVietnamese } from '@/utils/speech';
import { TONE_LIST } from '@/features/home/components/home/data/homeData';

/**
 * Bento 1: Tone Pitch Curves Visualizer Card
 */
export function TonePitchCard() {
  const [activeTone, setActiveTone] = useState('HOI');

  const handlePlayTone = (tId) => {
    setActiveTone(tId);
    audioFeedback.playVietnameseTone(tId);
    const item = TONE_LIST.find((x) => x.id === tId);
    if (item) speakVietnamese(item.word);
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="w-full bg-white/92 backdrop-blur-xs border border-[#E8E5DF]/70 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(67,25,20,0.04)] flex flex-col justify-between space-y-6 text-left"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-[#EDF0E5] text-[#24382B] text-xs font-bold uppercase tracking-wider">
            <BilingualText vi="Đồ thị cao độ • Live Pitch Contour" en="Live Pitch Contour Visualizer" />
          </span>
          <span className="text-[11px] font-bold text-[#EA580C] bg-[#FFF0DC] px-2.5 py-0.5 rounded-full">
            Web Audio API
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-[#253044]">
          <BilingualText vi="Làm chủ 6 thanh điệu tiếng Việt trực quan" en="Master 6 Vietnamese tones visually" />
        </h3>
        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
          <BilingualText vi="Bấm chọn từng thanh để xem đồ thị dao động âm thanh uốn lượn và nghe chuẩn cao độ:" en="Click each tone to see its pitch curve and hear authentic pronunciation:" />
        </p>
      </div>

      {/* Interactive Tone Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {TONE_LIST.map((t) => {
          const isSelected = activeTone === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handlePlayTone(t.id)}
              className={`!min-h-0 !min-w-0 p-3 rounded-2xl border transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                isSelected
                  ? 'bg-[#FFF7E8] border-2 border-[#EA580C] shadow-md scale-105'
                  : 'bg-white hover:bg-[#FFF7E8]/60 border-[#E8E5DF]/70 hover:border-[#EA580C]'
              } active:bg-[#FFF0DC] active:border-[#EA580C]`}
            >
              <span className="text-[10px] font-bold text-[#64748B] uppercase">{t.name}</span>
              <span className="text-lg font-black text-[#253044]">{t.word}</span>
              <span className="text-[10px] text-[#EA580C] font-bold">{t.symbol}</span>
              <Volume2 className="w-3.5 h-3.5 text-[#EA580C] mt-0.5 shrink-0" strokeWidth={2.2} />
            </button>
          );
        })}
      </div>

      {/* Live ToneCurveGraph Component Embedded Directly */}
      <div className="w-full">
        <ToneCurveGraph
          tone={VIETNAMESE_TONES[activeTone]}
          interactive={true}
          onPlay={() => {
            const item = TONE_LIST.find((x) => x.id === activeTone);
            if (item) speakVietnamese(item.word);
          }}
        />
      </div>

      {/* Tone Details Ribbon */}
      <div className="p-3.5 rounded-2xl bg-[#FFFCF7] border border-[#E8E5DF]/70 flex flex-wrap items-center justify-between text-xs text-[#64748B] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
          <span>
            <BilingualText vi="Mẹo nhớ:" en="Memory tip:" /> <strong className="text-[#253044]">{VIETNAMESE_TONES[activeTone]?.mnemonicTip}</strong>
          </span>
        </div>
        <Link
          to="/edtech/vocabulary"
          className="text-[#EA580C] font-bold hover:underline flex items-center gap-1 shrink-0"
        >
          <BilingualText vi="Mở kho so sánh thanh điệu →" en="Open tone contrast library →" />
        </Link>
      </div>
    </motion.div>
  );
}

export default TonePitchCard;
