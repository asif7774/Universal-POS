export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

/**
 * Mock implementation of a Stripe Terminal / Stripe Reader integration.
 * In production, this would initialize the Stripe Terminal SDK, connect to a physical reader,
 * collect payment methods, and process the PaymentIntent.
 */
export const processCardPayment = async (amount: number, currency: string = 'usd'): Promise<PaymentResult> => {
  return new Promise((resolve) => {
    // Simulate terminal connection and processing delay
    setTimeout(() => {
      // 90% success rate mock
      if (Math.random() > 0.1) {
        resolve({
          success: true,
          transactionId: `pi_${Math.random().toString(36).substring(2, 15)}`
        });
      } else {
        resolve({
          success: false,
          error: 'Card declined or terminal disconnected. Please try again.'
        });
      }
    }, 2500); // 2.5 second simulated processing time
  });
};
