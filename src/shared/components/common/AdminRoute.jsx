import { BilingualText } from '@/shared/components/common/BilingualText';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { canImportVocabulary, canReadExplore, canReadVocabulary, canReadCulture } from '@/utils/permissions/contentAccess';

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
  const vocabularyPath = ['/content/vocabulary', '/content/regional-language', '/admin/vocabulary', '/admin/regional-language']
    .some(path => location.pathname === path || location.pathname.startsWith(`${path}/`));
  const importPath = ['/content/import', '/content/imports', '/admin/import', '/admin/imports']
    .some(path => location.pathname === path || location.pathname.startsWith(`${path}/`));
  const explorePath = ['/content/destinations', '/admin/destinations', '/admin/journey']
    .some(path => location.pathname === path || location.pathname.startsWith(`${path}/`));
  const culturePath = ['/admin/culture', '/admin/culture-categories', '/content/culture', '/content/culture-categories']
    .some(path => location.pathname === path || location.pathname.startsWith(`${path}/`));
  const moduleAllowed = vocabularyPath ? canReadVocabulary(user)
    : importPath ? canImportVocabulary(user)
      : explorePath ? canReadExplore(user)
        : culturePath ? canReadCulture(user)
          : null;

  if (!isAdmin && !isContentManager && moduleAllowed !== true) {
    return (
      <Navigate
        to="/forbidden"
        replace
      />
    );
  }

  // Phân rõ đường dẫn theo vai trò cho văn hóa:
  // Admin luôn dùng /admin/culture*, Content Manager luôn dùng /content/culture*
  if (isAdmin && location.pathname.startsWith('/content/culture')) {
    return <Navigate to={location.pathname.replace('/content/culture', '/admin/culture')} replace />;
  }
  if (isContentManager && !isAdmin && location.pathname.startsWith('/admin/culture')) {
    return <Navigate to={location.pathname.replace('/admin/culture', '/content/culture')} replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
