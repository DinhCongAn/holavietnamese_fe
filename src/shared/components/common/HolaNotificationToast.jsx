import { useMemo } from 'react';
import {
  BookOpen,
  Flame,
  Trophy,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Bell,
  X,
  ArrowRight,
} from 'lucide-react';
import { formatRelativeTime } from '@/constants/notifications';
import { bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';

const NOTIFICATION_CONFIG = {
  LESSON: {
    icon: BookOpen,
    bg: 'bg-amber-50',
    border: 'border-amber-200/80',
    text: 'text-amber-800',
    iconColor: 'text-amber-600',
    categoryVi: 'Bài học hôm nay',
    categoryEn: "Today's Lesson",
    actionVi: 'Học ngay',
    actionEn: 'Learn now',
  },
  STREAK: {
    icon: Flame,
    bg: 'bg-orange-50',
    border: 'border-orange-200/80',
    text: 'text-orange-800',
    iconColor: 'text-[#EA580C]',
    categoryVi: 'Nhắc nhở chuỗi học',
    categoryEn: 'Streak Reminder',
    actionVi: 'Học ngay',
    actionEn: 'Keep Streak',
  },
  ACHIEVEMENT: {
    icon: Trophy,
    bg: 'bg-yellow-50',
    border: 'border-amber-200/80',
    text: 'text-amber-800',
    iconColor: 'text-amber-600',
    categoryVi: 'Thành tích mới',
    categoryEn: 'New Achievement',
    actionVi: 'Xem thành tích',
    actionEn: 'View badge',
  },
  COURSE: {
    icon: GraduationCap,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200/80',
    text: 'text-emerald-800',
    iconColor: 'text-emerald-600',
    categoryVi: 'Khóa học',
    categoryEn: 'Course',
    actionVi: 'Xem khóa học',
    actionEn: 'View course',
  },
  QUIZ: {
    icon: Sparkles,
    bg: 'bg-indigo-50',
    border: 'border-indigo-200/80',
    text: 'text-indigo-800',
    iconColor: 'text-indigo-600',
    categoryVi: 'Bài ôn tập',
    categoryEn: 'Review & Quiz',
    actionVi: 'Làm bài ngay',
    actionEn: 'Start quiz',
  },
  SECURITY: {
    icon: ShieldCheck,
    bg: 'bg-blue-50',
    border: 'border-blue-200/80',
    text: 'text-blue-800',
    iconColor: 'text-blue-600',
    categoryVi: 'Bảo mật',
    categoryEn: 'Security',
    actionVi: 'Kiểm tra',
    actionEn: 'Review',
  },
  SYSTEM: {
    icon: Bell,
    bg: 'bg-orange-50',
    border: 'border-orange-200/80',
    text: 'text-orange-800',
    iconColor: 'text-[#EA580C]',
    categoryVi: 'Thông báo',
    categoryEn: 'Notification',
    actionVi: 'Xem ngay',
    actionEn: 'View now',
  },
};

export default function HolaNotificationToast({
  id,
  item,
  onClose,
  onAction,
}) {
  const lang = useTextLanguage();
  const isVi = lang === 'vi';

  const type = String(item?.type || 'SYSTEM').toUpperCase();
  const isStreakRelated =
    type === 'STREAK' ||
    String(item?.title || '').toLowerCase().includes('streak') ||
    String(item?.message || '').toLowerCase().includes('streak');

  const config = useMemo(() => {
    if (isStreakRelated) return NOTIFICATION_CONFIG.STREAK;
    return NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.SYSTEM;
  }, [type, isStreakRelated]);

  const Icon = config.icon;
  const titleText = bilingualLabel(item?.title || '');
  const messageText = bilingualLabel(item?.message || '');

  const hasAction = Boolean(item?.linkUrl || item?.targetType === 'BADGE' || onAction);
  const actionLabel = isVi ? config.actionVi : config.actionEn;

  return (
    <div
      role="alert"
      aria-live="polite"
      onClick={() => {
        if (hasAction && onAction) onAction();
      }}
      className={`hola-notification-card group relative w-[390px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl bg-white border border-[#FED7AA] shadow-[0_16px_40px_-6px_rgba(249,115,22,0.18),0_4px_16px_rgba(0,0,0,0.06)] p-3.5 sm:p-4 transition-all duration-200 hover:shadow-[0_20px_46px_-4px_rgba(249,115,22,0.24)] select-none text-left ${hasAction ? 'cursor-pointer' : ''}`}
    >
      {/* Top brand gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF8008] via-[#FF6A00] to-[#EA580C]" />

      {/* Close button with robust inline styles to guarantee isolation from global button CSS */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onClose) onClose();
        }}
        aria-label={isVi ? 'Đóng thông báo' : 'Close notification'}
        className="hola-notification-close"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '24px',
          height: '24px',
          minWidth: '24px',
          minHeight: '24px',
          maxWidth: '24px',
          maxHeight: '24px',
          padding: 0,
          margin: 0,
          borderRadius: '50%',
          border: '1px solid #E2E8F0',
          background: '#FFFFFF',
          color: '#64748B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          zIndex: 10,
          outline: 'none',
        }}
      >
        <X size={13} strokeWidth={2.4} />
      </button>

      <div className="flex items-start gap-3 pr-7">
        {/* Left Icon Badge */}
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${config.bg} ${config.border} ${config.iconColor} shadow-xs`}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Category Pill + Relative Time */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text} border ${config.border}`}
            >
              {isVi ? config.categoryVi : config.categoryEn}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {formatRelativeTime(item?.createdAt, isVi ? 'vi' : 'en')}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-[13px] font-bold text-slate-900 leading-snug break-words">
            {titleText}
          </h4>

          {/* Description */}
          {messageText && (
            <p className="mt-1 text-[12px] text-slate-600 leading-relaxed break-words line-clamp-2">
              {messageText}
            </p>
          )}

          {/* Action button */}
          {hasAction && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAction) onAction();
                }}
                className="hola-notification-action"
                style={{
                  height: '32px',
                  minHeight: '32px',
                  maxHeight: '32px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #FF7A00 0%, #EA580C 100%)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(234, 88, 12, 0.28)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{actionLabel}</span>
                <ArrowRight size={13} strokeWidth={2.4} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
