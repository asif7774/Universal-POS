import React from 'react';
import { PluginModule } from '../types';
import { SvgIcon } from '../../components/atoms/svg-sprite-loader';

const LoyaltySettings = () => (
  <div style={{ padding: 20 }}>
    <h3>Loyalty Program</h3>
    <div style={{ marginTop: 16 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" defaultChecked /> Enable Points System
      </label>
      <div style={{ marginTop: 12 }}>
        <label>Points per $1 spent</label>
        <input type="number" defaultValue={1} className="input" style={{ width: 100, marginLeft: 8 }} />
      </div>
    </div>
  </div>
);

const RetailPlugin: PluginModule = {
  id: 'retail',
  name: 'Retail Core',
  description: 'Core retail features including returns, exchanges, and loyalty programs.',
  version: '1.0.0',
  
  routes: [
    {
      path: '/returns',
      element: <div style={{ padding: 40 }}><h2>Returns & Exchanges</h2><p>Process refunds and exchanges here.</p></div>
    }
  ],
  
  navItems: [
    {
      label: 'Returns',
      icon: 'return',
      path: '/returns',
      roles: ['owner', 'manager', 'cashier']
    }
  ],
  
  checkoutExtensions: [
    {
      id: 'loyalty-apply',
      label: 'Apply Loyalty Points',
      position: 'before-payment',
      component: (
        <button className="btn flex items-center justify-center gap-2" style={{ width: '100%', marginBottom: 12 }}>
          <SvgIcon name="gift" width="16" height="16" />
          Redeem Points
        </button>
      )
    }
  ],
  
  settingsPages: [
    {
      id: 'settings-loyalty',
      title: 'Loyalty Program',
      component: <LoyaltySettings />
    }
  ],
  
  onInit: () => {
    console.log('[Retail Plugin] Initialized successfully');
  }
};

export default RetailPlugin;
