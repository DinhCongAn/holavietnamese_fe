import { useMemo } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Bot, BookOpen, Compass, Palette, LogIn, ArrowLeft, ArrowRight, CheckCircle2, GraduationCap } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { BuffaloMascot, MascotSpeechBubble } from '@/shared/components/mascot';
import { BilingualText } from '@/shared/components/common/BilingualText';
import { AmbientWatermark } from '@/features/home/components/home/common/HeritageWatermark';
import { ROUTES } from '@/constants/routes';
import { hasExistingAccount } from '@/utils/userState';

const FEATURE_CONFIGS = {
  'ai-tutor': {
    id: 'ai-tutor',
    badgeVi: 'AI Tutor • Gia sư ảo 24/7',
    badgeEn: 'AI Tutor • 24/7 Virtual Tutor',
    titleVi: 'Cần đăng nhập để luyện nói với AI Tutor',
    titleEn: 'Sign in to practice speaking with AI Tutor',
    descVi: 'Trò chuyện đối thoại phản xạ, nhận phản hồi chuẩn xác về thanh điệu và ngữ pháp tiếng Việt từ gia sư thông minh.',
    descEn: 'Engage in smart conversation drills, receive tonal analysis and instant feedback from your personal AI tutor.',
    mascotVariant: 'speaking',
    mascotBubbleVi: 'Úi! Đăng nhập để cùng Nghé đàm thoại tiếng Việt và sửa lỗi phát âm trực tiếp nha!',
    mascotBubbleEn: 'Oops! Sign in so Nghé can converse with you and coach your pronunciation!',
    icon: Bot,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white',
    highlights: [
      { vi: 'Nhận diện và chấm thanh điệu chuẩn giọng 3 miền Bắc - Trung - Nam', en: 'Tonal analysis tailored to Northern, Central, and Southern dialects' },
      { vi: 'Nhập vai đối thoại đa dạng tình huống thực tế (gọi món, mua sắm, hỏi đường)', en: 'Roleplay scenarios covering dining, shopping, transit, and socializing' },
      { vi: 'Gợi ý câu trả lời tự nhiên và giải nghĩa từ vựng tức thì', en: 'Instant natural phrasing suggestions and contextual explanations' },
    ],
  },
  vocabulary: {
    id: 'vocabulary',
    badgeVi: 'Từ vựng • Sổ tay thông minh SRS',
    badgeEn: 'Vocabulary • Smart SRS Notebook',
    titleVi: 'Cần đăng nhập để khám phá Kho từ vựng',
    titleEn: 'Sign in to explore the Vocabulary Catalog',
    descVi: 'Hơn 3.000+ từ vựng tiếng Việt kèm phát âm bản xứ, tra cứu theo chủ đề và ghi nhớ sâu với phương pháp lặp lại ngắt quãng.',
    descEn: 'Access 3,000+ curated words with native pronunciations, topic collections, and spaced-repetition flashcards.',
    mascotVariant: 'teaching',
    mascotBubbleVi: 'Đăng nhập tài khoản để Nghé lưu từ mới vào sổ tay và nhắc bạn ôn tập đúng hạn nhé!',
    mascotBubbleEn: 'Sign in so Nghé can save words to your notebook and schedule your review drills!',
    icon: BookOpen,
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-700 text-white',
    highlights: [
      { vi: 'Kho từ vựng phân loại theo cấp độ CEFR từ A1 đến C2 và chủ đề thực tế', en: 'Curated word banks organized by CEFR levels (A1-C2) and practical themes' },
      { vi: 'Sổ tay từ vựng cá nhân hóa, lưu từ chỉ với 1 chạm', en: 'Personal smart notebook with 1-click word saving from any lesson' },
      { vi: 'Hệ thống Flashcard SRS thông minh giúp ghi nhớ lâu bền không quên', en: 'Spaced Repetition System (SRS) ensuring long-term memory retention' },
    ],
  },
  explore: {
    id: 'explore',
    badgeVi: 'Khám phá Việt Nam • Văn hóa & Giao tiếp',
    badgeEn: 'Explore Vietnam • Culture & Communication',
    titleVi: 'Cần đăng nhập để Khám phá Việt Nam',
    titleEn: 'Sign in to Explore Vietnam',
    descVi: 'Tự do chọn điểm đến để tìm hiểu văn hóa, ngôn ngữ vùng miền và thực hành giao tiếp theo kịch bản.',
    descEn: 'Choose destinations freely to discover local culture, regional language and conversation scenarios.',
    mascotVariant: 'welcome',
    mascotBubbleVi: 'Bạn muốn khám phá nơi nào? Đăng nhập để cùng Nghé tìm hiểu điểm đến bạn yêu thích!',
    mascotBubbleEn: 'Where would you like to explore? Sign in and discover your favorite destinations with Nghé!',
    icon: Compass,
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    iconBg: 'bg-gradient-to-br from-rose-500 to-red-700 text-white',
    highlights: [
      { vi: 'Bản đồ tương tác khám phá danh lam thắng cảnh và ẩm thực địa phương', en: 'Interactive travel map highlighting regional landmarks and local cuisines' },
      { vi: 'Tự do chọn điểm đến, không cần hoàn thành khóa học trước', en: 'Choose destinations freely without completing a course first' },
      { vi: 'Mẫu câu giao tiếp bản địa thiết yếu khi đi du lịch và trả giá', en: 'Essential regional phrases for navigating, sightseeing, and bargaining' },
    ],
  },
  culture: {
    id: 'culture',
    badgeVi: 'Văn hóa Việt Nam • Phong tục & Đời sống',
    badgeEn: 'Vietnamese Culture • Traditions & Lifestyle',
    titleVi: 'Cần đăng nhập để khám phá Văn hóa Việt Nam',
    titleEn: 'Sign in to immerse in Vietnamese Culture',
    descVi: 'Tìm hiểu sâu sắc về phong tục tập quán, các ngày lễ truyền thống, văn hóa ẩm thực và nghệ thuật sống của người Việt.',
    descEn: 'Deepen your appreciation of Vietnamese customs, traditional festivals, folk arts, and community lifestyle.',
    mascotVariant: 'happy',
    mascotBubbleVi: 'Nhiều nét đẹp văn hóa Việt Nam thú vị lắm! Đăng nhập để cùng Nghé khám phá nhé!',
    mascotBubbleEn: 'Vietnamese culture has so many wonderful stories! Sign in to explore them with Nghé!',
    icon: Palette,
    badgeColor: 'bg-red-100 text-red-900 border-red-300',
    iconBg: 'bg-gradient-to-br from-red-600 to-rose-800 text-white',
    highlights: [
      { vi: 'Bài đọc văn hóa sinh động về Tết, Trung Thu, áo dài và văn hóa cà phê', en: 'Engaging cultural stories about Tết, Mid-Autumn, áo dài, and coffee culture' },
      { vi: 'Cụm từ giao tiếp chứa đựng bản sắc văn hóa và cách ứng xử tinh tế', en: 'Cultural phrases reflecting social etiquette and Vietnamese courtesy' },
      { vi: 'Trắc nghiệm văn hóa thú vị giúp tích lũy điểm kinh nghiệm XP', en: 'Interactive cultural quizzes with bonus XP and knowledge rewards' },
    ],
  },
  courses: {
    id: 'courses',
    badgeVi: 'Khóa học • Lộ trình bài bản',
    badgeEn: 'Courses • Structured Curriculum',
    titleVi: 'Cần đăng nhập để tham gia Khóa học',
    titleEn: 'Sign in to access Vietnamese Courses',
    descVi: 'Hệ thống bài học thiết kế theo khung CEFR từ cơ bản đến nâng cao, tích hợp luyện phát âm, từ vựng và đàm thoại thực tế.',
    descEn: 'Comprehensive lesson curriculum from beginner to advanced, covering pronunciation, vocabulary, and practical dialogues.',
    mascotVariant: 'teaching',
    mascotBubbleVi: 'Đăng nhập tài khoản để cùng Nghé học tập và theo dõi tiến độ từng bài học nhé!',
    mascotBubbleEn: 'Sign in to study with Nghé and track your progress across all lessons!',
    icon: GraduationCap,
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    iconBg: 'bg-gradient-to-br from-[#FF7A00] to-[#C2410C] text-white',
    highlights: [
      { vi: 'Giáo trình tiếng Việt chuẩn hóa theo khung tham chiếu CEFR A1 - C1', en: 'Standardized Vietnamese curriculum aligned with CEFR A1 - C1' },
      { vi: 'Lưu tiến độ từng bài học, bài tập thực hành và kết quả quiz kiểm tra', en: 'Track lesson progress, practice exercises, and quiz performance' },
      { vi: 'Tích hợp trợ lý AI đồng hành giải đáp thắc mắc ngay trong mỗi bài học', en: 'Built-in AI coach assisting you right inside every lesson' },
    ],
  },
  learning: {
    id: 'learning',
    badgeVi: 'Lộ trình học tập • Không gian cá nhân',
    badgeEn: 'Learning Path • Personal Portal',
    titleVi: 'Cần đăng nhập để xem Lộ trình học tập',
    titleEn: 'Sign in to access your Learning Dashboard',
    descVi: 'Theo dõi bài học hiện tại, tiến độ các kỹ năng nghe nói đọc viết và duy trì chuỗi học tập liên tục mỗi ngày.',
    descEn: 'Track your enrolled lessons, monitor core language skills, and keep your daily learning streak alive.',
    mascotVariant: 'encouraging',
    mascotBubbleVi: 'Cố lên nào! Đăng nhập để tiếp tục bài học dang dở và không bị ngắt quãng chuỗi ngày Streak nhé!',
    mascotBubbleEn: 'Keep going! Sign in to resume your lessons and maintain your streak!',
    icon: Compass,
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    iconBg: 'bg-gradient-to-br from-[#FF7A00] to-[#C2410C] text-white',
    highlights: [
      { vi: 'Lộ trình EdTech cá nhân hóa theo trình độ khởi đầu và mục tiêu của bạn', en: 'Personalized EdTech curriculum matching your goal and initial level' },
      { vi: 'Thống kê chi tiết điểm kinh nghiệm (XP) và chuỗi học tập liên tục (Streak)', en: 'Real-time streak tracker, XP scorecards, and weekly milestones' },
      { vi: 'Tự động đồng bộ tiến độ học tập trên tất cả thiết bị của bạn', en: 'Automatic cloud synchronization across all your desktop and mobile devices' },
    ],
  },
  default: {
    id: 'default',
    badgeVi: 'Yêu cầu đăng nhập • Member Access',
    badgeEn: 'Sign In Required • Member Access',
    titleVi: 'Cần đăng nhập để truy cập tính năng này',
    titleEn: 'Sign in required to view this section',
    descVi: 'Để mang đến trải nghiệm học tiếng Việt cá nhân hóa và đồng bộ dữ liệu tốt nhất, tính năng này dành riêng cho tài khoản học viên.',
    descEn: 'To deliver a personalized Vietnamese learning journey and cloud sync, this feature is reserved for registered learners.',
    mascotVariant: 'thinking',
    mascotBubbleVi: 'Úi! Bạn cần đăng nhập tài khoản để Nghé đồng hành và mở khóa nội dung này cho bạn nè!',
    mascotBubbleEn: 'Oops! Please sign in so Nghé can guide you and unlock this content for you!',
    icon: Lock,
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    iconBg: 'bg-gradient-to-br from-[#FF7A00] to-[#C2410C] text-white',
    highlights: [
      { vi: 'Hoàn toàn miễn phí đăng ký tài khoản với email hoặc Google', en: '100% free account creation via email or 1-tap Google login' },
      { vi: 'Lưu trữ toàn bộ tiến độ, từ vựng và bài tập đã hoàn thành', en: 'Cloud-save your lessons, notebooks, and completed practice sets' },
      { vi: 'Mở khóa đầy đủ các công cụ học tập tương tác của HolaVietnamese', en: 'Unlock the full suite of interactive HolaVietnamese learning tools' },
    ],
  },
};

export function detectFeatureKey(path = '') {
  const normalized = path.toLowerCase();
  if (normalized.includes('ai-tutor') || normalized.includes('ai-scenario') || normalized.includes('ai-roleplay')) {
    return 'ai-tutor';
  }
  if (normalized.includes('vocabulary') || normalized.includes('regional')) {
    return 'vocabulary';
  }
  if (normalized.includes('explore') || normalized.includes('destination')) {
    return 'explore';
  }
  if (normalized.includes('culture')) {
    return 'culture';
  }
  if (normalized.includes('course')) {
    return 'courses';
  }
  if (normalized.includes('edtech') || normalized.includes('dashboard') || normalized.includes('learning')) {
    return 'learning';
  }
  return 'default';
}

export function AuthRequiredPage({ forcedFeature, targetPath: propTargetPath }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const targetPath = useMemo(() => {
    if (propTargetPath) return propTargetPath;
    const fromParam = searchParams.get('from');
    if (fromParam) return fromParam;
    if (location.state?.from) return location.state.from;
    return location.pathname;
  }, [propTargetPath, searchParams, location]);

  const featureKey = useMemo(() => {
    if (forcedFeature && FEATURE_CONFIGS[forcedFeature]) return forcedFeature;
    const queryFeature = searchParams.get('feature');
    if (queryFeature && FEATURE_CONFIGS[queryFeature]) return queryFeature;
    return detectFeatureKey(targetPath);
  }, [forcedFeature, searchParams, targetPath]);

  const feature = FEATURE_CONFIGS[featureKey] || FEATURE_CONFIGS.default;
  const FeatureIcon = feature.icon;
  const isExistingUser = useMemo(() => hasExistingAccount(), []);

  const mascotBubbleVi = isExistingUser
    ? feature.mascotBubbleVi
    : 'Chào bạn mới! Hãy tạo tài khoản trước, sau đó Nghé sẽ hướng dẫn bạn qua phần onboarding để cá nhân hóa lộ trình nhé! ✨';
  const mascotBubbleEn = isExistingUser
    ? feature.mascotBubbleEn
    : 'Welcome! Create your account first, then Nghé will guide you through onboarding to personalize your learning path! ✨';

  // If already logged in and visiting directly, take user to target
  if (isAuthenticated && targetPath && targetPath !== ROUTES.LOGIN_REQUIRED && targetPath !== ROUTES.AUTH_REQUIRED) {
    navigate(targetPath, { replace: true });
    return null;
  }

  return (
    <div className="auth-required-page relative w-full min-h-[calc(100vh-120px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFF7E8] via-[#FFFCF7] to-[#FFF7E8] overflow-hidden">
      {/* Background Dong Son Ambient Watermark */}
      <AmbientWatermark className="absolute -right-20 top-1/2 -translate-y-1/2 w-[520px] h-[520px] opacity-[0.05] pointer-events-none" />
      <AmbientWatermark className="absolute -left-24 -bottom-20 w-[420px] h-[420px] opacity-[0.04] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-3xl"
      >
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-md border border-[#E8E5DF]/80 rounded-3xl p-6 sm:p-10 shadow-[0_12px_40px_rgba(67,25,20,0.06)] relative overflow-hidden space-y-8">
          {/* Top golden decorative line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF7A00] via-[#FFCD00] to-[#FF7A00]" />

          {/* Header row: Mascot & Speech Bubble */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pt-2">
            <div className="shrink-0 flex flex-col items-center">
              <BuffaloMascot
                variant={isExistingUser ? feature.mascotVariant : 'welcome'}
                size="large"
                animated
                accessibilityLabel="Nghé mascot"
              />
            </div>

            <div className="flex-1 w-full text-center sm:text-left space-y-3">
              <div className="w-full">
                <MascotSpeechBubble arrow="left">
                  <BilingualText vi={mascotBubbleVi} en={mascotBubbleEn} />
                </MascotSpeechBubble>
              </div>

              {/* Feature Badge */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${feature.badgeColor}`}>
                  <FeatureIcon size={14} />
                  <BilingualText vi={feature.badgeVi} en={feature.badgeEn} />
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C2410C] bg-[#FFF0DC]/60 px-2.5 py-0.5 rounded-full border border-[#E7B59D]/50">
                  <Lock size={11} />
                  <BilingualText vi="Cần tài khoản" en="Account required" />
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-[#253044] tracking-tight leading-snug">
                <BilingualText vi={feature.titleVi} en={feature.titleEn} />
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                <BilingualText vi={feature.descVi} en={feature.descEn} />
              </p>
            </div>
          </div>

          {/* Highlights Box */}
          <div className="bg-[#FFFCF7] border border-[#E8E5DF]/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#EA580C]">
              
              <BilingualText
                vi="Quyền lợi mở khóa khi bạn đăng nhập:"
                en="Benefits unlocked upon signing in:"
              />
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#253044]">
              {feature.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <BilingualText vi={item.vi} en={item.en} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons Group */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {isExistingUser ? (
                <>
                  {/* Primary for Existing User: Sign In */}
                  <Link
                    to={ROUTES.LOGIN}
                    state={{ from: targetPath }}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#B31D16] hover:from-[#B31D16] hover:to-[#C2410C] text-white font-black text-sm text-center shadow-[0_4px_12px_rgba(218,37,29,0.28)] hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn size={18} />
                    <BilingualText vi="Đăng nhập ngay" en="Sign In Now" />
                  </Link>

                  {/* Secondary for Existing User: Welcome */}
                  <Link
                    to={ROUTES.WELCOME}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#FFF7E8] hover:bg-[#FFF0DC]/50 text-[#253044] border-2 border-[#E1B65B] font-black text-sm text-center shadow-xs hover:border-[#FF7A00] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    
                    <BilingualText vi="Trải nghiệm học thử" en="Explore Welcome" />
                  </Link>
                </>
              ) : (
                <>
                  {/* Primary for New User: register before onboarding */}
                  <Link
                    to={ROUTES.REGISTER}
                    state={{ from: targetPath.startsWith('/onboarding') ? '/onboarding/reason' : targetPath }}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#B31D16] hover:from-[#B31D16] hover:to-[#C2410C] text-white font-black text-sm text-center shadow-[0_4px_12px_rgba(218,37,29,0.28)] hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={18} />
                    <BilingualText vi="Đăng ký để bắt đầu" en="Register to Get Started" />
                  </Link>

                  {/* Secondary for New User: Sign In */}
                  <Link
                    to={ROUTES.LOGIN}
                    state={{ from: targetPath }}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#FFF7E8] hover:bg-[#FFF0DC]/50 text-[#253044] border-2 border-[#E1B65B] font-black text-sm text-center shadow-xs hover:border-[#FF7A00] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn size={18} className="text-[#EA580C]" />
                    <BilingualText vi="Tôi đã có tài khoản • Đăng nhập" en="Already have an account? Sign In" />
                  </Link>
                </>
              )}
            </div>

            {/* Tertiary: Direct Register or Back to Home */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
              <Link
                to={ROUTES.REGISTER}
                state={{ from: targetPath }}
                className="font-semibold text-[#C2410C] hover:underline"
              >
                <BilingualText vi="Đăng ký tài khoản trực tiếp →" en="Direct Registration →" />
              </Link>
              <span className="text-stone-300">•</span>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 font-bold text-[#64748B] hover:text-[#EA580C] transition-colors py-1 px-2 rounded-lg hover:bg-[#FFF0DC]/30"
              >
                <ArrowLeft size={14} />
                <BilingualText vi="Quay về Trang chủ" en="Back to Homepage" />
              </Link>
            </div>
          </div>

          {/* Bottom Security / Trust Badges */}
          <div className="pt-4 border-t border-[#E8E5DF]/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#64748B]">
              <BilingualText vi="Hoàn toàn miễn phí" en="100% Free to join" />
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#64748B]">
              <BilingualText vi="Đồng bộ tiến độ đám mây" en="Cloud progress sync" />
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[#64748B]">
              <BilingualText vi="Tích lũy Streak & Điểm XP" en="Earn streaks & XP" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthRequiredPage;
