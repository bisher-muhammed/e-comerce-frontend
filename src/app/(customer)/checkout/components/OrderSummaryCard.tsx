"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import type { Cart } from "@/app/services/customer/cart.service";

interface OrderSummaryCardProps {
  cart: Cart;
  subtotal: number;
}

/**
 * NOTE: the promo code field is UI-only. There is no discount endpoint in
 * checkout.service today, so "Apply" doesn't change the total. Wire this up
 * once there's a real promo/coupon API — don't want to fake a discount.
 */
export function OrderSummaryCard({ cart, subtotal }: OrderSummaryCardProps) {
  const [promoCode, setPromoCode] = useState("");
  const [promoNotice, setPromoNotice] = useState("");

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    setPromoNotice("Promo codes aren't supported yet.");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-5">
        <h2 className="text-base font-semibold">Your order</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {cart.items.length}{" "}
          {cart.items.length === 1 ? "product" : "products"}
        </p>
      </div>

      <div className="space-y-4 border-b border-border px-6 py-5">
        {cart.items.map((item) => {
          const product = item.productVariant.productColor.product;
          const color = item.productVariant.productColor.color;
          const size = item.productVariant.size;
          const images = item.productVariant.productColor.images;
          const image = images.find((img) => img.isPrimary) ?? images[0];

          const itemTotal = Number(item.productVariant.price) * item.quantity;

          return (
            <div key={item.id} className="flex gap-3">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                {image && (
                  <img
                    src={image.url}
                    alt={image.altText ?? product.name}
                    className="h-full w-full object-cover"
                  />
                )}

                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[9px] text-background">
                  {item.quantity}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{product.name}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {color.name} · {size.name}
                </p>
              </div>

              <p className="text-xs font-medium">₹{itemTotal.toFixed(2)}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 border-b border-border px-6 py-5">
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value);
              setPromoNotice("");
            }}
            placeholder="Promo code"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-foreground"
          />

          <button
            type="button"
            onClick={handleApplyPromo}
            className="shrink-0 rounded-lg border border-border px-4 py-2.5 text-xs font-medium transition-colors hover:border-foreground"
          >
            Apply
          </button>
        </div>

        {promoNotice && (
          <p className="text-[11px] text-muted-foreground">{promoNotice}</p>
        )}
      </div>

      <div className="space-y-3 px-6 py-5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-xs font-medium">Free</span>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-semibold">Total</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Inclusive of applicable taxes
              </p>
            </div>

            <p className="text-xl font-semibold tracking-tight">
              ₹{subtotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-border px-6 py-4 text-[10px] text-muted-foreground">
        <ShieldCheck size={12} />
        <span>Secure & encrypted checkout</span>
      </div>
    </div>
  );
}
