import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPlacementQuestions,
  evaluatePlacementTest,
  PLACEMENT_DISTRIBUTIONS,
  TIER_THRESHOLDS,
  levelOptions,
} from '../src/features/onboarding/data/onboardingData.js';
import { resolveTargetLevel, buildOnboardingRecommendation } from '../src/features/onboarding/services/recommendationEngine.js';

test('levelOptions contains all 6 CEFR levels A1 to C2 with badges and titles', () => {
  const ids = levelOptions.map((opt) => opt.id);
  assert.deepEqual(ids, ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  for (const opt of levelOptions) {
    assert.ok(opt.title && opt.titleVi);
    assert.ok(opt.detail && opt.detailVi);
    assert.ok(opt.badge && opt.badgeVi);
  }
});

test('getPlacementQuestions returns exactly 15 questions adhering to distribution table', () => {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  for (const lvl of levels) {
    const questions = getPlacementQuestions(lvl);
    assert.equal(questions.length, 15, `Level ${lvl} must have 15 questions`);

    const expectedDistribution = PLACEMENT_DISTRIBUTIONS[lvl];
    for (const [tier, expectedCount] of Object.entries(expectedDistribution)) {
      const actualCount = questions.filter((q) => q.level === tier).length;
      assert.equal(actualCount, expectedCount, `Level ${lvl} should have ${expectedCount} ${tier} questions`);
    }
  }
});

test('Scenario from user prompt: B1 test with 3/3 A1, 3/4 A2, 3/8 B1 places user at A2', () => {
  const questions = getPlacementQuestions('B1');
  assert.equal(questions.length, 15);

  const a1Questions = questions.filter((q) => q.level === 'A1');
  const a2Questions = questions.filter((q) => q.level === 'A2');
  const b1Questions = questions.filter((q) => q.level === 'B1');

  assert.equal(a1Questions.length, 3);
  assert.equal(a2Questions.length, 4);
  assert.equal(b1Questions.length, 8);

  // 3/3 A1 correct
  const answers = [
    ...a1Questions.map((q) => ({ questionId: q.id, response: q.answer, correct: true })),
    // 3/4 A2 correct
    ...a2Questions.slice(0, 3).map((q) => ({ questionId: q.id, response: q.answer, correct: true })),
    { questionId: a2Questions[3].id, response: 'wrong', correct: false },
    // 3/8 B1 correct
    ...b1Questions.slice(0, 3).map((q) => ({ questionId: q.id, response: q.answer, correct: true })),
    ...b1Questions.slice(3).map((q) => ({ questionId: q.id, response: 'wrong', correct: false })),
  ];

  const evalResult = evaluatePlacementTest('B1', answers, questions);

  assert.equal(evalResult.selectedLevel, 'B1');
  assert.equal(evalResult.placementScore, 9);
  assert.equal(evalResult.accuracy, 60); // 9 / 15 = 60%
  assert.equal(evalResult.assessedLevel, 'A2', 'User should be placed at A2 despite total score 60%');

  // Verify tierScores breakdown
  assert.equal(evalResult.tierScores.A1.correct, 3);
  assert.equal(evalResult.tierScores.A1.total, 3);
  assert.equal(evalResult.tierScores.A1.passed, true);

  assert.equal(evalResult.tierScores.A2.correct, 3);
  assert.equal(evalResult.tierScores.A2.total, 4);
  assert.equal(evalResult.tierScores.A2.passed, true);

  assert.equal(evalResult.tierScores.B1.correct, 3);
  assert.equal(evalResult.tierScores.B1.total, 8);
  assert.equal(evalResult.tierScores.B1.passed, false);

  assert.ok(evalResult.explanationVi.includes('A2'));
});

test('Scenario: B1 test where user passes B1 threshold (e.g. 6/8 B1, 3/3 A1, 3/4 A2) confirms B1', () => {
  const questions = getPlacementQuestions('B1');
  const a1Questions = questions.filter((q) => q.level === 'A1');
  const a2Questions = questions.filter((q) => q.level === 'A2');
  const b1Questions = questions.filter((q) => q.level === 'B1');

  const answers = [
    ...a1Questions.map((q) => ({ questionId: q.id, response: q.answer, correct: true })),
    ...a2Questions.slice(0, 3).map((q) => ({ questionId: q.id, response: q.answer, correct: true })),
    { questionId: a2Questions[3].id, response: 'wrong', correct: false },
    ...b1Questions.slice(0, 6).map((q) => ({ questionId: q.id, response: q.answer, correct: true })),
    ...b1Questions.slice(6).map((q) => ({ questionId: q.id, response: 'wrong', correct: false })),
  ];

  const evalResult = evaluatePlacementTest('B1', answers, questions);
  assert.equal(evalResult.assessedLevel, 'B1');
  assert.equal(evalResult.tierScores.B1.passed, true);
});

test('Scenario: Prerequisite foundation lost (misses A1 foundation) defaults to A0', () => {
  const questions = getPlacementQuestions('B1');
  const a1Questions = questions.filter((q) => q.level === 'A1');
  const a2Questions = questions.filter((q) => q.level === 'A2');
  const b1Questions = questions.filter((q) => q.level === 'B1');

  // Only 1/3 A1 correct (33% < 80% threshold)
  const answers = [
    { questionId: a1Questions[0].id, response: a1Questions[0].answer, correct: true },
    { questionId: a1Questions[1].id, response: 'wrong', correct: false },
    { questionId: a1Questions[2].id, response: 'wrong', correct: false },
    // 4/4 A2 correct
    ...a2Questions.map((q) => ({ questionId: q.id, response: q.answer, correct: true })),
    // 8/8 B1 correct
    ...b1Questions.map((q) => ({ questionId: q.id, response: q.answer, correct: true })),
  ];

  const evalResult = evaluatePlacementTest('B1', answers, questions);
  assert.equal(evalResult.assessedLevel, 'A0', 'Losing A1 foundation must stop progression at A0');
  assert.equal(evalResult.tierScores.A1.passed, false);
});

test('Integration with recommendationEngine: resolveTargetLevel picks assessedLevel', () => {
  const targetLevel = resolveTargetLevel({
    selectedLevel: 'B1',
    placementResult: { assessedLevel: 'A2', targetLevel: 'A2' },
  });
  assert.equal(targetLevel, 'A2');

  const recommendation = buildOnboardingRecommendation({
    learningReasons: ['travel'],
    selectedLevel: 'B1',
    placementResult: { assessedLevel: 'A2', targetLevel: 'A2' },
  });
  assert.equal(recommendation.targetLevel, 'A2');
});
