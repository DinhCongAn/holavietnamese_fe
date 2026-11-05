import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { BilingualText } from '@/shared/components/common/BilingualText';

export function RequireLearnerOnboarding() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3" role="status">
        <span className="loading-spinner" aria-hidden="true" />
        <p className="text-sm font-semibold text-[#253044]">
          <BilingualText vi="Đang kiểm tra tài khoản…" en="Checking account…" />
        </p>
      </div>
    );
  }

  const role = String(user.role || '').replace(/^ROLE_/, '');
  const allowed = role === 'LEARNER' || role === 'ADMIN' || role === 'CONTENT';
  if (!allowed) return <Navigate to="/forbidden" replace />;

  return <Outlet />;
}

export default RequireLearnerOnboarding;
