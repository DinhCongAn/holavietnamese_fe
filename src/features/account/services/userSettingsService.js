/**
 * User Settings Service
 * Manages local persistence, cross-component reactivity, and live tests
 * for learning audio speed, daily goals, pronunciation hints, translations, and streak notifications.
 */

export const DEFAULT_USER_SETTINGS = {
  audioSpeed: 1.0,
  dailyLearningGoalMinutes: 15,
  pronunciationHintsEnabled: true,
  autoTranslateEnabled: true,
  notificationsEnabled: true,
};

const SETTINGS_STORAGE_KEY = 'hola_user_settings';
const SETTINGS_EVENT = 'hola-settings-changed';

/**
 * Retrieve current user settings from localStorage with fallback to defaults.
 */
export function getStoredSettings() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_USER_SETTINGS };
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_USER_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      audioSpeed: typeof parsed.audioSpeed === 'number' ? parsed.audioSpeed : DEFAULT_USER_SETTINGS.audioSpeed,
      dailyLearningGoalMinutes: typeof parsed.dailyLearningGoalMinutes === 'number' ? parsed.dailyLearningGoalMinutes : DEFAULT_USER_SETTINGS.dailyLearningGoalMinutes,
      pronunciationHintsEnabled: typeof parsed.pronunciationHintsEnabled === 'boolean' ? parsed.pronunciationHintsEnabled : DEFAULT_USER_SETTINGS.pronunciationHintsEnabled,
      autoTranslateEnabled: typeof parsed.autoTranslateEnabled === 'boolean' ? parsed.autoTranslateEnabled : DEFAULT_USER_SETTINGS.autoTranslateEnabled,
      notificationsEnabled: typeof parsed.notificationsEnabled === 'boolean' ? parsed.notificationsEnabled : DEFAULT_USER_SETTINGS.notificationsEnabled,
    };
  } catch {
    return { ...DEFAULT_USER_SETTINGS };
  }
}

/**
 * Save user settings to localStorage and notify all listeners.
 */
export function saveStoredSettings(patch) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_USER_SETTINGS, ...patch };
  }
  const current = getStoredSettings();
  const next = { ...current, ...patch };
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: next }));
  } catch (err) {
    console.error('Failed to save settings locally:', err);
  }
  return next;
}

/**
 * Get current configured audio playback rate (e.g. 0.75, 0.85, 1.0, 1.25).
 */
export function getStoredAudioSpeed() {
  return getStoredSettings().audioSpeed || 1.0;
}

/**
 * Check if pronunciation & tongue placement hints are active.
 */
export function isPronunciationHintsEnabled() {
  return getStoredSettings().pronunciationHintsEnabled !== false;
}

/**
 * Check if bilingual subtitles / translations are active.
 */
export function isAutoTranslateEnabled() {
  return getStoredSettings().autoTranslateEnabled !== false;
}

/**
 * Check if daily streak reminders are active.
 */
export function isNotificationsEnabled() {
  return getStoredSettings().notificationsEnabled !== false;
}

/**
 * Play a test sample of Vietnamese speech at a specific rate.
 * @param {number} rate - Playback rate (0.75 - 1.25)
 * @param {string} [text] - Optional text to speak
 * @param {Function} [onEnd] - Callback when playback finishes
 */
export function playAudioSpeedSample(rate, text, onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (typeof onEnd === 'function') onEnd();
    return false;
  }
  try {
    window.speechSynthesis.cancel();
    const sampleText = text || 'Xin chào! Đây là tốc độ phát âm mẫu của bạn trên HolaVietnamese.';
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.lang = 'vi-VN';
    utterance.rate = typeof rate === 'number' ? rate : getStoredAudioSpeed();

    // Prefer a native Vietnamese voice if available
    const voices = window.speechSynthesis.getVoices() || [];
    const viVoice = voices.find((v) => (v.lang || '').toLowerCase().startsWith('vi'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    if (typeof onEnd === 'function') {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
    if (typeof onEnd === 'function') onEnd();
    return false;
  }
}

/**
 * Play a specific tone sample word (e.g. ba, bà, bá, bả, bã, bạ) at the configured speed.
 */
export function playToneSample(word, rate, onEnd) {
  return playAudioSpeedSample(rate, word, onEnd);
}

/**
 * Stop any ongoing speech synthesis playback.
 */
export function stopSpeechSample() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Test Streak reminder notification using Web Notification API.
 * Requests permission if needed, and fires a native desktop notification.
 */
export async function sendTestNotification() {
  if (typeof window === 'undefined') {
    return { success: false, status: 'unsupported', message: 'Môi trường không hỗ trợ Web Notification.' };
  }

  if (!('Notification' in window)) {
    return {
      success: false,
      status: 'unsupported',
      message: 'Trình duyệt này không hỗ trợ hiển thị thông báo ngoài màn hình (Web Notification).',
    };
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    try {
      permission = await Notification.requestPermission();
    } catch {
      permission = 'denied';
    }
  }

  if (permission === 'granted') {
    try {
      const notification = new Notification('🔥 HolaVietnamese: Giữ chuỗi Streak hôm nay!', {
        body: 'Bạn ơi, hãy dành 10-15 phút hoàn thành bài học trước 21h để duy trì chuỗi học tập nhé!',
        icon: '/favicon.ico',
        tag: 'hola-streak-reminder-test',
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      return {
        success: true,
        status: 'granted',
        message: 'Đã gửi thông báo hệ thống mẫu thành công!',
      };
    } catch (err) {
      return {
        success: false,
        status: 'error',
        message: 'Lỗi khi gửi thông báo: ' + (err.message || 'Không thể tạo thông báo.'),
      };
    }
  }

  return {
    success: false,
    status: 'denied',
    message: 'Bạn đang tắt quyền thông báo trên trình duyệt. Hãy bấm vào biểu tượng ổ khóa cạnh thanh địa chỉ để bật lại nhé!',
  };
}
