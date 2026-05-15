import React, { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { useOffline } from 'contexts/OfflineContext';
import Sidebar from 'components/organisms/sidebar/Sidebar';

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

  if (loading) {return <AppSkeleton />;}
  if (!isAuthenticated) {return <Navigate to="/login" replace />;}

  return (
    <>
      <OfflineBanner />
      <div className={`app-shell transition-[margin-top] duration-250 ease-in-out ${!isOnline ? 'mt-[38px]' : 'mt-0'}`}>
        <Sidebar />
        <div className="main-content">
          <Suspense fallback={
            <div className="p-6">
              {[1,2,3].map(i => <SkeletonBar key={i} />)}
            </div>
          }>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default AppLayout;
