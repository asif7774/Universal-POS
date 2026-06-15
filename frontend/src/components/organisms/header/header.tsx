import React from 'react';
import { usePageHeaderConfig } from 'contexts/PageHeaderContext';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface PageHeaderProps {
  isSidebarPermanent?: boolean;
  onOpenMobileDrawer?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ isSidebarPermanent, onOpenMobileDrawer }) => {
  const { title, subtitle, actions } = usePageHeaderConfig();

  if (!title) return null;

  return (
    <header className="page-header" role="banner" id="page-header">
      <div className="page-header__left flex items-center gap-3">
        {!isSidebarPermanent && onOpenMobileDrawer && (
          <button
            onClick={onOpenMobileDrawer}
            aria-label="Open navigation"
            className="btn btn-ghost p-2 -ml-1"
          >
            <SvgIcon name="menu" width="22" height="22" />
          </button>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="page-header__actions">
          {actions}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
