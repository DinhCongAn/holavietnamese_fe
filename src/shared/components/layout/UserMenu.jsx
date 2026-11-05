import { BilingualText, useBilingualLabel } from '@/shared/components/common/BilingualText';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { ContentImage } from '@/shared/components/common/ContentImage';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown, UserRound, Settings, Trophy, Shield, LogOut, GraduationCap, TrendingUp } from 'lucide-react';
import { useConfirmDialog } from '@/shared/components/common/ConfirmDialog';
import { canImportVocabulary, canReadExplore, canReadVocabulary } from '@/utils/permissions/contentAccess';
import { learnerService } from '@/features/learning/api/learnerService';

export function UserMenu({ user, isAdmin, isContentManager, onLogout }) {
  const contentAdminPath = canReadVocabulary(user) ? ROUTES.CONTENT_VOCABULARY
    : canReadExplore(user) ? ROUTES.CONTENT_DESTINATIONS
      : canImportVocabulary(user) ? ROUTES.CONTENT_IMPORT
        : null;
  const label = useBilingualLabel();
  const [open, setOpen] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const menuRef = useRef(null);
  const displayName = user?.fullName || user?.username || label('Học viên', 'Learner');
  const reduceMotion = useReducedMotion();
  const { confirm, confirmationDialog } = useConfirmDialog();

  useEffect(() => {
    if (!open) return;
    learnerService.getProgressData().then((res) => setProgressData(res)).catch(() => {});
  }, [open]);

  const handleLogout = async () => {
    closeMenu();
    const confirmed = await confirm({
      title: <BilingualText vi="Đăng xuất khỏi HolaVietnamese?" en="Log out of HolaVietnamese?" />,
      description: <BilingualText vi="Bạn có chắc chắn muốn đăng xuất không?" en="Are you sure you want to log out?" />,
      confirmLabel: <BilingualText vi="Đăng xuất" en="Log Out" />,
      cancelLabel: <BilingualText vi="Hủy" en="Cancel" />,
      tone: 'danger',
    });
    if (confirmed) {
      onLogout();
    }
  };

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setOpen((value) => !value)}
        aria-label={label(`Menu tài khoản của ${displayName}`, `Account menu for ${displayName}`)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="user-menu__avatar">
          <ContentImage
            src={user?.avatarUrl}
            alt={label(`Ảnh đại diện của ${displayName}`, `Avatar of ${displayName}`)}
            className="user-menu__avatar-image"
            width={30}
            height={30}
            loading="eager"
            referrerPolicy="no-referrer"
            fallback={<span aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span>}
          />
        </span>
        <span className="user-menu__name">{displayName}</span>
        <ChevronDown className="user-menu__chevron" size={16} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="user-menu__panel"
            role="menu"
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          >
            <div className="user-menu__identity">
              <strong>{displayName}</strong>
              <span>
                {user?.email || `@${user?.username || 'learner'}`} ·{' '}
                <BilingualText
                  vi={isAdmin ? 'Quản trị viên' : isContentManager ? 'Quản lý nội dung' : 'Học viên'}
                  en={isAdmin ? 'Administrator' : isContentManager ? 'Content Manager' : 'Learner'}
                />
              </span>
            </div>
            <Link
              to={ROUTES.PROGRESS}
              onClick={closeMenu}
              className="user-menu__progress-badge"
              role="menuitem"
            >
              <div className="flex items-center justify-between text-xs font-bold text-[#EA580C] mb-1">
                <span className="flex items-center gap-1.5">
                  <TrendingUp size={14} />
                  <BilingualText
                    vi={`Cấp ${progressData?.currentLevel ?? 1}: ${progressData?.levelTitle || 'Tập sự'}`}
                    en={`Lv. ${progressData?.currentLevel ?? 1}: ${progressData?.levelTitleEn || 'Beginner'}`}
                  />
                </span>
                <span className="text-xs text-[#253044] font-black">
                  {progressData?.totalXp ?? user?.totalXp ?? 0} XP
                </span>
              </div>
              <div className="w-full h-2 bg-[#E8E5DF]/70 rounded-full overflow-hidden my-1">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#EA580C] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(8, progressData?.levelProgressPercent ?? 15))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                <span>
                  <BilingualText vi="Tiến độ lên cấp" en="To next level" />
                </span>
                <span className="font-semibold text-[#EA580C]">
                  {progressData?.levelProgressPercent ?? 0}% ({progressData?.totalXp ?? user?.totalXp ?? 0}/{progressData?.nextLevelRequiredXp ?? 100} XP)
                </span>
              </div>
            </Link>
            <Link to={ROUTES.PROGRESS} onClick={closeMenu} role="menuitem">
              <TrendingUp size={16} />
              <BilingualText vi="Tiến độ học tập" en="Learning Progress" />
            </Link>
            <Link to={ROUTES.MY_LEARNING} onClick={closeMenu} role="menuitem">
              <GraduationCap size={16} />
              <BilingualText vi="Góc học tập của tôi" en="My Learning" />
            </Link>
            <Link to="/profile" onClick={closeMenu} role="menuitem">
              <UserRound size={16} />
              <BilingualText vi="Hồ sơ cá nhân" en="My Profile" />
            </Link>
            <Link to="/settings" onClick={closeMenu} role="menuitem">
              <Settings size={16} />
              <BilingualText vi="Cài đặt học tập" en="Settings" />
            </Link>
            <Link to="/achievements" onClick={closeMenu} role="menuitem">
              <Trophy size={16} />
              <BilingualText vi="Thành tích" en="Achievements" />
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={closeMenu} role="menuitem" className="user-menu__admin">
                <Shield size={16} />
                <BilingualText vi="Trang quản trị" en="Admin Panel" />
              </Link>
            )}
            {isContentManager && !isAdmin && (
              <Link to={ROUTES.CONTENT_COURSES} onClick={closeMenu} role="menuitem" className="user-menu__admin">
                <Shield size={16} />
                <BilingualText vi="Quản lý khóa học" en="Manage Courses" />
              </Link>
            )}
            {!isContentManager && contentAdminPath && !isAdmin && (
              <Link to={contentAdminPath} onClick={closeMenu} role="menuitem" className="user-menu__admin">
                <Shield size={16} />
                <BilingualText vi="Quản lý nội dung" en="Content Management" />
              </Link>
            )}
            <button type="button" className="user-menu__logout" onClick={handleLogout} role="menuitem">
              <LogOut size={16} />
              <BilingualText vi="Đăng xuất" en="Log Out" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {confirmationDialog}
    </div>
  );
}
