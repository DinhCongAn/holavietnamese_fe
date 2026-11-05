import React from 'react';
import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { Volume2 } from 'lucide-react';
import { speakVietnamese } from '@/utils/speech';
import { QUICK_SRS_WORDS } from '@/features/home/components/home/data/homeData';

/**
 * Quick 2-Minute Warm-up Spaced Repetition (SRS) Vocabulary Garden
 */
export function VocabularyGardenSRS({
  quickWords = QUICK_SRS_WORDS,
  reviewedWords = {},
  onWaterWord,
  onWaterAll,
}) {
  return (
    <section className="bg-white/92 backdrop-blur-xs border border-[#E8E5DF]/70 rounded-3xl p-6 shadow-[0_8px_30px_rgb(67,25,20,0.04)] space-y-4 text-left" aria-label="Vocabulary warm-up review">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E5DF]/40 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-[#F8E6B7] text-[#253044] flex items-center justify-center font-bold">
            🌱
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#253044]">
              <BilingualText vi="Vườn từ vựng • Khởi động trí nhớ 2 phút" en="Vocabulary Garden • 2-Minute Memory Warm-up" />
            </h3>
            <p className="text-[11px] text-[#64748B]">
              <BilingualText vi="Thuật toán nhắc lại ngắt quãng (SRS): 3 từ vựng này sắp rơi khỏi trí nhớ của bạn!" en="Spaced Repetition (SRS): These 3 words are about to fade from memory!" />
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onWaterAll}
          className="px-4 py-2 rounded-xl bg-[#FFF7E8] hover:bg-[#FFF0DC] border border-[#E8E5DF] text-[#EA580C] font-bold text-xs shrink-0 transition-colors cursor-pointer"
        >
          <BilingualText vi="Tưới nước tất cả (+15 XP) →" en="Water all (+15 XP) →" />
        </button>
      </div>

      {/* 3 Quick Words Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickWords.map((item, idx) => {
          const isWatered = reviewedWords[item.vi];
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 shadow-2xs ${
                isWatered
                  ? 'bg-emerald-50/60 border-emerald-300'
                  : 'bg-[#FFFCF7] border-[#E8E5DF]/70 hover:border-[#EA580C]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-black text-[#253044]">{item.vi}</h4>
                  <p className="text-[11px] text-[#64748B]">{item.en}</p>
                  <span className="text-[10px] text-stone-400 font-mono">{item.ipa}</span>
                </div>
                <button
                  type="button"
                  onClick={() => speakVietnamese(item.vi)}
                  className="!min-h-0 !min-w-0 !p-0 w-8 h-8 rounded-lg bg-white border border-[#E8E5DF] hover:bg-[#FFF7E8] active:bg-[#FFF0DC] text-[#EA580C] hover:border-[#EA580C] flex items-center justify-center transition-all shadow-2xs shrink-0 cursor-pointer group/audio audio-btn"
                  title={bilingualLabel(`Phát âm "${item.vi}"`, `Pronounce "${item.vi}"`)}
                  aria-label={bilingualLabel(`Phát âm ${item.vi}`, `Pronounce ${item.vi}`)}
                >
                  <Volume2 className="w-4 h-4 shrink-0 transition-transform group-hover/audio:scale-110" strokeWidth={2.2} />
                </button>
              </div>

              <div className="pt-2 border-t border-[#E8E5DF]/40 flex items-center justify-between">
                <span className="text-[10px] text-[#64748B] italic truncate">{item.tip}</span>
                <button
                  type="button"
                  onClick={() => onWaterWord(item.vi)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    isWatered
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-[#FFF0DC] text-[#EA580C] hover:bg-[#FDE1B3] active:bg-[#FCD8A2] border border-[#EA580C]/30'
                  }`}
                >
                  {isWatered ? <BilingualText vi="✓ Đã thuộc" en="✓ Mastered" /> : '+5 XP'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default VocabularyGardenSRS;
