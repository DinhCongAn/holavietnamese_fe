import { getStoredAudioSpeed } from '@/features/account/services/userSettingsService';

/**
 * Web Speech Synthesis utility for native Vietnamese pronunciation.
 * Supports configurable playback rate and automatic cancellation of overlapping utterances.
 * Automatically synchronizes with the user's configured audio speed setting.
 */
export const speakVietnamese = (text, rate) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = typeof rate === 'number' ? rate : getStoredAudioSpeed();
    window.speechSynthesis.speak(utterance);
  }
};

export default speakVietnamese;
