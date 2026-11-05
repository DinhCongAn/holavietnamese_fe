const SELF_ASSESSMENT_LEVELS = Object.freeze({
  A1: 'A1',
  A2: 'A2',
  B1: 'B1',
  B2: 'B2',
  C1: 'C1',
  C2: 'C2',
  new: 'A0',
  words: 'A1',
  simple: 'A2',
  everyday: 'B1',
  fluent: 'B2',
});

const LEVEL_ORDER = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const GOAL_PROFILES = Object.freeze({
  travel: {
    id: 'travel',
    titleVi: 'Giao tiếp du lịch thực tế',
    titleEn: 'Practical Vietnamese for travel',
    summaryVi: 'Ưu tiên những tình huống bạn sẽ dùng ngay khi đến Việt Nam: chào hỏi, di chuyển, gọi món và xử lý nhu cầu hằng ngày.',
    summaryEn: 'Prioritizes Vietnamese you can use immediately in Vietnam: greetings, transport, food, and everyday needs.',
    focusVi: ['Chào hỏi và làm quen', 'Đi lại, hỏi đường và mua sắm', 'Gọi món và giao tiếp dịch vụ'],
    focusEn: ['Greetings and introductions', 'Transport, directions, and shopping', 'Food and service conversations'],
    keywords: ['travel', 'du lịch', 'giao tiếp', 'conversation', 'daily', 'hằng ngày', 'ẩm thực', 'food', 'directions', 'đường đi'],
  },
  connection: {
    id: 'connection',
    titleVi: 'Giao tiếp gần gũi với người Việt',
    titleEn: 'Vietnamese for meaningful connections',
    summaryVi: 'Tập trung vào nghe hiểu, trò chuyện tự nhiên và vốn từ giúp bạn kết nối với gia đình, bạn bè và cộng đồng.',
    summaryEn: 'Builds listening, natural conversation, and vocabulary for family, friends, and community.',
    focusVi: ['Tự giới thiệu và hỏi thăm', 'Gia đình và cuộc sống hằng ngày', 'Nghe hiểu hội thoại tự nhiên'],
    focusEn: ['Introductions and catching up', 'Family and daily life', 'Natural listening comprehension'],
    keywords: ['family', 'gia đình', 'friends', 'bạn bè', 'conversation', 'hội thoại', 'daily', 'đời sống'],
  },
  work: {
    id: 'work',
    titleVi: 'Tiếng Việt cho học tập và công việc',
    titleEn: 'Vietnamese for study and work',
    summaryVi: 'Xây nền giao tiếp rõ ràng, lịch sự và tiến dần đến vốn từ dùng trong lớp học, nơi làm việc và các tình huống chuyên nghiệp.',
    summaryEn: 'Builds clear, polite communication for classrooms, workplaces, and professional situations.',
    focusVi: ['Giao tiếp lịch sự', 'Học tập và môi trường công sở', 'Trình bày ý kiến rõ ràng'],
    focusEn: ['Polite communication', 'Study and workplace language', 'Expressing ideas clearly'],
    keywords: ['work', 'công việc', 'study', 'học tập', 'business', 'professional', 'office', 'công sở'],
  },
  culture: {
    id: 'culture',
    titleVi: 'Ngôn ngữ gắn với văn hóa Việt Nam',
    titleEn: 'Vietnamese through culture',
    summaryVi: 'Học ngôn ngữ qua phong tục, ẩm thực, địa danh và cách giao tiếp phù hợp với bối cảnh văn hóa Việt Nam.',
    summaryEn: 'Learns the language through traditions, food, places, and culturally appropriate communication.',
    focusVi: ['Từ vựng văn hóa và đời sống', 'Cách xưng hô theo ngữ cảnh', 'Câu chuyện, địa danh và ẩm thực'],
    focusEn: ['Culture and daily-life vocabulary', 'Context-aware forms of address', 'Stories, places, and cuisine'],
    keywords: ['culture', 'văn hóa', 'tradition', 'phong tục', 'food', 'ẩm thực', 'vietnam', 'việt nam'],
  },
  challenge: {
    id: 'challenge',
    titleVi: 'Nền tảng tiếng Việt toàn diện',
    titleEn: 'Complete Vietnamese foundations',
    summaryVi: 'Phát triển cân bằng nghe, nói, đọc và viết với các cột mốc rõ ràng để duy trì động lực lâu dài.',
    summaryEn: 'Develops listening, speaking, reading, and writing through clear milestones that sustain motivation.',
    focusVi: ['Phát âm và thanh điệu', 'Từ vựng cốt lõi', 'Phản xạ qua bài tập thực hành'],
    focusEn: ['Pronunciation and tones', 'Core vocabulary', 'Practice-based fluency'],
    keywords: ['foundation', 'nền tảng', 'pronunciation', 'phát âm', 'vocabulary', 'từ vựng', 'skills', 'kỹ năng'],
  },
  other: {
    id: 'other',
    titleVi: 'Lộ trình tiếng Việt linh hoạt',
    titleEn: 'Flexible Vietnamese pathway',
    summaryVi: 'Bắt đầu từ năng lực hiện tại, củng cố kiến thức nền và điều chỉnh trọng tâm khi mục tiêu của bạn rõ hơn.',
    summaryEn: 'Starts from your current ability, strengthens core knowledge, and adapts as your goals become clearer.',
    focusVi: ['Phát âm nền tảng', 'Giao tiếp thiết yếu', 'Từ vựng theo chủ đề'],
    focusEn: ['Core pronunciation', 'Essential communication', 'Topic-based vocabulary'],
    keywords: ['vietnamese', 'tiếng việt', 'foundation', 'nền tảng', 'communication', 'giao tiếp'],
  },
});

export const GOAL_DISCOVERY_PROFILES = Object.freeze({
  travel: [
    { id: 'places', path: '/explore', titleVi: 'Khám phá điểm đến Việt Nam', titleEn: 'Explore Vietnamese destinations', detailVi: 'Học ngôn ngữ qua địa danh, ẩm thực và tình huống du lịch thực tế.', detailEn: 'Learn through destinations, food, and practical travel situations.' },
    { id: 'regions', path: '/regional-vietnamese', titleVi: 'Tiếng Việt ba miền', titleEn: 'Vietnamese across three regions', detailVi: 'Nhận biết cách nói miền Bắc, Trung và Nam khi di chuyển.', detailEn: 'Recognize Northern, Central, and Southern expressions while traveling.' },
    { id: 'culture', path: '/culture', titleVi: 'Văn hóa ứng xử khi du lịch', titleEn: 'Cultural etiquette for travel', detailVi: 'Hiểu phong tục và cách giao tiếp phù hợp tại Việt Nam.', detailEn: 'Understand local customs and communicate appropriately in Vietnam.' },
  ],
  connection: [
    { id: 'regions', path: '/regional-vietnamese', titleVi: 'Hiểu cách nói của người thân', titleEn: 'Understand how people speak locally', detailVi: 'So sánh từ ngữ và cách xưng hô giữa các vùng miền.', detailEn: 'Compare vocabulary and forms of address across regions.' },
    { id: 'culture', path: '/culture', titleVi: 'Câu chuyện văn hóa và gia đình', titleEn: 'Culture and family stories', detailVi: 'Hiểu thêm về nếp sống, lễ hội và quan hệ trong gia đình Việt.', detailEn: 'Learn about Vietnamese family life, festivals, and relationships.' },
    { id: 'speaking', path: '/ai-scenarios', titleVi: 'Luyện hội thoại kết nối', titleEn: 'Practice conversations that connect', detailVi: 'Tập hỏi thăm và trò chuyện tự nhiên trong các tình huống gần gũi.', detailEn: 'Practice natural catch-ups and conversations in familiar situations.' },
  ],
  work: [
    { id: 'speaking', path: '/ai-scenarios', titleVi: 'Hội thoại học tập và công việc', titleEn: 'Study and workplace conversations', detailVi: 'Luyện phản xạ lịch sự trong lớp học, cuộc họp và nơi làm việc.', detailEn: 'Practice polite reflexes for classes, meetings, and workplaces.' },
    { id: 'vocabulary', path: '/vocabulary', titleVi: 'Từ vựng theo chủ đề chuyên môn', titleEn: 'Topic-based professional vocabulary', detailVi: 'Xây vốn từ giúp diễn đạt rõ ràng và chính xác hơn.', detailEn: 'Build vocabulary for clearer and more precise communication.' },
    { id: 'culture', path: '/culture', titleVi: 'Văn hóa giao tiếp nơi làm việc', titleEn: 'Vietnamese workplace culture', detailVi: 'Hiểu cách xưng hô, phép lịch sự và bối cảnh giao tiếp.', detailEn: 'Understand forms of address, etiquette, and communication context.' },
  ],
  culture: [
    { id: 'culture', path: '/culture', titleVi: 'Khám phá văn hóa Việt Nam', titleEn: 'Explore Vietnamese culture', detailVi: 'Đọc về phong tục, lễ hội, ẩm thực và đời sống.', detailEn: 'Discover customs, festivals, cuisine, and everyday life.' },
    { id: 'places', path: '/explore', titleVi: 'Đi qua các vùng đất Việt Nam', titleEn: 'Journey through Vietnam', detailVi: 'Kết nối ngôn ngữ với địa danh và câu chuyện địa phương.', detailEn: 'Connect language with destinations and local stories.' },
    { id: 'regions', path: '/regional-vietnamese', titleVi: 'So sánh tiếng Việt vùng miền', titleEn: 'Compare regional Vietnamese', detailVi: 'Khám phá khác biệt thú vị giữa miền Bắc, Trung và Nam.', detailEn: 'Explore fascinating differences across Northern, Central, and Southern Vietnamese.' },
  ],
  challenge: [
    { id: 'culture', path: '/culture', titleVi: 'Mở rộng hiểu biết văn hóa', titleEn: 'Broaden your cultural knowledge', detailVi: 'Thử sức với ngôn ngữ trong những câu chuyện giàu bối cảnh.', detailEn: 'Challenge yourself with language in context-rich stories.' },
    { id: 'regions', path: '/regional-vietnamese', titleVi: 'Thử thách từ vựng vùng miền', titleEn: 'Regional vocabulary challenge', detailVi: 'Rèn khả năng nhận biết nhiều cách diễn đạt cùng một ý.', detailEn: 'Train yourself to recognize multiple ways to express one idea.' },
    { id: 'speaking', path: '/ai-tutor', titleVi: 'Thử thách phản xạ cùng AI', titleEn: 'AI speaking challenge', detailVi: 'Vận dụng kiến thức qua hội thoại mở và phản hồi tức thì.', detailEn: 'Apply your knowledge through open conversation and instant feedback.' },
  ],
  other: [
    { id: 'culture', path: '/culture', titleVi: 'Khám phá văn hóa Việt Nam', titleEn: 'Explore Vietnamese culture', detailVi: 'Đặt ngôn ngữ vào phong tục, ẩm thực và đời sống thực tế.', detailEn: 'Put the language in the context of customs, food, and daily life.' },
    { id: 'regions', path: '/regional-vietnamese', titleVi: 'Làm quen tiếng Việt vùng miền', titleEn: 'Discover regional Vietnamese', detailVi: 'Hiểu những khác biệt phổ biến giữa ba miền.', detailEn: 'Understand common differences across Vietnam’s three regions.' },
    { id: 'places', path: '/explore', titleVi: 'Khám phá Việt Nam', titleEn: 'Explore Vietnam', detailVi: 'Học thêm qua địa danh và trải nghiệm bản địa.', detailEn: 'Learn through destinations and local experiences.' },
  ],
});

const GOAL_ALIASES = Object.freeze({
  daily_communication: 'connection',
  exam_vsl: 'challenge',
});

export const normalizeGoalId = (goalId) => {
  const normalized = GOAL_ALIASES[goalId] || goalId;
  return GOAL_PROFILES[normalized] ? normalized : 'other';
};

export const PACE_PROFILES = Object.freeze({
  gentle: { id: 'gentle', maxMinutes: 5, titleVi: 'Nhịp nhẹ nhàng', titleEn: 'Gentle pace', sessionsPerWeek: 4, weeklyMinutes: 20, detailVi: '4 buổi ngắn mỗi tuần, ưu tiên duy trì thói quen.', detailEn: 'Four short sessions per week, focused on consistency.' },
  steady: { id: 'steady', maxMinutes: 10, titleVi: 'Nhịp đều đặn', titleEn: 'Steady pace', sessionsPerWeek: 5, weeklyMinutes: 50, detailVi: '5 buổi mỗi tuần, cân bằng học mới và ôn tập.', detailEn: 'Five sessions per week, balancing new material and review.' },
  progressive: { id: 'progressive', maxMinutes: 15, titleVi: 'Nhịp tiến bộ', titleEn: 'Progressive pace', sessionsPerWeek: 5, weeklyMinutes: 75, detailVi: '5 buổi tập trung mỗi tuần, có thêm luyện nghe và nói.', detailEn: 'Five focused sessions per week with extra listening and speaking.' },
  intensive: { id: 'intensive', maxMinutes: Infinity, titleVi: 'Nhịp chuyên sâu', titleEn: 'Intensive pace', sessionsPerWeek: 6, weeklyMinutes: 180, detailVi: '6 buổi mỗi tuần, kết hợp bài học, luyện tập và ôn sâu.', detailEn: 'Six sessions per week combining lessons, practice, and deep review.' },
});

const paceForMinutes = (minutes = 10) => Object.values(PACE_PROFILES).find((pace) => Number(minutes) <= pace.maxMinutes) || PACE_PROFILES.steady;

export function resolveTargetLevel(data = {}) {
  if (data.placementResult?.assessedLevel) return data.placementResult.assessedLevel;
  if (data.placementResult?.targetLevel) return data.placementResult.targetLevel;
  if (data.assessedLevel) return data.assessedLevel;
  if (data.learningPath === 'beginner') return 'A0';
  return SELF_ASSESSMENT_LEVELS[data.selectedLevel] || SELF_ASSESSMENT_LEVELS[data.currentLevel] || 'A1';
}

export function buildOnboardingRecommendation(data = {}) {
  const reasons = Array.isArray(data.learningReasons) ? data.learningReasons : [];
  const goalId = normalizeGoalId(reasons.find((reason) => reason !== 'other') || reasons[0] || 'other');
  const goal = GOAL_PROFILES[goalId] || GOAL_PROFILES.other;
  const pace = paceForMinutes(data.dailyGoalMinutes);
  const targetLevel = resolveTargetLevel(data);
  const levelIndex = Math.max(1, LEVEL_ORDER.indexOf(targetLevel));
  const baseWeeks = 8 + (levelIndex * 4);
  const paceFactor = pace.id === 'intensive' ? 0.7 : pace.id === 'progressive' ? 0.85 : pace.id === 'gentle' ? 1.35 : 1;
  const estimatedWeeks = Math.max(6, Math.round(baseWeeks * paceFactor));

  return {
    goalId: goal.id,
    secondaryGoalIds: reasons.filter((reason) => reason !== goal.id),
    targetLevel,
    titleVi: `${goal.titleVi} · ${targetLevel}`,
    titleEn: `${goal.titleEn} · ${targetLevel}`,
    summaryVi: goal.summaryVi,
    summaryEn: goal.summaryEn,
    focusVi: goal.focusVi,
    focusEn: goal.focusEn,
    keywords: goal.keywords,
    paceId: pace.id,
    paceTitleVi: pace.titleVi,
    paceTitleEn: pace.titleEn,
    paceDetailVi: pace.detailVi,
    paceDetailEn: pace.detailEn,
    sessionsPerWeek: pace.sessionsPerWeek,
    weeklyMinutes: pace.weeklyMinutes,
    dailyMinutes: Number(data.dailyGoalMinutes) || 10,
    estimatedWeeks,
    discovery: GOAL_DISCOVERY_PROFILES[goal.id] || GOAL_DISCOVERY_PROFILES.other,
  };
}

export function buildRecommendationPath(recommendation) {
  const params = new URLSearchParams({
    level: recommendation.targetLevel,
    recommended: '1',
    goal: recommendation.goalId,
    pace: recommendation.paceId,
  });
  return `/courses?${params.toString()}`;
}

export function buildLearningPathPath(recommendation) {
  const params = new URLSearchParams({
    level: recommendation.targetLevel,
    recommended: '1',
    goal: recommendation.goalId,
    pace: recommendation.paceId,
  });
  return `/learning-path?${params.toString()}`;
}

export function rankCoursesForRecommendation(items = [], recommendation = {}) {
  const targetLevel = String(recommendation.targetLevel || 'A1').toUpperCase();
  const goal = GOAL_PROFILES[normalizeGoalId(recommendation.goalId)];
  const targetIndex = LEVEL_ORDER.indexOf(targetLevel);

  return items
    .map((item) => {
      const course = item?.course || item || {};
      const courseLevel = String(course.level || '').toUpperCase();
      const courseIndex = LEVEL_ORDER.indexOf(courseLevel);
      const text = [course.title, course.titleVi, course.description, course.descriptionVi, course.learningOutcomes]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('vi');
      const keywordMatches = goal.keywords.filter((keyword) => text.includes(keyword.toLocaleLowerCase('vi'))).length;
      const levelScore = courseLevel === targetLevel
        ? 70
        : targetLevel === 'A1' && courseLevel === 'A0'
          ? 42
          : courseIndex >= 0 && targetIndex >= 0 && Math.abs(courseIndex - targetIndex) === 1
            ? 18
            : 0;
      const score = levelScore + Math.min(keywordMatches, 4) * 8 + (course.isFree ? 3 : 0);
      return { ...item, recommendationScore: score, recommendationGoalId: goal.id };
    })
    .sort((left, right) => right.recommendationScore - left.recommendationScore);
}
