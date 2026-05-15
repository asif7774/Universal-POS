import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from 'lib/apiClient';
import { SvgIcon } from 'components/atoms/svg-sprite-loader';
import { Customer, Measurement } from 'types/customers';
import { Skeleton } from 'components/atoms/skeleton/Skeleton';

const CustomerPortal: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: customer, isLoading: isLoadingCustomer } = useQuery<Customer>({
    queryKey: ['customers', id],
    queryFn: () => apiClient.get(`/customers/${id}`),
    enabled: !!id,
  });

  const { data: measurements, isLoading: isLoadingMeasures } = useQuery<Measurement[]>({
    queryKey: ['measurements', id],
    queryFn: () => apiClient.get(`/customers/${id}/measurements`),
    enabled: !!id,
  });

  if (isLoadingCustomer || isLoadingMeasures) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white p-8 flex flex-col items-center">
        <Skeleton width={120} height={40} className="mb-12" />
        <Skeleton width={300} height={300} className="rounded-2xl mb-8" />
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton height={80} className="rounded-xl" />
          <Skeleton height={80} className="rounded-xl" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-8 text-center">
        <div>
          <h1 className="text-4xl font-display mb-4">Profile Not Found</h1>
          <p className="text-white/50 mb-8">This portal link may have expired or is invalid.</p>
          <a href="/" className="btn btn-gold">Return to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-tux-gold/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-tux-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-tux-navy/20 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-16 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-tux-navy to-tux-gold p-[2px] mb-6 shadow-2xl">
            <div className="w-full h-full rounded-full bg-[#0A0A0B] flex items-center justify-center text-2xl font-display font-bold text-tux-gold uppercase">
              {customer.firstName[0]}{customer.lastName[0]}
            </div>
          </div>
          <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">
            Hello, {customer.firstName}
          </h1>
          <p className="text-white/40 text-sm uppercase tracking-[0.2em] font-medium">
            Your Personal Measurement Profile
          </p>
        </header>

        {/* Loyalty Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 animate-slide-up">
          <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-[#1C1C1E] to-[#141415] border border-white/5 group">
             <div className="relative z-10">
                <div className="flex items-center gap-2 text-tux-gold text-[0.7rem] font-bold uppercase tracking-widest mb-4">
                   <SvgIcon name="star" width="14" height="14" />
                   Tuxedo Rewards
                </div>
                <div className="text-5xl font-display font-bold mb-1">{customer.loyaltyPoints}</div>
                <div className="text-white/40 text-xs font-medium">Available Points</div>
             </div>
             {/* Abstract shape */}
             <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-tux-gold/10 blur-2xl rounded-full group-hover:scale-110 transition-transform duration-700" />
          </div>

          <div className="p-8 rounded-3xl bg-[#1C1C1E] border border-white/5 flex flex-col justify-center">
             <div className="flex items-center justify-between mb-2">
                <span className="text-white/40 text-xs font-medium uppercase tracking-widest">Next Status</span>
                <span className="text-tux-gold text-xs font-bold uppercase">Silver</span>
             </div>
             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-tux-gold rounded-full shadow-[0_0_12px_rgba(212,175,55,0.4)]" style={{ width: '65%' }} />
             </div>
             <p className="text-white/30 text-[0.7rem] m-0 leading-relaxed">
               Spend $145.00 more to unlock <span className="text-white/70">Complimentary Pocket Square</span> rentals.
             </p>
          </div>
        </div>

        {/* Measurements Section */}
        <section className="mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-display font-bold">Your Measurements</h2>
            <button className="text-tux-gold text-xs font-bold uppercase tracking-widest border-b border-tux-gold/30 pb-0.5 hover:text-white hover:border-white transition-colors">
              Update History
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {measurements?.[0] ? (
              Object.entries(measurements[0])
                .filter(([key]) => !['id', 'customerId', 'createdAt', 'updatedAt', 'notes', 'isVerified'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="p-5 rounded-2xl bg-[#1C1C1E]/50 border border-white/5 hover:bg-[#1C1C1E] transition-all duration-300 group">
                    <div className="text-white/30 text-[0.65rem] font-bold uppercase tracking-widest mb-1 group-hover:text-tux-gold transition-colors">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div className="text-xl font-display font-bold">
                      {value || '--'}<span className="text-[0.65rem] text-white/20 ml-1">in</span>
                    </div>
                  </div>
                ))
            ) : (
              <div className="col-span-full p-12 text-center rounded-3xl border border-dashed border-white/10 text-white/30">
                <SvgIcon name="measurements" width="48" height="48" className="mx-auto mb-4 opacity-20" />
                <p className="m-0">No active measurements on file.</p>
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-display font-bold mb-8">Upcoming Rentals</h2>
          <div className="space-y-4">
            <div className="group relative p-6 rounded-3xl bg-gradient-to-r from-[#1C1C1E] to-[#141415] border border-white/5 hover:border-tux-gold/30 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between gap-4">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-[#0A0A0B] flex items-center justify-center text-tux-gold border border-white/5 group-hover:border-tux-gold/20 transition-all">
                       <SvgIcon name="tuxedo" width="32" height="32" />
                    </div>
                    <div>
                       <div className="text-[0.85rem] font-bold text-white mb-1">Classic Black Notch Tuxedo</div>
                       <div className="text-[0.65rem] text-white/40 uppercase tracking-widest font-bold">Wedding: Miller/Smith · June 14</div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[0.7rem] font-bold text-status-success uppercase tracking-widest mb-1">Ready for Pickup</div>
                    <div className="text-[0.65rem] text-white/30">Order #TX-1092</div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer info */}
        <footer className="mt-24 pt-12 border-t border-white/5 text-center">
           <div className="text-[0.7rem] text-white/20 uppercase tracking-[0.3em] font-medium mb-4">TuxedoPOS Premium Experience</div>
           <p className="text-white/40 text-xs leading-relaxed max-w-md mx-auto">
             Need assistance? Contact our master tailors at <span className="text-tux-gold">concierge@tuxedopos.com</span> or call <span className="text-white/60">1-800-TUX-LUXE</span>
           </p>
        </footer>
      </div>
    </div>
  );
};

export default CustomerPortal;
