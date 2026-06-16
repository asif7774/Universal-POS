import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from 'contexts/AuthContext';
import { SnackbarProvider } from 'contexts/SnackbarContext';
import { OfflineProvider } from 'contexts/OfflineContext';
import { TenantProvider } from 'contexts/TenantContext';
import { PluginProvider, usePlugins } from 'contexts/PluginContext';
import AppLayout from 'layouts/AppLayout';
import { SvgSpriteLoader, SvgIcon } from 'components/atoms/svg-sprite-loader';

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
const CustomerPortal = lazy(() => import('pages/customer-portal'));

const ComingSoon = ({ page }: { page: string }) => (
  <div className="text-center py-[80px] px-6 text-[var(--text-muted)]">
    <div className="text-[3rem] mb-4 text-[var(--tux-gold)]">
      <SvgIcon name="wrench" width="64" height="64" />
    </div>
    <h2 className="font-['Playfair_Display',serif] text-[var(--text-primary)] mb-2">{page}</h2>
    <p className="text-[.9rem]">This module is being built — check back soon!</p>
  </div>
);

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--surface-bg)]">
    <div className="w-10 h-10 border-[3px] border-[var(--surface-border)] border-t-[var(--tux-navy)] rounded-full animate-[spin_.7s_linear_infinite]" />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const AppRoutes = () => {
  const { getRoutes } = usePlugins();
  const pluginRoutes = getRoutes();
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      // Skip if already on the login page
      if (window.location.pathname === '/login') return;
      logout('Session expired or unauthorized. Please log in again.');
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => { window.removeEventListener('auth:unauthorized', handleUnauthorized); };
  }, [logout, navigate]);

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Public / Standalone */}
        <Route path="/login" element={<Login />} />
        <Route path="/customer-portal/:id" element={<CustomerPortal />} />

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
      <SvgSpriteLoader url="/sprites/app-icons.svg?v=1.2.5" version="1.2.5">
        <SnackbarProvider>
          <AuthProvider>
            <OfflineProvider>
              <TenantProvider>
                <PluginProvider>
                  <Router>
                    <AppRoutes />
                  </Router>
                </PluginProvider>
              </TenantProvider>
            </OfflineProvider>
          </AuthProvider>
        </SnackbarProvider>
      </SvgSpriteLoader>
    </QueryClientProvider>
  );
}

export default App;
