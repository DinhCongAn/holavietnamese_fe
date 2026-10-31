import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

test('AiSidebarContext exports provider, hook, and implements required auto-collapse & resizing logic', () => {
  const contextFile = path.join(projectRoot, 'src/features/ai/context/AiSidebarContext.jsx');
  assert.ok(fs.existsSync(contextFile), 'AiSidebarContext.jsx must exist');

  const content = fs.readFileSync(contextFile, 'utf8');
  assert.ok(content.includes('export function AiSidebarProvider'), 'Must export AiSidebarProvider');
  assert.ok(content.includes('export function useAiSidebar'), 'Must export useAiSidebar hook');
  
  // Verify auto-collapse left menu when AI opened
  assert.ok(
    content.includes("setIsSidebarCollapsed(true)") &&
    content.includes("'hola:sidebar-collapsed'"),
    'openAiSidebar must automatically collapse left sidebar and save to localStorage'
  );

  // Verify width clamping and localStorage persistence
  assert.ok(
    content.includes("STORAGE_WIDTH_KEY") && content.includes("Math.max"),
    'Width must be persisted and clamped'
  );

  // Verify quiz / standalone /ai-tutor protection
  assert.ok(
    content.includes("/quizzes/") && content.includes("/ai-tutor"),
    'Must prevent opening during quizzes or on full /ai-tutor page'
  );
});

test('CourseraAiSidebar implements left resizer handle, Coursera blue banner, greeting, chips, and mic input', () => {
  const componentFile = path.join(projectRoot, 'src/features/ai/components/ai/CourseraAiSidebar.jsx');
  assert.ok(fs.existsSync(componentFile), 'CourseraAiSidebar.jsx must exist');

  const content = fs.readFileSync(componentFile, 'utf8');

  // Verify Left Resizer handle
  assert.ok(
    content.includes('coursera-ai-resizer') &&
    content.includes('handleMouseDown') &&
    content.includes('handleTouchStart'),
    'CourseraAiSidebar must feature a resizer handle supporting mouse and touch dragging'
  );

  // Verify Blue Announcement banner matching Coursera screenshot
  assert.ok(
    content.includes('coursera-ai-banner') &&
    content.includes('Mới! Hola AI đã hiểu ngữ cảnh bài học'),
    'CourseraAiSidebar must feature Coursera-style announcement card'
  );

  // Verify Personalized Greeting
  assert.ok(
    content.includes('coursera-ai-greeting') &&
    content.includes('greetingName'),
    'CourseraAiSidebar must render personalized learner greeting'
  );

  // Verify Suggestion prompt chips
  assert.ok(
    content.includes('coursera-ai-chip') &&
    content.includes('Gợi ý câu hỏi bài học:') && content.includes('handleSendMessage(item.text)'),
    'CourseraAiSidebar must offer lesson question chips'
  );

  // Verify sticky bottom input with mic and send arrow
  assert.ok(
    content.includes('coursera-ai-input') &&
    content.includes('toggleSpeechRecognition') &&
    content.includes('ArrowUp'),
    'CourseraAiSidebar must have input with mic recognition and ArrowUp send button'
  );

  // Verify disclaimer
  assert.ok(
    content.includes('coursera-ai-disclaimer'),
    'CourseraAiSidebar must have legal AI disclaimer'
  );
});

test('Learner topbar opens the AI sidebar', () => {
  const topbarFile = path.join(projectRoot, 'src/shared/components/learner/LearnerShell.jsx');
  const content = fs.readFileSync(topbarFile, 'utf8');
  assert.ok(content.includes('learner-topbar__ai-btn'), 'Learner topbar must render an AI button');
  assert.ok(content.includes('openAiSidebar()'), 'Clicking the button must open the AI sidebar');
});

test('MainLayout coordinates 3-column CSS Grid layout and passes dynamic width style', () => {
  const layoutFile = path.join(projectRoot, 'src/shared/layouts/MainLayout.jsx');
  const content = fs.readFileSync(layoutFile, 'utf8');

  assert.ok(content.includes('AiSidebarProvider'), 'MainLayout must wrap shell in AiSidebarProvider');
  assert.ok(content.includes('CourseraAiSidebar'), 'MainLayout must render CourseraAiSidebar');
  assert.ok(content.includes('<LearnerTopbar'), 'MainLayout must expose the learner topbar trigger');
  assert.ok(content.includes("'has-ai-sidebar'"), 'Layout shell must have has-ai-sidebar class');
  assert.ok(content.includes("'--ai-sidebar-width'"), 'Layout shell must set --ai-sidebar-width custom property');
});

test('coach-ai-sidebar.css reserves desktop width and provides a responsive mobile drawer', () => {
  const cssFile = path.join(projectRoot, 'src/styles/coach-ai-sidebar.css');
  assert.ok(fs.existsSync(cssFile), 'coach-ai-sidebar.css must exist');

  const content = fs.readFileSync(cssFile, 'utf8');
  assert.ok(content.includes('.layout-shell.has-ai-sidebar'), 'Must define has-ai-sidebar grid styles');
  assert.ok(content.includes('width: calc(100% - var(--ai-sidebar-width'), 'Open AI sidebar must reserve its width');
  assert.ok(content.includes('margin-right: var(--ai-sidebar-width'), 'Page content must move clear of the docked AI sidebar');
  assert.ok(content.includes('@media (max-width: 820px)'), 'Must provide responsive drawer fallback for small screens');
});

test('LearnerTopbar and LessonLearningPage expose AI Assistant triggers', () => {
  const topbarFile = path.join(projectRoot, 'src/shared/components/learner/LearnerShell.jsx');
  const topbarContent = fs.readFileSync(topbarFile, 'utf8');
  assert.ok(topbarContent.includes('learner-topbar__ai-btn'), 'LearnerTopbar must have AI Coach trigger button');

  const lessonFile = path.join(projectRoot, 'src/features/learning/pages/learning/LessonLearningPage.jsx');
  const lessonContent = fs.readFileSync(lessonFile, 'utf8');
  assert.ok(lessonContent.includes('setLearningContext'), 'LessonLearningPage must provide the active lesson to AI Coach');
  assert.ok(lessonContent.includes('LessonContextSyncer'), 'LessonLearningPage must sync lesson context with AI assistant');
});
