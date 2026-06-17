import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Customer } from 'types/customers';
import { MeasurementRecord } from 'types/measurements';
import { Rental } from 'types/rentals';
import { apiClient } from '../../../lib/apiClient';
import { useUpdateCustomer, useDeleteCustomer, useAddLoyalty, useUpdateMeasurement } from '../../../lib/queries';
import { useSnackbar } from 'contexts/SnackbarContext';
import { Modal } from 'components/atoms/modal/Modal';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface CustomerDetailModalProps {
  selected: Customer | null;
  setSelected: (c: Customer | null) => void;
  activeTab: 'profile' | 'measurements' | 'history';
  setActiveTab: (tab: 'profile' | 'measurements' | 'history') => void;
  measurements?: MeasurementRecord[];
}

const fmt = (n: number | string | null | undefined) => `$${parseFloat((n as string) ?? '0').toFixed(2)}`;
const fmtDate = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never';

const MeasurementRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex justify-between py-[7px] border-b border-[var(--border-subtle)] text-[.85rem]">
    <span className="text-[var(--text-secondary)]">{label}</span>
    <span className="font-bold">{value || '-'}</span>
  </div>
);

export const CustomerDetailModal = ({ selected, setSelected, activeTab, setActiveTab, measurements }: CustomerDetailModalProps) => {
  const { showSnackbar } = useSnackbar();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const addLoyalty = useAddLoyalty();

  const navigate = useNavigate();
  const updateMeasurement = useUpdateMeasurement();
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  const [measurementForm, setMeasurementForm] = useState<Record<string, string>>({});

  const startEditingMeasurements = (m: MeasurementRecord) => {
    setMeasurementForm({
      jacketSize: m.jacketSize ?? '', chest: m.chest ?? '', waist: m.waist ?? '',
      hips: m.hips ?? '', shoulder: m.shoulder ?? '', neck: m.neck ?? '',
      sleeve: m.sleeve ?? '', inseam: m.inseam ?? '', outseam: m.outseam ?? '',
      shoeSize: m.shoeSize ?? '', notes: m.notes ?? '', fittingNotes: m.fittingNotes ?? '',
    });
    setIsEditingMeasurements(true);
  };

  const saveMeasurements = (m: MeasurementRecord) => {
    updateMeasurement.mutate(
      { customerId: m.customerId, measurementId: m.id, ...measurementForm },
      {
        onSuccess: () => {
          showSnackbar('Measurements updated!', 'success');
          setIsEditingMeasurements(false);
        },
        onError: () => { showSnackbar('Failed to update measurements', 'error'); },
      }
    );
  };

  const { data: rentalHistory = [] } = useQuery<Rental[]>({
    queryKey: ['rentals', 'customer', selected?.id],
    queryFn: () => apiClient.get(`/rentals?customerId=${selected!.id}`),
    enabled: !!selected?.id,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loyaltyInput, setLoyaltyInput] = useState('');
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', notes: '',
  });

  if (!selected) {return null;}

  const startEditing = () => {
    setEditForm({
      firstName: selected.firstName,
      lastName: selected.lastName,
      email: selected.email ?? '',
      phone: selected.phone ?? '',
      notes: selected.notes ?? '',
    });
    setIsEditing(true);
  };

  const saveEdit = () => {
    updateCustomer.mutate({ id: selected.id, ...editForm }, {
      onSuccess: () => {
        showSnackbar('Customer updated!', 'success');
        setIsEditing(false);
        setSelected(null);
      },
      onError: () => { showSnackbar('Failed to update customer', 'error'); },
    });
  };

  const handleDelete = () => {
    deleteCustomer.mutate(selected.id, {
      onSuccess: () => {
        showSnackbar('Customer deleted', 'success');
        setShowDeleteConfirm(false);
        setSelected(null);
      },
      onError: () => { showSnackbar('Failed to delete customer', 'error'); },
    });
  };

  const handleAddLoyalty = () => {
    const pts = parseInt(loyaltyInput);
    if (!pts || pts <= 0) {return;}
    addLoyalty.mutate({ id: selected.id, points: pts }, {
      onSuccess: () => {
        showSnackbar(`Added ${pts} loyalty points!`, 'success');
        setLoyaltyInput('');
      },
      onError: () => { showSnackbar('Failed to add points', 'error'); },
    });
  };

  return (
    <Modal
      isOpen={!!selected}
      onClose={() => { setSelected(null); setIsEditing(false); setShowDeleteConfirm(false); setIsEditingMeasurements(false); }}
      maxWidth={580}
      title={(
        <div className="flex gap-3 items-center">
          <div className="avatar w-10 h-10 text-[.9rem]" style={{ background: selected.tags?.includes('VIP') ? 'var(--accent-gold-subtle)' : 'var(--bg-panel-hover)', color: selected.tags?.includes('VIP') ? 'var(--accent-gold-text)' : 'var(--text-primary)' }}>
            {selected.firstName[0]}{selected.lastName[0]}
          </div>
          <div className="text-left">
            <div className="font-['Playfair_Display',serif] text-[1.1rem] leading-[1.2]">{selected.firstName} {selected.lastName}</div>
            <div className="text-[.75rem] text-[var(--text-secondary)] font-normal">
              {selected.email} · {selected.phone}
            </div>
          </div>
        </div>
      )}
      footer={
        showDeleteConfirm ? (
          <>
            <span className="text-[.85rem] text-[var(--status-error)] font-semibold">Delete this customer permanently?</span>
            <button className="btn btn-outline" onClick={() => { setShowDeleteConfirm(false); }}>Cancel</button>
            <button className="btn btn-danger"
              onClick={handleDelete} disabled={deleteCustomer.isPending}>
              {deleteCustomer.isPending ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </>
        ) : isEditing ? (
          <>
            <button className="btn btn-outline" onClick={() => { setIsEditing(false); }}>Cancel</button>
            <button className="btn btn-gold" onClick={saveEdit} disabled={updateCustomer.isPending}>
              {updateCustomer.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        ) : isEditingMeasurements && measurements?.[0] ? (
          <>
            <button className="btn btn-outline" onClick={() => { setIsEditingMeasurements(false); }}>Cancel</button>
            <button className="btn btn-gold" onClick={() => { saveMeasurements(measurements[0]); }} disabled={updateMeasurement.isPending}>
              {updateMeasurement.isPending ? 'Saving...' : 'Save Measurements'}
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-outline inline-flex items-center gap-[6px]" onClick={startEditing}>
              <SvgIcon name="tailoring" width="14" height="14" /> Edit
            </button>
            <button className="btn btn-gold inline-flex items-center gap-[6px]"
              onClick={() => { setSelected(null); navigate('/rentals'); }}>
              <SvgIcon name="rental" width="14" height="14" /> + New Rental
            </button>
            <button className="btn btn-ghost btn-sm text-[var(--status-error)]" onClick={() => { setShowDeleteConfirm(true); }}>Delete</button>
          </>
        )
      }
    >
      <div className="-mx-5 -mt-4">
        {/* Tabs */}
        <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-panel-hover)]">
          {(['profile', 'measurements', 'history'] as const).map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setIsEditing(false); setIsEditingMeasurements(false); }}
              className="flex-1 py-3 px-[10px] border-none bg-none cursor-pointer font-semibold text-[.8rem] capitalize tracking-[.02em] transition-all duration-[.15s] flex items-center justify-center gap-[6px]"
              style={{
                color: activeTab === tab ? 'var(--accent-gold-text)' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '2px solid var(--accent-gold)' : '2px solid transparent',
              }}>
              <SvgIcon name={tab === 'measurements' ? 'measurements' : tab === 'history' ? 'clipboard' : 'user'} width="14" height="14" />
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'profile' && (
            isEditing ? (
              <div className="flex flex-col gap-[14px]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="input-group">
                    <label className="input-label">First Name</label>
                    <input className="input" value={editForm.firstName}
                      onChange={e => { setEditForm(f => ({ ...f, firstName: e.target.value })); }} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Last Name</label>
                    <input className="input" value={editForm.lastName}
                      onChange={e => { setEditForm(f => ({ ...f, lastName: e.target.value })); }} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email</label>
                    <input className="input" type="email" value={editForm.email}
                      onChange={e => { setEditForm(f => ({ ...f, email: e.target.value })); }} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Phone</label>
                    <input className="input" value={editForm.phone}
                      onChange={e => { setEditForm(f => ({ ...f, phone: e.target.value })); }} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Notes</label>
                  <textarea className="input resize-y" rows={2} value={editForm.notes}
                    onChange={e => { setEditForm(f => ({ ...f, notes: e.target.value })); }} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Member Since', value: fmtDate(selected.createdAt) },
                    { label: 'Last Visit', value: fmtDate(selected.lastVisitAt) },
                    { label: 'Total Orders', value: selected.totalOrders },
                    { label: 'Total Spent', value: fmt(selected.totalSpent) },
                    { label: 'Loyalty Points', value: `${selected.loyaltyPoints} pts` },
                    { label: 'Value as Credit', value: fmt(selected.loyaltyPoints * 0.01) },
                  ].map(item => (
                    <div key={item.label} className="bg-[var(--bg-panel-hover)] rounded-sm p-[10px_12px]">
                      <div className="text-[.72rem] text-[var(--text-muted)] font-semibold mb-1">{item.label}</div>
                      <div className="text-[.95rem] font-bold">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Add loyalty points */}
                <div className="flex gap-2 items-end">
                  <div className="input-group flex-1">
                    <label className="input-label">Add Loyalty Points</label>
                    <input className="input" type="number" placeholder="e.g. 100" value={loyaltyInput}
                      onChange={e => { setLoyaltyInput(e.target.value); }} />
                  </div>
                  <button className="btn btn-gold btn-sm h-[38px]" onClick={handleAddLoyalty}
                    disabled={addLoyalty.isPending}>
                    {addLoyalty.isPending ? '...' : '+ Add'}
                  </button>
                </div>

                {selected.tags && selected.tags.length > 0 && (
                  <div>
                    <div className="text-[.75rem] text-[var(--text-muted)] font-semibold mb-[6px]">TAGS</div>
                    <div className="flex gap-[6px] flex-wrap">
                      {selected.tags.map(tag => (
                        <span key={tag} className={`badge ${tag === 'VIP' ? 'badge-gold' : tag === 'Overdue' ? 'badge-red' : tag === 'Corporate' ? 'badge-navy' : 'badge-gray'}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selected.notes && (
                  <div className="p-[10px_12px] bg-[#FFFBEB] rounded-sm border border-[#FDE68A] text-[.85rem] text-[#92400E] flex gap-2">
                    <SvgIcon name="warning" width="16" height="16" className="mt-[2px]" /> {selected.notes}
                  </div>
                )}
              </div>
            )
          )}

          {activeTab === 'measurements' && (
            measurements && measurements.length > 0 ? (
              isEditingMeasurements ? (
                <div className="grid grid-cols-2 gap-x-5 gap-y-[10px]">
                  {[
                    { key: 'jacketSize', label: 'Jacket Size' },
                    { key: 'chest',      label: 'Chest'       },
                    { key: 'waist',      label: 'Waist'       },
                    { key: 'hips',       label: 'Hips'        },
                    { key: 'shoulder',   label: 'Shoulder'    },
                    { key: 'neck',       label: 'Neck'        },
                    { key: 'sleeve',     label: 'Sleeve'      },
                    { key: 'inseam',     label: 'Inseam'      },
                    { key: 'outseam',    label: 'Outseam'     },
                    { key: 'shoeSize',   label: 'Shoe Size'   },
                  ].map(f => (
                    <div key={f.key} className="input-group">
                      <label className="input-label">{f.label}</label>
                      <input className="input" value={measurementForm[f.key] ?? ''}
                        onChange={e => { setMeasurementForm(fm => ({ ...fm, [f.key]: e.target.value })); }} />
                    </div>
                  ))}
                  <div className="input-group col-span-full">
                    <label className="input-label">Tailor Notes</label>
                    <textarea className="input resize-y" rows={2} value={measurementForm.notes ?? ''}
                      onChange={e => { setMeasurementForm(fm => ({ ...fm, notes: e.target.value })); }} />
                  </div>
                  <div className="input-group col-span-full">
                    <label className="input-label">Fitting Notes</label>
                    <textarea className="input resize-y" rows={2} value={measurementForm.fittingNotes ?? ''}
                      onChange={e => { setMeasurementForm(fm => ({ ...fm, fittingNotes: e.target.value })); }} />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-2 gap-x-6">
                    <div>
                      <MeasurementRow label="Jacket Size" value={measurements[0].jacketSize} />
                      <MeasurementRow label="Chest" value={measurements[0].chest} />
                      <MeasurementRow label="Waist" value={measurements[0].waist} />
                      <MeasurementRow label="Hips" value={measurements[0].hips} />
                      <MeasurementRow label="Shoulder" value={measurements[0].shoulder} />
                    </div>
                    <div>
                      <MeasurementRow label="Neck" value={measurements[0].neck} />
                      <MeasurementRow label="Sleeve" value={measurements[0].sleeve} />
                      <MeasurementRow label="Inseam" value={measurements[0].inseam} />
                      <MeasurementRow label="Outseam" value={measurements[0].outseam} />
                      <MeasurementRow label="Shoe Size" value={measurements[0].shoeSize} />
                    </div>
                  </div>
                  {measurements[0].notes && (
                    <div className="mt-[14px] p-[10px_12px] bg-[var(--bg-panel-hover)] rounded-sm text-[.82rem] text-[var(--text-secondary)] flex gap-2">
                      <SvgIcon name="tailoring" width="16" height="16" className="mt-[2px]" /> {measurements[0].notes}
                    </div>
                  )}
                  <button className="btn btn-outline mt-4 w-full flex items-center justify-center gap-2"
                    onClick={() => { startEditingMeasurements(measurements[0]); }}>
                    <SvgIcon name="scissors" width="14" height="14" /> Edit Measurements
                  </button>
                </div>
              )
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <SvgIcon name="measurements" width="48" height="48" className="opacity-30" />
                </div>
                <p>No measurements on file</p>
                <button className="btn btn-gold mt-3"
                  onClick={() => { setSelected(null); navigate('/measurements'); }}>Add Measurements</button>
              </div>
            )
          )}

          {activeTab === 'history' && (
            rentalHistory.length > 0 ? (
              <div className="flex flex-col gap-2">
                {rentalHistory.map(r => (
                  <div key={r.id} className="table-row flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm text-[var(--accent-gold-text)]">{r.rentalNo}</div>
                      <div className="text-[.75rem] text-[var(--text-secondary)]">
                        {r.eventName || 'No event'} · {new Date(r.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    <span className={`badge badge-${r.status === 'returned' ? 'neutral' : r.status === 'out' ? 'neutral' : r.status === 'overdue' ? 'error' : 'gold'}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <SvgIcon name="clipboard" width="48" height="48" className="opacity-30" />
                </div>
                <p>No rental history found</p>
              </div>
            )
          )}
        </div>
      </div>
    </Modal>
  );
};
