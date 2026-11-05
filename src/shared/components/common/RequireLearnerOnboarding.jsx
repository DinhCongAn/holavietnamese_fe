import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { BilingualText } from '@/shared/components/common/BilingualText';
import { ROUTES } from '@/constants/routes';

export function RequireLearnerOnboarding() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3" role="status">
        <span className="loading-spinner" aria-hidden="true" />
        <p className="text-sm font-semibold text-[#253044]">
          <BilingualText vi="Đang kiểm tra tài khoản học viên…" en="Checking learner account…" />
        </p>
      </div>
    );
  }

  const role = String(user.role || '').replace(/^ROLE_/, '');
  if (role === 'ADMIN') return <Navigate to={ROUTES.ADMIN} replace />;
  if (role === 'CONTENT') return <Navigate to={ROUTES.CONTENT_COURSES} replace />;
  if (role !== 'LEARNER') return <Navigate to="/forbidden" replace />;

  return <Outlet />;
}

export default RequireLearnerOnboarding;
