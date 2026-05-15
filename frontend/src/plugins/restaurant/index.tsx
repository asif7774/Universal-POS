import React from 'react';
import { PluginModule } from '../types';

const TablesPage = () => (
  <div style={{ padding: 40 }}>
    <h2>Floor Plan & Tables</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 20, marginTop: 20 }}>
      {/* Mock tables */}
      {[1, 2, 3, 4, 5, 6].map(table => (
        <div key={table} className="card" style={{ padding: 30, textAlign: 'center', background: table === 2 ? 'var(--status-warning)' : 'var(--surface-card)', color: table === 2 ? '#000' : 'inherit' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>T{table}</div>
          <div style={{ fontSize: '.8rem', marginTop: 8 }}>{table === 2 ? 'Occupied' : 'Available'}</div>
        </div>
      ))}
    </div>
  </div>
);

const KDSPage = () => (
  <div style={{ padding: 40 }}>
    <h2>Kitchen Display System (KDS)</h2>
    <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
      <div className="card" style={{ flex: 1, padding: 20 }}>
        <h4>Order #104</h4>
        <ul style={{ paddingLeft: 20, marginTop: 10 }}>
          <li>1x Ribeye Steak (Med Rare)</li>
          <li>2x Side Salad</li>
        </ul>
        <button className="btn btn-navy btn-sm" style={{ marginTop: 15, width: '100%' }}>Mark Done</button>
      </div>
      <div className="card" style={{ flex: 1, padding: 20, opacity: 0.6 }}>
        <h4>Order #103</h4>
        <ul style={{ paddingLeft: 20, marginTop: 10 }}>
          <li>1x Margherita Pizza</li>
        </ul>
        <button className="btn btn-outline btn-sm" style={{ marginTop: 15, width: '100%' }} disabled>Completed</button>
      </div>
    </div>
  </div>
);

const RestaurantPlugin: PluginModule = {
  id: 'restaurant',
  name: 'Restaurant & F&B',
  description: 'Tipping and hospitality extensions.',
  version: '1.0.0',
  
  routes: [],
  
  navItems: [],
  
  checkoutExtensions: [
    {
      id: 'tip-entry',
      label: 'Add Tip',
      position: 'before-payment',
      component: (
        <div style={{ marginBottom: 16 }}>
          <div className="input-label" style={{ marginBottom: 8 }}>Tip Amount</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" style={{ flex: 1 }}>15%</button>
            <button className="btn btn-outline" style={{ flex: 1 }}>18%</button>
            <button className="btn btn-outline" style={{ flex: 1 }}>20%</button>
            <button className="btn btn-outline" style={{ flex: 1 }}>Custom</button>
          </div>
        </div>
      )
    }
  ],
  
  onInit: () => {
    console.log('[Restaurant Plugin] Initialized successfully');
  }
};

export default RestaurantPlugin;
