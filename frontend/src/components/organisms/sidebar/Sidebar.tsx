import React, { useState, useEffect } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {return saved === 'dark';}
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsPointerFine(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => { setIsPointerFine(e.matches); };
    mediaQuery.addEventListener('change', handler);
    return () => { mediaQuery.removeEventListener('change', handler); };
  }, []);

  const pluginNavItems = getNavItems() || [];

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

  const isEffectivelyExpanded = !collapsed || (isPointerFine && isHovered);

  return (
    <>
      {/* Spacer to maintain layout without shifting content */}
      <div style={{ width: collapsed ? 68 : 260, flexShrink: 0, transition: 'width .2s ease' }} />

      <nav
        className="sidebar"
        aria-label="Main navigation"
        onMouseEnter={isPointerFine ? () => { setIsHovered(true); } : undefined}
        onMouseLeave={isPointerFine ? () => { setIsHovered(false); } : undefined}
        style={{
          width: isEffectivelyExpanded ? 260 : 68,
          transition: 'width .2s ease',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
          boxShadow: (collapsed && isEffectivelyExpanded) ? '4px 0 24px rgba(0,0,0,0.2)' : 'none'
        }}
      >
        {/* Logo */}
        <div className="sidebar-logo" style={{ justifyContent: isEffectivelyExpanded ? 'flex-start' : 'center' }}>
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 11L4 7v10l8 4 8-4V7l-8 4z" fill="white" />
              <ellipse cx="12" cy="7" rx="8" ry="3" fill="#D4AF37" />
            </svg>
          </div>
          {isEffectivelyExpanded && (
            <span className="sidebar-logo-text" style={{ whiteSpace: 'nowrap' }}>
              Tuxedo<span>POS</span>
            </span>
          )}
          <button
            onClick={() => { setCollapsed(c => !c); }}
            style={{
              marginLeft: isEffectivelyExpanded ? 'auto' : 0,
              background: 'rgba(255,255,255,.1)',
              border: 'none', borderRadius: 6, width: 28, height: 28,
              cursor: 'pointer', color: 'rgba(255,255,255,.6)',
              display: isEffectivelyExpanded || !collapsed ? 'flex' : 'none',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <SvgIcon name={collapsed ? 'pinned' : 'menu'} width="20" height="20" strokeWidth="2" fill="none" />
          </button>
        </div>

        {/* Nav sections */}
        <div className="sidebar-nav">
          {activeNavSections.map(section => {
            const visibleItems = section.items.filter(
              item => {
                if (!item.roles) {return true;}
                if (item.roles.includes('superadmin') && user?.email === 'admin@tuxedopos.com') {return true;}
                return user && item.roles.includes(user.role);
              }
            );
            if (!visibleItems.length) {return null;}
            return (
              <div key={section.section}>
                {isEffectivelyExpanded && (
                  <div className="sidebar-section-label">{section.section}</div>
                )}
                {visibleItems.map(item => {
                  const isEmoji = item.iconName && (item.iconName.length <= 2 || /\p{Emoji}/u.test(item.iconName));

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                      title={!isEffectivelyExpanded ? item.label : undefined}
                      style={{ justifyContent: isEffectivelyExpanded ? 'flex-start' : 'center', whiteSpace: 'nowrap' }}
                    >
                      {isEmoji ? (
                        <span className="nav-icon" style={{ fontSize: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, flexShrink: 0 }}>{item.iconName}</span>
                      ) : (
                        <SvgIcon name={item.iconName} width="18" height="18" className="nav-icon" style={{ flexShrink: 0 }} />
                      )}
                      {isEffectivelyExpanded && <span>{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer — user info + logout */}
        <div className="sidebar-footer" style={{ overflow: 'visible', position: 'relative' }}>
          {isEffectivelyExpanded && user ? (
            <>
              <button 
                onClick={() => { setIsUserMenuOpen(prev => !prev); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', marginBottom: 0,
                  background: isUserMenuOpen ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.06)', 
                  borderRadius: 10,
                  whiteSpace: 'nowrap', width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left'
                }}
              >
                <div className="avatar avatar-gold" style={{ fontSize: '.7rem', flexShrink: 0 }}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', textTransform: 'capitalize' }}>
                    {roleInitial(user.role)}{user.role.slice(1)}
                  </div>
                </div>
                <SvgIcon name="chevron-collapse" width="12" height="12" style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.5, color: 'white' }} />
              </button>
              
              {isUserMenuOpen && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: 12,
                  right: 12,
                  background: 'var(--surface-card)',
                  borderRadius: 10,
                  padding: 8,
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  zIndex: 100,
                  border: '1px solid var(--surface-border)'
                }}>
                  <button
                    onClick={() => { setIsDark(d => !d); setIsUserMenuOpen(false); }}
                    className="nav-item"
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', justifyContent: 'flex-start', color: 'var(--text-primary)', whiteSpace: 'nowrap', padding: '8px 12px' }}
                  >
                    <SvgIcon name={isDark ? 'moon' : 'sun'} width="18" height="18" className="nav-icon" style={{ flexShrink: 0, color: 'var(--text-secondary)' }} />
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="nav-item"
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', justifyContent: 'flex-start', color: 'rgba(255,69,58,.9)', whiteSpace: 'nowrap', padding: '8px 12px' }}
                  >
                    <SvgIcon name="logout" width="18" height="18" className="nav-icon" style={{ flexShrink: 0 }} />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => { setIsDark(d => !d); }}
                className="nav-item"
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', justifyContent: 'center', color: 'rgba(255,255,255,.8)', whiteSpace: 'nowrap' }}
                title="Toggle theme"
              >
                <SvgIcon name={isDark ? 'moon' : 'sun'} width="18" height="18" className="nav-icon" style={{ flexShrink: 0 }} />
              </button>

              <button
                onClick={handleLogout}
                className="nav-item"
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', justifyContent: 'center', color: 'rgba(255,69,58,.8)', whiteSpace: 'nowrap' }}
                title="Sign out"
              >
                <SvgIcon name="logout" width="18" height="18" className="nav-icon" style={{ flexShrink: 0 }} />
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
