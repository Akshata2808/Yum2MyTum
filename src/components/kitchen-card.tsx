import { Link } from "@tanstack/react-router";
import { Clock, Star, MapPin } from "lucide-react";
import { formatLabels, rupees, type Kitchen } from "@/lib/data";
import { cn } from "@/lib/utils";

export function FormatChip({ format, className }: { format: Kitchen["format"]; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase",
        format === "restaurant" && "border-primary/30 bg-primary/10 text-primary",
        format === "cloud" && "border-secondary/30 bg-secondary/10 text-secondary",
        format === "campus" && "border-lime/50 bg-lime/25 text-lime-foreground",
        className,
      )}
    >
      {formatLabels[format]}
    </span>
  );
}

export function KitchenCard({ kitchen }: { kitchen: Kitchen }) {
  return (
    <Link
      to="/kitchen/$slug"
      params={{ slug: kitchen.slug }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-lift"
    >
      <div className={cn("relative grid h-40 place-items-center overflow-hidden bg-gradient-to-br", kitchen.gradient)}>
        <img src={kitchen.cover} alt={kitchen.name} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute top-3 left-3">
          <FormatChip format={kitchen.format} className="bg-card/85 backdrop-blur" />
        </div>
        {kitchen.promo && (
          <div className="absolute right-0 bottom-3 left-3 truncate rounded-full bg-ink/85 px-3 py-1.5 text-xs font-semibold text-ink-foreground">
            {kitchen.promo}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base leading-tight font-bold">{kitchen.name}</h3>
          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground">
            <Star className="size-3 fill-current" />
            {kitchen.rating}
          </span>
        </div>
        <p className="truncate text-sm text-muted-foreground">{kitchen.cuisines.join(" · ")}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" /> {kitchen.etaMins} min
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {kitchen.area} · {kitchen.distanceKm} km
          </span>
          <span className="ml-auto font-medium text-foreground">{rupees(kitchen.costForTwo)} for two</span>
        </div>
      </div>
    </Link>
  );
}
