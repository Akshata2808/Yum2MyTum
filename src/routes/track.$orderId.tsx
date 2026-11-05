import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MapPin, Phone, Star } from "lucide-react";
import { loadOrders, stageFor, stages, type PlacedOrder } from "@/lib/orders";
import { bySlug, rupees, savedAddresses } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { DeliveryMap } from "@/components/delivery-map";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track/$orderId")({
  head: ({ params }) => ({
    meta: [
      { title: `Tracking order #${params.orderId} — Yum2MyTum` },
      { name: "description", content: "Live status, courier details and delivery estimate for your Yum2MyTum order." },
      { property: "og:title", content: "Live order tracking — Yum2MyTum" },
      { property: "og:description", content: "Follow your food from the kitchen to your door." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { addresses } = useCart();
  const { orderId } = Route.useParams();
  const [order, setOrder] = React.useState<PlacedOrder | null | undefined>(undefined);
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    setOrder(loadOrders().find((o) => o.id === orderId) ?? null);
  }, [orderId]);

  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (order === undefined) {
    return <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">Loading order…</div>;
  }

  if (order === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold">We can't find order #{orderId}</h1>
        <p className="mt-2 text-muted-foreground">It may have been placed on another device.</p>
        <Link to="/track" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          See all orders
        </Link>
      </div>
    );
  }

  const current = stageFor(order, now);
  const delivered = current >= stages.length - 1;
  const kitchen = bySlug(order.kitchenSlug);
  const addr =
    addresses.find((a) => a.id === order.addressId) ??
    savedAddresses.find((a) => a.label === order.addressLabel) ??
    savedAddresses[0]!;
  const step = Math.max(order.etaMins, 5) / 5;
  const elapsed = (now - order.placedAt) / 60000;
  const rideProgress = Math.min(1, Math.max(0, (elapsed - 3 * step) / step));
  const minsLeft = Math.max(0, Math.round(order.etaMins - (now - order.placedAt) / 60000));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-28 md:pb-8">
      <p className="text-sm text-muted-foreground">Order #{order.id}</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">
        {delivered ? "Delivered. Enjoy!" : `Arriving in about ${minsLeft} min`}
      </h1>
      <p className="mt-1 text-muted-foreground">
        From {order.kitchenName} to {order.addressLabel}
      </p>

      <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        {kitchen ? (
          <div className="relative">
            <DeliveryMap
              from={[kitchen.lat, kitchen.lng]}
              to={[addr.lat, addr.lng]}
              progress={rideProgress}
              fromLabel={kitchen.name}
              toLabel={`${addr.label} · ${addr.line}`}
            />
            <div className="pointer-events-none absolute top-3 right-3 z-[500] rounded-full bg-card/95 px-3 py-1.5 text-xs font-semibold shadow-card">
              {current < 3 ? "Rider waiting at the kitchen" : delivered ? "Delivered" : `Live · ${Math.round(rideProgress * 100)}% of the way`}
            </div>
          </div>
        ) : (
        <div className="grid-paper relative h-40 bg-muted">
          <div
            className="absolute top-1/2 h-1 rounded-full bg-primary transition-all duration-700"
            style={{ left: "8%", width: `${8 + (current / (stages.length - 1)) * 74}%` }}
          />
          <span
            className="absolute top-1/2 -mt-5 -ml-4 text-2xl transition-all duration-700"
            style={{ left: `${8 + (current / (stages.length - 1)) * 74}%` }}
          >
            🛵
          </span>
          <span className="absolute top-1/2 right-[6%] -mt-3 text-xl">🏠</span>
          <span className="absolute top-1/2 left-[4%] -mt-3 text-xl">🍳</span>
        </div>
        )}

        <ol className="divide-y divide-border">
          {stages.map((s, i) => (
            <li key={s.key} className="flex items-start gap-3 p-4">
              <span
                className={cn(
                  "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border",
                  i <= current ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent",
                )}
              >
                <Check className="size-3.5" />
              </span>
              <div>
                <p className={cn("font-semibold", i > current && "text-muted-foreground")}>{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 flex items-center gap-4 rounded-3xl border border-border bg-card p-5">
        <span className="grid size-12 place-items-center rounded-full bg-accent text-xl">🧑‍🚀</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{order.courier.name}</p>
          <p className="truncate text-sm text-muted-foreground">{order.courier.vehicle}</p>
        </div>
        <span className="flex items-center gap-1 text-sm font-semibold">
          <Star className="size-3.5 fill-current text-primary" />
          {order.courier.rating}
        </span>
        <button
          className="grid size-10 place-items-center rounded-full bg-ink text-ink-foreground"
          aria-label="Call courier"
        >
          <Phone className="size-4" />
        </button>
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">Order summary</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.name} className="flex justify-between">
              <span className="text-muted-foreground">
                {i.emoji} {i.qty} × {i.name}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-4 font-semibold">
          <span>Paid via {order.payment}</span>
          <span>{rupees(order.total)}</span>
        </div>
        <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" /> {order.addressLine}
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          to="/kitchen/$slug"
          params={{ slug: order.kitchenSlug }}
          className="flex-1 rounded-2xl bg-primary py-3 text-center text-sm font-bold text-primary-foreground"
        >
          Order again
        </Link>
        <Link to="/track" className="flex-1 rounded-2xl border border-border py-3 text-center text-sm font-semibold">
          All orders
        </Link>
      </div>
    </div>
  );
}
