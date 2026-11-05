import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('content manager and admin course review UI uses the protected workflow', () => {
  const page = read('src/features/admin/pages/AdminContentPages.jsx');
  const studio = read('src/features/learning/admin/components/CourseStudio.jsx');
  const service = read('src/features/learning/api/contentService.js');

  assert.match(page, /isAdmin && kind === 'courses' \? 'REVIEW' : ''/);
  assert.match(page, /Chờ Admin duyệt/);
  assert.match(page, /step=publish/);

  assert.match(studio, /contentService\.submitCourse\(course\.id\)/);
  assert.match(studio, /contentService\.reviewCourse\(course\.id, 'APPROVE'/);
  assert.match(studio, /contentService\.reviewCourse\(course\.id, 'REJECT'/);
  assert.match(studio, /disabled=\{busy \|\| !reviewNote\.trim\(\)\}/);
  assert.match(service, /\/admin\/courses\/\$\{id\}\/submit/);
  assert.match(service, /\/admin\/courses\/\$\{id\}\/review/);
  assert.doesNotMatch(studio, /Xuất Excel gửi Admin/);
  assert.doesNotMatch(service, /\/api\/admin\/courses\/\$\{id\}\/export/);
});

test('learner header exposes Manage Courses to content managers', () => {
  const shell = read('src/shared/components/learner/LearnerShell.jsx');
  const menu = read('src/shared/components/layout/UserMenu.jsx');

  assert.match(shell, /const isContentManager = role === 'CONTENT'/);
  assert.match(shell, /<UserMenu user=\{user\} isAdmin=\{isAdmin\} isContentManager=\{isContentManager\}/);
  assert.match(menu, /isContentManager && !isAdmin/);
  assert.match(menu, /to=\{ROUTES\.CONTENT_COURSES\}/);
  assert.match(menu, /en="Manage Courses"/);
});
