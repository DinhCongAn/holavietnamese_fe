import test from 'node:test';
import assert from 'node:assert/strict';
import { applySequentialLessonLocks } from '../src/features/learning/utils/lessonAccess.js';

test('only the first incomplete lesson is available', () => {
  const lessons = applySequentialLessonLocks([
    { id: 1, learningStatus: 'COMPLETED' },
    { id: 2, learningStatus: 'NOT_STARTED' },
    { id: 3, learningStatus: 'NOT_STARTED' },
  ]);

  assert.deepEqual(lessons.map(lesson => lesson.isLocked), [false, false, true]);
});

test('a later completed record stays locked while an earlier lesson is incomplete', () => {
  const lessons = applySequentialLessonLocks([
    { id: 1, learningStatus: 'NOT_STARTED' },
    { id: 2, learningStatus: 'COMPLETED' },
    { id: 3, learningStatus: 'NOT_STARTED' },
  ]);

  assert.deepEqual(lessons.map(lesson => lesson.isLocked), [false, true, true]);
});
