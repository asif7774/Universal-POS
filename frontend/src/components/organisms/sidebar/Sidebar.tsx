import React, { useState, useEffect, useLayoutEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { usePlugins } from 'contexts/PluginContext';
import { useOffline } from 'contexts/OfflineContext';
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

export interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  isSidebarPermanent: boolean;
  isPointerFine: boolean;
  onCloseMobileDrawer: () => void;
  onToggleSidebar: () => void;
}

const NAV_SECTIONS: NavSection[] = [
  {
    section: 'Operations',
    items: [
      { label: 'Dashboard', path: '/dashboard', iconName: 'dashboard' },
      { label: 'POS Terminal', path: '/pos', iconName: 'pos' },
      { label: 'Rentals', path: '/rentals', iconName: 'tuxedo' },
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
      { label: 'Admin', path: '/admin', iconName: 'settings', roles: ['superadmin'] },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  isMobileOpen,
  isSidebarPermanent,
  isPointerFine,
  onCloseMobileDrawer,
  onToggleSidebar,
}) => {
  const { user, logout } = useAuth();
  const { getNavItems } = usePlugins();
  const { isOnline, queuedItems } = useOffline();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) { return saved === 'dark'; }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useLayoutEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Labels visible when: mobile drawer open, OR desktop expanded, OR desktop collapsed+hovered
  const isEffectivelyExpanded =
    !isSidebarPermanent || !isCollapsed || (isPointerFine && isHovered);

  const pluginNavItems = getNavItems() || [];
  const activeNavSections = [...NAV_SECTIONS];
  if (pluginNavItems.length > 0) {
    activeNavSections.splice(3, 0, {
      section: 'Plugins',
      items: pluginNavItems.map(item => ({
        label: item.label,
        path: item.path,
        iconName: item.icon,
        roles: item.roles,
      })),
    });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleInitial = (role: string) => role[0].toUpperCase();

  return (
    <aside
      onMouseEnter={isPointerFine ? () => setIsHovered(true) : undefined}
      onMouseLeave={isPointerFine ? () => setIsHovered(false) : undefined}
      className={[
        'sidebar fixed left-0 top-0 bottom-0 z-50',
        'transition-[width,transform] duration-200 ease-in-out',
        // Slide in/out: permanent sidebar always visible; drawer hidden until open
        isSidebarPermanent || isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        // Width
        isSidebarPermanent && isCollapsed && !isHovered ? 'w-[72px]' : 'w-[260px]',
        // Shadow only when collapsed sidebar is temporarily expanded
        isSidebarPermanent && isCollapsed && isHovered ? 'shadow-[4px_0_24px_rgba(0,0,0,0.2)]' : '',
      ].join(' ')}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={`sidebar-logo ${isEffectivelyExpanded ? 'justify-start' : 'justify-center'}`}>
        <div className="sidebar-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 11L4 7v10l8 4 8-4V7l-8 4z" fill="white" />
            <ellipse cx="12" cy="7" rx="8" ry="3" fill="var(--tux-gold)" />
          </svg>
        </div>

        <span className={[
          'sidebar-logo-text whitespace-nowrap overflow-hidden',
          'transition-all duration-200 ease-in-out',
          isEffectivelyExpanded ? 'max-w-[150px] opacity-100' : 'max-w-0 opacity-0',
        ].join(' ')}>
          Tuxedo<span>POS</span>
        </span>

        {/* Pin/unpin toggle — desktop pointer device only */}
        {isSidebarPermanent && isPointerFine && isEffectivelyExpanded && (
          <button
            onClick={onToggleSidebar}
            className="ml-auto shrink-0 flex items-center justify-center bg-white/10 border-none rounded-md w-7 h-7 cursor-pointer text-white/60"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <SvgIcon name={isCollapsed ? 'pinned' : 'menu'} width="20" height="20" strokeWidth="2" fill="none" />
          </button>
        )}
      </div>

      {/* Nav sections */}
      <div className="sidebar-nav">
        {activeNavSections.map(section => {
          const visibleItems = section.items.filter(item => {
            if (!item.roles) { return true; }
            if (item.roles.includes('superadmin') && user?.email === 'admin@tuxedopos.com') { return true; }
            return user && item.roles.includes(user.role);
          });
          if (!visibleItems.length) { return null; }
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
                    onClick={!isSidebarPermanent ? onCloseMobileDrawer : undefined}
                    className={({ isActive }) =>
                      `nav-item transition-all duration-150 whitespace-nowrap ${isActive ? 'active' : ''} ${isEffectivelyExpanded ? 'justify-start' : 'justify-center'}`
                    }
                    title={!isEffectivelyExpanded ? item.label : undefined}
                  >
                    {isEmoji ? (
                      <span className="nav-icon text-[16px] inline-flex items-center justify-center w-[18px] h-[18px] shrink-0">{item.iconName}</span>
                    ) : (
                      <SvgIcon name={item.iconName} width="18" height="18" className="nav-icon shrink-0" />
                    )}
                    <span className={[
                      'overflow-hidden transition-all duration-200 ease-in-out',
                      isEffectivelyExpanded ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0',
                    ].join(' ')}>
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Status Badges */}
      <div className={`px-4 py-2 flex flex-col gap-1.5 transition-opacity duration-200 ${isEffectivelyExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        {!isOnline && (
          <div className="flex items-center gap-2 bg-status-error/10 text-status-error text-[0.65rem] font-bold px-2.5 py-1.5 rounded-md border border-status-error/20">
            <div className="w-1.5 h-1.5 rounded-full bg-status-error animate-pulse" />
            OFFLINE MODE
          </div>
        )}
        {queuedItems > 0 && (
          <div className={`flex items-center gap-2 bg-tux-gold/10 text-tux-gold text-[0.65rem] font-bold px-2.5 py-1.5 rounded-md border border-tux-gold/20 ${!isOnline ? '' : 'animate-bounce'}`}>
            <SvgIcon name="sync" width="12" height="12" className={isOnline ? 'animate-spin' : ''} />
            SYNCING {queuedItems} ITEMS
          </div>
        )}
      </div>

      {/* Footer — user info + logout */}
      <div className="sidebar-footer relative overflow-visible">
        {isEffectivelyExpanded && user ? (
          <>
            <button
              onClick={() => setIsUserMenuOpen(prev => !prev)}
              className={`flex items-center gap-2.5 p-[10px_12px] mb-0 rounded-lg whitespace-nowrap w-full border-none cursor-pointer text-left transition-all duration-150 ${isUserMenuOpen ? 'bg-white/10' : 'bg-white/5'}`}
            >
              <div className="avatar avatar-gold text-[0.7rem] shrink-0">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-[0.82rem] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  {user.name}
                </div>
                <div className="text-[0.7rem] text-white/50 capitalize">
                  {roleInitial(user.role)}{user.role.slice(1)}
                </div>
              </div>
              <SvgIcon name="chevron-collapse" width="12" height="12" className={`text-white transition-transform duration-200 opacity-50 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 bg-surface-card rounded-lg p-2 shadow-lg flex flex-col gap-1 z-[100] border border-surface-border">
                <button
                  onClick={() => { setIsDark(d => !d); setIsUserMenuOpen(false); }}
                  className="nav-item w-full text-left bg-transparent border-none justify-start text-text-primary whitespace-nowrap p-[8px_12px]"
                >
                  <SvgIcon name={isDark ? 'moon' : 'sun'} width="18" height="18" className="nav-icon shrink-0 text-text-secondary" />
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="nav-item w-full text-left bg-transparent border-none justify-start text-status-error/90 whitespace-nowrap p-[8px_12px]"
                >
                  <SvgIcon name="logout" width="18" height="18" className="nav-icon shrink-0" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsDark(d => !d)}
              className="nav-item w-full text-left bg-transparent border-none justify-center text-white/80 whitespace-nowrap"
              title="Toggle theme"
            >
              <SvgIcon name={isDark ? 'moon' : 'sun'} width="18" height="18" className="nav-icon shrink-0" />
            </button>
            <button
              onClick={handleLogout}
              className="nav-item w-full text-left bg-transparent border-none justify-center text-red-400/80 whitespace-nowrap"
              title="Sign out"
            >
              <SvgIcon name="logout" width="18" height="18" className="nav-icon shrink-0" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
