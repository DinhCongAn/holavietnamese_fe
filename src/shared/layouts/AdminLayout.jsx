import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';

import { Menu, X, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getBackOfficeRoutes, ROUTES } from '@/constants/routes';
import { PageTransition } from '@/shared/components/common/PageTransition';
import { LanguageSwitcher } from '@/shared/components/common/LanguageSwitcher';
import { Brand } from '@/shared/components/layout/Brand';
import { canReadExplore, canReadVocabulary } from '@/utils/permissions/contentAccess';

const groupsFor = (managementRoutes) => [
  { title: 'Tổng quan', links: [[ROUTES.ADMIN, 'Dashboard'], [ROUTES.ADMIN_USERS, 'Người dùng']] },
  { title: 'Nội dung học tập', links: [[ROUTES.CONTENT_COURSES, 'Khóa học'], [ROUTES.CONTENT_LESSONS, 'Bài học'], [managementRoutes.vocabulary, 'Từ vựng'], [ROUTES.CONTENT_QUESTIONS, 'Ngân hàng câu hỏi'], [ROUTES.CONTENT_QUIZZES, 'Quiz']] },
  { title: 'Văn hóa & AI', links: [[managementRoutes.destinations, 'Điểm đến'], [ROUTES.ADMIN_CULTURE, 'Văn hóa'], [ROUTES.ADMIN_CULTURE_CATEGORIES, 'Danh mục văn hóa'], [ROUTES.ADMIN_AI_SCENARIOS, 'Kịch bản AI'], [ROUTES.ADMIN_AI_SETTINGS, 'Cấu hình AI'], [ROUTES.ADMIN_AI_USAGE, 'Sử dụng AI & chi phí'], [ROUTES.ADMIN_AI_REVIEWS, 'Chất lượng AI']] },
  { title: 'Hệ thống', links: [[ROUTES.ADMIN_ACHIEVEMENTS, 'Thành tích'], [ROUTES.ADMIN_XP_RULES, 'Quy tắc XP'], [ROUTES.ADMIN_SITE_CONTENT, 'Menu & banner'], [ROUTES.ADMIN_SETTINGS, 'Cài đặt']] },
];

export function AdminLayout() {
  const { user, logout, isAdmin, isContentManager } = useAuth();
  const [open, setOpen] = useState(false);
  const sidebar = useRef(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const controls = () => [...sidebar.current.querySelectorAll('a,button:not(:disabled)')];
    controls()[0]?.focus();
    const keydown = event => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Tab') {
        const items = controls(), first = items[0], last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [open]);
  const vocabularyAllowed = canReadVocabulary(user);
  const exploreAllowed = canReadExplore(user);
  const managementRoutes = getBackOfficeRoutes(isAdmin ? ROUTES.ADMIN : ROUTES.CONTENT_COURSES);
  const groups = groupsFor(managementRoutes);
  const managerAuthoringPaths = [ROUTES.CONTENT_COURSES, ROUTES.CONTENT_LESSONS, ROUTES.CONTENT_QUESTIONS, ROUTES.CONTENT_QUIZZES];
  const visibleGroups = groups.map(group => ({
    ...group,
    links: group.links.filter(([to]) => {
      if (to === managementRoutes.vocabulary) return vocabularyAllowed;
      if (to === managementRoutes.destinations) return exploreAllowed;
      if (managerAuthoringPaths.includes(to)) {
        return to === ROUTES.CONTENT_COURSES ? (isAdmin || isContentManager) : (isContentManager && !isAdmin);
      }
      return isAdmin;
    }).map(([to, label]) => {
      if (to === ROUTES.CONTENT_COURSES) return [to, isAdmin ? 'Duyệt khóa học' : 'Khóa học'];
      if (to === managementRoutes.vocabulary && isAdmin) return [to, 'Duyệt từ vựng'];
      return [to, label];
    }),
  })).filter(group => group.links.length > 0);
  const location = useLocation();
  const current = visibleGroups.flatMap(group => group.links).find(([to]) => location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to + '/')))?.[1] || 'Quản trị nội dung';
  return <div className={`admin-wrapper ${open ? 'admin-menu-open' : ''}`}>
    <a className="skip-link" href="#admin-content"><BilingualText>{"Chuyển đến nội dung chính"}</BilingualText></a>
    <aside ref={sidebar} id="admin-navigation" className="admin-sidebar">
      <div className="admin-sidebar-header">
        <Brand to={isAdmin ? '/admin' : (visibleGroups[0]?.links[0]?.[0] || '/')} />
      </div>
      <nav className="admin-nav" aria-label={bilingualLabel("Điều hướng quản lý nội dung", "Content management navigation")}>{visibleGroups.map(group => <div className="admin-nav-group" key={group.title}><p><BilingualText>{group.title}</BilingualText></p>{group.links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/admin'} onClick={() => setOpen(false)} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}><BilingualText vi={label} en={label === 'Duyệt khóa học' ? 'Course review' : label === 'Duyệt từ vựng' ? 'Vocabulary review' : undefined} /></NavLink>)}</div>)}</nav>
      <div className="admin-sidebar-footer"><Link to="/"><ArrowLeft size={16} aria-hidden="true"/><BilingualText>{"Giao diện học viên"}</BilingualText></Link><button className="admin-logout" onClick={logout}><LogOut size={16} aria-hidden="true"/><BilingualText>{"Đăng xuất"}</BilingualText></button></div>
    </aside>
    {open && <button className="admin-menu-backdrop" aria-label={bilingualLabel("Đóng menu", "Close menu")} onClick={() => setOpen(false)} />}
    <div className="admin-main-area"><header className="admin-topbar"><button className="mobile-menu-button secondary" aria-label={bilingualLabel("Mở menu quản lý", "Open management menu")} aria-controls="admin-navigation" aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? <X size={20}/> : <Menu size={20}/>}</button><span><BilingualText>{isAdmin ? "Quản trị /" : "Nội dung /"}</BilingualText><strong><BilingualText>{current}</BilingualText></strong></span><LanguageSwitcher compact /><span className="admin-identity"><BilingualText>{user?.fullName || user?.username || (isAdmin ? 'Quản trị viên' : 'Người quản lý nội dung')}</BilingualText> <span className="badge"><BilingualText>{isAdmin ? 'ADMIN' : 'CONTENT MANAGER'}</BilingualText></span></span></header><main className="admin-content" id="admin-content"><PageTransition key={location.pathname}><Outlet /></PageTransition></main></div>
  </div>;
}
