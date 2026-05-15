import React from 'react';

interface NewCustomerFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  onCancel: () => void;
}

export const NewCustomerForm = ({ onSubmit, isPending, onCancel }: NewCustomerFormProps) => {
  return (
    <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>New Customer Profile</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="label">First Name *</label>
            <input name="firstName" className="input" required autoFocus />
          </div>
          <div>
            <label className="label">Last Name *</label>
            <input name="lastName" className="input" required />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="input" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="phone" type="tel" className="input" />
          </div>
        </div>
        <div>
          <label className="label">Tags (comma separated)</label>
          <input name="tags" className="input" placeholder="e.g. VIP, Prom, Wedding" />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea name="notes" className="input" style={{ minHeight: 80, resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-gold" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};
