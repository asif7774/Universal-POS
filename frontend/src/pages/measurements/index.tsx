import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { MeasurementRecord } from './types';
import { MeasurementCard } from './components/MeasurementCard';
import { NewMeasurementModal } from './components/NewMeasurementModal';
import { MeasurementDetailModal } from './components/MeasurementDetailModal';

const Measurements: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MeasurementRecord | null>(null);
  const [showNew, setShowNew] = useState(false);

  const { data: records = [], isLoading, error } = useQuery<MeasurementRecord[]>({
    queryKey: ['measurements'],
    queryFn: async () => await apiClient.get<MeasurementRecord[]>('/customers/measurements/all'),
  });

  if (isLoading) return <div className="page-header"><h1 className="page-title">Loading...</h1></div>;
  if (error) return <div className="page-header"><h1 className="page-title" style={{ color: 'red' }}>Error loading measurements</h1></div>;

  const filtered = records.filter(r =>
    r.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Measurements</h1>
          <p className="page-subtitle">Digital measurement book · {records.length} profiles on file</p>
        </div>
        <button className="btn btn-gold" onClick={() => setShowNew(true)}>+ Take Measurement</button>
      </div>

      <div className="input-with-icon" style={{ marginBottom: 20, maxWidth: 400 }}>
        <span className="input-icon">
          <SvgIcon name="search" width="15" height="15" />
        </span>
        <input className="input" placeholder="Search customer..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filtered.map(r => (
          <MeasurementCard 
            key={r.id} 
            r={r} 
            onClick={setSelected} 
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📐</div>
          <p>No measurement records found</p>
        </div>
      )}

      {/* Detail Modal */}
      <MeasurementDetailModal 
        selected={selected} 
        setSelected={setSelected} 
      />

      {/* New Measurement Form */}
      {showNew && <NewMeasurementModal onClose={() => setShowNew(false)} />}
    </div>
  );
};

export default Measurements;
