import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Banknote, Building2, CreditCard, GraduationCap, Home, Plus, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { rupees } from "@/lib/data";
import { Loader2 } from "lucide-react";
import { pickCourier, saveOrder } from "@/lib/orders";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Yum2MyTum" },
      { name: "description", content: "Confirm your delivery address, pick a payment method and place your Yum2MyTum order." },
      { property: "og:title", content: "Checkout — Yum2MyTum" },
      { property: "og:description", content: "Address, payment and delivery notes in one short step." },
    ],
  }),
  component: CheckoutPage,
});

const icons = { home: Home, work: Building2, campus: GraduationCap };

const payments = [
  { id: "upi", label: "UPI", detail: "Pay by any UPI app", icon: Smartphone },
  { id: "card", label: "Card", detail: "Visa ending 4417", icon: CreditCard },
  { id: "cash", label: "Cash on delivery", detail: "Keep exact change handy", icon: Banknote },
];

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = React.useState("upi");
  const [note, setNote] = React.useState("");
  const [placing, setPlacing] = React.useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="mx-auto max-w-lg px-4 py-20 text-center text-muted-foreground">Checking your account…</div>;
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold">Log in to place your order</h1>
        <p className="mt-2 text-muted-foreground">Your cart is saved — sign in and you'll come right back here.</p>
        <Link
          to="/auth"
          search={{ redirect: "/checkout" }}
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Log in or sign up
        </Link>
      </div>
    );
  }

  if (cart.count === 0 || !cart.kitchen) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold">Nothing to check out</h1>
        <p className="mt-2 text-muted-foreground">Add a few dishes first and come right back.</p>
        <Link to="/browse" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          Browse kitchens
        </Link>
      </div>
    );
  }

  const kitchen = cart.kitchen;

  const placeOrder = async () => {
    if (placing) return;
    setPlacing(true);
    // Simulated payment/processing delay.
    await new Promise((r) => setTimeout(r, 900));
    const id = `YT${Math.floor(100000 + Math.random() * 899999)}`;
    saveOrder({
      id,
      kitchenSlug: kitchen.slug,
      kitchenName: kitchen.name,
      placedAt: Date.now(),
      etaMins: kitchen.etaMins,
      total: cart.total,
      items: cart.items.map(({ item, qty }) => ({ name: item.name, qty, emoji: item.emoji })),
      addressId: cart.address.id,
      addressLabel: cart.address.label,
      addressLine: cart.address.line,
      payment: payments.find((p) => p.id === payment)?.label ?? "UPI",
      courier: pickCourier(),
    });
    cart.clear();
    toast.success("Order placed", { description: `${kitchen.name} is firing up your food.` });
    navigate({ to: "/track/$orderId", params: { orderId: id } });
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 pb-28 lg:grid-cols-[1.4fr_1fr] md:pb-8">
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-extrabold">Checkout</h1>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Deliver to</h2>
          <div className="mt-3 space-y-2">
            {cart.addresses.map((a) => {
              const Icon = icons[a.icon];
              const active = a.id === cart.address.id;
              return (
                <button
                  key={a.id}
                  onClick={() => cart.setAddress(a.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                    active ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
                  )}
                >
                  <Icon className={cn("mt-0.5 size-5", active ? "text-primary" : "text-muted-foreground")} />
                  <span className="min-w-0">
                    <span className="block font-semibold">{a.label}</span>
                    <span className="block text-sm text-muted-foreground">{a.line}</span>
                    <span className="block text-xs text-muted-foreground">{a.detail}</span>
                  </span>
                </button>
              );
            })}
            <AddAddress onAdd={(a) => { cart.addAddress(a); toast.success(`${a.label} address saved`); }} />
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Payment method</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {payments.map((p) => (
              <button
                key={p.id}
                onClick={() => setPayment(p.id)}
                className={cn(
                  "rounded-2xl border p-4 text-left",
                  payment === p.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
                )}
              >
                <p.icon className={cn("size-5", payment === p.id ? "text-primary" : "text-muted-foreground")} />
                <p className="mt-2 font-semibold">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.detail}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Delivery instructions</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Gate code, landmark, or 'leave at the door'"
            aria-label="Delivery instructions"
            className="mt-3 w-full rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
          />
        </section>
      </div>

      <aside className="h-fit rounded-3xl border border-border bg-card p-5 shadow-card lg:sticky lg:top-24">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Order from</p>
        <p className="font-display text-lg font-bold">
          {kitchen.emoji} {kitchen.name}
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {cart.items.map(({ item, qty }) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="min-w-0 truncate text-muted-foreground">
                {qty} × {item.name}
              </span>
              <span className="font-medium">{rupees(item.price * qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          {cart.discount > 0 && (
            <div className="flex justify-between text-veg">
              <span>Promo savings</span>
              <span>− {rupees(cart.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Delivery + taxes</span>
            <span>{rupees(cart.deliveryFee + cart.taxes)}</span>
          </div>
          <div className="flex justify-between font-display text-lg font-extrabold text-foreground">
            <span>To pay</span>
            <span>{rupees(cart.total)}</span>
          </div>
        </div>
        <button
          onClick={placeOrder}
          disabled={placing}
          className="mt-5 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {placing && <Loader2 className="mr-2 inline size-4 animate-spin" />}
          {placing ? "Placing order…" : `Place order · ${rupees(cart.total)}`}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Arriving in about {kitchen.etaMins} minutes to {cart.address.label}
        </p>
      </aside>
    </div>
  );
}

function AddAddress({ onAdd }: { onAdd: (a: { label: string; line: string; detail: string; icon: "home" | "work" | "campus" }) => void }) {
  const [open, setOpen] = React.useState(false);
  const [label, setLabel] = React.useState("");
  const [line, setLine] = React.useState("");
  const [pin, setPin] = React.useState("");
  const [note, setNote] = React.useState("");
  const [icon, setIcon] = React.useState<"home" | "work" | "campus">("home");
  const [errs, setErrs] = React.useState<{ label?: string | undefined; line?: string | undefined; pin?: string | undefined }>({});

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-border p-4 text-sm font-semibold text-muted-foreground hover:bg-muted"
      >
        <Plus className="size-4" /> Add a new address
      </button>
    );

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const next = {
      label: label.trim() ? undefined : "Give this address a name",
      line: line.trim().length >= 8 ? undefined : "Enter the full street address",
      pin: /^4\d{5}$/.test(pin.trim()) ? undefined : "Enter a valid 6-digit Mumbai PIN (starts with 4)",
    };
    setErrs(next);
    if (next.label || next.line || next.pin) return;
    onAdd({ label: label.trim(), line: line.trim(), detail: `Mumbai ${pin.trim()}${note.trim() ? ` · ${note.trim()}` : ""}`, icon });
    setOpen(false);
    setLabel(""); setLine(""); setPin(""); setNote("");
  };
  const f = "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary";
  const err = (m?: string) => m && <p className="mt-1 px-1 text-xs font-medium text-destructive">{m}</p>;
  return (
    <form onSubmit={save} noValidate className="space-y-2 rounded-2xl border border-dashed border-primary p-4">
      <div className="flex gap-2">
        {(["home", "work", "campus"] as const).map((k) => {
          const I = icons[k];
          return (
            <button type="button" key={k} onClick={() => setIcon(k)} aria-label={k}
              className={cn("rounded-xl border p-2", icon === k ? "border-primary text-primary" : "border-border text-muted-foreground")}>
              <I className="size-4" />
            </button>
          );
        })}
      </div>
      <div><input className={f} placeholder="Label (e.g. Mom's place)" aria-label="Address label" value={label} onChange={(e) => setLabel(e.target.value)} />{err(errs.label)}</div>
      <div><input className={f} placeholder="Flat, building, street, area" aria-label="Street address" value={line} onChange={(e) => setLine(e.target.value)} />{err(errs.line)}</div>
      <div><input className={f} inputMode="numeric" maxLength={6} placeholder="PIN code" aria-label="PIN code" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />{err(errs.pin)}</div>
      <input className={f} placeholder="Delivery note (optional)" aria-label="Delivery note" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="flex gap-2 pt-1">
        <button type="submit" className="flex-1 rounded-2xl bg-primary py-2.5 text-sm font-bold text-primary-foreground">Save address</button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-2xl border border-border px-4 text-sm font-semibold hover:bg-muted">Cancel</button>
      </div>
    </form>
  );
}
