import React from 'react';
import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { Award, BookOpen, Clock, Flame, Sparkles, Trophy, Zap, Check } from 'lucide-react';
import { EmptyState } from '@/shared/components/common/Ui';
import { formatRelativeTime } from '@/constants/notifications';

function getActivityMeta(activity) {
  const eventType = String(activity.eventType || '').toUpperCase();
  if (eventType.includes('LESSON')) {
    return {
      labelVi: 'Bài học',
      labelEn: 'Lesson',
      icon: BookOpen,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border-blue-200',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }
  if (eventType.includes('CHECKIN') || eventType.includes('LOGIN')) {
    return {
      labelVi: 'Điểm danh',
      labelEn: 'Check-in',
      icon: Flame,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50 border-orange-200',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    };
  }
  if (eventType.includes('QUIZ')) {
    return {
      labelVi: 'Kiểm tra',
      labelEn: 'Quiz',
      icon: Award,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50 border-purple-200',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    };
  }
  if (eventType.includes('VOCAB')) {
    return {
      labelVi: 'Từ vựng',
      labelEn: 'Vocabulary',
      icon: BookOpen,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-200',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  if (eventType.includes('ROLEPLAY') || eventType.includes('AI')) {
    return {
      labelVi: 'Hội thoại AI',
      labelEn: 'AI Conversation',
      icon: Sparkles,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-200',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  if (eventType.includes('BADGE') || eventType.includes('ACHIEVEMENT')) {
    return {
      labelVi: 'Huy hiệu',
      labelEn: 'Badge',
      icon: Trophy,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-200',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  }
  return {
    labelVi: 'Hoạt động',
    labelEn: 'Activity',
    icon: Check,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
}

/**
 * Recent Learning Activity Timeline Feed
 */
export function RecentActivityFeed({ activities = [] }) {
  return (
    <section className="bg-white/92 backdrop-blur-xs border border-[#E8E5DF]/70 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(67,25,20,0.04)] space-y-4 text-left">
      <h3 className="text-lg font-black text-[#253044]">
        <BilingualText vi="Hoạt động học tập gần đây" en="Recent Learning Activity" />
      </h3>
      {activities.length ? (
        <div className="space-y-2.5">
          {activities.map((activity, idx) => {
            const meta = getActivityMeta(activity);
            const Icon = meta.icon;
            const title = activity.titleVi || activity.description || activity.title || activity.eventName || 'Hoạt động học tập';
            const time = activity.time || (activity.createdAt ? formatRelativeTime(activity.createdAt, 'vi') : 'Gần đây');
            const xpAmount = activity.xp ?? activity.amount ?? activity.xpReward;

            return (
              <div
                key={activity.id ?? idx}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFFCF7] border border-[#E8E5DF]/70 hover:border-[#EA580C]/40 hover:bg-[#FFF9F2] transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.iconBg} ${meta.iconColor}`}>
                    <Icon size={18} />
                  </span>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-md border px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider ${meta.badgeClass}`}>
                        {meta.labelVi}
                      </span>
                      <small className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                        <Clock size={11} />
                        {time}
                      </small>
                    </div>
                    <strong className="block text-xs sm:text-sm font-bold text-[#253044] truncate" title={title}>
                      {title}
                    </strong>
                  </div>
                </div>
                {xpAmount != null && (
                  <span className="inline-flex shrink-0 items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-[#EA580C] text-xs font-black shadow-2xs">
                    <Zap size={12} fill="currentColor" />
                    +{xpAmount} XP
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={bilingualLabel("Chưa có hoạt động gần đây", "No recent activity")}
          description={bilingualLabel("Các bài học và lần ôn tập hoàn thành sẽ xuất hiện tại đây.", "Completed lessons and review sessions will appear here.")}
        />
      )}
    </section>
  );
}

export default RecentActivityFeed;
