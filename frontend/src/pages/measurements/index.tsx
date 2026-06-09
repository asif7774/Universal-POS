import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { MeasurementRecord } from 'types/measurements';
import { MeasurementCard } from './components/MeasurementCard';
import { NewMeasurementModal } from './components/NewMeasurementModal';
import { MeasurementDetailModal } from './components/MeasurementDetailModal';
import { usePageHeader } from 'contexts/PageHeaderContext';

const Measurements: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MeasurementRecord | null>(null);
  const [showNew, setShowNew] = useState(false);

  const { data: records = [], isLoading, error } = useQuery<MeasurementRecord[]>({
    queryKey: ['measurements'],
    queryFn: async () => await apiClient.get<MeasurementRecord[]>('/customers/measurements/all'),
  });

  usePageHeader({
    title: 'Measurements',
    subtitle: isLoading ? 'Loading...' : error ? 'Error loading measurements' : `Digital measurement book · ${records.length} profiles on file`,
    actions: <button className="btn btn-gold" onClick={() => { setShowNew(true); }}>+ Take Measurement</button>,
  });

  if (isLoading) {return <div className="p-10 text-center text-[var(--text-muted)]">Loading...</div>;}
  if (error) {return <div className="p-10 text-center text-red-500">Error loading measurements</div>;}

  const filtered = records.filter(r =>
    r.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="search-container">
        <div className="search-input-wrapper input-with-icon">
          <span className="input-icon">
            <SvgIcon name="search" width="18" height="18" />
          </span>
          <input className="input" placeholder="Search customer..." value={search}
            onChange={e => { setSearch(e.target.value); }} />
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
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
          <div className="empty-state-icon">
            <SvgIcon name="measurements" width="48" height="48" className="opacity-30" />
          </div>
          <p>No measurement records found</p>
        </div>
      )}

      {/* Detail Modal */}
      <MeasurementDetailModal 
        selected={selected} 
        setSelected={setSelected} 
      />

      {/* New Measurement Form */}
      {showNew && <NewMeasurementModal onClose={() => { setShowNew(false); }} />}
    </div>
  );
};

export default Measurements;
