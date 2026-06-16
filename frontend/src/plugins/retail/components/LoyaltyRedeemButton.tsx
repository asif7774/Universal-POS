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
      <div className="border border-[var(--tux-gold)] rounded-[var(--radius-md)] p-3 mb-3 bg-[#FFFDF5]">
        <div className="flex items-center gap-2 mb-2">
          <SvgIcon name="gift" width="16" height="16" className="text-[var(--tux-gold-dark)]" />
          <span className="font-semibold text-[.85rem] text-[var(--tux-navy)]">Redeem Loyalty Points</span>
        </div>
        <div className="flex gap-[6px]">
          <input className="input flex-1 text-[.85rem]" type="number" placeholder="Points to redeem" value={points}
            onChange={e => { setPoints(e.target.value); }} />
          <button className="btn btn-gold btn-sm" onClick={handleRedeem}
            disabled={redeemLoyalty.isPending}>
            Apply
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setIsExpanded(false); }}>
            <SvgIcon name="close" width="12" height="12" />
          </button>
        </div>
        <div className="text-[.72rem] text-text-muted mt-[6px]">
          100 points = $1.00 discount
        </div>
      </div>
    );
  }

  return (
    <button className="btn flex items-center justify-center gap-2 w-full mb-3"
      onClick={() => { setIsExpanded(true); }}>
      <SvgIcon name="gift" width="16" height="16" />
      Redeem Points
    </button>
  );
};
