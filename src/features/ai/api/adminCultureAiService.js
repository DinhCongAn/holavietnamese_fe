// Admin Service for Culture, AI Scenarios, AI Settings, Usage & Reviews (Người 4 Admin)

import axiosClient from '@/shared/api/axiosClient';

const STORAGE_ADMIN_CULTURE = 'hola_admin_culture_articles_v1';
const STORAGE_ADMIN_CATEGORIES = 'hola_admin_culture_categories_v1';
const STORAGE_ADMIN_SCENARIOS = 'hola_admin_ai_scenarios_v1';
const STORAGE_ADMIN_AI_SETTINGS = 'hola_admin_ai_settings_v1';
const STORAGE_ADMIN_REVIEWS = 'hola_admin_ai_reviews_v1';

export function scenarioToApiPayload(data) {
  return {
    id: data.id || undefined,
    title: data.titleVi || data.title,
    titleVi: data.titleVi || data.title,
    titleEn: data.titleEn || undefined,
    level: data.level, topic: data.topic,
    destination: data.destination, difficulty: data.difficulty, duration: data.duration,
    thumbnail: data.thumbnail, coverImage: data.coverImage,
    overview: data.overviewVi || data.overview,
    overviewVi: data.overviewVi || data.overview,
    overviewEn: data.overviewEn || undefined,
    aiRoleName: data.aiRoleName || data.aiRole?.name,
    aiRoleTitle: data.aiRoleTitle || data.aiRole?.role,
    aiRoleAvatar: data.aiRoleAvatar || data.aiRole?.avatar,
    aiRoleTone: data.aiRoleTone || data.aiRole?.tone,
    aiRoleInitialGreeting: data.aiRoleInitialGreeting || data.aiRole?.initialGreeting,
    learnerRoleTitle: data.learnerRoleTitle || data.learnerRole?.role || data.learnerRole,
    learnerRoleContext: data.learnerRoleContext || data.learnerRole?.context || data.contextStory,
    objectives: data.objectives || [], vocabularyHints: data.vocabularyHints || [],
    culturalTip: data.culturalTip, sampleHints: data.sampleHints || [],
    maxTurns: data.maxTurns || data.endCondition?.maxTurns || 10, status: data.status || 'DRAFT',
  };
}

export function scenarioFromApi(data) {
  return { ...data,
    aiRole: data.aiRole || { name: data.aiRoleName, role: data.aiRoleTitle, avatar: data.aiRoleAvatar, tone: data.aiRoleTone, initialGreeting: data.aiRoleInitialGreeting },
    learnerRole: data.learnerRole || { role: data.learnerRoleTitle, context: data.learnerRoleContext },
    endCondition: { maxTurns: data.maxTurns || 10, requireAllObjectives: true },
  };
}

// Initial Mock Categories
const INITIAL_CATEGORIES = [
  { id: 'culinary', name: 'Ẩm thực', nameVi: 'Ẩm thực', nameEn: 'Food & Cuisine', slug: 'culinary', icon: '🍜', description: 'Món ăn, đồ uống, văn hóa ẩm thực và nghệ thuật thưởng vị 3 miền.', order: 1, articleCount: 2 },
  { id: 'tradition', name: 'Lễ hội & Phong tục', nameVi: 'Lễ hội & Phong tục', nameEn: 'Festivals & Traditions', slug: 'tradition', icon: '🏮', description: 'Tết Nguyên Đán, Trung Thu, hội làng và phong tục tập quán truyền thống.', order: 2, articleCount: 1 },
  { id: 'daily-life', name: 'Đời sống thường nhật', nameVi: 'Đời sống thường nhật', nameEn: 'Daily Life', slug: 'daily-life', icon: '☕', description: 'Cà phê vỉa hè, xe máy phố thị, nếp sinh hoạt quen thuộc của người Việt.', order: 3, articleCount: 1 },
  { id: 'art', name: 'Nghệ thuật & Di sản', nameVi: 'Nghệ thuật & Di sản', nameEn: 'Arts & Heritage', slug: 'art', icon: '🎭', description: 'Áo dài, tranh Đông Hồ, nhã nhạc cung đình Huế, ca trù và làng nghề truyền thống.', order: 4, articleCount: 0 },
  { id: 'travel-spots', name: 'Danh lam & Điểm đến', nameVi: 'Danh lam & Điểm đến', nameEn: 'Destinations & Sights', slug: 'travel-spots', icon: '🗺️', description: 'Phố cổ Hội An, Cố đô Huế, Hoàng thành Thăng Long, sông nước miền Tây.', order: 5, articleCount: 1 },
  { id: 'etiquette', name: 'Ứng xử & Xưng hô', nameVi: 'Ứng xử & Xưng hô', nameEn: 'Etiquette & Politeness', slug: 'etiquette', icon: '🙏', description: 'Nghệ thuật xưng hô, kính trên nhường dưới, văn hóa mời cơm và chào hỏi.', order: 6, articleCount: 1 },
];

// Initial Mock Articles for Admin
const INITIAL_ARTICLES = [
  {
    id: 'van-hoa-ca-phe-viet-nam',
    title: 'Văn hóa cà phê Việt Nam: Từ Cà phê phin đến Cà phê trứng nức tiếng',
    category: 'daily-life',
    categoryName: 'Đời sống thường nhật',
    author: 'Nguyễn Thanh Thảo',
    region: 'Toàn quốc',
    destination: 'Hà Nội & TP.HCM',
    status: 'PUBLISHED', // DRAFT, IN_REVIEW, PUBLISHED, ARCHIVED
    views: 1420,
    publishedAt: '2026-03-15',
    summary: 'Cà phê tại Việt Nam không chỉ là thức uống mà là phong cách sống thong dong.',
    coverImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    content: 'Người Pháp mang cây cà phê vào Việt Nam từ giữa thế kỷ 19...',
    usefulPhrases: [
      { word: 'Cà phê phin', pronunciation: 'kà-phê-phin', meaning: 'Drip coffee filter' },
      { word: 'Cà phê sữa đá', pronunciation: 'kà-phê-sữa-đá', meaning: 'Iced milk coffee' },
    ],
  },
  {
    id: 'bi-quyet-pho-ha-noi',
    title: 'Bí quyết thưởng thức Phở chuẩn vị Hà Nội và văn hóa ẩm thực Tràng An',
    category: 'culinary',
    categoryName: 'Food (Ẩm thực)',
    author: 'Vũ Bằng',
    region: 'Miền Bắc',
    destination: 'Hà Nội',
    status: 'PUBLISHED',
    views: 2890,
    publishedAt: '2026-03-18',
    summary: 'Phở là biểu tượng ẩm thực quốc gia, hội tụ phong vị tinh tế của người Tràng An.',
    coverImage: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    content: 'Nước dùng trong vắt ninh từ xương ống bò hơn 10 tiếng...',
    usefulPhrases: [
      { word: 'Phở bò tái chín', pronunciation: 'phở-bò-tái-chín', meaning: 'Rare & cooked beef pho' },
      { word: 'Quẩy giòn', pronunciation: 'quẩy-giòn', meaning: 'Crispy fried dough sticks' },
    ],
  },
  {
    id: 'nghe-thuat-xung-ho-viet-nam',
    title: 'Nghệ thuật xưng hô trong gia đình và xã hội Việt Nam: Tinh tế và tôn ti',
    category: 'etiquette',
    categoryName: 'Etiquette (Ứng xử & Xưng hô)',
    author: 'TS. Lê Hoàng Mai',
    region: 'Toàn quốc',
    destination: 'Toàn quốc',
    status: 'PUBLISHED',
    views: 980,
    publishedAt: '2026-03-20',
    summary: 'Hệ thống đại từ xưng hô phản ánh thứ bậc và tình cảm sâu đậm của người Việt.',
    coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    content: 'Xã hội như một đại gia đình...',
    usefulPhrases: [
      { word: 'Kính trên nhường dưới', pronunciation: 'kính-trên-nhường-dưới', meaning: 'Respect elders' },
      { word: 'Dạ, chào bác ạ', pronunciation: 'dạ-chào-bác-ạ', meaning: 'Polite greeting' },
    ],
  },
  {
    id: 'phong-tuc-tet-nguyen-dan',
    title: 'Phong tục đón Tết Nguyên Đán: Những điều nên làm và kiêng kỵ để đón lộc',
    category: 'tradition',
    categoryName: 'Festivals (Lễ hội & Phong tục)',
    author: 'Trần Gia Bảo',
    region: 'Toàn quốc',
    destination: 'Toàn quốc',
    status: 'IN_REVIEW',
    views: 450,
    publishedAt: '2026-03-22',
    summary: 'Tết là dịp đoàn viên thiêng liêng với hoa mai, hoa đào và lì xì may mắn.',
    coverImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    content: 'Những điều kiêng kỵ đầu năm mới...',
    usefulPhrases: [
      { word: 'Chúc mừng năm mới', pronunciation: 'chúc-mừng-năm-mới', meaning: 'Happy New Year' },
    ],
  },
  {
    id: 'am-thuc-cung-dinh-hue',
    title: 'Nghệ thuật bài trí và triết lý ẩm thực cung đình Huế',
    category: 'culinary',
    categoryName: 'Food (Ẩm thực)',
    author: 'Hoàng Thị Như',
    region: 'Miền Trung',
    destination: 'Huế',
    status: 'DRAFT',
    views: 0,
    publishedAt: '2026-03-25',
    summary: 'Mỗi món ăn là một tác phẩm nghệ thuật cầu kỳ và triết lý ngũ hành tương sinh.',
    coverImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
    content: 'Đang hoàn thiện nội dung bản thảo...',
    usefulPhrases: [],
  },
];

// Initial Admin Scenarios
const INITIAL_SCENARIOS = [
  {
    id: 'goi-mon-pho-ha-noi',
    title: 'Gọi món tại quán Phở gia truyền Hà Nội',
    topic: 'dining',
    topicName: 'Ẩm thực & Quán xá',
    level: 'A1',
    destination: 'Hà Nội',
    difficulty: 'Dễ',
    status: 'ACTIVE', // ACTIVE, DRAFT, ARCHIVED
    completionsCount: 245,
    avgScore: 89,
    aiRole: {
      name: 'Cô Mai (Chủ quán Phở)',
      role: 'Chủ quán phở Hà Nội nhanh nhẹn, xưng hô "cô - cháu"',
      avatar: '👩‍🍳',
      tone: 'Thân thiện, xởi lởi, giọng Bắc chuẩn Tràng An',
      initialGreeting: 'Chào cháu! Quán cô đang có bàn trống trong góc kìa, vào ngồi đi cháu! Hôm nay cháu muốn ăn phở bò tái, chín, hay nạm gầu nào?',
    },
    learnerRole: 'Du khách lần đầu thưởng thức phở truyền thống',
    contextStory: 'Quán phở gia truyền đông đúc trên phố Bát Đàn buổi sáng sớm.',
    objectives: [
      'Chào hỏi và xác nhận chỗ ngồi tại quán',
      'Gọi một bát phở bò kèm yêu cầu đặc biệt (ít hành/ớt)',
      'Gọi thêm đồ uống (trà đá) và quẩy giòn',
      'Hỏi giá tiền và cảm ơn thanh toán',
    ],
    sampleHints: [
      'Dạ chào cô! Cho cháu một bát phở bò tái chín, ít hành ít ớt nhé cô!',
      'Cô cho cháu thêm một đĩa quẩy giòn và một cốc trà đá với ạ!',
      'Cô ơi của cháu hết tất cả bao nhiêu tiền ạ?',
    ],
    endCondition: {
      maxTurns: 10,
      requireAllObjectives: true,
    },
    criteria: ['Lưu loát', 'Vốn từ vựng ẩm thực', 'Ngữ pháp', 'Sắc thái lịch sự miền Bắc'],
  },
  {
    id: 'tra-gia-cho-ben-thanh',
    title: 'Trả giá quà lưu niệm tại Chợ Bến Thành',
    topic: 'shopping',
    topicName: 'Mua sắm & Mặc cả',
    level: 'A2',
    destination: 'TP. Hồ Chí Minh',
    difficulty: 'Trung bình',
    status: 'ACTIVE',
    completionsCount: 198,
    avgScore: 84,
    aiRole: {
      name: 'Chị Ba Bến Thành',
      role: 'Tiểu thương sành sỏi, hoạt ngôn, xưng hô "chị - em"',
      avatar: '🧣',
      tone: 'Niềm nở, dẻo miệng, giọng Nam Bộ ngọt ngào',
      initialGreeting: 'Ủa em gái / em trai, ghé sạp chị Ba coi nón lá với cà phê nè! Hàng xịn thủ công loại một đó cưng, mở hàng cho chị một món lấy hên đi!',
    },
    learnerRole: 'Khách du lịch muốn mua quà lưu niệm với giá hợp lý',
    contextStory: 'Mua nón lá và cà phê tại sạp lưu niệm chợ Bến Thành.',
    objectives: [
      'Hỏi giá món đồ lưu niệm bằng tiếng Việt',
      'Khen món đồ và đưa ra đề xuất giảm giá lịch sự',
      'Đàm phán mua số lượng 2 món để được bớt thêm',
      'Chốt giá thân thiện và hoàn tất thanh toán',
    ],
    sampleHints: [
      'Cái nón này bao nhiêu tiền chị Ba?',
      'Bớt cho em chút lấy may mắn đi chị, hai trăm nhé?',
      'Nếu em lấy 2 cái thì chị tính bao nhiêu nè?',
    ],
    endCondition: {
      maxTurns: 12,
      requireAllObjectives: true,
    },
    criteria: ['Phản xạ thương lượng', 'Từ ngữ Nam Bộ', 'Lịch thiệp thân mật'],
  },
  {
    id: 'bat-xe-om-cong-nghe',
    title: 'Đón xe ôm công nghệ & Chỉ đường đến điểm hẹn',
    topic: 'travel',
    topicName: 'Di chuyển & Du lịch',
    level: 'A2',
    destination: 'Hà Nội / Sài Gòn',
    difficulty: 'Dễ - Trung bình',
    status: 'ACTIVE',
    completionsCount: 167,
    avgScore: 91,
    aiRole: {
      name: 'Bác Hùng (Tài xế công nghệ)',
      role: 'Tài xế xe ôm nhiệt tình, xưng "chú - cháu"',
      avatar: '🛵',
      tone: 'Chân chất, hào sảng',
      initialGreeting: 'A lô, cháu có phải người đặt xe đi Bảo tàng Lịch sử không? Chú đang tới gần rồi, cháu đứng chỗ nào?',
    },
    learnerRole: 'Hành khách chờ đón ở cổng địa điểm',
    contextStory: 'Xác nhận điểm đón và trò chuyện với tài xế.',
    objectives: [
      'Mô tả vị trí và nhận diện trang phục',
      'Xác nhận biển số xe',
      'Trò chuyện ngắn trên đường',
      'Thanh toán qua QR code',
    ],
    sampleHints: ['Cháu đang đứng trước cổng khách sạn ạ', 'Chú cho cháu quét mã QR chuyển khoản nhé'],
    endCondition: { maxTurns: 8, requireAllObjectives: false },
    criteria: ['Giao tiếp di chuyển', 'Kính ngữ chú - cháu', 'Rõ ràng vị trí'],
  },
];

// Initial AI Settings
const INITIAL_AI_SETTINGS = {
  activeModel: 'openrouter/free',
  allowedModels: [
    { id: 'openrouter/free', name: 'OpenRouter Free (Đang dùng - miễn phí)', provider: 'OpenRouter', costPer1kTokens: 0, isDefault: true },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Khuyên dùng - Nhanh, ổn định)', provider: 'Google', costPer1kTokens: 0.00035, isDefault: true },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Nâng cao - Suy luận sâu cho ngữ pháp & văn hóa)', provider: 'Google', costPer1kTokens: 0.0035, isDefault: false },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Đa ngôn ngữ phản xạ)', provider: 'OpenAI', costPer1kTokens: 0.0006, isDefault: false },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet (Chính xác văn bản cao cấp)', provider: 'Anthropic', costPer1kTokens: 0.006, isDefault: false },
  ],
  systemPromptVersion: 'v2.2.0-stable',
  promptVersionsHistory: [
    { version: 'v2.2.0-stable', releasedAt: '2026-03-20', author: 'AI Team Leader', note: 'Thêm quy tắc: Tuyệt đối không sinh điểm phát âm giả nếu không có phân tích âm thanh thực tế.' },
    { version: 'v2.1.0', releasedAt: '2026-02-15', author: 'Senior Engineer', note: 'Cải tiến phân loại từ vựng Bắc - Trung - Nam.' },
    { version: 'v2.0.0', releasedAt: '2026-01-10', author: 'AI Architect', note: 'Ra mắt 7 chế độ AI Tutor.' },
  ],
  limits: {
    maxTurnsPerSession: 25,
    maxTokensPerResponse: 1024,
    rateLimitPerMinute: 30, // Per IP / user
    dailySessionsPerUser: 40,
    monthlyBudgetCapUsd: 150.0,
    currentMonthSpendUsd: 42.68,
    costAlertThresholdPercent: 80,
  },
  security: {
    apiKeyLocation: 'Secure Backend Environment Only (Vault / ENV)',
    backendProxyUrl: '/api/v1/ai/completions',
    clientExposedKeys: false,
    historyPrivacyStrict: true,
  },
};

// Initial Reviews & Quality Logs
const INITIAL_REVIEWS = [
  {
    id: 'rev-101',
    sessionId: 'session-user-8921',
    userIdentifier: 'learner_alex@gmail.com',
    scenarioId: 'goi-mon-pho-ha-noi',
    scenarioTitle: 'Gọi món tại quán Phở gia truyền Hà Nội',
    rating: 5,
    userFeedback: 'AI nhập vai cô bán phở rất giống thực tế ở phố cổ Bát Đàn!',
    taggedIssues: [],
    hasPermissionToView: true,
    reviewedByAdmin: true,
    status: 'APPROVED',
    createdAt: '2026-03-26 09:15',
  },
  {
    id: 'rev-102',
    sessionId: 'session-user-9144',
    userIdentifier: 'kenji.tokyo@outlook.com',
    scenarioId: 'tra-gia-cho-ben-thanh',
    scenarioTitle: 'Trả giá quà lưu niệm tại Chợ Bến Thành',
    rating: 4,
    userFeedback: 'Cách nói bớt giá rất vui, nhưng đôi lúc AI dùng từ hơi trang trọng so với tiểu thương chợ Bến Thành.',
    taggedIssues: ['Tone/Style Mismatch (Cần dân dã hơn)'],
    hasPermissionToView: true,
    reviewedByAdmin: false,
    status: 'NEEDS_PROMPT_TUNING',
    createdAt: '2026-03-25 16:42',
  },
  {
    id: 'rev-103',
    sessionId: 'session-user-9302',
    userIdentifier: 'maria.bernard@paris.fr',
    scenarioId: 'goi-mon-pho-ha-noi',
    scenarioTitle: 'Gọi món tại quán Phở gia truyền Hà Nội',
    rating: 3,
    userFeedback: 'Có câu nói bị giải thích nhầm dấm tỏi thành nước mắm chua ngọt.',
    taggedIssues: ['Factual Inaccuracy (Nhầm gia vị ẩm thực Hà Nội)'],
    hasPermissionToView: true,
    reviewedByAdmin: false,
    status: 'FLAGGED',
    createdAt: '2026-03-24 11:20',
  },
];

export const adminCultureAiService = {
  async loadAiSettings() {
    const response = await axiosClient.get('/api/admin/ai/settings');
    return response?.result ?? response;
  },

  async updateAiSettings(settings) {
    const limits = settings?.limits || {};
    const payload = {
      activeModel: settings.activeModel,
      systemPromptVersion: settings.systemPromptVersion,
      systemPrompt: settings.systemPrompt ?? '',
      maxTurnsPerSession: Number(limits.maxTurnsPerSession),
      maxTokensPerResponse: Number(limits.maxTokensPerResponse),
      rateLimitPerMinute: Number(limits.rateLimitPerMinute),
      dailySessionsPerUser: Number(limits.dailySessionsPerUser),
      monthlyBudgetCapUsd: Number(limits.monthlyBudgetCapUsd),
      costAlertThresholdPercent: Number(limits.costAlertThresholdPercent),
      enabledModes: Array.isArray(settings.enabledModes) ? settings.enabledModes.join(',') : settings.enabledModes,
      contextOptions: Array.isArray(settings.contextOptions) ? settings.contextOptions.join(',') : settings.contextOptions,
      moderationEnabled: Boolean(settings.moderationEnabled ?? true),
    };
    if (settings.apiKey && settings.apiKey.trim()) {
      payload.apiKey = settings.apiKey.trim();
    }
    const response = await axiosClient.put('/api/admin/ai/settings', payload);
    return response?.result ?? response;
  },

  async loadUsageStats() {
    const response = await axiosClient.get('/api/admin/ai/usage');
    return response?.result ?? response;
  },

  async listReviewRecords() {
    const response = await axiosClient.get('/api/admin/ai/reviews');
    const records = response?.result ?? response;
    return Array.isArray(records) ? records.map(review => ({
      ...review,
      userIdentifier: review.userEmail || review.userFullName || `user-${review.userId || 'anonymous'}`,
      taggedIssues: review.taggedIssues || [],
    })) : [];
  },

  async updateReviewRecordStatus(id, status, adminNote = '') {
    const response = await axiosClient.patch(`/api/admin/ai/reviews/${encodeURIComponent(id)}`, { status, adminNote });
    return response?.result ?? response;
  },

  async listScenarioRecords() {
    const response = await axiosClient.get('/api/admin/ai/scenarios');
    const records = response?.result ?? response;
    if (!Array.isArray(records)) return [];

    return records.map(scenarioFromApi);
  },
  async saveScenarioRecord(data) {
    const response = await axiosClient.post('/api/admin/ai/scenarios', scenarioToApiPayload(data));
    return scenarioFromApi(response?.result ?? response);
  },
  async deleteScenarioRecord(id) {
    await axiosClient.delete(`/api/admin/ai/scenarios/${encodeURIComponent(id)}`);
  },
  async updateScenarioRecordStatus(id, status) {
    const response = await axiosClient.patch(`/api/admin/ai/scenarios/${encodeURIComponent(id)}/status`, { status });
    return scenarioFromApi(response?.result ?? response);
  },

  // --- CULTURE ARTICLES (REST API + Persistent Database) ---
  async getArticles(filters = {}) {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category && filters.category !== 'all') params.category = filters.category;
      if (filters.status && filters.status !== 'all') params.status = filters.status;

      const response = await axiosClient.get('/api/admin/culture/articles', { params });
      const data = response?.result ?? response;
      if (Array.isArray(data)) return data;
    } catch (e) {
      console.warn('Backend call failed, using localStorage fallback for culture articles:', e.message);
    }

    let items = [];
    try {
      const stored = localStorage.getItem(STORAGE_ADMIN_CULTURE);
      items = stored ? JSON.parse(stored) : INITIAL_ARTICLES;
    } catch {
      items = INITIAL_ARTICLES;
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(a => a.title.toLowerCase().includes(q) || a.author.toLowerCase().includes(q));
    }
    if (filters.category && filters.category !== 'all') {
      items = items.filter(a => a.category === filters.category);
    }
    if (filters.status && filters.status !== 'all') {
      items = items.filter(a => a.status === filters.status);
    }
    return items;
  },

  async getArticle(id) {
    if (!id) return null;
    try {
      const response = await axiosClient.get(`/api/admin/culture/articles/${encodeURIComponent(id)}`);
      const data = response?.result ?? response;
      if (data && data.id) return data;
    } catch (e) {
      console.warn('Backend getArticle failed, falling back:', e.message);
    }
    const list = await this.getArticles();
    return list.find(a => a.id === id) || null;
  },

  async saveArticle(articleData) {
    try {
      const isExisting = articleData.id && articleData.id !== 'new';
      const endpoint = isExisting
        ? `/api/admin/culture/articles/${encodeURIComponent(articleData.id)}`
        : '/api/admin/culture/articles';
      const method = isExisting ? axiosClient.put : axiosClient.post;
      const response = await method(endpoint, articleData);
      const saved = response?.result ?? response;
      return saved || articleData;
    } catch (e) {
      console.warn('Backend saveArticle failed, falling back to localStorage:', e.message);
      const list = await this.getArticles();
      let updated;
      const exists = list.some(a => a.id === articleData.id);

      if (exists) {
        updated = list.map(a => (a.id === articleData.id ? { ...a, ...articleData, updatedAt: new Date().toISOString() } : a));
      } else {
        const newArticle = {
          ...articleData,
          id: articleData.id || `culture-${Date.now()}`,
          views: 0,
          publishedAt: articleData.publishedAt || new Date().toISOString().split('T')[0],
        };
        updated = [newArticle, ...list];
      }

      localStorage.setItem(STORAGE_ADMIN_CULTURE, JSON.stringify(updated));
      return articleData;
    }
  },

  async deleteArticle(id) {
    try {
      await axiosClient.delete(`/api/admin/culture/articles/${encodeURIComponent(id)}`);
    } catch (e) {
      console.warn('Backend deleteArticle failed, falling back:', e.message);
      const list = (await this.getArticles()).filter(a => a.id !== id);
      localStorage.setItem(STORAGE_ADMIN_CULTURE, JSON.stringify(list));
      return list;
    }
    return this.getArticles();
  },

  async updateArticleStatus(id, newStatus) {
    try {
      const response = await axiosClient.patch(`/api/admin/culture/articles/${encodeURIComponent(id)}/status`, { status: newStatus });
      return response?.result ?? response;
    } catch (e) {
      console.warn('Backend updateArticleStatus failed, falling back:', e.message);
      const list = (await this.getArticles()).map(a => (a.id === id ? { ...a, status: newStatus } : a));
      localStorage.setItem(STORAGE_ADMIN_CULTURE, JSON.stringify(list));
      return list.find(a => a.id === id);
    }
  },

  // --- CULTURE CATEGORIES (REST API + Persistent Database) ---
  async getCategories() {
    try {
      const response = await axiosClient.get('/api/admin/culture/categories');
      const data = response?.result ?? response;
      if (Array.isArray(data) && data.length > 0) {
        return data.map(item => ({
          ...item,
          articleCount: typeof item.articleCount === 'number' ? item.articleCount : (item.articlesCount || 0)
        }));
      }
    } catch (e) {
      console.warn('Backend getCategories failed, falling back:', e.message);
    }
    try {
      const stored = localStorage.getItem(STORAGE_ADMIN_CATEGORIES);
      const parsed = stored ? JSON.parse(stored) : INITIAL_CATEGORIES;
      return Array.isArray(parsed)
        ? parsed.map(item => ({
            ...item,
            articleCount: typeof item.articleCount === 'number' ? item.articleCount : (item.articlesCount || 0)
          }))
        : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  async saveCategory(catData) {
    try {
      const isExisting = catData.id && !catData.id.startsWith('cat-new');
      const endpoint = isExisting
        ? `/api/admin/culture/categories/${encodeURIComponent(catData.id)}`
        : '/api/admin/culture/categories';
      const method = isExisting ? axiosClient.put : axiosClient.post;
      const response = await method(endpoint, catData);
      return response?.result ?? response;
    } catch (e) {
      console.warn('Backend saveCategory failed, falling back:', e.message);
      const list = await this.getCategories();
      let updated;
      if (catData.id && list.some(c => c.id === catData.id)) {
        updated = list.map(c => (c.id === catData.id ? { ...c, ...catData } : c));
      } else {
        const newCat = {
          ...catData,
          id: catData.slug || `cat-${Date.now()}`,
          order: list.length + 1,
          articleCount: 0,
        };
        updated = [...list, newCat];
      }
      localStorage.setItem(STORAGE_ADMIN_CATEGORIES, JSON.stringify(updated));
      return updated;
    }
  },

  async reorderCategories(orderedList) {
    try {
      await Promise.all(
        orderedList.map((cat, idx) =>
          axiosClient.put(`/api/admin/culture/categories/${encodeURIComponent(cat.id)}`, {
            ...cat,
            displayOrder: idx + 1,
          })
        )
      );
    } catch (e) {
      console.warn('Backend reorderCategories failed, falling back:', e.message);
    }
    localStorage.setItem(STORAGE_ADMIN_CATEGORIES, JSON.stringify(orderedList));
    return orderedList;
  },

  async deleteCategory(id) {
    try {
      await axiosClient.delete(`/api/admin/culture/categories/${encodeURIComponent(id)}`);
    } catch (e) {
      console.warn('Backend deleteCategory failed, falling back:', e.message);
      const list = (await this.getCategories()).filter(c => c.id !== id);
      localStorage.setItem(STORAGE_ADMIN_CATEGORIES, JSON.stringify(list));
      return list;
    }
    return this.getCategories();
  },

  // --- AI SCENARIOS & BUILDER ---
  getScenarios(filters = {}) {
    let list = [];
    try {
      const stored = localStorage.getItem(STORAGE_ADMIN_SCENARIOS);
      list = stored ? JSON.parse(stored) : INITIAL_SCENARIOS;
    } catch {
      list = INITIAL_SCENARIOS;
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q) || s.destination.toLowerCase().includes(q));
    }
    if (filters.topic && filters.topic !== 'all') {
      list = list.filter(s => s.topic === filters.topic);
    }
    if (filters.level && filters.level !== 'all') {
      list = list.filter(s => s.level === filters.level);
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter(s => s.status === filters.status);
    }
    return list;
  },

  getScenario(id) {
    const list = this.getScenarios();
    return list.find(s => s.id === id) || null;
  },

  saveScenario(data) {
    const list = this.getScenarios();
    let updated;
    const exists = list.some(s => s.id === data.id);

    if (exists) {
      updated = list.map(s => (s.id === data.id ? { ...s, ...data } : s));
    } else {
      const newScenario = {
        ...data,
        id: data.id || `sc-${Date.now()}`,
        completionsCount: 0,
        avgScore: 0,
        status: data.status || 'DRAFT',
      };
      updated = [newScenario, ...list];
    }
    localStorage.setItem(STORAGE_ADMIN_SCENARIOS, JSON.stringify(updated));
    return data;
  },

  deleteScenario(id) {
    const list = this.getScenarios().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_ADMIN_SCENARIOS, JSON.stringify(list));
    return list;
  },

  updateScenarioStatus(id, newStatus) {
    const list = this.getScenarios().map(s => (s.id === id ? { ...s, status: newStatus } : s));
    localStorage.setItem(STORAGE_ADMIN_SCENARIOS, JSON.stringify(list));
    return list.find(s => s.id === id);
  },

  // --- AI SETTINGS ---
  getAiSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_ADMIN_AI_SETTINGS);
      return stored ? JSON.parse(stored) : INITIAL_AI_SETTINGS;
    } catch {
      return INITIAL_AI_SETTINGS;
    }
  },

  saveAiSettings(newSettings) {
    localStorage.setItem(STORAGE_ADMIN_AI_SETTINGS, JSON.stringify(newSettings));
    return newSettings;
  },

  // --- AI USAGE STATS ---
  getUsageStats() {
    return {
      summary: {
        totalSessions: 1482,
        totalApiCalls: 18450,
        totalTokens: 12450800,
        costMonthUsd: 42.68,
        budgetLimitUsd: 150.0,
        avgResponseTimeMs: 315,
        errorRate: '0.18%',
      },
      modeBreakdown: [
        { mode: 'Tutor', name: 'Gia sư toàn diện', calls: 5240, tokens: 3650000, cost: 12.8, percent: 28 },
        { mode: 'Grammar', name: 'Ngữ pháp & Sửa câu', calls: 3910, tokens: 2840000, cost: 9.9, percent: 21 },
        { mode: 'Conversation', name: 'Luyện hội thoại', calls: 3200, tokens: 2210000, cost: 7.7, percent: 17 },
        { mode: 'Roleplay', name: 'Kịch bản Roleplay', calls: 2450, tokens: 1890000, cost: 6.6, percent: 14 },
        { mode: 'Translation', name: 'Dịch thuật', calls: 1850, tokens: 1020000, cost: 3.6, percent: 10 },
        { mode: 'Regional', name: 'Tiếng Việt 3 miền', calls: 1100, tokens: 540000, cost: 1.9, percent: 6 },
        { mode: 'Culture Guide', name: 'Chỉ dẫn văn hóa', calls: 700, tokens: 300800, cost: 1.1, percent: 4 },
      ],
      recentLogs: [
        { id: 'call-9801', timestamp: '14:22:10', mode: 'Grammar', user: 'learner_102', tokensIn: 180, tokensOut: 320, latency: 285, cost: '$0.00017', status: 200 },
        { id: 'call-9800', timestamp: '14:21:45', mode: 'Roleplay', user: 'learner_451', tokensIn: 410, tokensOut: 290, latency: 340, cost: '$0.00024', status: 200 },
        { id: 'call-9799', timestamp: '14:20:12', mode: 'Tutor', user: 'learner_88', tokensIn: 210, tokensOut: 450, latency: 310, cost: '$0.00023', status: 200 },
        { id: 'call-9798', timestamp: '14:18:50', mode: 'Regional', user: 'learner_305', tokensIn: 150, tokensOut: 380, latency: 290, cost: '$0.00018', status: 200 },
        { id: 'call-9797', timestamp: '14:15:02', mode: 'Translation', user: 'learner_19', tokensIn: 120, tokensOut: 190, latency: 220, cost: '$0.00011', status: 200 },
      ],
    };
  },

  // --- AI REVIEWS & QUALITY AUDIT ---
  getReviews() {
    try {
      const stored = localStorage.getItem(STORAGE_ADMIN_REVIEWS);
      return stored ? JSON.parse(stored) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  },

  updateReviewStatus(id, newStatus, adminNote = '') {
    const list = this.getReviews().map(r => (r.id === id ? { ...r, status: newStatus, adminNote, reviewedByAdmin: true } : r));
    localStorage.setItem(STORAGE_ADMIN_REVIEWS, JSON.stringify(list));
    return list.find(r => r.id === id);
  },
};
