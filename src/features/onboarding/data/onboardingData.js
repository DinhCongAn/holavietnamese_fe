import {
  Award, Baby, BriefcaseBusiness, Compass, Crown, Dumbbell, HeartHandshake, Landmark,
  MessageCircle, Plane, Sparkles, Sprout, Target, Timer, Trophy, Utensils, Volume2,
} from 'lucide-react';

export const learningReasons = [
  { id: 'travel', title: 'Travel and live confidently in Vietnam', titleVi: 'Tự tin du lịch và sinh hoạt tại Việt Nam', detail: 'Directions, transport, food, shopping, and essential conversations.', detailVi: 'Hỏi đường, di chuyển, gọi món, mua sắm và giao tiếp thiết yếu.', icon: Plane },
  { id: 'connection', title: 'Connect with Vietnamese family and friends', titleVi: 'Kết nối với gia đình và bạn bè người Việt', detail: 'Understand everyday speech and share meaningful conversations.', detailVi: 'Hiểu lời nói hằng ngày và trò chuyện gần gũi hơn.', icon: HeartHandshake },
  { id: 'work', title: 'Study or work with Vietnamese speakers', titleVi: 'Học tập hoặc làm việc với người Việt', detail: 'Communicate clearly and politely in academic and professional settings.', detailVi: 'Giao tiếp rõ ràng, lịch sự trong môi trường học tập và công việc.', icon: BriefcaseBusiness },
  { id: 'culture', title: 'Understand Vietnamese culture more deeply', titleVi: 'Hiểu sâu hơn về văn hóa Việt Nam', detail: 'Learn through traditions, stories, places, and daily life.', detailVi: 'Học qua phong tục, câu chuyện, địa danh và đời sống thường ngày.', icon: Landmark },
  { id: 'challenge', title: 'Build a complete new language skill', titleVi: 'Xây dựng một kỹ năng ngôn ngữ toàn diện', detail: 'Develop listening, speaking, reading, and writing step by step.', detailVi: 'Phát triển nghe, nói, đọc và viết theo từng bước rõ ràng.', icon: Dumbbell },
  { id: 'other', title: 'Explore before choosing a specific goal', titleVi: 'Khám phá trước khi chọn mục tiêu cụ thể', detail: 'Start with a flexible foundation and refine your focus later.', detailVi: 'Bắt đầu với nền tảng linh hoạt và điều chỉnh trọng tâm sau.', icon: Compass },
];

export const levelOptions = [
  {
    id: 'A1',
    code: 'A1',
    title: 'A1 · Beginner',
    titleVi: 'A1 · Khởi động cơ bản',
    detail: 'I am completely new or know just a few basic words.',
    detailVi: 'Tôi hoàn toàn mới bắt đầu hoặc chỉ biết vài từ và câu chào hỏi.',
    badge: 'Sơ cấp 1',
    badgeVi: 'SƠ CẤP 1',
    icon: Sprout,
    color: '#059669',
    bg: '#ecfdf5',
  },
  {
    id: 'A2',
    code: 'A2',
    title: 'A2 · Elementary',
    titleVi: 'A2 · Sơ cấp giao tiếp',
    detail: 'I can understand familiar phrases and handle simple daily exchanges.',
    detailVi: 'Tôi hiểu các câu thông dụng và có thể giao tiếp trong sinh hoạt thường nhật.',
    badge: 'Sơ cấp 2',
    badgeVi: 'SƠ CẤP 2',
    icon: Compass,
    color: '#0284c7',
    bg: '#f0f9ff',
  },
  {
    id: 'B1',
    code: 'B1',
    title: 'B1 · Intermediate',
    titleVi: 'B1 · Trung cấp tự tin',
    detail: 'I can express opinions, describe events, and navigate most situations.',
    detailVi: 'Tôi có thể diễn đạt ý kiến, kể lại trải nghiệm và tự tin xử lý tình huống.',
    badge: 'Trung cấp 1',
    badgeVi: 'TRUNG CẤP 1',
    icon: MessageCircle,
    color: '#ea580c',
    bg: '#fff7ed',
  },
  {
    id: 'B2',
    code: 'B2',
    title: 'B2 · Upper-Intermediate',
    titleVi: 'B2 · Trung cấp nâng cao',
    detail: 'I can converse smoothly, understand complex ideas, and discuss varied topics.',
    detailVi: 'Tôi giao tiếp lưu loát, hiểu các chủ đề phức tạp và trao đổi tự nhiên.',
    badge: 'Trung cấp 2',
    badgeVi: 'TRUNG CẤP 2',
    icon: Sparkles,
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    id: 'C1',
    code: 'C1',
    title: 'C1 · Advanced',
    titleVi: 'C1 · Cao cấp thành thạo',
    detail: 'I can use flexible, nuanced language for social, academic, and work goals.',
    detailVi: 'Tôi diễn đạt trôi chảy, sử dụng từ ngữ uyển chuyển trong công việc và đời sống.',
    badge: 'Cao cấp 1',
    badgeVi: 'CAO CẤP 1',
    icon: Award,
    color: '#d97706',
    bg: '#fffbeb',
  },
  {
    id: 'C2',
    code: 'C2',
    title: 'C2 · Mastery',
    titleVi: 'C2 · Tinh thông bản ngữ',
    detail: 'I understand with ease, grasp cultural subtleties, and express with precision.',
    detailVi: 'Tôi gần như người bản xứ, thấu hiểu chiều sâu văn hóa và sắc thái biểu cảm.',
    badge: 'Cao cấp 2',
    badgeVi: 'CAO CẤP 2',
    icon: Crown,
    color: '#dc2626',
    bg: '#fef2f2',
  },
];

export const dailyGoals = [
  { minutes: 5, label: 'Casual', labelVi: 'Nhẹ nhàng', detail: 'One quick practice', detailVi: 'Một lần luyện tập nhanh', icon: Timer, color: '#f59e0b' },
  { minutes: 10, label: 'Regular', labelVi: 'Đều đặn', detail: 'Build a steady habit', detailVi: 'Xây dựng thói quen đều đặn', icon: Timer, color: '#16a34a', recommended: true },
  { minutes: 15, label: 'Serious', labelVi: 'Nghiêm túc', detail: 'Make confident progress', detailVi: 'Tiến bộ vững vàng', icon: Target, color: '#2563eb' },
  { minutes: 30, label: 'Intensive', labelVi: 'Chuyên sâu', detail: 'Move at a focused pace', detailVi: 'Tốc độ học tập tập trung', icon: Trophy, color: '#FF7A00' },
];

export const benefits = [
  { title: 'Introduce yourself', titleVi: 'Tự giới thiệu bản thân', detail: 'Make a warm first impression.', detailVi: 'Tạo ấn tượng ban đầu ấm áp.', icon: MessageCircle },
  { title: 'Order with confidence', titleVi: 'Tự tin gọi món', detail: 'Enjoy phở, coffee, and more.', detailVi: 'Thưởng thức phở, cà phê và nhiều hơn nữa.', icon: Utensils },
  { title: 'Find your way', titleVi: 'Hỏi đường đi', detail: 'Ask for directions while traveling.', detailVi: 'Hỏi đường khi đi du lịch.', icon: Compass },
  { title: 'Understand daily speech', titleVi: 'Hiểu lời nói hàng ngày', detail: 'Follow familiar conversations.', detailVi: 'Nắm bắt các cuộc hội thoại quen thuộc.', icon: HeartHandshake },
  { title: 'Sound more natural', titleVi: 'Nói tự nhiên hơn', detail: 'Train your listening and pronunciation.', detailVi: 'Luyện nghe và phát âm chuẩn xác.', icon: Volume2 },
  { title: 'Discover the culture', titleVi: 'Khám phá văn hóa', detail: 'Connect language with living traditions.', detailVi: 'Gắn kết ngôn ngữ với truyền thống sống động.', icon: Landmark },
];

export const firstLessonQuestions = [
  { id: 'l1', type: 'choice', prompt: 'What does “Xin chào” mean?', promptVi: '“Xin chào” có nghĩa là gì?', options: ['Thank you', 'Hello', 'Good night'], answer: 'Hello', note: '“Xin chào” is a polite, friendly way to say hello.', noteVi: '“Xin chào” là cách lịch sự, thân thiện để chào hỏi.' },
  { id: 'l2', type: 'choice', prompt: 'Which situation matches “Cảm ơn”?', promptVi: 'Tình huống nào phù hợp với “Cảm ơn”?', options: ['🙏 Someone helped you', '👋 You are leaving', '🍜 You are ordering'], answer: '🙏 Someone helped you', note: '“Cảm ơn” means “Thank you.”', noteVi: '“Cảm ơn” có nghĩa là “Thank you”.' },
  { id: 'l3', type: 'match', prompt: 'Match the Vietnamese phrase to “Goodbye”.', promptVi: 'Chọn cụm từ tiếng Việt tương ứng với “Goodbye”.', options: ['Tạm biệt', 'Xin lỗi', 'Không'], answer: 'Tạm biệt', note: '“Tạm biệt” is used when saying goodbye.', noteVi: '“Tạm biệt” được dùng khi nói lời chia tay.' },
  { id: 'l4', type: 'arrange', prompt: 'Build: “Hello, I am Mai.”', promptVi: 'Ghép câu: “Xin chào, tôi là Mai.”', tokens: ['Mai', 'Xin chào,', 'là', 'tôi'], answer: 'Xin chào, tôi là Mai', note: 'Vietnamese uses “Tôi là…” for “I am…”.', noteVi: 'Tiếng Việt dùng “Tôi là…” tương tự như “I am…”.' },
  { id: 'l5', type: 'listen', prompt: 'Listen and choose what you hear.', promptVi: 'Lắng nghe và chọn từ bạn nghe thấy.', speak: 'Cảm ơn', options: ['Cảm ơn', 'Xin chào', 'Tạm biệt'], answer: 'Cảm ơn', note: 'Great listening — notice the rising hỏi tone in “cảm”.', noteVi: 'Tuyệt vời — chú ý thanh hỏi đi lên trong từ “cảm”.' },
  { id: 'l6', type: 'fill', prompt: 'Complete the phrase: “Xin ___”', promptVi: 'Hoàn thành cụm từ: “Xin ___”', options: ['chào', 'ơn', 'biệt'], answer: 'chào', note: '“Xin chào” works throughout the day.', noteVi: '“Xin chào” dùng được cho mọi thời điểm trong ngày.' },
  { id: 'l7', type: 'choice', prompt: 'You are leaving a new friend. What do you say?', promptVi: 'Bạn chào tạm biệt một người bạn mới. Bạn sẽ nói gì?', options: ['Tạm biệt!', 'Cảm ơn!', 'Xin chào!'], answer: 'Tạm biệt!', note: 'Exactly — “Tạm biệt!” means “Goodbye!”', noteVi: 'Chính xác — “Tạm biệt!” có nghĩa là “Goodbye!”.' },
];

/**
 * 15-question distribution table based on user specification:
 * Test A1: 15 A1, 0 A2, 0 B1, 0 B2, 0 C1, 0 C2 (Total 15)
 * Test A2: 5 A1, 10 A2, 0 B1, 0 B2, 0 C1, 0 C2 (Total 15)
 * Test B1: 3 A1, 4 A2, 8 B1, 0 B2, 0 C1, 0 C2 (Total 15)
 * Test B2: 2 A1, 3 A2, 4 B1, 6 B2, 0 C1, 0 C2 (Total 15)
 * Test C1: 1 A1, 2 A2, 3 B1, 4 B2, 5 C1, 0 C2 (Total 15)
 * Test C2: 1 A1, 1 A2, 2 B1, 3 B2, 4 C1, 4 C2 (Total 15)
 */
export const PLACEMENT_DISTRIBUTIONS = Object.freeze({
  A1: { A1: 15 },
  A2: { A1: 5, A2: 10 },
  B1: { A1: 3, A2: 4, B1: 8 },
  B2: { A1: 2, A2: 3, B1: 4, B2: 6 },
  C1: { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 },
  C2: { A1: 1, A2: 1, B1: 2, B2: 3, C1: 4, C2: 4 },
});

/**
 * Tier passing thresholds (%) based on user specification:
 * A1: >= 80% (passed A1 foundation)
 * A2: >= 70% (achieved A2)
 * B1: >= 60% (confirmed B1)
 * B2: >= 60% (confirmed B2)
 * C1: >= 60% (confirmed C1)
 * C2: >= 60% (confirmed C2)
 */
export const TIER_THRESHOLDS = Object.freeze({
  A1: 80,
  A2: 70,
  B1: 60,
  B2: 60,
  C1: 60,
  C2: 60,
});

/**
 * Question Bank categorized strictly by CEFR level.
 * Total: 48 high-quality placement questions across all 6 levels.
 */
export const placementQuestionBank = Object.freeze({
  A1: [
    { id: 'p_a1_01', level: 'A1', prompt: '“Xin chào” means…', promptVi: '“Xin chào” có nghĩa là gì?', options: ['Hello', 'Sorry', 'Goodbye', 'Please'], answer: 'Hello', noteVi: '“Xin chào” là lời chào lịch sự, thân thiện.' },
    { id: 'p_a1_02', level: 'A1', prompt: 'How do you say “Thank you” in Vietnamese?', promptVi: 'Nói “Thank you” trong tiếng Việt là…', options: ['Cảm ơn', 'Tạm biệt', 'Xin lỗi', 'Không có gì'], answer: 'Cảm ơn', noteVi: '“Cảm ơn” dùng để bày tỏ sự cảm kích.' },
    { id: 'p_a1_03', level: 'A1', prompt: 'Choose the word for “Goodbye”.', promptVi: 'Chọn từ có nghĩa là “Goodbye”.', options: ['Tạm biệt', 'Xin chào', 'Hẹn gặp', 'Vâng'], answer: 'Tạm biệt', noteVi: '“Tạm biệt” dùng khi chia tay, chào ra về.' },
    { id: 'p_a1_04', level: 'A1', prompt: 'What number is “ba”?', promptVi: 'Từ “ba” chỉ số mấy?', options: ['3', '2', '7', '8'], answer: '3', noteVi: 'Một, hai, ba = 1, 2, 3.' },
    { id: 'p_a1_05', level: 'A1', prompt: '“Mẹ” means…', promptVi: 'Từ “Mẹ” có nghĩa là…', options: ['Mother', 'Father', 'Sister', 'Teacher'], answer: 'Mother', noteVi: '“Mẹ” là người mẹ trong gia đình.' },
    { id: 'p_a1_06', level: 'A1', prompt: 'Choose the word for “rice / a meal”.', promptVi: 'Chọn từ chỉ “cơm / bữa ăn”.', options: ['Cơm', 'Nước', 'Bánh', 'Trà'], answer: 'Cơm', noteVi: '“Cơm” là thức ăn chính và đại diện cho bữa ăn.' },
    { id: 'p_a1_07', level: 'A1', prompt: '“Bạn khỏe không?” asks…', promptVi: '“Bạn khỏe không?” dùng để hỏi gì?', options: ['How are you?', 'Where are you?', 'Who are you?', 'What is this?'], answer: 'How are you?', noteVi: 'Đây là câu hỏi thăm sức khỏe thông dụng.' },
    { id: 'p_a1_08', level: 'A1', prompt: '“Tôi sống ở Hà Nội.” means…', promptVi: '“Tôi sống ở Hà Nội.” có nghĩa là…', options: ['I live in Hanoi.', 'I love Hanoi.', 'I visited Hanoi.', 'I work in Hanoi.'], answer: 'I live in Hanoi.', noteVi: '“Sống ở…” chỉ nơi chốn cư trú.' },
    { id: 'p_a1_09', level: 'A1', prompt: 'Best reply to “Bạn tên là gì?”', promptVi: 'Câu trả lời phù hợp cho “Bạn tên là gì?” là:', options: ['Tôi tên là Nam.', 'Tôi khỏe, cảm ơn.', 'Tôi là người Việt.', 'Không sao đâu.'], answer: 'Tôi tên là Nam.', noteVi: '“Tôi tên là…” dùng để giới thiệu tên mình.' },
    { id: 'p_a1_10', level: 'A1', prompt: 'How do you politely order coffee?', promptVi: 'Cách gọi một ly cà phê lịch sự:', options: ['Cho tôi một ly cà phê.', 'Tôi ăn cà phê.', 'Cà phê đi đâu?', 'Không thích cà phê.'], answer: 'Cho tôi một ly cà phê.', noteVi: 'Cấu trúc “Cho tôi…” thường dùng khi gọi món.' },
    { id: 'p_a1_11', level: 'A1', prompt: '“Bao nhiêu tiền?” is used to ask about…', promptVi: '“Bao nhiêu tiền?” dùng để hỏi…', options: ['The price', 'The time', 'The location', 'The name'], answer: 'The price', noteVi: '“Bao nhiêu tiền?” dùng khi mua sắm, thanh toán.' },
    { id: 'p_a1_12', level: 'A1', prompt: 'Which word represents a day of the week?', promptVi: 'Từ nào chỉ một ngày trong tuần?', options: ['Thứ Hai', 'Tháng Một', 'Năm nay', 'Buổi trưa'], answer: 'Thứ Hai', noteVi: '“Thứ Hai” là ngày Monday trong tuần.' },
    { id: 'p_a1_13', level: 'A1', prompt: 'Choose the opposite of “lớn” (big).', promptVi: 'Từ trái nghĩa với “lớn” (to) là:', options: ['nhỏ', 'cao', 'dài', 'nặng'], answer: 'nhỏ', noteVi: '“Lớn / to” trái nghĩa với “nhỏ / bé”.' },
    { id: 'p_a1_14', level: 'A1', prompt: 'What does “uống nước” mean?', promptVi: 'Cụm từ “uống nước” có nghĩa là:', options: ['Drink water', 'Boil water', 'Buy water', 'Pour water'], answer: 'Drink water', noteVi: '“Uống” = drink, “nước” = water.' },
    { id: 'p_a1_15', level: 'A1', prompt: 'Friendly pronoun when speaking to peers:', promptVi: 'Đại từ xưng hô thân mật khi nói về bản thân với bạn bè bằng tuổi:', options: ['Mình', 'Cháu', 'Bác', 'Em'], answer: 'Mình', noteVi: '“Mình” dùng thân mật, bình đẳng giữa bạn bè.' },
  ],
  A2: [
    { id: 'p_a2_01', level: 'A2', prompt: 'Choose the correct classifier: “Tôi mua hai ___ sách.”', promptVi: 'Chọn loại từ thích hợp: “Tôi mua hai ___ sách.”', options: ['quyển', 'con', 'chiếc', 'cái'], answer: 'quyển', noteVi: '“Quyển” (hoặc “cuốn”) là loại từ dùng cho sách, vở.' },
    { id: 'p_a2_02', level: 'A2', prompt: 'Complete: “Hôm qua trời mưa ___ tôi ở nhà.”', promptVi: 'Hoàn thành câu: “Hôm qua trời mưa ___ tôi ở nhà.”', options: ['nên', 'nhưng', 'tuy', 'hoặc'], answer: 'nên', noteVi: '“Nên” chỉ kết quả của nguyên nhân phía trước.' },
    { id: 'p_a2_03', level: 'A2', prompt: 'How to ask directions to the post office?', promptVi: 'Cách hỏi đường đến bưu điện chính xác nhất:', options: ['Làm ơn cho tôi hỏi bưu điện ở đâu?', 'Bưu điện có ăn không?', 'Tôi đi bưu điện bao giờ?', 'Bưu điện tên là gì?'], answer: 'Làm ơn cho tôi hỏi bưu điện ở đâu?', noteVi: '“Làm ơn cho tôi hỏi… ở đâu?” là cách hỏi đường lịch sự.' },
    { id: 'p_a2_04', level: 'A2', prompt: '“Chiếc áo này giá bao nhiêu?” - “Dạ, ___ nghìn đồng.”', promptVi: 'Điền từ chỉ số lượng: “Dạ, ___ nghìn đồng.”', options: ['năm mươi', 'năm con', 'năm cái', 'năm quả'], answer: 'năm mươi', noteVi: '“Năm mươi nghìn” = 50.000 VNĐ.' },
    { id: 'p_a2_05', level: 'A2', prompt: '“Tôi đã từng đến Huế” expresses…', promptVi: '“Tôi đã từng đến Huế” diễn tả điều gì?', options: ['A past experience', 'A future intention', 'A repeated habit', 'A current state'], answer: 'A past experience', noteVi: '“Đã từng…” diễn tả trải nghiệm trong quá khứ.' },
    { id: 'p_a2_06', level: 'A2', prompt: 'Complete: “Nhà của tôi cách trường học không ___.”', promptVi: 'Hoàn thành: “Nhà của tôi cách trường học không ___.”', options: ['xa', 'cao', 'sâu', 'nặng'], answer: 'xa', noteVi: '“Không xa” chỉ khoảng cách gần.' },
    { id: 'p_a2_07', level: 'A2', prompt: 'Complete: “Buổi sáng tôi thường ___ thể dục.”', promptVi: 'Chọn từ đúng: “Buổi sáng tôi thường ___ thể dục.”', options: ['tập', 'làm', 'chơi', 'chạy'], answer: 'tập', noteVi: 'Kết hợp từ chuẩn xác là “tập thể dục”.' },
    { id: 'p_a2_08', level: 'A2', prompt: 'Complete: “Bác sĩ khuyên anh ấy không ___ hút thuốc.”', promptVi: 'Điền từ khuyên nhủ: “Bác sĩ khuyên anh ấy không ___ hút thuốc.”', options: ['nên', 'được', 'thể', 'phải'], answer: 'nên', noteVi: '“Không nên” dùng để đưa ra lời khuyên ngăn.' },
    { id: 'p_a2_09', level: 'A2', prompt: 'Choose the grammatically natural sentence:', promptVi: 'Chọn câu tự nhiên và đúng ngữ pháp:', options: ['Chị ấy vừa đẹp lại vừa thông minh.', 'Chị ấy rất đẹp nhưng rất thông minh.', 'Chị ấy vì đẹp nên thông minh.', 'Chị ấy đẹp thì là thông minh.'], answer: 'Chị ấy vừa đẹp lại vừa thông minh.', noteVi: 'Cấu trúc “vừa… vừa…” biểu thị hai đặc điểm cùng tồn tại.' },
    { id: 'p_a2_10', level: 'A2', prompt: 'How to ask for help politely?', promptVi: 'Khi muốn nhờ giúp đỡ một cách lịch sự, bạn nói:', options: ['Làm ơn giúp tôi một chút được không ạ?', 'Phải giúp tôi ngay bây giờ!', 'Ai giúp tôi đấy?', 'Tại sao không giúp tôi?'], answer: 'Làm ơn giúp tôi một chút được không ạ?', noteVi: '“Làm ơn… được không ạ?” là lời thỉnh cầu lịch thiệp.' },
  ],
  B1: [
    { id: 'p_b1_01', level: 'B1', prompt: 'Complete: “Mặc dù trời mưa to, ___ các bạn vẫn đến đúng giờ.”', promptVi: 'Điền liên từ: “Mặc dù trời mưa to, ___ các bạn vẫn đến đúng giờ.”', options: ['nhưng', 'vì', 'cho nên', 'hoặc là'], answer: 'nhưng', noteVi: 'Cặp liên từ chỉ sự tương phản: “Mặc dù… nhưng…”.' },
    { id: 'p_b1_02', level: 'B1', prompt: 'In “Cậu ấy được khen ngợi”, “được” signals…', promptVi: 'Trong câu “Cậu ấy được thầy khen ngợi”, từ “được” biểu thị…', options: ['A positive passive meaning', 'An obligation', 'A negative passive meaning', 'A conditional action'], answer: 'A positive passive meaning', noteVi: '“Được” dùng cho câu bị động mang ý nghĩa tích cực, có lợi cho chủ ngữ.' },
    { id: 'p_b1_03', level: 'B1', prompt: '“Anh ấy dự định chuyển công tác.” “Dự định” is closest to…', promptVi: '“Anh ấy dự định chuyển công tác.” Từ “dự định” đồng nghĩa với…', options: ['có kế hoạch', 'bắt buộc', 'vừa mới xong', 'không muốn'], answer: 'có kế hoạch', noteVi: '“Dự định” thể hiện ý định, kế hoạch trong tương lai gần.' },
    { id: 'p_b1_04', level: 'B1', prompt: 'Complete: “Càng học tiếng Việt, tôi ___ thấy thú vị.”', promptVi: 'Điền từ tương liên: “Càng học tiếng Việt, tôi ___ thấy thú vị.”', options: ['càng', 'lại', 'rất', 'vẫn'], answer: 'càng', noteVi: 'Cấu trúc tương liên lũy tiến “càng… càng…”.' },
    { id: 'p_b1_05', level: 'B1', prompt: 'Best phrase to introduce an objective personal viewpoint:', promptVi: 'Cụm từ thích hợp nhất để nêu quan điểm cá nhân trong thảo luận:', options: ['Theo quan điểm của tôi,…', 'Tôi bắt mọi người nghe,…', 'Chắc chắn ai cũng sai,…', 'Không cần giải thích,…'], answer: 'Theo quan điểm của tôi,…', noteVi: '“Theo quan điểm của tôi,…” mang tính khách quan và tôn trọng người nghe.' },
    { id: 'p_b1_06', level: 'B1', prompt: '“Dù gặp nhiều trở ngại, họ không bao giờ từ bỏ.” This emphasizes…', promptVi: '“Dù gặp nhiều trở ngại, họ không bao giờ từ bỏ.” Câu này nhấn mạnh…', options: ['Sự kiên trì, bền bỉ', 'Sự vội vàng, nóng vội', 'Sự do dự, thiếu quyết đoán', 'Sự may mắn ngẫu nhiên'], answer: 'Sự kiên trì, bền bỉ', noteVi: 'Câu diễn tả nghị lực và quyết tâm vượt qua thử thách.' },
    { id: 'p_b1_07', level: 'B1', prompt: '“Thời tiết dạo này thất thường quá.” “Thất thường” means…', promptVi: '“Thời tiết dạo này thất thường quá.” Từ “thất thường” có nghĩa là…', options: ['Thay đổi khó dự đoán', 'Rất nóng bức', 'Luôn luôn mưa', 'Không có gió'], answer: 'Thay đổi khó dự đoán', noteVi: '“Thất thường” = không theo quy luật thông thường, lúc nắng lúc mưa.' },
    { id: 'p_b1_08', level: 'B1', prompt: 'Complete: “Không những học giỏi mà Nam ___ hát rất hay.”', promptVi: 'Điền liên từ bổ sung: “Không những học giỏi mà Nam ___ hát rất hay.”', options: ['còn', 'nhưng', 'thì', 'với'], answer: 'còn', noteVi: 'Cặp liên từ tăng tiến: “Không những… mà còn…”.' },
  ],
  B2: [
    { id: 'p_b2_01', level: 'B2', prompt: 'The idiom “Nước đến chân mới nhảy” describes…', promptVi: 'Thành ngữ “Nước đến chân mới nhảy” phê phán thói quen gì?', options: ['Chần chừ, sát nút mới hành động', 'Hành động vội vàng, hấp tấp', 'Chăm chỉ làm việc trước thời hạn', 'Thích bơi lội và thể thao dưới nước'], answer: 'Chần chừ, sát nút mới hành động', noteVi: 'Phê phán tính lười nhác, để việc dồn ứ đến phút chót mới làm.' },
    { id: 'p_b2_02', level: 'B2', prompt: 'Formal context: “Hội đồng quản trị đã ___ phương án phát triển mới.”', promptVi: 'Chọn từ trang trọng: “Hội đồng quản trị đã ___ phương án phát triển mới.”', options: ['thông qua', 'nói qua', 'xem chơi', 'bỏ qua'], answer: 'thông qua', noteVi: '“Thông qua” là thuật ngữ hành chính thể hiện sự phê chuẩn chính thức.' },
    { id: 'p_b2_03', level: 'B2', prompt: '“Chính sách này tạo ra nhiều tác động tích cực.” “Tác động” means…', promptVi: '“Chính sách này tạo ra nhiều tác động tích cực.” Từ “tác động” có nghĩa là…', options: ['Ảnh hưởng, hiệu ứng', 'Sự trừng phạt', 'Nguy cơ tiềm ẩn', 'Sự gián đoạn'], answer: 'Ảnh hưởng, hiệu ứng', noteVi: '“Tác động” là sức ảnh hưởng lan tỏa đối với đời sống, kinh tế.' },
    { id: 'p_b2_04', level: 'B2', prompt: 'The connector “Nói cách khác,…” is used to…', promptVi: 'Cụm từ liên kết “Nói cách khác,…” được dùng nhằm mục đích…', options: ['Diễn giải lại ý trước theo cách rõ ràng hơn', 'Bác bỏ hoàn toàn luận điểm trước', 'Chuyển sang một đề tài hoàn toàn khác', 'Kể lại một câu chuyện cười'], answer: 'Diễn giải lại ý trước theo cách rõ ràng hơn', noteVi: 'Dùng để diễn giải hoặc làm sáng tỏ luận điểm vừa trình bày.' },
    { id: 'p_b2_05', level: 'B2', prompt: '“Hai bên đã đạt được sự đồng thuận.” “Đồng thuận” means…', promptVi: '“Hai bên đã đạt được sự đồng thuận.” Từ “đồng thuận” có nghĩa là…', options: ['Nhất trí, cùng chung ý kiến', 'Bất đồng sâu sắc', 'Chưa thể đưa ra quyết định', 'Hủy bỏ đàm phán'], answer: 'Nhất trí, cùng chung ý kiến', noteVi: '“Đồng thuận” = đồng lòng và cùng chấp thuận một giải pháp chung.' },
    { id: 'p_b2_06', level: 'B2', prompt: 'Complete: “Để nâng cao năng lực cạnh tranh, doanh nghiệp cần ___ đổi mới sáng tạo.”', promptVi: 'Chọn từ phù hợp: “Doanh nghiệp cần ___ đổi mới sáng tạo.”', options: ['chú trọng', 'lơ là', 'tránh né', 'hạn chế'], answer: 'chú trọng', noteVi: '“Chú trọng” = coi trọng và dành nhiều tâm huyết, nguồn lực.' },
  ],
  C1: [
    { id: 'p_c1_01', level: 'C1', prompt: 'The proverb “Uống nước nhớ nguồn” embodies which Vietnamese cultural value?', promptVi: 'Đạo lý cốt lõi thể hiện qua câu “Uống nước nhớ nguồn” là:', options: ['Lòng biết ơn với tiền nhân và cội nguồn', 'Ý thức bảo vệ tài nguyên nước', 'Tiết kiệm trong tiêu dùng hằng ngày', 'Tinh thần khám phá địa lý'], answer: 'Lòng biết ơn với tiền nhân và cội nguồn', noteVi: 'Thể hiện truyền thống tri ân những người đã dày công vun đắp thành quả cho thế hệ sau.' },
    { id: 'p_c1_02', level: 'C1', prompt: 'Choose the most academic and accurate term: “Báo cáo nhằm ___ các hạn chế còn tồn đọng.”', promptVi: 'Chọn từ mang sắc thái học thuật chuẩn xác: “Báo cáo nhằm ___ các hạn chế còn tồn đọng.”', options: ['làm rõ và phân tích sâu sắc', 'kể lể linh tinh', 'viết đại khái', 'nhắc nhở vu vơ'], answer: 'làm rõ và phân tích sâu sắc', noteVi: 'Phong cách học thuật đòi hỏi diễn đạt mạch lạc, chuẩn xác và sâu sắc.' },
    { id: 'p_c1_03', level: 'C1', prompt: 'Which sentence best exemplifies natural advanced socio-economic discourse?', promptVi: 'Câu nào mang phong cách ngôn ngữ chính luận - xã hội chuẩn xác và tự nhiên nhất?', options: ['Phát triển bền vững đòi hỏi phải dung hòa giữa tăng trưởng kinh tế và bảo tồn di sản.', 'Kinh tế thì cứ tăng lên còn di sản muốn sao cũng được.', 'Bảo tồn di sản làm cho kinh tế không thể nào tiến lên nổi.', 'Tăng trưởng kinh tế là thứ duy nhất xã hội cần hướng tới.'], answer: 'Phát triển bền vững đòi hỏi phải dung hòa giữa tăng trưởng kinh tế và bảo tồn di sản.', noteVi: 'Sử dụng từ ngữ chuẩn xác: “phát triển bền vững”, “dung hòa”, “tăng trưởng kinh tế”, “bảo tồn di sản”.' },
    { id: 'p_c1_04', level: 'C1', prompt: '“Trăm nghe không bằng một thấy” conveys a principle similar to…', promptVi: 'Câu tục ngữ “Trăm nghe không bằng một thấy” tương đồng với quan niệm…', options: ['Trải nghiệm thực chứng có giá trị hơn tin đồn', 'Lời nói có sức thuyết phục tuyệt đối', 'Không cần quan sát thực tế', 'Chỉ tin vào sách vở kinh điển'], answer: 'Trải nghiệm thực chứng có giá trị hơn tin đồn', noteVi: 'Nhấn mạnh vai trò của việc chứng kiến và kiểm chứng thực tế so với nghe kể lại.' },
    { id: 'p_c1_05', level: 'C1', prompt: 'In culture and linguistics, “tính dung hợp” (syncretism / inclusiveness) refers to…', promptVi: 'Khái niệm “tính dung hợp” trong văn hóa Việt Nam phản ánh đặc trưng nào?', options: ['Khả năng tiếp thu có chọn lọc và hòa quyện các yếu tố mới', 'Sự bài xích tuyệt đối các nền văn hóa khác', 'Việc sao chép nguyên xi văn hóa nước ngoài', 'Sự chia rẽ không thể hàn gắn giữa các vùng miền'], answer: 'Khả năng tiếp thu có chọn lọc và hòa quyện các yếu tố mới', noteVi: 'Văn hóa Việt Nam nổi bật với đặc tính dung hợp: tiếp biến văn hóa bên ngoài nhưng giữ gìn bản sắc cốt lõi.' },
  ],
  C2: [
    { id: 'p_c2_01', level: 'C2', prompt: 'Analyze the profound social philosophy of “Gần mực thì đen, gần đèn thì rạng”:', promptVi: 'Triết lý nhân sinh sâu sắc thể hiện qua câu “Gần mực thì đen, gần đèn thì rạng” là:', options: ['Môi trường sống và các mối quan hệ xã hội tác động mạnh mẽ đến phẩm cách con người', 'Màu sắc đồ vật ảnh hưởng trực tiếp đến thị lực', 'Người có tài năng thì ở đâu cũng phát triển như nhau', 'Số phận mỗi người đã được định đoạt sẵn, không đổi thay'], answer: 'Môi trường sống và các mối quan hệ xã hội tác động mạnh mẽ đến phẩm cách con người', noteVi: 'Khuyên nhủ về tầm ảnh hưởng quyết định của môi trường xã hội và việc chọn bạn mà chơi.' },
    { id: 'p_c2_02', level: 'C2', prompt: 'In classic Vietnamese literature, the emotion “ngậm ngùi” conveys…', promptVi: 'Sắc thái thẩm mỹ của từ “ngậm ngùi” trong văn học cổ điển Việt Nam gợi tả…', options: ['Nỗi xót xa, tiếc nuối âm thầm lắng đọng trong tâm tư', 'Cơn giận dữ bộc phát mãnh liệt ra bên ngoài', 'Niềm vui sướng hân hoan không kìm nén được', 'Sự thờ ơ, lạnh lùng trước biến cố cuộc đời'], answer: 'Nỗi xót xa, tiếc nuối âm thầm lắng đọng trong tâm tư', noteVi: '“Ngậm ngùi” là nỗi niềm bi cảm kín đáo, sâu lắng, đặc trưng của tâm thức phương Đông.' },
    { id: 'p_c2_03', level: 'C2', prompt: 'What linguistic competency does understanding Vietnamese “nói lái” (spoonerism) require?', promptVi: 'Để hiểu và vận dụng nghệ thuật “nói lái” tinh tế trong tiếng Việt, người học cần có năng lực gì?', options: ['Phản xạ nhanh nhạy trong hoán đổi thanh điệu, âm vần và nắm bắt ngữ cảnh ngầm', 'Chỉ cần tra từ điển các từ đơn lẻ', 'Khả năng dịch từng từ sang tiếng nước ngoài', 'Chỉ cần nhớ các quy tắc ngữ pháp cơ bản'], answer: 'Phản xạ nhanh nhạy trong hoán đổi thanh điệu, âm vần và nắm bắt ngữ cảnh ngầm', noteVi: 'Nói lái là hiện tượng ngữ âm độc đáo, kết hợp giữa vần điệu, thanh điệu và sự dí dỏm văn hóa.' },
    { id: 'p_c2_04', level: 'C2', prompt: 'What represents the highest mastery of Vietnamese address terms in formal discourse?', promptVi: 'Đỉnh cao của sự tinh tế trong hệ thống xưng hô tiếng Việt ở hoàn cảnh trang trọng là:', options: ['Uyển chuyển lựa chọn đại từ theo vai vế, khéo léo “tôn xưng khiêm xưng” để giữ hòa khí', 'Luôn dùng đại từ ngôi thứ nhất “tôi” trong mọi tình huống', 'Không sử dụng bất kỳ đại từ xưng hô nào', 'Xưng hô ngang hàng bất chấp tuổi tác và địa vị'], answer: 'Uyển chuyển lựa chọn đại từ theo vai vế, khéo léo “tôn xưng khiêm xưng” để giữ hòa khí', noteVi: 'Văn hóa xưng hô tiếng Việt thể hiện chữ “Tình” và chữ “Lễ”, hạ mình khiêm tốn và tôn vinh người đối thoại.' },
  ],
});

/**
 * Builds the 15-question placement test based on the learner's chosen starting level.
 * @param {string} selectedLevel - 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
 * @returns {Array} 15 questions in ascending level order
 */
export function getPlacementQuestions(selectedLevel = 'A1') {
  const normLevel = String(selectedLevel || 'A1').toUpperCase();
  const distribution = PLACEMENT_DISTRIBUTIONS[normLevel] || PLACEMENT_DISTRIBUTIONS.A1;
  const selectedQuestions = [];

  for (const [tier, count] of Object.entries(distribution)) {
    if (count > 0 && placementQuestionBank[tier]) {
      const tierSlice = placementQuestionBank[tier].slice(0, count);
      selectedQuestions.push(...tierSlice);
    }
  }

  return selectedQuestions;
}

const ALL_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Evaluates the placement test using the Tiered Waterfall Algorithm.
 * - Each tier must meet its threshold (A1 >= 80%, A2 >= 70%, B1..C2 >= 60%).
 * - Lower tiers are strictly prerequisite: if a lower tier is missed, the assessed level
 *   stops at the highest passed consecutive tier, preventing higher certification if foundation is lost.
 *
 * @param {string} selectedLevel - Target level chosen by user
 * @param {Array} answers - Array of learner answers: { questionId, response, correct }
 * @param {Array} questions - The 15 questions served
 * @returns {Object} Full evaluation report including tier scores and explanations
 */
export function evaluatePlacementTest(selectedLevel, answers = [], questions = []) {
  const normLevel = String(selectedLevel || 'A1').toUpperCase();
  const distribution = PLACEMENT_DISTRIBUTIONS[normLevel] || PLACEMENT_DISTRIBUTIONS.A1;
  const tiersInTest = ALL_LEVELS.filter((lvl) => Boolean(distribution[lvl]));

  const tierScores = {};
  let totalCorrect = 0;

  for (const tier of tiersInTest) {
    const tierQuestions = questions.filter((q) => q.level === tier);
    const tierTotal = tierQuestions.length;
    let tierCorrect = 0;

    for (const q of tierQuestions) {
      const ans = answers.find((a) => a?.questionId === q.id);
      if (ans?.correct) {
        tierCorrect++;
        totalCorrect++;
      }
    }

    const percent = tierTotal > 0 ? Math.round((tierCorrect / tierTotal) * 100) : 0;
    const threshold = TIER_THRESHOLDS[tier] || 60;
    const passed = percent >= threshold;

    tierScores[tier] = {
      tier,
      correct: tierCorrect,
      total: tierTotal,
      percent,
      threshold,
      passed,
    };
  }

  // Tiered Waterfall Evaluation:
  // Starts at 'A0'. Advances step-by-step through tiersInTest in sequential order.
  // Breaks on the first failed tier to preserve foundational integrity.
  let assessedLevel = 'A0';
  for (const tier of tiersInTest) {
    if (tierScores[tier]?.passed) {
      assessedLevel = tier;
    } else {
      break;
    }
  }

  const totalQuestions = questions.length || 15;
  const accuracy = Math.round((totalCorrect / totalQuestions) * 100);

  // Generate detailed pedagogical explanations
  let explanationVi = '';
  let explanationEn = '';

  if (assessedLevel === normLevel) {
    explanationVi = `Chúc mừng bạn! Bạn đã hoàn thành xuất sắc các tầng kiến thức và được xác nhận đạt trình độ ${normLevel}.`;
    explanationEn = `Congratulations! You mastered all foundation tiers and confirmed your ${normLevel} proficiency.`;
  } else if (assessedLevel === 'A0') {
    const a1Percent = tierScores.A1?.percent ?? 0;
    explanationVi = `Bạn đạt ${a1Percent}% ở phần nền tảng A1 (yêu cầu ≥ 80%). Hệ thống đề xuất bắt đầu từ A0 để xây dựng nền móng tiếng Việt vững chắc nhất.`;
    explanationEn = `You scored ${a1Percent}% in the A1 foundation (requires ≥ 80%). We recommend starting at A0 to build a solid base.`;
  } else {
    const nextFailedTier = tiersInTest.find((t) => !tierScores[t]?.passed);
    const failedInfo = nextFailedTier ? tierScores[nextFailedTier] : null;
    explanationVi = `Bạn đã qua nền tảng ${assessedLevel}, tuy nhiên ở cấp ${nextFailedTier || normLevel} bạn đạt ${failedInfo?.percent ?? 0}% (yêu cầu ≥ ${failedInfo?.threshold ?? 60}%). Hệ thống đề xuất lộ trình ${assessedLevel} để bạn củng cố kiến thức trước khi tiến lên ${normLevel}.`;
    explanationEn = `You passed the ${assessedLevel} foundation, but at ${nextFailedTier || normLevel} you scored ${failedInfo?.percent ?? 0}% (requires ≥ ${failedInfo?.threshold ?? 60}%). We recommend starting at ${assessedLevel} to solidify your knowledge before advancing.`;
  }

  return {
    selectedLevel: normLevel,
    assessedLevel,
    placementScore: totalCorrect,
    totalQuestions,
    accuracy,
    tierScores,
    explanationVi,
    explanationEn,
    targetLevel: assessedLevel,
  };
}

// Backward compatibility export
export const placementQuestions = getPlacementQuestions('A1');

export const placementBands = [
  { min: 0, label: 'New Explorer', labelVi: 'Người mới khám phá', targetLevel: 'A0', recommendation: 'Vietnamese Foundations · Lesson 1' },
  { min: 3, label: 'Foundation Builder', labelVi: 'Đang xây nền tảng', targetLevel: 'A1', recommendation: 'Everyday Vietnamese · Unit 2' },
  { min: 6, label: 'Everyday Communicator', labelVi: 'Giao tiếp thường ngày', targetLevel: 'A2', recommendation: 'Real-life Conversations · Unit 4' },
  { min: 9, label: 'Independent Communicator', labelVi: 'Giao tiếp độc lập', targetLevel: 'B1', recommendation: 'Natural Vietnamese · Unit 6' },
  { min: 12, label: 'Upper-intermediate Communicator', labelVi: 'Giao tiếp trên trung cấp', targetLevel: 'B2', recommendation: 'Advanced Vietnamese · Chapter 4' },
  { min: 14, label: 'Advanced Communicator', labelVi: 'Giao tiếp nâng cao', targetLevel: 'C1', recommendation: 'Advanced Vietnamese · Culture and Heritage' },
];
