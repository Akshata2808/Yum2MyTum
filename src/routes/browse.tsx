import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { KitchenCard } from "@/components/kitchen-card";
import { cuisineEmoji, cuisines, formatShort, kitchens, type Format } from "@/lib/data";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  q: z.string().catch("").default(""),
  cuisine: z.string().catch("").default(""),
  format: z.string().catch("").default(""),
  sort: z.string().catch("relevance").default("relevance"),
  veg: z.boolean().catch(false).default(false),
});

export const Route = createFileRoute("/browse")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Discover kitchens near you — Yum2MyTum" },
      {
        name: "description",
        content:
          "Search restaurants, cloud kitchens and campus outlets by cuisine, format, rating and delivery time on Yum2MyTum.",
      },
      { property: "og:title", content: "Discover kitchens near you — Yum2MyTum" },
      {
        property: "og:description",
        content: "Filter by cuisine and dining format to find your next meal in minutes.",
      },
    ],
  }),
  component: BrowsePage,
});

const sorts = [
  { id: "relevance", label: "Relevance" },
  { id: "rating", label: "Top rated" },
  { id: "eta", label: "Fastest" },
  { id: "cost-low", label: "Cost: low to high" },
];

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/browse" });
  const set = (patch: Partial<typeof search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const query = search.q.trim().toLowerCase();
  let results = kitchens.filter((k) => {
    if (search.format && k.format !== (search.format as Format)) return false;
    if (search.cuisine && !k.cuisines.includes(search.cuisine)) return false;
    if (search.veg && !k.menu.some((mi) => mi.veg)) return false;
    if (!query) return true;
    return (
      k.name.toLowerCase().includes(query) ||
      k.area.toLowerCase().includes(query) ||
      k.cuisines.some((c) => c.toLowerCase().includes(query)) ||
      k.menu.some((mi) => mi.name.toLowerCase().includes(query))
    );
  });

  results = [...results].sort((a, b) => {
    if (search.sort === "rating") return b.rating - a.rating;
    if (search.sort === "eta") return a.etaMins - b.etaMins;
    if (search.sort === "cost-low") return a.costForTwo - b.costForTwo;
    return 0;
  });

  const activeFilters = [
    search.cuisine && { key: "cuisine", label: search.cuisine },
    search.format && { key: "format", label: formatShort[search.format as Format] },
    search.veg && { key: "veg", label: "Pure veg available" },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Discover kitchens</h1>
      <p className="mt-2 text-muted-foreground">
        {results.length} places delivering to your area right now.
      </p>

      <div className="relative mt-6">
        <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Try 'biryani', 'campus', 'burnt cheesecake'"
          aria-label="Search kitchens and dishes"
          className="w-full rounded-2xl border border-border bg-card py-3.5 pr-4 pl-11 text-sm shadow-card outline-none focus:border-primary"
        />
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        <FilterPill active={!search.format} onClick={() => set({ format: "" })}>
          All formats
        </FilterPill>
        {(Object.keys(formatShort) as Format[]).map((f) => (
          <FilterPill key={f} active={search.format === f} onClick={() => set({ format: f })}>
            {formatShort[f]}
          </FilterPill>
        ))}
        <span className="mx-1 w-px shrink-0 bg-border" />
        <FilterPill active={search.veg} onClick={() => set({ veg: !search.veg })}>
          🟢 Veg friendly
        </FilterPill>
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {cuisines.map((c) => (
          <FilterPill
            key={c}
            active={search.cuisine === c}
            onClick={() => set({ cuisine: search.cuisine === c ? "" : c })}
          >
            <span className="mr-1">{cuisineEmoji[c]}</span>
            {c}
          </FilterPill>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <SlidersHorizontal className="size-4" /> Sort
        </span>
        {sorts.map((s) => (
          <button
            key={s.id}
            onClick={() => set({ sort: s.id })}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              search.sort === s.id
                ? "bg-ink text-ink-foreground"
                : "border border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {s.label}
          </button>
        ))}
        {activeFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => set({ [f.key]: f.key === "veg" ? false : "" } as Partial<typeof search>)}
            className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
          >
            {f.label} <X className="size-3" />
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border p-12 text-center">
          <p className="text-4xl">🍽️</p>
          <h2 className="mt-3 font-display text-xl font-bold">Nothing matches that yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing a filter or searching for a broader cuisine.
          </p>
          <button
            onClick={() => navigate({ search: { q: "", cuisine: "", format: "", sort: "relevance", veg: false } })}
            className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((k) => (
            <KitchenCard key={k.slug} kitchen={k} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
