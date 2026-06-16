import React from 'react';

interface NewCustomerFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  onCancel: () => void;
}

export const NewCustomerForm = ({ onSubmit, isPending, onCancel }: NewCustomerFormProps) => {
  return (
    <div className="panel max-w-[600px] mx-auto">
      <h2 className="mb-5 font-['Playfair_Display',serif]">New Customer Profile</h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">First Name *</label>
            <input name="firstName" className="input" required autoFocus />
          </div>
          <div>
            <label className="label">Last Name *</label>
            <input name="lastName" className="input" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
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
          <textarea name="notes" className="input min-h-[80px] resize-y" />
        </div>
        <div className="flex gap-3 mt-3 justify-end">
          <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-gold" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};
