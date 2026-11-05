import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { loadOrders, stageFor, stages, type PlacedOrder } from "@/lib/orders";
import { rupees } from "@/lib/data";

export const Route = createFileRoute("/track/")({
  head: () => ({
    meta: [
      { title: "Your orders — Yum2MyTum" },
      { name: "description", content: "See live status for your Yum2MyTum deliveries and revisit past orders." },
      { property: "og:title", content: "Your orders — Yum2MyTum" },
      { property: "og:description", content: "Live tracking for every order you place on Yum2MyTum." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = React.useState<PlacedOrder[]>([]);
  React.useEffect(() => setOrders(loadOrders()), []);
  const now = Date.now();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-28 md:pb-8">
      <h1 className="font-display text-3xl font-extrabold">Your orders</h1>
      {orders.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border p-12 text-center">
          <p className="text-4xl">🛵</p>
          <h2 className="mt-3 font-display text-xl font-bold">No orders yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Place your first order and follow it here, minute by minute.</p>
          <Link
            to="/browse"
            className="mt-5 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Find something to eat
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => {
            const stage = stages[stageFor(o, now)]!;
            return (
              <li key={o.id}>
                <Link
                  to="/track/$orderId"
                  params={{ orderId: o.id }}
                  className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-card hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-muted text-2xl">
                    {o.items[0]?.emoji ?? "🍽️"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{o.kitchenName}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      #{o.id} · {o.items.reduce((s, i) => s + i.qty, 0)} items · {rupees(o.total)}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-primary">{stage.title}</p>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
