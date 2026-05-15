import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { usePlugins } from 'contexts/PluginContext';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface NavItem {
  label: string;
  path: string;
  iconName: string;
  roles?: string[];
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    section: 'Operations',
    items: [
      { label: 'Dashboard', path: '/dashboard', iconName: 'dashboard' },
      { label: 'POS Terminal', path: '/pos', iconName: 'pos' },
      { label: 'Rentals', path: '/rentals', iconName: 'rental' },
      { label: 'Appointments', path: '/appointments', iconName: 'appointments' },
    ],
  },
  {
    section: 'Catalog',
    items: [
      { label: 'Inventory', path: '/inventory', iconName: 'inventory' },
      { label: 'Tailoring Jobs', path: '/tailoring', iconName: 'tailoring' },
    ],
  },
  {
    section: 'Customers',
    items: [
      { label: 'Customers', path: '/customers', iconName: 'customers' },
      { label: 'Measurements', path: '/measurements', iconName: 'measurements' },
    ],
  },
  {
    section: 'Business',
    items: [
      { label: 'Reports', path: '/reports', iconName: 'reports', roles: ['owner', 'manager'] },
      { label: 'Settings', path: '/settings', iconName: 'settings', roles: ['owner'] },
      { label: 'Admin', path: '/admin', iconName: 'settings', roles: ['superadmin'] }, // Assume superadmin role exists or we filter by email
    ],
  },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { getNavItems } = usePlugins();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const pluginNavItems = getNavItems();
  
  // Dynamically add a "Plugins" section if any plugins have nav items
  const activeNavSections = [...NAV_SECTIONS];
  if (pluginNavItems.length > 0) {
    activeNavSections.splice(3, 0, {
      section: 'Plugins',
      items: pluginNavItems.map(item => ({
        label: item.label,
        path: item.path,
        iconName: item.icon, // For plugins, we'll assume it's either an emoji or an icon name
        roles: item.roles
      }))
    });
  }

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
          <SvgIcon name={collapsed ? 'chevron-expand' : 'chevron-collapse'} width="14" height="14" />
        </button>
      </div>

      {/* Nav sections */}
      <div className="sidebar-nav">
        {activeNavSections.map(section => {
          const visibleItems = section.items.filter(
            item => {
              if (!item.roles) return true;
              if (item.roles.includes('superadmin') && user?.email === 'admin@tuxedopos.com') return true;
              return user && item.roles.includes(user.role);
            }
          );
          if (!visibleItems.length) return null;
          return (
            <div key={section.section}>
              {!collapsed && (
                <div className="sidebar-section-label">{section.section}</div>
              )}
              {visibleItems.map(item => {
                const isEmoji = item.iconName && (item.iconName.length <= 2 || /\p{Emoji}/u.test(item.iconName));
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                    title={collapsed ? item.label : undefined}
                    style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                  >
                    {isEmoji ? (
                      <span className="nav-icon" style={{ fontSize: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>{item.iconName}</span>
                    ) : (
                      <SvgIcon name={item.iconName} width="18" height="18" className="nav-icon" />
                    )}
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
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
                {roleInitial(user.role)}{user.role.slice(1)}
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
          <SvgIcon name="logout" width="18" height="18" className="nav-icon" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
