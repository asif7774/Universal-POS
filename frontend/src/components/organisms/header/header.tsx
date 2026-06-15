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
      <div className="flex items-center gap-3 min-w-0">
        {!isSidebarPermanent && onOpenMobileDrawer && (
          <button
            onClick={onOpenMobileDrawer}
            aria-label="Open navigation"
            className="btn btn-ghost btn-sm p-2 shrink-0"
          >
            <SvgIcon name="menu" width="22" height="22" aria-hidden="true" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="page-title truncate">{title}</h1>
          {subtitle && <p className="page-subtitle truncate">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
