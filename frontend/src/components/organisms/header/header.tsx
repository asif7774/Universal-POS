import React from 'react';
import { usePageHeaderConfig } from 'contexts/PageHeaderContext';

/**
 * Sticky page header rendered once in AppLayout.
 * Each page sets its content via usePageHeader() hook.
 */
const PageHeader: React.FC = () => {
  const { title, subtitle, actions } = usePageHeaderConfig();

  if (!title) return null;

  return (
    <header className="page-header" role="banner" id="page-header">
      <div className="page-header__left">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
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
