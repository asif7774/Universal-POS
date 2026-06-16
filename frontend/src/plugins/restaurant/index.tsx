import React from 'react';
import { PluginModule } from '../types';

const TablesPage = () => (
  <div className="p-10">
    <h2>Floor Plan & Tables</h2>
    <div className="grid gap-5 mt-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
      {/* Mock tables */}
      {[1, 2, 3, 4, 5, 6].map(table => (
        <div key={table} className="card" style={{ padding: 30, textAlign: 'center', background: table === 2 ? 'var(--status-warning)' : 'var(--surface-card)', color: table === 2 ? '#000' : 'inherit' }}>
          <div className="text-2xl font-extrabold">T{table}</div>
          <div className="text-xs mt-2">{table === 2 ? 'Occupied' : 'Available'}</div>
        </div>
      ))}
    </div>
  </div>
);

const KDSPage = () => (
  <div className="p-10">
    <h2>Kitchen Display System (KDS)</h2>
    <div className="flex gap-5 mt-5">
      <div className="card flex-1 p-5">
        <h4>Order #104</h4>
        <ul className="pl-5 mt-2.5">
          <li>1x Ribeye Steak (Med Rare)</li>
          <li>2x Side Salad</li>
        </ul>
        <button className="btn btn-navy btn-sm mt-[15px] w-full">Mark Done</button>
      </div>
      <div className="card flex-1 p-5 opacity-60">
        <h4>Order #103</h4>
        <ul className="pl-5 mt-2.5">
          <li>1x Margherita Pizza</li>
        </ul>
        <button className="btn btn-outline btn-sm mt-[15px] w-full" disabled>Completed</button>
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
        <div className="mb-4">
          <div className="input-label mb-2">Tip Amount</div>
          <div className="flex gap-2">
            <button className="btn btn-outline flex-1">15%</button>
            <button className="btn btn-outline flex-1">18%</button>
            <button className="btn btn-outline flex-1">20%</button>
            <button className="btn btn-outline flex-1">Custom</button>
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
