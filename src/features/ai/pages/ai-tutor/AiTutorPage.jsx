import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  Trash2,
  Edit3,
  Plus,
  Search,
  Bot,
  User,
  BookOpen,
  MessageSquare,
  Compass,
  ArrowRight,
  BookmarkPlus,
  Globe,
  Award,
  Flame,
  VolumeX,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { aiTutorService, getCurrentUserStorageKey, TUTOR_MODES } from '@/features/ai/api/aiTutorService';
import { getAiSessionKind, getAiSessionMode } from '@/utils/aiSessionKind';
import { useAuth } from '@/features/auth/context/AuthContext';
import { vocabularyService } from '@/features/vocabulary/api/vocabularyService';
import { useConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { audioFeedback } from '@/utils/audioFeedback';
import { TutorMascotAvatar } from '@/shared/components/mascot';

function getDisplayMessageText(value) {
  if (typeof value !== 'string') return '';

  const text = value.trim();
  if (!(text.startsWith('{') && text.endsWith('}'))) return value;

  try {
    const parsed = JSON.parse(text);
    const nestedText = parsed?.text ?? parsed?.content ?? parsed?.answer ?? parsed?.reply;
    return typeof nestedText === 'string' ? nestedText : value;
  } catch {
    return value;
  }
}

/**
 * FormattedMessageText - Renders markdown bold keywords, bullet points,
 * and code tags with rich EdTech styling.
 */
function FormattedMessageText({ text, isAi }) {
  const { i18n } = useTranslation();
  const isEn = (i18n?.resolvedLanguage || i18n?.language || 'en').startsWith('en');
  let displayText = getDisplayMessageText(text);
  if (isAi && isEn && displayText && displayText.startsWith('Chào mừng bạn đến với chế độ')) {
    displayText = "Welcome to Hola AI!\n\nAsk any question about Vietnamese: explain vocabulary, grammar patterns, context, and natural usage.\n\nSend a question or pick one of the suggestions below to start practicing together!";
  }
  if (!displayText) return null;

  const lines = displayText.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-xs sm:text-sm">
      {lines.map((line, lIdx) => {
        if (!line.trim()) {
          return <div key={lIdx} className="h-1.5" />;
        }

        const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
        const cleanedLine = isBullet ? line.trim().replace(/^[-*]\s+/, '') : line;

        // Split by **bold** and `code`
        const parts = cleanedLine.split(/(\*\*.*?\*\*|`.*?`)/g);

        const content = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const inner = part.slice(2, -2);
            return (
              <strong
                key={pIdx}
                className={isAi ? 'font-bold text-stone-900' : 'font-bold text-white'}
              >
                {inner}
              </strong>
            );
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            const inner = part.slice(1, -1);
            return (
              <code
                key={pIdx}
                className={`px-1.5 py-0.5 rounded-md font-mono text-[11px] ${
                  isAi
                    ? 'bg-emerald-100/60 text-emerald-900 border border-emerald-200/60'
                    : 'bg-white/20 text-white border border-white/30'
                }`}
              >
                {inner}
              </code>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={lIdx} className="flex items-start gap-2 pl-1">
              <span className={`text-xs mt-0.5 shrink-0 ${isAi ? 'text-emerald-700' : 'text-white/80'}`}>
                •
              </span>
              <span className="flex-1">{content}</span>
            </div>
          );
        }

        return <p key={lIdx}>{content}</p>;
      })}
    </div>
  );
}

export function AiTutorPage() {
  const { user, accessToken } = useAuth();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isEn = (i18n?.resolvedLanguage || i18n?.language || 'en').startsWith('en');
  const activeUserKey = String(user?.userId ?? user?.id ?? user?.username ?? getCurrentUserStorageKey());
  const { confirm, confirmationDialog } = useConfirmDialog();
  const [modes, setModes] = useState(() => aiTutorService.getModes());
  const [sessions, setSessions] = useState(() => aiTutorService.getAllSessions());
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const targetId = location.state?.sessionId;
    if (!targetId) return '';
    const all = aiTutorService.getAllSessions();
    const target = all.find((s) => s.id === targetId);
    return target?.id || '';
  });
  const [currentSession, setCurrentSession] = useState(() => {
    const targetId = location.state?.sessionId;
    if (!targetId) return null;
    const all = aiTutorService.getAllSessions();
    return all.find((s) => s.id === targetId) || null;
  });
  const [currentMode, setCurrentMode] = useState(() => {
    const targetId = location.state?.sessionId;
    if (targetId) {
      const all = aiTutorService.getAllSessions();
      const target = all.find((s) => s.id === targetId);
      if (target?.mode) return target.mode;
    }
    return aiTutorService.getModes()[0]?.id || 'tutor';
  });
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [newTitleInput, setNewTitleInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [historyKind, setHistoryKind] = useState('all');
  const [isHistoryMenuOpen, setIsHistoryMenuOpen] = useState(false);
  const historyMenuRef = useRef(null);

  useEffect(() => {
    if (!isHistoryMenuOpen) return undefined;
    const closeOutside = (event) => {
      if (!historyMenuRef.current?.contains(event.target)) setIsHistoryMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsHistoryMenuOpen(false);
        historyMenuRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isHistoryMenuOpen]);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [speechRate, setSpeechRate] = useState(0.95);
  const [copiedId, setCopiedId] = useState(null);
  const [aiStatus, setAiStatus] = useState({ isLiveCall: false, provider: 'openai', activeModel: 'gpt-5-mini', apiKeyConfigured: false, apiKeyMasked: '' });
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isConfiguringKey, setIsConfiguringKey] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);

  const chatContainerRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const modeMenuRef = useRef(null);
  const isFirstRender = useRef(true);

  // Ensure window stays at top on page mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (!isModeMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!modeMenuRef.current?.contains(event.target)) {
        setIsModeMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsModeMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModeMenuOpen]);

  // Load sessions and AI status on mount or when the logged-in user changes
  useEffect(() => {
    let cancelled = false;
    const loadedSessions = aiTutorService.getAllSessions();
    setSessions(loadedSessions);
    // Tự động mở sẵn phiên học mục tiêu hoặc phiên gần nhất

    const explicitTargetId = location.state?.sessionId;
    const explicitSession = explicitTargetId
      ? (Array.isArray(loadedSessions) && loadedSessions.find((s) => s.id === explicitTargetId)) || null
      : null;

    if (explicitSession) {
      aiTutorService.setActiveSessionId(explicitSession.id);
      setActiveSessionId(explicitSession.id);
      setCurrentSession(explicitSession);
      if (explicitSession.mode) {
        setCurrentMode(explicitSession.mode);
      }
      try {
        window.history.replaceState({}, document.title);
      } catch {
        // ignore
      }
    } else {
      // Khi khởi động lại hệ thống hoặc sang ngày mới: không tự động mở phiên gần nhất, để learner chọn tự mở
      aiTutorService.setActiveSessionId('');
      setActiveSessionId('');
      setCurrentSession(null);
    }


    aiTutorService.syncSessionsFromBackend().then((remoteSynced) => {
      if (!cancelled && Array.isArray(remoteSynced)) {
        setSessions(remoteSynced);
        setCurrentSession((prev) => {
          if (prev) {
            const found = remoteSynced.find((s) => s.id === prev.id);
            return found || prev;
          }
          if (explicitTargetId) {
            const chosen = remoteSynced.find((s) => s.id === explicitTargetId);
            if (chosen) {
              aiTutorService.setActiveSessionId(chosen.id);
              setActiveSessionId(chosen.id);
              if (chosen.mode) setCurrentMode(chosen.mode);
              return chosen;
            }
          }
          return null;
        });
      }
    });

    aiTutorService.getAiStatus().then((st) => {
      if (!cancelled && st) setAiStatus(st);
    });

    const syncModes = () => {
      const nextModes = aiTutorService.getModes();
      setModes(nextModes);
      setCurrentMode(prev => (nextModes.some(m => m.id === prev) ? prev : (nextModes[0]?.id || 'tutor')));
    };
    window.addEventListener('hola-ai-settings-updated', syncModes);
    window.addEventListener('storage', syncModes);
    return () => {
      cancelled = true;
      window.removeEventListener('hola-ai-settings-updated', syncModes);
      window.removeEventListener('storage', syncModes);
    };
  }, [activeUserKey, accessToken, location.state?.sessionId]);

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    setIsConfiguringKey(true);
    try {
      const res = await aiTutorService.configureApiKey(apiKeyInput.trim());
      showToast(res?.message || (isEn ? 'OpenAI API Key saved!' : 'Đã lưu cấu hình OpenAI API Key!'));
      const newStatus = await aiTutorService.getAiStatus();
      setAiStatus(newStatus);
      setShowKeyModal(false);
      setApiKeyInput('');
      audioFeedback.playSuccessChime();
    } catch (err) {
      showToast(err.message || (isEn ? 'Error configuring API Key. Please try again!' : 'Lỗi cấu hình API Key. Vui lòng thử lại!'));
    } finally {
      setIsConfiguringKey(false);
    }
  };

  // Scroll to bottom of chat messages container ONLY (without scrolling the page window)
  useEffect(() => {
    if (!chatContainerRef.current) return;
    if (isFirstRender.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      isFirstRender.current = false;
    } else {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [currentSession?.messages, isSending]);

  // Setup Web Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        audioFeedback.playTap();
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSelectSession = (id) => {
    audioFeedback.playTap();
    aiTutorService.setActiveSessionId(id);
    setActiveSessionId(id);
    const session = aiTutorService.getSession(id);
    setCurrentSession(session);
    if (session?.mode) {
      setCurrentMode(session.mode);
    }
  };

  const handleCreateNewChat = (modeToUse = currentMode) => {
    audioFeedback.playSuccessChime();
    const newSession = aiTutorService.createSession(modeToUse);
    setSessions(aiTutorService.getAllSessions());
    setActiveSessionId(newSession.id);
    setCurrentSession(newSession);
    setCurrentMode(newSession.mode);
    setHistoryKind(modeToUse);
    setSearchQuery('');
    setInputText('');
    showToast(
      isEn ? `Started new conversation in ${aiTutorService.getMode(modeToUse).nameEn || aiTutorService.getMode(modeToUse).name} mode!` : `Đã tạo phiên trò chuyện mới với chế độ ${aiTutorService.getMode(modeToUse).name}!`
    );
  };

  const handleSwitchMode = (modeId) => {
    if (modeId === currentMode || isSending) return;
    handleCreateNewChat(modeId);
  };

  const handleDeleteSession = async (e, id) => {
    e.stopPropagation();
    if (
      await confirm({
        title: bilingualLabel('Xóa cuộc trò chuyện?', 'Delete conversation?'),
        description: bilingualLabel('Lịch sử của phiên hội thoại này sẽ bị xóa vĩnh viễn.', 'History of this conversation will be permanently deleted.'),
        confirmLabel: bilingualLabel('Xóa cuộc trò chuyện', 'Delete conversation'),
      })
    ) {
      audioFeedback.playPopSound(0.8);
      const remaining = aiTutorService.deleteSession(id);
      setSessions(remaining);
      setActiveSessionId('');
      setCurrentSession(null);
  
      showToast(isEn ? 'Conversation deleted successfully.' : 'Đã xóa hội thoại thành công.');
    }
  };

  const handleStartRename = (e, session) => {
    e.stopPropagation();
    setEditingTitleId(session.id);
    setNewTitleInput(session.title);
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    if (newTitleInput.trim()) {
      const updated = aiTutorService.renameSession(id, newTitleInput);
      setSessions(aiTutorService.getAllSessions());
      if (currentSession?.id === id) {
        setCurrentSession(updated);
      }
      audioFeedback.playTap();
    }
    setEditingTitleId(null);
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isSending) return;

    let sessionToUse = currentSession;
    if (!sessionToUse) {
      sessionToUse = aiTutorService.createSession(currentMode);
      setCurrentSession(sessionToUse);
      setActiveSessionId(sessionToUse.id);
      setSessions(aiTutorService.getAllSessions());
    }

    audioFeedback.playTap();
    setIsSending(true);
    setInputText('');

    try {
      const { updatedSession } = await aiTutorService.sendMessage(
        sessionToUse.id,
        text,
        currentMode
      );
      setCurrentSession(updatedSession);
      setSessions(aiTutorService.getAllSessions());
      audioFeedback.playPopSound(1.2);
    } catch (error) {
      console.error(error);
      showToast(error?.message || (isEn ? 'Could not send message. Please check AI backend connection!' : 'Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối AI backend!'));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleSpeak = (msgId, text) => {
    if (!('speechSynthesis' in window)) {
      showToast(isEn ? 'Your browser does not support Speech Synthesis.' : 'Trình duyệt của bạn chưa hỗ trợ phát âm (Speech Synthesis).');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/#|\*|`|>|---/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = speechRate;

    utterance.onstart = () => {
      setSpeakingMessageId(msgId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
    showToast(isEn ? `Playing Vietnamese audio (${speechRate}x)...` : `Đang phát âm giọng đọc tiếng Việt (${speechRate}x)...`);
  };

  const handleCopy = (msgId, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(msgId);
    audioFeedback.playTap();
    showToast(isEn ? 'Copied content to clipboard!' : 'Đã sao chép nội dung vào khay nhớ tạm!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleVoiceInput = () => {
    if (!speechRecognitionRef.current) {
      showToast(isEn ? 'Your browser does not support voice recognition.' : 'Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói tiếng Việt.');
      return;
    }
    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechRecognitionRef.current.start();
      audioFeedback.playTap();
      showToast(isEn ? 'Listening... Please speak now!' : 'Đang lắng nghe... Hãy nói tiếng Việt!');
    }
  };

  const handleSaveWordToVocabulary = async (word, meaning) => {
    try {
      await vocabularyService.add({
        word: word.trim(),
        meaning: meaning.trim() || 'Học từ Hola AI',
        notes: `Chế độ AI: ${aiTutorService.getMode(currentMode).name}`,
      });
      audioFeedback.playSuccessChime();
      showToast(isEn ? `⭐ Saved "${word}" to Vocabulary Notebook (+5 XP)!` : `⭐ Đã lưu "${word}" vào Sổ từ vựng (+5 XP)!`);
    } catch (err) {
      showToast(`Lưu từ vựng: ${err.message || 'Thành công!'}`);
    }
  };

  const activeModeConfig = aiTutorService.getMode(currentMode);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const getTimestamp = (s) => {
        if (!s) return 0;
        const lastMsg = Array.isArray(s.messages) && s.messages.length > 0
          ? s.messages[s.messages.length - 1]
          : null;
        const rawDate = s.updatedAt || lastMsg?.timestamp || s.createdAt;
        const time = rawDate ? new Date(rawDate).getTime() : 0;
        return Number.isNaN(time) ? 0 : time;
      };
      return getTimestamp(b) - getTimestamp(a);
    });
  }, [sessions]);

  const filteredSessions = sortedSessions.filter((s) => {
    const title = [s.titleVi, s.titleEn, s.title].filter(Boolean).join(' ').toLowerCase();
    return (historyKind === 'all' || getAiSessionMode(s) === historyKind)
      && title.includes(searchQuery.trim().toLowerCase());
  });
  const historyOptions = [
    { id: 'all', label: isEn ? 'All conversations' : 'Tất cả hội thoại', description: isEn ? 'Browse Tutor and Coach conversations' : 'Xem hội thoại Tutor và Coach' },
    ...TUTOR_MODES.map(mode => ({
      id: mode.id,
      label: mode.id === 'tutor' ? 'AI Tutor' : (isEn ? (mode.nameEn || mode.name) : mode.name),
      description: isEn ? (mode.descriptionEn || mode.description) : mode.description,
    })),
    { id: 'coach', label: 'AI Coach', description: isEn ? 'Support for your lessons' : 'Hỗ trợ bài học của bạn' },
  ].map(option => ({ ...option, count: sessions.filter(session => option.id === 'all' || getAiSessionMode(session) === option.id).length }));
  const selectedHistoryOption = historyOptions.find(option => option.id === historyKind);

  return (
    <div className="ai-tutor-screen-root relative w-full min-h-[calc(100vh-80px)] overflow-hidden">
      {/* Subtle Heritage Dong Son Bronze Drum Background Watermark (4-6% opacity) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden select-none"
        aria-hidden="true"
      >
        <div
          className="w-[min(96vw,1000px)] h-[min(96vw,1000px)] sm:w-[920px] sm:h-[920px] lg:w-[1100px] lg:h-[1100px] aspect-square opacity-[0.05] bg-contain bg-center bg-no-repeat transform-gpu"
          style={{
            backgroundImage: `url('/design/dong-son-drum.webp')`,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-full px-0 py-6 space-y-6">
        {confirmationDialog}

        {/* Modal cấu hình OpenAI API Key */}
        <AnimatePresence>
          {showKeyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-3xl border border-[#DECBB4] p-6 shadow-2xl space-y-4 text-left"
              >
                <div className="flex items-center justify-between border-b border-[#DECBB4]/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-[#FFF9EE] border border-[#DECBB4] flex items-center justify-center text-base">
                      🤖
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-[#202124]"><BilingualText vi="Cấu hình OpenAI API" en="Configure OpenAI API" /></h3>
                      <p className="text-[11px] text-[#78685B]"><BilingualText vi="Kích hoạt LLM trực tiếp cho Hola AI" en="Enable direct LLM access for Hola AI" /></p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="text-stone-400 hover:text-stone-700 text-lg font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs text-[#78685B]">
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#DECBB4]/60 space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span><BilingualText vi="Trạng thái hiện tại:" en="Current status:" /></span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        aiStatus.isLiveCall ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {aiStatus.isLiveCall ? `🟢 Live ${aiStatus.provider || 'OpenAI'} · ${aiStatus.activeModel || 'gpt-5-mini'}` : 'Smart NLP Engine'}
                      </span>
                    </div>
                    {aiStatus.apiKeyMasked && (
                      <p className="text-[11px] text-stone-500 font-mono">
                        <BilingualText vi="Key đang dùng:" en="Active Key:" /> {aiStatus.apiKeyMasked}
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleSaveApiKey} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#202124] mb-1">
                        <BilingualText vi="Nhập OpenAI API Key mới:" en="Enter new OpenAI API Key:" />
                      </label>
                      <input
                        type="password"
                        placeholder="AIzaSy..."
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DECBB4] text-xs font-mono text-[#202124] focus:outline-none focus:border-[#DA251D]"
                      />
                      <p className="text-[10px] text-stone-400 mt-1">
                        <BilingualText
                          vi="Khóa API được lưu an toàn trong database backend và kiểm tra trực tiếp với OpenAI endpoint."
                          en="The API key is securely stored in the backend database and verified with OpenAI."
                        />
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowKeyModal(false)}
                        className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <BilingualText vi="Hủy" en="Cancel" />
                      </button>
                      <button
                        type="submit"
                        disabled={!apiKeyInput.trim() || isConfiguringKey}
                        className="px-4 py-2 rounded-xl bg-[#DA251D] hover:bg-[#89221E] text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        {isConfiguringKey ? <BilingualText vi="Đang kiểm tra..." en="Checking..." /> : <BilingualText vi="Lưu & Kích hoạt" en="Save & Activate" />}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      {/* Floating Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#431914] text-white text-xs font-bold shadow-xl border border-[#DECBB4]/40"
          >
            <Sparkles size={15} className="text-[#FFCD00] animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DECBB4]/60 pb-5">
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5E1D8] border border-[#E7B59D] text-[#DA251D] text-xs font-black uppercase tracking-wider">
            <Bot size={14} className="text-[#DA251D]" />
            <span><BilingualText vi="AI Speaking Partner • 7 Chế Độ Học" en="AI Speaking Partner • 7 Learning Modes" /></span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#202124] tracking-tight">
            Hola AI
          </h1>
          <p className="text-xs sm:text-sm text-[#78685B] max-w-2xl">
            <BilingualText vi="Luyện đàm thoại, giải đáp ngữ pháp, trau chuốt câu văn và học văn hóa 3 miền cùng Hola AI bản xứ 24/7." en="Practice conversation, master grammar, refine expression, and explore Vietnamese culture 24/7 with native Hola AI." />
          </p>
        </div>

        {/* Action Link to Scenarios Roleplay */}
        <div className="flex items-center gap-3">
          <Link
            to="/ai-scenarios"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFF9EE] border border-[#DECBB4] text-[#202124] hover:text-[#DA251D] text-xs font-bold shadow-2xs transition-all"
          >
            <Compass size={15} className="text-[#DA251D]" />
            <span><BilingualText vi="Kịch bản nhập vai tình huống" en="Roleplay Scenarios" /></span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Main 2-Column AI Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 2xl:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Left Sidebar (4 cols on lg ~ 30%): Chat History & Sessions */}
        <aside className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 bg-white/95 backdrop-blur-md rounded-3xl border border-[#DECBB4]/80 p-5 sm:p-6 shadow-sm space-y-4 text-left">
          {/* Top Button: New Chat */}
          <button
            type="button"
            onClick={() => handleCreateNewChat(currentMode)}
            className="w-full py-3 px-4 rounded-2xl bg-[var(--color-red)] hover:bg-[var(--color-red-hover)] text-white font-black text-xs shadow-[0_3px_0_#9A3412] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} />
            <span><BilingualText vi="Cuộc trò chuyện mới" en="New conversation" /></span>
          </button>

          {/* Search Bar for Sessions */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78685B]"
            />
            <input
              type="text"
              placeholder={bilingualLabel("Tìm kiếm hội thoại...", "Search conversations...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DECBB4]/70 text-xs text-[#202124] placeholder:text-[#78685B]/60 focus:outline-none focus:border-[#DA251D] transition-colors"
            />
          </div>

          {/* Sessions List Header */}
          <div className="flex items-center justify-between text-[11px] font-bold text-[#78685B] px-1 pt-1">
            <span className="uppercase tracking-wider"><BilingualText vi="Lịch sử hội thoại" en="Conversation History" /></span>
            <span className="bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#DECBB4]/60">
              {sessions.length} <BilingualText vi="phiên" en={sessions.length === 1 ? "session" : "sessions"} />
            </span>
          </div>

          <div
            className={`tutor-mode-select-wrap conversation-history-select ${isHistoryMenuOpen ? 'is-open' : ''}`}
            ref={historyMenuRef}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setIsHistoryMenuOpen(false);
            }}
          >
            <button type="button" className="tutor-mode-select-trigger" aria-expanded={isHistoryMenuOpen} aria-controls="conversation-history-options" onClick={() => setIsHistoryMenuOpen(open => !open)}>
              <span className="tutor-mode-select-current">{selectedHistoryOption.label} · {selectedHistoryOption.count}</span>
              <ChevronDown className="tutor-mode-select-chevron" size={16} aria-hidden="true" />
            </button>
            {isHistoryMenuOpen && (
              <div className="tutor-mode-menu" id="conversation-history-options" role="group" aria-label={isEn ? 'Conversation type' : 'Loại hội thoại'}>
                {historyOptions.map(option => (
                  <button key={option.id} type="button" className={`tutor-mode-option ${historyKind === option.id ? 'is-active' : ''}`} aria-pressed={historyKind === option.id} onClick={() => {
                    setHistoryKind(option.id);
                    setIsHistoryMenuOpen(false);
                    historyMenuRef.current?.querySelector('button')?.focus();
                  }}>
                    <span className="tutor-mode-option-copy">
                      <span className="tutor-mode-option-name">{option.label} · {option.count}</span>
                      <span className="tutor-mode-option-description">{option.description}</span>
                    </span>
                    {historyKind === option.id && <Check size={15} strokeWidth={3} aria-hidden="true" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="conversation-kind-help">
            {selectedHistoryOption.description}
          </p>

          {/* Session Cards Stream */}
          <div className="space-y-2 max-h-[calc(100vh-360px)] overflow-y-auto pr-1">
            {filteredSessions.length === 0 && (
              <p className="conversation-kind-help" role="status">
                {isEn ? 'No matching conversations.' : 'Không có hội thoại phù hợp.'}
              </p>
            )}
            {filteredSessions.map((s) => {
              const sessionKind = getAiSessionKind(s);
              const isActive = s.id === activeSessionId;
              const isEditing = editingTitleId === s.id;
              const rawDate = s.updatedAt || s.createdAt;
              const sessionDate = rawDate ? new Date(rawDate) : new Date();
              const validSessionDate = Number.isNaN(sessionDate.getTime()) ? new Date() : sessionDate;
              const dateText = validSessionDate.toLocaleDateString(isEn ? 'en-US' : 'vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
              const timeText = validSessionDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectSession(s.id)}
                  style={{ padding: '10px 12px' }}
                  className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-[#FFF9EE] border-2 border-[#DA251D] shadow-xs'
                      : 'bg-[#FAF8F5] border-[#DECBB4]/60 hover:border-[#DA251D]/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1" style={{ minWidth: 0, flex: 1 }}>
                    <div className="min-w-0 flex-1" style={{ minWidth: 0, flex: 1 }}>
                      <span className={`session-kind-badge session-kind-badge--${sessionKind}`}>
                        {historyOptions.find(option => option.id === getAiSessionMode(s))?.label || 'AI Tutor'}
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={newTitleInput}
                          onChange={(e) => setNewTitleInput(e.target.value)}
                          onBlur={(e) => handleSaveRename(e, s.id)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && handleSaveRename(e, s.id)
                          }
                          autoFocus
                          className="px-2 py-0.5 text-xs font-bold bg-white border border-[#DA251D] rounded-md focus:outline-none w-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <h4 className="text-xs font-bold text-[#202124] truncate">
                          {isEn
                            ? (s.titleEn || (s.title?.startsWith('Hội thoại AI') ? s.title.replace('Hội thoại AI', 'AI Chat') : (s.title?.startsWith('Hội thoại mới') ? s.title.replace('Hội thoại mới', 'New Chat') : (s.title || s.titleVi))))
                            : (s.titleVi || s.title)}
                        </h4>
                      )}
                      <div className="session-card__meta">
                        <span className="session-card__messages">
                          <BilingualText vi={`${s.messages?.length || 0} tin nhắn`} en={`${s.messages?.length || 0} messages`} />
                        </span>
                        <span
                          className="session-card__date"
                          title={isEn ? `Conversation date: ${dateText} • ${timeText}` : `Ngày hội thoại: ${dateText} • ${timeText}`}
                        >
                          {dateText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Rename & Delete */}
                  <div className="session-card__actions">
                    <button
                      type="button"
                      onClick={(e) => handleStartRename(e, s)}
                      className="p-1.5 rounded-lg text-[#78685B] hover:text-[#202124] hover:bg-white transition-colors"
                      style={{
                        width: '26px',
                        height: '26px',
                        minHeight: '26px',
                        minWidth: '26px',
                        padding: 0,
                        borderRadius: '7px',
                        background: '#FFFFFF',
                        border: '1px solid #E5D7C5',
                        color: '#78685B',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 2px rgba(67,25,20,0.04)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FFF5EB';
                        e.currentTarget.style.borderColor = '#F59E0B';
                        e.currentTarget.style.color = '#D97706';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#E5D7C5';
                        e.currentTarget.style.color = '#78685B';
                      }}
                      title={isEn ? "Rename conversation" : "Đổi tên hội thoại"}
                    >
                      <Edit3 size={13} />
                    </button>
                    {sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSession(e, s.id)}
                        className="p-1.5 rounded-lg text-[#78685B] hover:text-red-600 hover:bg-red-50 transition-colors"
                        style={{
                          width: '26px',
                          height: '26px',
                          minHeight: '26px',
                          minWidth: '26px',
                          padding: 0,
                          borderRadius: '7px',
                          background: '#FFFFFF',
                          border: '1px solid #E5D7C5',
                          color: '#78685B',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 2px rgba(67,25,20,0.04)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#FEF2F2';
                          e.currentTarget.style.borderColor = '#FECACA';
                          e.currentTarget.style.color = '#DC2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FFFFFF';
                          e.currentTarget.style.borderColor = '#E5D7C5';
                          e.currentTarget.style.color = '#78685B';
                        }}
                        title={isEn ? "Delete conversation" : "Xóa hội thoại"}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Main Column (8 cols on lg ~ 70%): Studio Chat Console */}
        <main className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 bg-white/95 backdrop-blur-md rounded-3xl border border-[#DECBB4]/80 shadow-[0_10px_30px_rgba(67,25,20,0.04)] overflow-hidden flex flex-col min-h-[720px] text-left">
          {/* Top Console Bar with Mode Info & Speed Toggle */}
          <div className="p-4 sm:p-5 border-b border-[#DECBB4]/60 bg-gradient-to-r from-[#FFF9EE] via-white to-[#FFF9EE] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Mode Info & Heading */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-[#202124]">
                    Hola AI
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
                    style={{
                      background: activeModeConfig.bg,
                      color: activeModeConfig.color,
                    }}
                  >
                    {isEn ? (activeModeConfig.badgeEn || activeModeConfig.badge) : activeModeConfig.badge}
                  </span>
                </div>
                <p className="text-xs text-[#78685B] leading-tight mt-1">
                  {(isEn ? (activeModeConfig.titleEn || activeModeConfig.title) : activeModeConfig.title)} — {(isEn ? (activeModeConfig.descriptionEn || activeModeConfig.description) : activeModeConfig.description)}
                </p>
              </div>

              {/* Speed Controller */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    const newRate = speechRate === 0.95 ? 0.65 : 0.95;
                    setSpeechRate(newRate);
                    audioFeedback.playTap();
                    showToast(isEn ? `Speech speed: ${newRate}x` : `Tốc độ phát âm: ${newRate}x`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#DECBB4] text-[#78685B] hover:text-[#202124] text-xs font-bold hover:bg-[#FFF9EE] transition-colors shadow-2xs cursor-pointer"
                  title={isEn ? "Toggle speech speed (1.0x Normal / 0.65x Slow)" : "Chuyển đổi tốc độ phát âm (1.0x Chuẩn / 0.65x Chậm)"}
                >
                  <BilingualText
                    vi={speechRate === 0.95 ? "Tốc độ: 1.0x (Chuẩn)" : "Tốc độ: 0.65x (Chậm)"}
                    en={speechRate === 0.95 ? "Speed: 1.0x (Normal)" : "Speed: 0.65x (Slow)"}
                  />
                </button>
              </div>
            </div>

            {/* Compact mode dropdown */}
            <div className="tutor-mode-select-row">
              <span className="tutor-mode-select-label" id="tutor-mode-select-label">
                <BilingualText vi="Chế độ học" en="Learning mode" />
              </span>
              <div className={`tutor-mode-select-wrap ${isModeMenuOpen ? 'is-open' : ''}`} ref={modeMenuRef}>
                <button
                  type="button"
                  id="tutor-mode-select"
                  disabled={isSending}
                  className="tutor-mode-select-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={isModeMenuOpen}
                  aria-labelledby="tutor-mode-select-label tutor-mode-select"
                  onClick={() => setIsModeMenuOpen((open) => !open)}
                >
                  <span className="tutor-mode-select-current">{isEn ? (activeModeConfig.nameEn || activeModeConfig.name) : activeModeConfig.name}</span>
                  <ChevronDown className="tutor-mode-select-chevron" size={16} strokeWidth={2.2} aria-hidden="true" />
                </button>
                <AnimatePresence>
                  {isModeMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.98 }}
                      transition={{ duration: 0.14 }}
                      className="tutor-mode-menu"
                      role="listbox"
                      aria-label={isEn ? "Select Hola AI mode" : "Chọn chế độ Hola AI"}
                    >
                      {modes.map((mode) => {
                        const isActive = mode.id === currentMode;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={`tutor-mode-option ${isActive ? 'is-active' : ''}`}
                            onClick={() => {
                              handleSwitchMode(mode.id);
                              setIsModeMenuOpen(false);
                            }}
                          >
                            <span className="tutor-mode-option-copy">
                              <span className="tutor-mode-option-name">{isEn ? (mode.nameEn || mode.name) : mode.name}</span>
                              <span className="tutor-mode-option-description">{isEn ? (mode.descriptionEn || mode.description) : mode.description}</span>
                            </span>
                            {isActive && <Check size={15} strokeWidth={3} aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className="tutor-mode-select-description">
                {isEn ? (activeModeConfig.descriptionEn || activeModeConfig.description) : activeModeConfig.description}
              </span>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div
            ref={chatContainerRef}
            className={`flex-1 p-6 sm:p-8 bg-gradient-to-b from-[#FAF8F5]/40 via-white to-[#FAF8F5]/40 ${
              currentSession
                ? 'overflow-y-auto space-y-6 min-h-[480px] max-h-[calc(100vh-320px)]'
                : 'flex items-center justify-center min-h-0'
            }`}
          >
            {!currentSession ? (
              <div className="w-full flex flex-col items-center justify-center text-center px-6 py-16">
                <h2 className="text-xl font-black text-[#202124] mb-2">
                  <BilingualText vi="Chọn một cuộc trò chuyện để bắt đầu" en="Select a conversation to get started" />
                </h2>
                <p className="max-w-md text-sm text-[#78685B] leading-relaxed mb-5">
                  <BilingualText
                    vi="Chọn một phiên trong lịch sử bên trái hoặc tạo cuộc trò chuyện mới để luyện tiếng Việt cùng Hola AI."
                    en="Choose a session from the history on the left or start a new conversation to practice Vietnamese with Hola AI."
                  />
                </p>
                <button
                  type="button"
                  onClick={() => handleCreateNewChat(currentMode)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--color-red)] hover:bg-[var(--color-red-hover)] text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                >
                  <Plus size={15} strokeWidth={3} />
                  <BilingualText vi="Cuộc trò chuyện mới" en="New conversation" />
                </button>
              </div>
            ) : currentSession.messages?.map((msg) => {
              const isAi = msg.sender === 'ai';
              const isSpeaking = speakingMessageId === msg.id;
              const isCopied = copiedId === msg.id;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-3 ${
                    isAi ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {/* Left AI Avatar */}
                  {isAi && (
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#fff7ed] border-[1.5px] border-[#fed7aa] p-0.5 shadow-xs flex items-center justify-center mt-1">
                      <TutorMascotAvatar state={isSpeaking ? 'speaking' : 'idle'} size="tiny" className="nghe-tutor-avatar--face" />
                    </div>
                  )}

                  {/* Message Bubble Card */}
                  <div
                    className={`flex flex-col ${
                      isAi
                        ? 'items-start max-w-[85%] sm:max-w-[78%] xl:max-w-[72%]'
                        : 'ai-tutor-user-message-container items-end'
                    }`}
                  >
                    <div
                      className={`ai-tutor-message leading-relaxed ${
                      isAi
                        ? 'ai-tutor-message--ai bg-[#ecfdf5] border border-[rgba(213,221,203,0.85)] text-[#1e293b] rounded-2xl rounded-tl-sm p-3.5 sm:p-4 text-xs sm:text-sm shadow-xs'
                        : 'ai-tutor-message--user bg-[#ea580c] text-white rounded-2xl rounded-tr-sm p-2.5 sm:p-3 px-3.5 sm:px-4 text-xs sm:text-sm font-medium shadow-md'
                    }`}
                  >
                    {false && (
                      <div className="ai-tutor-message__label hidden" style={{ display: 'none' }}>
                        <Sparkles size={12} aria-hidden="true" />
                        <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>Hola AI</span>
                        <span className="ai-tutor-message__dot" aria-hidden="true" />
                        <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}><BilingualText vi="Trợ giảng tiếng Việt" en="Vietnamese Tutor" /></span>
                      </div>
                    )}

                    {/* Message Body with rich Markdown formatting */}
                    <FormattedMessageText text={msg.text} isAi={isAi} />

                    {/* Grammar Correction Badge */}
                    {isAi && (msg.grammarCorrection || msg.grammarCheck?.explanation) && (
                      <div className="mt-3 p-3 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs space-y-1 shadow-2xs">
                        <div className="flex items-center gap-1.5 font-bold text-amber-800">
                          <Edit3 size={13} className="text-amber-600 shrink-0" />
                          <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}><BilingualText vi="Nhận xét & Sửa lỗi ngữ pháp:" en="Grammar Feedback & Corrections:" /></span>
                        </div>
                        <p className="text-amber-900/90 leading-relaxed">
                          {msg.grammarCorrection || msg.grammarCheck?.explanation}
                        </p>
                      </div>
                    )}

                    {/* Native Phrasing Alternative */}
                    {isAi && (msg.nativeAlternative || (msg.grammarCheck?.corrected && msg.grammarCheck.corrected !== msg.grammarCheck.original)) && (
                      <div className="mt-2.5 p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 text-emerald-950 text-xs space-y-1 shadow-2xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                          <Sparkles size={13} className="text-emerald-600 shrink-0" />
                          <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}><BilingualText vi="Cách diễn đạt tự nhiên hơn của người bản xứ:" en="More natural native phrasing:" /></span>
                        </div>
                        <p className="font-semibold text-emerald-900 leading-relaxed italic">
                          "{msg.nativeAlternative || msg.grammarCheck?.corrected}"
                        </p>
                      </div>
                    )}

                    {/* Cultural Nuance Note */}
                    {isAi && msg.culturalNote && (
                      <div className="mt-2.5 p-3 rounded-2xl bg-[#FFF9EE] border border-[#DECBB4] text-[#431914] text-xs space-y-1 shadow-2xs">
                        <div className="flex items-center gap-1.5 font-bold text-[#DA251D]">
                          
                          <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}><BilingualText vi="Lưu ý văn hóa & Ngữ cảnh ứng xử:" en="Cultural nuance & social context:" /></span>
                        </div>
                        <p className="text-[#431914]/90 leading-relaxed">
                          {msg.culturalNote}
                        </p>
                      </div>
                    )}

                    {/* Translation Reference */}
                    {isAi && msg.translation && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start gap-2">
                        <Globe size={13} className="text-sky-600 mt-0.5 shrink-0" />
                        <span className="italic leading-relaxed">{msg.translation}</span>
                      </div>
                    )}

                    {/* Useful Vocabulary Cards extracted from message */}
                    {msg.savedWords && msg.savedWords.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#DECBB4]/40 space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-[#DA251D]">
                          <BookOpen size={13} />
                          <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}><BilingualText vi="Từ vựng hữu ích gợi ý:" en="Suggested useful vocabulary:" /></span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.savedWords.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                handleSaveWordToVocabulary(item.word, item.meaning)
                              }
                              className="px-2.5 py-1 rounded-xl bg-[#FFF9EE] hover:bg-[#F5E1D8] border border-[#DECBB4] text-[#431914] text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer group/vocab"
                              title={isEn ? `Save "${item.word}" to vocabulary notebook` : `Lưu từ "${item.word}" vào sổ từ vựng`}
                            >
                              <BookmarkPlus
                                size={12}
                                className="text-[#DA251D] group-hover/vocab:scale-115 transition-transform"
                              />
                              <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                                <strong>{item.word}</strong>: {item.meaning}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    </div>

                    {/* Action Bar for AI Messages - minimalist inline links like AI Coach */}
                    {isAi && (
                      <div className="ai-coach-coursera__msg-actions flex items-center gap-3.5 mt-1.5 ml-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, getDisplayMessageText(msg.text))}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-orange-600 transition-colors bg-transparent hover:!bg-transparent focus:!bg-transparent border-0 cursor-pointer p-0 shadow-none hover:!shadow-none"
                          title={isEn ? "Copy message" : "Sao chép nội dung"}
                        >
                          {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          <span>{isCopied ? bilingualLabel('Đã chép', 'Copied') : bilingualLabel('Sao chép', 'Copy')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSpeak(msg.id, getDisplayMessageText(msg.text))}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors bg-transparent hover:!bg-transparent focus:!bg-transparent border-0 cursor-pointer p-0 shadow-none hover:!shadow-none ${isSpeaking ? 'text-orange-600 font-bold' : 'text-stone-500 hover:text-orange-600'}`}
                          title={isSpeaking ? bilingualLabel('Dừng phát âm', 'Stop speech') : bilingualLabel('Nghe phát âm', 'Listen')}
                        >
                          {isSpeaking ? <VolumeX size={12} className="text-orange-600 animate-pulse" /> : <Volume2 size={12} />}
                          <span>{isSpeaking ? bilingualLabel('Dừng', 'Stop') : bilingualLabel('Nghe', 'Listen')}</span>
                        </button>
                      </div>
                    )}
                    {false && (
                      <div className="mt-3 pt-2.5 border-t border-[#DECBB4]/40 flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-2">
                          {/* Speak Button */}
                          <button
                            type="button"
                            onClick={() => handleSpeak(msg.id, getDisplayMessageText(msg.text))}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              isSpeaking
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-[#FAF8F5] hover:bg-[#F5E1D8] text-[#DA251D] border border-[#DECBB4]/60'
                            }`}
                            title={isSpeaking ? bilingualLabel('Dừng phát âm', 'Stop speech') : bilingualLabel('Nghe giọng đọc tiếng Việt', 'Listen to Vietnamese speech')}
                          >
                            <Volume2
                              size={13}
                              className={isSpeaking ? 'animate-pulse' : ''}
                            />
                            <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{isSpeaking ? <BilingualText vi="Đang đọc..." en="Reading..." /> : <BilingualText vi="Nghe phát âm" en="Listen" />}</span>
                          </button>

                          {/* Sound wave bars animation while speaking */}
                          {isSpeaking && (
                            <div className="flex items-center gap-0.5 h-4 px-1.5 bg-amber-50 rounded-md">
                              {[40, 90, 60, 100, 50].map((h, i) => (
                                <motion.span
                                  key={i}
                                  animate={{
                                    height: [`${h}%`, `${Math.max(20, 105 - h)}%`, `${h}%`],
                                  }}
                                  transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    delay: i * 0.1,
                                  }}
                                  className="w-1 bg-[#DA251D] rounded-full"
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Copy Button */}
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, getDisplayMessageText(msg.text))}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[#78685B] hover:text-[#202124] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                          title={isEn ? "Copy message" : "Sao chép nội dung tin nhắn"}
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} className="text-emerald-600" />
                              <span className="text-emerald-600 font-bold"><BilingualText vi="Đã chép" en="Copied" /></span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}><BilingualText vi="Sao chép" en="Copy" /></span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>


                  {false && (
                    <div className="w-9 h-9 rounded-xl bg-[#431914] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      <User size={16} />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Sending Thinking Animation */}
            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-[#fff7ed] border-[1.5px] border-[#fed7aa] p-0.5 shadow-xs flex items-center justify-center mt-1">
                  <TutorMascotAvatar state="thinking" size="tiny" className="nghe-tutor-avatar--face" />
                </div>
                <div className="p-3 px-4 rounded-2xl rounded-tl-sm bg-[#ecfdf5] border border-[rgba(213,221,203,0.85)] shadow-xs flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-stone-600">
                    <BilingualText vi="Hola AI đang suy nghĩ..." en="Hola AI is thinking..." />
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Prompts Chips Carousel */}
          <div className="p-3 bg-[#FAF8F5] border-t border-[#DECBB4]/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-black uppercase text-[#DA251D] shrink-0 pl-1">
              <span><BilingualText vi="Gợi ý:" en="Suggestions:" /></span>
            </span>
            {((isEn && activeModeConfig.quickPromptsEn) ? activeModeConfig.quickPromptsEn : activeModeConfig.quickPrompts).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isSending}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF9EE] border border-[#DECBB4]/70 hover:border-[#DA251D] text-xs font-semibold text-[#202124] shrink-0 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Area Bar */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 bg-white border-t border-[#DECBB4]/60 flex items-center gap-3 sm:gap-4">
            {/* Voice Input Mic Button */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              disabled={isSending}
              className={`h-10 w-10 min-h-0 p-0 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200'
                  : 'bg-[#FAF8F5] hover:bg-[#F5E1D8] text-[#DA251D] border border-[#DECBB4]'
              }`}
              title={
                isListening
                  ? bilingualLabel('Đang lắng nghe... Bấm để dừng', 'Listening... Click to stop')
                  : bilingualLabel('Nói tiếng Việt qua Micro', 'Speak Vietnamese via Microphone')
              }
              aria-label={bilingualLabel("Thu âm giọng nói tiếng Việt", "Record Vietnamese voice")}
            >
              {isListening ? (
                <MicOff size={18} strokeWidth={2.5} />
              ) : (
                <Mic size={18} strokeWidth={2.5} />
              )}
            </button>

            {/* Input Textarea */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isEn ? (activeModeConfig.placeholderEn || activeModeConfig.placeholder) : activeModeConfig.placeholder}
              rows={1}
              disabled={isSending || !currentSession}
              className="h-10 min-h-0 max-h-10 flex-1 py-2 px-4 rounded-xl bg-[#FAF8F5] border border-[#DECBB4]/80 text-xs sm:text-sm text-[#202124] placeholder:text-[#78685B]/60 focus:outline-none focus:border-[#DA251D] focus:bg-white resize-none transition-all"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isSending || !currentSession}
              className={`h-10 w-10 min-h-0 p-0 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                inputText.trim() && !isSending && currentSession
                  ? 'bg-[#DA251D] hover:bg-[#89221E] text-white shadow-[0_3px_0_#89221E] active:translate-y-0.5 active:shadow-none'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
              title={bilingualLabel("Gửi tin nhắn (Enter)", "Send message (Enter)")}
              aria-label={bilingualLabel("Gửi tin nhắn", "Send message")}
            >
              <Send size={18} strokeWidth={2.5} />
            </button>
          </form>
        </main>
      </div>
    </div>
  </div>
  );
}
