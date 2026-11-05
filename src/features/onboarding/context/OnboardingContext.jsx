import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const STORAGE_KEY = 'hola:onboarding:v1';
export const initialOnboardingData = {
  version: 1,
  learningReasons: [],
  currentLevel: null,
  selectedLevel: null,
  assessedLevel: null,
  placementScore: null,
  tierScores: null,
  dailyGoalMinutes: 10,
  learningPath: null,
  firstLessonCompleted: false,
  placementTestCompleted: false,
  placementResult: null,
  firstLessonResult: null,
  recommendation: null,
  requestedDestination: null,
  guestExperienceCompleted: false,
  onboardingCompleted: false,
  updatedAt: null,
};

const readStored = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return parsed?.version === 1 ? { ...initialOnboardingData, ...parsed } : initialOnboardingData;
  } catch {
    return initialOnboardingData;
  }
};

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [data, setData] = useState(readStored);

  const update = useCallback((changes) => {
    setData((previous) => {
      const next = { ...previous, ...changes, version: 1, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(initialOnboardingData);
  }, []);

  const value = useMemo(() => ({ data, update, reset }), [data, update, reset]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return context;
}
