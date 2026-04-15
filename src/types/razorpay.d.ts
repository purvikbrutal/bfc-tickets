export {};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }

  interface RazorpayCheckoutInstance {
    open(): void;
    on(event: "payment.failed", callback: (response: RazorpayPaymentFailedResponse) => void): void;
  }

  interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    image?: string;
    order_id: string;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    notes?: Record<string, string>;
    modal?: {
      ondismiss?: () => void;
    };
    theme?: {
      color?: string;
    };
    handler(response: RazorpaySuccessResponse): void;
  }

  interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayPaymentFailedResponse {
    error?: {
      code?: string;
      description?: string;
      reason?: string;
      step?: string;
      source?: string;
    };
  }
}
