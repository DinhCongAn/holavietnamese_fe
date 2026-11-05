import React from 'react';
import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { Volume2 } from 'lucide-react';
import { speakVietnamese } from '@/utils/speech';
import { WORD_OF_THE_DAY } from '@/features/home/components/home/data/homeData';

/**
 * Cultural Tip & Word of the Day Card
 */
export function WordOfTheDayCard({ wordData = WORD_OF_THE_DAY }) {
  return (
    <section className="bg-[#FFF7E8]/92 backdrop-blur-xs border border-[#E8E5DF] rounded-3xl p-6 shadow-2xs space-y-3 text-left">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#EA580C] bg-[#FFF0DC] px-2.5 py-0.5 rounded-md">
          <BilingualText vi="Từ & Văn hóa trong ngày" en="Word & Culture of the Day" />
        </span>
        <button
          type="button"
          onClick={() => speakVietnamese(wordData.speechText || wordData.word)}
          className="!min-h-0 !min-w-0 !p-0 w-8 h-8 rounded-full bg-white border border-[#E8E5DF] text-[#EA580C] flex items-center justify-center hover:bg-[#FFF7E8] active:bg-[#FFF0DC] hover:border-[#EA580C] transition-all shadow-2xs shrink-0 cursor-pointer group/wod audio-btn"
          title={bilingualLabel(`Nghe: ${wordData.speechText || wordData.word}`, `Listen to: ${wordData.speechText || wordData.word}`)}
          aria-label={bilingualLabel(`Nghe phát âm ${wordData.word}`, `Listen to pronunciation of ${wordData.word}`)}
        >
          <Volume2 className="w-4 h-4 shrink-0 transition-transform group-hover/wod:scale-110" strokeWidth={2.2} />
        </button>
      </div>

      <div>
        <h4 className="text-lg font-black text-[#253044]">{wordData.word}</h4>
        <p className="text-xs text-[#64748B] leading-relaxed mt-1">
          <BilingualText
            vi={wordData.descriptionVi || wordData.description}
            en={wordData.descriptionEn || "The classic southern Vietnamese opening word, expressing deep respect, politeness, and humility toward elders."}
          />
        </p>
      </div>

      <div className="p-2.5 rounded-xl bg-white/80 border border-[#E8E5DF]/60 text-[11px] text-[#253044] italic">
        <BilingualText
          vi={wordData.exampleVi || wordData.example}
          en={wordData.exampleEn || 'Example: “Dạ, cho con gửi tiền ạ.”'}
        />
      </div>
    </section>
  );
}

export default WordOfTheDayCard;
