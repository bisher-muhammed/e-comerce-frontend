
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ShieldCheck,
  Truck,
} from "lucide-react";

import {
  cartHasBlockingIssue,
  getCart,
  type Cart,
} from "@/app/services/customer/cart.service";

import {
  getAddresses,
  type Address,
} from "@/app/services/customer/address.service";

import {
  createCheckout,
  payPendingOrder,
  verifyPayment,
  type OrderSummary,
} from "@/app/services/customer/checkout.service";

import {
  loadRazorpayScript,
} from "@/app/lib/payments/loadRazorpayScript";

import {
  openRazorpayCheckout,
  type RazorpayOrderInfo,
} from "@/app/lib/payments/razorpayCheckout";

import {
  getApiErrorMessage,
  getApiErrorStatus,
} from "@/app/lib/api/apiError";

import { UserFacingError } from "@/app/lib/api/errors";

import { createIdempotencyKey } from "@/app/lib/ids/idempotencyKey";

import {
  validateCoupon,

  type CouponValidationResult,
} from "@/app/services/customer/coupon.service";

import { clearCheckoutDraft, readCheckoutDraft, reconcileDraftSteps, writeCheckoutDraft, } from "./lib/checkoutDraft";
import { computeCheckoutTotals } from "./lib/checkoutTotals";

import { CheckoutStepper } from "./components/Checkoutstepper";
import { OrderSummaryCard } from "./components/OrderSummaryCard";
import { ContactStep } from "./components/Contactstep";
import { ShippingStep } from "./components/Shippingstep";
import { PaymentStep } from "./components/Paymentstep";
import { ReviewCard } from "./components/ReviewCard";
import { OrderConfirmedStep } from "./components/Orderconfirmedstep";

import type {
  ContactInfo,
  PaymentMethod,
  StepId,
} from "./components/types";

import { useStoreData } from "@/app/components/store/StoreDataProvider";

const revalidateCoupon = async (
  code: string,
  cart: Cart
): Promise<CouponValidationResult | null> => {
  try {
    return await validateCoupon({
      code,
      subtotal: Number(cart.subtotal),
    });
  } catch {
    return null;
  }
};

const CART_MAY_HAVE_CHANGED = new Set([400, 404, 409, 422]);

interface PendingPayment {
  orderId: number;
  razorpay: RazorpayOrderInfo;
  expiresAt: string | null;
  signature: string;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function CheckoutPage() {
  const router = useRouter();

  const { refreshCart } = useStoreData();

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

  // ============================================================
  // IDEMPOTENCY
  // ============================================================

  const orderSignature = useMemo(
    () =>
      JSON.stringify({
        cartId: cart?.id ?? null,

        items:
          cart?.items.map((item) => [
            item.productVariantId,
            item.quantity,
            item.finalPrice,
            item.lineTotal,
          ]) ?? [],

        subtotal: cart?.subtotal ?? null,

        addressId: selectedAddressId,

        paymentMethod,

        contactEmail: contact.email


          .trim()
          .toLowerCase(),

        contactPhone: contact.phone.trim(),

        couponCode:
          appliedCoupon?.coupon.code ?? null,

        couponDiscount:
          appliedCoupon?.discountAmount ?? null,
      }),
    [
      cart,
      selectedAddressId,
      paymentMethod,
      contact.email,
      contact.phone,
      appliedCoupon,
    ]
  );

  const idempotencyRef = useRef<{
    signature: string;
    key: string;
  } | null>(null);

  const takeIdempotencyKey = useCallback(() => {
    if (
      idempotencyRef.current?.signature !==
      orderSignature
    ) {
      idempotencyRef.current = {
        signature: orderSignature,
        key: createIdempotencyKey(),
      };
    }

    return idempotencyRef.current.key;
  }, [orderSignature]);

  const [confirmedOrder, setConfirmedOrder] =
    useState<{
      id: string | number;
    } | null>(null);

  const [storedPendingPayment, setPendingPayment] =
    useState<PendingPayment | null>(null);

  const pendingPayment =
    storedPendingPayment?.signature === orderSignature
      ? storedPendingPayment
      : null;

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
          restoredCoupon =
            await revalidateCoupon(
              draft.couponCode,
              loadedCart
            );
        }

        if (loadedCart.items.length === 0) {
          clearCheckoutDraft(loadedCart.id);
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
  // TOTALS
  // ============================================================

  const totals = useMemo(
    () =>
      computeCheckoutTotals(
        cart ?? { subtotal: "0" },
        appliedCoupon
      ),
    [cart, appliedCoupon]
  );

  // ============================================================
  // STOCK CHECK
  // ============================================================

  const hasStockIssue = useMemo(
    () => (cart ? cartHasBlockingIssue(cart) : false),
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

  const reloadCheckoutCart = async (message: string) => {
    try {
      const freshCart = (await getCart()).data;

      let coupon = appliedCoupon;
      let note = "";

      if (coupon) {
        coupon = await revalidateCoupon(
          coupon.coupon.code,
          freshCart
        );

        if (!coupon) {
          note = " Your coupon no longer applies to this order.";
        }
      }

      setCart(freshCart);
      setAppliedCoupon(coupon);
      setActionError(`${message}${note}`);
    } catch {
      setActionError(message);
    }

    await refreshCart();
  };

  const finishOrder = async (orderId: number) => {
    setPlacing(false);
    setPendingPayment(null);

    clearCheckoutDraft(cartId);

    setConfirmedOrder({
      id: orderId,
    });

    await refreshCart();
  };

  const collectPayment = async (
    order: Pick<OrderSummary, "id" | "expiresAt">,
    razorpay: RazorpayOrderInfo
  ) => {
    const outcome = await openRazorpayCheckout(
      razorpay,
      {
        description: `Order #${order.id}`,
        prefill: {
          email: contact.email,
          contact: contact.phone,
        },
      }
    );

    if (outcome.status === "dismissed") {
      setPlacing(false);

      setPendingPayment({
        orderId: order.id,
        razorpay,
        expiresAt: order.expiresAt ?? null,
        signature: orderSignature,
      });

      setActionError("");

      await refreshCart();

      return;
    }

    try {
      await verifyPayment(outcome.payment);

      await finishOrder(order.id);
    } catch (err) {
      setPlacing(false);

      setActionError(
        getApiErrorMessage(
          err,
          `Payment was received but we couldn't confirm order #${order.id} yet. Check your orders in a minute, or contact support with the order number.`
        )
      );
    }
  };

  const handleResumePayment = async () => {
    if (!pendingPayment) return;

    setActionError("");
    setPlacing(true);

    let razorpay = pendingPayment.razorpay;
    let expiresAt = pendingPayment.expiresAt;

    try {
      try {
        const resumed = await payPendingOrder(
          pendingPayment.orderId
        );

        if (resumed.data.razorpay) {
          razorpay = resumed.data.razorpay;
        }

        expiresAt =
          resumed.data.order.expiresAt ?? expiresAt;
      } catch (err) {
        if (getApiErrorStatus(err) !== 404) {
          throw err;
        }
      }

      await collectPayment(
        { id: pendingPayment.orderId, expiresAt },
        razorpay
      );
    } catch (err) {
      setPlacing(false);

      if (getApiErrorStatus(err) === 409) {
        setPendingPayment(null);
      }

      setActionError(
        getApiErrorMessage(
          err,
          "We couldn't reopen the payment. You can pay from your orders page."
        )
      );
    }
  };

  // ============================================================
  // PLACE ORDER / START PAYMENT
  // ============================================================

  const handlePlaceOrder = async () => {
    if (pendingPayment) {
      await handleResumePayment();

      return;
    }

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

    if (!cart) return;

    if (totals.couponStale && appliedCoupon) {
      setAppliedCoupon(
        await revalidateCoupon(
          appliedCoupon.coupon.code,
          cart
        )
      );

      setActionError(
        "Your coupon was re-checked against the current total. Please review your order before placing it."
      );

      return;
    }

    setActionError("");
    setPlacing(true);

    try {
      if (paymentMethod === "ONLINE") {
        try {
          await loadRazorpayScript();
        } catch {
          throw new UserFacingError(
            "We couldn't load the payment window. Check your connection or ad blocker and try again, or choose Cash on Delivery."
          );
        }
      }

      const response =
        await createCheckout({
          addressId: selectedAddressId,

          paymentMethod,

          contactEmail: contact.email,

          contactPhone: contact.phone,

          couponCode:
            appliedCoupon?.coupon.code,

          expectedTotal: totals.expectedTotal,

          idempotencyKey:
            takeIdempotencyKey(),
        });

      const {
        order,
        mode,
        razorpay,
      } = response.data;

      if (mode === "COD") {
        await finishOrder(order.id);

        return;
      }

      if (!razorpay) {
        throw new UserFacingError(
          `Order #${order.id} was created but its payment could not be started. You can pay for it from your orders page.`
        );
      }

      await collectPayment(order, razorpay);
    } catch (err) {
      setPlacing(false);

      const message = getApiErrorMessage(
        err,
        "Failed to start checkout"
      );

      const status = getApiErrorStatus(err);

      if (status !== undefined && CART_MAY_HAVE_CHANGED.has(status)) {
        await reloadCheckoutCart(message);
      } else {
        setActionError(message);
      }
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
          href="/customer"
          className="mt-5 inline-block text-sm underline underline-offset-4"
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
              router.push("/customer")
            }
          />
        </div>
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
          href="/customer"
          className="mt-6 inline-flex rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Continue shopping
        </Link>
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
                pendingPayment={
                  pendingPayment && {
                    orderId: pendingPayment.orderId,
                    expiresAtLabel: pendingPayment.expiresAt
                      ? formatTime(pendingPayment.expiresAt)
                      : null,
                  }
                }
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
