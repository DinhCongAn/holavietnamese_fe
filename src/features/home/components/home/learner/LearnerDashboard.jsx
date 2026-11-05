import { BilingualText } from '@/shared/components/common/BilingualText';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight, Award, BookOpen, Check, CircleAlert, Clock3, Flame, Play, RefreshCw, Sparkles, Target, Trophy, Volume2, Zap,
} from 'lucide-react';
import { formatRelativeTime } from '@/constants/notifications';
import { learnerService } from '@/features/learning/api/learnerService';
import { WORD_OF_THE_DAY } from '@/features/home/components/home/data/homeData';
import { speakVietnamese } from '@/utils/speech';
import { LearnerHeroCarousel } from '@/features/home/components/home/learner/LearnerHeroCarousel';
import { LearnerMotivationStrip } from '@/features/home/components/home/learner/LearnerMotivationStrip';
import '@/styles/learner-dashboard.css';
import { BuffaloMascot, MascotOnboarding, MascotSpeechBubble } from '@/shared/components/mascot';
import { SpotlightCard } from '@/shared/components/common/animate/SpotlightCard';

const clampPercent = (value) => Math.min(100, Math.max(0, Number(value) || 0));

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

function getActivityTitle(activity, isVi) {
  if (isVi) {
    if (activity.titleVi) return activity.titleVi;
    if (activity.description) return activity.description;
    if (activity.title) return activity.title;
    if (activity.eventName) return activity.eventName;
    const type = String(activity.eventType || '').toUpperCase();
    if (type.includes('DAILY_CHECKIN') || type.includes('DAILY_LOGIN')) return 'Điểm danh học tập hàng ngày';
    if (type.includes('LESSON')) return 'Hoàn thành bài học';
    if (type.includes('QUIZ')) return 'Hoàn thành bài kiểm tra';
    if (type.includes('VOCAB')) return 'Học và ghi nhớ từ vựng mới';
    if (type.includes('AI_ROLEPLAY')) return 'Hoàn thành tình huống giao tiếp AI';
    return 'Hoàn thành hoạt động học tập';
  }
  if (activity.titleEn) return activity.titleEn;
  if (activity.descriptionEn) return activity.descriptionEn;
  if (activity.description) return activity.description;
  if (activity.title) return activity.title;
  const type = String(activity.eventType || '').toUpperCase();
  if (type.includes('DAILY_CHECKIN') || type.includes('DAILY_LOGIN')) return 'Daily learning check-in';
  if (type.includes('LESSON')) return 'Completed a lesson';
  if (type.includes('QUIZ')) return 'Completed a quiz';
  if (type.includes('VOCAB')) return 'Learned new vocabulary';
  if (type.includes('AI_ROLEPLAY')) return 'Completed an AI roleplay session';
  return 'Completed learning activity';
}

function getActivityTime(activity, isVi) {
  if (activity.time) return activity.time;
  if (activity.createdAt) return formatRelativeTime(activity.createdAt, isVi ? 'vi' : 'en');
  if (activity.transactionDate) return formatRelativeTime(activity.transactionDate, isVi ? 'vi' : 'en');
  return isVi ? 'Gần đây' : 'Recently';
}

function DashboardSkeleton() {
  return (
    <div className="learner-dashboard learner-dashboard--loading" aria-label="Loading dashboard" aria-busy="true">
      <div className="ld-skeleton ld-skeleton--welcome" />
      <div className="ld-skeleton-grid">{[1, 2, 3, 4].map((item) => <div className="ld-skeleton" key={item} />)}</div>
      <div className="ld-skeleton ld-skeleton--main" />
    </div>
  );
}

function StatCard({ label, value, detail, tone }) {
  return (
    <SpotlightCard maxTilt={3} className="h-full">
      <article className={`ld-stat ld-stat--${tone} h-full`}>
      <div><span>{label}</span><strong>{value ?? '—'}</strong><small>{detail}</small></div>
      </article>
    </SpotlightCard>
  );
}

export function LearnerDashboard({ user }) {
  const { t, i18n } = useTranslation('learner');
  const isVi = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('vi');
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    learnerService.getProgressData()
      .then((data) => { if (active) setProgress(data || {}); })
      .catch((requestError) => { if (active) setError(requestError.message || t('dashboard.loadError')); });
    return () => { active = false; };
  }, [t]);

  const currentLesson = progress?.currentLesson;
  const lessonProgress = clampPercent(currentLesson?.progressPercent ?? currentLesson?.progress);
  const dailyGoal = Number(progress?.dailyGoalMinutes) || 0;
  const todayMinutes = Number(progress?.todayMinutes) || 0;
  const dailyPercent = dailyGoal ? clampPercent((todayMinutes / dailyGoal) * 100) : 0;
  const displayName = user?.fullName || user?.username || t('dashboard.learner');
  const lessonId = currentLesson?.lessonId ?? currentLesson?.id;
  const courseId = currentLesson?.courseId;
  const continueTo = courseId && lessonId ? `/courses/${courseId}/lessons/${lessonId}` : courseId ? `/courses/${courseId}/learn` : '/learning-path';
  const activities = Array.isArray(progress?.recentActivities) ? progress.recentActivities : [];
  const quests = Array.isArray(progress?.dailyChallenges) ? progress.dailyChallenges : [];

  const modules = useMemo(() => [
    { to: '/learning-path', title: <BilingualText vi="Lộ trình học" en="Learning roadmap" />, text: <BilingualText vi="Bản đồ bài học tương tác từng bước" en="Step-by-step interactive lesson map." />, tone: 'red' },
    { to: '/vocabulary', title: <BilingualText vi="Từ vựng" en="Vocabulary" />, text: <BilingualText vi="Ôn từ đã lưu và tăng khả năng ghi nhớ." en="Review saved words and build recall." />, tone: 'gold' },
    { to: '/courses', title: <BilingualText vi="Khóa học" en="Courses" />, text: <BilingualText vi="Danh mục khóa học đa dạng theo chủ đề" en="Diverse course catalog organized by topic." />, tone: 'blue' },
    { to: '/ai-tutor', title: <BilingualText vi="Luyện nói với AI" en="AI speaking practice" />, text: <BilingualText vi="Tự tin hơn qua hội thoại có hướng dẫn." en="Build confidence in guided conversations." />, tone: 'green' },
  ], []);

  if (!progress && !error) return <DashboardSkeleton />;

  const entrance = reduceMotion ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="learner-dashboard">
      <MascotOnboarding />
      {error && <div className="ld-alert" role="alert"><CircleAlert size={18} /><span>{error}</span></div>}

      <LearnerMotivationStrip continueTo={continueTo} />

      <LearnerHeroCarousel continueTo={continueTo} />

      <motion.header className="ld-welcome" {...entrance}>
        <div>
          <span className="ld-eyebrow">{t('dashboard.welcome')}</span>
          <h1>{t('dashboard.welcomeName', { name: displayName })}</h1>
          <p>{t('dashboard.welcomeSubtitle')}</p>
        </div>
        <Link to={continueTo} className="ld-button ld-button--primary"><Play size={16} fill="currentColor" />{currentLesson ? t('dashboard.continueLearning') : <BilingualText vi="Xem lộ trình học" en="View learning roadmap" />}</Link>
        <div className="ld-nghe"><MascotSpeechBubble>{currentLesson ? t('mascot.dashboard.continue') : t('mascot.dashboard.start')}</MascotSpeechBubble><BuffaloMascot variant={currentLesson ? 'encouraging' : 'teaching'} size="medium" animated accessibilityLabel={t('mascot.alt')} /></div>
      </motion.header>

      <motion.section className="ld-stats" aria-label={t('dashboard.progressOverview')} {...entrance} transition={{ delay: reduceMotion ? 0 : .05 }}>
        <StatCard tone="orange" label={t('dashboard.streak')} value={progress?.streakCount ?? progress?.currentStreak} detail={t('dashboard.days')} />
        <StatCard tone="gold" label={t('dashboard.totalXp')} value={progress?.totalXp} detail="XP" />
        <StatCard tone="green" label={t('dashboard.completedLessons')} value={progress?.completedLessons ?? progress?.lessonsCompleted} detail={t('dashboard.lessons')} />
        <StatCard tone="red" label={t('dashboard.learningProgress')} value={currentLesson ? `${Math.round(lessonProgress)}%` : null} detail={currentLesson ? t('dashboard.currentLesson') : t('dashboard.noData')} />
      </motion.section>

      <div className="ld-layout">
        <main className="ld-main-column">
          <motion.section className="ld-continue" {...entrance} transition={{ delay: reduceMotion ? 0 : .1 }}>
            <div className="ld-section-label"><span>{t('dashboard.continueSection')}</span><small>{(isVi ? (currentLesson?.courseTitleVi || currentLesson?.courseTitle) : (currentLesson?.courseTitleEn || currentLesson?.courseTitle)) || <BilingualText vi="Lộ trình học của bạn" en="Your learning roadmap" />}</small></div>
            {currentLesson ? (
              <>
                <h2>{isVi ? (currentLesson.titleVi || currentLesson.title) : (currentLesson.titleEn || currentLesson.titleVi || currentLesson.title)}</h2>
                <p>{(isVi ? currentLesson.description : (currentLesson.descriptionEn || currentLesson.description)) || t('dashboard.continueDescription')}</p>
                <div className="ld-progress-copy"><span>{t('dashboard.lessonProgress')}</span><strong>{Math.round(lessonProgress)}%</strong></div>
                <div className="ld-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(lessonProgress)}><span style={{ '--progress': `${lessonProgress}%` }} /></div>
                <div className="ld-continue__footer">
                  <span><Clock3 size={15} />{t('dashboard.resumeHint')}</span>
                  <Link to={continueTo} className="ld-button ld-button--primary">{t('dashboard.continueLearning')}<ArrowRight size={16} /></Link>
                </div>
              </>
            ) : (
              <div className="ld-empty">
                <h2><BilingualText vi="Lộ trình học tập cá nhân hóa" en="Personalized Learning Path" /></h2>
                <p><BilingualText vi="Khám phá bản đồ học tập tiếng Việt theo từng chặng, tích lũy XP và mở khóa các bài học tương tác tiếp theo." en="Explore the Vietnamese learning roadmap station by station, collect XP, and unlock interactive lessons." /></p>
                <div className="ld-empty__actions">
                  <Link to="/learning-path" className="ld-button ld-button--primary">
                    <BilingualText vi="Vào lộ trình học" en="Open learning roadmap" /><ArrowRight size={16} />
                  </Link>
                  <Link to="/courses" className="ld-button ld-button--secondary">
                    {t('dashboard.exploreCourses')}<ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </motion.section>

          <motion.section className="ld-section" {...entrance} transition={{ delay: reduceMotion ? 0 : .15 }}>
            <div className="ld-heading"><div><span>{t('dashboard.quickAccess')}</span><h2>{t('dashboard.learningModules')}</h2></div><Link to="/courses">{t('dashboard.viewAll')}<ArrowRight size={14} /></Link></div>
            <div className="ld-modules">{modules.map((module) => <Link key={module.to} to={module.to} className={`ld-module ld-module--${module.tone}`}><div><h3>{module.title}</h3><p>{module.text}</p></div><ArrowRight size={16} /></Link>)}</div>
          </motion.section>

          <motion.section className="ld-card ld-activity" {...entrance} transition={{ delay: reduceMotion ? 0 : .2 }}>
            <div className="ld-heading">
              <div>
                <span>{t('dashboard.history')}</span>
                <h2>{t('dashboard.recentActivity')}</h2>
              </div>
              <Link to="/progress" className="ld-heading__link inline-flex items-center gap-1 text-xs font-bold text-[#EA580C] hover:text-[#C2410C] transition-colors">
                <BilingualText vi="Xem tất cả" en="View all" />
                <ArrowRight size={14} />
              </Link>
            </div>
            {activities.length ? (
              <div className="ld-activity__modern-list space-y-2.5 mt-4">
                {activities.slice(0, 5).map((activity, index) => {
                  const meta = getActivityMeta(activity);
                  const Icon = meta.icon;
                  const title = getActivityTitle(activity, isVi);
                  const time = getActivityTime(activity, isVi);
                  const xpAmount = activity.xp ?? activity.amount ?? activity.xpReward;

                  return (
                    <div
                      key={activity.id ?? index}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#E8E5DF] hover:border-[#EA580C]/40 hover:bg-[#FFF9F2] transition-all text-left shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.iconBg} ${meta.iconColor}`}>
                          <Icon size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.badgeClass}`}>
                              {isVi ? meta.labelVi : meta.labelEn}
                            </span>
                            <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                              <Clock3 size={11} />
                              {time}
                            </span>
                          </div>
                          <strong className="block text-sm font-bold text-[#253044] truncate" title={title}>
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
              <div className="ld-empty ld-empty--compact p-6 text-center">
                <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#EA580C]">
                  <Clock3 size={24} />
                </span>
                <strong className="block text-sm font-bold text-[#253044]">
                  <BilingualText vi="Chưa có hoạt động gần đây" en="No recent activity yet" />
                </strong>
                <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                  {t('dashboard.noActivity')}
                </p>
                <Link
                  to={continueTo}
                  className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold transition-all shadow-xs !border-0 cursor-pointer"
                >
                  <Play size={13} fill="currentColor" />
                  <BilingualText vi="Bắt đầu học ngay" en="Start learning now" />
                </Link>
              </div>
            )}
          </motion.section>
        </main>

        <aside className="ld-side-column">
          <section className="ld-card ld-daily">
            <div className="ld-heading"><div><span>{t('dashboard.today')}</span><h2>{t('todayChallenges')}</h2></div><Target size={20} /></div>
            <div className="ld-daily__goal"><div><span>{t('dailyGoal')}</span><strong>{todayMinutes}{dailyGoal ? ` / ${dailyGoal}` : ''} {t('minutes')}</strong></div><div className="ld-progress"><span style={{ '--progress': `${dailyPercent}%` }} /></div></div>
            {quests.length ? <div className="ld-quest-list">{quests.slice(0, 4).map((quest, index) => <div key={quest.id ?? index} className={quest.done ? 'is-done' : ''}><span>{quest.done ? <Check size={12} /> : index + 1}</span><div><strong>{isVi ? quest.title : (quest.titleEn || quest.title)}</strong>{quest.progress && <small>{quest.progress}</small>}</div>{quest.xp != null && <b>+{quest.xp} XP</b>}</div>)}</div> : <div className="ld-empty ld-empty--compact"><Target size={23} /><p>{t('challengeEmpty')}</p></div>}
          </section>

          <section className="ld-review-card">
            <span><RefreshCw size={18} /></span><div><h2>{t('dashboard.reviewTitle')}</h2><p>{t('dashboard.reviewText')}</p></div><Link to="/vocabulary/review" aria-label={t('dashboard.reviewAction')}><ArrowRight size={17} /></Link>
          </section>

          <section className="ld-card ld-word">
            <div className="ld-heading"><div><span>{t('dashboard.discovery')}</span><h2>{t('dashboard.wordOfDay')}</h2></div><button type="button" onClick={() => speakVietnamese(WORD_OF_THE_DAY.speechText || WORD_OF_THE_DAY.word)} aria-label={t('dashboard.listenWord', { word: WORD_OF_THE_DAY.word })}><Volume2 size={17} /></button></div>
            <strong>{WORD_OF_THE_DAY.word}</strong>
            <p>
              <BilingualText
                vi={WORD_OF_THE_DAY.descriptionVi || WORD_OF_THE_DAY.description}
                en={WORD_OF_THE_DAY.descriptionEn || "The classic southern Vietnamese opening word, expressing deep respect, politeness, and humility toward elders."}
              />
            </p>
            <small>
              <BilingualText
                vi={WORD_OF_THE_DAY.exampleVi || WORD_OF_THE_DAY.example}
                en={WORD_OF_THE_DAY.exampleEn || 'Example: “Dạ, cho con gửi tiền ạ.”'}
              />
            </small>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default LearnerDashboard;
