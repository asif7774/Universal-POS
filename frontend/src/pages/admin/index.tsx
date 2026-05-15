import React, { useState } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { MOCK_TENANTS } from 'constants/admin';
import { GlobalStats } from './components/GlobalStats';
import { TenantList } from './components/TenantList';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  
  // Quick hack: Assume only the specific 'admin@tuxedopos.com' is super admin for now.
  // In reality, you'd check a 'isSuperAdmin' flag on the JWT token.
  if (user?.email !== 'admin@tuxedopos.com') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Super Admin</h1>
          <p className="page-subtitle">Global oversight and tenant management</p>
        </div>
        <button className="btn btn-navy">+ New Tenant</button>
      </div>

      <GlobalStats />
      
      <TenantList 
        tenants={MOCK_TENANTS} 
        search={search} 
        setSearch={setSearch} 
      />
    </div>
  );
};

export default AdminPanel;
