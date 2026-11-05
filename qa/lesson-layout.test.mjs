import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('lesson screen uses the available desktop width', async () => {
  const page = await readFile(
    new URL('../src/features/learning/pages/learning/LessonLearningPage.jsx', import.meta.url),
    'utf8',
  );

  assert.match(page, /lesson-learning-screen w-full max-w-none/);
  assert.doesNotMatch(page, /lesson-learning-screen max-w-7xl/);
});
