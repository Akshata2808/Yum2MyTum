import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { kitchens, offers, rupees } from "@/lib/data";
import { FormatChip } from "@/components/kitchen-card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & promo codes — Yum2MyTum" },
      {
        name: "description",
        content:
          "Live Yum2MyTum promo codes: first-order discounts, campus hour deals, cloud kitchen savings and after-dark offers.",
      },
      { property: "og:title", content: "Offers & promo codes — Yum2MyTum" },
      { property: "og:description", content: "Stack a code at checkout and save on every dining format." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const promoted = kitchens.filter((k) => k.promo).slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles className="size-4" /> Deals refreshed this morning
      </div>
      <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">Offers worth ordering for</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Copy a code, then apply it in the cart. One code per order — we always apply the best available saving.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {offers.map((o) => (
          <div
            key={o.code}
            className={cn(
              "relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br p-6 shadow-card",
              o.tint,
            )}
          >
            <h2 className="font-display text-xl font-extrabold">{o.title}</h2>
            <p className="mt-2 text-sm text-foreground/75">{o.detail}</p>
            <p className="mt-4 text-xs text-muted-foreground">Minimum order {rupees(o.minOrder)}</p>
            <div className="mt-4 flex items-center gap-3">
              <code className="rounded-xl border border-dashed border-foreground/30 bg-card/70 px-3 py-2 text-sm font-bold tracking-widest">
                {o.code}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(o.code);
                  toast.success(`${o.code} copied`, { description: "Apply it in your cart to save." });
                }}
                className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground"
              >
                <Copy className="size-3.5" /> Copy code
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-display text-2xl font-extrabold">Kitchens running their own deals</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {promoted.map((k) => (
          <Link
            key={k.slug}
            to="/kitchen/$slug"
            params={{ slug: k.slug }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className={cn("grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-2xl", k.gradient)}>
              {k.emoji}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{k.name}</p>
              <p className="truncate text-xs text-primary">{k.promo}</p>
              <div className="mt-1">
                <FormatChip format={k.format} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
