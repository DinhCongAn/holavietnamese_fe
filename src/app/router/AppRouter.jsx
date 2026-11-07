import { BilingualText, useTextLanguage } from '@/shared/components/common/BilingualText';
import { lazy, Suspense } from 'react';
import { generatePath, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { RequireAuth } from '@/shared/components/common/RequireAuth';
import { RequireLearnerOnboarding } from '@/shared/components/common/RequireLearnerOnboarding';
import { RequireLearningPathOnboarding } from '@/shared/components/common/RequireLearningPathOnboarding';
import { AdminRoute } from '@/shared/components/common/AdminRoute';
import { ROUTES } from '@/constants/routes';

// Layouts
import { MainLayout } from '@/shared/layouts/MainLayout';
import { AdminLayout } from '@/shared/layouts/AdminLayout';

// Public & Auth Pages (Người 1)
const HomePage = lazy(() => import('@/features/home/pages/HomePage').then(module => ({ default: module.HomePage })));
const LoginPage = lazy(() => import('@/features/auth/pages/auth/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@/features/auth/pages/auth/RegisterPage').then(module => ({ default: module.RegisterPage })));
import { AuthRequiredPage } from '@/features/auth/pages/auth/AuthRequiredPage';
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/auth/VerifyEmailPage').then(module => ({ default: module.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/auth/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/auth/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const WelcomePage = lazy(() => import('@/features/onboarding/pages/OnboardingPages').then(module => ({ default: module.WelcomePage })));
const ReasonPage = lazy(() => import('@/features/onboarding/pages/OnboardingPages').then(module => ({ default: module.ReasonPage })));
const LevelPage = lazy(() => import('@/features/onboarding/pages/OnboardingPages').then(module => ({ default: module.LevelPage })));
const BenefitsPage = lazy(() => import('@/features/onboarding/pages/OnboardingPages').then(module => ({ default: module.BenefitsPage })));
const DailyGoalPage = lazy(() => import('@/features/onboarding/pages/OnboardingPages').then(module => ({ default: module.DailyGoalPage })));
const OnboardingLearningPathPage = lazy(() => import('@/features/onboarding/pages/OnboardingPages').then(module => ({ default: module.LearningPathPage })));
const FirstLessonPage = lazy(() => import('@/features/onboarding/pages/OnboardingPages').then(module => ({ default: module.FirstLessonPage })));
const PlacementTestPage = lazy(() => import('@/features/onboarding/pages/OnboardingPages').then(module => ({ default: module.PlacementTestPage })));
const CompletionPage = lazy(() => import('@/features/onboarding/pages/OnboardingPages').then(module => ({ default: module.CompletionPage })));
const NotFoundPage = lazy(() => import('@/app/pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const ForbiddenPage = lazy(() => import('@/app/pages/ForbiddenPage').then(module => ({ default: module.ForbiddenPage })));

// Learner Pages (Người 1)
const MyLearningPage = lazy(() => import('@/features/learning/pages/learning/MyLearningPage').then(module => ({ default: module.MyLearningPage })));
const ProfilePage = lazy(() => import('@/features/account/pages/profile/ProfilePage').then(module => ({ default: module.ProfilePage })));
const SettingsPage = lazy(() => import('@/features/account/pages/settings/SettingsPage').then(module => ({ default: module.SettingsPage })));
const LearningProgressPage = lazy(() => import('@/features/learning/pages/progress/LearningProgressPage').then(module => ({ default: module.LearningProgressPage })));
const AchievementsPage = lazy(() => import('@/features/learning/pages/achievements/AchievementsPage').then(module => ({ default: module.AchievementsPage })));
const NotificationsPage = lazy(() => import('@/features/account/pages/notifications/NotificationsPage').then(module => ({ default: module.NotificationsPage })));

// EdTech Next-Gen Experience
const LearningPathPage = lazy(() => import('@/features/learning/pages/learning-path/LearningPathPage'));

// Courses & Vocabulary Pages (Người 2 & Người 3)
const CourseListPage = lazy(() => import('@/features/learning/pages/courses/CourseListPage').then(module => ({ default: module.CourseListPage })));
const AlphabetPage = lazy(() => import('@/features/alphabet/AlphabetPage').then(module => ({ default: module.AlphabetPage })));
const CourseDetailPage = lazy(() => import('@/features/learning/pages/courses/CourseDetailPage').then(module => ({ default: module.CourseDetailPage })));
const LessonLearningPage = lazy(() => import('@/features/learning/pages/learning/LessonLearningPage').then(module => ({ default: module.LessonLearningPage })));
const ResumeCoursePage = lazy(() => import('@/features/learning/pages/learning/ResumeCoursePage').then(module => ({ default: module.ResumeCoursePage })));
const VocabularyNotebookPage = lazy(() => import('@/features/vocabulary/pages/VocabularyNotebookPage').then(module => ({ default: module.VocabularyNotebookPage })));
const VocabularyNotebookDetailPage = lazy(() => import('@/features/vocabulary/pages/VocabularyNotebookDetailPage').then(module => ({ default: module.VocabularyNotebookDetailPage })));
const VocabularyCatalogPage = lazy(() => import('@/features/vocabulary/pages/VocabularyCatalogPage').then(module => ({ default: module.VocabularyCatalogPage })));
const VocabularyDetailPage = lazy(() => import('@/features/vocabulary/pages/VocabularyDetailPage').then(module => ({ default: module.VocabularyDetailPage })));
const RegionalVietnamesePage = lazy(() => import('@/features/explore/regional/pages/RegionalVietnamesePage').then(module => ({ default: module.RegionalVietnamesePage })));
const AdminRegionalLanguagePage = lazy(() => import('@/features/explore/regional/admin/AdminRegionalLanguagePage').then(module => ({ default: module.AdminRegionalLanguagePage })));
const AdminImportPage = lazy(() => import('@/features/content-import/pages/AdminImportPage').then(module => ({ default: module.AdminImportPage })));
const AdminImportHistoryPage = lazy(() => import('@/features/content-import/pages/AdminImportHistoryPage').then(module => ({ default: module.AdminImportHistoryPage })));
// Văn hóa, AI Tutor & Roleplay Pages (Người 4)
const CultureExplorePage = lazy(() => import('@/features/culture/pages/culture/CultureExplorePage').then(module => ({ default: module.CultureExplorePage })));
const CultureDetailPage = lazy(() => import('@/features/culture/pages/culture/CultureDetailPage').then(module => ({ default: module.CultureDetailPage })));
const AiTutorPage = lazy(() => import('@/features/ai/pages/ai-tutor/AiTutorPage').then(module => ({ default: module.AiTutorPage })));
const ScenarioListPage = lazy(() => import('@/features/ai/pages/roleplay/ScenarioListPage').then(module => ({ default: module.ScenarioListPage })));
const ScenarioDetailPage = lazy(() => import('@/features/ai/pages/roleplay/ScenarioDetailPage').then(module => ({ default: module.ScenarioDetailPage })));
const RoleplaySessionPage = lazy(() => import('@/features/ai/pages/roleplay/RoleplaySessionPage').then(module => ({ default: module.RoleplaySessionPage })));
const RoleplayResultPage = lazy(() => import('@/features/ai/pages/roleplay/RoleplayResultPage').then(module => ({ default: module.RoleplayResultPage })));

// Admin Pages (Người 1)
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('@/features/admin/pages/AdminUsersPage').then(module => ({ default: module.AdminUsersPage })));
const AdminUserDetailPage = lazy(() => import('@/features/admin/pages/AdminUserDetailPage').then(module => ({ default: module.AdminUserDetailPage })));
// (AdminRolesPage removed)
const AdminAchievementsPage = lazy(() => import('@/features/learning/admin/AdminAchievementsPage').then(module => ({ default: module.AdminAchievementsPage })));
const AdminXpRulesPage = lazy(() => import('@/features/learning/admin/AdminXpRulesPage').then(module => ({ default: module.AdminXpRulesPage })));
// (AdminAuditLogsPage removed)
const AdminSettingsPage = lazy(() => import('@/features/admin/pages/AdminSettingsPage').then(module => ({ default: module.AdminSettingsPage })));
const AdminSiteContentPage = lazy(() => import('@/features/admin/pages/AdminSiteContentPage').then(module => ({ default: module.AdminSiteContentPage })));
const AdminVocabularyPage = lazy(() => import('@/features/vocabulary/admin/AdminVocabularyPage').then(module => ({ default: module.AdminVocabularyPage })));
const AdminDestinationsPage = lazy(() => import('@/features/explore/admin/AdminDestinationsPage').then(module => ({ default: module.AdminDestinationsPage })));
const AdminDestinationDetailPage = lazy(() => import('@/features/explore/admin/AdminDestinationDetailPage').then(module => ({ default: module.AdminDestinationDetailPage })));
// Admin Pages (Người 4: Văn hóa & AI)
const AdminCultureListPage = lazy(() => import('@/features/culture/admin/AdminCultureListPage').then(module => ({ default: module.AdminCultureListPage })));
const AdminCultureEditPage = lazy(() => import('@/features/culture/admin/AdminCultureEditPage').then(module => ({ default: module.AdminCultureEditPage })));
const AdminCultureCategoriesPage = lazy(() => import('@/features/culture/admin/AdminCultureCategoriesPage').then(module => ({ default: module.AdminCultureCategoriesPage })));
const AdminAiScenariosPage = lazy(() => import('@/features/ai/admin/AdminAiScenariosPage').then(module => ({ default: module.AdminAiScenariosPage })));
const AdminScenarioBuilderPage = lazy(() => import('@/features/ai/admin/AdminScenarioBuilderPage').then(module => ({ default: module.AdminScenarioBuilderPage })));
const AdminAiSettingsPage = lazy(() => import('@/features/ai/admin/AdminAiSettingsPage').then(module => ({ default: module.AdminAiSettingsPage })));
const AdminAiUsagePage = lazy(() => import('@/features/ai/admin/AdminAiUsagePage').then(module => ({ default: module.AdminAiUsagePage })));
const AdminAiReviewsPage = lazy(() => import('@/features/ai/admin/AdminAiReviewsPage').then(module => ({ default: module.AdminAiReviewsPage })));
const VocabularyReviewPage = lazy(() => import('@/features/vocabulary/pages/VocabularyReviewPage').then(module => ({ default: module.VocabularyReviewPage })));
const ExploreVietnamPage = lazy(() => import('@/features/explore/pages/ExplorePages').then(module => ({ default: module.ExploreVietnamPage })));
const DestinationDetailPage = lazy(() => import('@/features/explore/pages/ExplorePages').then(module => ({ default: module.DestinationDetailPage })));
const BlogHomePage = lazy(() => import('@/features/blog/pages/blog/BlogPages').then(module => ({ default: module.BlogHomePage })));
const BlogDetailPage = lazy(() => import('@/features/blog/pages/blog/BlogPages').then(module => ({ default: module.BlogDetailPage })));
const QuizPage = lazy(() => import('@/features/learning/pages/quiz/QuizPages').then(module => ({ default: module.QuizPage })));
const QuizAttemptPage = lazy(() => import('@/features/learning/pages/quiz/QuizPages').then(module => ({ default: module.QuizAttemptPage })));
const QuizResultPage = lazy(() => import('@/features/learning/pages/quiz/QuizPages').then(module => ({ default: module.QuizResultPage })));
const AdminContentListPage = lazy(() => import('@/features/admin/pages/AdminContentPages').then(module => ({ default: module.AdminContentListPage })));
const AdminCourseBuilderPage = lazy(() => import('@/features/admin/pages/AdminContentPages').then(module => ({ default: module.AdminCourseBuilderPage })));
const AdminCourseCreatePage = lazy(() => import('@/features/learning/admin/components/CourseStudio').then(module => ({ default: module.AdminCourseCreatePage })));
const AdminLessonBuilderPage = lazy(() => import('@/features/admin/pages/AdminContentPages').then(module => ({ default: module.AdminLessonBuilderPage })));
const AdminCoursePreviewPage = lazy(() => import('@/features/admin/pages/AdminContentPages').then(module => ({ default: module.AdminCoursePreviewPage })));
const AdminLessonPreviewPage = lazy(() => import('@/features/admin/pages/AdminContentPages').then(module => ({ default: module.AdminLessonPreviewPage })));
const AdminQuestionBankPage = lazy(() => import('@/features/learning/admin/AdminQuizPages').then(module => ({ default: module.AdminQuestionBankPage })));
const AdminQuizBuilderPage = lazy(() => import('@/features/learning/admin/AdminQuizPages').then(module => ({ default: module.AdminQuizBuilderPage })));
const AdminQuizPreviewPage = lazy(() => import('@/features/learning/admin/AdminQuizPages').then(module => ({ default: module.AdminQuizPreviewPage })));

function LegacyRouteRedirect({ to }) {
  const params = useParams();
  const location = useLocation();
  return <Navigate to={`${generatePath(to, params)}${location.search}${location.hash}`} replace />;
}

export function AppRouter() {
  useTextLanguage();
  return (
    <>
          <Suspense fallback={<div className="state loading-state" role="status"><span className="loading-spinner" aria-hidden="true"/><BilingualText>{"Đang tải trang…"}</BilingualText></div>}><Routes>
            {/* Standalone Fullscreen Auth Routes (Người 1) */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.SIGNUP} element={<RegisterPage />} />
            <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
            <Route element={<RequireAuth fallbackFeature="learning" />}>
              <Route element={<RequireLearnerOnboarding />}>
                <Route path={ROUTES.ONBOARDING} element={<Navigate to="/onboarding/reason" replace />} />
                <Route path="/onboarding/reason" element={<ReasonPage />} />
                <Route path="/onboarding/level" element={<LevelPage />} />
                <Route path="/onboarding/benefits" element={<BenefitsPage />} />
                <Route path="/onboarding/daily-goal" element={<DailyGoalPage />} />
                <Route path="/onboarding/learning-path" element={<OnboardingLearningPathPage />} />
                <Route path="/onboarding/first-lesson" element={<FirstLessonPage />} />
                <Route path="/onboarding/placement-test" element={<PlacementTestPage />} />
                <Route path="/onboarding/completed" element={<CompletionPage />} />
              </Route>
            </Route>
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
            {/* Distraction-Free Fullscreen Interactive Lesson */}
            <Route path={ROUTES.EDTECH_LESSON} element={<Navigate to={ROUTES.EDTECH_DASHBOARD} replace />} />

            {/* Learner Main Layout */}
            <Route element={<MainLayout />}>
              <Route path={ROUTES.HOME} element={<HomePage />} />

              <Route path={ROUTES.ALPHABET} element={<AlphabetPage />} />

              <Route path={ROUTES.BLOG} element={<BlogHomePage />} />
              <Route path={ROUTES.BLOG_DETAIL} element={<BlogDetailPage />} />
              <Route path={ROUTES.LOGIN_REQUIRED} element={<AuthRequiredPage />} />
              <Route path={ROUTES.AUTH_REQUIRED} element={<AuthRequiredPage />} />

              {/* Learning Path requires both authentication and a completed learner onboarding. */}
              <Route element={<RequireAuth fallbackFeature="learning" />}>
                <Route element={<RequireLearningPathOnboarding />}>
                  <Route path={ROUTES.LEARNING_PATH} element={<LearningPathPage />} />
                  <Route path={ROUTES.EDTECH_DASHBOARD} element={<Navigate to={ROUTES.LEARNING_PATH} replace />} />
                </Route>
              </Route>

              {/* Protected Features: Khóa học, AI Tutor, Từ vựng, Khám phá Việt Nam, Văn hóa & Học viên */}
              <Route element={<RequireAuth />}>
                <Route path={ROUTES.COURSES} element={<CourseListPage />} />
                <Route path={ROUTES.COURSE_DETAIL} element={<CourseDetailPage />} />
                <Route path={ROUTES.EDTECH_VOCABULARY} element={<Navigate to={ROUTES.VOCABULARY} replace />} />
                <Route path={ROUTES.MY_LEARNING} element={<MyLearningPage />} />
                <Route path={ROUTES.MY_COURSES} element={<Navigate to={ROUTES.MY_LEARNING} replace />} />
                <Route path={ROUTES.VOCABULARY} element={<VocabularyCatalogPage />} />
                <Route path={ROUTES.VOCABULARY_CATALOG_DETAIL} element={<VocabularyDetailPage />} />
                <Route path={ROUTES.VOCABULARY_NOTEBOOK} element={<VocabularyNotebookPage />} />
                <Route path={ROUTES.VOCABULARY_NOTEBOOK_DETAIL} element={<VocabularyNotebookDetailPage />} />
                <Route path={ROUTES.VOCABULARY_REVIEW} element={<VocabularyReviewPage />} />
                <Route path={ROUTES.REGIONAL_VIETNAMESE} element={<RegionalVietnamesePage />} />
                <Route path={ROUTES.EXPLORE} element={<ExploreVietnamPage />} />
                <Route path={ROUTES.DESTINATION_DETAIL} element={<DestinationDetailPage />} />
                <Route path={ROUTES.EXPLORE_VIETNAM} element={<ExploreVietnamPage />} />
                <Route path={ROUTES.LEARNER_DESTINATION_DETAIL} element={<DestinationDetailPage />} />

                {/* Văn hóa & AI Tutor & Roleplay (Người 4) */}
                <Route path={ROUTES.CULTURE} element={<CultureExplorePage />} />
                <Route path={ROUTES.CULTURE_DETAIL} element={<CultureDetailPage />} />
                <Route path={ROUTES.AI_TUTOR} element={<AiTutorPage />} />
                <Route path={ROUTES.AI_SCENARIOS} element={<ScenarioListPage />} />
                <Route path={ROUTES.AI_SCENARIO_DETAIL} element={<ScenarioDetailPage />} />
                <Route path={ROUTES.AI_ROLEPLAY} element={<RoleplaySessionPage />} />
                <Route path={ROUTES.AI_SESSION_RESULT} element={<RoleplayResultPage />} />
                <Route path={ROUTES.AI_ROLEPLAY_SESSION} element={<RoleplayResultPage />} />
                <Route path="/ai/roleplay/sessions/:id" element={<RoleplayResultPage />} />
                <Route path="/ai/roleplay/sessions/:id/result" element={<RoleplayResultPage />} />
                <Route path="/ai/roleplay/:id" element={<RoleplaySessionPage />} />
                <Route path="/ai-sessions/:id" element={<RoleplayResultPage />} />

                {/* Protected Learner Routes */}
                <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
                <Route path={ROUTES.PROGRESS} element={<LearningProgressPage />} />
                <Route path={ROUTES.ACHIEVEMENTS} element={<AchievementsPage />} />
                <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
                <Route path={ROUTES.LEARN_RESUME} element={<ResumeCoursePage />} />
                <Route path={ROUTES.LEARN_LESSON} element={<LessonLearningPage />} />
                {/* Course Quizzes & Attempts */}
                <Route path={ROUTES.COURSE_LESSON_QUIZ_RESULT} element={<QuizResultPage />} />
                <Route path={ROUTES.COURSE_QUIZ_RESULT} element={<QuizResultPage />} />
                <Route path={ROUTES.COURSE_LESSON_QUIZ_ATTEMPT} element={<QuizAttemptPage />} />
                <Route path={ROUTES.COURSE_QUIZ_ATTEMPT} element={<QuizAttemptPage />} />
                <Route path={ROUTES.COURSE_LESSON_QUIZ} element={<QuizPage />} />
                <Route path={ROUTES.COURSE_QUIZ} element={<QuizPage />} />
                <Route path={ROUTES.QUIZ} element={<QuizPage />} />
                <Route path={ROUTES.QUIZ_ATTEMPT} element={<QuizAttemptPage />} />
                <Route path={ROUTES.QUIZ_RESULT} element={<QuizResultPage />} />
                {/* Backward-compatible aliases. New links must use the canonical plural resource paths above. */}
                <Route path="/learn/:courseId" element={<LegacyRouteRedirect to={ROUTES.LEARN_RESUME} />} />
                <Route path="/learn/:courseId/lesson/:lessonId" element={<LegacyRouteRedirect to={ROUTES.LEARN_LESSON} />} />
                <Route path="/courses/:courseId/lesson/:lessonId" element={<LegacyRouteRedirect to={ROUTES.LEARN_LESSON} />} />
                <Route path="/courses/:courseId/lesson/:lessonId/quizzes/:quizId" element={<LegacyRouteRedirect to={ROUTES.COURSE_LESSON_QUIZ} />} />
                <Route path="/courses/:courseId/lesson/:lessonId/quiz-attempts/:attemptId" element={<LegacyRouteRedirect to={ROUTES.COURSE_LESSON_QUIZ_ATTEMPT} />} />
                <Route path="/courses/:courseId/lesson/:lessonId/quiz-attempts/:attemptId/result" element={<LegacyRouteRedirect to={ROUTES.COURSE_LESSON_QUIZ_RESULT} />} />
                <Route path="/courses/:courseId/lesson/:lessonId/quiz/:quizId" element={<LegacyRouteRedirect to={ROUTES.COURSE_LESSON_QUIZ} />} />
                <Route path="/courses/:courseId/quiz/:quizId" element={<LegacyRouteRedirect to={ROUTES.COURSE_QUIZ} />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Area (Người 1) */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path={ROUTES.CONTENT_COURSES} element={<AdminContentListPage kind="courses" />} />
                <Route path={ROUTES.CONTENT_COURSE_CREATE} element={<AdminCourseCreatePage />} />
                <Route path={ROUTES.CONTENT_COURSE_BUILDER} element={<AdminCourseBuilderPage />} />
                <Route path={ROUTES.CONTENT_COURSE_PREVIEW} element={<AdminCoursePreviewPage />} />
                <Route path={ROUTES.CONTENT_LESSONS} element={<AdminContentListPage kind="lessons" />} />
                <Route path={ROUTES.CONTENT_LESSON_BUILDER} element={<AdminLessonBuilderPage />} />
                <Route path={ROUTES.CONTENT_LESSON_PREVIEW} element={<AdminLessonPreviewPage />} />
                <Route path={ROUTES.CONTENT_QUESTIONS} element={<AdminQuestionBankPage />} />
                <Route path={ROUTES.CONTENT_QUIZZES} element={<AdminContentListPage kind="quizzes" />} />
                <Route path={ROUTES.CONTENT_QUIZ_BUILDER} element={<AdminQuizBuilderPage />} />
                <Route path={ROUTES.CONTENT_QUIZ_PREVIEW} element={<AdminQuizPreviewPage />} />
                <Route path={ROUTES.ADMIN_COURSES} element={<AdminContentListPage kind="courses" />} />
                <Route path={ROUTES.ADMIN_COURSE_CREATE} element={<AdminCourseCreatePage />} />
                <Route path={ROUTES.ADMIN_COURSE_BUILDER} element={<AdminCourseBuilderPage />} />
                <Route path={ROUTES.ADMIN_COURSE_PREVIEW} element={<AdminCoursePreviewPage />} />
                <Route path={ROUTES.ADMIN_LESSONS} element={<AdminContentListPage kind="lessons" />} />
                <Route path={ROUTES.ADMIN_LESSON_BUILDER} element={<AdminLessonBuilderPage />} />
                <Route path={ROUTES.ADMIN_LESSON_PREVIEW} element={<AdminLessonPreviewPage />} />
                <Route path={ROUTES.ADMIN_QUESTIONS} element={<AdminQuestionBankPage />} />
                <Route path={ROUTES.ADMIN_QUIZZES} element={<AdminContentListPage kind="quizzes" />} />
                <Route path={ROUTES.ADMIN_QUIZ_BUILDER} element={<AdminQuizBuilderPage />} />
                <Route path={ROUTES.ADMIN_QUIZ_PREVIEW} element={<AdminQuizPreviewPage />} />
                <Route path={ROUTES.ADMIN_VOCABULARY} element={<AdminVocabularyPage />} />
                <Route path={ROUTES.ADMIN_REGIONAL_LANGUAGE} element={<AdminRegionalLanguagePage />} />
                <Route path="/admin/regional-language" element={<Navigate to={ROUTES.ADMIN_REGIONAL_LANGUAGE} replace />} />
                <Route path={ROUTES.ADMIN_IMPORT} element={<AdminImportPage />} />
                <Route path={ROUTES.ADMIN_IMPORT_HISTORY} element={<AdminImportHistoryPage />} />
                <Route path={ROUTES.ADMIN_DESTINATIONS} element={<AdminDestinationsPage />} />
                <Route path={ROUTES.ADMIN_DESTINATION_DETAIL} element={<AdminDestinationDetailPage />} />
                <Route path={ROUTES.CONTENT_VOCABULARY} element={<AdminVocabularyPage />} />
                <Route path={ROUTES.CONTENT_REGIONAL_LANGUAGE} element={<AdminRegionalLanguagePage />} />
                <Route path="/content/regional-language" element={<Navigate to={ROUTES.CONTENT_REGIONAL_LANGUAGE} replace />} />
                <Route path={ROUTES.CONTENT_IMPORT} element={<AdminImportPage />} />
                <Route path={ROUTES.CONTENT_IMPORT_HISTORY} element={<AdminImportHistoryPage />} />
                <Route path={ROUTES.CONTENT_DESTINATIONS} element={<AdminDestinationsPage />} />
                <Route path={ROUTES.CONTENT_DESTINATION_DETAIL} element={<AdminDestinationDetailPage />} />
                <Route path={ROUTES.ADMIN_JOURNEY} element={<Navigate to={ROUTES.ADMIN_DESTINATIONS} replace />} />
                <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
                <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
                <Route path={ROUTES.ADMIN_USER_DETAIL} element={<AdminUserDetailPage />} />
                <Route path={ROUTES.ADMIN_ROLES} element={<Navigate to={ROUTES.ADMIN_USERS} replace />} />
                <Route path={ROUTES.ADMIN_ACHIEVEMENTS} element={<AdminAchievementsPage />} />
                <Route path={ROUTES.ADMIN_XP_RULES} element={<AdminXpRulesPage />} />
                <Route path={ROUTES.ADMIN_AUDIT_LOGS} element={<Navigate to={ROUTES.ADMIN} replace />} />
                <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminSettingsPage />} />
                <Route path={ROUTES.ADMIN_SITE_CONTENT} element={<AdminSiteContentPage />} />

                {/* Admin Văn hóa & AI (Người 4) */}
                <Route path={ROUTES.CONTENT_CULTURE} element={<AdminCultureListPage />} />
                <Route path={ROUTES.ADMIN_CULTURE} element={<AdminCultureListPage />} />
                <Route path={ROUTES.CONTENT_CULTURE_NEW} element={<AdminCultureEditPage />} />
                <Route path={ROUTES.ADMIN_CULTURE_NEW} element={<AdminCultureEditPage />} />
                <Route path={ROUTES.CONTENT_CULTURE_EDIT} element={<AdminCultureEditPage />} />
                <Route path={ROUTES.ADMIN_CULTURE_EDIT} element={<AdminCultureEditPage />} />
                <Route path={ROUTES.CONTENT_CULTURE_CATEGORIES} element={<AdminCultureCategoriesPage />} />
                <Route path={ROUTES.ADMIN_CULTURE_CATEGORIES} element={<AdminCultureCategoriesPage />} />
                <Route path={ROUTES.ADMIN_AI_SCENARIOS} element={<AdminAiScenariosPage />} />
                <Route path={ROUTES.ADMIN_AI_SCENARIO_NEW} element={<AdminScenarioBuilderPage />} />
                <Route path={ROUTES.ADMIN_AI_SCENARIO_BUILDER} element={<AdminScenarioBuilderPage />} />
                <Route path={ROUTES.ADMIN_AI_SETTINGS} element={<AdminAiSettingsPage />} />
                <Route path={ROUTES.ADMIN_AI_USAGE} element={<AdminAiUsagePage />} />
                <Route path={ROUTES.ADMIN_AI_REVIEWS} element={<AdminAiReviewsPage />} />
              </Route>
            </Route>
          </Routes></Suspense>
    </>
  );
}

