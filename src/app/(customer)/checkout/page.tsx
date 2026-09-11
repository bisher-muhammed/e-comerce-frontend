
"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ShieldCheck,
  Truck,
} from "lucide-react";

import {
  getCart,
  type Cart,
} from "@/app/services/customer/cart.service";

import {
  getAddresses,
  type Address,
} from "@/app/services/customer/address.service";

import {
  createCheckout,
  verifyPayment,
} from "@/app/services/customer/checkout.service";

import {
  loadRazorpayScript,
} from "@/app/lib/payments/loadRazorpayScript";

import {
  getApiErrorMessage,
} from "@/app/lib/api/apiError";

import {
  validateCoupon,
  type CouponValidationResult,
} from "@/app/services/customer/coupon.service";

import { clearCheckoutDraft, readCheckoutDraft, reconcileDraftSteps, writeCheckoutDraft, } from "./lib/checkoutDraft";

import { CheckoutStepper } from "./components/Checkoutstepper";
import { OrderSummaryCard } from "./components/OrderSummaryCard";
import { ContactStep } from "./components/Contactstep";
import { ShippingStep } from "./components/Shippingstep";
import { PaymentStep } from "./components/Paymentstep";
import { ReviewCard } from "./components/ReviewCard";
import { OrderConfirmedStep } from "./components/Orderconfirmedstep";


import type {
  CheckoutTotals,
  ContactInfo,
  PaymentMethod,
  StepId,
} from "./components/types";

const calculateSubtotal = (cart: Cart): number =>
  cart.items.reduce(
    (total, item) =>
      total +
      Number(item.productVariant.price) *
        item.quantity,
    0
  );

export default function CheckoutPage() {
  const router = useRouter();



  const [cart, setCart] =
    useState<Cart | null>(null);

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [draftRestored, setDraftRestored] =
    useState(false);

  // ============================================================
  // CHECKOUT STEPS
  // ============================================================

  const [currentStep, setCurrentStep] =
    useState<StepId>("contact");

  const [completedSteps, setCompletedSteps] =
    useState<StepId[]>([]);

  // ============================================================
  // CONTACT
  // ============================================================

  const [contact, setContact] =
    useState<ContactInfo>({
      email: "",
      phone: "",
      keepUpdated: true,
    });


  const [selectedAddressId, setSelectedAddressId] =
    useState<number | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("COD");


  const [appliedCoupon, setAppliedCoupon] =
    useState<CouponValidationResult | null>(
      null
    );

  // ============================================================
  // ORDER ACTION STATE
  // ============================================================

  const [actionError, setActionError] =
    useState("");

  const [placing, setPlacing] =
    useState(false);


  const [idempotencyKey] =
    useState(() => crypto.randomUUID());



  const [confirmedOrder, setConfirmedOrder] =
    useState<{
      id: string | number;
    } | null>(null);

  // ============================================================
  // LOAD CART + ADDRESSES
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadError("");

        const [cartRes, addressRes] =
          await Promise.all([
            getCart(),
            getAddresses(),
          ]);

        if (cancelled) return;

        const loadedCart = cartRes.data;
        const loadedAddresses = addressRes.data;

        const draft = readCheckoutDraft(
          loadedCart.id
        );

        const defaultAddressId =
          loadedAddresses.find(
            (address) => address.isDefault
          )?.id ??
          loadedAddresses[0]?.id ??
          null;

        const restoredAddressId =
          draft &&
          loadedAddresses.some(
            (address) =>
              address.id ===
              draft.selectedAddressId
          )
            ? draft.selectedAddressId
            : defaultAddressId;

        let restoredCoupon: CouponValidationResult | null =
          null;

        if (draft?.couponCode) {
          try {
            restoredCoupon =
              await validateCoupon({
                code: draft.couponCode,
                subtotal:
                  calculateSubtotal(
                    loadedCart
                  ),
              });
          } catch {
            restoredCoupon = null;
          }
        }

        if (cancelled) return;

        setCart(loadedCart);
        setAddresses(loadedAddresses);
        setSelectedAddressId(
          restoredAddressId
        );

        if (draft) {
          const steps =
            reconcileDraftSteps(
              draft,
              restoredAddressId !== null
            );

          setContact(draft.contact);
          setPaymentMethod(
            draft.paymentMethod
          );
          setCompletedSteps(
            steps.completedSteps
          );
          setCurrentStep(
            steps.currentStep
          );
          setAppliedCoupon(
            restoredCoupon
          );
        }

        setDraftRestored(true);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            getApiErrorMessage(
              err,
              "Failed to load checkout"
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // SUBTOTAL
  // ============================================================

  const subtotal = useMemo(
    () =>
      cart
        ? calculateSubtotal(cart)
        : 0,
    [cart]
  );

  // ============================================================
  // TOTALS
  // ============================================================

  const totals = useMemo<CheckoutTotals>(
    () => ({
      subtotal,

      discountAmount:
        appliedCoupon?.discountAmount ?? 0,

      total:
        appliedCoupon?.finalSubtotal ??
        subtotal,
    }),
    [subtotal, appliedCoupon]
  );

  // ============================================================
  // STOCK CHECK
  // ============================================================

  const hasStockIssue = useMemo(
    () =>
      cart?.items.some(
        (item) =>
          item.productVariant.stock === 0 ||
          item.quantity >
            item.productVariant.stock
      ) ?? false,
    [cart]
  );

  // ============================================================
  // PERSIST PROGRESS
  // ============================================================

  const cartId = cart?.id ?? null;

  useEffect(() => {

    if (!draftRestored || confirmedOrder) {
      return;
    }

    writeCheckoutDraft(cartId, {
      currentStep,
      completedSteps,
      contact,
      selectedAddressId,
      paymentMethod,
      couponCode:
        appliedCoupon?.coupon.code ?? null,
    });
  }, [
    draftRestored,
    confirmedOrder,
    cartId,
    currentStep,
    completedSteps,
    contact,
    selectedAddressId,
    paymentMethod,
    appliedCoupon,
  ]);

  // ============================================================
  // SELECTED ADDRESS
  // ============================================================

  const selectedAddress =
    addresses.find(
      (address) =>
        address.id === selectedAddressId
    );

  // ============================================================
  // STEP NAVIGATION
  // ============================================================

  const goToStep = (step: StepId) => {
    setActionError("");
    setCurrentStep(step);
  };

  const completeAndAdvance = (
    from: StepId,
    to: StepId
  ) => {
    setCompletedSteps((prev) =>
      prev.includes(from)
        ? prev
        : [...prev, from]
    );

    goToStep(to);
  };

  // ============================================================
  // PLACE ORDER / START PAYMENT
  // ============================================================

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setActionError(
        "Select a delivery address before placing your order."
      );

      goToStep("shipping");

      return;
    }

    if (hasStockIssue) {
      setActionError(
        "Fix the stock issues in your cart before continuing."
      );

      return;
    }

    setActionError("");
    setPlacing(true);

    try {
      /**
       * IMPORTANT:
       *
       * We send only couponCode.
       *
       * We DO NOT send:
       *
       * discountAmount
       * finalTotal
       * subtotal
       *
       * as trusted coupon calculations.
       *
       * The backend must calculate the real discount again.
       */
      const response =
        await createCheckout({
          addressId: selectedAddressId,

          paymentMethod,

          contactEmail: contact.email,

          contactPhone: contact.phone,

          /**
           * If no coupon is applied, this becomes undefined.
           *
           * If coupon is applied:
           *
           * "SUMMER50"
           */
          couponCode:
            appliedCoupon?.coupon.code,

          idempotencyKey,
        });

      const {
        order,
        mode,
        razorpay,
      } = response.data;

      // ========================================================
      // COD
      // ========================================================

      if (mode === "COD") {
        setPlacing(false);

        clearCheckoutDraft(cartId);

        setConfirmedOrder({
          id: order.id,
        });

        return;
      }

      // ========================================================
      // ONLINE
      // ========================================================

      if (!razorpay) {
        throw new Error(
          "Missing Razorpay order details from server"
        );
      }

      await loadRazorpayScript();

      const rzp =
        new window.Razorpay({
          key: razorpay.keyId,

          amount: razorpay.amount,

          currency: razorpay.currency,

          order_id: razorpay.orderId,

          name: "Store",

          description:
            `Order #${order.id}`,

          theme: {
            color: "#1A1917",
          },

          handler: async (
            rzpResponse: {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            }
          ) => {
            try {
              await verifyPayment(
                rzpResponse
              );

              setPlacing(false);

              clearCheckoutDraft(cartId);

              setConfirmedOrder({
                id: order.id,
              });
            } catch (err) {
              setPlacing(false);

              setActionError(
                getApiErrorMessage(
                  err,
                  "Payment was received but we couldn't confirm your order. Contact support with your order ID."
                )
              );
            }
          },

          modal: {
            ondismiss: () => {
              setPlacing(false);

              setActionError(
                "Payment was cancelled."
              );
            },
          },
        });

      rzp.open();
    } catch (err) {
      setPlacing(false);

      setActionError(
        getApiErrorMessage(
          err,
          "Failed to start checkout"
        )
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-4 w-32 rounded bg-secondary" />

            <div className="h-9 w-56 rounded bg-secondary" />

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-4">
                <div className="h-36 rounded-xl bg-secondary" />
                <div className="h-36 rounded-xl bg-secondary" />
              </div>

              <div className="h-96 rounded-xl bg-secondary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // LOAD ERROR
  // ============================================================

  if (loadError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-destructive">
          {loadError}
        </p>

        <Link
          href="/shop"
          className="mt-5 inline-block text-sm underline underline-offset-4"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  // ============================================================
  // EMPTY CART
  // ============================================================

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Truck size={24} />
        </div>

        <h1 className="mt-5 text-xl font-semibold">
          Your cart is empty
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Add something to your cart before checking out.
        </p>

        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  // ============================================================
  // CONFIRMED
  // ============================================================

  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <OrderConfirmedStep
            customerName={
              selectedAddress?.firstName ??
              "there"
            }
            orderId={confirmedOrder.id}
            onTrackOrder={() =>
              router.push(
                `/accounts/orders/${confirmedOrder.id}`
              )
            }
            onContinueShopping={() =>
              router.push("/shop")
            }
          />
        </div>
      </div>
    );
  }

  // ============================================================
  // CHECKOUT UI
  // ============================================================

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* HEADER */}

        <div className="mb-8">
          <div className="mb-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Link
              href="/cart"
              className="transition-colors hover:text-foreground"
            >
              Cart
            </Link>

            <span>/</span>

            <span className="font-medium text-foreground">
              Checkout
            </span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Checkout
            </h1>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background">
                <ShieldCheck size={14} />
              </div>

              <span>
                Secure checkout
              </span>
            </div>
          </div>
        </div>

        {/* STEPPER */}

        <CheckoutStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            {/* CONTACT */}

            {currentStep === "contact" && (
              <ContactStep
                contact={contact}
                onChange={setContact}
                onContinue={() =>
                  completeAndAdvance(
                    "contact",
                    "shipping"
                  )
                }
              />
            )}

            {/* SHIPPING */}

            {currentStep === "shipping" && (
              <ShippingStep
                addresses={addresses}
                selectedAddressId={
                  selectedAddressId
                }
                onSelectAddress={
                  setSelectedAddressId
                }
                onBack={() =>
                  goToStep("contact")
                }
                onContinue={() =>
                  completeAndAdvance(
                    "shipping",
                    "payment"
                  )
                }
              />
            )}

            {/* PAYMENT */}

            {currentStep === "payment" && (
              <PaymentStep
                paymentMethod={
                  paymentMethod
                }
                onChange={
                  setPaymentMethod
                }
                onBack={() =>
                  goToStep("shipping")
                }
                onContinue={() =>
                  completeAndAdvance(
                    "payment",
                    "review"
                  )
                }
              />
            )}

            {/* REVIEW */}

            {currentStep === "review" && (
              <ReviewCard
                contact={contact}
                address={selectedAddress}
                paymentMethod={
                  paymentMethod
                }
                cart={cart}
                totals={totals}
                hasStockIssue={
                  hasStockIssue
                }
                placing={placing}
                actionError={actionError}
                onEdit={goToStep}
                onPlaceOrder={
                  handlePlaceOrder
                }
              />
            )}
          </div>

          {/* ==================================================
              ORDER SUMMARY
          ================================================== */}

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <OrderSummaryCard
              cart={cart}
              totals={totals}

              /**
               * Parent owns the actual applied coupon.
               */
              appliedCoupon={
                appliedCoupon
              }

              /**
               * Summary updates the parent when:
               *
               * Apply -> CouponValidationResult
               * Remove -> null
               */
              onCouponChange={
                setAppliedCoupon
              }
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
