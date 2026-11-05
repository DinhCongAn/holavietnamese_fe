import React from 'react';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { speakVietnamese } from '@/utils/speech';
import { EXPAT_TESTIMONIALS } from '@/features/home/components/home/data/homeData';
import { useTranslation } from 'react-i18next';

/**
 * Expat Testimonials Social Proof Section
 */
export function ExpatTestimonials() {
  const { t } = useTranslation('home');
  return (
    <section className="testimonials-section space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <p className="eyebrow text-xs font-bold uppercase tracking-wider text-[#EA580C]">
          {t('stories.eyebrow')}
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-[#253044] tracking-tight">
          {t('stories.title')}
        </h2>
        <p className="text-xs text-[#887568] leading-relaxed">{t('stories.disclaimer')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {EXPAT_TESTIMONIALS.map((testimonial, idx) => (
          <motion.div
            whileHover={{ y: -4 }}
            key={idx}
            className="bg-white/92 backdrop-blur-xs border border-[#E8E5DF]/70 rounded-3xl p-6 shadow-[0_8px_30px_rgb(67,25,20,0.04)] flex flex-col justify-between space-y-4 text-left"
          >
            <span className="self-start px-2 py-1 rounded-md bg-[#FAF5EB] border border-[#E8E5DF] text-[8px] font-black tracking-wider text-[#887568]">{t('stories.badge')}</span>
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-[#253044] leading-relaxed italic">
                “{testimonial.quote}”
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8E5DF]/40 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#253044] flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#FFF0DC] text-[#EA580C] border border-[#E8E5DF]/70">
                    {testimonial.code}
                  </span>
                  <span>{testimonial.name}</span>
                </h4>
                <p className="text-[10px] text-[#64748B]">{testimonial.role}</p>
              </div>
              <button
                type="button"
                onClick={() => speakVietnamese(testimonial.favPhrase.replace(/["“”]/g, ''))}
                className="!min-h-0 !min-w-0 text-[11px] font-bold text-[#EA580C] bg-[#FFF0DC] hover:bg-[#FDE1B3] active:bg-[#FCD8A2] text-[#EA580C] border border-[#EA580C]/30 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                title={t('stories.listen', { phrase: testimonial.favPhrase })}
                aria-label={t('stories.listen', { phrase: testimonial.favPhrase })}
              >
                <span>{testimonial.favPhrase}</span>
                <Volume2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default ExpatTestimonials;
