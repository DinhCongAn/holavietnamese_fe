import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useState, useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, Clock, CheckCircle2, Play, PlayCircle, Lock, ChevronDown, ChevronUp, MessageCircle, FileText, Headphones, CheckSquare, Compass, Award } from 'lucide-react';
import { courseService } from '@/features/learning/api/courseService';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { CourseThumbnail } from '@/features/learning/components/course/CourseInfo';

/**
 * Phân tích và trả về thông tin hiển thị cho loại bài học (Icon, Tên hiển thị, Badge)
 */
function getLessonTypeInfo(lesson) {
  const rawType = (lesson.lessonType || '').toUpperCase();
  const title = (lesson.title || lesson.titleVi || '').toLowerCase();

  if (
    rawType === 'CONVERSATION' ||
    rawType === 'DIALOGUE' ||
    title.includes('hội thoại') ||
    title.includes('dialogue') ||
    title.includes('chào hỏi')
  ) {
    return {
      labelVi: 'Hội thoại',
      icon: MessageCircle,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
    };
  }

  if (
    rawType === 'VOCABULARY' ||
    title.includes('từ vựng') ||
    title.includes('vocabulary')
  ) {
    return {
      labelVi: 'Từ vựng',
      icon: BookOpen,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    };
  }

  if (
    rawType === 'GRAMMAR' ||
    title.includes('ngữ pháp') ||
    title.includes('grammar')
  ) {
    return {
      labelVi: 'Ngữ pháp',
      icon: FileText,
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80',
    };
  }

  if (
    rawType === 'SPEAKING' ||
    rawType === 'LISTENING' ||
    title.includes('nghe') ||
    title.includes('nói') ||
    title.includes('phát âm')
  ) {
    return {
      labelVi: 'Nghe & Nói',
      icon: Headphones,
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200/80',
    };
  }

  if (
    rawType === 'PRACTICE' ||
    rawType === 'QUIZ' ||
    rawType === 'ASSESSMENT' ||
    title.includes('luyện tập') ||
    title.includes('kiểm tra') ||
    title.includes('quiz')
  ) {
    return {
      labelVi: 'Luyện tập',
      icon: CheckSquare,
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
    };
  }

  if (rawType === 'CULTURE' || title.includes('văn hóa') || title.includes('culture')) {
    return {
      labelVi: 'Văn hóa',
      icon: Compass,
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-200/80',
    };
  }

  return {
    labelVi: 'Bài học',
    icon: PlayCircle,
    badgeClass: 'bg-stone-100 text-stone-700 border-stone-200/80',
  };
}

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return bilingualLabel('15 phút', '15 min');
  if (minutes < 60) return bilingualLabel(`${minutes} phút`, `${minutes} min`);
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : bilingualLabel(`${hours} giờ`, `${hours} hrs`);
}

export function ResumeCoursePage() {
  const { courseId } = useParams();

  const resource = useAsyncResource(
    useMemo(
      () => () =>
        Promise.all([
          courseService.detail(courseId),
          courseService.enrollmentStatus(courseId).catch(() => null),
          courseService.myCourses().catch(() => []),
        ]).then(([course, enrollment, myCourses]) => {
          const courseItem = (Array.isArray(myCourses) ? myCourses : []).find(
            (c) => String(c.courseId || c.id) === String(courseId)
          );
          return {
            course,
            enrollment,
            lastAccessedLessonId: courseItem?.lastAccessedLessonId || null,
          };
        }),
      [courseId]
    )
  );

  return (
    <ResourceState resource={resource}>
      {({ course, enrollment, lastAccessedLessonId }) => {
        // Nếu người dùng chưa đăng ký khóa học, điều hướng về Course Detail
        if (!enrollment?.isEnrolled) {
          return <Navigate replace to={`/courses/${courseId}`} />;
        }

        return (
          <CourseOverviewView
            course={course}
            enrollment={enrollment}
            lastAccessedLessonId={lastAccessedLessonId}
          />
        );
      }}
    </ResourceState>
  );
}

function CourseOverviewView({ course, enrollment, lastAccessedLessonId }) {
  // Chuẩn hóa danh sách module (hỗ trợ metadata, description và gom bài học chưa nhóm)
  const modules = useMemo(() => {
    const existingModules = Array.isArray(course?.modules)
      ? course.modules.map((m) => ({
          ...m,
          titleVi: m.titleVi || m.metadata?.titleVi || m.title,
          descriptionVi: m.descriptionVi || m.metadata?.descriptionVi || m.description,
          descriptionEn: m.descriptionEn || m.metadata?.descriptionEn || m.description,
        }))
      : [];

    const allCourseLessons = Array.isArray(course?.lessons) ? course.lessons : [];

    if (existingModules.length > 0) {
      const moduleLessonIds = new Set();
      existingModules.forEach((m) => {
        (m.lessons || []).forEach((l) => {
          if (l.id != null) moduleLessonIds.add(String(l.id));
        });
      });

      const ungrouped = allCourseLessons.filter(
        (l) => l.id != null && !moduleLessonIds.has(String(l.id))
      );

      if (ungrouped.length > 0) {
        return [
          ...existingModules,
          {
            id: 'ungrouped',
            title: 'Bài học bổ sung',
            titleVi: 'Bài học bổ sung',
            descriptionVi: 'Các bài học tổng hợp và mở rộng trong khóa học',
            descriptionEn: 'Comprehensive and extended lessons in the course',
            lessons: ungrouped,
          },
        ];
      }

      return existingModules;
    }

    if (allCourseLessons.length > 0) {
      return [
        {
          id: 0,
          title: 'Nội dung khóa học',
          titleVi: 'Nội dung khóa học',
          descriptionVi: 'Toàn bộ danh sách bài học của khóa học',
          descriptionEn: 'Complete list of lessons in this course',
          lessons: allCourseLessons,
        },
      ];
    }
    return [];
  }, [course]);

  // Phân tích trạng thái tuần tự cho toàn bộ bài học
  const { allLessons, completedCount, activeLessonId, currentActiveModuleId, lessonStateMap } = useMemo(() => {
    const list = [];
    modules.forEach((mod, mIdx) => {
      const mId = mod.id ?? `mod-${mIdx}`;
      (mod.lessons || []).forEach((les, lIdx) => {
        list.push({
          ...les,
          moduleId: mId,
          uniqueKey: les.id ?? `les-${mIdx}-${lIdx}`,
        });
      });
    });

    const completed = list.filter((l) => l.learningStatus === 'COMPLETED').length;

    // Tìm bài học đang học hiện tại
    let target = null;
    if (lastAccessedLessonId) {
      target = list.find((l) => String(l.id) === String(lastAccessedLessonId));
    }
    if (target && target.learningStatus === 'COMPLETED') {
      const targetIdx = list.findIndex((l) => String(l.id) === String(target.id));
      const nextIncomplete = list.slice(targetIdx + 1).find((l) => l.learningStatus !== 'COMPLETED')
        || list.find((l) => l.learningStatus !== 'COMPLETED');
      if (nextIncomplete) {
        target = nextIncomplete;
      }
    }
    if (!target) {
      target = list.find((l) => l.learningStatus !== 'COMPLETED') || list[list.length - 1];
    }

    const stateMap = {};
    let passedActive = false;

    list.forEach((l) => {
      const isDone = l.learningStatus === 'COMPLETED';
      let status = 'LOCKED';

      if (isDone) {
        status = 'COMPLETED';
      } else if (!passedActive && String(l.id) === String(target?.id)) {
        status = 'IN_PROGRESS';
        passedActive = true;
      } else if (!passedActive) {
        status = 'AVAILABLE';
      } else {
        status = 'LOCKED';
      }

      stateMap[l.uniqueKey] = status;
    });

    return {
      allLessons: list,
      completedCount: completed,
      activeLessonId: target?.id || list[0]?.id || null,
      currentActiveModuleId: target?.moduleId || modules[0]?.id || 0,
      lessonStateMap: stateMap,
    };
  }, [modules, lastAccessedLessonId]);

  const totalLessons = allLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isFullyCompleted = totalLessons > 0 && completedCount === totalLessons;

  // Quản lý đóng/mở Module Accordion
  const [expandedModules, setExpandedModules] = useState(() => {
    const set = new Set();
    if (currentActiveModuleId !== null && currentActiveModuleId !== undefined) {
      set.add(currentActiveModuleId);
    } else if (modules[0]) {
      set.add(modules[0].id ?? 0);
    }
    return set;
  });

  const toggleModule = (id) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllExpanded = modules.length > 0 && expandedModules.size >= modules.length;
  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedModules(new Set());
    } else {
      setExpandedModules(new Set(modules.map((m, idx) => m.id ?? idx)));
    }
  };

  // Toast khi bấm vào bài học bị khóa
  const [lockedToast, setLockedToast] = useState(null);
  const handleLockedClick = (lessonTitle) => {
    setLockedToast(bilingualLabel(`Bài "${lessonTitle}" đang khóa. Hãy hoàn thành các bài học trước để mở khóa nhé!`, `Lesson "${lessonTitle}" is locked. Complete previous lessons to unlock!`));
    setTimeout(() => setLockedToast(null), 4000);
  };

  // Nút hành động chính
  const resumeUrl = activeLessonId ? `/courses/${course.id}/lessons/${activeLessonId}` : null;

  return (
    <div className="course-overview-page w-full max-w-[1560px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 space-y-8">
      {/* Toast thông báo bài học bị khóa */}
      {lockedToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#253044] text-[#FFF7E8] px-5 py-3.5 rounded-2xl shadow-2xl border border-amber-400/50 max-w-md animate-bounce-subtle"
        >
          <Lock size={18} className="text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{lockedToast}</span>
        </div>
      )}

      {/* Điều hướng quay lại */}
      <div className="flex items-center justify-between">
        <Link
          to={`/courses/${course.id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#253044] transition-colors"
        >
          <ArrowLeft size={15} />
          <span><BilingualText>{"Trở lại thông tin khóa học"}</BilingualText></span>
        </Link>

        <Link
          to="/my-learning"
          className="text-xs font-bold text-[#EA580C] hover:underline"
        >
          <BilingualText>{"Góc học tập của tôi →"}</BilingualText>
        </Link>
      </div>

      {/* Hero Overview Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF7E8] via-[#F7F0E3] to-[#EEE3D1] border border-[#E8E5DF] p-6 sm:p-10 shadow-sm">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#FF7A00] text-white font-extrabold text-xs uppercase tracking-wider shadow-xs">
              {course.level}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <BilingualText>{"Đã đăng ký học"}</BilingualText>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#253044] tracking-tight">
            <BilingualText vi={course.titleVi || course.title} en={course.title} />
          </h1>

          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-3xl">
            <BilingualText vi={course.descriptionVi || course.description} en={course.description} />
          </p>

          {/* Progress summary banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-[#E8E5DF]/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 mt-4">
            <div className="space-y-2 flex-1 max-w-lg">
              <div className="flex items-center justify-between text-xs font-bold text-[#253044]">
                <span className="flex items-center gap-1.5">
                  <Award size={15} className="text-[#FF7A00]" />
                  <span><BilingualText vi="Tiến độ tổng thể" en="Overall progress" /></span>
                </span>
                <span className="text-[#FF7A00]">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#E8E5DF]/40 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFullyCompleted ? 'bg-emerald-600' : 'bg-[#FF7A00]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-[#64748B]">
                <BilingualText vi={<><BilingualText vi={<>Đã hoàn thành <strong>{completedCount}</strong> trên tổng số <strong>{totalLessons}</strong> bài học</>} en={<>Completed <strong>{completedCount}</strong> of <strong>{totalLessons}</strong> lessons</>} /></>} en={<>Completed <strong>{completedCount}</strong> of <strong>{totalLessons}</strong> lessons</>} />
              </p>
            </div>

            {/* Resume button */}
            {resumeUrl && (
              <div className="shrink-0">
                <Link
                  to={resumeUrl}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FF7A00] hover:bg-[#EA580C] text-white font-black text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <Play size={16} fill="white" />
                  <BilingualText>
                    {isFullyCompleted
                      ? 'Xem lại từ bài đầu →'
                      : completedCount > 0
                      ? 'Tiếp tục học ngay →'
                      : 'Bắt đầu bài đầu tiên →'}
                  </BilingualText>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Curriculum Roadmap Header with Expand/Collapse All */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DF]/60">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#253044] tracking-tight">
              <BilingualText>{"Lộ trình bài học chi tiết"}</BilingualText>
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              <BilingualText>{"Hoàn thành từng bài để mở khóa các bài tiếp theo trong chương."}</BilingualText>
            </p>
          </div>

          <button
            type="button"
            onClick={toggleAll}
            className="text-xs font-bold text-[#EA580C] hover:underline px-3 py-1.5 rounded-lg bg-[#FFF7E8] border border-[#E8E5DF] cursor-pointer"
          >
            {isAllExpanded ? <BilingualText vi="Thu gọn tất cả" en="Collapse all" /> : <BilingualText vi="Mở rộng tất cả" en="Expand all" />}
          </button>
        </div>

        {/* Modules Accordion */}
        <div className="space-y-4">
          {modules.map((module, mIdx) => {
            const mId = module.id ?? `mod-${mIdx}`;
            const isExpanded = expandedModules.has(mId);
            const moduleLessons = module.lessons || [];
            const moduleCompletedCount = moduleLessons.filter(
              (l) => l.learningStatus === 'COMPLETED'
            ).length;
            const isModuleDone = moduleLessons.length > 0 && moduleCompletedCount === moduleLessons.length;

            return (
              <div
                key={mId}
                className={`module-card rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-[#E8E5DF] bg-white shadow-xs'
                    : 'border-[#E8E5DF]/70 bg-white/70 hover:bg-white'
                }`}
              >
                {/* Module Header Bar */}
                <button
                  type="button"
                  onClick={() => toggleModule(mId)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isModuleDone
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-[#FFF7E8] text-[#253044] border border-[#E8E5DF]'
                      }`}
                    >
                      {isModuleDone ? <CheckCircle2 size={16} /> : mIdx + 1}
                    </span>

                    <div>
                      <h3 className="text-sm sm:text-base font-black text-[#253044]">
                        <BilingualText vi={module.titleVi || module.title} en={module.title} />
                      </h3>
                      {(module.descriptionVi || module.description || module.metadata?.descriptionVi) && (
                        <p className="text-xs text-[#64748B] line-clamp-2 mt-0.5 font-normal">
                          <BilingualText
                            vi={module.descriptionVi || module.metadata?.descriptionVi || module.description}
                            en={module.description || module.metadata?.descriptionEn}
                          />
                        </p>
                      )}
                      <p className="text-[11px] text-[#64748B] flex items-center gap-2 mt-1">
                        <span><BilingualText vi={`${moduleLessons.length} bài học`} en={`${moduleLessons.length} lessons`} /></span>
                        <span>•</span>
                        <span className={isModuleDone ? 'text-emerald-700 font-bold' : ''}>
                          <BilingualText
                            vi={`${moduleCompletedCount}/${moduleLessons.length} đã hoàn thành`}
                            en={`${moduleCompletedCount}/${moduleLessons.length} completed`}
                          />
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[#64748B]">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {/* Module Lessons List */}
                {isExpanded && (
                  <div className="border-t border-[#E8E5DF]/40 bg-[#FFF7E8]/20 p-3 sm:p-4 space-y-2">
                    {moduleLessons.map((lesson, lIdx) => {
                      const uKey = lesson.id ?? `les-${mIdx}-${lIdx}`;
                      const status = lessonStateMap[uKey] || 'LOCKED';
                      const typeInfo = getLessonTypeInfo(lesson);
                      const TypeIcon = typeInfo.icon;
                      const isCompleted = status === 'COMPLETED';
                      const isCurrent = status === 'IN_PROGRESS';
                      const isLocked = status === 'LOCKED';
                      const lessonTitle = lesson.titleVi || lesson.title || `Bài học ${lIdx + 1}`;

                      const content = (
                        <div
                          className={`flex items-center justify-between gap-4 p-3.5 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-amber-50/80 border-[#FFCD00] shadow-sm ring-1 ring-[#FFCD00]/50'
                              : isCompleted
                              ? 'bg-white border-emerald-200/80 hover:border-emerald-300'
                              : isLocked
                              ? 'bg-stone-50/60 border-stone-200/60 opacity-60'
                              : 'bg-white border-[#E8E5DF]/70 hover:border-[#EA580C]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Icon trạng thái bài học */}
                            <span
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isCurrent
                                  ? 'bg-[#FF7A00] text-white shadow-xs animate-pulse-subtle'
                                  : isLocked
                                  ? 'bg-stone-200/70 text-stone-500'
                                  : 'bg-[#FFF7E8] text-[#253044] border border-[#E8E5DF]'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 size={16} />
                              ) : isCurrent ? (
                                <Play size={14} fill="currentColor" />
                              ) : isLocked ? (
                                <Lock size={14} />
                              ) : (
                                <span className="text-xs font-bold">{lIdx + 1}</span>
                              )}
                            </span>

                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeInfo.badgeClass}`}
                                >
                                  <TypeIcon size={11} />
                                  <span><BilingualText vi={typeInfo.labelVi} en={typeInfo.labelEn} /></span>
                                </span>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 rounded-md bg-[#FF7A00] text-white text-[10px] font-bold uppercase tracking-wider">
                                    <BilingualText vi="Đang học" en="In Progress" />
                                  </span>
                                )}
                              </div>

                              <h4 className="text-xs sm:text-sm font-bold text-[#253044]">
                                <BilingualText vi={lesson.titleVi || lesson.title} en={lesson.title} />
                              </h4>

                              {(lesson.descriptionVi || lesson.description || lesson.objectiveVi || lesson.objectiveEn) && (
                                <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5 font-normal">
                                  <BilingualText
                                    vi={lesson.descriptionVi || lesson.objectiveVi || lesson.description}
                                    en={lesson.description || lesson.objectiveEn}
                                  />
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[11px] text-[#64748B] flex items-center gap-1 hidden sm:inline-flex">
                              <Clock size={12} />
                              <span>{formatDuration(lesson.estimatedMinutes)}</span>
                            </span>

                            {isLocked ? (
                              <button
                                type="button"
                                onClick={() => handleLockedClick(lessonTitle)}
                                aria-label={bilingualLabel(`Bài học ${lessonTitle} đang bị khóa`, `Lesson ${lessonTitle} is locked`)}
                                className="p-2 text-stone-400 hover:text-stone-600 cursor-pointer"
                              >
                                <Lock size={15} />
                              </button>
                            ) : (
                              <span className="w-7 h-7 rounded-lg bg-[#FFF0DC] text-[#EA580C] flex items-center justify-center text-xs font-bold group-hover:bg-[#FDE1B3] group-hover:text-[#EA580C] border border-[#EA580C]/20 transition-all">
                                <Play size={12} fill="currentColor" />
                              </span>
                            )}
                          </div>
                        </div>
                      );

                      if (isLocked) {
                        return (
                          <div
                            key={uKey}
                            onClick={() => handleLockedClick(lessonTitle)}
                            className="cursor-pointer"
                          >
                            {content}
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={uKey}
                          to={`/courses/${course.id}/lessons/${lesson.id}`}
                          className="block text-decoration-none group"
                        >
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
