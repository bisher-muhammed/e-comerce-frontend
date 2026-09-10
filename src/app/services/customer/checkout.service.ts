import apiPrivate from "@/app/lib/api/apiPrivate";

import {
  checkoutSchema,
  verifyPaymentSchema,
  type CheckoutFormData,
  type VerifyPaymentFormData,
} from "@/app/validations/customer/checkout.validation";



export interface RazorpayCheckoutInfo {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface OrderSummary {
  id: number;
  status: string;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: string;
  total: string;
}

export interface CheckoutResponse {
  success: boolean;

  data: {
    order: OrderSummary;

    mode: "COD" | "ONLINE";

    razorpay?: RazorpayCheckoutInfo;
  };
}


export const createCheckout =
  async (
    input: CheckoutFormData
  ): Promise<CheckoutResponse> => {
    const parsed =
      checkoutSchema.safeParse(
        input
      );

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]
          .message
      );
    }


    const response =
      await apiPrivate.post<CheckoutResponse>(
        "/customer/checkout",
        parsed.data
      );

    return response.data;
  };



export interface VerifyPaymentResponse {
  success: boolean;
  data: OrderSummary;
}

export const verifyPayment =
  async (
    input: VerifyPaymentFormData
  ): Promise<VerifyPaymentResponse> => {
    const parsed =
      verifyPaymentSchema.safeParse(
        input
      );

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]
          .message
      );
    }

    const response =
      await apiPrivate.post<VerifyPaymentResponse>(
        "/customer/checkout/verify",
        parsed.data
      );

    return response.data;
  };
