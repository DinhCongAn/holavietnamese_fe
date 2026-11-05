import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { BilingualText } from '@/shared/components/common/BilingualText';

export function RequireLearningPathOnboarding() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3" role="status">
        <span className="loading-spinner" aria-hidden="true" />
        <p className="text-sm font-semibold text-[#253044]">
          <BilingualText vi="Đang kiểm tra hồ sơ học tập…" en="Checking your learning profile…" />
        </p>
      </div>
    );
  }

  const role = String(user.role || '').replace(/^ROLE_/, '');
  const isBackOfficeAccount = role === 'ADMIN' || role === 'CONTENT';

  if (!isBackOfficeAccount && user.onboardingCompleted !== true) {
    return (
      <Navigate
        to="/onboarding/reason"
        replace
        state={{ from: location.pathname + location.search, onboardingGate: true }}
      />
    );
  }

  return <Outlet />;
}

export default RequireLearningPathOnboarding;
