import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock,
  Flame,
  Lock,
  Medal,
  Shield,
  Sparkles,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { learnerService } from '@/features/learning/api/learnerService';
import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { CountingNumber, SpotlightCard, StarsBackground } from '@/shared/components/common/animate';

const CATEGORY_META = {
  LESSON: { label: 'Bài học', labelEn: 'Lessons', icon: BookOpen, color: '#EA580C', bg: '#FFF0DC' },
  STREAK: { label: 'Chuỗi học', labelEn: 'Streaks', icon: Flame, color: '#F97316', bg: '#FFEDD5' },
  VOCABULARY: { label: 'Từ vựng', labelEn: 'Vocabulary', icon: Sparkles, color: '#059669', bg: '#D1FAE5' },
  QUIZ: { label: 'Kiểm tra', labelEn: 'Quizzes', icon: Award, color: '#D97706', bg: '#FEF3C7' },
  AI_TUTOR: { label: 'Giao tiếp AI', labelEn: 'AI Tutor', icon: Bot, color: '#2563EB', bg: '#DBEAFE' },
};

const MEDAL_TIERS = [
  { level: 1, titleVi: 'Tân Binh Đồng', titleEn: 'Bronze Novice', tier: 'Đồng', minXp: 0, color: '#B45309', bg: '#FEF3C7' },
  { level: 2, titleVi: 'Tập Sự Đồng', titleEn: 'Bronze Apprentice', tier: 'Đồng', minXp: 100, color: '#B45309', bg: '#FEF3C7' },
  { level: 3, titleVi: 'Khám Phá Bạc', titleEn: 'Silver Explorer', tier: 'Bạc', minXp: 300, color: '#64748B', bg: '#F1F5F9' },
  { level: 4, titleVi: 'Chăm Chỉ Bạc', titleEn: 'Silver Scholar', tier: 'Bạc', minXp: 600, color: '#64748B', bg: '#F1F5F9' },
  { level: 5, titleVi: 'Tinh Anh Vàng', titleEn: 'Gold Adept', tier: 'Vàng', minXp: 1000, color: '#D97706', bg: '#FFFBEB' },
  { level: 6, titleVi: 'Bậc Thầy Vàng', titleEn: 'Gold Master', tier: 'Vàng', minXp: 1500, color: '#D97706', bg: '#FFFBEB' },
  { level: 7, titleVi: 'Ngôn Ngữ Bạch Kim', titleEn: 'Platinum Linguist', tier: 'Bạch Kim', minXp: 2500, color: '#0284C7', bg: '#E0F2FE' },
  { level: 8, titleVi: 'Huyền Thoại Kim Cương', titleEn: 'Diamond Legend', tier: 'Kim Cương', minXp: 4000, color: '#7C3AED', bg: '#EDE9FE' },
];

function formatUnlockedDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return String(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

export function AchievementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('badges'); // 'badges' | 'medals'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unlocked' | 'locked'

  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedReward, setSelectedReward] = useState(null);
  const [notFoundRewardId, setNotFoundRewardId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [badgesRes, progressRes] = await Promise.all([
        learnerService.getAchievements().catch(() => []),
        learnerService.getProgressData().catch(() => null),
      ]);
      const rawBadges = Array.isArray(badgesRes) ? badgesRes : (badgesRes?.badges || []);
      setBadges(rawBadges);
      setProgress(progressRes);
      setError('');
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu thành tích.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronous update on real-time SSE notifications (Requirement 3)
  useEffect(() => {
    const handleRewardEvent = () => {
      loadData();
    };
    window.addEventListener('reward:received', handleRewardEvent);
    window.addEventListener('notification:received', handleRewardEvent);
    return () => {
      window.removeEventListener('reward:received', handleRewardEvent);
      window.removeEventListener('notification:received', handleRewardEvent);
    };
  }, [loadData]);

  // Handle URL query targetId (?badgeId=... or ?medalId=...) (Requirement 4 & 7)
  useEffect(() => {
    const badgeIdParam = searchParams.get('badgeId');
    const medalIdParam = searchParams.get('medalId');

    if (badgeIdParam && badges.length > 0) {
      const matched = badges.find((b) => String(b.id) === String(badgeIdParam) || b.code === badgeIdParam);
      if (matched) {
        setSelectedReward({ type: 'badge', data: matched });
        setNotFoundRewardId(null);
        setActiveTab('badges');
      } else {
        setSelectedReward(null);
        setNotFoundRewardId(badgeIdParam);
      }
    } else if (medalIdParam) {
      const levelNum = Number(medalIdParam);
      const matched = MEDAL_TIERS.find((m) => m.level === levelNum);
      if (matched) {
        setSelectedReward({ type: 'medal', data: matched });
        setNotFoundRewardId(null);
        setActiveTab('medals');
      } else {
        setSelectedReward(null);
        setNotFoundRewardId(medalIdParam);
      }
    }
  }, [searchParams, badges]);

  const closeModal = () => {
    setSelectedReward(null);
    setNotFoundRewardId(null);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('badgeId');
    newParams.delete('medalId');
    setSearchParams(newParams, { replace: true });
  };

  const unlockedBadgesCount = useMemo(() => {
    return badges.filter((b) => b.isUnlocked === true || b.unlocked === true).length;
  }, [badges]);

  const userLevel = progress?.currentLevel || 1;
  const userXp = progress?.totalXp || 0;
  const unlockedMedalsCount = useMemo(() => {
    return MEDAL_TIERS.filter((m) => userLevel >= m.level).length;
  }, [userLevel]);

  const filteredBadges = useMemo(() => {
    return badges.filter((b) => {
      const isUnlocked = b.isUnlocked === true || b.unlocked === true;
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
      if (statusFilter === 'unlocked' && !isUnlocked) return false;
      if (statusFilter === 'locked' && isUnlocked) return false;
      return true;
    });
  }, [badges, categoryFilter, statusFilter]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FFFCF7] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl flex min-h-80 items-center justify-center">
          <div className="text-center">
            <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#EA580C] border-t-transparent" />
            <p className="mt-3 text-sm font-semibold text-[#64748B]">
              <BilingualText vi="Đang tải huy chương & huy hiệu..." en="Loading medals and badges..." />
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFCF7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#FFF0DC] px-3 py-1 text-xs font-bold text-[#C2410C]">
              <Trophy size={13} />
              <BilingualText vi="HỆ THỐNG PHẦN THƯỞNG" en="REWARDS SYSTEM" />
            </span>
            <h1 className="text-3xl font-black tracking-tight text-[#253044]">
              <BilingualText vi="Huy chương & Huy hiệu" en="Medals & Badges" />
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              <BilingualText
                vi="Tôn vinh hành trình kiên trì, từng cột mốc và chiến tích học tập tiếng Việt của bạn."
                en="Honoring your persistence, milestones, and Vietnamese learning achievements."
              />
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {/* Overview Hero Banner */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#FB923C] p-6 text-white shadow-[0_12px_40px_rgba(234,88,12,0.18)] sm:p-8 relative">
          <StarsBackground className="opacity-30" starCount={40} />
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <span className="inline-block text-[11px] font-black uppercase tracking-widest text-orange-100">
                <BilingualText vi="TIẾN TRÌNH TỔNG THỂ" en="OVERALL PROGRESS" />
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">
                {activeTab === 'badges' ? (
                  <BilingualText
                    vi={<>Đã mở khóa <CountingNumber value={unlockedBadgesCount} /> / {badges.length} huy hiệu</>}
                    en={<>Unlocked <CountingNumber value={unlockedBadgesCount} /> / {badges.length} badges</>}
                  />
                ) : (
                  <BilingualText
                    vi={<>Đã đạt <CountingNumber value={unlockedMedalsCount} /> / {MEDAL_TIERS.length} huy chương cấp bậc</>}
                    en={<>Achieved <CountingNumber value={unlockedMedalsCount} /> / {MEDAL_TIERS.length} tier medals</>}
                  />
                )}
              </h2>
              <p className="text-sm text-orange-100/90 max-w-xl">
                {progress?.levelTitle ? (
                  <span>
                    <BilingualText
                      vi={`Hiện tại bạn đang ở Cấp ${userLevel} (${progress.levelTitle}) với tổng cộng ${userXp} XP.`}
                      en={`You are currently Level ${userLevel} (${progress.levelTitleEn || progress.levelTitle}) with ${userXp} total XP.`}
                    />
                  </span>
                ) : (
                  <BilingualText
                    vi="Hoàn thành các bài học và thử thách để mở khóa thêm nhiều vinh danh mới!"
                    en="Complete lessons and quizzes to unlock new honors!"
                  />
                )}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-inner">
                {activeTab === 'badges' ? <Award size={36} /> : <Medal size={36} />}
              </div>
            </div>
          </div>
        </section>

        {/* Tab Switcher (Huy hiệu vs Huy chương) */}
        <div className="mb-6 flex gap-3 border-b border-[#E8E5DF] pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all !min-h-0 ${
              activeTab === 'badges'
                ? '!bg-white !text-[#EA580C] border-2 border-[#EA580C] shadow-sm'
                : '!bg-white !text-[#64748B] border border-[#E8E5DF] hover:!text-[#253044]'
            }`}
          >
            <Award size={18} />
            <BilingualText vi="Huy hiệu thành tích" en="Achievement Badges" />
            <span className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-xs text-[#EA580C]">
              {unlockedBadgesCount}/{badges.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('medals')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all !min-h-0 ${
              activeTab === 'medals'
                ? '!bg-white !text-[#EA580C] border-2 border-[#EA580C] shadow-sm'
                : '!bg-white !text-[#64748B] border border-[#E8E5DF] hover:!text-[#253044]'
            }`}
          >
            <Medal size={18} />
            <BilingualText vi="Huy chương cấp bậc" en="Tier Medals" />
            <span className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-xs text-[#EA580C]">
              {unlockedMedalsCount}/{MEDAL_TIERS.length}
            </span>
          </button>
        </div>

        {/* SECTION 1: BADGES */}
        {activeTab === 'badges' && (
          <section>
            {/* Filter Pills */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all !min-h-0 ${
                    categoryFilter === 'all'
                      ? '!bg-white !text-[#EA580C] border-2 border-[#EA580C] shadow-2xs'
                      : '!bg-white !text-[#64748B] border border-[#E8E5DF] hover:!text-[#253044]'
                  }`}
                >
                  <BilingualText vi="Tất cả thể loại" en="All categories" />
                </button>
                {Object.entries(CATEGORY_META).map(([key, meta]) => {
                  const Icon = meta.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategoryFilter(key)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all !min-h-0 ${
                        categoryFilter === key
                          ? '!bg-white !text-[#EA580C] border-2 border-[#EA580C] shadow-2xs'
                          : '!bg-white !text-[#64748B] border border-[#E8E5DF] hover:!text-[#253044]'
                      }`}
                    >
                      <Icon size={14} />
                      <BilingualText vi={meta.label} en={meta.labelEn} />
                    </button>
                  );
                })}
              </div>

              {/* Status Filter */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold !min-h-0 ${
                    statusFilter === 'all'
                      ? '!bg-white text-[#EA580C] border border-[#EA580C]'
                      : '!bg-white text-[#64748B] border border-[#E8E5DF]'
                  }`}
                >
                  <BilingualText vi="Toàn bộ" en="All" />
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('unlocked')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold !min-h-0 ${
                    statusFilter === 'unlocked'
                      ? '!bg-white text-[#EA580C] border border-[#EA580C]'
                      : '!bg-white text-[#64748B] border border-[#E8E5DF]'
                  }`}
                >
                  <BilingualText vi="Đã đạt" en="Unlocked" />
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('locked')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold !min-h-0 ${
                    statusFilter === 'locked'
                      ? '!bg-white text-[#EA580C] border border-[#EA580C]'
                      : '!bg-white text-[#64748B] border border-[#E8E5DF]'
                  }`}
                >
                  <BilingualText vi="Chưa đạt" en="In progress" />
                </button>
              </div>
            </div>

            {/* Badges Grid */}
            {filteredBadges.length === 0 ? (
              <div className="rounded-3xl border border-[#E8E5DF] bg-white p-12 text-center shadow-xs">
                <Award className="mx-auto mb-3 text-stone-300" size={40} />
                <h3 className="font-bold text-[#253044]">
                  <BilingualText vi="Không có huy hiệu phù hợp" en="No matching badges" />
                </h3>
                <p className="mt-1 text-sm text-[#64748B]">
                  <BilingualText vi="Hãy thử đổi bộ lọc khác." en="Try selecting a different filter." />
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBadges.map((badge) => {
                  const isUnlocked = badge.isUnlocked === true || badge.unlocked === true;
                  const catMeta = CATEGORY_META[badge.category] || CATEGORY_META.LESSON;
                  const CatIcon = catMeta.icon;
                  const progressVal = Number(badge.currentProgress || 0);
                  const conditionVal = Number(badge.conditionValue || 1);
                  const progressPct = isUnlocked ? 100 : Math.min(99, Math.round((progressVal / conditionVal) * 100));

                  return (
                    <SpotlightCard
                      key={badge.id}
                      onClick={() => setSelectedReward({ type: 'badge', data: badge })}
                      className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all cursor-pointer ${
                        isUnlocked
                          ? 'border-orange-200 bg-white shadow-sm hover:border-[#EA580C] hover:shadow-md'
                          : 'border-[#E8E5DF] bg-stone-50/70 opacity-80 hover:opacity-100 hover:border-stone-300'
                      }`}
                    >
                      <div>
                        {/* Top Meta: Category Tag & XP Reward */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                            style={{ backgroundColor: catMeta.bg, color: catMeta.color }}
                          >
                            <CatIcon size={12} />
                            {catMeta.label}
                          </span>
                          {badge.xpReward > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                              <Zap size={11} className="fill-amber-500 text-amber-500" />
                              +{badge.xpReward} XP
                            </span>
                          )}
                        </div>

                        {/* Icon and Title */}
                        <div className="flex items-start gap-3.5 mb-3">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border overflow-hidden ${
                              isUnlocked
                                ? 'border-orange-200 bg-gradient-to-br from-[#FFF0DC] to-[#FFE2BF] text-[#EA580C] shadow-inner'
                                : 'border-stone-200 bg-stone-100 text-stone-400'
                            }`}
                          >
                            {badge.iconUrl ? (
                              <img
                                src={badge.iconUrl}
                                alt={badge.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                            ) : null}
                            <span style={{ display: badge.iconUrl ? 'none' : 'block' }}>
                              {isUnlocked ? <Award size={26} /> : <Lock size={22} />}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className={`text-base font-bold leading-snug ${isUnlocked ? 'text-[#1E293B]' : 'text-[#64748B]'}`}>
                              {badge.name}
                            </h3>
                            <p className="mt-1 text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                              {badge.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Progress Bar & Status */}
                      <div className="mt-3 border-t border-stone-100 pt-3">
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-semibold text-[#64748B]">
                            {isUnlocked ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                <CheckCircle2 size={13} />
                                <BilingualText vi="Đã mở khóa" en="Earned" />
                              </span>
                            ) : (
                              <span>
                                <BilingualText vi="Tiến độ: " en="Progress: " />
                                <strong>{progressVal}/{conditionVal}</strong>
                              </span>
                            )}
                          </span>
                          <span className="font-bold text-[#64748B]">{progressPct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isUnlocked
                                ? 'bg-gradient-to-r from-[#EA580C] to-[#F97316]'
                                : 'bg-gradient-to-r from-stone-400 to-stone-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* SECTION 2: MEDAL TIERS */}
        {activeTab === 'medals' && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 text-xs text-amber-900 leading-relaxed">
              <BilingualText
                vi="Huy chương cấp bậc thể hiện trình độ và sự gắn bó dài hạn của bạn. Tích lũy XP để thăng hạng qua từng bậc Đồng, Bạc, Vàng, Bạch Kim và chạm đỉnh Kim Cương!"
                en="Tier medals represent your language proficiency level and long-term dedication. Accumulate XP to rank up through Bronze, Silver, Gold, Platinum, and reach Diamond!"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MEDAL_TIERS.map((tier) => {
                const isEarned = userLevel >= tier.level;
                return (
                  <div
                    key={tier.level}
                    onClick={() => setSelectedReward({ type: 'medal', data: tier })}
                    className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all cursor-pointer ${
                      isEarned
                        ? 'border-orange-200 bg-white shadow-sm hover:border-[#EA580C] hover:shadow-md'
                        : 'border-[#E8E5DF] bg-stone-50/70 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                          style={{ backgroundColor: tier.bg, color: tier.color }}
                        >
                          Hạng {tier.tier}
                        </span>
                        <span className="text-[11px] font-bold text-stone-400">
                          Cấp {tier.level}
                        </span>
                      </div>

                      <div className="flex flex-col items-center text-center my-3">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-2xl border shadow-inner mb-2 ${
                            isEarned
                              ? 'border-orange-200 bg-gradient-to-br from-[#FFF0DC] to-[#FFE2BF] text-[#EA580C]'
                              : 'border-stone-200 bg-stone-100 text-stone-400'
                          }`}
                        >
                          {isEarned ? <Medal size={32} /> : <Lock size={24} />}
                        </div>
                        <h3 className="font-bold text-base text-[#1E293B]">
                          {tier.titleVi}
                        </h3>
                        <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                          {tier.minXp} XP yêu cầu
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-stone-100 pt-2.5 text-center">
                      {isEarned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle2 size={13} />
                          <BilingualText vi="Đã đạt danh hiệu" en="Achieved" />
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-stone-400">
                          <BilingualText vi="Cần đạt Cấp " en="Requires Level " />
                          <strong>{tier.level}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* DETAIL MODAL (Requirement 4 & 7) */}
        <AnimatePresence>
          {(selectedReward || notFoundRewardId) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#E8E5DF] bg-white p-6 shadow-2xl text-left"
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="absolute right-4 top-4 rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 !min-h-0 !border-0 !bg-transparent"
                  aria-label="Đóng"
                >
                  <X size={20} />
                </button>

                {notFoundRewardId ? (
                  /* Reward Not Found or Deleted (Requirement 7) */
                  <div className="py-4 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
                      <Shield size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-[#253044]">
                      <BilingualText vi="Phần thưởng không tồn tại" en="Reward not found" />
                    </h3>
                    <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                      <BilingualText
                        vi={`Phần thưởng này (mã: ${notFoundRewardId}) hiện không còn khả dụng hoặc đã được cập nhật trong hệ thống.`}
                        en={`This reward (ID: ${notFoundRewardId}) is no longer available or has been updated.`}
                      />
                    </p>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-6 w-full rounded-xl bg-[#EA580C] py-2.5 text-sm font-bold text-white hover:bg-[#C2410C]"
                    >
                      <BilingualText vi="Đã hiểu" en="Got it" />
                    </button>
                  </div>
                ) : selectedReward?.type === 'badge' ? (
                  /* Badge Detail */
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-[#FFF0DC] text-[#EA580C] shadow-inner">
                        {selectedReward.data.iconUrl ? (
                          <img
                            src={selectedReward.data.iconUrl}
                            alt={selectedReward.data.name}
                            className="h-full w-full object-cover rounded-2xl"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <span style={{ display: selectedReward.data.iconUrl ? 'none' : 'block' }}>
                          <Award size={32} />
                        </span>
                      </div>
                      <div>
                        <span className="inline-block rounded-md bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-black uppercase text-[#EA580C]">
                          Huy hiệu · Cấp {selectedReward.data.badgeLevel || 1}
                        </span>
                        <h3 className="text-xl font-black text-[#1E293B] mt-0.5">
                          {selectedReward.data.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl bg-stone-50 p-4 text-sm text-[#253044]">
                      <div>
                        <strong className="block text-xs uppercase text-[#64748B] mb-0.5">Mô tả & Điều kiện</strong>
                        <p className="text-sm leading-relaxed">{selectedReward.data.description}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-stone-200/60 pt-2.5">
                        <span className="text-xs text-[#64748B]">Điểm thưởng XP:</span>
                        <span className="font-bold text-amber-600">+{selectedReward.data.xpReward || 0} XP</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-stone-200/60 pt-2.5">
                        <span className="text-xs text-[#64748B]">Trạng thái:</span>
                        {selectedReward.data.isUnlocked || selectedReward.data.unlocked ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                            <CheckCircle2 size={14} /> Đã mở khóa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-stone-500">
                            <Lock size={13} /> Đang tiến hành ({selectedReward.data.currentProgress || 0}/{selectedReward.data.conditionValue || 1})
                          </span>
                        )}
                      </div>

                      {selectedReward.data.unlockedAt && (
                        <div className="flex items-center justify-between border-t border-stone-200/60 pt-2.5">
                          <span className="text-xs text-[#64748B]">Thời gian nhận:</span>
                          <span className="text-xs font-semibold text-stone-600">
                            {formatUnlockedDate(selectedReward.data.unlockedAt)}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-6 w-full rounded-xl bg-[#EA580C] py-2.5 text-sm font-bold text-white hover:bg-[#C2410C]"
                    >
                      <BilingualText vi="Đóng" en="Close" />
                    </button>
                  </div>
                ) : (
                  /* Medal Detail */
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-amber-50 text-amber-600 shadow-inner">
                        <Medal size={34} />
                      </div>
                      <div>
                        <span className="inline-block rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-black uppercase text-amber-700">
                          Huy chương Hạng {selectedReward.data.tier}
                        </span>
                        <h3 className="text-xl font-black text-[#1E293B] mt-0.5">
                          {selectedReward.data.titleVi}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl bg-stone-50 p-4 text-sm text-[#253044]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#64748B]">Cấp độ yêu cầu:</span>
                        <span className="font-bold">Cấp {selectedReward.data.level}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-stone-200/60 pt-2.5">
                        <span className="text-xs text-[#64748B]">Mức XP tối thiểu:</span>
                        <span className="font-bold text-amber-600">{selectedReward.data.minXp} XP</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-stone-200/60 pt-2.5">
                        <span className="text-xs text-[#64748B]">Trạng thái của bạn:</span>
                        {userLevel >= selectedReward.data.level ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                            <CheckCircle2 size={14} /> Đã đạt danh hiệu
                          </span>
                        ) : (
                          <span className="font-bold text-stone-500">
                            Cần thêm {Math.max(0, selectedReward.data.minXp - userXp)} XP
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-6 w-full rounded-xl bg-[#EA580C] py-2.5 text-sm font-bold text-white hover:bg-[#C2410C]"
                    >
                      <BilingualText vi="Đóng" en="Close" />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default AchievementsPage;
