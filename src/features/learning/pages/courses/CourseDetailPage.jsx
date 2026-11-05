import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCourse } from '@/features/learning/hooks/useCourses';
import { CourseThumbnail } from '@/features/learning/components/course/CourseInfo';
import { ResourceState } from '@/shared/components/common/ResourceState';
import { courseService } from '@/features/learning/api/courseService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ArrowLeft, CheckCircle2, BookOpen, Clock, ChevronDown, Play, PlayCircle, Lock, Compass, MessageCircle, FileText, Headphones, CheckSquare, ShieldCheck, AlertCircle, X, ArrowRight } from 'lucide-react';

/**
 * Phân tích và trả về thông tin hiển thị cho loại bài học (Icon, Tên hiển thị, Màu sắc)
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
      type: 'DIALOGUE',
      labelVi: 'Hội thoại',
      labelEn: 'Dialogue',
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
      type: 'VOCABULARY',
      labelVi: 'Từ vựng',
      labelEn: 'Vocabulary',
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
      type: 'GRAMMAR',
      labelVi: 'Ngữ pháp',
      labelEn: 'Grammar',
      icon: FileText,
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80',
    };
  }

  if (
    rawType === 'SPEAKING' ||
    rawType === 'LISTENING' ||
    title.includes('nghe') ||
    title.includes('nói') ||
    title.includes('phát âm') ||
    title.includes('giao tiếp')
  ) {
    return {
      type: 'SPEAKING',
      labelVi: 'Nghe & Nói',
      labelEn: 'Listening & Speaking',
      icon: Headphones,
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200/80',
    };
  }

  if (
    rawType === 'PRACTICE' ||
    rawType === 'QUIZ' ||
    rawType === 'ASSESSMENT' ||
    rawType === 'REVIEW' ||
    title.includes('luyện tập') ||
    title.includes('kiểm tra') ||
    title.includes('đánh giá') ||
    title.includes('quiz')
  ) {
    return {
      type: 'PRACTICE',
      labelVi: 'Luyện tập & Quiz',
      labelEn: 'Practice & Quiz',
      icon: CheckSquare,
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
    };
  }

  if (rawType === 'CULTURE' || title.includes('văn hóa') || title.includes('culture')) {
    return {
      type: 'CULTURE',
      labelVi: 'Văn hóa',
      labelEn: 'Culture',
      icon: Compass,
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-200/80',
    };
  }

  return {
    type: 'LESSON',
    labelVi: 'Bài học',
      labelEn: 'Lesson',
    icon: PlayCircle,
    badgeClass: 'bg-stone-100 text-stone-700 border-stone-200/80',
  };
}

/**
 * Định dạng thời lượng từ phút sang dạng dễ đọc: X phút hoặc Xh Ym
 */
function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return bilingualLabel('0 phút', '0 min');
  if (minutes < 60) return bilingualLabel(`${minutes} phút`, `${minutes} min`);
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : bilingualLabel(`${hours} giờ`, `${hours} hrs`);
}

/**
 * Chuẩn đầu ra mặc định theo trình độ nếu backend chưa cấu hình learningOutcomes
 */
const DEFAULT_OUTCOMES_BY_LEVEL = {
  A0: [
    'Nắm vững 29 chữ cái tiếng Việt và các quy tắc ghép vần chuẩn xác',
    'Phát âm chuẩn xác 6 thanh điệu đặc trưng cùng trợ lý AI Tutor',
    'Tự tin đọc và nhận biết các từ vựng căn bản trong đời sống hàng ngày',
    'Giao tiếp những câu chào hỏi, cảm ơn và xin lỗi sơ đẳng',
  ],
  A1: [
    'Tự tin giao tiếp các chủ đề thông dụng: Chào hỏi, giới thiệu bản thân, mua sắm',
    'Làm chủ hơn 300 từ vựng cốt lõi và các cấu trúc câu giao tiếp căn bản',
    'Luyện phát âm chuẩn giọng Bắc - Nam với sự trợ giúp của AI Tutor',
    'Hiểu nét văn hóa xưng hô lễ phép đặc trưng của người Việt Nam',
  ],
  A2: [
    'Giao tiếp trôi chảy các tình huống công việc, ẩm thực, du lịch và phương tiện',
    'Mở rộng vốn từ hơn 600 từ vựng và câu ghép mở rộng ngữ pháp',
    'Tự tin chia sẻ cảm xúc, sở thích, lịch trình và câu chuyện cá nhân',
    'Khám phá văn hóa ẩm thực và danh lam thắng cảnh qua bài học ngữ cảnh',
  ],
  B1: [
    'Thảo luận đa chiều về các chủ đề văn hóa, xã hội và phong tục tập quán',
    'Làm chủ ngữ điệu biểu cảm và phản xạ giao tiếp tự nhiên như người bản xứ',
    'Đọc hiểu tài liệu ngắn, tin tức và các đoạn hội thoại nâng cao',
    'Kỹ năng viết đoạn văn và phản hồi tương tác linh hoạt trong đời sống',
  ],
};

const getModuleKey = (m, idx) => (m?.id !== undefined && m?.id !== null ? m.id : `mod-${idx}`);
const getLessonKey = (l, mIdx, lIdx) => (l?.id !== undefined && l?.id !== null ? l.id : `les-${mIdx}-${lIdx}`);

/**
 * Giao diện chi tiết khóa học
 */
function CourseDetailView({ course, courseId, enrollment, onReload }) {
  useTextLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Xác định chính xác trạng thái đã đăng ký
  const isEnrolled = !!(
    enrollment?.isEnrolled ||
    (enrollment?.status && ['ACTIVE', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].includes(enrollment.status)) ||
    (course?.enrollment?.status && ['ACTIVE', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].includes(course.enrollment.status))
  );

  const targetCourseId = course?.id || courseId;

  // Lấy danh sách module (hỗ trợ module lồng nhau, metadata và gom toàn bộ bài học chưa nhóm)
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
      // Thu thập toàn bộ ID bài học đã có trong các module
      const moduleLessonIds = new Set();
      existingModules.forEach((m) => {
        (m.lessons || []).forEach((l) => {
          if (l.id != null) moduleLessonIds.add(String(l.id));
        });
      });

      // Tìm những bài học có trong course.lessons nhưng chưa thuộc module nào
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
          title: 'Bài học',
          titleVi: 'Nội dung bài học',
          descriptionVi: 'Toàn bộ danh sách bài học của khóa học',
          descriptionEn: 'Complete list of lessons in this course',
          lessons: allCourseLessons,
        },
      ];
    }

    return [];
  }, [course?.modules, course?.lessons]);

  // Phân tích trạng thái khóa/mở khóa của toàn bộ bài học
  const {
    allLessons,
    totalLessons,
    completedLessons,
    progressPercent,
    activeLessonId,
    activeModuleKey,
    statusMap,
  } = useMemo(() => {
    const flattened = [];
    modules.forEach((m, mIdx) => {
      const mKey = getModuleKey(m, mIdx);
      (m.lessons || []).forEach((l, lIdx) => {
        flattened.push({
          ...l,
          moduleKey: mKey,
          uniqueKey: getLessonKey(l, mIdx, lIdx),
        });
      });
    });

    const total = flattened.length;
    const completed = flattened.filter((l) => l.learningStatus === 'COMPLETED').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Khi người học CHƯA ĐĂNG KÝ: Tất cả bài học đều bị khóa
    if (!isEnrolled) {
      const map = {};
      flattened.forEach((l) => {
        map[l.uniqueKey] = {
          isLocked: true,
          isCompleted: false,
          isNext: false,
        };
      });
      return {
        allLessons: flattened,
        totalLessons: total,
        completedLessons: 0,
        progressPercent: 0,
        activeLessonId: null,
        activeModuleKey: modules[0] ? getModuleKey(modules[0], 0) : null,
        statusMap: map,
      };
    }

    // Khi người học ĐÃ ĐĂNG KÝ: chỉ mở bài khi tất cả bài đứng trước đã hoàn thành.
    const firstIncomplete = flattened.find((l) => l.learningStatus !== 'COMPLETED');
    const currentActive = firstIncomplete || flattened[flattened.length - 1] || null;

    let allPreviousLessonsCompleted = true;
    const map = {};

    flattened.forEach((l) => {
      const isCompleted = l.learningStatus === 'COMPLETED';
      const isLocked = !allPreviousLessonsCompleted;
      const isNext = !isLocked && !isCompleted;

      map[l.uniqueKey] = {
        isLocked,
        isCompleted,
        isNext,
      };

      allPreviousLessonsCompleted = allPreviousLessonsCompleted && isCompleted;
    });

    return {
      allLessons: flattened,
      totalLessons: total,
      completedLessons: completed,
      progressPercent: percent,
      activeLessonId: currentActive?.id || null,
      activeModuleKey: currentActive?.moduleKey || (modules[0] ? getModuleKey(modules[0], 0) : null),
      statusMap: map,
    };
  }, [modules, isEnrolled]);

  const isCompleted = isEnrolled && ((totalLessons > 0 && completedLessons === totalLessons) || enrollment?.status === 'COMPLETED' || enrollment?.progressPercentage === 100);

  // Quản lý trạng thái đóng/mở Accordion của từng Module
  const [expandedModules, setExpandedModules] = useState(() => {
    const initial = new Set();
    if (activeModuleKey != null) {
      initial.add(activeModuleKey);
    } else if (modules[0]) {
      initial.add(getModuleKey(modules[0], 0));
    }
    return initial;
  });

  const toggleModule = (moduleKey) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleKey)) {
        next.delete(moduleKey);
      } else {
        next.add(moduleKey);
      }
      return next;
    });
  };

  const isAllExpanded = modules.length > 0 && expandedModules.size >= modules.length;
  const toggleAllModules = () => {
    if (isAllExpanded) {
      setExpandedModules(new Set());
    } else {
      setExpandedModules(new Set(modules.map((m, idx) => getModuleKey(m, idx))));
    }
  };

  // Quản lý Toast thông báo khi bấm vào bài học bị khóa
  const [toastData, setToastData] = useState(null);
  const toastTimerRef = useRef(null);

  const closeToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastData(null);
  };

  const handleLockedClick = (e, lessonTitle) => {
    e.preventDefault();
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    if (!isEnrolled) {
      setToastData({
        message: bilingualLabel(
          `Bạn cần đăng ký khóa học để truy cập bài học "${lessonTitle}".`,
          `You need to enroll in this course to access "${lessonTitle}".`
        ),
        type: 'NOT_ENROLLED',
      });
    } else {
      setToastData({
        message: bilingualLabel(
          `Bài "${lessonTitle}" đang bị khóa. Hãy hoàn thành các bài học trước để mở khóa nhé!`,
          `Lesson "${lessonTitle}" is locked. Complete previous lessons to unlock!`
        ),
        type: 'LOCKED_NEXT',
      });
    }

    toastTimerRef.current = setTimeout(() => {
      setToastData(null);
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Tính tổng thời lượng khóa học
  const totalDurationMinutes = useMemo(() => {
    if (course.estimatedMinutes || course.estimatedDuration) {
      return course.estimatedMinutes || course.estimatedDuration;
    }
    let sum = 0;
    allLessons.forEach((l) => {
      sum += Number(l.estimatedMinutes || l.estimatedDuration || 15);
    });
    return sum || 60;
  }, [course, allLessons]);

  // Chuẩn đầu ra (Bilingual support & sạch sẽ)
  const outcomes = useMemo(() => {
    const raw = String(course.learningOutcomes || '').trim();
    if (!raw) {
      return (DEFAULT_OUTCOMES_BY_LEVEL[course.level] || DEFAULT_OUTCOMES_BY_LEVEL.A1).map((t) => ({ vi: t, en: '' }));
    }

    // Trường hợp 1: Dạng phân tách bởi dấu gạch chéo "vi1; vi2 / en1; en2"
    if (raw.includes(' / ')) {
      const [viBlock, enBlock] = raw.split(' / ');
      const viItems = viBlock.split(';').map((s) => s.trim()).filter(Boolean);
      const enItems = (enBlock || '').split(';').map((s) => s.trim()).filter(Boolean);
      return viItems.map((vi, idx) => ({
        vi,
        en: enItems[idx] || '',
      }));
    }

    // Trường hợp 2: Dạng 2 dòng Vi và En
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 2 && !lines[0].includes(';') && !lines[1].includes(';')) {
      return [{ vi: lines[0], en: lines[1] }];
    }

    // Trường hợp 3: Danh sách nhiều dòng hoặc phân tách bởi dấu chấm phẩy
    const items = [];
    lines.forEach((line) => {
      line.split(';').map((s) => s.trim()).filter(Boolean).forEach((piece) => {
        if (piece.includes(' / ')) {
          const [vi, en] = piece.split(' / ').map((s) => s.trim());
          items.push({ vi, en: en || '' });
        } else {
          items.push({ vi: piece, en: '' });
        }
      });
    });

    if (items.length > 0) return items;
    return (DEFAULT_OUTCOMES_BY_LEVEL[course.level] || DEFAULT_OUTCOMES_BY_LEVEL.A1).map((t) => ({ vi: t, en: '' }));
  }, [course.learningOutcomes, course.level]);

  // Xử lý đăng ký khóa học (Enroll)
  const [enrollPending, setEnrollPending] = useState(false);
  const [enrollError, setEnrollError] = useState(null);

  async function handleEnroll() {
    // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập kèm đường dẫn hiện tại
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setEnrollPending(true);
    setEnrollError(null);
    try {
      const result = await courseService.enroll(targetCourseId);
      if (!result?.isEnrolled) throw new Error(bilingualLabel('Đăng ký khóa học chưa hoàn tất. Vui lòng thử lại.', 'Course enrollment incomplete. Please try again.'));
      closeToast();
      onReload?.();
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        navigate('/login', { state: { from: location.pathname } });
      } else {
        setEnrollError(err.message || bilingualLabel('Không thể đăng ký khóa học vào lúc này.', 'Unable to enroll in course at this time.'));
      }
    } finally {
      setEnrollPending(false);
    }
  }

  // Đường dẫn tiếp tục học
  const continueLearnUrl = activeLessonId
    ? `/courses/${targetCourseId}/lessons/${activeLessonId}`
    : `/courses/${targetCourseId}/learn`;

  return (
    <div className="course-detail-view w-full space-y-8">
      {/* Toast thông báo tương tác bài học bị khóa */}
      {toastData && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-between gap-4 bg-[#253044] text-[#FFF7E8] px-5 py-3.5 rounded-2xl shadow-2xl border border-[#FFCD00]/50 max-w-lg transition-all animate-bounce-subtle"
        >
          <div className="flex items-center gap-3">
            <Lock size={18} className="text-[#FFCD00] shrink-0" />
            <span className="text-xs sm:text-sm font-semibold leading-snug">{toastData.message}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {toastData.type === 'NOT_ENROLLED' ? (
              <button
                type="button"
                onClick={handleEnroll}
                disabled={enrollPending}
                className="px-3 py-1.5 rounded-xl bg-[#FF7A00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <BilingualText vi="Đăng ký ngay" en="Enroll now" />
              </button>
            ) : (
              <Link
                to={continueLearnUrl}
                onClick={closeToast}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FF7A00] hover:bg-[#EA580C] text-white font-bold text-xs shadow-xs transition-colors"
              >
                <span><BilingualText vi="Học tiếp" en="Continue" /></span>
                <ArrowRight size={12} />
              </Link>
            )}

            <button
              type="button"
              onClick={closeToast}
              aria-label={bilingualLabel("Đóng thông báo", "Close notification")}
              className="p-1 rounded-lg text-[#FFF7E8]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Bố cục chính Desktop: 68% trái, 32% phải sticky */}
      <div className="grid grid-cols-1 lg:grid-cols-[66fr_34fr] xl:grid-cols-[68fr_32fr] 2xl:grid-cols-[70fr_30fr] gap-8 xl:gap-10 items-start">
        {/* ===================== CỘT TRÁI: GIỚI THIỆU, CHUẨN ĐẦU RA, DANH SÁCH MODULE ===================== */}
        <div className="w-full space-y-8">
          {/* 1. Phần Giới Thiệu Khóa Học */}
          <section className="bg-gradient-to-br from-[#FFF7E8] via-[#FDFBF7] to-[#F7F0E3] rounded-3xl border border-[#E8E5DF] p-8 sm:p-10 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full bg-[#FF7A00] text-white font-extrabold text-xs uppercase tracking-wider shadow-xs">
                {course.level}
              </span>

              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFF2D6] text-[#EA580C] border border-[#FFCD00]/50 font-bold text-xs">
                <BilingualText>{course.isFree ? 'Khóa học miễn phí' : 'Khóa học chính thức'}</BilingualText>
              </span>

              {isEnrolled && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs">
                  <CheckCircle2 size={13} className="text-emerald-700" />
                  <BilingualText>{"Đã tham gia học"}</BilingualText>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#253044] tracking-tight leading-tight">
              <BilingualText vi={course.titleVi || course.title} en={course.title} />
            </h1>

            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed preserve-lines">
              <BilingualText vi={course.descriptionVi || course.description} en={course.description} />
            </p>

            {/* Các điểm nổi bật */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-[#E8E5DF]/50 text-xs font-semibold text-[#253044]">
                <BilingualText vi="Lộ trình theo chuẩn CEFR" en="CEFR standard roadmap" />
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-[#E8E5DF]/50 text-xs font-semibold text-[#253044]">
                <BilingualText vi="Hội thoại thực tế & AI Tutor" en="Real conversation & AI Tutor" />
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-[#E8E5DF]/50 text-xs font-semibold text-[#253044]">
                <BilingualText vi="Luyện tập & Đánh giá tức thì" en="Practice & instant assessment" />
              </div>
            </div>
          </section>

          {/* 2. Phần Chuẩn Đầu Ra (Learning Outcomes) */}
          {outcomes.length > 0 && (
            <section className="bg-white rounded-3xl border border-[#E8E5DF] p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#253044] tracking-tight">
                    <BilingualText>{"Bạn sẽ học được gì từ khóa học này"}</BilingualText>
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    <BilingualText>{"Chuẩn đầu ra và các kỹ năng ngôn ngữ cốt lõi sau khóa học."}</BilingualText>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {outcomes.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FFF7E8] border border-[#E8E5DF]/60 hover:border-[#FFCD00] transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-[#253044] leading-snug">
                      <BilingualText vi={item.vi} en={item.en || undefined} />
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Điều kiện tiên quyết & Yêu cầu khóa học (nếu có) */}
          {(course.requirementsVi || course.requirements || course.prerequisitesVi || course.prerequisites || course.targetAudienceVi || course.targetAudience) && (
            <section className="bg-white rounded-3xl border border-[#E8E5DF] p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={22} className="text-[#FF7A00] shrink-0" />
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[#253044] tracking-tight">
                    <BilingualText>{"Yêu cầu & Đối tượng phù hợp"}</BilingualText>
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    <BilingualText>{"Thông tin chuẩn bị trước khi tham gia khóa học."}</BilingualText>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF7E8] border border-[#E8E5DF]/60 text-xs sm:text-sm text-[#253044] leading-relaxed">
                <BilingualText
                  vi={course.requirementsVi || course.prerequisitesVi || course.targetAudienceVi || course.requirements || course.prerequisites}
                  en={course.requirements || course.prerequisites || course.targetAudience}
                />
              </div>
            </section>
          )}

          {/* 3. Phần Danh Sách Module & Bài Học (Accordion) */}
          <section className="bg-white rounded-3xl border border-[#E8E5DF] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E5DF]/40 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen size={22} className="text-[#FF7A00]" />
                  <h2 className="text-lg sm:text-xl font-black text-[#253044] tracking-tight">
                    <BilingualText>{"Nội dung khóa học"}</BilingualText>
                  </h2>
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  <span>{modules.length} modules</span>
                  <span className="mx-1.5">•</span>
                  <span><BilingualText vi={`${totalLessons} bài học`} en={`${totalLessons} lessons`} /></span>
                  <span className="mx-1.5">•</span>
                  <span>{formatDuration(totalDurationMinutes)} <BilingualText vi="thời lượng" en="total duration" /></span>
                </p>
              </div>

              {modules.length > 1 && (
                <button
                  type="button"
                  onClick={toggleAllModules}
                  className="self-start sm:self-center text-xs font-bold !text-[#EA580C] hover:!text-white transition-colors py-1.5 px-3 rounded-xl !bg-[#FFF2D6]/70 hover:!bg-[#C2410C] border border-[#FFCD00]/50 hover:border-[#C2410C] cursor-pointer shadow-2xs"
                >
                  <BilingualText vi={isAllExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'} en={isAllExpanded ? 'Collapse all' : 'Expand all'} />
                </button>
              )}
            </div>

            {/* Danh sách các Module */}
            {modules.length === 0 ? (
              <p className="text-xs text-[#64748B] italic py-4">
                <BilingualText>{"Chưa có nội dung bài học nào được công bố."}</BilingualText>
              </p>
            ) : (
              <div className="space-y-4">
                {modules.map((module, mIdx) => {
                  const moduleKey = getModuleKey(module, mIdx);
                  const isExpanded = expandedModules.has(moduleKey);
                  const moduleLessons = module.lessons || [];

                  // Tính toán thời lượng và tiến độ trong module
                  let moduleMinutes = 0;
                  let completedCountInModule = 0;
                  moduleLessons.forEach((l) => {
                    moduleMinutes += Number(l.estimatedMinutes || l.estimatedDuration || 15);
                    if (l.learningStatus === 'COMPLETED') completedCountInModule += 1;
                  });

                  const isModuleFinished =
                    moduleLessons.length > 0 && completedCountInModule === moduleLessons.length;

                  return (
                    <div
                      key={moduleKey}
                      className="rounded-2xl border border-[#E8E5DF] overflow-hidden bg-[#FFFDF9] transition-all shadow-xs"
                    >
                      {/* Nút Accordion Header của Module */}
                      <button
                        type="button"
                        onClick={() => toggleModule(moduleKey)}
                        className="group w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer !bg-transparent hover:!bg-[#C2410C] transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF7A00]"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-center gap-3.5 pr-2">
                          <span className="w-8 h-8 rounded-xl bg-[#FFF2D6] text-[#EA580C] font-black text-xs flex items-center justify-center shrink-0 border border-[#FFCD00]/40 shadow-2xs">
                            {mIdx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#EA580C] group-hover:text-white uppercase tracking-wide transition-colors">
                                Module {mIdx + 1}
                              </span>
                              {isModuleFinished && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 size={11} />
                                  <BilingualText vi="Hoàn thành" en="Completed" />
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-[#253044] group-hover:text-white leading-snug transition-colors">
                              <BilingualText vi={module.titleVi || module.title} en={module.title} />
                            </h3>
                            {(module.descriptionVi || module.description || module.metadata?.descriptionVi) && (
                              <p className="text-xs text-[#64748B] group-hover:text-white/90 line-clamp-2 mt-1 font-normal transition-colors">
                                <BilingualText
                                  vi={module.descriptionVi || module.metadata?.descriptionVi || module.description}
                                  en={module.description || module.metadata?.descriptionEn}
                                />
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#64748B] group-hover:text-white shrink-0 transition-colors">
                          <span className="hidden sm:inline-block">
                            <BilingualText vi={`${moduleLessons.length} bài học`} en={`${moduleLessons.length} lessons`} />
                          </span>
                          <span className="hidden md:inline-block text-[#EA580C] group-hover:text-white font-medium transition-colors">
                            • {formatDuration(moduleMinutes)}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`text-[#EA580C] group-hover:text-white transition-all duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {/* Danh sách Lesson khi Accordion mở */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 pt-0 space-y-2.5 border-t border-[#E8E5DF]/40 bg-white">
                          {moduleLessons.length === 0 ? (
                            <p className="text-xs text-[#64748B] italic py-2">
                              <BilingualText>{"Module này chưa có bài học."}</BilingualText>
                            </p>
                          ) : (
                            moduleLessons.map((lesson, lIdx) => {
                              const lessonUniqueKey = getLessonKey(lesson, mIdx, lIdx);
                              const lessonLockInfo = statusMap[lessonUniqueKey] || {
                                isLocked: !isEnrolled,
                                isCompleted: false,
                                isNext: false,
                              };
                              const typeInfo = getLessonTypeInfo(lesson);
                              const TypeIcon = typeInfo.icon;
                              const lessonDuration = Number(
                                lesson.estimatedMinutes || lesson.estimatedDuration || 15
                              );

                              // Trường hợp 1: Bài học CHƯA ĐƯỢC MỞ KHÓA -> Có icon Lock, ngăn truy cập trực tiếp
                              if (lessonLockInfo.isLocked) {
                                return (
                                  <div
                                    key={lessonUniqueKey}
                                    role="button"
                                    tabIndex={0}
                                    aria-disabled="true"
                                    onClick={(e) =>
                                      handleLockedClick(e, lesson.titleVi || lesson.title)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        handleLockedClick(e, lesson.titleVi || lesson.title);
                                      }
                                    }}
                                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#F9F8F6] border border-[#EAE2D7] text-xs sm:text-sm cursor-not-allowed select-none transition-all group opacity-85 hover:opacity-100"
                                    title={bilingualLabel("Bài học đang bị khóa - Bấm để xem thông tin mở khóa", "Lesson locked - Click to view unlock info")}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-400 flex items-center justify-center shrink-0 border border-stone-200">
                                        <Lock size={13} />
                                      </div>
                                      <div className="truncate">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-stone-500 truncate">
                                            {lIdx + 1}.{' '}
                                            <BilingualText
                                              vi={lesson.titleVi || lesson.title}
                                              en={lesson.title}
                                            />
                                          </span>
                                          <span
                                            className={`hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeInfo.badgeClass} opacity-60`}
                                          >
                                            <BilingualText vi={typeInfo.labelVi} en={typeInfo.labelEn} />
                                          </span>
                                        </div>
                                        {(lesson.descriptionVi || lesson.description || lesson.objectiveVi || lesson.objectiveEn) && (
                                          <p className="text-xs text-stone-400 line-clamp-1 mt-0.5 font-normal truncate">
                                            <BilingualText
                                              vi={lesson.descriptionVi || lesson.objectiveVi || lesson.description}
                                              en={lesson.description || lesson.objectiveEn}
                                            />
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 text-[11px] text-stone-400 shrink-0 ml-2">
                                      <span className="inline-flex items-center gap-1">
                                        <Clock size={12} />
                                        {lessonDuration} <BilingualText vi="phút" en="mins" />
                                      </span>
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-bold text-[10px]">
                                        <Lock size={10} />
                                        <span><BilingualText vi="Đã khóa" en="Locked" /></span>
                                      </span>
                                    </div>
                                  </div>
                                );
                              }

                              // Trường hợp 2: Bài học ĐÃ MỞ KHÓA -> Có Link truy cập trực tiếp
                              return (
                                <Link
                                  key={lessonUniqueKey}
                                  to={`/courses/${targetCourseId}/lessons/${lesson.id}`}
                                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#FFFDF9] hover:bg-white border border-[#E8E5DF]/60 hover:border-[#FF7A00] text-xs sm:text-sm cursor-pointer transition-all shadow-2xs hover:shadow-sm group"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                        lessonLockInfo.isCompleted
                                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                          : lessonLockInfo.isNext
                                          ? 'bg-[#FF7A00] text-white border-[#FF7A00] animate-pulse'
                                          : 'bg-[#FFF2D6] text-[#EA580C] border-[#FFCD00]/50'
                                      }`}
                                    >
                                      {lessonLockInfo.isCompleted ? (
                                        <CheckCircle2 size={15} />
                                      ) : lessonLockInfo.isNext ? (
                                        <Play size={13} fill="currentColor" />
                                      ) : (
                                        <TypeIcon size={14} />
                                      )}
                                    </div>

                                    <div className="truncate">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-[#253044] group-hover:text-[#FF7A00] transition-colors truncate">
                                          {lIdx + 1}.{' '}
                                          <BilingualText
                                            vi={lesson.titleVi || lesson.title}
                                            en={lesson.title}
                                          />
                                        </span>
                                        <span
                                          className={`hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeInfo.badgeClass}`}
                                        >
                                          <BilingualText vi={typeInfo.labelVi} en={typeInfo.labelEn} />
                                        </span>
                                      </div>
                                      {(lesson.descriptionVi || lesson.description || lesson.objectiveVi || lesson.objectiveEn) && (
                                        <p className="text-xs text-[#64748B] line-clamp-1 mt-0.5 font-normal truncate">
                                          <BilingualText
                                            vi={lesson.descriptionVi || lesson.objectiveVi || lesson.description}
                                            en={lesson.description || lesson.objectiveEn}
                                          />
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2.5 text-[11px] text-[#64748B] shrink-0 ml-2">
                                    <span className="inline-flex items-center gap-1 font-medium">
                                      <Clock size={12} className="text-[#EA580C]" />
                                      {lessonDuration} <BilingualText vi="phút" en="mins" />
                                    </span>

                                    {lessonLockInfo.isCompleted ? (
                                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                        <BilingualText vi="Đã học" en="Completed" />
                                      </span>
                                    ) : lessonLockInfo.isNext ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FF7A00] text-white font-extrabold text-[10px] shadow-xs">
                                        <Play size={10} fill="white" />
                                        <BilingualText vi="Học ngay" en="Start now" />
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-md bg-[#FFF2D6] text-[#EA580C] font-bold text-[10px]">
                                        <BilingualText vi="Vào bài" en="Enter" />
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ===================== CỘT PHẢI (35%): CARD ĐĂNG KÝ STICKY ===================== */}
        <aside className="w-full lg:sticky lg:top-24 space-y-6 self-start">
          <div className="bg-white rounded-3xl border border-[#E8E5DF] p-5 sm:p-6 shadow-md hover:shadow-lg transition-all space-y-6">
            {/* Ảnh Course */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-[#E8E5DF]/60 relative group bg-[#FFF7E8]">
              <CourseThumbnail course={course} />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#253044]/85 backdrop-blur-xs text-[#FFF7E8] text-[11px] font-black uppercase tracking-wider">
                {course.level}
              </div>
            </div>

            {/* Thông tin số bài, thời lượng */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FFF7E8]/70 border border-[#E8E5DF]/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E8E5DF]/60 text-[#EA580C] flex items-center justify-center shrink-0">
                  <BookOpen size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                    <BilingualText vi="Số bài học" en="Total lessons" />
                  </span>
                  <span className="text-sm font-black text-[#253044]">
                    <BilingualText vi={`${totalLessons} bài học`} en={`${totalLessons} lessons`} />
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#E8E5DF]/60 text-[#EA580C] flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                    <BilingualText vi="Thời lượng" en="Duration" />
                  </span>
                  <span className="text-sm font-black text-[#253044]">
                    {formatDuration(totalDurationMinutes)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tiến độ nếu đã đăng ký */}
            {isEnrolled && (
              <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-700" />
                    <span><BilingualText vi="Tiến độ học tập" en="Learning progress" /></span>
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-emerald-200/50 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-emerald-800 font-medium">
                  <BilingualText vi={`Đã hoàn thành ${completedLessons}/${totalLessons} bài học`} en={`Completed ${completedLessons}/${totalLessons} lessons`} />
                </div>
              </div>
            )}

            {/* Nút Enroll / Continue / Review (CTA Chính) */}
            <div className="space-y-2.5">
              {isEnrolled ? (
                <Link
                  to={continueLearnUrl}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#FF7A00] hover:bg-[#EA580C] text-white font-black text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <Play size={16} fill="white" />
                  <BilingualText
                    vi={isCompleted ? 'Xem lại khóa học →' : completedLessons > 0 ? 'Tiếp tục học ngay →' : 'Bắt đầu học bài đầu tiên →'}
                    en={isCompleted ? 'Review course →' : completedLessons > 0 ? 'Continue learning now →' : 'Start first lesson →'}
                  />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrollPending}
                  aria-busy={enrollPending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#FF7A00] hover:bg-[#EA580C] disabled:bg-[#FF7A00]/60 text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {enrollPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span><BilingualText vi="Đang đăng ký…" en="Enrolling…" /></span>
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" />
                      <BilingualText
                        vi={course.isFree ? 'Đăng ký học miễn phí' : 'Đăng ký học ngay'}
                        en={course.isFree ? 'Enroll for free' : 'Enroll now'}
                      />
                    </>
                  )}
                </button>
              )}

              {enrollError && (
                <p className="text-xs text-rose-600 font-semibold text-center flex items-center justify-center gap-1">
                  <AlertCircle size={13} />
                  <span>{enrollError}</span>
                </p>
              )}
            </div>

            {/* Danh sách quyền lợi và tiện ích đi kèm */}
            <div className="border-t border-[#E8E5DF]/40 pt-4 space-y-2.5 text-xs text-[#64748B]">
              <div className="flex items-center gap-2">
                <span><BilingualText vi="Truy cập trọn đời trên máy tính & điện thoại" en="Lifetime access on desktop & mobile" /></span>
              </div>
              <div className="flex items-center gap-2">
                <span><BilingualText vi="Tương tác AI Tutor luyện nói & sửa phát âm 24/7" en="24/7 AI Tutor speaking & pronunciation practice" /></span>
              </div>
              <div className="flex items-center gap-2">
                <span><BilingualText vi="Cấp chứng nhận hoàn thành khóa học" en="Certificate of completion awarded" /></span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Component CourseDetailPage chính
 */
export function CourseDetailPage() {
  const { courseId } = useParams();
  const resource = useCourse(courseId);

  return (
    <section className="course-detail-page w-full max-w-full px-0 py-6 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
        <Link
          className="inline-flex items-center gap-1.5 text-[#FF7A00] hover:underline transition-colors"
          to="/courses"
        >
          <ArrowLeft size={13} />
          <BilingualText>{"Tất cả khóa học"}</BilingualText>
        </Link>
        <span>/</span>
        <span className="text-[#253044] truncate max-w-xs sm:max-w-md">
          <BilingualText
            vi={resource.data?.course?.titleVi || resource.data?.course?.title || 'Chi tiết khóa học'}
            en={resource.data?.course?.title || 'Course Details'}
          />
        </span>
      </nav>

      <ResourceState resource={resource}>
        {({ course, enrollment }) => (
          <CourseDetailView
            key={course?.id || courseId}
            course={course}
            courseId={courseId}
            enrollment={enrollment}
            onReload={resource.reload}
          />
        )}
      </ResourceState>
    </section>
  );
}
export default CourseDetailPage;
