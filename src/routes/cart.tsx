import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { offers, rupees } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Yum2MyTum" },
      { name: "description", content: "Review your Yum2MyTum order, apply a promo code and add a courier tip before checkout." },
      { property: "og:title", content: "Your cart — Yum2MyTum" },
      { property: "og:description", content: "Review items, savings and delivery fees before you check out." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const [code, setCode] = React.useState(cart.state.promoCode ?? "");

  if (cart.count === 0 || !cart.kitchen) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 font-display text-2xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Pick a kitchen and we will keep everything warm on the way.</p>
        <Link
          to="/browse"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Browse kitchens
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 pb-28 lg:grid-cols-[1.4fr_1fr] md:pb-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Your cart</h1>
        <Link
          to="/kitchen/$slug"
          params={{ slug: cart.kitchen.slug }}
          className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <span className="text-lg">{cart.kitchen.emoji}</span> From {cart.kitchen.name} · {cart.kitchen.area}
        </Link>

        <ul className="mt-5 divide-y divide-border rounded-3xl border border-border bg-card">
          {cart.items.map(({ item, qty }) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              <img src={item.image} alt={item.name} loading="lazy" className="size-12 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">{rupees(item.price)} each</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
                <button aria-label="Remove one" onClick={() => cart.remove(item.id)} className="p-1">
                  {qty === 1 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
                </button>
                <span className="w-5 text-center text-sm font-bold">{qty}</span>
                <button
                  aria-label="Add one"
                  onClick={() => cart.add(cart.kitchen!.slug, item)}
                  className="p-1"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <span className="w-16 text-right text-sm font-semibold">{rupees(item.price * qty)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 rounded-3xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Tag className="size-4 text-primary" /> Apply a promo code
          </h2>
          <div className="mt-3 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              aria-label="Promo code"
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm tracking-widest outline-none focus:border-primary"
            />
            <button
              onClick={() => {
                const ok = cart.applyPromo(code || null);
                if (!ok) toast.error("That code isn't valid right now.");
                else if (code) toast.success(`${code} applied`);
              }}
              className="rounded-xl bg-ink px-5 text-sm font-semibold text-ink-foreground"
            >
              Apply
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {offers.map((o) => (
              <button
                key={o.code}
                onClick={() => {
                  setCode(o.code);
                  cart.applyPromo(o.code);
                  toast.success(`${o.code} applied`);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold",
                  cart.state.promoCode === o.code
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-dashed border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {o.code} · {o.discountPct}%
              </button>
            ))}
          </div>
          {cart.state.promoCode && cart.discount === 0 && (
            <p className="mt-3 text-xs text-destructive">
              Add a little more to reach the minimum order for {cart.state.promoCode}.
            </p>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Tip your courier</h2>
          <div className="mt-3 flex gap-2">
            {[0, 20, 40, 60].map((t) => (
              <button
                key={t}
                onClick={() => cart.setTip(t)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold",
                  cart.state.tipAmount === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {t === 0 ? "No tip" : rupees(t)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-3xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-bold">Bill summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Item total" value={rupees(cart.subtotal)} />
          {cart.discount > 0 && (
            <Row label={`Promo (${cart.state.promoCode})`} value={`− ${rupees(cart.discount)}`} accent />
          )}
          <Row label="Delivery fee" value={cart.deliveryFee === 0 ? "Free" : rupees(cart.deliveryFee)} />
          <Row label="Taxes & charges" value={rupees(cart.taxes)} />
          {cart.state.tipAmount > 0 && <Row label="Courier tip" value={rupees(cart.state.tipAmount)} />}
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="font-display text-lg font-bold">To pay</span>
          <span className="font-display text-lg font-extrabold">{rupees(cart.total)}</span>
        </div>
        <Link
          to="/checkout"
          className="mt-5 block rounded-2xl bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground"
        >
          Choose address & pay
        </Link>
        <button onClick={cart.clear} className="mt-3 w-full text-xs text-muted-foreground hover:text-destructive">
          Empty cart
        </button>
      </aside>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium", accent && "text-veg")}>{value}</dd>
    </div>
  );
}
