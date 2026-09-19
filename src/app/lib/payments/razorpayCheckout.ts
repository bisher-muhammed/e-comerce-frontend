import { loadRazorpayScript } from "./loadRazorpayScript";

export interface RazorpayOrderInfo {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface RazorpayPaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export type RazorpayOutcome =
  | { status: "paid"; payment: RazorpayPaymentResult }
  | { status: "dismissed" };

export async function openRazorpayCheckout(
  razorpay: RazorpayOrderInfo,
  details: {
    description: string;
    prefill?: { email?: string; contact?: string; name?: string };
  }
): Promise<RazorpayOutcome> {
  await loadRazorpayScript();

  return new Promise<RazorpayOutcome>((resolve) => {
    const checkout = new window.Razorpay({
      key: razorpay.keyId,
      amount: razorpay.amount,
      currency: razorpay.currency,
      order_id: razorpay.orderId,
      name: "Store",
      description: details.description,
      prefill: details.prefill,
      theme: {
        color: "#1A1917",
      },

      handler: (payment: RazorpayPaymentResult) =>
        resolve({ status: "paid", payment }),

      modal: {
        ondismiss: () => resolve({ status: "dismissed" }),
      },
    });

    checkout.open();
  });
}
