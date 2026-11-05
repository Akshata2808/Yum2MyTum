import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, Search, Sparkles, Star, Truck } from "lucide-react";
const heroSpread = "https://www.themealdb.com/images/media/meals/xrttsx1487339558.jpg";
import { KitchenCard } from "@/components/kitchen-card";
import { cuisineEmoji, cuisines, formatShort, kitchens, offers, type Format } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yum2MyTum — Food delivery from every kitchen near you" },
      {
        name: "description",
        content:
          "Order from neighbourhood restaurants, cloud kitchens and campus outlets straight to your tum. Live tracking, honest ETAs and daily offers.",
      },
      { property: "og:title", content: "Yum2MyTum — Food delivery from every kitchen near you" },
      {
        property: "og:description",
        content: "Restaurants, cloud kitchens and campus counters in one app. Search, order, track.",
      },
    ],
  }),
  component: Home,
});

const formatBlurbs: Record<Format, string> = {
  restaurant: "Dining rooms with delivery windows",
  cloud: "Delivery-only kitchens, built for speed",
  campus: "Canteens and hatches inside your campus",
};

function Home() {
  const [q, setQ] = React.useState("");
  const navigate = useNavigate();
  const topRated = [...kitchens].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const quickest = [...kitchens].sort((a, b) => a.etaMins - b.etaMins).slice(0, 3);

  return (
    <div className="pb-20 md:pb-0">
      {/* Hero */}
      <section className="grid-paper border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold">
              <Sparkles className="size-3.5 text-primary" /> Now serving Mumbai + Vidyalankar campus, Wadala
            </span>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] font-extrabold sm:text-6xl">
              Every Mumbai kitchen,
              <span className="text-primary"> straight to your tum.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Neighbourhood restaurants, delivery-only cloud kitchens and campus counters — searchable together, priced
              honestly, tracked to the doorstep.
            </p>

            <form
              className="mt-7 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/browse", search: { q, cuisine: "", format: "", sort: "relevance", veg: false } });
              }}
            >
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Biryani, cold brew, hostel combos…"
                  aria-label="Search food and kitchens"
                  className="w-full rounded-2xl border border-border bg-card py-4 pr-4 pl-11 text-sm shadow-card outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl bg-primary px-7 py-4 text-sm font-bold text-primary-foreground shadow-card"
              >
                Find food
              </button>
            </form>

            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4">
              {[
                { k: "18 min", v: "median delivery" },
                { k: "120+", v: "kitchens listed" },
                { k: "4.5★", v: "average rating" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="font-display text-2xl font-extrabold">{s.k}</dt>
                  <dd className="text-xs text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <img
              src={heroSpread}
              alt="Overhead spread of takeaway boxes with dosa, biryani, burgers, noodles and salads"
              width={1600}
              height={1200}
              className="w-full rounded-[2rem] border border-border object-cover shadow-lift"
            />
            <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-lift sm:left-8">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Truck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold">Order #MG204118</p>
                <p className="text-xs text-muted-foreground">Courier 4 minutes away</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cuisine rail */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-2xl font-extrabold">What are you craving?</h2>
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
          {cuisines.map((c) => (
            <Link
              key={c}
              to="/browse"
              search={{ q: "", cuisine: c, format: "", sort: "relevance", veg: false }}
              className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <span className="text-3xl">{cuisineEmoji[c]}</span>
              <span className="text-xs font-semibold leading-tight">{c}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Formats */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="font-display text-2xl font-extrabold">Pick your dining format</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {(Object.keys(formatShort) as Format[]).map((f, i) => (
            <Link
              key={f}
              to="/browse"
              search={{ q: "", cuisine: "", format: f, sort: "relevance", veg: false }}
              className={cn(
                "group rounded-3xl border border-border bg-gradient-to-br p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-lift",
                i === 0 && "from-primary/15 to-accent",
                i === 1 && "from-secondary/15 to-lime/20",
                i === 2 && "from-lime/25 to-accent",
              )}
            >
              <p className="font-display text-xl font-extrabold">{formatShort[f]}</p>
              <p className="mt-1 text-sm text-foreground/70">{formatBlurbs[f]}</p>
              <p className="mt-6 flex items-center gap-1 text-sm font-bold text-primary">
                Explore <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Offer strip */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-extrabold">Deals on today</h2>
          <Link to="/offers" className="text-sm font-semibold text-primary">
            All offers →
          </Link>
        </div>
        <div className="no-scrollbar mt-4 flex gap-4 overflow-x-auto pb-2">
          {offers.map((o) => (
            <Link
              key={o.code}
              to="/offers"
              className={cn(
                "w-72 shrink-0 rounded-3xl border border-border bg-gradient-to-br p-5 shadow-card transition-transform hover:-translate-y-1",
                o.tint,
              )}
            >
              <p className="font-display text-lg font-extrabold">{o.title}</p>
              <p className="mt-1 text-sm text-foreground/70">{o.detail}</p>
              <p className="mt-4 text-xs font-bold tracking-widest">CODE · {o.code}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Fastest near you */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold">
          <Clock className="size-5 text-primary" /> Fastest near you
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {quickest.map((k) => (
            <Link
              key={k.slug}
              to="/kitchen/$slug"
              params={{ slug: k.slug }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card hover:-translate-y-0.5 hover:shadow-lift"
            >
              <img src={k.cover} alt={k.name} loading="lazy" className="size-12 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{k.name}</p>
                <p className="text-xs text-muted-foreground">
                  {k.etaMins} min · {k.cuisines[0]}
                </p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-xs font-bold">
                <Star className="size-3 fill-current text-primary" />
                {k.rating}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top rated grid */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-extrabold">Loved in your area</h2>
          <Link to="/browse" className="text-sm font-semibold text-primary">
            See all →
          </Link>
        </div>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topRated.map((k) => (
            <KitchenCard key={k.slug} kitchen={k} />
          ))}
        </div>
      </section>
    </div>
  );
}
