import React from 'react';
import { Modal } from 'components/atoms/modal/Modal';
import { CartItem } from 'types/pos';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

interface OrderCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  cart: CartItem[];
  total: number;
  paymentMethod: string;
  change: number;
  onPrintReceipt: () => void;
}

const fmt = (n: number) => `$${n.toFixed(2)}`;

export const OrderCompleteModal = ({
  isOpen, onClose, orderId, cart, total, paymentMethod, change, onPrintReceipt
}: OrderCompleteModalProps) => {

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      maxWidth={380}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 12 }}>
          <SvgIcon name="success" width="56" height="56" style={{ color: 'var(--status-success)' }} />
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', marginBottom: 6 }}>Sale Complete!</h3>
        <code style={{ fontSize: '.85rem', color: 'var(--tux-navy)', fontWeight: 700 }}>{orderId}</code>

        <div style={{ margin: '20px 0', padding: '14px', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>Items</span><span style={{ fontWeight: 600 }}>{cart.length}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Charged</span><span style={{ fontWeight: 700, color: 'var(--tux-navy)' }}>{fmt(total)}</span>
          </div>
          {paymentMethod === 'cash' && change > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Change</span><span style={{ fontWeight: 700, color: 'var(--status-success)' }}>{fmt(change)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>Payment</span>
            <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{paymentMethod}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
          <button className="btn btn-outline" style={{ width: '100%', fontSize: '.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={onPrintReceipt}>
            <SvgIcon name="printer" width="16" height="16" />
            Print Receipt
          </button>
          <button className="btn btn-gold" style={{ width: '100%' }} onClick={onClose}>
            + New Order
          </button>
        </div>
      </div>
    </Modal>
  );
};
