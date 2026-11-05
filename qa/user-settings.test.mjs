import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_USER_SETTINGS,
  getStoredSettings,
  saveStoredSettings,
  getStoredAudioSpeed,
  isPronunciationHintsEnabled,
  isAutoTranslateEnabled,
  isNotificationsEnabled,
  playAudioSpeedSample,
  sendTestNotification,
} from '../src/features/account/services/userSettingsService.js';

test('user settings defaults and local persistence', async () => {
  assert.equal(DEFAULT_USER_SETTINGS.audioSpeed, 1.0);
  assert.equal(DEFAULT_USER_SETTINGS.dailyLearningGoalMinutes, 15);
  assert.equal(DEFAULT_USER_SETTINGS.pronunciationHintsEnabled, true);
  assert.equal(DEFAULT_USER_SETTINGS.autoTranslateEnabled, true);
  assert.equal(DEFAULT_USER_SETTINGS.notificationsEnabled, true);

  // Initial read without window.localStorage
  const settings = getStoredSettings();
  assert.equal(settings.audioSpeed, 1.0);
  assert.equal(settings.dailyLearningGoalMinutes, 15);

  // Partial save
  const updated = saveStoredSettings({ audioSpeed: 0.85, dailyLearningGoalMinutes: 30 });
  assert.equal(updated.audioSpeed, 0.85);
  assert.equal(updated.dailyLearningGoalMinutes, 30);

  // Helper methods
  assert.equal(typeof getStoredAudioSpeed(), 'number');
  assert.equal(typeof isPronunciationHintsEnabled(), 'boolean');
  assert.equal(typeof isAutoTranslateEnabled(), 'boolean');
  assert.equal(typeof isNotificationsEnabled(), 'boolean');

  // Audio sample playback handles absence of window gracefully
  let ended = false;
  const played = playAudioSpeedSample(1.0, 'test', () => { ended = true; });
  assert.equal(played, false);
  assert.equal(ended, true);

  // Notification test handles absence of window gracefully
  const notifResult = await sendTestNotification();
  assert.equal(notifResult.success, false);
  assert.equal(notifResult.status, 'unsupported');
});
