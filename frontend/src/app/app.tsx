import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from 'contexts/AuthContext';
import { SnackbarProvider, useSnackbar } from 'contexts/SnackbarContext';
import { OfflineProvider } from 'contexts/OfflineContext';
import { TenantProvider } from 'contexts/TenantContext';
import { PluginProvider, usePlugins } from 'contexts/PluginContext';
import AppLayout from 'layouts/AppLayout';
import { SvgSpriteLoader } from 'components/atoms/svg-sprite-loader';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, _error: unknown) => {
        // Don't retry on offline — use cached data
        if (!navigator.onLine) {return false;}
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      // Keep cached data for 5 minutes before considering stale
      staleTime: 5 * 60 * 1000,
    },
  },
});

// ── Pages (lazy loaded) ───────────────────────────────────────
const Login        = lazy(() => import('pages/login'));
const Dashboard    = lazy(() => import('pages/dashboard'));
const POS          = lazy(() => import('pages/pos'));
const Rentals      = lazy(() => import('pages/rentals'));
const Customers    = lazy(() => import('pages/customers'));
const Measurements = lazy(() => import('pages/measurements'));
const Tailoring    = lazy(() => import('pages/tailoring'));
const Inventory    = lazy(() => import('pages/inventory'));
const Appointments = lazy(() => import('pages/appointments'));
const Reports      = lazy(() => import('pages/reports'));
const Settings     = lazy(() => import('pages/settings'));
const AdminPanel   = lazy(() => import('pages/admin'));

const ComingSoon = ({ page }: { page: string }) => (
  <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
    <div style={{ fontSize: '3rem', marginBottom: 16 }}>🚧</div>
    <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', marginBottom: 8 }}>{page}</h2>
    <p style={{ fontSize: '.9rem' }}>This module is being built — check back soon!</p>
  </div>
);

const Spinner = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-bg)' }}>
    <div style={{ width: 40, height: 40, border: '3px solid var(--surface-border)', borderTopColor: 'var(--tux-navy)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const AppRoutes = () => {
  const { getRoutes } = usePlugins();
  const pluginRoutes = getRoutes();
  const { logout } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      showSnackbar('Session expired or unauthorized. Please log in again.', 'error');
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => { window.removeEventListener('auth:unauthorized', handleUnauthorized); };
  }, [logout, showSnackbar, navigate]);

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected — all wrapped in AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard"        element={<Dashboard />} />
          <Route path="/pos"              element={<POS />} />
          <Route path="/rentals"          element={<Rentals />} />
          <Route path="/rentals/new"      element={<ComingSoon page="New Rental Booking" />} />
          <Route path="/customers"        element={<Customers />} />
          <Route path="/customers/new"    element={<ComingSoon page="New Customer" />} />
          <Route path="/measurements"     element={<Measurements />} />
          <Route path="/measurements/new" element={<Measurements />} />
          <Route path="/tailoring"        element={<Tailoring />} />
          <Route path="/inventory"        element={<Inventory />} />
          <Route path="/appointments"     element={<Appointments />} />
          <Route path="/appointments/new" element={<Appointments />} />
          <Route path="/reports"          element={<Reports />} />
          <Route path="/settings"         element={<Settings />} />
          <Route path="/admin"            element={<AdminPanel />} />
          
          {/* Plugin dynamic routes */}
          {pluginRoutes?.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* Redirects */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

// ── App ───────────────────────────────────────────────────────
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SvgSpriteLoader url="/sprites/app-icons.svg?v=1.2.0" version="1.2.0">
        <SnackbarProvider>
          <OfflineProvider>
            <TenantProvider>
              <PluginProvider>
                <AuthProvider>
                  <Router>
                    <AppRoutes />
                  </Router>
                </AuthProvider>
              </PluginProvider>
            </TenantProvider>
          </OfflineProvider>
        </SnackbarProvider>
      </SvgSpriteLoader>
    </QueryClientProvider>
  );
}

export default App;
