import { BilingualText, bilingualLabel } from '@/shared/components/common/BilingualText';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NotificationDropdown } from '@/shared/components/common/NotificationDropdown';
import { Brand } from '@/shared/components/layout/Brand';
import { MainNavigation } from '@/shared/components/layout/MainNavigation';
import { UserMenu } from '@/shared/components/layout/UserMenu';
import { Menu, X, Flame, Zap } from 'lucide-react';

export function AppHeader({ isAuthenticated, user, loading, stats, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const role = String(user?.role || '').replace(/^ROLE_/, '');
  const isAdmin = role === 'ADMIN';
  const isContentManager = role === 'CONTENT';
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Brand compact />
        <button className="mobile-menu-button secondary" aria-label={bilingualLabel("Mở menu điều hướng", "Open navigation menu")} aria-controls="primary-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
        <div className={`site-header__navigation ${menuOpen ? 'is-open' : ''}`}><MainNavigation onNavigate={() => setMenuOpen(false)} /></div>
        <div className="site-header__actions">
          {loading ? <span className="site-header__loading" aria-label={bilingualLabel("Đang tải", "Loading")}>•••</span> : isAuthenticated ? (
            <>
              <div className="learner-stats" aria-label={bilingualLabel("Thống kê học tập", "Learning statistics")}>
                <span title={bilingualLabel("Chuỗi ngày học liên tục", "Day streak")}><Flame size={15} aria-hidden="true"/> <strong>{stats.streak}</strong></span>
                <span title={bilingualLabel("Tổng điểm kinh nghiệm", "Total XP")}><Zap size={15} aria-hidden="true"/> <strong>{stats.xp}</strong> XP</span>
              </div>
              <NotificationDropdown />
              <UserMenu user={user} isAdmin={isAdmin} isContentManager={isContentManager} onLogout={onLogout} />
            </>
          ) : (
            <div className="site-header__guest-actions">
              <Link to="/login" className="site-header__login"><BilingualText vi="Đăng nhập" en="Sign In" /></Link>
              <Link to="/welcome" className="site-header__cta"><BilingualText vi="Học miễn phí" en="Start Learning Free" /></Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
