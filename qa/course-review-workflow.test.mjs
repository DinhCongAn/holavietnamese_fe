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

test('course preview expands lesson content directly below the selected lesson', () => {
  const studio = read('src/features/learning/admin/components/CourseStudio.jsx');
  const lessonActivities = read('src/features/learning/components/learning/LessonActivities.jsx');
  const designSystem = read('src/styles/design-system.css');

  assert.match(studio, /studio-preview-lesson-block/);
  assert.match(studio, /lessonId === lesson\.id && <section className="studio-lesson-preview-inline">/);
  assert.match(studio, /setLessonId\(current => current === lesson\.id \? null : lesson\.id\)/);
  assert.match(studio, /previewLesson=\{lesson\} previewAll/);
  assert.match(lessonActivities, /previewAll \? \(/);
  assert.match(lessonActivities, /<LessonAllActivitiesPreview key=\{lesson\.id\} lesson=\{lesson\}/);
  assert.match(lessonActivities, /hasImage \? 'activity-has-image' : 'activity-no-image'/);
  assert.match(lessonActivities, /const hasImage = activityHasImage\(activity\);/);
  assert.match(designSystem, /activity-no-image \.activity-intro\{[^}]*text-align:justify/);
  assert.match(designSystem, /activity-has-image \.activity-intro\{text-align:left/);
  assert.doesNotMatch(studio, /lessonId && <section className="studio-panel">/);
});
