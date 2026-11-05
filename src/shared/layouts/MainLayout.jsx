import { BilingualText, useTextLanguage } from '@/shared/components/common/BilingualText';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AppFooter, LayoutToast } from '@/shared/components/layout';
import { learnerService } from '@/features/learning/api/learnerService';
import { PageTransition } from '@/shared/components/common/PageTransition';
import { LearnerSidebar, LearnerTopbar } from '@/shared/components/learner/LearnerShell';
import { GuestMobileDrawer, GuestSidebar, GuestTopbar } from '@/features/home/components/guest/GuestShell';
import { AiSidebarProvider, useAiSidebar } from '@/features/ai/context/AiSidebarContext';
import { CourseraAiSidebar } from '@/features/ai/components/ai/CourseraAiSidebar';


function MainLayoutShell({
  isAuthenticated,
  user,
  logout,
  learnerStats,
  toastError,
  setToastError,
  isSidebarCollapsed,
  toggleSidebar,
  guestDrawerOpen,
  setGuestDrawerOpen,
  closeGuestDrawer,
}) {
  const location = useLocation();
  useTextLanguage();
  const isGuestHome = (location.pathname === '/' || location.pathname === '') && !isAuthenticated;
  const { isOpen: isAiOpen, width: aiWidth, setWidth: setAiWidth, closeAiSidebar } = useAiSidebar();
  const bodyRef = useRef(null);
  const [topbarHeight, setTopbarHeight] = useState(0);

  useLayoutEffect(() => {
    const topbar = bodyRef.current?.querySelector('.learner-topbar, .guest-topbar');
    if (!topbar) return undefined;

    const updateHeight = () => setTopbarHeight(topbar.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(topbar);
    return () => observer.disconnect();
  }, [isAuthenticated]);

  return (
    <div
      className={`layout-shell ${isAuthenticated ? 'learner-app' : 'guest-app'} ${isSidebarCollapsed ? 'is-sidebar-collapsed' : ''} ${isAiOpen ? 'has-ai-sidebar' : ''}`}
      style={{
        '--ai-sidebar-width': `${aiWidth}px`,
        '--layout-topbar-height': `${topbarHeight}px`,
      }}
    >
      <a className="skip-link" href="#main-content"><BilingualText>{"Chuyển đến nội dung chính"}</BilingualText></a>
      <LayoutToast message={toastError} onClose={() => setToastError(null)} />
      {isAuthenticated ? (
        <LearnerSidebar collapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      ) : (
        <>
          <GuestSidebar collapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
          <GuestMobileDrawer open={guestDrawerOpen} onClose={closeGuestDrawer} />
        </>
      )}
      <div className="layout-shell__body" ref={bodyRef}>
        {isAuthenticated ? (
          <LearnerTopbar user={user} stats={learnerStats} onLogout={logout} />
        ) : (
          <GuestTopbar onOpenMenu={() => setGuestDrawerOpen(true)} />
        )}
        <main
          className={`layout-main ${isGuestHome ? 'layout-main--full' : ''} ${isAuthenticated ? 'learner-app__main' : 'guest-app__main'}`}
          id="main-content"
        >

          <PageTransition key={location.pathname}><Outlet /></PageTransition>

        </main>
        {isAuthenticated ? (
          <div className="learner-app__footer">
            <AppFooter />
          </div>
        ) : (
          <div className="guest-app__footer">
            <AppFooter />
          </div>
        )}
      </div>

      {/* Coursera Resizable Right AI Panel */}
      {isAiOpen && (
        <CourseraAiSidebar
          width={aiWidth}
          onResize={setAiWidth}
          onClose={closeAiSidebar}
        />
      )}



    </div>
  );
}

export function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  useTextLanguage();
  const [learnerStats, setLearnerStats] = useState({ streak: 0, xp: 0 });
  const [toastError, setToastError] = useState(location.state?.authError || null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('hola:sidebar-collapsed');
    if (saved !== null) return saved === 'true';
    const legacyKey = isAuthenticated ? 'hola:learner-sidebar' : 'hola:guest-sidebar';
    return localStorage.getItem(legacyKey) === 'collapsed';
  });
  const [guestDrawerOpen, setGuestDrawerOpen] = useState(false);

  useEffect(() => {
    if (!location.state?.authError) return undefined;
    setToastError(location.state.authError);
    const timer = setTimeout(() => setToastError(null), 5000);
    return () => clearTimeout(timer);
  }, [location.state]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLearnerStats({ streak: 0, xp: 0 });
      return;
    }

    learnerService.getProgressData()
      .then((progress) => setLearnerStats({ streak: progress.streakCount ?? 0, xp: progress.totalXp ?? 0 }))
      .catch(() => setLearnerStats({ streak: 0, xp: 0 }));
  }, [isAuthenticated]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((previous) => {
      const next = !previous;
      localStorage.setItem('hola:sidebar-collapsed', String(next));
      localStorage.setItem('hola:guest-sidebar', next ? 'collapsed' : 'expanded');
      localStorage.setItem('hola:learner-sidebar', next ? 'collapsed' : 'expanded');
      return next;
    });
  }, []);

  const closeGuestDrawer = useCallback(() => setGuestDrawerOpen(false), []);

  useEffect(() => closeGuestDrawer(), [location.pathname, closeGuestDrawer]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.getElementById('main-content')?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <AiSidebarProvider isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed}>
      <MainLayoutShell
        isAuthenticated={isAuthenticated}
        user={user}
        logout={logout}
        learnerStats={learnerStats}
        toastError={toastError}
        setToastError={setToastError}
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        guestDrawerOpen={guestDrawerOpen}
        setGuestDrawerOpen={setGuestDrawerOpen}
        closeGuestDrawer={closeGuestDrawer}
      />
    </AiSidebarProvider>
  );
}
