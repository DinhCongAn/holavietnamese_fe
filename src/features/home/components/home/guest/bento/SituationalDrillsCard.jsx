import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
﻿import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Volume2, ArrowRight } from 'lucide-react';
import { audioFeedback } from '@/utils/audioFeedback';
import { speakVietnamese } from '@/utils/speech';
import { CULTURAL_SITUATIONS } from '@/features/home/components/home/data/homeData';

/**
 * Bento 4: Street Situational Drills Card
 */
export function SituationalDrillsCard() {
  const [activeSituationIndex, setActiveSituationIndex] = useState(0);
  const currentSituation = CULTURAL_SITUATIONS[activeSituationIndex];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="w-full bg-white/92 backdrop-blur-xs border border-[#E8E5DF]/70 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(67,25,20,0.04)] flex flex-col justify-between space-y-5 text-left"
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-[#FFF0DC] text-[#EA580C] text-xs font-bold uppercase tracking-wider">
            <BilingualText vi="Tình huống thực tế • Situational Drills" en="Real-world Situational Drills" />
          </span>
          <span className="text-[11px] font-semibold text-[#64748B]">Interactive preview</span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-[#253044]">
          <BilingualText vi="Bước ra đường phố và giao tiếp tự tin" en="Step out and speak with confidence" />
        </h3>
        <p className="text-xs text-[#64748B]">
          <BilingualText vi="Bấm chọn từng tình huống để nghe câu giao tiếp chuẩn bản xứ:" en="Select a situation to hear native conversational phrases:" />
        </p>
      </div>

      {/* Situation Cards Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {CULTURAL_SITUATIONS.map((item, idx) => {
          const Icon = item.icon;
          const isSelected = activeSituationIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveSituationIndex(idx);
                speakVietnamese(item.phraseVi);
                audioFeedback.playTap();
              }}
              className={`p-3 rounded-2xl border text-left transition-all space-y-1 cursor-pointer ${
                isSelected
                  ? 'bg-[#FFF7E8] border-2 border-[#EA580C] shadow-xs'
                  : 'bg-[#FFFCF7] border-[#E8E5DF]/70 hover:border-[#EA580C] hover:bg-[#FFF7E8]/60'
              } active:bg-[#FFF0DC] active:border-[#EA580C]`}
            >
              
              <h4 className="text-xs font-bold text-[#253044] truncate">{item.title}</h4>
              <p className="text-[10px] text-[#64748B] truncate">{item.situation}</p>
            </button>
          );
        })}
      </div>

      {/* Active Situation Dialog Ribbon */}
      <div className="p-4 rounded-2xl bg-[#FFFCF7] border border-[#E8E5DF] space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#EA580C]">
              {currentSituation.title} • {currentSituation.situation}
            </span>
            <p className="text-sm font-black text-[#253044]">
              “{currentSituation.phraseVi}”
            </p>
          </div>
          <button
            type="button"
            onClick={() => speakVietnamese(currentSituation.phraseVi)}
            className="!min-h-0 !min-w-0 !p-0 w-9 h-9 rounded-xl bg-[#FFF0DC] hover:bg-[#FDE1B3] active:bg-[#FCD8A2] text-[#EA580C] border border-[#EA580C]/30 flex items-center justify-center shadow-xs transition-colors shrink-0 ml-2 cursor-pointer"
            title={bilingualLabel("Nghe câu mẫu", "Listen to sample sentence")}
            aria-label={bilingualLabel("Nghe câu mẫu", "Listen to sample sentence")}
          >
            <Volume2 className="w-4 h-4 shrink-0" strokeWidth={2.2} />
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] border-t border-[#E8E5DF]/50 pt-2">
          <span>{currentSituation.phraseEn}</span>
          <span className="font-mono text-[11px] text-stone-400">{currentSituation.ipa}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-[#64748B]"><BilingualText vi="Bao gồm đối thoại, trả giá và chỉ đường" en="Includes dialogues, bargaining, and directions" /></span>
        <Link to="/courses" className="text-[#EA580C] font-bold hover:underline flex items-center gap-1">
          <span><BilingualText vi="Xem tất cả khóa học" en="View all courses" /></span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  );
}

export default SituationalDrillsCard;
