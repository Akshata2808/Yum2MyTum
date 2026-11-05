import * as React from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Clock, MapPin, Minus, Plus, Search, Star, Timer } from "lucide-react";
import { toast } from "sonner";
import { bySlug, formatLabels, rupees, type MenuItem } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { FormatChip } from "@/components/kitchen-card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/kitchen/$slug")({
  loader: ({ params }) => {
    const kitchen = bySlug(params.slug);
    if (!kitchen) throw notFound();
    return { kitchen };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Kitchen not found — Yum2MyTum" }, { name: "robots", content: "noindex" }] };
    }
    const k = loaderData.kitchen;
    const title = `${k.name} — ${k.cuisines.join(", ")} delivery | Yum2MyTum`;
    const description = `${k.blurb} Order from ${k.name} in ${k.area}, delivered in about ${k.etaMins} minutes.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: KitchenPage,
});

function KitchenPage() {
  const { kitchen } = Route.useLoaderData();
  const { add, remove, qtyOf, count, total } = useCart();
  const [vegOnly, setVegOnly] = React.useState(false);
  const [q, setQ] = React.useState("");

  const filtered = kitchen.menu.filter(
    (mi) => (!vegOnly || mi.veg) && mi.name.toLowerCase().includes(q.trim().toLowerCase()),
  );
  const sections = [...new Set(filtered.map((mi) => mi.section))];

  const onAdd = (item: MenuItem) => {
    const { replaced } = add(kitchen.slug, item);
    toast.success(replaced ? `Cart restarted with ${item.name}` : `${item.name} added`, {
      description: replaced ? `Your cart now holds items from ${kitchen.name}.` : kitchen.name,
    });
  };

  return (
    <div className="pb-28 md:pb-0">
      <div className={cn("bg-gradient-to-br", kitchen.gradient)}>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <FormatChip format={kitchen.format} className="bg-card/80 backdrop-blur" />
            <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">{kitchen.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-foreground/75">{kitchen.blurb}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="flex items-center gap-1.5 font-semibold">
                <Star className="size-4 fill-current text-primary" />
                {kitchen.rating} <span className="font-normal text-muted-foreground">({kitchen.ratingCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" /> {kitchen.etaMins} min
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" /> {kitchen.area} · {kitchen.distanceKm} km
              </span>
              <span>{rupees(kitchen.costForTwo)} for two</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {kitchen.tags.map((t) => (
                <span key={t} className="rounded-full bg-card/70 px-3 py-1 text-xs font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card/85 p-5 shadow-card backdrop-blur">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {formatLabels[kitchen.format]}
            </p>
            {kitchen.promo && <p className="mt-2 font-display text-lg font-bold text-primary">{kitchen.promo}</p>}
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Timer className="size-4" /> Free delivery on orders above ₹499
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search in ${kitchen.name}`}
              aria-label="Search this menu"
              className="w-full rounded-2xl border border-border bg-card py-3 pr-4 pl-10 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => setVegOnly((v) => !v)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-semibold",
              vegOnly ? "border-veg bg-veg/10 text-veg" : "border-border bg-card text-muted-foreground",
            )}
          >
            Veg only
          </button>
        </div>

        {sections.map((section) => (
          <section key={section} className="mt-8">
            <h2 className="font-display text-xl font-extrabold">{section}</h2>
            <ul className="mt-3 divide-y divide-border rounded-3xl border border-border bg-card">
              {filtered
                .filter((mi) => mi.section === section)
                .map((item) => {
                  const qty = qtyOf(item.id);
                  return (
                    <li key={item.id} className="flex gap-4 p-4">
                      <div className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "inline-grid size-4 place-items-center rounded-[4px] border",
                            item.veg ? "border-veg" : "border-nonveg",
                          )}
                        >
                          <i className={cn("size-2 rounded-full", item.veg ? "bg-veg" : "bg-nonveg")} />
                        </span>
                        {item.bestseller && (
                          <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold tracking-wide text-accent-foreground uppercase">
                            Bestseller
                          </span>
                        )}
                        <h3 className="mt-1.5 font-semibold">{item.name}</h3>
                        <p className="text-sm font-medium">{rupees(item.price)}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex w-24 shrink-0 flex-col items-center gap-2">
                        <span
                          className={cn(
                            "block h-20 w-full overflow-hidden rounded-2xl bg-muted",
                          )}
                        >
                          <img src={item.image} alt={item.name} loading="lazy" className="size-full object-cover" />
                        </span>
                        {qty === 0 ? (
                          <button
                            onClick={() => onAdd(item)}
                            className="-mt-5 rounded-full border border-primary bg-card px-5 py-1.5 text-sm font-bold text-primary shadow-card"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="-mt-5 flex items-center gap-2 rounded-full border border-primary bg-card px-2 py-1 shadow-card">
                            <button aria-label="Remove one" onClick={() => remove(item.id)} className="p-1 text-primary">
                              <Minus className="size-3.5" />
                            </button>
                            <span className="text-sm font-bold text-primary">{qty}</span>
                            <button aria-label="Add one" onClick={() => onAdd(item)} className="p-1 text-primary">
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}

        {filtered.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground">No dishes match that search.</p>
        )}
      </div>

      {count > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 px-4 md:bottom-6">
          <Link
            to="/cart"
            className="mx-auto flex max-w-md items-center justify-between rounded-2xl bg-ink px-5 py-3.5 text-ink-foreground shadow-lift"
          >
            <span className="text-sm font-semibold">
              {count} item{count > 1 ? "s" : ""} · {rupees(total)}
            </span>
            <span className="text-sm font-bold text-primary">View cart →</span>
          </Link>
        </div>
      )}
    </div>
  );
}
