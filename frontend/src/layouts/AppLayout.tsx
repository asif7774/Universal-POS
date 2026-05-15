import React, { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { useOffline } from 'contexts/OfflineContext';
import Sidebar from 'components/organisms/sidebar/Sidebar';

const SkeletonBar = () => (
  <div className="skeleton" style={{ height: 20, borderRadius: 6, marginBottom: 8 }} />
);

const AppSkeleton = () => (
  <div className="app-shell">
    <div style={{ background: 'var(--tux-navy)', width: 260 }} />
    <div style={{ padding: 24 }}>
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
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: isOnline ? 'var(--status-success)' : '#B45309',
      color: 'white',
      padding: '8px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      fontSize: '.82rem', fontWeight: 600,
      animation: 'slideDown .25s ease',
    }}>
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
      <div className="app-shell" style={{ marginTop: (!isOnline) ? 38 : 0, transition: 'margin-top .25s ease' }}>
        <Sidebar />
        <div className="main-content">
          <Suspense fallback={
            <div style={{ padding: 24 }}>
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
