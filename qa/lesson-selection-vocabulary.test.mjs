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
  assert.match(page, /onPointerDown=\{saveSelectionFromPointer\}/);
  assert.match(page, /event\.preventDefault\(\);/);
  assert.match(page, /event\.detail === 0/);
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
  assert.match(service, /return response\?\.result \?\? response/);
});

test('course roadmap owns the desktop collapse arrow and leaves a compact reopen handle', async () => {
  const [page, sidebar] = await Promise.all([
    read('../src/features/learning/pages/learning/LessonLearningPage.jsx'),
    read('../src/features/learning/components/learning/LessonSidebar.jsx'),
  ]);

  assert.match(page, /aria-expanded=\{sidebarOpen\}/);
  assert.match(page, /lg:hidden ml-auto inline-flex h-9 w-9/);
  assert.match(page, /onClose=\{\(\) => setSidebarOpen\(false\)\}/);
  assert.match(page, /!sidebarOpen &&/);
  assert.match(page, /Mở lộ trình khóa học/);
  assert.match(page, /<ChevronRight/);
  assert.doesNotMatch(page, /en="Collapse"/);
  assert.match(sidebar, /Thu gọn lộ trình khóa học/);
  assert.match(sidebar, /<ChevronLeft/);
});

test('course module hover keeps every text line readable on the dark background', async () => {
  const page = await read('../src/features/learning/pages/courses/CourseDetailPage.jsx');

  assert.match(page, /hover:!bg-\[#C2410C\]/);
  assert.match(page, /group-hover:text-white leading-snug/);
  assert.match(page, /group-hover:text-white\/90 line-clamp-2/);
  assert.match(page, /group-hover:text-white shrink-0/);
  assert.match(page, /hover:!text-white/);
});
