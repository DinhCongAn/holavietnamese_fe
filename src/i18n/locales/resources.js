import { UI_TRANSLATIONS } from '@/shared/components/common/uiTranslations';

const fromLegacyCatalog = (index) => Object.fromEntries(
  Object.entries(UI_TRANSLATIONS).map(([key, pair]) => [key, pair[index] ?? key]),
);

const navigationEn = {
  home: 'Home', learningPath: 'Learning Path', courses: 'Courses', myLearning: 'My learning', alphabet: 'Vietnamese Alphabet',
  vocabulary: 'Vocabulary', explore: 'Explore Vietnam', culture: 'Vietnamese Culture', blog: 'Blog',
  aiTutor: 'AI Tutor', learn: 'Learn', pronunciation: 'Pronunciation', listening: 'Listening',
  speaking: 'Speaking Practice', aiConversation: 'AI Conversation', quizzes: 'Quizzes',
  leaderboard: 'Leaderboard', achievements: 'Achievements', progress: 'Progress', profile: 'My Profile',
  settings: 'Settings', signIn: 'Sign in', getStarted: 'Get started', learnFree: 'Learn for free',
  insideLessons: 'Inside lessons', insideCourses: 'Inside courses', comingSoon: 'Coming soon',
  keepRhythm: 'Keep your rhythm', dailyVietnamese: 'A little Vietnamese every day.', expandSidebar: 'Expand navigation', collapseSidebar: 'Collapse navigation',
};

const navigationVi = {
  home: 'Trang chủ', learningPath: 'Lộ trình học', courses: 'Khóa học', myLearning: 'Góc học tập', alphabet: 'Bảng chữ cái tiếng Việt',
  vocabulary: 'Từ vựng', explore: 'Khám phá Việt Nam', culture: 'Văn hóa Việt Nam', blog: 'Blog',
  aiTutor: 'Gia sư AI', learn: 'Học tập', pronunciation: 'Phát âm', listening: 'Luyện nghe',
  speaking: 'Luyện nói', aiConversation: 'Hội thoại AI', quizzes: 'Bài kiểm tra',
  leaderboard: 'Bảng xếp hạng', achievements: 'Thành tích', progress: 'Tiến độ', profile: 'Hồ sơ của tôi',
  settings: 'Cài đặt', signIn: 'Đăng nhập', getStarted: 'Bắt đầu', learnFree: 'Học miễn phí',
  insideLessons: 'Trong bài học', insideCourses: 'Trong khóa học', comingSoon: 'Sắp ra mắt',
  keepRhythm: 'Giữ nhịp học', dailyVietnamese: 'Mỗi ngày một chút tiếng Việt.', expandSidebar: 'Mở rộng thanh điều hướng', collapseSidebar: 'Thu gọn thanh điều hướng',
};

const homeEn = {
  culturalStrip: {
    ariaLabel: 'Vietnamese cultural introduction',
    tagline: 'Discover Vietnam, one word at a time.',
    pillars: 'Language • Culture • Connection',
    pillarLanguage: 'Language',
    pillarCulture: 'Culture',
    pillarConnection: 'Connection',
  },
  carouselLabel: 'Discover what you can do with HolaVietnamese',
  previousSlide: 'Previous slide', nextSlide: 'Next slide', pauseSlides: 'Pause automatic slides', resumeSlides: 'Resume automatic slides', goToSlide: 'Go to slide {{number}}: {{title}}',
  slideTitles: ['Confident pronunciation', 'Everyday conversations', 'A clear learning path'],
  guestBanner: {
    slideTitles: ['Vietnamese phở', 'Vietnamese Tết', 'Mid-Autumn Festival', 'Hội An heritage'],
    pho: { eyebrow: 'Vietnamese cuisine · Phở', title: 'Discover Vietnam, One Flavor at a Time.', description: 'Explore Vietnamese language and culture through the flavors of everyday life.', action: 'Start Learning', imageAlt: 'Two authentic bowls of phở bò served with Vietnamese herbs and lime', photoLabel: 'Phở bò · Ho Chi Minh City' },
    tet: { eyebrow: 'Vietnamese Lunar New Year · Tết', title: 'Experience the Magic of Vietnamese Tết.', description: 'Discover meaningful traditions and expressions that bring Vietnamese families together.', action: 'Explore Vietnamese', imageAlt: 'A Vietnamese family gathering to prepare bánh tét for Lunar New Year', photoLabel: 'Tết family tradition · Vietnam' },
    midAutumn: { eyebrow: 'Mid-Autumn Festival · Tết Trung Thu', title: 'Celebrate the Colors of Mid-Autumn Festival.', description: 'Learn Vietnamese through the joyful festivals and traditions of Vietnam.', action: 'Discover More', imageAlt: 'Colorful handmade star lanterns for Vietnamese Mid-Autumn Festival', photoLabel: 'Star lanterns · Kon Tum' },
    hoiAn: { eyebrow: 'Vietnamese heritage · Hội An', title: 'A Language Full of Culture and Stories.', description: 'Begin your Vietnamese journey and discover the places, people, and traditions behind every word.', action: 'Begin Your Journey', imageAlt: 'Hoi An ancient town and river illuminated by lanterns at night', photoLabel: 'Hội An ancient town · Vietnam' },
  },
  mascot: { kicker: 'LEARNING COMPANION • YOUR FRIENDLY GUIDE', alt: 'Nghé, the Vietnamese water buffalo learning companion', greeting: "Xin chào! I'm Nghé, your Vietnamese learning buddy!", title: 'Meet your friendly guide to Vietnamese', description: 'Nghé will encourage you through lessons, pronunciation practice, vocabulary review, and conversations with the AI Tutor.', action: 'Start learning with Nghé' },
  hero: {
    slide1: { kicker: 'VIETNAMESE FOR INTERNATIONAL LEARNERS · ONLINE EDTECH', title: 'Speak Vietnamese', highlight: 'with confidence.', support: 'Master all 6 tones · Speak naturally with locals', lead: 'A visual Vietnamese learning platform built for international learners and busy professionals. Improve pronunciation, understand tone patterns, and build real conversational reflexes.', primary: 'Start learning', secondary: 'Explore courses', quick: 'Preview your learning path →', values: ['Master all 6 tones', 'Immediate AI feedback', '5–10 minutes a day'] },
    slide2: { kicker: 'EVERYDAY VIETNAMESE · REAL CONVERSATIONS', title: 'Learn real Vietnamese', highlight: 'for everyday life.', support: 'Order food, shop, and connect with confidence', lead: 'Move beyond textbook phrases. Learn through familiar moments—from ordering cà phê sữa đá and enjoying street food to talking naturally with colleagues and neighbours.', primary: 'Start learning', secondary: 'Explore real-life situations', quick: 'Browse Vietnamese culture scenarios →', values: ['100+ practical scenarios', 'Northern & Southern voices', 'Culture in context'] },
    slide3: { kicker: 'A CLEAR INTERNATIONAL PATH · CEFR FRAMEWORK', title: 'Start speaking Vietnamese', highlight: 'naturally.', support: 'A structured path from beginner A1 to intermediate B2', lead: 'Short, focused lessons make progress feel manageable. Practise with multiple senses, keep a steady routine, and build confidence one useful conversation at a time.', primary: 'Start learning', secondary: 'View the learning path', quick: 'See how progress is measured →', values: ['CEFR path from A1–B2', 'Meaningful progress tracking', 'Learn on any device'] },
    rating: 'from 1,200+ international learners and expats',
  },
  miniLesson: { badge: 'Hands-on mini lesson', title: '10-second challenge: build your first coffee order', description: 'Tap the word tiles to build a complete Vietnamese sentence, then hear the Vietnamese pronunciation and earn your first practice XP.' },
  widget: { badge: 'Try it free in 10 seconds', translate: 'Build this sentence in Vietnamese:', empty: 'Choose the word tiles below in the right order…', correct: 'Perfect! You just ordered like a local.', answer: 'Correct order: {{answer}}', retry: 'Try again', reset: 'Start over', check: 'Check answer', next: 'Continue to the next sentence →', fullLesson: 'Start the full lesson →', normalAudio: 'Play normal-speed Vietnamese', slowAudio: 'Play slow Vietnamese' },
  metrics: { tones: 'Vietnamese tones', tonesDetail: 'Interactive pitch contours', skills: 'Core skills', skillsDetail: 'Listen · Speak · Read · Write', goal: 'Recommended goal', goalDetail: 'A flexible daily learning rhythm', lesson: 'Free guest lesson', lessonDetail: 'No account required to begin' },
  features: { eyebrow: 'Modern learning tools', title: 'Learn by doing. Improve every day.', description: 'Practise the three essentials for international learners: hearing all 6 tones, typing Vietnamese diacritics, and using natural expressions in everyday situations.' },
  roadmap: { eyebrow: 'Learning path preview', title: 'Every step brings you closer to fluent Vietnamese.', description: 'Lessons are divided into manageable stages. Unlock badges, earn XP, and build Vietnamese skills along a CEFR-aligned path.', current: 'You are here', action: 'Build my learning path →' },
  stories: { eyebrow: 'Learner story previews', title: 'Vietnamese learning journeys from around the world', disclaimer: 'These illustrative stories show intended learner experiences and are not verified customer reviews.', badge: 'ILLUSTRATIVE STORY', listen: 'Listen to this Vietnamese phrase: {{phrase}}' },
  marquee: ['LEARN VIETNAMESE', 'SPEAK CONFIDENTLY', 'EXPLORE CULTURE', 'PRACTICE WITH AI', 'DISCOVER VIETNAM', 'REAL-LIFE VIETNAMESE', 'MASTER 6 TONES'],
  cta: { eyebrow: 'Start your journey today', title: 'Five minutes a day to speak Vietnamese with confidence', description: 'Begin with a free interactive lesson, discover everyday life in Vietnam, and build a habit that fits your schedule.', primary: 'Start learning for free', secondary: 'Explore the learning path' },
};

const homeVi = {
  culturalStrip: {
    ariaLabel: 'Giới thiệu văn hóa Việt Nam',
    tagline: 'Khám phá Việt Nam qua từng từ vựng.',
    pillars: 'Ngôn ngữ • Văn hóa • Kết nối',
    pillarLanguage: 'Ngôn ngữ',
    pillarCulture: 'Văn hóa',
    pillarConnection: 'Kết nối',
  },
  carouselLabel: 'Khám phá các điểm nổi bật của HolaVietnamese',
  previousSlide: 'Slide trước', nextSlide: 'Slide tiếp theo', pauseSlides: 'Tạm dừng tự động chuyển slide', resumeSlides: 'Tiếp tục tự động chuyển slide', goToSlide: 'Chuyển tới slide {{number}}: {{title}}',
  slideTitles: ['Luyện nói tự tin', 'Giao tiếp đời thường', 'Lộ trình bài bản'],
  guestBanner: {
    slideTitles: ['Phở Việt Nam', 'Tết Việt Nam', 'Tết Trung Thu', 'Di sản Hội An'],
    pho: { eyebrow: 'Ẩm thực Việt Nam · Phở', title: 'Khám phá Việt Nam qua từng hương vị.', description: 'Tìm hiểu ngôn ngữ và văn hóa Việt Nam qua những hương vị quen thuộc.', action: 'Bắt đầu học', imageAlt: 'Hai tô phở bò Việt Nam ăn cùng rau thơm và chanh', photoLabel: 'Phở bò · Thành phố Hồ Chí Minh' },
    tet: { eyebrow: 'Tết cổ truyền Việt Nam', title: 'Khám phá nét đẹp Tết Việt.', description: 'Tìm hiểu những phong tục và lời chúc ý nghĩa trong ngày Tết cổ truyền.', action: 'Khám phá tiếng Việt', imageAlt: 'Gia đình Việt Nam quây quần gói bánh tét đón Tết', photoLabel: 'Truyền thống gia đình ngày Tết · Việt Nam' },
    midAutumn: { eyebrow: 'Lễ hội truyền thống · Tết Trung Thu', title: 'Rực rỡ sắc màu Tết Trung Thu.', description: 'Khám phá tiếng Việt qua những lễ hội và phong tục đầy màu sắc.', action: 'Khám phá thêm', imageAlt: 'Những chiếc đèn ông sao đầy màu sắc cho Tết Trung Thu Việt Nam', photoLabel: 'Đèn ông sao · Kon Tum' },
    hoiAn: { eyebrow: 'Di sản Việt Nam · Hội An', title: 'Ngôn ngữ kết nối những câu chuyện văn hóa.', description: 'Bắt đầu hành trình học tiếng Việt và khám phá những nét đẹp của đất nước, con người Việt Nam.', action: 'Bắt đầu hành trình', imageAlt: 'Phố cổ và dòng sông Hội An rực sáng bởi đèn lồng về đêm', photoLabel: 'Phố cổ Hội An · Việt Nam' },
  },
  mascot: { kicker: 'BẠN ĐỒNG HÀNH TIẾNG VIỆT • NGƯỜI HƯỚNG DẪN', alt: 'Nghé, người bạn trâu Việt Nam đồng hành học tập', greeting: 'Xin chào! Mình là Nghé, người bạn đồng hành học tiếng Việt của bạn!', title: 'Gặp người bạn hướng dẫn tiếng Việt thân thiện', description: 'Nghé sẽ động viên bạn trong bài học, luyện phát âm, ôn từ vựng và trò chuyện cùng Gia sư AI.', action: 'Bắt đầu học cùng Nghé' },
  hero: {
    slide1: { kicker: 'TIẾNG VIỆT CHO NGƯỜI NƯỚC NGOÀI · HỌC TRỰC TUYẾN', title: 'Nói tiếng Việt', highlight: 'thật tự tin.', support: 'Làm chủ 6 thanh điệu · Tự tin nói chuyện với người bản xứ', lead: 'Nền tảng học tiếng Việt trực quan dành cho người nước ngoài và người đi làm. Luyện phát âm, nhận biết thanh điệu và xây dựng phản xạ qua các tình huống thực tế.', primary: 'Bắt đầu học ngay', secondary: 'Khám phá khóa học', quick: 'Trải nghiệm lộ trình học →', values: ['Phát âm chuẩn 6 thanh điệu', 'Phản hồi AI tức thì', '5–10 phút mỗi ngày'] },
    slide2: { kicker: 'GIAO TIẾP ĐỜI THƯỜNG · HỘI THOẠI THỰC TẾ', title: 'Học tiếng Việt', highlight: 'cho đời sống hằng ngày.', support: 'Gọi món, mua sắm và kết nối bạn bè thật tự nhiên', lead: 'Tạm biệt những mẫu câu lý thuyết khô khan. Học qua ngữ cảnh quen thuộc: từ gọi cà phê sữa đá, thưởng thức ẩm thực đường phố đến trò chuyện với đồng nghiệp và hàng xóm.', primary: 'Bắt đầu học ngay', secondary: 'Khám phá tình huống', quick: 'Xem kịch bản văn hóa đời sống →', values: ['100+ kịch bản thực tế', 'Chuẩn giọng Bắc & Nam', 'Văn hóa trong ngữ cảnh'] },
    slide3: { kicker: 'LỘ TRÌNH QUỐC TẾ · KHUNG CEFR', title: 'Nói tiếng Việt', highlight: 'một cách tự nhiên.', support: 'Lộ trình bài bản từ Sơ cấp A1 đến Trung cấp B2', lead: 'Bài học ngắn giúp bạn tiến bộ mà không quá tải. Luyện tập đa giác quan, duy trì thói quen và xây dựng sự tự tin qua từng cuộc hội thoại hữu ích.', primary: 'Bắt đầu học ngay', secondary: 'Xem lộ trình học', quick: 'Đo lường sự tiến bộ của bạn →', values: ['Lộ trình CEFR A1–B2', 'Theo dõi tiến độ hữu ích', 'Linh hoạt trên mọi thiết bị'] },
    rating: 'từ hơn 1.200 học viên quốc tế và người nước ngoài',
  },
  miniLesson: { badge: 'Bài học tương tác nhanh', title: 'Thử thách 10 giây: ghép câu gọi cà phê đầu tiên', description: 'Chạm vào các quân từ để tạo câu tiếng Việt hoàn chỉnh, nghe phát âm tiếng Việt và nhận điểm XP luyện tập đầu tiên.' },
  widget: { badge: 'Trải nghiệm miễn phí trong 10 giây', translate: 'Ghép câu tiếng Việt sau:', empty: 'Chọn các quân từ bên dưới theo đúng thứ tự…', correct: 'Chính xác! Bạn vừa gọi món như người Việt.', answer: 'Thứ tự đúng: {{answer}}', retry: 'Thử lại', reset: 'Làm lại từ đầu', check: 'Kiểm tra đáp án', next: 'Tiếp tục câu tiếp theo →', fullLesson: 'Bắt đầu bài học đầy đủ →', normalAudio: 'Nghe tiếng Việt ở tốc độ thường', slowAudio: 'Nghe chậm tiếng Việt' },
  metrics: { tones: 'Thanh điệu tiếng Việt', tonesDetail: 'Đường cao độ tương tác', skills: 'Kỹ năng cốt lõi', skillsDetail: 'Nghe · Nói · Đọc · Viết', goal: 'Mục tiêu đề xuất', goalDetail: 'Nhịp học linh hoạt mỗi ngày', lesson: 'Bài học khách miễn phí', lessonDetail: 'Bắt đầu không cần tài khoản' },
  features: { eyebrow: 'Công cụ học tập hiện đại', title: 'Học qua thực hành. Tiến bộ mỗi ngày.', description: 'Luyện ba kỹ năng thiết yếu: nghe rõ 6 thanh điệu, gõ dấu tiếng Việt và sử dụng cách diễn đạt tự nhiên trong tình huống đời thường.' },
  roadmap: { eyebrow: 'Xem trước lộ trình học', title: 'Mỗi bước đưa bạn gần hơn đến tiếng Việt thành thạo.', description: 'Bài học được chia thành từng chặng dễ tiếp thu. Mở khóa huy hiệu, tích lũy XP và phát triển theo lộ trình phù hợp khung CEFR.', current: 'Bạn đang ở đây', action: 'Tạo lộ trình của tôi →' },
  stories: { eyebrow: 'Câu chuyện học viên minh họa', title: 'Hành trình học tiếng Việt từ khắp thế giới', disclaimer: 'Các câu chuyện minh họa trải nghiệm dự kiến và không phải đánh giá khách hàng đã xác minh.', badge: 'CÂU CHUYỆN MINH HỌA', listen: 'Nghe câu tiếng Việt: {{phrase}}' },
  marquee: ['HỌC TIẾNG VIỆT', 'NÓI THẬT TỰ TIN', 'KHÁM PHÁ VĂN HÓA', 'LUYỆN TẬP VỚI AI', 'KHÁM PHÁ VIỆT NAM', 'TIẾNG VIỆT ĐỜI THỰC', 'LÀM CHỦ 6 THANH ĐIỆU'],
  cta: { eyebrow: 'Bắt đầu hành trình hôm nay', title: '5 phút mỗi ngày để tự tin nói tiếng Việt', description: 'Bắt đầu bằng một bài học tương tác miễn phí, khám phá nhịp sống Việt Nam và xây dựng thói quen phù hợp với thời gian của bạn.', primary: 'Bắt đầu học miễn phí', secondary: 'Khám phá lộ trình' },
};

const learnerEn = {
  motivationStrip: {
    ariaLabel: 'Daily learning focus',
    title: 'Ready for your next Vietnamese lesson?',
    subtitle: 'A little practice every day makes a difference.',
    action: 'Continue lesson',
  },
  mascot: { alt: 'Nghé, the Vietnamese water buffalo learning companion', dashboard: { continue: 'Ready for another Vietnamese lesson? Keep going!', start: "Let's choose your first Vietnamese course!" }, guide: { replay: 'Replay Nghé guide', progress: 'Quick tour · {{current}}/{{total}}', skip: 'Skip', back: 'Back', next: 'Next', finish: 'Start learning', steps: [ { variant: 'welcome', title: "Xin chào! I'm Nghé.", text: "I'll show you where to begin and how to keep your Vietnamese moving forward." }, { variant: 'teaching', title: 'Follow your learning path', text: 'Open Courses to choose a level, then continue your saved lesson from this dashboard.' }, { variant: 'speaking', title: 'Practise pronunciation', text: 'Use Alphabet and listening activities to hear Vietnamese sounds and practise all six tones.' }, { variant: 'thinking', title: 'Review useful words', text: 'Your Vocabulary area keeps saved words ready for focused review.' }, { variant: 'encouraging', title: 'Talk with Nghé AI Tutor', text: 'Open AI Tutor for guided conversations, then return here to track your progress.' } ] } },
  todayChallenges: "Today's challenges", challengeEmpty: 'Your daily challenges will appear here when the learning service provides them.', dailyGoal: 'Daily learning goal', minutes: 'min',
  weeklyLeaderboard: 'Weekly leaderboard', liveStandings: 'Live standings', standingsInfo: 'Standings are shown only when leaderboard data is available from the server.', noLeaderboard: 'No leaderboard data yet.',
  weeklyStreak: 'Weekly streak tracker', streakHint: 'Complete a learning activity each day to keep your momentum.',
  hero: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening', noLesson: 'Choose a course to begin', continueEyebrow: 'YOUR LEARNING JOURNEY · CONTINUE WHERE YOU LEFT OFF', continueTitle: '{{greeting}}, {{name}}.', continueDescription: 'Pick up exactly where you left off and turn today’s few minutes into lasting Vietnamese confidence.', continueAction: 'CONTINUE LESSON', reviewEyebrow: 'QUICK PRACTICE · BUILD YOUR STREAK', reviewTitle: 'Make Vietnamese feel natural.', reviewDescription: 'Review a few high-value words, hear authentic pronunciation, and strengthen your memory.', reviewAction: 'REVIEW VOCABULARY', reviewMeta: 'A focused 5-minute review', tutorEyebrow: 'AI SPEAKING PARTNER · AVAILABLE 24/7', tutorTitle: 'Practice without the pressure.', tutorDescription: 'Build conversational reflexes with guided scenarios inspired by daily life across Vietnam.', tutorAction: 'TALK WITH AI TUTOR', tutorMeta: 'Personalized conversation practice', journey: 'Your learning journey', progress: 'Progress', discovery: 'Today’s discovery', momentum: 'Keep your momentum', madeForLevel: 'Made for your level', exploreCourses: 'Explore all courses →', checkInReady: 'Your daily check-in is ready.', checkIn: 'Check in', energy: 'Energy', label: 'Learner highlights', choose: 'Choose learner banner', previous: 'Previous banner', next: 'Next banner', pause: 'Pause banners', resume: 'Resume banners', show: 'Show banner {{number}}' },
  modules: { conversationTitle: 'AI Conversation Tutor', conversationVi: 'AI Gia sư đàm thoại', conversationDescription: 'Practice speaking Vietnamese with AI', vocabularyTitle: 'Vocabulary & Tones', vocabularyVi: 'Kho từ & Thanh điệu', vocabularyDescription: 'Compare sounds and master all 6 tones', cultureTitle: 'Culture & Destinations', cultureVi: 'Văn hóa & Điểm đến', cultureDescription: 'Explore customs, food, and people in Vietnam' },
  dashboard: {
    welcome: 'Welcome back', welcomeName: 'Hello, {{name}}! 👋', welcomeSubtitle: 'Ready to make progress in Vietnamese today?', learner: 'Learner', continueLearning: 'Continue learning', exploreCourses: 'Explore courses', loadError: 'We could not load your learning dashboard.',
    progressOverview: 'Learning progress overview', streak: 'Current streak', days: 'days', totalXp: 'Total XP', completedLessons: 'Completed lessons', lessons: 'lessons', learningProgress: 'Learning progress', currentLesson: 'current lesson', noData: 'No data yet',
    continueSection: 'Continue learning', learningPath: 'Your learning path', continueDescription: 'Continue exactly where you left off and keep your momentum going.', lessonProgress: 'Lesson progress', resumeHint: 'Your place is saved automatically', noCurrentLesson: 'Choose your next Vietnamese course', noCurrentLessonText: 'Start a course to see your active lesson and progress here.',
    quickAccess: 'Quick access', learningModules: 'Learning modules', viewAll: 'View all', history: 'Learning history', recentActivity: 'Recent activity', noActivity: 'Completed lessons and reviews will appear here.', today: 'Today', community: 'Community', discovery: 'Daily discovery', wordOfDay: 'Vietnamese word of the day', listenWord: 'Listen to {{word}}',
    reviewTitle: 'Vocabulary review', reviewText: 'Strengthen words that are due for review.', reviewAction: 'Start vocabulary review',
    carousel: {
      label: 'Vietnamese cultural highlights', position: 'Slide {{current}} of {{total}}', choose: 'Choose a cultural slide', previous: 'Previous slide', next: 'Next slide', goTo: 'Go to slide {{number}}',
      buncha: { eyebrow: 'Vietnamese Cuisine · Hà Nội', title: 'Discover Vietnam Through Its Flavors', description: 'Learn Vietnamese while exploring the delicious traditions of Vietnamese cuisine.', action: 'Continue Learning', imageAlt: 'Authentic Hanoi bún chả with grilled pork, rice noodles, fresh herbs, and dipping sauce' },
      mausoleum: { eyebrow: 'History & Heritage · Hà Nội', title: "Explore Vietnam's History and Heritage", description: 'Discover Vietnamese language through the history and cultural landmarks of Vietnam.', action: 'Explore Landmarks', imageAlt: 'Ho Chi Minh Mausoleum in Ba Đình Square, Hanoi' },
      tet: { eyebrow: 'Lunar New Year · Tết Nguyên Đán', title: 'Celebrate the Spirit of Vietnamese Tết', description: "Discover the traditions, greetings, and customs of Vietnam's most important holiday.", action: 'Explore Traditions', imageAlt: 'Traditional Vietnamese Tết spread with square bánh chưng, giò lụa, and festive accompaniments' },
      midAutumn: { eyebrow: 'Traditional Festivals · Trung Thu', title: 'Experience the Magic of Mid-Autumn Festival', description: 'Explore Vietnamese culture through colorful festivals and meaningful traditions.', action: 'Explore Festivals', imageAlt: 'Authentic Vietnamese Trung Thu celebration with traditional lion dances and festival lanterns' },
      discover: { eyebrow: 'Language meets culture', title: 'Discover Vietnam Through Every Lesson.', description: 'Learn Vietnamese while exploring the beautiful places, people, and traditions that make Vietnam unique.', action: 'Continue Learning', imageAlt: 'Hoi An ancient town illuminated at night' },
      conversation: { eyebrow: 'Vietnamese for real life', title: 'Speak Vietnamese With Confidence.', description: "From ordering coffee to meeting new friends, practice conversations you'll actually use.", action: 'Start Practicing', imageAlt: 'People sharing a meal and conversation in Hanoi' },
      culture: { eyebrow: 'Taste, traditions, stories', title: 'More Than a Language. A Whole Culture.', description: 'Discover Vietnamese food, traditions, and everyday expressions as you learn.', action: 'Explore Lessons', imageAlt: 'A table filled with traditional Vietnamese dishes' },
    },
    modules: { roadmap: 'Learning roadmap', roadmapText: 'Step-by-step interactive lesson map.', courses: 'Courses', coursesText: 'Diverse course catalog organized by topic.', vocabulary: 'Vocabulary', vocabularyText: 'Review saved words and build recall.', listening: 'Listening', listeningText: 'Train your ear with course audio.', pronunciation: 'Pronunciation', pronunciationText: 'Master Vietnamese letters and sounds.', practice: 'AI speaking practice', practiceText: 'Build confidence in guided conversations.' },
  },
};

const learnerVi = {
  motivationStrip: {
    ariaLabel: 'Mục tiêu học hôm nay',
    title: 'Sẵn sàng cho bài học tiếng Việt tiếp theo?',
    subtitle: 'Mỗi ngày một chút luyện tập tạo nên sự khác biệt.',
    action: 'Tiếp tục học',
  },
  mascot: { alt: 'Nghé, người bạn trâu Việt Nam đồng hành học tập', dashboard: { continue: 'Sẵn sàng học thêm một bài tiếng Việt nhé? Cố lên!', start: 'Hãy chọn khóa học tiếng Việt đầu tiên của bạn!' }, guide: { replay: 'Xem lại hướng dẫn của Nghé', progress: 'Hướng dẫn nhanh · {{current}}/{{total}}', skip: 'Bỏ qua', back: 'Quay lại', next: 'Tiếp theo', finish: 'Bắt đầu học', steps: [ { variant: 'welcome', title: 'Xin chào! Mình là Nghé.', text: 'Mình sẽ chỉ bạn cách bắt đầu và duy trì hành trình học tiếng Việt.' }, { variant: 'teaching', title: 'Theo lộ trình học tập', text: 'Mở Khóa học để chọn trình độ, sau đó tiếp tục bài đang học ngay trên trang này.' }, { variant: 'speaking', title: 'Luyện phát âm', text: 'Dùng mục Bảng chữ cái và bài nghe để luyện âm tiếng Việt cùng sáu thanh điệu.' }, { variant: 'thinking', title: 'Ôn từ vựng hữu ích', text: 'Khu vực Từ vựng lưu các từ bạn đã chọn để ôn tập tập trung.' }, { variant: 'encouraging', title: 'Trò chuyện cùng Gia sư AI Nghé', text: 'Mở Gia sư AI để luyện hội thoại, rồi quay lại đây theo dõi tiến độ.' } ] } },
  todayChallenges: 'Thử thách hôm nay', challengeEmpty: 'Thử thách hằng ngày sẽ xuất hiện khi dịch vụ học tập cung cấp dữ liệu.', dailyGoal: 'Mục tiêu học hằng ngày', minutes: 'phút',
  weeklyLeaderboard: 'Bảng xếp hạng tuần', liveStandings: 'Xếp hạng trực tiếp', standingsInfo: 'Bảng xếp hạng chỉ hiển thị khi máy chủ cung cấp dữ liệu.', noLeaderboard: 'Chưa có dữ liệu xếp hạng.',
  weeklyStreak: 'Theo dõi chuỗi học tuần', streakHint: 'Hoàn thành một hoạt động học mỗi ngày để duy trì nhịp học.',
  hero: { morning: 'Chào buổi sáng', afternoon: 'Chào buổi chiều', evening: 'Chào buổi tối', noLesson: 'Chọn một khóa học để bắt đầu', continueEyebrow: 'HÀNH TRÌNH CỦA BẠN · TIẾP TỤC TỪ BÀI TRƯỚC', continueTitle: '{{greeting}}, {{name}}.', continueDescription: 'Tiếp tục đúng nơi bạn đã dừng và biến vài phút hôm nay thành sự tự tin lâu dài.', continueAction: 'TIẾP TỤC BÀI HỌC', reviewEyebrow: 'ÔN TẬP NHANH · DUY TRÌ CHUỖI HỌC', reviewTitle: 'Để tiếng Việt trở nên tự nhiên.', reviewDescription: 'Ôn các từ quan trọng, nghe phát âm tiếng Việt và củng cố trí nhớ.', reviewAction: 'ÔN TẬP TỪ VỰNG', reviewMeta: 'Bài ôn tập tập trung trong 5 phút', tutorEyebrow: 'BẠN LUYỆN NÓI AI · LUÔN SẴN SÀNG', tutorTitle: 'Luyện tập không áp lực.', tutorDescription: 'Xây dựng phản xạ hội thoại qua các tình huống đời sống tại Việt Nam.', tutorAction: 'TRÒ CHUYỆN VỚI AI', tutorMeta: 'Luyện hội thoại cá nhân hóa', journey: 'Hành trình học của bạn', progress: 'Tiến độ', discovery: 'Khám phá hôm nay', momentum: 'Duy trì nhịp học', madeForLevel: 'Phù hợp với trình độ của bạn', exploreCourses: 'Khám phá tất cả khóa học →', checkInReady: 'Bạn có thể điểm danh hôm nay.', checkIn: 'Điểm danh', energy: 'Năng lượng', label: 'Nội dung nổi bật cho học viên', choose: 'Chọn banner học tập', previous: 'Banner trước', next: 'Banner tiếp theo', pause: 'Tạm dừng banner', resume: 'Tiếp tục banner', show: 'Hiển thị banner {{number}}' },
  modules: { conversationTitle: 'Gia sư hội thoại AI', conversationVi: 'AI Conversation Tutor', conversationDescription: 'Luyện nói tiếng Việt với AI', vocabularyTitle: 'Từ vựng & Thanh điệu', vocabularyVi: 'Vocabulary & Tones', vocabularyDescription: 'Phân biệt âm và làm chủ 6 thanh điệu', cultureTitle: 'Văn hóa & Điểm đến', cultureVi: 'Culture & Destinations', cultureDescription: 'Khám phá phong tục, ẩm thực và con người Việt Nam' },
  dashboard: {
    welcome: 'Chào mừng bạn trở lại', welcomeName: 'Xin chào, {{name}}! 👋', welcomeSubtitle: 'Bạn đã sẵn sàng tiến bộ với tiếng Việt hôm nay chưa?', learner: 'Học viên', continueLearning: 'Tiếp tục học', exploreCourses: 'Khám phá khóa học', loadError: 'Không thể tải bảng học tập của bạn.',
    progressOverview: 'Tổng quan tiến độ học tập', streak: 'Chuỗi học hiện tại', days: 'ngày', totalXp: 'Tổng XP', completedLessons: 'Bài học hoàn thành', lessons: 'bài học', learningProgress: 'Tiến độ học tập', currentLesson: 'bài hiện tại', noData: 'Chưa có dữ liệu',
    continueSection: 'Tiếp tục học', learningPath: 'Lộ trình của bạn', continueDescription: 'Tiếp tục đúng nơi bạn đã dừng và duy trì nhịp học hôm nay.', lessonProgress: 'Tiến độ bài học', resumeHint: 'Vị trí học được tự động lưu', noCurrentLesson: 'Chọn khóa học tiếng Việt tiếp theo', noCurrentLessonText: 'Bắt đầu một khóa học để xem bài đang học và tiến độ tại đây.',
    quickAccess: 'Truy cập nhanh', learningModules: 'Nội dung học tập', viewAll: 'Xem tất cả', history: 'Lịch sử học tập', recentActivity: 'Hoạt động gần đây', noActivity: 'Bài học và lượt ôn tập đã hoàn thành sẽ xuất hiện tại đây.', today: 'Hôm nay', community: 'Cộng đồng', discovery: 'Khám phá mỗi ngày', wordOfDay: 'Từ tiếng Việt hôm nay', listenWord: 'Nghe từ {{word}}',
    reviewTitle: 'Ôn tập từ vựng', reviewText: 'Củng cố những từ đang đến hạn ôn tập.', reviewAction: 'Bắt đầu ôn từ vựng',
    carousel: {
      label: 'Điểm nhấn văn hóa Việt Nam', position: 'Slide {{current}} trên {{total}}', choose: 'Chọn slide văn hóa', previous: 'Slide trước', next: 'Slide tiếp theo', goTo: 'Chuyển đến slide {{number}}',
      buncha: { eyebrow: 'Ẩm thực Việt Nam · Hà Nội', title: 'Khám phá Việt Nam qua từng hương vị', description: 'Học tiếng Việt và trải nghiệm nét đẹp truyền thống của ẩm thực Việt Nam đậm đà bản sắc.', action: 'Tiếp tục học', imageAlt: 'Bún chả Hà Nội truyền thống với thịt nướng, bún tươi, rau sống và nước chấm' },
      mausoleum: { eyebrow: 'Lịch sử & Di sản · Hà Nội', title: 'Khám phá lịch sử và di sản Việt Nam', description: 'Khám phá tiếng Việt qua các dấu ấn lịch sử và danh lam văn hóa tiêu biểu của Việt Nam.', action: 'Khám phá di sản', imageAlt: 'Lăng Chủ tịch Hồ Chí Minh tại Quảng trường Ba Đình, Hà Nội' },
      tet: { eyebrow: 'Tết Cổ Truyền · Tết Nguyên Đán', title: 'Hòa mình vào không khí Tết Việt', description: 'Tìm hiểu phong tục, lời chúc và nét đẹp văn hóa ngày lễ quan trọng nhất trong năm.', action: 'Khám phá truyền thống', imageAlt: 'Mâm cỗ Tết truyền thống với bánh chưng, giò lụa và món ăn ngày Tết' },
      midAutumn: { eyebrow: 'Lễ hội truyền thống · Trung Thu', title: 'Trải nghiệm sắc màu Tết Trung Thu', description: 'Khám phá văn hóa Việt Nam qua lễ hội rực rỡ sắc màu và những phong tục đầy ý nghĩa.', action: 'Khám phá lễ hội', imageAlt: 'Đêm hội Tết Trung Thu Việt Nam với đoàn múa lân sư rồng và đèn lồng truyền thống' },
      discover: { eyebrow: 'Ngôn ngữ hòa cùng văn hóa', title: 'Khám phá Việt Nam qua từng bài học.', description: 'Học tiếng Việt và khám phá những vùng đất, con người và nét văn hóa độc đáo của Việt Nam.', action: 'Tiếp tục học', imageAlt: 'Phố cổ Hội An rực sáng về đêm' },
      conversation: { eyebrow: 'Tiếng Việt trong đời sống', title: 'Tự tin giao tiếp tiếng Việt.', description: 'Từ gọi cà phê đến làm quen bạn mới, hãy luyện tập những cuộc hội thoại thực tế.', action: 'Bắt đầu luyện tập', imageAlt: 'Mọi người dùng bữa và trò chuyện tại Hà Nội' },
      culture: { eyebrow: 'Ẩm thực, truyền thống, câu chuyện', title: 'Không chỉ là ngôn ngữ, mà còn là văn hóa.', description: 'Khám phá ẩm thực, truyền thống và những cách diễn đạt thú vị trong đời sống Việt Nam.', action: 'Khám phá bài học', imageAlt: 'Bàn ăn với các món Việt Nam truyền thống' },
    },
    modules: { roadmap: 'Lộ trình học', roadmapText: 'Bản đồ bài học tương tác từng bước.', courses: 'Khóa học', coursesText: 'Danh mục khóa học đa dạng theo chủ đề.', vocabulary: 'Từ vựng', vocabularyText: 'Ôn từ đã lưu và tăng khả năng ghi nhớ.', listening: 'Luyện nghe', listeningText: 'Luyện tai qua nội dung âm thanh trong khóa học.', pronunciation: 'Phát âm', pronunciationText: 'Làm chủ chữ cái và âm tiếng Việt.', practice: 'Luyện nói với AI', practiceText: 'Tự tin hơn qua hội thoại có hướng dẫn.' },
  },
};

export const resources = {
  en: { common: fromLegacyCatalog(1), navigation: navigationEn, home: homeEn, learner: learnerEn },
  vi: { common: fromLegacyCatalog(0), navigation: navigationVi, home: homeVi, learner: learnerVi },
};
