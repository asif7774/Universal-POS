import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="nav-icon">
    <path d={d} />
  </svg>
);

const ICONS = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  pos: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0',
  rental: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  customers: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  measurements: 'M21 3H3 M3 3v18 M3 21h18 M21 21V3 M9 3v18 M15 3v18 M3 9h18 M3 15h18',
  tailoring: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  inventory: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
  appointments: 'M8 2v4 M16 2v4 M3 10h18 M21 8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V8z',
  reports: 'M18 20V10 M12 20V4 M6 20v-6',
  settings: 'M12 20a8 8 0 100-16 8 8 0 000 16z M12 14a2 2 0 100-4 2 2 0 000 4z',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
};

const NAV_SECTIONS: NavSection[] = [
  {
    section: 'Operations',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <Icon d={ICONS.dashboard} /> },
      { label: 'POS Terminal', path: '/pos', icon: <Icon d={ICONS.pos} /> },
      { label: 'Rentals', path: '/rentals', icon: <Icon d={ICONS.rental} /> },
      { label: 'Appointments', path: '/appointments', icon: <Icon d={ICONS.appointments} /> },
    ],
  },
  {
    section: 'Catalog',
    items: [
      { label: 'Inventory', path: '/inventory', icon: <Icon d={ICONS.inventory} /> },
      { label: 'Tailoring Jobs', path: '/tailoring', icon: <Icon d={ICONS.tailoring} /> },
    ],
  },
  {
    section: 'Customers',
    items: [
      { label: 'Customers', path: '/customers', icon: <Icon d={ICONS.customers} /> },
      { label: 'Measurements', path: '/measurements', icon: <Icon d={ICONS.measurements} /> },
    ],
  },
  {
    section: 'Business',
    items: [
      { label: 'Reports', path: '/reports', icon: <Icon d={ICONS.reports} />, roles: ['owner', 'manager'] },
      { label: 'Settings', path: '/settings', icon: <Icon d={ICONS.settings} />, roles: ['owner'] },
    ],
  },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleInitial = (role: string) => role[0].toUpperCase();

  return (
    <nav className="sidebar" aria-label="Main navigation" style={{ width: collapsed ? 68 : 260, transition: 'width .2s ease' }}>
      {/* Logo */}
      <div className="sidebar-logo" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div className="sidebar-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 11L4 7v10l8 4 8-4V7l-8 4z" fill="white" />
            <ellipse cx="12" cy="7" rx="8" ry="3" fill="#D4AF37" />
          </svg>
        </div>
        {!collapsed && (
          <span className="sidebar-logo-text">
            Tuxedo<span>POS</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,.1)',
            border: 'none', borderRadius: 6, width: 28, height: 28,
            cursor: 'pointer', color: 'rgba(255,255,255,.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d={collapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
          </svg>
        </button>
      </div>

      {/* Nav sections */}
      <div className="sidebar-nav">
        {NAV_SECTIONS.map(section => {
          const visibleItems = section.items.filter(
            item => !item.roles || (user && item.roles.includes(user.role))
          );
          if (!visibleItems.length) return null;
          return (
            <div key={section.section}>
              {!collapsed && (
                <div className="sidebar-section-label">{section.section}</div>
              )}
              {visibleItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  title={collapsed ? item.label : undefined}
                  style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}
      </div>

      {/* Footer — user info + logout */}
      <div className="sidebar-footer">
        {!collapsed && user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', marginBottom: 6,
            background: 'rgba(255,255,255,.06)', borderRadius: 10,
          }}>
            <div className="avatar avatar-gold" style={{ fontSize: '.7rem' }}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', textTransform: 'capitalize' }}>
                {roleInitial(user.role)}{user.role.slice(1)} · {user.storeName}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="nav-item"
          style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', justifyContent: collapsed ? 'center' : 'flex-start', color: 'rgba(255,69,58,.8)' }}
          title={collapsed ? 'Sign out' : undefined}
        >
          <Icon d={ICONS.logout} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
