import React, { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
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

const AppLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <AppSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
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
  );
};

export default AppLayout;
