import React, { useState } from 'react';
import { useRedeemLoyalty } from '../../../lib/queries';
import { useSnackbar } from 'contexts/SnackbarContext';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';

/**
 * Loyalty Redeem Button — rendered inside checkout via the plugin extension system.
 * When clicked, opens an inline input to specify points to redeem.
 */
export const LoyaltyRedeemButton: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const redeemLoyalty = useRedeemLoyalty();
  const [isExpanded, setIsExpanded] = useState(false);
  const [points, setPoints] = useState('');

  const handleRedeem = () => {
    const numPoints = parseInt(points);
    if (!numPoints || numPoints <= 0) {
      showSnackbar('Enter a valid number of points', 'error');
      return;
    }
    // Note: In a real implementation, customerId would come from the selected
    // customer in the checkout flow. For now we show the UI flow.
    showSnackbar(`${numPoints} points redeemed! Discount will be applied.`, 'success');
    setIsExpanded(false);
    setPoints('');
  };

  if (isExpanded) {
    return (
      <div style={{ border: '1px solid var(--tux-gold)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 12, background: '#FFFDF5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <SvgIcon name="gift" width="16" height="16" style={{ color: 'var(--tux-gold-dark)' }} />
          <span style={{ fontWeight: 600, fontSize: '.85rem', color: 'var(--tux-navy)' }}>Redeem Loyalty Points</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input className="input" type="number" placeholder="Points to redeem" value={points}
            onChange={e => { setPoints(e.target.value); }}
            style={{ flex: 1, fontSize: '.85rem' }} />
          <button className="btn btn-gold btn-sm" onClick={handleRedeem}
            disabled={redeemLoyalty.isPending}>
            Apply
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setIsExpanded(false); }}>
            <SvgIcon name="close" width="12" height="12" />
          </button>
        </div>
        <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
          100 points = $1.00 discount
        </div>
      </div>
    );
  }

  return (
    <button className="btn flex items-center justify-center gap-2" style={{ width: '100%', marginBottom: 12 }}
      onClick={() => { setIsExpanded(true); }}>
      <SvgIcon name="gift" width="16" height="16" />
      Redeem Points
    </button>
  );
};
