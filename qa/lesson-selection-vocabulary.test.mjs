import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const read = path => fs.readFile(new URL(path, import.meta.url), 'utf8');

test('selected lesson text is enriched by AI and saved without a manual form', async () => {
  const [page, service] = await Promise.all([
    read('../src/features/learning/pages/learning/LessonLearningPage.jsx'),
    read('../src/features/vocabulary/api/vocabularyService.js'),
  ]);

  assert.match(page, /window\.getSelection\(\)/);
  assert.match(page, /lessonContentRef\.current\?\.contains\(range\.commonAncestorContainer\)/);
  assert.match(page, /AI dịch & lưu vào sổ tay/);
  assert.match(page, /vocabularyService\.enrichWord\(/);
  assert.match(page, /await vocabularyService\.add\(\{/);
  assert.match(page, /showSaveNotice\('success'/);
  assert.match(page, /showSaveNotice\('error'/);
  assert.match(page, /role=\{saveNotice\.type === 'success' \? 'status' : 'alert'\}/);
  assert.match(page, /lessonId: Number\(lessonId\)/);
  assert.doesNotMatch(page, /<VocabularyForm/);
  assert.doesNotMatch(page, /Lưu từ vựng/);
  assert.match(service, /post\('\/api\/ai\/vocabulary\/enrich'/);
});
