export type PlacedOrder = {
  id: string;
  kitchenSlug: string;
  kitchenName: string;
  placedAt: number;
  etaMins: number;
  total: number;
  items: { name: string; qty: number; emoji: string }[];
  addressId?: string;
  addressLabel: string;
  addressLine: string;
  payment: string;
  courier: { name: string; vehicle: string; rating: number };
};

const KEY = "yum2mytum.orders.v1";

const couriers = [
  { name: "Rehan Shaikh", vehicle: "Electric scooter · MH 01 EK 8842", rating: 4.9 },
  { name: "Divya Patil", vehicle: "Activa · MH 03 DZ 4410", rating: 4.8 },
  { name: "Sourav More", vehicle: "Scooter · MH 02 CB 1177", rating: 4.7 },
];

export function pickCourier() {
  return couriers[Math.floor(Math.random() * couriers.length)]!;
}

export function loadOrders(): PlacedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as PlacedOrder[];
  } catch {
    return [];
  }
}

export function saveOrder(order: PlacedOrder) {
  const all = [order, ...loadOrders()].slice(0, 10);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export const stages = [
  { key: "confirmed", title: "Order confirmed", copy: "The kitchen accepted your order." },
  { key: "cooking", title: "In the kitchen", copy: "Your dishes are being cooked to order." },
  { key: "packed", title: "Packed & sealed", copy: "Tamper-proof bag sealed and labelled." },
  { key: "pickup", title: "Courier on the way", copy: "Your courier picked up the order." },
  { key: "delivered", title: "Delivered", copy: "Enjoy your meal." },
] as const;

/** Stage index derived from how long ago the order was placed. */
export function stageFor(order: PlacedOrder, now: number) {
  const mins = (now - order.placedAt) / 60000;
  const step = Math.max(order.etaMins, 5) / 5;
  return Math.min(stages.length - 1, Math.floor(mins / step));
}
