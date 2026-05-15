import React from 'react';

interface NewRentalFormProps {
  customers: {id: string, firstName: string, lastName: string}[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  onCancel: () => void;
}

export const NewRentalForm = ({ customers, onSubmit, isPending, onCancel }: NewRentalFormProps) => {
  return (
    <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>New Rental Booking</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="label">Customer *</label>
          <select name="customerId" className="input" required>
            <option value="">Select a customer...</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Event Name</label>
          <input name="eventName" className="input" placeholder="e.g. Prom - Lincoln HS" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="label">Pickup Date *</label>
            <input name="pickupDate" type="date" className="input" required />
          </div>
          <div>
            <label className="label">Return Date *</label>
            <input name="returnDate" type="date" className="input" required />
          </div>
        </div>
        <div>
          <label className="label">Items (comma separated) *</label>
          <input name="items" className="input" placeholder="e.g. Navy Tuxedo 40R, White Shirt" required />
        </div>
        <div>
          <label className="label">Deposit Paid ($)</label>
          <input name="depositPaid" type="number" step="0.01" className="input" defaultValue="0.00" />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea name="notes" className="input" style={{ minHeight: 60 }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-gold" disabled={isPending}>
            {isPending ? 'Booking...' : 'Book Rental'}
          </button>
        </div>
      </form>
    </div>
  );
};
