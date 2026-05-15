import { PluginModule } from '../types';
import { ReturnsPage } from './pages/ReturnsPage';
import { LoyaltyRedeemButton } from './components/LoyaltyRedeemButton';

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
      element: <ReturnsPage />
    }
  ],
  
  navItems: [
    {
      id: 'retail-returns',
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
      component: <LoyaltyRedeemButton />
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
