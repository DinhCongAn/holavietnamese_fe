import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  canImportVocabulary,
  canManageExploreLinks,
  canReadExplore,
  canReadVocabulary,
  canReviewExplore,
  canReviewVocabulary,
  canWriteExplore,
  canWriteVocabulary,
} from '../src/utils/permissions/contentAccess.js';

test('administrator can read and review but cannot edit Vocabulary or Explore', () => {
  const administrator = { role: 'ADMIN', permissions: [] };
  assert.equal(canReadVocabulary(administrator), true);
  assert.equal(canWriteVocabulary(administrator), false);
  assert.equal(canImportVocabulary(administrator), false);
  assert.equal(canReviewVocabulary(administrator), true);
  assert.equal(canReadExplore(administrator), true);
  assert.equal(canWriteExplore(administrator), false);
  assert.equal(canManageExploreLinks(administrator), false);
  assert.equal(canReviewExplore(administrator), true);
});

test('content manager receives the module management baseline', () => {
  const manager = { role: 'CONTENT', permissions: [] };
  assert.equal(canReadVocabulary(manager), true);
  assert.equal(canWriteVocabulary(manager), true);
  assert.equal(canImportVocabulary(manager), true);
  assert.equal(canReadExplore(manager), true);
  assert.equal(canWriteExplore(manager), true);
  assert.equal(canManageExploreLinks(manager), true);
});

test('an administrator can receive a narrowly scoped content permission', () => {
  const vocabularyReader = { role: 'ADMIN', permissions: ['VOCABULARY_READ'] };
  const exploreLinkManager = { role: 'ADMIN', permissions: ['EXPLORE_LINK_WRITE'] };
  assert.equal(canReadVocabulary(vocabularyReader), true);
  assert.equal(canWriteVocabulary(vocabularyReader), false);
  assert.equal(canReadExplore(exploreLinkManager), true);
  assert.equal(canManageExploreLinks(exploreLinkManager), true);
  assert.equal(canWriteExplore(exploreLinkManager), false);
});

test('content managers can view Vocabulary import history without website-course imports', () => {
  const page = readFileSync(new URL('../src/features/content-import/pages/AdminImportHistoryPage.jsx', import.meta.url), 'utf8');
  const route = readFileSync(new URL('../src/shared/components/common/AdminRoute.jsx', import.meta.url), 'utf8');

  assert.match(route, /importPath \? canImportVocabulary\(user\)/);
  assert.doesNotMatch(page, /websiteImportService/);
});

test('content authoring navigation belongs to Content Manager and Admin receives review queues', () => {
  const layout = readFileSync(new URL('../src/shared/layouts/AdminLayout.jsx', import.meta.url), 'utf8');
  const contentPages = readFileSync(new URL('../src/features/admin/pages/AdminContentPages.jsx', import.meta.url), 'utf8');
  const quizPages = readFileSync(new URL('../src/features/learning/admin/AdminQuizPages.jsx', import.meta.url), 'utf8');

  assert.match(layout, /managerAuthoringPaths/);
  assert.match(layout, /isContentManager && !isAdmin/);
  assert.match(layout, /isAdmin \? 'Duyệt khóa học' : 'Khóa học'/);
  assert.match(layout, /Duyệt từ vựng/);

  assert.match(contentPages, /const canCreate = isContentManager && !isAdmin && kind === 'courses'/);
  assert.doesNotMatch(contentPages, /isAdmin && kind === 'quizzes'/);

  assert.doesNotMatch(quizPages, /<Navigate to="\/content\/courses" replace\/>/);
  assert.match(quizPages, /const canEdit=isContentManager&&!isAdmin/);
  assert.match(quizPages, /Tạo và quản lý câu hỏi dùng trong các bài học và quiz của bạn/);
});
