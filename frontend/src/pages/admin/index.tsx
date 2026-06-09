import React, { useState } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useAdminTenants } from '../../lib/queries';
import { GlobalStats } from './components/GlobalStats';
import { TenantList } from './components/TenantList';
import { NewTenantModal } from './components/NewTenantModal';
import { usePageHeader } from 'contexts/PageHeaderContext';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  
  // Quick hack: Assume only the specific 'admin@tuxedopos.com' is super admin for now.
  // In reality, you'd check a 'isSuperAdmin' flag on the JWT token.
  if (user?.email !== 'admin@tuxedopos.com') {
    return <Navigate to="/dashboard" replace />;
  }

  const { data: tenants = [], isLoading } = useAdminTenants();
  const [showNewTenant, setShowNewTenant] = useState(false);

  usePageHeader({
    title: 'Super Admin',
    subtitle: 'Global oversight and tenant management',
    actions: <button className="btn btn-navy" onClick={() => { setShowNewTenant(true); }}>+ New Tenant</button>,
  });

  return (
    <div className="animate-fade-in">
      <GlobalStats />
      
      {isLoading ? (
        <div className="p-10 text-center text-[var(--text-muted)]">Loading tenants...</div>
      ) : (
        <TenantList 
          tenants={tenants} 
          search={search} 
          setSearch={setSearch} 
        />
      )}

      {showNewTenant && <NewTenantModal onClose={() => { setShowNewTenant(false); }} />}
    </div>
  );
};

export default AdminPanel;
