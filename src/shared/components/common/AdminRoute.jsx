import { BilingualText } from '@/shared/components/common/BilingualText';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { canImportVocabulary, canReadExplore, canReadVocabulary } from '@/utils/permissions/contentAccess';

export function AdminRoute() {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-surface)' }}>
        <p style={{ color: 'var(--color-red-hover)', fontWeight: 'bold' }}><BilingualText>{"Đang xác thực quyền Quản trị…"}</BilingualText></p>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  const role = String(user?.role || '').replace(/^ROLE_/, '');
  const isAdmin = role === 'ADMIN';
  const isContentManager = role === 'CONTENT';
  const contentPath = ['/content/courses', '/content/lessons', '/content/questions', '/content/quizzes', '/admin/courses', '/admin/lessons', '/admin/questions', '/admin/quizzes']
    .some(path => location.pathname === path || location.pathname.startsWith(`${path}/`));
  const vocabularyPath = ['/admin/vocabulary', '/admin/regional-language']
    .some(path => location.pathname === path || location.pathname.startsWith(`${path}/`));
  const importPath = ['/admin/import', '/admin/imports']
    .some(path => location.pathname === path || location.pathname.startsWith(`${path}/`));
  const explorePath = ['/admin/destinations', '/admin/journey']
    .some(path => location.pathname === path || location.pathname.startsWith(`${path}/`));
  const moduleAllowed = vocabularyPath ? canReadVocabulary(user)
    : importPath ? canImportVocabulary(user)
      : explorePath ? canReadExplore(user)
        : null;

  if ((moduleAllowed === false)
    || (moduleAllowed === null && !isAdmin && !(isContentManager && contentPath))) {
    return (
      <Navigate
        to="/forbidden"
        replace
      />
    );
  }

  return <Outlet />;
}
