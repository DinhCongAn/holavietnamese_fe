import { useCoachDay } from '@/features/ai/hooks/useCoachDay';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Loader2,
  Sparkles,
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  GripVertical,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/context/AuthContext';
import { BilingualText, useBilingualLabel } from '@/shared/components/common/BilingualText';
import aiCourseCoachService, { COACH_MODES, QUICK_PROMPTS } from '@/features/ai/api/aiCourseCoachService';
import ngheIdleMascot from '@/assets/mascot/nghe-idle.webp';
import './AiCoachPanel.css';

export function AiCoachPanel({
  courseId,
  lessonId,
  lessonTitle,
  lessonContent,
  isOpen: controlledIsOpen,
  onToggle,
}) {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const label = useBilingualLabel();

  // Xác định ngôn ngữ hiện tại của toàn hệ thống (en / vi)
  const isEn = (i18n?.resolvedLanguage || i18n?.language || 'vi').startsWith('en');
  const currentLangCode = isEn ? 'en' : 'vi';

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);

  // Kích thước chuẩn kiểu Coursera Split-Pane (Ảnh 2 & Ảnh 3)
  const DEFAULT_WIDTH = 390;
  const MIN_WIDTH = 320;
  const SNAP_EXPANDED_WIDTH = 580;

  // Lấy độ rộng đã lưu từ localStorage nếu có, mặc định là 390px
  const [panelWidth, setPanelWidth] = useState(() => {
    try {
      const saved = localStorage.getItem('hola_ai_coach_width');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= MIN_WIDTH && val <= 850) {
          return val;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ startX: 0, startWidth: DEFAULT_WIDTH });

  // Xử lý kéo thanh ngăn cách (Splitter Resizer) để thay đổi độ rộng màn hình
  const handleSplitterMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startWidth: panelWidth,
    };
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      // Kéo sang trái (startX - clientX > 0) -> tăng độ rộng AI Coach
      const deltaX = resizeStartRef.current.startX - e.clientX;
      const rawWidth = resizeStartRef.current.startWidth + deltaX;

      // Giới hạn max width không vượt quá 55% màn hình hoặc 800px
      const maxWidth = Math.min(800, Math.max(480, window.innerWidth * 0.55));
      const clampedWidth = Math.max(MIN_WIDTH, Math.min(maxWidth, Math.round(rawWidth)));

      setPanelWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    // Khóa chọn văn bản và đổi icon con trỏ chuột khi đang kéo
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Lưu độ rộng người dùng đã tùy chỉnh vào localStorage
  useEffect(() => {
    if (!isResizing && panelWidth) {
      try {
        localStorage.setItem('hola_ai_coach_width', String(panelWidth));
      } catch {
        // ignore
      }
    }
  }, [isResizing, panelWidth]);

  // Nhấp đúp vào thanh kéo để đặt lại độ rộng mặc định (390px)
  const handleSplitterDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPanelWidth(DEFAULT_WIDTH);
  };

  // Nút chuyển đổi nhanh độ rộng giữa chuẩn (390px) và mở rộng (580px)
  const handleToggleSnapWidth = () => {
    setPanelWidth((prev) => (prev >= 500 ? DEFAULT_WIDTH : SNAP_EXPANDED_WIDTH));
  };

  const handleClose = () => {
    if (onToggle) {
      onToggle(false);
    } else {
      setInternalIsOpen(false);
    }
  };

  const defaultWelcomeMessage = {
    id: 'msg-welcome-init',
    sender: 'ai',
    text: isEn
      ? "Welcome to Comprehensive Hola AI mode! 🎓\n\nAsk any question about Vietnamese: explain vocabulary, grammar patterns, context, and natural usage.\n\nSend a question or pick one of the suggestions below to start practicing together!"
      : "Chào mừng bạn đến với chế độ Gia sư toàn diện! 🎓\n\nHỏi đáp mọi thắc mắc về tiếng Việt: giải thích từ vựng, ngữ pháp, ngữ cảnh và cách dùng tự nhiên.\n\nHãy gửi câu hỏi hoặc chọn một trong các gợi ý bên dưới để chúng ta cùng luyện tập nhé!",
  };

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([defaultWelcomeMessage]);
  const [activeMode, setActiveMode] = useState('ask');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const coachDay = useCoachDay(loading);
  const [sessionLoading, setSessionLoading] = useState(false);
  const chatBodyRef = useRef(null);

  // Load session when panel opens
  useEffect(() => {
    if (!isOpen || !courseId || !lessonId) return;
    if (session?.coachDay === coachDay) return;
    setSessionLoading(true);
    aiCourseCoachService
      .getOrCreateSession({ courseId, lessonId, lessonTitle })
      .then(s => {
        const validSession = s || { id: `coach-${courseId}-${lessonId}-default` };
        setSession(validSession);
        if (validSession.messages && validSession.messages.length > 0) {
          setMessages(validSession.messages);
        } else {
          setMessages([defaultWelcomeMessage]);
        }
      })
      .catch((err) => {
        console.warn('Failed to get coach session, falling back to local session', err);
        const fallback = { id: `coach-${courseId}-${lessonId}-fallback`, messages: [] };
        setSession({ ...fallback, coachDay });
      })
      .finally(() => setSessionLoading(false));
  }, [isOpen, courseId, lessonId, lessonTitle, session, coachDay]);

  // Reset when lesson changes
  useEffect(() => {
    setSession(null);
    setMessages([defaultWelcomeMessage]);
  }, [courseId, lessonId]);

  // Cuộn nội dung bên trong vùng chat (KHÔNG cuộn trang web của người dùng)
  useEffect(() => {
    if (isOpen && chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isOpen, loading]);

  const handleCopy = (msgId, text) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleSpeak = (msgId, text) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_\[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = useCallback(async (text, mode = activeMode) => {
    if (!text.trim() || loading) return;
    const currentSessionId = session?.id || `coach-${courseId}-${lessonId}-default`;
    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: text.trim() };

    setInput('');
    setLoading(true);
    try {
      const dailySession = await aiCourseCoachService.getOrCreateSession({ courseId, lessonId, lessonTitle });
      setSession(dailySession);
      setMessages([...(dailySession.messages || []), userMsg]);
      const aiMsg = await aiCourseCoachService.sendMessage({
        sessionId: dailySession.id,
        text: text.trim(),
        coachMode: mode,
        language: currentLangCode,
        courseId,
        lessonId,
        lessonTitle,
        lessonContent,
      });
      const responseText = aiMsg?.text || (isEn ? 'Received your question.' : 'Đã nhận câu hỏi của bạn.');
      setMessages(prev => [...prev, { id: aiMsg?.id || `a-${Date.now()}`, sender: 'ai', text: responseText }]);
    } catch (err) {
      console.warn('[AiCoachPanel] Network/API error, providing intelligent pedagogical fallback:', err?.message || err);
      const fallbackText = generateLocalCoachAnswer(text.trim(), lessonTitle, lessonContent, mode, isEn);
      setMessages(prev => [
        ...prev,
        { id: `fb-${Date.now()}`, sender: 'ai', text: fallbackText },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, session, activeMode, currentLangCode, isEn, courseId, lessonId, lessonTitle, lessonContent]);

  const handleQuickPrompt = (mode) => {
    setActiveMode(mode);
    const promptText = isEn ? QUICK_PROMPTS[mode]?.en : QUICK_PROMPTS[mode]?.vi;
    sendMessage(promptText || '', mode);
  };

  const handleResetChat = () => {
    setMessages([defaultWelcomeMessage]);
  };

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    sendMessage(input);
  };

  if (!isOpen) return null;

  return (
    <aside
      className={`ai-coach-split-pane ${isResizing ? 'ai-coach-split-pane--resizing' : ''}`}
      style={{ width: `${panelWidth}px` }}
      aria-label="Hola AI Panel"
    >
      {/* Thanh kéo phân chia độ rộng chuẩn Coursera Resizer Splitter (ảnh 2 & ảnh 3) */}
      <div
        className={`ai-coach-splitter ${isResizing ? 'ai-coach-splitter--active' : ''}`}
        onMouseDown={handleSplitterMouseDown}
        onDoubleClick={handleSplitterDoubleClick}
        title={isEn ? "Drag to resize panel, double-click to reset" : "Kéo để thay đổi độ rộng, nhấp đúp để đặt lại"}
        role="separator"
        aria-orientation="vertical"
      >
        <div className="ai-coach-splitter__line" />
        <div className="ai-coach-splitter__handle">
          <GripVertical size={13} strokeWidth={2.4} />
        </div>
      </div>

      {/* 1. Header chuẩn: Mascot Bé Trâu của Hola AI Tutor, Tiêu đề AI Course Coach, Nút tròn */}
      <header className="ai-coach-coursera__header">
        <div className="ai-coach-coursera__header-left">
          <div className="ai-coach-coursera__mascot-wrap">
            <img
              src={ngheIdleMascot}
              alt="Mascot Bé Trâu"
              className="ai-coach-coursera__mascot-img"
            />
          </div>
          <div className="ai-coach-coursera__header-title-group">
            <div className="ai-coach-coursera__header-title-row">
              <span className="ai-coach-coursera__header-title">
                <BilingualText vi="Hola AI" en="Hola AI" />
              </span>
              <span className="ai-coach-coursera__beta-badge">BETA</span>
            </div>
            <small className="ai-coach-coursera__header-sub">
              <span className="ai-coach-coursera__status-dot" />
              {isEn ? 'Lesson assistant' : 'Hỏi nhanh trong lúc học'}
            </small>
          </div>
        </div>

        <div className="ai-coach-coursera__header-actions">
          <button
            type="button"
            className="ai-coach-coursera__icon-btn"
            onClick={handleResetChat}
            title={label('Làm mới hội thoại', 'Reset conversation')}
            aria-label="Reset chat"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            className="ai-coach-coursera__icon-btn"
            onClick={handleToggleSnapWidth}
            title={panelWidth >= 500 ? label('Thu về độ rộng chuẩn (390px)', 'Standard width (390px)') : label('Mở rộng độ rộng (580px)', 'Expand width (580px)')}
            aria-label="Toggle width"
          >
            {panelWidth >= 500 ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <button
            type="button"
            className="ai-coach-coursera__icon-btn"
            onClick={handleClose}
            title={label('Đóng Hola AI', 'Close Hola AI')}
            aria-label="Close panel"
          >
            <X size={17} />
          </button>
        </div>
      </header>

      {/* 2. Thẻ thông báo tính năng AI màu xanh dương nhạt theo đúng mẫu */}
      <div className="ai-coach-coursera__banner">
        <div className="ai-coach-coursera__banner-header">
          <Sparkles size={14} className="shrink-0" />
          <span>
            {isEn ? 'New! Hola AI is now lesson-aware' : 'Mới! Hola AI đã hiểu ngữ cảnh bài học'}
          </span>
        </div>
        <p className="ai-coach-coursera__banner-text">
          {isEn
            ? 'Hola AI understands your active lesson context, vocabulary, and grammar.'
            : 'Hola AI hiểu rõ nội dung, từ vựng và ngữ pháp của bài học bạn đang mở.'}
        </p>
      </div>

      {/* 3. Thân nội dung chat cuộn */}
      <div className="ai-coach-coursera__body" ref={chatBodyRef}>
        {/* Lời chào chuẩn phong cách Coursera (Ảnh 2 & Ảnh 3) */}
        {messages.length <= 1 && (
          <div className="ai-coach-coursera__greeting-card">
            <h3 className="ai-coach-coursera__greeting-name">
              {isEn
                ? `Hi, ${user?.fullName?.split(' ')?.pop() || user?.username || 'there'}.`
                : `Chào ${user?.fullName?.split(' ')?.pop() || user?.username || 'bạn'}.`}
            </h3>
            <p className="ai-coach-coursera__greeting-sub">
              {isEn ? 'How can I help?' : 'Mình có thể giúp gì cho bạn hôm nay?'}
            </p>
            <div className="ai-coach-coursera__greeting-chips">
              <button
                type="button"
                className="ai-coach-coursera__greeting-chip ai-coach-coursera__greeting-chip--active"
                onClick={() => handleQuickPrompt('ask')}
              >
                <span>💬</span>
                <span>{isEn ? "Ask" : 'Hỏi đáp'}</span>
              </button>
              <button
                type="button"
                className="ai-coach-coursera__greeting-chip"
                onClick={() => handleQuickPrompt('summarize')}
              >
                <span>📝</span>
                <span>{isEn ? 'Summarize' : 'Tóm tắt'}</span>
              </button>
              <button
                type="button"
                className="ai-coach-coursera__greeting-chip"
                onClick={() => handleQuickPrompt('explain')}
              >
                <span>🔍</span>
                <span>{isEn ? 'Explain' : 'Giải thích'}</span>
              </button>
              <button
                type="button"
                className="ai-coach-coursera__greeting-chip"
                onClick={() => handleQuickPrompt('quiz')}
              >
                <span>🎯</span>
                <span>{isEn ? 'Practice' : 'Luyện tập'}</span>
              </button>
            </div>
          </div>
        )}
        {/* Danh sách tin nhắn */}
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          const isAi = !isUser;
          const isSpeaking = speakingId === msg.id;
          const isCopied = copiedId === msg.id;

          return (
            <div
              key={msg.id}
              className={`ai-coach-coursera__msg-row ${isUser ? 'ai-coach-coursera__msg-row--user' : 'ai-coach-coursera__msg-row--ai'}`}
            >
              {isAi && (
                <img
                  src={ngheIdleMascot}
                  alt="Mascot Bé Trâu"
                  className="ai-coach-coursera__avatar"
                />
              )}

              <div className="ai-coach-coursera__msg-content-wrap">
                <div
                  className={`ai-coach-coursera__bubble ${isUser ? 'ai-coach-coursera__bubble--user' : 'ai-coach-coursera__bubble--ai'}`}
                >
                  <MessageContent text={msg.text} />
                </div>

                {/* Các nút hành động Copy & Listen dưới tin nhắn AI */}
                {isAi && msg.id !== 'msg-welcome-init' && (
                  <div className="ai-coach-coursera__msg-actions">
                    <button
                      type="button"
                      className="ai-coach-coursera__action-btn hover:!bg-transparent focus:!bg-transparent hover:!shadow-none"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      title={isEn ? "Copy message" : "Sao chép nội dung"}
                    >
                      {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{isCopied ? (isEn ? 'Copied' : 'Đã chép') : (isEn ? 'Copy' : 'Sao chép')}</span>
                    </button>
                    <button
                      type="button"
                      className={`ai-coach-coursera__action-btn hover:!bg-transparent focus:!bg-transparent hover:!shadow-none ${isSpeaking ? 'text-orange-600 font-bold' : ''}`}
                      onClick={() => handleSpeak(msg.id, msg.text)}
                      title={isEn ? "Listen" : "Nghe phát âm"}
                    >
                      {isSpeaking ? <VolumeX size={12} className="text-orange-600 animate-pulse" /> : <Volume2 size={12} />}
                      <span>{isSpeaking ? (isEn ? 'Stop' : 'Dừng') : (isEn ? 'Listen' : 'Nghe')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="ai-coach-coursera__msg-row ai-coach-coursera__msg-row--ai">
            <img
              src={ngheIdleMascot}
              alt="Mascot Bé Trâu"
              className="ai-coach-coursera__avatar"
            />
            <div className="ai-coach-coursera__bubble ai-coach-coursera__bubble--ai ai-coach-coursera__bubble--loading">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      {/* 4. Footer & Input Form phong cách Hola AI Tutor */}
      <footer className="ai-coach-coursera__footer">
        <form className="ai-coach-coursera__form" onSubmit={handleSubmit} action="javascript:void(0);">
          <input
            type="text"
            className="ai-coach-coursera__input"
            placeholder={isEn ? 'What are you wondering about this lesson?' : 'Bạn đang thắc mắc gì?'}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="ai-coach-coursera__send-btn"
            disabled={loading || !input.trim()}
            aria-label={isEn ? 'Send question' : 'Gửi câu hỏi'}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
        <p className="ai-coach-coursera__disclaimer">
          {isEn
            ? 'Hola AI is aligned with official course materials.'
            : 'Hola AI được định hướng theo học liệu chính thức của khóa học.'}
        </p>
      </footer>
    </aside>
  );
}

function MessageContent({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-xs sm:text-sm">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-bold text-stone-900 mt-2 mb-1">{line.slice(4)}</h4>;
        if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-amber-800 text-sm mt-2 mb-1">{line.slice(3)}</h3>;
        if (line.startsWith('# ')) return <h2 key={i} className="font-extrabold text-amber-900 text-base mt-2 mb-1">{line.slice(2)}</h2>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc">{renderInline(line.slice(2))}</li>;
        if (line.trim() === '') return <div key={i} className="h-1.5" />;
        return <p key={i} className="m-0 leading-relaxed">{renderInline(line)}</p>;
      })}
    </div>
  );
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="font-bold text-stone-900">{p.slice(2, -2)}</strong>
      : p
  );
}

function generateLocalCoachAnswer(question, lessonTitle, lessonContent, mode, isEn) {
  const q = (question || '').toLowerCase();

  if (q.includes('chữ cái') || q.includes('bảng chữ cái') || q.includes('alphabet') || q.includes('bao nhiêu')) {
    return isEn
      ? "The modern Vietnamese alphabet consists of **29 letters**: 12 vowels (*a, ă, â, e, ê, i, o, ô, ơ, u, ư, y*) and 17 consonants. Notice the special Vietnamese characters with diacritics: **ă, â, đ, ê, ô, ơ, ư**."
      : "Bảng chữ cái tiếng Việt hiện đại gồm có **29 chữ cái** chính thức: 12 nguyên âm (*a, ă, â, e, ê, i, o, ô, ơ, u, ư, y*) và 17 phụ âm. Trong đó có các chữ cái đặc trưng có dấu phụ như: **ă, â, đ, ê, ô, ơ, ư**.";
  }

  if (q.includes('thanh điệu') || q.includes('dấu') || q.includes('tones')) {
    return isEn
      ? "Vietnamese has **6 tones**: Ngang (flat/level), Huyền (falling `\\`), Sắc (rising `/`), Hỏi (asking `?`), Ngã (tumbling `~`), and Nặng (dot below `.`)."
      : "Tiếng Việt có **6 thanh điệu** cơ bản: thanh ngang (không dấu), huyền (`\\`), sắc (`/`), hỏi (`?`), ngã (`~`), và nặng (`.`).";
  }

  if (q.includes('cần thơ') || q.includes('can tho')) {
    return isEn
      ? "Can Tho is the largest city in the Mekong Delta, famous for its vibrant floating markets like Cái Răng, tropical fruit gardens, and scenic riverways. It is a fantastic cultural hub to experience southern Vietnamese lifestyle, food, and warm hospitality!"
      : "Cần Thơ là thành phố lớn nhất miền Tây Nam Bộ, nổi tiếng với chợ nổi Cái Răng, những vườn cây ăn trái sum suê và sông nước hữu tình. Đây là trung tâm văn hóa tuyệt vời để trải nghiệm ẩm thực phương Nam và sự hiếu khách của người miền Tây!";
  }

  if (mode === 'summarize' || q.includes('tóm tắt') || q.includes('summary')) {
    return isEn
      ? `Here is the summary for **${lessonTitle || 'this lesson'}**:\n- Focus on core vocabulary and pronunciation.\n- Practice reading each phrase aloud.\n- Pay attention to tone marks and spelling rules.`
      : `Dưới đây là tóm tắt cho bài học **${lessonTitle || 'này'}**:\n- Trọng tâm bài: Nắm vững hệ thống chữ cái và phát âm chuẩn.\n- Chú ý các ký tự có dấu phụ đặc trưng của tiếng Việt.\n- Luyện tập phát âm từng âm tiết hàng ngày để ghi nhớ lâu hơn.`;
  }

  const title = lessonTitle || (isEn ? 'this lesson' : 'bài học này');
  return isEn
    ? `Regarding **${title}**: Great question! Focus on the key examples and vocabulary introduced in the lesson content. Let me know if you would like me to explain further or give more practice examples!`
    : `Về **${title}**: Câu hỏi rất hay! Bạn hãy chú ý vào các ví dụ và từ vựng cốt lõi trong nội dung bài nhé. Bạn có muốn mình giải thích chi tiết hơn hay cho thêm ví dụ luyện tập không?`;
}
