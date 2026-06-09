import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const PageHeaderStateContext = createContext<PageHeaderConfig | undefined>(undefined);
const PageHeaderDispatchContext = createContext<React.Dispatch<React.SetStateAction<PageHeaderConfig>> | undefined>(undefined);

export const PageHeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<PageHeaderConfig>({ title: '' });

  return (
    <PageHeaderDispatchContext.Provider value={setConfig}>
      <PageHeaderStateContext.Provider value={config}>
        {children}
      </PageHeaderStateContext.Provider>
    </PageHeaderDispatchContext.Provider>
  );
};

/**
 * Hook for pages to declare their header content.
 * Call this in your page component to set the sticky header's title, subtitle, and actions.
 */
export const usePageHeader = (config: PageHeaderConfig) => {
  const setConfig = useContext(PageHeaderDispatchContext);
  if (!setConfig) { throw new Error('usePageHeader must be used within PageHeaderProvider'); }

  // Use a ref to avoid infinite effect triggers
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    setConfig(configRef.current);
  });

  useEffect(() => {
    return () => {
      setConfig({ title: '' });
    };
  }, [setConfig]);
};

/**
 * Hook to read the current header config (used by the PageHeader component).
 */
export const usePageHeaderConfig = () => {
  const config = useContext(PageHeaderStateContext);
  if (!config) { throw new Error('usePageHeaderConfig must be used within PageHeaderProvider'); }
  return config;
};
