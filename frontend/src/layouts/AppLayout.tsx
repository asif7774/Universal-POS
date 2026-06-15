import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { useOffline } from 'contexts/OfflineContext';
import { PageHeaderProvider } from 'contexts/PageHeaderContext';
import Sidebar from 'components/organisms/sidebar/Sidebar';
import PageHeader from 'components/organisms/header';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

const SIDEBAR_W = 260;
const COLLAPSED_W = 72;

const SkeletonBar = () => (
  <div className="skeleton h-5 rounded-md mb-2" />
);

const AppSkeleton = () => (
  <div className="app-shell">
    <div className="bg-[var(--tux-navy)] w-[260px]" />
    <div className="p-6">
      <SkeletonBar />
      <SkeletonBar />
      <SkeletonBar />
    </div>
  </div>
);

// ── Offline Status Banner ─────────────────────────────────────
const OfflineBanner: React.FC = () => {
  const { isOnline, queuedItems } = useOffline();

  if (isOnline && queuedItems === 0) {return null;}

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] p-[8px_20px] flex items-center justify-center gap-2.5 text-[0.82rem] font-semibold text-white animate-slide-down ${isOnline ? 'bg-[var(--status-success)]' : 'bg-amber-700'}`}>
      <span>
        <SvgIcon name={isOnline ? 'check-circle' : 'warning'} width="18" height="18" />
      </span>
      {isOnline
        ? `Back online — syncing ${queuedItems} queued item${queuedItems !== 1 ? 's' : ''}...`
        : `You're offline — orders will be queued and synced when connected${queuedItems > 0 ? ` (${queuedItems} pending)` : ''}`
      }
    </div>
  );
};

const AppLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const { isOnline } = useOffline();

  // ── Sidebar state (owned here, passed down as props) ─────────
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1025);
  const [isPointerFine, setIsPointerFine] = useState(
    () => window.matchMedia('(pointer: fine)').matches
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1025);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const handler = (e: MediaQueryListEvent) => setIsPointerFine(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Permanent = wide screen AND fine pointer (mouse/trackpad). iPads always drawer.
  const isSidebarPermanent = isDesktop && isPointerFine;
  const sidebarWidth = isCollapsed ? COLLAPSED_W : SIDEBAR_W;

  const handleToggle = useCallback(() => setIsCollapsed(c => !c), []);
  const handleOpen = useCallback(() => setIsMobileOpen(true), []);
  const handleClose = useCallback(() => setIsMobileOpen(false), []);

  if (loading) {return <AppSkeleton />;}
  if (!isAuthenticated) {return <Navigate to="/login" replace />;}

  return (
    <PageHeaderProvider>
      <OfflineBanner />

      {/* Backdrop — mobile/touch drawer only */}
      <div
        className={[
          'fixed inset-0 bg-black/40 z-30 backdrop-blur-sm',
          'transition-opacity duration-300 ease-in-out',
          !isSidebarPermanent && isMobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={handleClose}
        aria-hidden="true"
      />

      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        isSidebarPermanent={isSidebarPermanent}
        isPointerFine={isPointerFine}
        onCloseMobileDrawer={handleClose}
        onToggleSidebar={handleToggle}
      />

      {/* Main content — margin only when sidebar is permanently visible */}
      <div
        className={`main-content transition-[margin-left] duration-300 ease-in-out ${!isOnline ? 'mt-[38px]' : ''}`}
        style={{ marginLeft: isSidebarPermanent ? `${sidebarWidth}px` : 0 }}
      >
        <PageHeader
          isSidebarPermanent={isSidebarPermanent}
          onOpenMobileDrawer={handleOpen}
        />
        <div className="page-body">
          <Suspense fallback={
            <div className="p-6">
              {[1,2,3].map(i => <SkeletonBar key={i} />)}
            </div>
          }>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </PageHeaderProvider>
  );
};

export default AppLayout;
