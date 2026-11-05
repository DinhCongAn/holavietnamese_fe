import { BilingualText, bilingualLabel, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';

import { Menu, X, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ROUTES } from '@/constants/routes';
import { PageTransition } from '@/shared/components/common/PageTransition';
import { LanguageSwitcher } from '@/shared/components/common/LanguageSwitcher';
import { canReadExplore, canReadVocabulary, canReadCulture } from '@/utils/permissions/contentAccess';

const groups = [
  { title: 'Tổng quan', links: [[ROUTES.ADMIN, 'Dashboard'], [ROUTES.ADMIN_USERS, 'Người dùng']] },
  { title: 'Nội dung học tập', links: [[ROUTES.CONTENT_COURSES, 'Khóa học'], [ROUTES.CONTENT_LESSONS, 'Bài học'], [ROUTES.ADMIN_VOCABULARY, 'Từ vựng'], [ROUTES.CONTENT_QUESTIONS, 'Ngân hàng câu hỏi'], [ROUTES.CONTENT_QUIZZES, 'Quiz']] },
  { title: 'Văn hóa & AI', links: [[ROUTES.ADMIN_DESTINATIONS, 'Điểm đến'], [ROUTES.ADMIN_CULTURE, 'Văn hóa'], [ROUTES.ADMIN_CULTURE_CATEGORIES, 'Danh mục văn hóa'], [ROUTES.ADMIN_AI_SCENARIOS, 'Kịch bản AI'], [ROUTES.ADMIN_AI_SETTINGS, 'Cấu hình AI']] },
  { title: 'Hệ thống', links: [[ROUTES.ADMIN_ACHIEVEMENTS, 'Thành tích'], [ROUTES.ADMIN_XP_RULES, 'Quy tắc XP'], [ROUTES.ADMIN_ROLES, 'Vai trò & phân quyền'], [ROUTES.ADMIN_AUDIT_LOGS, 'Nhật ký hệ thống'], [ROUTES.ADMIN_SITE_CONTENT, 'Menu & banner'], [ROUTES.ADMIN_SETTINGS, 'Cài đặt']] },
];

export function AdminLayout() {
  useTextLanguage();
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
  const cultureAllowed = canReadCulture(user);

  const visibleGroups = groups.map(group => {
    let groupTitle = group.title;
    if (isContentManager && !isAdmin && group.title === 'Văn hóa & AI') {
      groupTitle = 'Văn hóa';
    }
    return {
      ...group,
      title: groupTitle,
      links: group.links.filter(([to]) => {
        if (to === ROUTES.ADMIN_VOCABULARY) return vocabularyAllowed;
        if (to === ROUTES.ADMIN_DESTINATIONS) return exploreAllowed;
        if (to === ROUTES.CONTENT_CULTURE || to === ROUTES.CONTENT_CULTURE_CATEGORIES || to === ROUTES.ADMIN_CULTURE || to === ROUTES.ADMIN_CULTURE_CATEGORIES) return cultureAllowed;
        if (isContentManager && !isAdmin) {
          return to === ROUTES.CONTENT_COURSES || to === ROUTES.CONTENT_LESSONS || to === ROUTES.CONTENT_QUESTIONS || to === ROUTES.CONTENT_QUIZZES;
        }
        return isAdmin;
      }).map(([to, label]) => {
        let finalTo = to;
        if (isContentManager && !isAdmin) {
          if (to === ROUTES.ADMIN_CULTURE) finalTo = ROUTES.CONTENT_CULTURE;
          if (to === ROUTES.ADMIN_CULTURE_CATEGORIES) finalTo = ROUTES.CONTENT_CULTURE_CATEGORIES;
        }
        return [
          finalTo,
          isContentManager && !isAdmin && to === ROUTES.CONTENT_COURSES
            ? 'Biên soạn khóa học'
            : (isAdmin && (to === ROUTES.ADMIN_CULTURE || to === ROUTES.CONTENT_CULTURE) ? 'Duyệt bài viết văn hóa' : label),
        ];
      }),
    };
  }).filter(group => group.links.length > 0);

  const location = useLocation();
  const contentFlowPrefixes = [ROUTES.CONTENT_COURSES, ROUTES.CONTENT_LESSONS, ROUTES.CONTENT_QUESTIONS, ROUTES.CONTENT_QUIZZES];
  const inContentFlow = contentFlowPrefixes.some(prefix => location.pathname === prefix || location.pathname.startsWith(prefix + '/'));
  const current = isContentManager && !isAdmin && inContentFlow
    ? 'Biên soạn khóa học'
    : visibleGroups.flatMap(group => group.links).find(([to]) => location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to + '/')))?.[1] || (isAdmin ? 'Quản trị hệ thống' : 'Quản lý nội dung');

  return (
    <div className={`admin-wrapper ${open ? 'admin-menu-open' : ''}`}>
      <a className="skip-link" href="#admin-content"><BilingualText>{"Chuyển đến nội dung chính"}</BilingualText></a>
      <aside ref={sidebar} id="admin-navigation" className="admin-sidebar">
        <Link to={isAdmin ? '/admin' : (visibleGroups[0]?.links[0]?.[0] || '/')} className="admin-sidebar-header">
          {isAdmin ? 'hola admin' : 'hola content'}
          <span><BilingualText>{isAdmin ? "SYSTEM & GOVERNANCE" : "CONTENT & LEARNING"}</BilingualText></span>
        </Link>
        <nav className="admin-nav" aria-label={bilingualLabel("Điều hướng quản lý", "Management navigation")}>
          {visibleGroups.map(group => (
            <div className="admin-nav-group" key={group.title}>
              <p><BilingualText>{group.title}</BilingualText></p>
              {group.links.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `admin-nav-item ${isActive || (isContentManager && !isAdmin && to === ROUTES.CONTENT_COURSES && inContentFlow) ? 'active' : ''}`}
                >
                  <BilingualText vi={label} en={label === 'Biên soạn khóa học' ? 'Course authoring' : undefined} />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/"><ArrowLeft size={16} aria-hidden="true"/><BilingualText>{"Giao diện học viên"}</BilingualText></Link>
          <button className="admin-logout" onClick={logout}><LogOut size={16} aria-hidden="true"/><BilingualText>{"Đăng xuất"}</BilingualText></button>
        </div>
      </aside>

      {open && <button className="admin-menu-backdrop" aria-label={bilingualLabel("Đóng menu", "Close menu")} onClick={() => setOpen(false)} />}

      <div className="admin-main-area">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="mobile-menu-button secondary"
              aria-label={bilingualLabel("Mở menu quản lý", "Open management menu")}
              aria-controls="admin-navigation"
              aria-expanded={open}
              onClick={() => setOpen(value => !value)}
            >
              {open ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <div className="admin-breadcrumb">
              <span className="admin-breadcrumb-prefix">
                <BilingualText>{isAdmin ? "Quản trị" : "Nội dung"}</BilingualText>
                <span className="admin-breadcrumb-separator">/</span>
              </span>
              <strong className="admin-breadcrumb-current">
                <BilingualText vi={current} en={current === 'Biên soạn khóa học' ? 'Course authoring' : undefined} />
              </strong>
            </div>
          </div>

          <div className="admin-topbar-right">
            <LanguageSwitcher compact />
            <span className="admin-identity">
              <span className="admin-identity-name">
                <BilingualText>{user?.fullName || user?.username || (isAdmin ? 'Quản trị viên' : 'Người quản lý nội dung')}</BilingualText>
              </span>
              <span className="badge">
                <BilingualText>{isAdmin ? 'ADMIN' : 'CONTENT MANAGER'}</BilingualText>
              </span>
            </span>
          </div>
        </header>

        <main className="admin-content" id="admin-content">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
