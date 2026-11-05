import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const read = (path) => fs.readFile(new URL(path, import.meta.url), 'utf8');

test('Welcome requires account creation before onboarding', async () => {
  const [pages, app] = await Promise.all([
    read('../src/features/onboarding/pages/OnboardingPages.jsx'),
    read('../src/app/router/AppRouter.jsx'),
  ]);
  assert.match(pages, /if \(isAuthenticated\)[\s\S]*navigate\('\/onboarding\/reason'\)[\s\S]*navigate\('\/register', \{ state: \{ from: '\/onboarding\/reason' \} \}\)/);
  assert.match(app, /path="\/onboarding\/reason" element=\{<ReasonPage \/>\}/);
  assert.match(app, /<Route element=\{<RequireAuth fallbackFeature="learning" \/>\}>[\s\S]*path="\/onboarding\/placement-test"/);
  assert.doesNotMatch(pages, /LOG IN TO SAVE THIS PLAN/);
  assert.doesNotMatch(pages, /New here\? Create an account/);
});

test('authenticated existing learners can open the placement test directly', async () => {
  const pages = await read('../src/features/onboarding/pages/OnboardingPages.jsx');
  assert.match(pages, /export const PlacementTestPage = \(\) => <ExerciseRunner mode="placement" \/>;/);
  assert.doesNotMatch(pages, /PlacementTestPage[^\n]*data\.learningPath !== 'placement'/);
});

test('back-office accounts can access learner onboarding and all pages without being blocked', async () => {
  const [app, guard] = await Promise.all([
    read('../src/app/router/AppRouter.jsx'),
    read('../src/shared/components/common/RequireLearnerOnboarding.jsx'),
  ]);
  assert.match(app, /<Route element=\{<RequireLearnerOnboarding \/>\}>[\s\S]*path="\/onboarding\/placement-test"/);
  assert.match(guard, /role === 'ADMIN'/);
  assert.match(guard, /role === 'CONTENT'/);
  assert.match(guard, /role === 'LEARNER'/);
  assert.match(guard, /\/forbidden/);
});

test('learning path offers only the placement test', async () => {
  const pages = await read('../src/features/onboarding/pages/OnboardingPages.jsx');
  assert.doesNotMatch(pages, /Start from Scratch/);
  assert.doesNotMatch(pages, /choose\('beginner'\)/);
  assert.match(pages, /ob-paths ob-paths-single/);
  assert.match(pages, /15 câu · Khoảng 5 phút/);
});

test('beginner lesson and placement test retain clearly different experiences', async () => {
  const pages = await read('../src/features/onboarding/pages/OnboardingPages.jsx');
  assert.match(pages, /Đây là bài học, không phải bài kiểm tra/);
  assert.match(pages, /backTo="\/onboarding\/learning-path"/);
  assert.match(pages, /mode === 'placement'[\s\S]*NEXT QUESTION/);
  assert.match(pages, /mode === 'lesson'[\s\S]*TRẢ LỜI/);
});

test('registration and OTP verification preserve the post-login onboarding destination', async () => {
  const [register, verify, flow, login] = await Promise.all([
    read('../src/features/auth/pages/auth/RegisterPage.jsx'),
    read('../src/features/auth/pages/auth/VerifyEmailPage.jsx'),
    read('../src/features/auth/emailVerificationFlow.js'),
    read('../src/features/auth/pages/auth/LoginPage.jsx'),
  ]);
  assert.match(register, /savePostVerificationPath\(location\.state\?\.from \|\| '\/onboarding\/reason'\)/);
  assert.doesNotMatch(register, /Personalize Your Path|Cá nhân hóa lộ trình/);
  assert.match(register, /learningGoal: 'daily_communication'/);
  assert.match(verify, /from: afterLogin/);
  assert.match(flow, /POST_VERIFICATION_PATH_KEY/);
  assert.match(login, /user\?\.onboardingCompleted !== true/);
  assert.match(login, /navigate\('\/onboarding\/reason'/);
});

test('onboarding result maps to a CEFR target and ranks personalized courses', async () => {
  const [data, service, engine, pages, courses] = await Promise.all([
    read('../src/features/onboarding/data/onboardingData.js'),
    read('../src/features/onboarding/services/onboardingService.js'),
    read('../src/features/onboarding/services/recommendationEngine.js'),
    read('../src/features/onboarding/pages/OnboardingPages.jsx'),
    read('../src/features/learning/pages/courses/CourseListPage.jsx'),
  ]);
  assert.match(data, /targetLevel: 'A1'/);
  assert.match(data, /targetLevel: 'A2'/);
  assert.match(data, /targetLevel: 'B1'/);
  assert.match(data, /targetLevel: 'B2'/);
  assert.match(data, /targetLevel: 'C1'/);
  assert.match(service, /buildOnboardingRecommendation/);
  assert.match(service, /recommendation\.secondaryGoalIds/);
  assert.match(engine, /data\.placementResult\?\.targetLevel/);
  assert.match(engine, /recommended: '1'/);
  assert.match(engine, /goal: recommendation\.goalId/);
  assert.match(engine, /pace: recommendation\.paceId/);
  assert.match(pages, /buildLearningPathPath\(recommendation\)/);
  assert.match(courses, /searchParams\.get\('level'\)/);
  assert.match(courses, /searchParams\.get\('goal'\)/);
  assert.match(courses, /rankCoursesForRecommendation/);
  assert.match(courses, /Lộ trình khóa học dành riêng cho bạn/);
});
