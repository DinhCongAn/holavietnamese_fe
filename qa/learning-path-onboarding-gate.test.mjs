import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const read = (path) => fs.readFile(new URL(path, import.meta.url), 'utf8');

test('Learning Path requires completed onboarding only for learner accounts', async () => {
  const [app, gate, page] = await Promise.all([
    read('../src/app/router/AppRouter.jsx'),
    read('../src/shared/components/common/RequireLearningPathOnboarding.jsx'),
    read('../src/features/learning/pages/learning-path/LearningPathPage.jsx'),
  ]);
  assert.match(app, /<RequireAuth fallbackFeature="learning" \/>/);
  assert.match(app, /<RequireLearningPathOnboarding \/>/);
  assert.match(app, /path=\{ROUTES\.LEARNING_PATH\} element=\{<LearningPathPage \/>\}/);
  assert.match(gate, /role === 'ADMIN' \|\| role === 'CONTENT'/);
  assert.match(gate, /!isBackOfficeAccount && user\.onboardingCompleted !== true/);
  assert.match(gate, /to="\/onboarding\/reason"/);
  assert.match(gate, /onboardingGate: true/);
  assert.match(page, /path\.data\?\.requiresLevel/);
  assert.match(page, /Hãy xác định trình độ hiện tại/);
});

test('onboarding completion redirects to the canonical Learning Path route', async () => {
  const [engine, service, login, pages] = await Promise.all([
    read('../src/features/onboarding/services/recommendationEngine.js'),
    read('../src/features/onboarding/services/onboardingService.js'),
    read('../src/features/auth/pages/auth/LoginPage.jsx'),
    read('../src/features/onboarding/pages/OnboardingPages.jsx'),
  ]);
  assert.match(engine, /return `\/learning-path\?\$\{params\.toString\(\)\}`/);
  assert.match(service, /learningPathService\.updatePreferences/);
  assert.match(login, /user\?\.onboardingCompleted !== true/);
  assert.doesNotMatch(login, /loggedUser\?\.targetLevel\)\s*\? defaultLearningPath/);
  assert.match(pages, /await onboardingService\.syncProgress\(\);\s*await fetchProfile\(\);/);
});

test('onboarding remembers a requested Learning Path destination', async () => {
  const pages = await read('../src/features/onboarding/pages/OnboardingPages.jsx');
  assert.match(pages, /\['\/learning-path', '\/edtech\/dashboard'\]/);
  assert.match(pages, /requestedDestination/);
  assert.match(pages, /LƯU VÀ XEM LỘ TRÌNH ĐỀ XUẤT/);
});
