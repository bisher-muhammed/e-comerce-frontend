import apiPrivate from "@/app/lib/api/apiPrivate";
import { PAYMENT_REQUEST_TIMEOUT_MS } from "@/app/lib/api/config";
import { UserFacingError } from "@/app/lib/api/errors";
import type { RazorpayOrderInfo } from "@/app/lib/payments/razorpayCheckout";

import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/app/validations/customer/order.validation";

import {
  checkoutSchema,
  verifyPaymentSchema,
  type CheckoutFormData,
  type VerifyPaymentFormData,
} from "@/app/validations/customer/checkout.validation";

export type RazorpayCheckoutInfo = RazorpayOrderInfo;

export interface OrderSummary {
  id: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  total: string;
  expiresAt?: string | null;
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
      throw new UserFacingError(
        parsed.error.issues[0]
          .message

      );
    }

    const response =
      await apiPrivate.post<CheckoutResponse>(
        "/customer/checkout",
        parsed.data,
        { timeout: PAYMENT_REQUEST_TIMEOUT_MS }
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
      throw new UserFacingError(
        parsed.error.issues[0]
          .message
      );
    }

    const response =
      await apiPrivate.post<VerifyPaymentResponse>(
        "/customer/checkout/verify",
        parsed.data,
        { timeout: PAYMENT_REQUEST_TIMEOUT_MS }
      );

    return response.data;
  };

export const payPendingOrder =
  async (
    orderId: number
  ): Promise<CheckoutResponse> => {
    const response =
      await apiPrivate.post<CheckoutResponse>(
        `/customer/orders/${orderId}/pay`,
        {},
        { timeout: PAYMENT_REQUEST_TIMEOUT_MS }
      );

    return response.data;
  };
