import { ReactNode } from 'react';

export interface RouteConfig {
  path: string;
  element: ReactNode;
  children?: RouteConfig[];
}

export interface NavItemConfig {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles?: string[];
}

export interface CheckoutExtension {
  id: string;
  label: string;
  component: ReactNode;
  position: 'before-payment' | 'after-payment' | 'sidebar';
}

export interface SettingsPage {
  id: string;
  title: string;
  component: ReactNode;
}

export interface PluginModule {
  id: string;
  name: string;
  description: string;
  version: string;
  
  /** Routes to inject into the AppRouter */
  routes?: RouteConfig[];
  
  /** Items to add to the main sidebar */
  navItems?: NavItemConfig[];
  
  /** UI components to inject into the POS checkout flow */
  checkoutExtensions?: CheckoutExtension[];
  
  /** Settings panels to add to the Settings page */
  settingsPages?: SettingsPage[];
  
  /** Run when the plugin is initialized */
  onInit?: () => void | Promise<void>;
}
