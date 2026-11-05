import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, Check, ChevronRight, Medal, Play, ShieldCheck, Volume2, X } from 'lucide-react';
import {
  benefits, dailyGoals, firstLessonQuestions, learningReasons, levelOptions,
  placementBands, placementQuestions, getPlacementQuestions, evaluatePlacementTest,
  PLACEMENT_DISTRIBUTIONS, TIER_THRESHOLDS,
} from '../data/onboardingData';
import { useOnboarding } from '../context/OnboardingContext';
import { Brand, Confetti, LessonHeader, Mascot, OnboardingLayout, PrimaryButton, SelectionCard } from '../components/OnboardingUI';
import { buildLearningPathPath, buildOnboardingRecommendation } from '../services/recommendationEngine';
import { onboardingService } from '../services/onboardingService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { LanguageSwitcher } from '@/shared/components/common/LanguageSwitcher';

const speak = (text) => {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN'; utterance.rate = 0.78;
  window.speechSynthesis.speak(utterance);
  return true;
};

const playFeedbackTone = (correct) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = correct ? 660 : 190;
    gain.gain.setValueAtTime(0.06, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + 0.16);
    oscillator.addEventListener('ended', () => context.close());
  } catch { /* Audio feedback is an optional enhancement. */ }
};

export function WelcomePage() {
  const navigate = useNavigate();
  const { reset } = useOnboarding();
  const { isAuthenticated } = useAuth();
  const startOnboarding = () => {
    reset();
    if (isAuthenticated) {
      navigate('/onboarding/reason');
      return;
    }
    navigate('/register', { state: { from: '/onboarding/reason' } });
  };
  return (
    <div className="ob-welcome">
      <header>
        <Brand />
        <div className="ob-welcome-actions">
          <LanguageSwitcher compact />
          <button onClick={() => navigate('/login')} type="button" className="ob-login-link">
            <BilingualText vi="ĐĂNG NHẬP" en="LOG IN" />
          </button>
        </div>
      </header>
      <main>
        <motion.div className="ob-welcome-art" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}>
          <Mascot message={<BilingualText vi="Xin chào! Bạn đã sẵn sàng khám phá chưa?" en="Xin chào! Ready for an adventure?" />} />
        </motion.div>
        <motion.div className="ob-welcome-copy" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}>
          <span className="ob-kicker">
            <BilingualText vi="HÀNH TRÌNH TIẾNG VIỆT CỦA BẠN BẮT ĐẦU TẠI ĐÂY" en="YOUR VIETNAMESE ADVENTURE STARTS HERE" />
          </span>
          <h1>
            <BilingualText vi={<>Học tiếng Việt<br /><em>theo cách thật vui!</em></>} en={<>Learn Vietnamese<br /><em>the fun way!</em></>} />
          </h1>
          <p>
            <BilingualText vi="Khám phá Việt Nam, tự tin giao tiếp và kết nối với hàng triệu người nói tiếng Việt qua các bài học tương tác đầy thú vị." en="Discover Vietnam, speak confidently, and connect with millions of Vietnamese speakers through fun, interactive lessons." />
          </p>
          <PrimaryButton onClick={startOnboarding}>
            <BilingualText vi="BẮT ĐẦU" en="GET STARTED" />
          </PrimaryButton>
          <button className="ob-outline" type="button" onClick={() => navigate('/login', { state: { from: '/onboarding/reason' } })}>
            <BilingualText vi="TÔI ĐÃ CÓ TÀI KHOẢN" en="I ALREADY HAVE AN ACCOUNT" />
          </button>
          <button className="ob-text-link" type="button" onClick={() => navigate('/')}>
            <BilingualText vi="Khám phá với tư cách khách" en="Explore as guest" /> <ChevronRight size={15} />
          </button>
          <div className="ob-trust">
            <span><ShieldCheck size={16} /> <BilingualText vi="Bài học đầu miễn phí" en="Free first lesson" /></span>
            <span><Play size={16} /> <BilingualText vi="Học qua thực hành" en="Learn by doing" /></span>
            <span><Medal size={16} /> <BilingualText vi="Tiến bộ thực tế vững chắc" en="Built for real progress" /></span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export function ReasonPage() {
  const { data, update } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCount = data.learningReasons.length;

  useEffect(() => {
    const requestedDestination = location.state?.onboardingGate ? location.state?.from : null;
    if (['/learning-path', '/edtech/dashboard'].some(path => requestedDestination?.startsWith(path)) && requestedDestination !== data.requestedDestination) {
      update({ requestedDestination });
    }
  }, [data.requestedDestination, location.state, update]);

  const toggle = (id) => update({
    learningReasons: data.learningReasons.includes(id)
      ? data.learningReasons.filter((item) => item !== id)
      : [...data.learningReasons, id],
  });

  return (
    <OnboardingLayout
      eyebrow={<BilingualText vi="CÁ NHÂN HÓA HÀNH TRÌNH CỦA BẠN" en="LET'S PERSONALIZE YOUR JOURNEY" />}
      title={<BilingualText vi="Điều gì quan trọng nhất với bạn khi học tiếng Việt?" en="What matters most to you when learning Vietnamese?" />}
      mascotMessage={data.learningReasons.length
        ? <BilingualText vi="Mình sẽ dùng các lựa chọn này để ưu tiên nội dung và khóa học phù hợp nhất." en="I’ll use these choices to prioritize the right content and courses for you." />
        : <BilingualText vi="Bạn có thể chọn một hoặc nhiều mục tiêu phù hợp với bạn nhé!" en="Choose one or more goals that matter to you!" />}
      wide
    >
      <div className="ob-grid two">
        {learningReasons.map((item) => {
          const selected = data.learningReasons.includes(item.id);
          return (
            <SelectionCard
              key={item.id}
              {...item}
              selected={selected}
              disabled={false}
              onClick={() => toggle(item.id)}
            />
          );
        })}
      </div>
      <p className="ob-note">
        <BilingualText
          vi={selectedCount ? `${selectedCount} mục tiêu đã chọn · Lựa chọn đầu tiên là ưu tiên chính.` : 'Bạn có thể chọn nhiều mục tiêu mong muốn.'}
          en={selectedCount ? `${selectedCount} goals selected · Your first choice is the primary priority.` : 'You can select multiple goals.'}
        />
      </p>
      <div className="ob-actions">
        <PrimaryButton disabled={!data.learningReasons.length} onClick={() => navigate('/onboarding/level')} />
      </div>
    </OnboardingLayout>
  );
}

export function LevelPage() {
  const { data, update } = useOnboarding();
  const navigate = useNavigate();
  if (!data.learningReasons.length) return <Navigate to="/onboarding/reason" replace />;

  const isLevelSelected = Boolean(data.selectedLevel || data.currentLevel);

  return (
    <OnboardingLayout
      eyebrow={<BilingualText vi="ĐIỂM BẮT ĐẦU CỦA BẠN" en="YOUR STARTING POINT" />}
      title={<BilingualText vi="Bạn muốn kiểm tra hoặc bắt đầu từ trình độ nào?" en="Which level do you want to assess or start with?" />}
      mascotMessage={isLevelSelected
        ? <BilingualText vi="Tuyệt vời — hệ thống sẽ chuẩn bị bài kiểm tra phù hợp với trình độ bạn chọn!" en="Great — we’ll prepare a placement test tailored to your chosen level!" />
        : <BilingualText vi="Hãy chọn cấp độ bạn tự tin nhất hoặc muốn thử sức nhé!" en="Select the level you feel most confident in or want to challenge yourself with!" />}
      wide
    >
      <div className="ob-grid six">
        {levelOptions.map((item) => (
          <SelectionCard
            key={item.id}
            {...item}
            selected={data.selectedLevel === item.id || data.currentLevel === item.id}
            onClick={() => update({ currentLevel: item.id, selectedLevel: item.id })}
          />
        ))}
      </div>
      <p className="ob-note">
        <BilingualText
          vi="Hệ thống sẽ cung cấp bài test 15 câu gồm các tầng kiến thức nền tảng tương ứng với cấp độ bạn đã chọn."
          en="A 15-question test with tiered questions will evaluate both your foundation and chosen level."
        />
      </p>
      <div className="ob-actions">
        <PrimaryButton disabled={!isLevelSelected} onClick={() => navigate('/onboarding/benefits')} />
      </div>
    </OnboardingLayout>
  );
}

export function BenefitsPage() {
  const navigate = useNavigate();
  const { data } = useOnboarding();
  if (!data.currentLevel && !data.selectedLevel) return <Navigate to="/onboarding/level" replace />;

  return (
    <OnboardingLayout
      eyebrow={<BilingualText vi="MỖI NGÀY MỘT CHÚT" en="A LITTLE EVERY DAY" />}
      title={<BilingualText vi="Đây là những gì bạn sẽ làm được!" en="Here's what you'll be able to do!" />}
      mascotMessage={<BilingualText vi="Từng bước nhỏ mỗi ngày sẽ tạo nên tiến bộ vượt bậc!" en="Small steps every day can lead to amazing progress!" />}
      wide
    >
      <div className="ob-benefits">
        {benefits.map(({ icon: Icon, title, titleVi, detail, detailVi }, index) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
          >
            <Icon size={22} />
            <div>
              <strong><BilingualText vi={titleVi || title} en={title} /></strong>
              <span><BilingualText vi={detailVi || detail} en={detail} /></span>
            </div>
            <Check size={18} strokeWidth={2.8} />
          </motion.article>
        ))}
      </div>
      <div className="ob-quote">
        <BilingualText
          vi="Kết quả sẽ tăng lên theo trình độ, sự đều đặn và luyện tập của bạn — không hứa hẹn viển vông, chỉ có lộ trình rõ ràng."
          en="Your results will grow with your level, consistency, and practice — no unrealistic promises, just a clear path forward."
        />
      </div>
      <div className="ob-actions">
        <PrimaryButton onClick={() => navigate('/onboarding/daily-goal')} />
      </div>
    </OnboardingLayout>
  );
}

export function DailyGoalPage() {
  const { data, update } = useOnboarding();
  const navigate = useNavigate();
  if (!data.currentLevel && !data.selectedLevel) return <Navigate to="/onboarding/level" replace />;
  const selected = dailyGoals.find((goal) => goal.minutes === data.dailyGoalMinutes);

  return (
    <OnboardingLayout
      eyebrow={<BilingualText vi="XÂY DỰNG THÓI QUEN" en="BUILD YOUR HABIT" />}
      title={<BilingualText vi="Mỗi ngày bạn có thể dành bao nhiêu thời gian học tiếng Việt?" en="How much time can you spend learning Vietnamese each day?" />}
      mascotMessage={<BilingualText vi={`${data.dailyGoalMinutes} phút là mục tiêu tuyệt vời. Cố lên nhé!`} en={`${data.dailyGoalMinutes} minutes is a wonderful goal. You've got this!`} />}
      wide
    >
      <div className="ob-grid four">
        {dailyGoals.map((goal) => (
          <SelectionCard
            key={goal.minutes}
            {...goal}
            title={`${goal.minutes} minutes/day`}
            titleVi={`${goal.minutes} phút/ngày`}
            detail={`${goal.label} · ${goal.detail}`}
            detailVi={`${goal.labelVi || goal.label} · ${goal.detailVi || goal.detail}`}
            badge={goal.recommended ? 'RECOMMENDED' : null}
            badgeVi={goal.recommended ? 'KHUYÊN DÙNG' : null}
            selected={data.dailyGoalMinutes === goal.minutes}
            onClick={() => update({ dailyGoalMinutes: goal.minutes })}
          />
        ))}
      </div>
      <div className="ob-goal-meter">
        <div>
          <span><BilingualText vi="Nhịp độ hàng ngày" en="Your daily rhythm" /></span>
          <strong><BilingualText vi={selected?.labelVi || selected?.label} en={selected?.label} /></strong>
        </div>
        <div className="ob-meter">
          <motion.span animate={{ width: `${Math.min(100, (data.dailyGoalMinutes / 30) * 100)}%` }} transition={{ duration: 0.3 }} />
        </div>
        <small><BilingualText vi="Đều đặn quan trọng hơn sự hoàn hảo." en="Consistency matters more than perfection." /></small>
      </div>
      <div className="ob-actions">
        <PrimaryButton onClick={() => navigate('/onboarding/learning-path')} />
      </div>
    </OnboardingLayout>
  );
}

export function LearningPathPage() {
  const { data, update } = useOnboarding();
  const navigate = useNavigate();
  const activeLevel = data.selectedLevel || data.currentLevel || 'A1';

  if (!data.learningReasons.length || (!data.currentLevel && !data.selectedLevel)) {
    return <Navigate to="/onboarding/reason" replace />;
  }

  const choosePlacement = () => {
    update({ learningPath: 'placement' });
    window.setTimeout(() => navigate('/onboarding/placement-test'), 180);
  };

  return (
    <OnboardingLayout
      eyebrow={<BilingualText vi="XÁC ĐỊNH TRÌNH ĐỘ" en="FIND YOUR LEVEL" />}
      title={<BilingualText vi="Tìm điểm bắt đầu phù hợp với bạn" en="Find the right place to start" />}
      mascotMessage={<BilingualText vi={`Làm bài kiểm tra 15 câu theo cấp độ ${activeLevel} để mình xếp lớp chính xác nhất nhé!`} en={`Take a 15-question test tailored to level ${activeLevel} to find your exact placement!`} />}
      wide
    >
      <div className="ob-paths ob-paths-single">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          className={`ob-path-card answer-card placement ${data.learningPath === 'placement' ? 'is-selected' : ''}`}
          aria-selected={data.learningPath === 'placement'}
          data-state={data.learningPath === 'placement' ? 'checked' : 'unchecked'}
          style={{ backgroundColor: '#ffffff' }}
          onClick={choosePlacement}
        >
          <em><BilingualText vi={`BÀI TEST TRÌNH ĐỘ ${activeLevel} · 5 PHÚT`} en={`PLACEMENT TEST · LEVEL ${activeLevel} · 5 MIN`} /></em>
          <h2><BilingualText vi={`Kiểm tra trình độ ${activeLevel}`} en={`Find My Level (${activeLevel})`} /></h2>
          <p><BilingualText vi={`Hệ thống phân bổ 15 câu hỏi kiểm tra nền tảng và kiến thức trọng tâm cấp độ ${activeLevel}.`} en={`15 questions evaluating foundational knowledge up to level ${activeLevel}.`} /></p>
          <div className="ob-path-details">
            <span><Check size={16} /> <BilingualText vi="15 câu · Khoảng 5 phút" en="15 questions · About 5 minutes" /></span>
            <span><BookOpen size={16} /> <BilingualText vi="Đánh giá theo từng tầng kiến thức" en="Tiered waterfall assessment" /></span>
          </div>
          <strong><BilingualText vi="LÀM BÀI KIỂM TRA" en="TAKE THE TEST" /> <ChevronRight size={16} /></strong>
        </motion.button>
      </div>
    </OnboardingLayout>
  );
}

function ExerciseRunner({ mode }) {
  const { data, update } = useOnboarding();
  const navigate = useNavigate();
  const activeLevel = data.selectedLevel || data.currentLevel || 'A1';

  const questions = useMemo(
    () => (mode === 'lesson' ? firstLessonQuestions : getPlacementQuestions(activeLevel)),
    [mode, activeLevel]
  );

  const storedIndex = mode === 'lesson' ? data.lessonQuestionIndex : data.placementQuestionIndex;
  const [index, setIndex] = useState(Math.min(storedIndex || 0, questions.length - 1));
  const [answers, setAnswers] = useState(mode === 'lesson' ? (data.lessonAnswers || []) : (data.placementAnswers || []));
  const [selected, setSelected] = useState('');
  const [tokens, setTokens] = useState([]);
  const [checked, setChecked] = useState(false);
  const [sound, setSound] = useState(true);

  const question = questions[index] || questions[0];
  const response = question.type === 'arrange' ? tokens.join(' ') : selected;
  const correct = response === question.answer;

  const chooseToken = (token) => {
    if (!checked && !tokens.includes(token)) setTokens([...tokens, token]);
  };

  const onCheck = () => {
    if (!response) return;
    setChecked(true);
    if (sound) playFeedbackTone(correct);
  };

  const onContinue = () => {
    const nextAnswers = [...answers];
    nextAnswers[index] = { questionId: question.id, response, correct };
    setAnswers(nextAnswers);

    if (index === questions.length - 1) {
      if (mode === 'lesson') {
        const score = nextAnswers.filter((item) => item?.correct).length;
        const accuracy = Math.round((score / questions.length) * 100);
        const completion = {
          firstLessonCompleted: true,
          firstLessonResult: {
            correct: score,
            total: questions.length,
            accuracy,
            targetLevel: 'A0',
            xp: 20,
          },
          lessonAnswers: nextAnswers,
        };
        const recommendation = buildOnboardingRecommendation({
          ...data,
          ...completion,
          guestExperienceCompleted: true,
        });
        update({ ...completion, recommendation, guestExperienceCompleted: true });
        navigate('/onboarding/completed', { state: { mode } });
        return;
      }

      // Placement test evaluation using the Tiered Waterfall algorithm
      const evaluation = evaluatePlacementTest(activeLevel, nextAnswers, questions);
      const completion = {
        selectedLevel: evaluation.selectedLevel,
        assessedLevel: evaluation.assessedLevel,
        placementScore: evaluation.placementScore,
        tierScores: evaluation.tierScores,
        placementTestCompleted: true,
        placementResult: {
          selectedLevel: evaluation.selectedLevel,
          assessedLevel: evaluation.assessedLevel,
          placementScore: evaluation.placementScore,
          correct: evaluation.placementScore,
          total: evaluation.totalQuestions,
          accuracy: evaluation.accuracy,
          tierScores: evaluation.tierScores,
          targetLevel: evaluation.assessedLevel,
          level: evaluation.assessedLevel,
          explanationVi: evaluation.explanationVi,
          explanationEn: evaluation.explanationEn,
          completedAt: new Date().toISOString(),
          xp: 30,
        },
        placementAnswers: nextAnswers,
      };

      const recommendation = buildOnboardingRecommendation({
        ...data,
        ...completion,
        targetLevel: evaluation.assessedLevel,
        guestExperienceCompleted: true,
      });

      update({ ...completion, recommendation, guestExperienceCompleted: true });
      navigate('/onboarding/completed', { state: { mode } });
      return;
    }

    const next = index + 1;
    setIndex(next);
    setSelected('');
    setTokens([]);
    setChecked(false);
    update(mode === 'lesson'
      ? { lessonQuestionIndex: next, lessonAnswers: nextAnswers }
      : { placementQuestionIndex: next, placementAnswers: nextAnswers }
    );
  };

  const exit = () => {
    if (window.confirm(bilingualLabel(`Rời khỏi ${mode === 'lesson' ? 'bài học' : 'bài kiểm tra'}? Các câu trả lời của bạn đã được lưu.`, `Leave this ${mode === 'lesson' ? 'lesson' : 'test'}? Your answered questions are saved.`))) {
      navigate('/onboarding/learning-path');
    }
  };

  return (
    <div className="ob-exercise-shell">
      <LessonHeader current={index + 1} total={questions.length} onExit={exit} sound={sound} onSound={() => setSound(!sound)} />
      <main className="ob-exercise">
        <div className="ob-exercise-title">
          <span>
            {mode === 'lesson' ? (
              <BilingualText vi="BÀI 1 · LỜI CHÀO CĂN BẢN" en="LESSON 1 · BASIC GREETINGS" />
            ) : (
              <BilingualText
                vi={`KIỂM TRA TRÌNH ĐỘ · MỤC TIÊU ${activeLevel}`}
                en={`PLACEMENT TEST · TARGET ${activeLevel}`}
              />
            )}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {mode === 'placement' && question?.level && (
              <span className={`ob-tier-pill level-${question.level.toLowerCase()}`}>
                <BilingualText vi={`Tầng ${question.level}`} en={`Tier ${question.level}`} />
              </span>
            )}
            <strong>
              {mode === 'lesson' ? (
                <BilingualText vi="Học qua thực hành" en="Learn by doing" />
              ) : (
                <BilingualText
                  vi={`Câu hỏi ${index + 1} / ${questions.length}`}
                  en={`Question ${index + 1} of ${questions.length}`}
                />
              )}
            </strong>
          </div>
        </div>
        <div className="ob-coach">
          <Mascot compact message={question.type === 'listen' ? <BilingualText vi="Chạm vào loa và lắng nghe kỹ nhé!" en="Tap the speaker and listen closely!" /> : index === 0 ? <BilingualText vi="Bình tĩnh làm nhé — mình ở ngay đây!" en="Take your time — I’m right here!" /> : <BilingualText vi="Làm tốt lắm. Tiếp tục nào!" en="Nice momentum. Keep going!" />} />
        </div>
        <AnimatePresence mode="wait">
          <motion.section key={question.id} className="ob-question" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.22 }}>
            {question.type === 'listen' && (
              <button type="button" className="ob-listen" onClick={() => speak(question.speak)}>
                <Volume2 size={18} />
                <BilingualText vi="NGHE ÂM THANH" en="PLAY AUDIO" />
              </button>
            )}
            <h1>{question.promptVi ? <BilingualText vi={question.promptVi} en={question.prompt} /> : question.prompt}</h1>
            {question.type === 'arrange' ? (
              <>
                <div className="ob-sentence">
                  {tokens.length ? (
                    tokens.map((token) => (
                      <button key={token} type="button" onClick={() => !checked && setTokens(tokens.filter((item) => item !== token))}>
                        {token}
                      </button>
                    ))
                  ) : (
                    <span><BilingualText vi="Chạm vào các từ bên dưới để ghép câu" en="Tap the words below to build the sentence" /></span>
                  )}
                </div>
                <div className="ob-token-bank">
                  {question.tokens.map((token) => (
                    <button type="button" key={token} disabled={tokens.includes(token) || checked} onClick={() => chooseToken(token)}>
                      {token}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="ob-answer-grid">
                {question.options.map((option) => {
                  const isSelected = selected === option;
                  const isCorrect = checked && option === question.answer;
                  const isWrong = checked && isSelected && !correct;

                  return (
                    <button
                      type="button"
                      key={option}
                      disabled={checked}
                      onClick={() => setSelected(option)}
                      className={`answer-card ${isSelected ? 'is-selected selected' : ''} ${isCorrect ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''}`}
                      aria-selected={isSelected}
                      data-state={isSelected ? 'checked' : 'unchecked'}
                      style={!isCorrect && !isWrong ? { backgroundColor: '#ffffff' } : undefined}
                    >
                      <span>{option}</span>
                      {isCorrect && <Check size={18} strokeWidth={2.8} />}
                      {isWrong && <X size={18} strokeWidth={2.8} />}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.section>
        </AnimatePresence>
      </main>
      <footer className={`ob-feedback ${checked ? (correct ? 'correct' : 'wrong') : ''}`}>
        <div>
          {checked && (
            <>
              <span className="ob-feedback-icon">
                {correct ? <Check size={20} strokeWidth={3} /> : '!'}
              </span>
              <div>
                <strong>{correct ? <BilingualText vi="Tuyệt vời!" en="Excellent!" /> : <BilingualText vi="Chưa chính xác" en="Not quite yet" />}</strong>
                <p>
                  {correct
                    ? (question.noteVi ? <BilingualText vi={question.noteVi} en={question.note} /> : (question.note || <BilingualText vi="Chính xác rồi!" en="That is correct!" />))
                    : <BilingualText vi={<>Đáp án đúng: <b>{question.answer}</b></>} en={<>Correct answer: <b>{question.answer}</b></>} />}
                </p>
              </div>
            </>
          )}
        </div>
        {mode === 'placement'
          ? <PrimaryButton disabled={!response} onClick={onContinue}>{index === questions.length - 1 ? <BilingualText vi="XEM KẾT QUẢ" en="SEE RESULTS" /> : <BilingualText vi="CÂU TIẾP THEO" en="NEXT QUESTION" />}</PrimaryButton>
          : !checked
            ? <PrimaryButton disabled={!response} onClick={onCheck}><BilingualText vi="TRẢ LỜI" en="ANSWER" /></PrimaryButton>
            : <PrimaryButton onClick={onContinue}>{index === questions.length - 1 ? <BilingualText vi="HOÀN THÀNH BÀI HỌC" en="FINISH LESSON" /> : <BilingualText vi="TIẾP TỤC" en="CONTINUE" />}</PrimaryButton>}
      </footer>
    </div>
  );
}

export function FirstLessonPage() {
  const { data } = useOnboarding();
  const [practiceStarted, setPracticeStarted] = useState(false);
  if (data.learningPath !== 'beginner') return <Navigate to="/onboarding/learning-path" replace />;
  if (practiceStarted) return <ExerciseRunner mode="lesson" />;

  const phrases = [
    { vi: 'Xin chào', en: 'Hello' },
    { vi: 'Cảm ơn', en: 'Thank you' },
    { vi: 'Tạm biệt', en: 'Goodbye' },
  ];

  return <OnboardingLayout
    eyebrow={<BilingualText vi="BÀI 1 · LỜI CHÀO CĂN BẢN" en="LESSON 1 · BASIC GREETINGS" />}
    title={<BilingualText vi="Học trước, luyện tập sau" en="Learn first, practise next" />}
    mascotMessage={<BilingualText vi="Đây là bài học, không phải bài kiểm tra. Hãy nghe và làm quen với ba cụm từ đầu tiên nhé!" en="This is a lesson, not a test. Listen and get familiar with your first three phrases!" />}
    backTo="/onboarding/learning-path"
    progressStep={5}
  >
    <section className="ob-lesson-intro">
      <div className="ob-lesson-intro-heading">
        <BookOpen />
        <div>
          <strong><BilingualText vi="Ba cụm từ đầu tiên" en="Your first three phrases" /></strong>
          <span><BilingualText vi="Chạm vào từng cụm từ để nghe phát âm." en="Tap each phrase to hear its pronunciation." /></span>
        </div>
      </div>
      <div className="ob-lesson-phrases">
        {phrases.map((phrase) => (
          <button key={phrase.vi} type="button" onClick={() => speak(phrase.vi)}>
            <span><b>{phrase.vi}</b><small>{phrase.en}</small></span>
            <Volume2 />
          </button>
        ))}
      </div>
    </section>
    <p className="ob-note"><BilingualText vi="Sau phần này, bạn sẽ luyện tập có hướng dẫn và được giải thích đáp án ngay." en="Next, you will practise with guidance and receive an explanation after every answer." /></p>
    <div className="ob-actions"><PrimaryButton onClick={() => setPracticeStarted(true)}><BilingualText vi="BẮT ĐẦU LUYỆN TẬP" en="START PRACTICE" /></PrimaryButton></div>
  </OnboardingLayout>;
}
export const PlacementTestPage = () => <ExerciseRunner mode="placement" />;

export function CompletionPage() {
  const { data } = useOnboarding();
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const mode = location.state?.mode || (data.placementTestCompleted ? 'placement' : 'lesson');
  const result = mode === 'placement' ? data.placementResult : data.firstLessonResult;
  if (!result) return <Navigate to="/onboarding/learning-path" replace />;

  const recommendation = data.recommendation || buildOnboardingRecommendation(data);
  const learningPathPath = buildLearningPathPath(recommendation);

  const handleShowRecommendations = async () => {
    setSaving(true);
    try {
      await onboardingService.syncProgress();
      await fetchProfile();
      navigate(learningPathPath);
    } catch {
      // Keep the result visible so the learner can retry saving without losing answers.
    } finally {
      setSaving(false);
    }
  };

  const selectedLvl = result.selectedLevel || data.selectedLevel || data.currentLevel || 'A1';
  const assessedLvl = result.assessedLevel || recommendation.targetLevel;

  return (
    <div className="ob-complete">
      <Confetti />
      <Brand />
      <div className="ob-complete-actions">
        <LanguageSwitcher compact />
      </div>
      <main>
        <div className="ob-celebrate"><Mascot celebration /></div>
        <span className="ob-complete-kicker">
          <Medal size={16} /> {mode === 'lesson' ? <BilingualText vi="HOÀN THÀNH BÀI HỌC ĐẦU TIÊN" en="FIRST LESSON COMPLETE" /> : <BilingualText vi="ĐÃ TÌM THẤY ĐIỂM XUẤT PHÁT" en="STARTING POINT FOUND" />}
        </span>
        <h1>
          <BilingualText vi="Lộ trình cá nhân hóa của bạn đã sẵn sàng" en="Your personalized learning path is ready" />
        </h1>
        <p>
          <BilingualText vi="Đề xuất này kết hợp mục tiêu học, kết quả đánh giá phân tầng và thời gian bạn có thể duy trì mỗi ngày." en="This recommendation combines your goals, tiered placement results, and your daily rhythm." />
        </p>

        {mode === 'placement' && (
          <div className="ob-placement-assessment">
            <div className="ob-placement-summary-cards">
              <div className="ob-summary-card">
                <span className="ob-card-label">
                  <BilingualText vi="CẤP BẠN CHỌN" en="SELECTED LEVEL" />
                </span>
                <strong className="ob-card-val target">
                  {selectedLvl}
                </strong>
                <small className="ob-card-sub">
                  <BilingualText vi="Mục tiêu ban đầu" en="Initial goal" />
                </small>
              </div>

              <div className="ob-summary-card primary">
                <span className="ob-card-label">
                  <BilingualText vi="HỆ THỐNG ĐÁNH GIÁ" en="ASSESSED LEVEL" />
                </span>
                <strong className="ob-card-val assessed">
                  {assessedLvl}
                </strong>
                <small className="ob-card-sub">
                  <BilingualText vi="Điểm xuất phát tối ưu" en="Optimal starting point" />
                </small>
              </div>

              <div className="ob-summary-card">
                <span className="ob-card-label">
                  <BilingualText vi="TỔNG ĐIỂM TEST" en="TOTAL SCORE" />
                </span>
                <strong className="ob-card-val score">
                  {result.placementScore ?? result.correct}/{result.total}
                </strong>
                <small className="ob-card-sub">
                  {result.accuracy}% <BilingualText vi="chính xác" en="accuracy" />
                </small>
              </div>
            </div>

            {result.tierScores && Object.keys(result.tierScores).length > 0 && (
              <div className="ob-tier-breakdown">
                <div className="ob-tier-heading">
                  <ShieldCheck size={18} />
                  <span>
                    <BilingualText
                      vi="Đánh giá chi tiết theo từng tầng kiến thức"
                      en="Detailed Tier-by-Tier Evaluation"
                    />
                  </span>
                </div>
                <div className="ob-tier-grid">
                  {Object.values(result.tierScores).map((tierItem) => (
                    <div
                      key={tierItem.tier}
                      className={`ob-tier-card ${tierItem.passed ? 'passed' : 'failed'}`}
                    >
                      <div className="ob-tier-card-header">
                        <span className="ob-tier-name">Tầng {tierItem.tier}</span>
                        <span className={`ob-tier-status ${tierItem.passed ? 'pass' : 'fail'}`}>
                          {tierItem.passed ? (
                            <>
                              <Check size={14} strokeWidth={3} />
                              <BilingualText vi="Đạt chuẩn" en="Passed" />
                            </>
                          ) : (
                            <>
                              <X size={14} strokeWidth={3} />
                              <BilingualText vi="Chưa đạt" en="Not yet" />
                            </>
                          )}
                        </span>
                      </div>
                      <div className="ob-tier-score-row">
                        <strong>
                          {tierItem.correct}/{tierItem.total}
                        </strong>
                        <span>({tierItem.percent}%)</span>
                      </div>
                      <div className="ob-tier-bar">
                        <div
                          className="ob-tier-fill"
                          style={{
                            width: `${Math.min(100, tierItem.percent)}%`,
                            backgroundColor: tierItem.passed ? '#16A34A' : '#F59E0B',
                          }}
                        />
                      </div>
                      <small className="ob-tier-req">
                        <BilingualText
                          vi={`Yêu cầu đạt: ≥ ${tierItem.threshold}%`}
                          en={`Passing threshold: ≥ ${tierItem.threshold}%`}
                        />
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(result.explanationVi || result.explanationEn) && (
              <div className="ob-assessment-explanation">
                <p>
                  <BilingualText
                    vi={result.explanationVi}
                    en={result.explanationEn || result.explanationVi}
                  />
                </p>
              </div>
            )}
          </div>
        )}

        <div className="ob-stats">
          <article>
            <strong>{recommendation.targetLevel}</strong>
            <span><BilingualText vi="ĐIỂM BẮT ĐẦU" en="STARTING LEVEL" /></span>
          </article>
          <article>
            <strong>{recommendation.sessionsPerWeek}</strong>
            <span><BilingualText vi="BUỔI / TUẦN" en="SESSIONS / WEEK" /></span>
          </article>
          <article>
            <strong>{recommendation.weeklyMinutes}</strong>
            <span><BilingualText vi="PHÚT / TUẦN" en="MINUTES / WEEK" /></span>
          </article>
        </div>
        <div className="ob-recommend">
          <BookOpen />
          <div>
            <span><BilingualText vi="LỘ TRÌNH ĐỀ XUẤT" en="RECOMMENDED PATH" /></span>
            <strong><BilingualText vi={recommendation.titleVi} en={recommendation.titleEn} /></strong>
            <small><BilingualText vi={recommendation.summaryVi} en={recommendation.summaryEn} /></small>
          </div>
        </div>
        <div className="ob-plan-grid">
          <section>
            <span><BilingualText vi="TRỌNG TÂM HỌC" en="LEARNING FOCUS" /></span>
            <ul>
              {recommendation.focusVi.map((focus, index) => (
                <li key={focus}>
                  <Check size={15} />
                  <BilingualText vi={focus} en={recommendation.focusEn[index]} />
                </li>
              ))}
            </ul>
          </section>
          <section>
            <span><BilingualText vi="NHỊP HỌC ĐỀ XUẤT" en="RECOMMENDED PACE" /></span>
            <strong><BilingualText vi={recommendation.paceTitleVi} en={recommendation.paceTitleEn} /></strong>
            <p><BilingualText vi={recommendation.paceDetailVi} en={recommendation.paceDetailEn} /></p>
            <small><BilingualText vi={`Dự kiến ${recommendation.estimatedWeeks} tuần để hoàn thành chặng đầu tiên.`} en={`About ${recommendation.estimatedWeeks} weeks for your first milestone.`} /></small>
          </section>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center' }}>
          <PrimaryButton disabled={saving} onClick={handleShowRecommendations}>
            {saving
              ? <BilingualText vi="ĐANG LƯU LỘ TRÌNH…" en="SAVING YOUR PLAN…" />
              : mode === 'placement'
                ? <BilingualText vi="LƯU VÀ XEM LỘ TRÌNH ĐỀ XUẤT" en="SAVE AND VIEW MY RECOMMENDED PATH" />
                : <BilingualText vi="LƯU VÀ XEM KHÓA HỌC PHÙ HỢP" en="SAVE AND VIEW MATCHING COURSES" />}
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
}
