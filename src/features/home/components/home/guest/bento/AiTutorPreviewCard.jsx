import { BilingualText } from '@/shared/components/common/BilingualText';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Volume2, ArrowRight } from 'lucide-react';
import { audioFeedback } from '@/utils/audioFeedback';
import { speakVietnamese } from '@/utils/speech';
import { AI_PROMPTS } from '@/features/home/components/home/data/homeData';

/**
 * Bento 2: AI Voice Wave Tutor Preview Card (Luminous Light EdTech Design)
 */
export function AiTutorPreviewCard() {
  const [aiMessageIndex, setAiMessageIndex] = useState(0);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="w-full bg-gradient-to-br from-[#FFFFFF] via-[#FFFCF7] to-[#FFF7E8] text-[#253044] border border-[#E8E5DF] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 text-left"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-[#FFF0DC] text-[#F97316] border border-[#F97316]/30 text-xs font-bold uppercase tracking-wider">
            AI Tutor 24/7
          </span>
          <span className="text-[11px] text-[#F97316] font-bold"><BilingualText vi="Tự động sửa lỗi" en="Auto Error Correction" /></span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-[#253044]">
          <BilingualText vi="Luyện phản xạ với AI Gia sư" en="Build Conversational Reflexes with AI Tutor" />
        </h3>
        <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
          <BilingualText vi="Trò chuyện không áp lực. AI phân tích giọng đọc, gợi ý câu giao tiếp tự nhiên và giải thích ngữ pháp tức thì." en="Practice speaking without pressure. AI analyzes pronunciation, suggests natural phrases, and clarifies grammar instantly." />
        </p>
      </div>

      {/* Interactive Dialog Bubble */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E5DF] shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-xs">
            AI
          </span>
          <div className="space-y-1">
            <p className="text-xs text-[#253044] leading-relaxed font-bold">
              {AI_PROMPTS[aiMessageIndex].ai}
            </p>
            <p className="text-[10px] text-[#F97316] italic font-semibold">
              {AI_PROMPTS[aiMessageIndex].tip}
            </p>
          </div>
        </div>

        {/* Animated Sound Wave Bars with Speak Button */}
        <div className="flex items-center justify-between pt-1 border-t border-[#E8E5DF]/60">
          <div className="flex items-center gap-1 h-6">
            {[35, 75, 50, 90, 30, 85, 60, 100, 45, 70].map((h, i) => (
              <motion.span
                key={i}
                animate={{ height: [`${h}%`, `${Math.max(20, 105 - h)}%`, `${h}%`] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.08 }}
                className="w-1 bg-[#F97316] rounded-full"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              speakVietnamese(AI_PROMPTS[aiMessageIndex].ai);
              audioFeedback.playPopSound(1.2);
            }}
            className="!min-h-0 !min-w-0 px-3 py-1.5 rounded-full bg-[#FFF0DC] hover:bg-[#FDE1B3] text-[#F97316] border border-[#F97316]/30 font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
            <span><BilingualText vi="Nghe AI nói" en="Listen to AI" /></span>
          </button>
        </div>
      </div>

      {/* Interactive User Response Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-bold text-[#F97316]"><BilingualText vi="Chọn câu trả lời thử:" en="Select sample reply:" /></span>
        <div className="flex flex-wrap gap-1.5">
          {AI_PROMPTS.map((p, idx) => {
            const isSelected = aiMessageIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiMessageIndex(idx);
                  audioFeedback.playTap();
                }}
                className={`!min-h-0 !min-w-0 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#FFF7E8] border-2 border-[#EA580C] text-[#253044] font-bold shadow-xs scale-[1.02]'
                    : 'bg-white text-[#64748B] hover:bg-[#FFF7E8]/70 hover:text-[#253044] border-[#E8E5DF] hover:border-[#EA580C]'
                } active:bg-[#FFF0DC] active:border-[#EA580C]`}
              >
                {p.user}
              </button>
            );
          })}
        </div>
      </div>

      <Link
        to="/ai-tutor"
        className="w-full py-3 px-4 rounded-xl bg-[#F97316] hover:bg-[#C2410C] text-white font-black text-xs text-center shadow-[0_4px_0_#C2410C] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 no-underline"
      >
        <span><BilingualText vi="Vào phòng đàm thoại AI Tutor" en="Enter AI Tutor Conversation" /></span>
        <ArrowRight size={14} />
      </Link>
    </motion.div>
  );
}

export default AiTutorPreviewCard;
