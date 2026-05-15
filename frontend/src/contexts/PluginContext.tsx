import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTenant } from './TenantContext';
import { PluginModule, RouteConfig, NavItemConfig } from '../plugins/types';

// The plugin registry. We define all possible plugins here, but they are
// only downloaded/loaded if the tenant config says they should be.
const pluginRegistry: Record<string, () => Promise<{ default: PluginModule }>> = {
  'retail': () => import('../plugins/retail'),
  'restaurant': () => import('../plugins/restaurant'),
  // etc...
};

interface PluginContextValue {
  plugins: PluginModule[];
  isLoadingPlugins: boolean;
  
  // Helper methods to extract specific features from all loaded plugins
  getNavItems: () => NavItemConfig[];
  getRoutes: () => RouteConfig[];
  getCheckoutExtensions: (position: string) => NonNullable<PluginModule['checkoutExtensions']>;
  getSettingsPages: () => NonNullable<PluginModule['settingsPages']>;
}

const PluginContext = createContext<PluginContextValue | null>(null);

export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config, isLoading: tenantLoading } = useTenant();
  const [plugins, setPlugins] = useState<PluginModule[]>([]);
  const [isLoadingPlugins, setIsLoadingPlugins] = useState(true);

  useEffect(() => {
    if (tenantLoading) {return;}

    const loadPlugins = async () => {
      setIsLoadingPlugins(true);
      try {
        const loadedModules: PluginModule[] = [];
        
        for (const pluginId of config.enabledPlugins) {
          if (pluginRegistry[pluginId]) {
            try {
              const mod = await pluginRegistry[pluginId]();
              const plugin = mod.default;
              
              if (plugin.onInit) {
                await plugin.onInit();
              }
              
              loadedModules.push(plugin);
            } catch (e) {
              console.error(`Failed to load plugin: ${pluginId}`, e);
            }
          } else {
            console.warn(`Plugin ${pluginId} is enabled but not found in registry.`);
          }
        }
        
        setPlugins(loadedModules);
      } finally {
        setIsLoadingPlugins(false);
      }
    };

    loadPlugins();
  }, [config.enabledPlugins, tenantLoading]);

  // Helpers to aggregate plugin exports
  const getNavItems = () => {
    return plugins.flatMap(p => p.navItems || []);
  };

  const getRoutes = () => {
    return plugins.flatMap(p => p.routes || []);
  };

  const getCheckoutExtensions = (position: string) => {
    return plugins
      .flatMap(p => p.checkoutExtensions || [])
      .filter(ext => ext.position === position);
  };

  const getSettingsPages = () => {
    return plugins.flatMap(p => p.settingsPages || []);
  };

  return (
    <PluginContext.Provider 
      value={{ 
        plugins, 
        isLoadingPlugins, 
        getNavItems, 
        getRoutes, 
        getCheckoutExtensions, 
        getSettingsPages 
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};

export const usePlugins = () => {
  const ctx = useContext(PluginContext);
  if (!ctx) {throw new Error('usePlugins must be used within <PluginProvider>');}
  return ctx;
};
