import * as React from "react";
import type { Map as LMap, Marker, Polyline } from "leaflet";

type LatLng = [number, number];

/** Interpolate a point along a polyline at fraction t (0..1) of its length. */
function pointAlong(path: LatLng[], t: number): LatLng {
  if (path.length < 2) return path[0]!;
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const d = Math.hypot(path[i]![0] - path[i - 1]![0], path[i]![1] - path[i - 1]![1]);
    seg.push(d);
    total += d;
  }
  let target = Math.min(1, Math.max(0, t)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i]!) {
      const f = seg[i]! === 0 ? 0 : target / seg[i]!;
      const a = path[i]!;
      const b = path[i + 1]!;
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    }
    target -= seg[i]!;
  }
  return path[path.length - 1]!;
}

const emojiIcon = (L: typeof import("leaflet"), emoji: string, ring: string) =>
  L.divIcon({
    className: "",
    html: `<div style="display:grid;place-items:center;width:40px;height:40px;border-radius:9999px;background:white;border:3px solid ${ring};font-size:22px;box-shadow:0 4px 12px rgba(0,0,0,.25)">${emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

export function DeliveryMap({
  from,
  to,
  progress,
  fromLabel,
  toLabel,
}: {
  from: LatLng;
  to: LatLng;
  /** 0 = courier at kitchen, 1 = at your door */
  progress: number;
  fromLabel: string;
  toLabel: string;
}) {
  const el = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<LMap | null>(null);
  const riderRef = React.useRef<Marker | null>(null);
  const doneRef = React.useRef<Polyline | null>(null);
  const LRef = React.useRef<typeof import("leaflet") | null>(null);
  const [route, setRoute] = React.useState<LatLng[]>([from, to]);

  // Real road route through Mumbai streets (falls back to a straight line).
  React.useEffect(() => {
    let alive = true;
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`,
    )
      .then((r) => r.json())
      .then((j) => {
        const coords: [number, number][] | undefined = j?.routes?.[0]?.geometry?.coordinates;
        if (alive && coords?.length) setRoute(coords.map(([lng, lat]) => [lat, lng]));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [from[0], from[1], to[0], to[1]]);

  // Build map once route is known.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current) return;
      LRef.current = L;
      mapRef.current?.remove();
      const map = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false });
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);
      L.polyline(route, { color: "#9ca3af", weight: 6, opacity: 0.7, dashArray: "8 8" }).addTo(map);
      doneRef.current = L.polyline([route[0]!], { color: "#e2572b", weight: 6 }).addTo(map);
      L.marker(from, { icon: emojiIcon(L, "🍳", "#e2572b") }).addTo(map).bindTooltip(fromLabel);
      L.marker(to, { icon: emojiIcon(L, "🏠", "#1f2937") }).addTo(map).bindTooltip(toLabel);
      riderRef.current = L.marker(pointAlong(route, progress), {
        icon: emojiIcon(L, "🛵", "#16a34a"),
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindTooltip("Your delivery partner");
      map.fitBounds(L.latLngBounds(route), { padding: [40, 40] });
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  React.useEffect(() => () => void mapRef.current?.remove(), []);

  // Move rider as progress changes.
  React.useEffect(() => {
    const pos = pointAlong(route, progress);
    riderRef.current?.setLatLng(pos);
    if (doneRef.current) {
      const pts: LatLng[] = [];
      const n = 60;
      for (let i = 0; i <= n; i++) pts.push(pointAlong(route, (progress * i) / n));
      doneRef.current.setLatLngs(pts);
    }
  }, [progress, route]);

  return <div ref={el} className="h-72 w-full sm:h-96" aria-label="Live delivery map" />;
}
