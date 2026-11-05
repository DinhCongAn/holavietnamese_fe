import { useCoachDay } from '@/features/ai/hooks/useCoachDay';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  ArrowUp,
  Bot,
  Check,
  Copy,
  Info,
  Loader2,
  Maximize2,
  Mic,
  MicOff,
  Plus,
  Send,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useAiSidebar } from '@/features/ai/context/AiSidebarContext';
import { aiTutorService } from '@/features/ai/api/aiTutorService';
import aiCourseCoachService from '@/features/ai/api/aiCourseCoachService';
import ngheIdleMascot from '@/assets/mascot/nghe-idle.webp';
import { TutorMascotAvatar } from '@/shared/components/mascot';

function cleanAiText(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/^\s*(?:user|response)\s+safety\s*:\s*(?:safe|unsafe|blocked|unknown)\s*$/gim, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Lightweight safe markdown formatter for AI chat messages.
 * Handles bolding **text**, bullet points, and paragraphs.
 */
function FormattedAiMessage({ text }) {
  if (!text) return null;

  // Normalize any literal <br> tags from AI output into newlines
  const normalizedText = text.replace(/<br\s*\/?>/gi, '\n');
  const paragraphs = normalizedText.split('\n\n');

  return (
    <div className="coursera-ai-msg__bubble">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n');
        const isBulletList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));

        if (isBulletList) {
          return (
            <ul key={pIdx}>
              {lines.map((line, lIdx) => {
                const itemText = line.trim().replace(/^[-*]\s+/, '');
                return <li key={lIdx} dangerouslySetInnerHTML={{ __html: renderInline(itemText) }} />;
              })}
            </ul>
          );
        }

        return (
          <p
            key={pIdx}
            dangerouslySetInnerHTML={{ __html: renderInline(para).replace(/\n/g, '<br/>') }}
          />
        );
      })}
    </div>
  );
}

function renderInline(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-stone-100 px-1 py-0.5 rounded text-xs text-orange-700 font-mono">$1</code>');
}


function getLessonQuestionSuggestions(learningContext, isVi) {
  // Yêu cầu: Khi KHÔNG ở trong khóa học/bài học thì KHÔNG cần gợi ý câu hỏi
  if (!learningContext?.lessonTitle) {
    return [];
  }

  const titleLower = (learningContext.lessonTitle || '').toLowerCase();
  const contentLower = (learningContext.lessonContent || '').toLowerCase();
  const results = [];

  // 1. Bài phát âm / âm tiết / vần
  if (titleLower.includes('phát âm') || titleLower.includes('pronunciation') || contentLower.includes('âm tiết') || contentLower.includes('nguyên âm')) {
    if (isVi) {
      results.push({
        icon: '🗣️',
        short: 'Cấu trúc âm tiết',
        text: 'Giải thích cấu trúc âm đầu, âm chính và âm cuối trong âm tiết tiếng Việt',
      });
      results.push({
        icon: '💡',
        short: 'Quy tắc kết thúc m, n',
        text: 'Quy tắc phát âm khi từ kết thúc bằng m hoặc n là gì?',
      });
      results.push({
        icon: '📖',
        short: 'Phân tích ví dụ trong bài',
        text: 'Giải thích và phân tích các ví dụ "nam", "lan", "ban" trong bài',
      });
      results.push({
        icon: '🎯',
        short: 'Hỏi kiểm tra phát âm',
        text: 'Hãy hỏi tôi một câu để kiểm tra xem tôi đã hiểu quy tắc phát âm bài này chưa',
      });
    } else {
      results.push({
        icon: '🗣️',
        short: 'Syllable structure',
        text: 'Explain the initial, medial, and final sound structure in Vietnamese syllables',
      });
      results.push({
        icon: '💡',
        short: 'Final -m and -n rule',
        text: 'What is the rule when pronouncing words ending with m or n?',
      });
      results.push({
        icon: '📖',
        short: 'Analyze examples',
        text: 'Explain the pronunciation examples "nam", "lan", "ban" from this lesson',
      });
      results.push({
        icon: '🎯',
        short: 'Quiz my pronunciation',
        text: 'Ask me a question to test my understanding of this pronunciation lesson',
      });
    }
    return results;
  }

  // 2. Bài thanh điệu / Dấu thanh
  if (titleLower.includes('dấu') || titleLower.includes('tone') || contentLower.includes('thanh điệu')) {
    if (isVi) {
      results.push({
        icon: '🗣️',
        short: 'Dấu hỏi & dấu ngã',
        text: 'Làm sao để phân biệt và phát âm chuẩn dấu hỏi (?) và dấu ngã (~)?',
      });
      results.push({
        icon: '💡',
        short: 'Quy tắc đặt dấu',
        text: 'Quy tắc đặt dấu thanh trên các nguyên âm tiếng Việt như thế nào?',
      });
      results.push({
        icon: '📖',
        short: 'Từ dễ nhầm lẫn',
        text: 'Cho ví dụ các từ có nghĩa khác nhau khi đổi dấu thanh trong bài này',
      });
      results.push({
        icon: '🎯',
        short: 'Kiểm tra thanh điệu',
        text: 'Hãy cho một câu đố ngắn để tôi nhận biết các dấu thanh trong bài',
      });
    } else {
      results.push({
        icon: '🗣️',
        short: 'Question vs Tilde tones',
        text: 'How can I distinguish and pronounce the question tone and tilde tone correctly?',
      });
      results.push({
        icon: '💡',
        short: 'Tone placement rule',
        text: 'What are the rules for placing tone marks on Vietnamese vowels?',
      });
      results.push({
        icon: '📖',
        short: 'Common tone pairs',
        text: 'Give examples of minimal pairs that change meaning with tones in this lesson',
      });
      results.push({
        icon: '🎯',
        short: 'Practice tones quiz',
        text: 'Give me a quick quiz to practice tone identification from this lesson',
      });
    }
    return results;
  }

  // 3. Bài Bảng chữ cái
  if (titleLower.includes('bảng chữ cái') || titleLower.includes('alphabet')) {
    if (isVi) {
      results.push({
        icon: '📖',
        short: 'Nguyên âm & phụ âm',
        text: 'Tiếng Việt có bao nhiêu nguyên âm và phụ âm? Những chữ nào dễ nhầm lẫn?',
      });
      results.push({
        icon: '💡',
        short: 'Chữ cái đặc trưng',
        text: 'Cách phát âm chuẩn các chữ cái đặc trưng có dấu: ă, â, đ, ê, ô, ơ, ư?',
      });
      results.push({
        icon: '🎯',
        short: 'Đố bảng chữ cái',
        text: 'Hãy hỏi tôi một câu kiểm tra kiến thức về bảng chữ cái trong bài',
      });
    } else {
      results.push({
        icon: '📖',
        short: 'Vowels & Consonants',
        text: 'How many vowels and consonants are in the Vietnamese alphabet? Which ones are tricky?',
      });
      results.push({
        icon: '💡',
        short: 'Special letters',
        text: 'How to pronounce the unique Vietnamese characters: ă, â, đ, ê, ô, ơ, ư?',
      });
      results.push({
        icon: '🎯',
        short: 'Alphabet quiz',
        text: 'Ask me a question to test my knowledge of the Vietnamese alphabet',
      });
    }
    return results;
  }

  // 4. Mặc định theo tên bài học cụ thể
  const title = learningContext.lessonTitle;
  if (isVi) {
    results.push({
      icon: '📖',
      short: 'Trọng tâm bài',
      text: `Giải thích trọng tâm kiến thức của bài học "${title}"`,
    });
    results.push({
      icon: '💡',
      short: 'Từ vựng & cấu trúc',
      text: 'Những từ vựng và cấu trúc quan trọng nhất trong bài này là gì?',
    });
    results.push({
      icon: '⚠️',
      short: 'Chỗ dễ hiểu sai',
      text: 'Trong bài này có những điểm nào người học hay nhầm lẫn hoặc chưa hiểu?',
    });
    results.push({
      icon: '🎯',
      short: 'Kiểm tra hiểu bài',
      text: 'Hãy hỏi tôi một câu hỏi để kiểm tra xem tôi đã hiểu kiến thức bài này chưa',
    });
  } else {
    results.push({
      icon: '📖',
      short: 'Key takeaways',
      text: `Explain the core concepts and takeaways of "${title}"`,
    });
    results.push({
      icon: '💡',
      short: 'Essential vocab',
      text: 'What are the essential vocabulary words and sentence patterns in this lesson?',
    });
    results.push({
      icon: '⚠️',
      short: 'Common confusions',
      text: 'What are the common points of confusion or tricky parts in this lesson?',
    });
    results.push({
      icon: '🎯',
      short: 'Test my knowledge',
      text: 'Ask me a practice question to check if I understood this lesson properly',
    });
  }

  return results;
}

function generateLocalCoachAnswer(question, lessonTitle, lessonContent, mode, isEn) {
  const q = (question || '').toLowerCase();

  if (q.includes('cấu trúc âm tiết') || q.includes('âm đầu') || q.includes('âm chính') || q.includes('âm cuối') || q.includes('syllable')) {
    return isEn
      ? "In Vietnamese, a standard syllable consists of three main components:\n\n1. **Initial consonant (Âm đầu)**: e.g., 'n' in 'nam', 'b' in 'ban'.\n2. **Vowel nucleus (Âm chính)**: the core vowel sound, e.g., 'a' in 'nam'.\n3. **Final consonant (Âm cuối)**: e.g., 'm' in 'nam', 'n' in 'an'. Notice that some syllables like 'an' have no initial consonant!\n\nAlways keep the vowel and tone stable when speaking."
      : "Trong tiếng Việt, một âm tiết chuẩn thường có 3 thành phần chính:\n\n1. **Âm đầu (Phụ âm đầu)**: Ví dụ chữ **n** trong 'nam', **b** trong 'ban'. Một số từ như 'an' không có phụ âm đầu.\n2. **Âm chính (Nguyên âm)**: Là hạt nhân phát âm, ví dụ nguyên âm **a** trong 'nam'.\n3. **Âm cuối**: Ví dụ chữ **m** trong 'nam', **n** trong 'lan'.\n\n**Lưu ý quan trọng**: Hãy giữ nguyên nguyên âm và dấu thanh khi đọc. Với từ kết thúc bằng **m**, hai môi phải khép kín; với từ kết thúc bằng **n**, đầu lưỡi chạm vào nướu răng trên.";
  }

  if (q.includes('kết thúc bằng m') || q.includes('kết thúc bằng n') || q.includes('m hoặc n') || q.includes('ending with m')) {
    return isEn
      ? "When pronouncing syllables ending in **-m** or **-n**:\n\n- **For -m**: Close both lips completely at the end of the sound (bilabial closure), such as in *nam, cam, làm*. Do NOT add an extra vowel after the final -m!\n- **For -n**: Place the tip of your tongue against the upper gum ridge (alveolar closure), like in *lan, ban, an*.\n\nPractice saying slowly: *nam*, *lan*, *ban* without releasing an extra vowel sound at the end."
      : "Quy tắc phát âm chuẩn khi từ kết thúc bằng **-m** hoặc **-n**:\n\n- **Với âm cuối -m**: Kết thúc âm bằng việc **khép chặt hai môi lại**, ví dụ: *nam, cam, làm*. Tuyệt đối **không thêm một nguyên âm** sau âm cuối!\n- **Với âm cuối -n**: Đầu lưỡi chạm vào nướu răng trên, ví dụ: *lan, ban, an*.\n\n**Thực hành**: Hãy đọc chậm từng từ: *nam*, *lan*, *ban* rồi nối vào câu để phát âm thật tròn vành rõ chữ nhé!";
  }

  if (q.includes('chữ cái') || q.includes('bảng chữ cái') || q.includes('alphabet')) {
    return isEn
      ? "The Vietnamese alphabet consists of **29 letters**: 12 vowels (*a, ă, â, e, ê, i, o, ô, ơ, u, ư, y*) and 17 consonants. Pay special attention to the modified letters with diacritics: **ă, â, đ, ê, ô, ơ, ư**."
      : "Bảng chữ cái tiếng Việt gồm **29 chữ cái**: 12 nguyên âm (*a, ă, â, e, ê, i, o, ô, ơ, u, ư, y*) và 17 phụ âm. Bạn cần chú ý đặc biệt đến các chữ cái có dấu phụ đặc trưng: **ă, â, đ, ê, ô, ơ, ư** nhé!";
  }

  if (q.includes('dấu') || q.includes('thanh điệu') || q.includes('tone')) {
    return isEn
      ? "Vietnamese has **6 tones**: Ngang (flat), Huyền (`\\`), Sắc (`/`), Hỏi (`?`), Ngã (`~`), and Nặng (`.`). Tone determines the meaning of a word, so practice steady pitch control!"
      : "Tiếng Việt có **6 thanh điệu**: Ngang (không dấu), Huyền (`\\`), Sắc (`/`), Hỏi (`?`), Ngã (`~`), và Nặng (`.`). Dấu thanh thay đổi hoàn toàn nghĩa của từ, ví dụ: *ma* (ma quỷ), *má* (mẹ), *mà* (nhưng), *mả* (ngôi mộ), *mã* (ngựa), *mạ* (cây lúa non).";
  }

  if (q.includes('tóm tắt') || q.includes('summary') || q.includes('summarize') || q.includes('trọng tâm')) {
    const title = lessonTitle || (isEn ? 'this lesson' : 'bài học này');
    return isEn
      ? `Here is the summary of **${title}**:\n\n- **Core Focus**: Master the syllable structure and correct pronunciation.\n- **Key Rule**: Maintain stable vowel sounds and tones; do not append extra vowel sounds at the end of syllables.\n- **Practice Advice**: Read each example (*nam, lan, ban*) slowly and distinctly.`
      : `Dưới đây là tóm tắt trọng tâm cho bài học **"${title}"**:\n\n- **Nội dung chính**: Nắm vững cấu tạo âm tiết (âm đầu, âm chính, âm cuối) và cách phát âm chuẩn.\n- **Quy tắc quan trọng**: Giữ nguyên nguyên âm và dấu thanh khi đọc; không thêm nguyên âm sau âm cuối kết thúc bằng m, n.\n- **Lời khuyên luyện tập**: Đọc chậm và phân tích từng âm tiết trong các ví dụ (*nam, lan, ban*) để tạo phản xạ phát âm chuẩn xác.`;
  }

  if (q.includes('hỏi tôi') || q.includes('kiểm tra') || q.includes('quiz') || q.includes('test')) {
    return isEn
      ? `Here is a practice question for **${lessonTitle || 'this lesson'}**:\n\nIn the word **"nam"**, which letter is the initial consonant (âm đầu), which is the medial vowel (âm chính), and which is the final consonant (âm cuối)?\n\n*Reply with your answer and I will check it for you!* 🎯`
      : `Đây là câu hỏi kiểm tra nhanh cho bài **"${lessonTitle || 'này'}"**:\n\nTrong từ **"nam"**, chữ nào là **âm đầu**, chữ nào là **âm chính**, và chữ nào là **âm cuối**?\n\n*Bạn hãy gõ câu trả lời vào khung chat để mình kiểm tra nhé!* 🎯`;
  }

  const title = lessonTitle || (isEn ? 'this lesson' : 'bài học này');
  return isEn
    ? `Regarding **${title}**: Focus on the core vocabulary and pronunciation rules demonstrated in the lesson. Let me know if you would like me to explain any word or provide extra examples!`
    : `Về bài học **"${title}"**: Bạn hãy tập trung vào các ví dụ cốt lõi và quy tắc được hướng dẫn trong bài nhé. Bạn có thắc mắc gì về từ vựng hay quy tắc nào trong bài, cứ nhắn cho mình nhé!`;
}

export function CourseraAiSidebar({ width, onResize, onClose }) {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const { learningContext, pendingPrompt, clearPendingPrompt } = useAiSidebar();
  const isVi = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('vi');

  const [session, setSession] = useState(() => {
    return aiTutorService.getSession(aiTutorService.getActiveSessionId());
  });
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const coachDay = useCoachDay(isSending);
  const [isResizing, setIsResizing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showBanner, setShowBanner] = useState(() => {
    try {
      return localStorage.getItem('hola:ai-banner-dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const resizeStartRef = useRef({ startX: 0, startWidth: 420 });

  // Gợi ý câu hỏi thông minh theo bài học (chỉ hiển thị khi đang trong bài học)
  const suggestions = useMemo(() => {
    return getLessonQuestionSuggestions(learningContext, isVi);
  }, [learningContext, isVi]);

  // Auto-focus input when opened
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, []);

  // Đồng bộ phiên học của Hola AI theo bài học hiện tại (Link trực tiếp vào bài học)
  useEffect(() => {
    let isCancelled = false;

    if (learningContext?.lessonId) {
      // Khi đang ở trong bài học: lấy hoặc tạo phiên AI Coach riêng của bài học đó
      aiCourseCoachService
        .getOrCreateSession({
          courseId: learningContext.courseId,
          lessonId: learningContext.lessonId,
          lessonTitle: learningContext.lessonTitle,
        })
        .then((coachSession) => {
          if (isCancelled) return;
          // Nếu phiên bài học chưa có tin nhắn, khởi tạo lời chào gắn với bài học
          if (!coachSession.messages || coachSession.messages.length === 0) {
            const welcomeText = isVi
              ? `Chào ${greetingName}! Mình là Hola AI. Mình đã sẵn sàng hỗ trợ bạn trong bài học **"${learningContext.lessonTitle}"**.

Hãy bấm vào các câu hỏi gợi ý bên dưới hoặc hỏi mình bất cứ điều gì bạn chưa hiểu về bài học này nhé! 💡`
              : `Hello ${greetingName}! I am Hola AI. I am ready to assist you with **"${learningContext.lessonTitle}"**.

Click any of the suggested questions below or ask me anything about this lesson! 💡`;

            coachSession = {
              ...coachSession,
              messages: [
                {
                  id: `welcome-${learningContext.lessonId}`,
                  sender: 'ai',
                  text: welcomeText,
                  timestamp: new Date().toISOString(),
                },
              ],
            };
          }
          setSession(coachSession);
        })
        .catch(() => {
          if (!isCancelled) {
            setSession({
              id: `coach-${learningContext.lessonId}-local`,
              title: `Hola AI – ${learningContext.lessonTitle}`,
              messages: [
                {
                  id: `welcome-${learningContext.lessonId}`,
                  sender: 'ai',
                  text: isVi
                    ? `Chào ${greetingName}! Mình là Hola AI. Mình đồng hành cùng bạn trong bài học **"${learningContext.lessonTitle}"**.

Hãy chọn câu hỏi gợi ý bên dưới hoặc hỏi mình về bài học nhé!`
                    : `Hello ${greetingName}! I am Hola AI assisting you in **"${learningContext.lessonTitle}"**.

Pick a suggested question below or ask me anything!`,
                  timestamp: new Date().toISOString(),
                },
              ],
            });
          }
        });
    } else {
      // Khi không ở trong bài học: dùng phiên trò chuyện tổng quát
      const generalSess = aiTutorService.getSession(aiTutorService.getActiveSessionId()) || aiTutorService.createSession('tutor');
      setSession(generalSess);
    }

    return () => {
      isCancelled = true;
    };
  }, [learningContext?.courseId, learningContext?.lessonId, learningContext?.lessonTitle, isVi, coachDay]);

  // Handle incoming pending prompt (e.g. from lesson page)
  useEffect(() => {
    if (pendingPrompt) {
      setInput(pendingPrompt);
      clearPendingPrompt();
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pendingPrompt, clearPendingPrompt]);

  // Dismiss Coursera announcement banner
  const dismissBanner = () => {
    setShowBanner(false);
    try {
      localStorage.setItem('hola:ai-banner-dismissed', 'true');
    } catch {
      // Ignore
    }
  };

  // Quick Suggestion Pills Horizontal Drag & Scroll handlers
  const pillsScrollRef = useRef(null);
  const [isDraggingPills, setIsDraggingPills] = useState(false);
  const dragStartRef = useRef({ startX: 0, scrollLeft: 0, hasMoved: false });

  const handlePillsMouseDown = (e) => {
    const el = pillsScrollRef.current;
    if (!el) return;
    dragStartRef.current = {
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      hasMoved: false,
    };
    setIsDraggingPills(true);
  };

  const handlePillsMouseMove = (e) => {
    if (!isDraggingPills) return;
    const el = pillsScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartRef.current.startX) * 1.5;
    if (Math.abs(walk) > 4) {
      dragStartRef.current.hasMoved = true;
    }
    el.scrollLeft = dragStartRef.current.scrollLeft - walk;
  };

  const handlePillsMouseUp = () => {
    setIsDraggingPills(false);
  };

  const handlePillClick = (itemText) => {
    if (dragStartRef.current.hasMoved) {
      dragStartRef.current.hasMoved = false;
      return;
    }
    handleSendMessage(itemText);
  };

  const handlePillsWheel = (e) => {
    const el = pillsScrollRef.current;
    if (!el) return;
    if (e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
    }
  };

  // New Chat session
  const handleNewSession = () => {
    const newSess = aiTutorService.createSession('tutor');
    setSession(newSess);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  // Submit message
  const handleSendMessage = async (textToSend) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isSending) return;

    setInput('');
    setIsSending(true);

    const tempUserMsg = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    try {
      let activeSession = session;
      if (learningContext?.lessonId) {
        activeSession = await aiCourseCoachService.getOrCreateSession(learningContext);
      }
      setSession({
        ...activeSession,
        messages: [...(activeSession?.messages || []), tempUserMsg],
      });
      if (learningContext?.lessonId) {
        // Gửi câu hỏi kèm toàn bộ ngữ cảnh bài học (tiêu đề, nội dung học liệu)
        const response = await aiCourseCoachService.sendMessage({
          sessionId: activeSession.id,
          text: messageText,
          courseId: learningContext.courseId,
          lessonId: learningContext.lessonId,
          lessonTitle: learningContext.lessonTitle,
          lessonContent: learningContext.lessonContent,
          language: isVi ? 'vi' : 'en',
        });

        const aiReplyText = response?.text || response?.result?.text || (isVi ? 'Đã nhận câu hỏi của bạn.' : 'Received your question.');

        setSession((prev) => ({
          ...prev,
          messages: [
            ...(prev?.messages || []),
            {
              id: response?.id || `msg-${Date.now()}-ai`,
              sender: 'ai',
              text: cleanAiText(aiReplyText),
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      } else {
        // Trò chuyện AI tổng quát khi không ở trong bài học
        const activeSession = session || aiTutorService.getSession(aiTutorService.getActiveSessionId());
        const result = await aiTutorService.sendMessage(
          activeSession.id,
          messageText,
          activeSession.mode || 'tutor',
          isVi ? 'vi' : 'en',
        );
        setSession(result.updatedSession);
      }
    } catch (error) {
      console.warn('AI call error, generating contextual fallback:', error);
      const fallback = generateLocalCoachAnswer(
        messageText,
        learningContext?.lessonTitle,
        learningContext?.lessonContent,
        'ask',
        !isVi
      );

      setSession((current) => ({
        ...current,
        messages: [
          ...(current?.messages || []),
          {
            id: `msg-${Date.now()}-ai`,
            sender: 'ai',
            text: fallback,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } finally {
      setIsSending(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message
  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text-to-speech pronunciation
  const handleSpeak = (id, text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speakingId === id) {
        setSpeakingId(null);
        return;
      }
      const clean = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.95;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Voice speech-to-text recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isVi ? 'Trình duyệt không hỗ trợ nhận diện giọng nói.' : 'Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // ==========================================
  // Resizer drag handler (Left border)
  // ==========================================
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startWidth: width,
    };
    document.body.classList.add('is-resizing-ai-sidebar');

    const handleMouseMove = (moveEvent) => {
      const deltaX = resizeStartRef.current.startX - moveEvent.clientX;
      const newWidth = resizeStartRef.current.startWidth + deltaX;
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('is-resizing-ai-sidebar');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [width, onResize]);

  // Touch drag support for tablet/touch devices
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    resizeStartRef.current = {
      startX: touch.clientX,
      startWidth: width,
    };
    setIsResizing(true);

    const handleTouchMove = (moveEvent) => {
      if (moveEvent.touches.length !== 1) return;
      const moveTouch = moveEvent.touches[0];
      const deltaX = resizeStartRef.current.startX - moveTouch.clientX;
      const newWidth = resizeStartRef.current.startWidth + deltaX;
      onResize(newWidth);
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
  }, [width, onResize]);

  const messages = (session?.messages || [])
    .map((msg) => ({ ...msg, text: cleanAiText(msg.text) }))
    .filter((msg) => msg.text);

  const greetingName = user?.fullName || user?.name || (isVi ? 'bạn' : 'there');

  return (
    <>
      {/* Mobile backdrop */}
      <div className="coursera-ai-backdrop lg:hidden" onClick={onClose} aria-hidden="true" />

      <aside
        className="coursera-ai-sidebar"
        style={{ width: `${width}px` }}
        aria-label={isVi ? 'Trợ lý AI Hola' : 'Hola AI Coach'}
      >
        {/* Drag Resizer on left border */}
        <div
          className={`coursera-ai-resizer ${isResizing ? 'is-active' : ''}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          title={isVi ? 'Kéo để chỉnh độ rộng (22% - 30% màn hình)' : 'Drag to resize panel (22% - 30% screen)'}
          aria-label={isVi ? 'Thanh kéo chỉnh độ rộng' : 'Resize handle'}
          role="separator"
          tabIndex={0}
        >
          <div className="coursera-ai-resizer__grip" />
        </div>

        {/* Top Header - Đỏ mận Gradient chuẩn Hola AI như trong ảnh */}
        <header className="coursera-ai-header">
          <div className="coursera-ai-header__brand">
            <div className="coursera-ai-header__mascot-wrap">
              <img src={ngheIdleMascot} alt="Bé Nghé" className="coursera-ai-header__mascot-img" />
            </div>
            <div className="coursera-ai-header__title-group">
              <div className="coursera-ai-header__title-row">
                <h2 className="coursera-ai-header__title">
                  {isVi ? 'Hola AI' : 'Hola AI'}
                </h2>
                <span className="coursera-ai-header__badge">BETA</span>
              </div>
              <small className="coursera-ai-header__sub">
                <span className="coursera-ai-header__status-dot" />
                <span>{isVi ? 'Trợ lý bài học' : 'Lesson assistant'}</span>
              </small>
            </div>
          </div>

          <div className="coursera-ai-header__actions">
            <button
              type="button"
              className="coursera-ai-header__btn"
              onClick={handleNewSession}
              title={isVi ? 'Bắt đầu cuộc trò chuyện mới' : 'New chat'}
              aria-label={isVi ? 'Cuộc trò chuyện mới' : 'New chat'}
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>

            <Link
              to="/ai-tutor"
              state={{ sessionId: session?.id }}
              onClick={() => {
                if (session?.id) {
                  aiTutorService.setActiveSessionId(session.id);
                }
              }}
              className="coursera-ai-header__btn"
              title={isVi ? 'Mở phòng học AI toàn màn hình' : 'Open full AI studio'}
              aria-label={isVi ? 'Mở phòng học AI' : 'Open full AI studio'}
            >
              <Maximize2 size={15} />
            </Link>

            <button
              type="button"
              className="coursera-ai-header__btn"
              onClick={onClose}
              title={isVi ? 'Đóng Hola AI' : 'Close Hola AI'}
              aria-label={isVi ? 'Đóng' : 'Close'}
            >
              <X size={17} />
            </button>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="coursera-ai-body">
          {/* Announcement Banner - Vàng ấm chuẩn Hola AI như trong ảnh */}
          {showBanner && (
            <div className="coursera-ai-banner" role="region" aria-label={isVi ? "Thông báo mới" : "New announcement"}>
              <div className="coursera-ai-banner__header">
                <Sparkles size={15} />
                <span>{isVi ? 'Mới! Hola AI đã hiểu ngữ cảnh bài học' : 'New! Hola AI is now lesson-aware'}</span>
              </div>
              <p className="coursera-ai-banner__desc">
                {isVi
                  ? 'Hola AI hiểu rõ nội dung, từ vựng và ngữ pháp của bài học bạn đang mở.'
                  : 'Hola AI understands your active lesson context, vocabulary, and grammar.'}
              </p>
              <div className="coursera-ai-banner__actions">
                <button
                  type="button"
                  className="coursera-ai-banner__btn-ok"
                  onClick={dismissBanner}
                >
                  {isVi ? 'Đã hiểu' : 'Sounds great'}
                </button>
                <button
                  type="button"
                  className="coursera-ai-banner__btn-dismiss"
                  onClick={dismissBanner}
                >
                  {isVi ? 'Đóng' : 'Dismiss'}
                </button>
              </div>
            </div>
          )}

          {/* Active Lesson Context indicator if available */}
          {learningContext?.lessonTitle && (
            <div className="coursera-ai-context-pill">
              <Info size={13} className="text-orange-500" />
              <span>{isVi ? 'Đang học:' : 'Active lesson:'}</span>
              <strong>{learningContext.lessonTitle}</strong>
            </div>
          )}

          {/* Large Welcoming Greeting (Matching Coursera screenshot) */}
          {messages.length === 0 && (
            <div className="coursera-ai-greeting">
              <h3 className="coursera-ai-greeting__title">
                {isVi ? `Chào, ${greetingName}. Tôi có thể giúp gì?` : `Hi ${greetingName}. How can I help today?`}
              </h3>
              <p className="coursera-ai-greeting__sub">
                {isVi
                  ? 'Hỏi bất kỳ điều gì về bài học, từ vựng hoặc ngữ pháp tiếng Việt.'
                  : 'Ask anything about your lessons, vocabulary, grammar, or speaking practice.'}
              </p>
            </div>
          )}

          {/* Suggestion Chips - Chỉ hiển thị khi đang trong bài học */}
          {Boolean(learningContext?.lessonTitle && suggestions.length > 0 && messages.length <= 1) && (
            <div className="coursera-ai-suggestions">
              <span className="coursera-ai-suggestions__label">
                💡 {isVi ? 'Gợi ý câu hỏi bài học:' : 'Suggested lesson questions:'}
              </span>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="coursera-ai-chip"
                  onClick={() => handleSendMessage(item.text)}
                >
                  <span>
                    <span className="mr-2">{item.icon}</span>
                    {item.text}
                  </span>
                  <ArrowRight size={14} className="coursera-ai-chip__arrow" />
                </button>
              ))}
            </div>
          )}

          {/* Message Thread */}
          <div className="coursera-ai-messages" aria-live="polite">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.sender === 'user' ? 'coursera-ai-msg--user' : 'coursera-ai-msg--ai'}
              >
                {msg.sender === 'ai' && (
                  <div className="coursera-ai-msg__avatar">
                    <TutorMascotAvatar state={speakingId === msg.id ? 'speaking' : 'idle'} size="tiny" className="nghe-tutor-avatar--face" />
                  </div>
                )}

                <div className="coursera-ai-msg__content">
                  {msg.sender === 'user' ? (
                    <div>{msg.text}</div>
                  ) : (
                    <>
                      <FormattedAiMessage text={msg.text} />

                      {/* Native alternative or Grammar correction if returned */}
                      {msg.nativeAlternative && (
                        <div className="coursera-ai-msg__addon coursera-ai-msg__addon--native">
                          <strong>{isVi ? 'Cách nói tự nhiên hơn: ' : 'More natural phrasing: '}</strong>
                          <span>{msg.nativeAlternative}</span>
                        </div>
                      )}

                      {msg.grammarCorrection && (
                        <div className="coursera-ai-msg__addon coursera-ai-msg__addon--grammar">
                          <strong>{isVi ? 'Lưu ý ngữ pháp: ' : 'Grammar note: '}</strong>
                          <span>{msg.grammarCorrection}</span>
                        </div>
                      )}

                      <div className="coursera-ai-msg__footer">
                        <button
                          type="button"
                          className="coursera-ai-msg__action"
                          onClick={() => handleCopy(msg.id, msg.text)}
                          title={isVi ? 'Sao chép câu trả lời' : 'Copy answer'}
                        >
                          {copiedId === msg.id ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                          <span>{copiedId === msg.id ? (isVi ? 'Đã chép' : 'Copied') : (isVi ? 'Sao chép' : 'Copy')}</span>
                        </button>

                        <button
                          type="button"
                          className="coursera-ai-msg__action"
                          onClick={() => handleSpeak(msg.id, msg.text)}
                          title={isVi ? 'Nghe phát âm tiếng Việt' : 'Listen pronunciation'}
                        >
                          <Volume2 size={12} />
                          <span>{isVi ? 'Nghe' : 'Listen'}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="coursera-ai-msg--ai">
                <div className="coursera-ai-msg__avatar">
                  <TutorMascotAvatar state="thinking" size="tiny" className="nghe-tutor-avatar--face" />
                </div>
                <div className="coursera-ai-thinking">
                  <div className="coursera-ai-thinking__dot" />
                  <div className="coursera-ai-thinking__dot" />
                  <div className="coursera-ai-thinking__dot" />
                  <span>{isVi ? 'Bé Nghé đang suy nghĩ…' : 'Bé Nghé is thinking…'}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Sticky Bottom Input Dock - Hola AI Style */}
        {/* Quick Suggestion Pills Bar - Chỉ hiển thị khi đang trong bài học */}
        {Boolean(learningContext?.lessonTitle && suggestions.length > 0) && (
          <div className="coursera-ai-quick-pills" role="region" aria-label={isVi ? 'Gợi ý câu hỏi' : 'Question suggestions'}>
            <div className="coursera-ai-quick-pills__top">
              <span className="coursera-ai-quick-pills__label">
                <Sparkles size={12} className="text-amber-500" />
                <span>{isVi ? 'Gợi ý câu hỏi bài học:' : 'Suggested questions:'}</span>
              </span>
            </div>

            <div
              ref={pillsScrollRef}
              className={`coursera-ai-quick-pills__scroll ${isDraggingPills ? 'is-dragging' : ''}`}
              onMouseDown={handlePillsMouseDown}
              onMouseMove={handlePillsMouseMove}
              onMouseUp={handlePillsMouseUp}
              onMouseLeave={handlePillsMouseUp}
              onWheel={handlePillsWheel}
            >
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="coursera-ai-quick-pill"
                  onClick={() => handlePillClick(item.text)}
                  disabled={isSending}
                  title={item.text}
                >
                  <span className="mr-1">{item.icon}</span>
                  <span>{item.short || item.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <footer className="coursera-ai-footer">
          <form className="coursera-ai-form" onSubmit={handleSubmit}>
            {/* Speak / Mic Button */}
            <button
              type="button"
              className={`coursera-ai-mic-btn ${isListening ? 'is-listening' : ''}`}
              onClick={toggleSpeechRecognition}
              disabled={isSending}
              title={
                isListening
                  ? (isVi ? 'Đang lắng nghe... Bấm để dừng' : 'Listening... Click to stop')
                  : (isVi ? 'Nói tiếng Việt qua Micro' : 'Speak via Microphone')
              }
              aria-label={isVi ? 'Nhập giọng nói' : 'Voice input'}
            >
              {isListening ? (
                <MicOff size={16} strokeWidth={2.3} />
              ) : (
                <Mic size={16} strokeWidth={2.3} />
              )}
            </button>

            {/* Input Field */}
            <div className="coursera-ai-input-container">
              <input
                ref={inputRef}
                className="coursera-ai-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isVi ? 'Bạn đang thắc mắc gì?…' : 'Ask anything about this lesson…'}
                disabled={isSending}
                aria-label={isVi ? 'Nội dung câu hỏi cho AI' : 'Question for AI'}
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              className="coursera-ai-send-btn"
              disabled={!input.trim() || isSending}
              title={isVi ? 'Gửi câu hỏi (Enter)' : 'Send message (Enter)'}
              aria-label={isVi ? 'Gửi' : 'Send'}
            >
              {isSending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} strokeWidth={2.3} />
              )}
            </button>
          </form>

          <p className="coursera-ai-disclaimer">
            {isVi
              ? 'Công cụ được hỗ trợ bởi AI, có thể tạo nội dung không chính xác. Hãy kiểm tra các thông tin quan trọng.'
              : 'AI-powered assistant. Answers may occasionally be inaccurate. Please verify important information.'}
          </p>
        </footer>
      </aside>
    </>
  );
}
