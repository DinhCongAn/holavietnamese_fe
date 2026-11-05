import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Volume2,
  Square,
  Bell,
  Check,
  CheckCircle2,
  Sparkles,
  Clock,
  Languages,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Flame,
  Info,
} from 'lucide-react';
import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { learnerService } from '@/features/learning/api/learnerService';
import {
  DEFAULT_USER_SETTINGS,
  getStoredSettings,
  saveStoredSettings,
  playAudioSpeedSample,
  playToneSample,
  stopSpeechSample,
  sendTestNotification,
} from '@/features/account/services/userSettingsService';

const VIETNAMESE_TONES_GUIDE = [
  {
    id: 'ngang',
    nameVi: 'Thanh Ngang (Không dấu)',
    nameEn: 'Level Tone (Flat)',
    sampleWord: 'ba',
    symbol: '—',
    pitch: 'Bình thường, cao độ đều',
    mouthGuideVi: 'Miệng mở tự nhiên, lưỡi thả lỏng bằng phẳng, hơi thở đều đặn và không đổi cao độ.',
    mouthGuideEn: 'Open mouth naturally, tongue relaxed flat, steady breath without pitch variation.',
  },
  {
    id: 'huyen',
    nameVi: 'Thanh Huyền (Dấu \\)',
    nameEn: 'Falling Tone',
    sampleWord: 'bà',
    symbol: '\\',
    pitch: 'Trầm, hạ thấp dần',
    mouthGuideVi: 'Hạ nhẹ cằm, thả lỏng vòm họng, phát âm trầm và buông hơi trôi xuống êm dịu.',
    mouthGuideEn: 'Slightly lower chin, relax throat, pronounce in a low gentle descending pitch.',
  },
  {
    id: 'sac',
    nameVi: 'Thanh Sắc (Dấu /)',
    nameEn: 'Sharp Rising Tone',
    sampleWord: 'bá',
    symbol: '/',
    pitch: 'Vút cao, dứt khoát',
    mouthGuideVi: 'Hơi căng cơ họng, nâng cao giọng nhanh từ trung bình lên cao, âm vang và dứt khoát.',
    mouthGuideEn: 'Tighten throat muscles slightly, pitch rises swiftly from mid to high, clear and crisp.',
  },
  {
    id: 'hoi',
    nameVi: 'Thanh Hỏi (Dấu ?)',
    nameEn: 'Dipping Tone',
    sampleWord: 'bả',
    symbol: '?',
    pitch: 'Hạ sâu rồi uốn nhẹ lên',
    mouthGuideVi: 'Bắt đầu ở mức thấp, hạ giọng sâu xuống rồi uốn cong ngược nhẹ lên như dấu hỏi.',
    mouthGuideEn: 'Start low, dip deeper into the vocal range, then curve slightly upward.',
  },
  {
    id: 'nga',
    nameVi: 'Thanh Ngã (Dấu ~)',
    nameEn: 'High Broken Tone',
    sampleWord: 'bã',
    symbol: '~',
    pitch: 'Cao, ngắt giữa chừng',
    mouthGuideVi: 'Lên giọng cao, khép nắp thanh quản ngắt hơi đột ngột ở giữa rồi bung hơi ngân tiếp.',
    mouthGuideEn: 'High pitch, glottal stop breaks the airflow briefly in the middle before continuing.',
  },
  {
    id: 'nang',
    nameVi: 'Thanh Nặng (Dấu .)',
    nameEn: 'Heavy Drop Tone',
    sampleWord: 'bạ',
    symbol: '•',
    pitch: 'Rơi thẳng xuống đáy, cụt ngắn',
    mouthGuideVi: 'Giọng tụt xuống thấp nhất, siết chặt thanh môn ngắt âm lập tức, dứt khoát và ngắn gọn.',
    mouthGuideEn: 'Pitch plunges directly to the bottom, glottis closes tightly to cut off the sound abruptly.',
  },
];

export function SettingsPage() {
  useTextLanguage();
  const [form, setForm] = useState(null);
  const [state, setState] = useState({ loading: true, saving: false, error: '', message: '' });
  const [isPlayingAudioSample, setIsPlayingAudioSample] = useState(false);
  const [activeTonePlaying, setActiveTonePlaying] = useState(null);
  const [showToneGuide, setShowToneGuide] = useState(false);
  const [autoSavedTime, setAutoSavedTime] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported';
  });

  const autoSaveTimerRef = useRef(null);

  // Load remote settings and merge with local storage
  const load = useCallback(async () => {
    const local = getStoredSettings();
    try {
      const remote = await learnerService.getSettings();
      const merged = { ...DEFAULT_USER_SETTINGS, ...local, ...remote };
      setForm(merged);
      saveStoredSettings(merged);
    } catch {
      // Fallback to local settings
      setForm({ ...DEFAULT_USER_SETTINGS, ...local });
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    load();
    return () => {
      stopSpeechSample();
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [load]);

  // Save changes to backend and localStorage
  const persistChanges = useCallback(async (nextForm, isManual = false) => {
    saveStoredSettings(nextForm);

    if (isManual) {
      setState((s) => ({ ...s, saving: true, error: '', message: '' }));
    }

    try {
      await learnerService.updateSettings(nextForm);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setAutoSavedTime(timeStr);

      if (isManual) {
        setState((s) => ({
          ...s,
          saving: false,
          error: '',
          message: 'Đã lưu thiết lập thành công!',
        }));
        toast.success('Đã lưu thiết lập thành công!');
      }
    } catch (err) {
      console.warn('Backend settings update sync note:', err.message);
      if (isManual) {
        setState((s) => ({ ...s, saving: false, error: err.message || 'Không thể đồng bộ với máy chủ.' }));
        toast.error('Không thể lưu lên máy chủ: ' + (err.message || 'Lỗi mạng'));
      }
    }
  }, []);

  // Handle setting updates with auto-save
  const updateField = (key, value) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      saveStoredSettings(updated);

      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        persistChanges(updated, false);
      }, 500);

      return updated;
    });
  };

  const toggleField = (key) => {
    updateField(key, !form[key]);
  };

  // Play speed sample audio
  const handleTestAudioSpeed = () => {
    if (isPlayingAudioSample) {
      stopSpeechSample();
      setIsPlayingAudioSample(false);
      return;
    }

    setIsPlayingAudioSample(true);
    const text = `Xin chào! Bạn đang nghe ở tốc độ ${form.audioSpeed || 1}x trên HolaVietnamese.`;
    playAudioSpeedSample(form.audioSpeed || 1, text, () => {
      setIsPlayingAudioSample(false);
    });
  };

  // Play tone sample audio
  const handlePlayToneSample = (tone) => {
    if (activeTonePlaying === tone.id) {
      stopSpeechSample();
      setActiveTonePlaying(null);
      return;
    }

    setActiveTonePlaying(tone.id);
    playToneSample(tone.sampleWord, form.audioSpeed || 1, () => {
      setActiveTonePlaying(null);
    });
  };

  // Test streak notification
  const handleTestNotification = async () => {
    const result = await sendTestNotification();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationStatus(Notification.permission);
    }

    if (result.success) {
      toast.success(result.message, {
        description: 'Nhắc nhở học bài trước 21h hàng ngày để bảo vệ chuỗi Streak!',
      });
    } else {
      toast.info(result.message, {
        description: 'Bạn vẫn sẽ nhận được thông báo biểu tượng chuông trong ứng dụng.',
      });
    }
  };

  const handleManualSave = (e) => {
    e.preventDefault();
    persistChanges(form, true);
  };

  if (!form) {
    return (
      <div className="account-empty">
        <BilingualText>{state.error || 'Đang tải cài đặt…'}</BilingualText>
      </div>
    );
  }

  const dailyMinutes = form.dailyLearningGoalMinutes || 15;
  const weeklyHours = ((dailyMinutes * 7) / 60).toFixed(1);

  return (
    <div className="account-page">
      <div className="account-header">
        <span className="account-pill">
          <BilingualText vi="Tùy biến trải nghiệm" en="Customize Experience" />
        </span>
        <h1 className="account-title">
          <BilingualText vi="Cài đặt ứng dụng" en="App Settings" />
        </h1>
        <p className="account-desc">
          <BilingualText
            vi="Tùy chỉnh tốc độ bài học, tính năng trợ giảng và thông báo nhắc nhở hàng ngày."
            en="Customize lesson pace, interactive hints, and daily reminder notifications."
          />
        </p>
      </div>

      {state.error && (
        <div className="auth-message auth-message-error">
          <BilingualText>{state.error}</BilingualText>
        </div>
      )}
      {state.message && (
        <div className="auth-message auth-message-success">
          <BilingualText>{state.message}</BilingualText>
        </div>
      )}

      <form className="settings-list" onSubmit={handleManualSave}>
        {/* ========================================================
            1. TỐC ĐỘ PHÁT ÂM (AUDIO SPEED)
            ======================================================== */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-info">
              <b>
                <Volume2 size={18} className="text-[#ea580c]" />
                <BilingualText vi="Tốc độ phát âm (Audio Speed)" en="Audio Speed" />
              </b>
              <small>
                <BilingualText
                  vi="Điều chỉnh tốc độ đọc các đoạn hội thoại mẫu"
                  en="Adjust the playback speed of dialogue audio across all lessons"
                />
              </small>
            </div>
            <div className="settings-card-action">
              <select
                value={form.audioSpeed || 1}
                onChange={(e) => updateField('audioSpeed', Number(e.target.value))}
                aria-label={bilingualLabel("Tốc độ phát âm", "Audio Speed")}
              >
                <option value={0.75}>{bilingualLabel("0.75× Chậm rãi (Dễ nghe)", "0.75× Slow")}</option>
                <option value={0.85}>{bilingualLabel("0.85× Hơi chậm (Rõ thanh)", "0.85× Moderate")}</option>
                <option value={1}>{bilingualLabel("1.0× Bình thường (Chuẩn)", "1.0× Normal (Standard)")}</option>
                <option value={1.25}>{bilingualLabel("1.25× Nhanh tự nhiên", "1.25× Natural Fast")}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#f1f5f9]">
            <span className="text-xs text-[#64748b]">
              <BilingualText
                vi={`Tốc độ hiện tại: ${form.audioSpeed || 1}× · Áp dụng cho hội thoại bài học, bảng chữ cái và sổ từ vựng.`}
                en={`Current speed: ${form.audioSpeed || 1}× · Applied across dialogues, alphabet chart, and vocabulary.`}
              />
            </span>
            <button
              type="button"
              className={`settings-pill-btn ${isPlayingAudioSample ? 'active-pulse primary' : ''}`}
              onClick={handleTestAudioSpeed}
              title="Bấm để nghe thử tốc độ này"
            >
              {isPlayingAudioSample ? <Square size={13} /> : <Volume2 size={13} />}
              <span>{isPlayingAudioSample ? 'Dừng đọc' : `▶ Nghe thử (${form.audioSpeed || 1}×)`}</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            2. MỤC TIÊU THỜI GIAN MỖI NGÀY (DAILY LEARNING GOAL)
            ======================================================== */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-info">
              <b>
                <Clock size={18} className="text-[#ea580c]" />
                <BilingualText vi="Mục tiêu thời gian mỗi ngày" en="Daily Learning Goal" />
              </b>
              <small>
                <BilingualText
                  vi="Thời lượng học kỳ vọng để hệ thống thông báo nhắc nhở"
                  en="Target daily study duration for progress tracking and reminders"
                />
              </small>
            </div>
            <div className="settings-card-action">
              <select
                value={form.dailyLearningGoalMinutes || 15}
                onChange={(e) => updateField('dailyLearningGoalMinutes', Number(e.target.value))}
                aria-label={bilingualLabel("Mục tiêu thời gian mỗi ngày", "Daily Learning Goal")}
              >
                <option value={10}>{bilingualLabel("10 phút / ngày (Thư giãn)", "10 min / day (Casual)")}</option>
                <option value={15}>{bilingualLabel("15 phút / ngày (Tiêu chuẩn)", "15 min / day (Standard)")}</option>
                <option value={30}>{bilingualLabel("30 phút / ngày (Nghiêm túc)", "30 min / day (Dedicated)")}</option>
                <option value={45}>{bilingualLabel("45 phút / ngày (Cấp tốc)", "45 min / day (Intensive)")}</option>
              </select>
            </div>
          </div>

          <div className="settings-preview-panel">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-semibold text-[#1e293b]">
                🎯 <BilingualText vi={`Kế hoạch tuần: ~${weeklyHours} giờ học (${dailyMinutes * 7} phút)`} en={`Weekly target: ~${weeklyHours} hrs (${dailyMinutes * 7} mins)`} />
              </span>
              <span className="text-xs bg-[#ffedd5] text-[#c2410c] px-2.5 py-0.5 rounded-full font-bold">
                {dailyMinutes <= 15 ? 'Khuyên dùng cho người bận rộn' : 'Lộ trình bứt phá nhanh'}
              </span>
            </div>
            <p className="text-xs text-[#64748b] m-0">
              <BilingualText
                vi={`Hệ thống sẽ nhắc nhở và tối ưu các nhiệm vụ hàng ngày (Daily Quests) theo hạn mức ${dailyMinutes} phút này.`}
                en={`Daily quests and reminder notifications will calibrate to your ${dailyMinutes}-minute daily quota.`}
              />
            </p>
          </div>
        </div>

        {/* ========================================================
            3. GỢI Ý PHÁT ÂM & KHẨU HÌNH (PRONUNCIATION HINTS)
            ======================================================== */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-info">
              <b>
                <Sparkles size={18} className="text-[#ea580c]" />
                <BilingualText vi="Gợi ý phát âm & khẩu hình" en="Pronunciation & Mouth Shape Hints" />
              </b>
              <small>
                <BilingualText
                  vi="Hiển thị mẹo đặt lưỡi và lấy hơi cho 6 thanh điệu tiếng Việt"
                  en="Show tongue placement and breath tips for the 6 Vietnamese tones"
                />
              </small>
            </div>
            <div className="settings-card-action">
              <label className="hola-switch" aria-label="Bật gợi ý phát âm & khẩu hình">
                <input
                  type="checkbox"
                  checked={!!form.pronunciationHintsEnabled}
                  onChange={() => toggleField('pronunciationHintsEnabled')}
                />
                <span className="hola-switch-track">
                  <span className="hola-switch-thumb" />
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs font-semibold text-[#475569]">
              {form.pronunciationHintsEnabled ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <Check size={14} />
                  <BilingualText vi="Đang bật: Hiện mẹo đặt lưỡi và khẩu hình trong bài học" en="Active: Showing tongue & breath tips in lessons" />
                </span>
              ) : (
                <span className="text-stone-500">
                  <BilingualText vi="Đang tắt: Ẩn mẹo gợi ý khẩu hình" en="Inactive: Pronunciation tips hidden" />
                </span>
              )}
            </span>

            <button
              type="button"
              className="settings-pill-btn"
              onClick={() => setShowToneGuide((v) => !v)}
            >
              <BookOpen size={13} />
              <span>{showToneGuide ? 'Thu gọn cẩm nang' : '📖 Xem cẩm nang 6 thanh điệu'}</span>
              {showToneGuide ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>

          {/* Interactive Tone Guide Accordion */}
          {showToneGuide && (
            <div className="mt-2 pt-3 border-t border-[#f1f5f9]">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#1e293b]">
                <Info size={14} className="text-[#ea580c]" />
                <BilingualText
                  vi="Hướng dẫn vị trí đặt lưỡi & khẩu hình 6 thanh điệu tiếng Việt (Bấm để nghe âm mẫu):"
                  en="Guide to tongue placement & mouth shape for 6 Vietnamese tones (Click to listen):"
                />
              </div>

              <div className="settings-tones-grid">
                {VIETNAMESE_TONES_GUIDE.map((tone) => (
                  <div key={tone.id} className="settings-tone-item">
                    <div className="settings-tone-head">
                      <span className="settings-tone-name">
                        <BilingualText vi={tone.nameVi} en={tone.nameEn} />
                      </span>
                      <span className="settings-tone-symbol">{tone.symbol}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-[#c2410c]">{tone.pitch}</div>
                    <p className="settings-tone-guide m-0">
                      <BilingualText vi={tone.mouthGuideVi} en={tone.mouthGuideEn} />
                    </p>
                    <div className="pt-1 mt-auto">
                      <button
                        type="button"
                        className="settings-pill-btn text-[11px] py-1 px-2.5 w-full justify-center"
                        onClick={() => handlePlayToneSample(tone)}
                      >
                        <Volume2 size={12} />
                        <span>{activeTonePlaying === tone.id ? 'Đang phát...' : `Nghe mẫu: “${tone.sampleWord}”`}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            4. TỰ ĐỘNG DỊCH NGHĨA SONG NGỮ (AUTO TRANSLATE)
            ======================================================== */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-info">
              <b>
                <Languages size={18} className="text-[#ea580c]" />
                <BilingualText vi="Tự động dịch nghĩa song ngữ" en="Bilingual Auto-Translate" />
              </b>
              <small>
                <BilingualText
                  vi="Hiển thị nghĩa tiếng Anh bên dưới các cụm từ mới"
                  en="Show English translations underneath new Vietnamese phrases in dialogues and exercises"
                />
              </small>
            </div>
            <div className="settings-card-action">
              <label className="hola-switch" aria-label="Bật tự động dịch nghĩa song ngữ">
                <input
                  type="checkbox"
                  checked={!!form.autoTranslateEnabled}
                  onChange={() => toggleField('autoTranslateEnabled')}
                />
                <span className="hola-switch-track">
                  <span className="hola-switch-thumb" />
                </span>
              </label>
            </div>
          </div>

          <div className="settings-preview-panel">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1e293b]">
                {form.autoTranslateEnabled ? (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <Check size={13} />
                    <BilingualText vi="Chế độ Song ngữ Việt - Anh (Khuyên dùng)" en="Bilingual Mode (Recommended for beginners)" />
                  </span>
                ) : (
                  <span className="text-amber-800 flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <BilingualText vi="Chế độ Đắm chìm tiếng Việt (Immersion Mode)" en="Immersion Mode (Pure Vietnamese practice)" />
                  </span>
                )}
              </span>
              <span className="text-[11px] text-[#64748b]">Minh họa trực tiếp</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#e2e8f0] text-xs space-y-1">
              <div className="font-bold text-[#1e293b]">“Hôm nay thời tiết ở Hà Nội rất đẹp.”</div>
              {form.autoTranslateEnabled ? (
                <div className="text-[#64748b] italic text-[11.5px]">
                  Today the weather in Hanoi is very beautiful.
                </div>
              ) : (
                <div className="text-[#94a3b8] italic text-[11px]">
                  (Bản dịch tiếng Anh đang được ẩn để bạn luyện phản xạ hiểu tiếng Việt trực tiếp)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            5. THÔNG BÁO NHẮC NHỞ CHUỖI STREAK (NOTIFICATIONS)
            ======================================================== */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-info">
              <b>
                <Flame size={18} className="text-[#ea580c]" />
                <BilingualText vi="Thông báo nhắc nhở chuỗi Streak" en="Streak Reminder Notifications" />
              </b>
              <small>
                <BilingualText
                  vi="Nhắc bạn học bài trước 21h hàng ngày để không bị đứt chuỗi"
                  en="Remind you to complete a daily lesson before 9:00 PM to protect your learning streak"
                />
              </small>
            </div>
            <div className="settings-card-action">
              <label className="hola-switch" aria-label="Bật thông báo nhắc nhở chuỗi Streak">
                <input
                  type="checkbox"
                  checked={!!form.notificationsEnabled}
                  onChange={() => toggleField('notificationsEnabled')}
                />
                <span className="hola-switch-track">
                  <span className="hola-switch-thumb" />
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#f1f5f9]">
            <div className="text-xs text-[#64748b] flex items-center gap-2">
              <Bell size={13} className="text-[#ea580c]" />
              <span>
                {form.notificationsEnabled ? (
                  <BilingualText
                    vi="Đang bật · Thông báo gửi lúc 20:30 mỗi tối nếu chưa hoàn thành mục tiêu ngày."
                    en="Active · Notifications arrive at 8:30 PM if daily goal is not yet achieved."
                  />
                ) : (
                  <BilingualText vi="Đang tắt nhắc nhở chuỗi Streak." en="Streak reminders are currently disabled." />
                )}
              </span>
            </div>

            <button
              type="button"
              className="settings-pill-btn"
              onClick={handleTestNotification}
              title="Kiểm tra thông báo hệ thống và chuông ứng dụng"
            >
              <Bell size={13} />
              <span>Gửi thông báo thử</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            FOOTER: AUTO-SAVE STATUS & MANUAL SAVE BUTTON
            ======================================================== */}
        <div className="settings-actions-bar">
          <div className="settings-auto-status">
            {autoSavedTime ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>
                  <BilingualText
                    vi={`Đã tự động lưu thiết lập lúc ${autoSavedTime}`}
                    en={`Settings auto-saved at ${autoSavedTime}`}
                  />
                </span>
              </>
            ) : (
              <span className="text-xs text-[#64748b]">
                <BilingualText
                  vi="Mọi thay đổi được tự động ghi nhớ ngay lập tức."
                  en="All changes are automatically saved as you configure."
                />
              </span>
            )}
          </div>

          <button type="submit" disabled={state.saving} className="settings-pill-btn primary">
            <Check size={15} />
            <BilingualText vi={state.saving ? 'Đang lưu…' : 'Lưu tất cả cài đặt'} en={state.saving ? 'Saving…' : 'Save all settings'} />
          </button>
        </div>
      </form>
    </div>
  );
}
