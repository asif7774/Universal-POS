import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from 'lib/apiClient';

export interface TenantConfig {
  tenantId: string;
  businessName: string;
  domain: 'tuxedo' | 'retail' | 'restaurant' | 'salon' | 'grocery';
  enabledPlugins: string[];
  features: string[];
  ui: {
    theme: 'light' | 'dark' | 'system';
    primaryColor: string;
    logo?: string;
    receiptFooter?: string;
  };
}

const DEFAULT_TENANT: TenantConfig = {
  tenantId: 'demo-tenant',
  businessName: 'TuxedoPOS HQ',
  domain: 'tuxedo',
  enabledPlugins: ['retail', 'measurements'],
  features: ['rentals', 'tailoring', 'appointments'],
  ui: {
    theme: 'light',
    primaryColor: '#1E3A5F',
    receiptFooter: 'Thank you for your business!'
  }
};

interface TenantContextValue {
  config: TenantConfig;
  updateConfig: (newConfig: Partial<TenantConfig>) => Promise<void>;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<TenantConfig>(DEFAULT_TENANT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd fetch this from the API based on the authenticated user or domain
    const fetchConfig = async () => {
      try {
        // const data = await apiClient.get<TenantConfig>('/tenant/config');
        // setConfig(data);
        
        // Simulating network delay for realistic startup
        await new Promise(r => setTimeout(r, 400));
        
        // Load from local storage as a fallback/mock for now
        const saved = localStorage.getItem('tenant_config');
        if (saved) {
          setConfig(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Failed to load tenant config, using defaults', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfig();
  }, []);

  const updateConfig = async (newConfig: Partial<TenantConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    localStorage.setItem('tenant_config', JSON.stringify(updated));
    
    // try {
    //   await apiClient.patch('/tenant/config', newConfig);
    // } catch (e) {
    //   console.error("Failed to sync tenant config", e);
    // }
  };

  return (
    <TenantContext.Provider value={{ config, updateConfig, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within <TenantProvider>');
  return ctx;
};
