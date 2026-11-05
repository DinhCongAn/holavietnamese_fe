import { BilingualText } from '@/shared/components/common/BilingualText';
import { Link } from 'react-router-dom';
import { Flame, Zap, Heart, Compass } from 'lucide-react';

/**
 * Learner Dashboard Top Header and Gamification Stats Ribbon
 */
export function LearnerHeaderRibbon({
  user,
  greeting,
  streakCount = 0,
  totalXp = 0,
  hearts = 5,
  hasCheckedInToday: _hasCheckedInToday = false,
}) {
  const effectiveStreak = streakCount;
  const effectiveXp = totalXp;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E8E5DF]/60 pb-6">
      <div className="space-y-1 text-left">
        <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#FFF0DC] border border-[#E7B59D] text-[#EA580C] text-xs font-bold uppercase tracking-wider">
          <span>{greeting}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#253044] tracking-tight">
          {user?.fullName || user?.username || <BilingualText vi="Học viên" en="Learner" />}!
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          <BilingualText vi="Duy trì ngọn lửa học tập mỗi ngày." en="Keep your learning streak burning every day." />
        </p>
      </div>

      {/* Gamification Stats Ribbon */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/92 backdrop-blur-xs border border-[#E8E5DF]/60 shadow-[0_4px_16px_rgba(67,25,20,0.03)]">
          <Flame size={22} className="text-[#ff7a00] shrink-0" fill="currentColor" />
          <div>
            <span className="block text-sm font-black text-[#253044] leading-tight">
              {effectiveStreak}
            </span>
            <span className="block text-[10px] text-[#64748B] font-semibold uppercase"><BilingualText vi="Ngày Streak" en="Day Streak" /></span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/92 backdrop-blur-xs border border-[#E8E5DF]/60 shadow-[0_4px_16px_rgba(67,25,20,0.03)]">
          <Zap size={22} className="text-[#8b5cf6] shrink-0" fill="currentColor" />
          <div>
            <span className="block text-sm font-black text-[#253044] leading-tight">
              {effectiveXp}
            </span>
            <span className="block text-[10px] text-[#64748B] font-semibold uppercase"><BilingualText vi="Tổng XP" en="Total XP" /></span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/92 backdrop-blur-xs border border-[#E8E5DF]/60 shadow-[0_4px_16px_rgba(67,25,20,0.03)]">
          <Heart size={22} className="text-[#ef4444] shrink-0" fill="currentColor" />
          <div>
            <span className="block text-sm font-black text-[#253044] leading-tight">{hearts}/5</span>
            <span className="block text-[10px] text-[#64748B] font-semibold uppercase"><BilingualText vi="Trái tim" en="Hearts" /></span>
          </div>
        </div>

        <Link
          to="/learning-path"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-xs shadow-[0_4px_0_#C2410C] active:translate-y-1 active:shadow-none transition-all"
        >
          <Compass size={16} />
          <span><BilingualText vi="Vào Lộ trình EdTech →" en="Open EdTech Path →" /></span>
        </Link>
      </div>
    </div>
  );
}

export default LearnerHeaderRibbon;
