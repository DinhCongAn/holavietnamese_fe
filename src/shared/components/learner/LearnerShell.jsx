import { useMemo } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Bell, ChevronLeft, Flame, GraduationCap, Sparkles, Zap,
} from 'lucide-react';
import { useAiSidebar } from '@/features/ai/context/AiSidebarContext';
import { Brand } from '@/shared/components/layout/Brand';
import { UserMenu } from '@/shared/components/layout/UserMenu';
import { NotificationDropdown } from '@/shared/components/common/NotificationDropdown';
import { LanguageSwitcher } from '@/shared/components/common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { localizedSiteField, safeInternalPath, useSiteContent } from '@/features/admin/context/SiteContentContext';
import { siteContentIcon } from '@/shared/components/common/siteContentIcons';
import { MENU_PLACEMENTS } from '@/config/siteContentDefaults';

function useLearnerItems() {
  const { i18n } = useTranslation();
  const { getMenuItems } = useSiteContent();
  const language = i18n.resolvedLanguage || i18n.language || 'en';
  return useMemo(() => getMenuItems(MENU_PLACEMENTS.LEARNER)
    .filter((item) => item.code !== 'LEARNER_MY_LEARNING')
    .map((item) => ({
      ...item,
      to: safeInternalPath(item.path),
      label: localizedSiteField(item, 'label', language),
      icon: siteContentIcon(item.iconKey),
      status: localizedSiteField(item, 'status', language),
      end: item.path === '/',
      mobile: item.mobilePrimary === true,
    })), [getMenuItems, language]);
}

export function LearnerSidebar({ collapsed, onToggle }) {
  const { t } = useTranslation('navigation');
  const { pathname } = useLocation();
  const learnerItems = useLearnerItems();
  const notebookRoute = pathname === '/vocabulary/review' || pathname === '/vocabulary/notebook' || pathname.startsWith('/vocabulary/notebook/');

  return (
    <aside className="learner-sidebar" aria-label="Learner navigation">
      <button
        type="button"
        className="sidebar-toggle-btn"
        onClick={onToggle}
        aria-label={collapsed ? t('expandSidebar', { defaultValue: 'Mở rộng thanh điều hướng' }) : t('collapseSidebar', { defaultValue: 'Thu gọn thanh điều hướng' })}
        aria-expanded={!collapsed}
        title={collapsed ? t('expandSidebar', { defaultValue: 'Mở rộng menu' }) : t('collapseSidebar', { defaultValue: 'Thu gọn menu' })}
      >
        <ChevronLeft className="sidebar-toggle-btn__icon" />
      </button>
      <div className="learner-sidebar__brand"><Brand compact collapsed={collapsed} /></div>
      <nav className="learner-sidebar__nav">
        {learnerItems.map(({ id, code, to, label, icon: Icon, status, end, mobile, available }) => to && available !== false ? (
          <NavLink
            key={id ?? code}
            to={to}
            end={end}
            aria-current={notebookRoute ? (to === '/my-learning' ? 'page' : false) : undefined}
            className={({ isActive }) => `learner-sidebar__link ${mobile ? 'is-mobile-primary' : ''} ${(notebookRoute ? to === '/my-learning' : isActive) ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <span className="sidebar-link__icon"><Icon /></span>
            <b className="sidebar-link__label">{label}</b>
          </NavLink>
        ) : (
          <div key={id ?? code} className="learner-sidebar__link is-disabled" title={status ? `${label} — ${status}` : label} aria-disabled="true">
            <span className="sidebar-link__icon"><Icon /></span>
            <b className="sidebar-link__label">{label}</b>
            {status && <small className="learner-sidebar__status">{status}</small>}
          </div>
        ))}
      </nav>
      <div className="learner-sidebar__tip">
        <span>VI</span>
        <div>
          <strong>{t('keepRhythm', { defaultValue: 'Keep your rhythm' })}</strong>
          <small>{t('dailyVietnamese', { defaultValue: 'A little Vietnamese every day.' })}</small>
        </div>
      </div>
    </aside>
  );
}

export function LearnerTopbar({ user, stats, onLogout }) {
  const { t, i18n } = useTranslation('navigation');
  const location = useLocation();
  const learnerItems = useLearnerItems();
  const { openAiSidebar, isEligible } = useAiSidebar();
  const lang = i18n.resolvedLanguage || i18n.language || 'en';
  const isVi = lang.startsWith('vi');

  const title = useMemo(() => {
    if (location.pathname === '/vocabulary/review' || location.pathname === '/vocabulary/notebook' || location.pathname.startsWith('/vocabulary/notebook/')) {
      return isVi ? 'Góc học tập' : 'My Learning';
    }
    if (location.pathname === '/my-learning') {
      return isVi ? 'Góc học tập' : 'My Learning';
    }
    return learnerItems.find((item) => item.to && (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))?.label || t('learn');
  }, [learnerItems, location.pathname, t, isVi]);

  const level = user?.targetLevel || user?.level || '—';
  const hasEnergy = stats?.hearts != null || stats?.energy != null;
  const role = String(user?.role || '').replace(/^ROLE_/, '');
  const isAdmin = role === 'ADMIN';
  const isContentManager = role === 'CONTENT';

  return (
    <header className="learner-topbar">
      <div className="learner-topbar__welcome">
        <span>HOLAVIETNAMESE</span>
        <strong>{title}</strong>
      </div>
      <div className="learner-topbar__stats" aria-label="Learning statistics">
        <Link to="/progress" title={isVi ? 'Trình độ hiện tại' : 'Current learning level'}>
          <GraduationCap />
          <span><small>{isVi ? 'TRÌNH ĐỘ' : 'LEVEL'}</small><b>{level}</b></span>
        </Link>
        <Link to="/progress" title={isVi ? 'Chuỗi ngày học' : 'Daily streak'}>
          <Flame className="is-flame" />
          <span><small>{isVi ? 'CHUỖI' : 'STREAK'}</small><b>{stats?.streak ?? 0}</b></span>
        </Link>
        <Link to="/progress" title={isVi ? 'Tổng điểm kinh nghiệm' : 'Total experience'}>
          <Zap />
          <span><small>{isVi ? 'TỔNG XP' : 'TOTAL XP'}</small><b>{stats?.xp ?? 0}</b></span>
        </Link>
        {hasEnergy && (
          <span className="learner-topbar__energy">
            <small>{isVi ? 'NĂNG LƯỢNG' : 'ENERGY'}</small>
            <b>{stats.hearts ?? stats.energy}</b>
          </span>
        )}
      </div>
      <div className="learner-topbar__actions">
        {isEligible && (
          <button
            type="button"
            className="learner-topbar__ai-btn secondary"
            onClick={() => openAiSidebar()}
            title={isVi ? 'Mở Hola AI' : 'Open Hola AI'}
            aria-label={isVi ? 'Mở Hola AI' : 'Open Hola AI'}
            style={{
              height: '42px',
              minHeight: '42px',
              maxHeight: '42px',
              padding: '0 16px',
              borderRadius: '13px',
              boxSizing: 'border-box',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            <Sparkles size={16} />
            <span>Hola AI</span>
          </button>
        )}
        <LanguageSwitcher compact />
        <NotificationDropdown fallbackIcon={<Bell />} />
        <UserMenu user={user} isAdmin={isAdmin} isContentManager={isContentManager} onLogout={onLogout} />
      </div>
    </header>
  );
}
