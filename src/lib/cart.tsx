import * as React from "react";
import { bySlug, offers, savedAddresses, type Address, type MenuItem } from "./data";

export type CartLine = { itemId: string; qty: number };

export type CartState = {
  kitchenSlug: string | null;
  lines: CartLine[];
  addressId: string;
  promoCode: string | null;
  tipAmount: number;
  customAddresses: Address[];
};

const EMPTY: CartState = {
  kitchenSlug: null,
  lines: [],
  addressId: savedAddresses[0]!.id,
  promoCode: null,
  tipAmount: 0,
  customAddresses: [],
};

const STORAGE_KEY = "yum2mytum.cart.v1";

type Ctx = {
  state: CartState;
  kitchen: ReturnType<typeof bySlug>;
  items: { item: MenuItem; qty: number }[];
  count: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  address: Address;
  addresses: Address[];
  addAddress: (a: Omit<Address, "id" | "lat" | "lng">) => Address;
  removeAddress: (id: string) => void;
  add: (slug: string, item: MenuItem) => { replaced: boolean };
  remove: (itemId: string) => void;
  qtyOf: (itemId: string) => number;
  clear: () => void;
  setAddress: (id: string) => void;
  applyPromo: (code: string | null) => boolean;
  setTip: (n: number) => void;
};

const CartContext = React.createContext<Ctx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CartState>(EMPTY);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...(JSON.parse(raw) as CartState) });
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const kitchen = state.kitchenSlug ? bySlug(state.kitchenSlug) : undefined;

  const items = React.useMemo(() => {
    if (!kitchen) return [];
    return state.lines
      .map((l) => {
        const item = kitchen.menu.find((mi) => mi.id === l.itemId);
        return item ? { item, qty: l.qty } : null;
      })
      .filter(Boolean) as { item: MenuItem; qty: number }[];
  }, [kitchen, state.lines]);

  const count = items.reduce((s, l) => s + l.qty, 0);
  const subtotal = items.reduce((s, l) => s + l.qty * l.item.price, 0);

  const offer = offers.find((o) => o.code === state.promoCode);
  const discount =
    offer && subtotal >= offer.minOrder
      ? Math.min(Math.round((subtotal * offer.discountPct) / 100), offer.maxDiscount)
      : 0;

  const deliveryFee = count === 0 ? 0 : subtotal >= 499 ? 0 : kitchen?.format === "campus" ? 15 : 39;
  const taxes = count === 0 ? 0 : Math.round((subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount) + deliveryFee + taxes + state.tipAmount;

  const addresses = [...savedAddresses, ...(state.customAddresses ?? [])];
  const address = addresses.find((a) => a.id === state.addressId) ?? savedAddresses[0]!;

  const value: Ctx = {
    state,
    kitchen,
    items,
    count,
    subtotal,
    discount,
    deliveryFee,
    taxes,
    total,
    address,
    addresses,
    addAddress: (a) => {
      // New addresses get a point near central Mumbai so the live map still works.
      const created: Address = { ...a, id: `addr-${Date.now()}`, lat: 19.05 + (Math.random() - 0.5) * 0.04, lng: 72.86 + (Math.random() - 0.5) * 0.04 };
      setState((prev) => ({ ...prev, customAddresses: [...(prev.customAddresses ?? []), created], addressId: created.id }));
      return created;
    },
    removeAddress: (id) =>
      setState((prev) => ({
        ...prev,
        customAddresses: (prev.customAddresses ?? []).filter((x) => x.id !== id),
        addressId: prev.addressId === id ? savedAddresses[0]!.id : prev.addressId,
      })),
    qtyOf: (itemId) => state.lines.find((l) => l.itemId === itemId)?.qty ?? 0,
    add: (slug, item) => {
      let replaced = false;
      setState((prev) => {
        if (prev.kitchenSlug && prev.kitchenSlug !== slug && prev.lines.length > 0) {
          replaced = true;
          return { ...prev, kitchenSlug: slug, lines: [{ itemId: item.id, qty: 1 }] };
        }
        const existing = prev.lines.find((l) => l.itemId === item.id);
        return {
          ...prev,
          kitchenSlug: slug,
          lines: existing
            ? prev.lines.map((l) => (l.itemId === item.id ? { ...l, qty: l.qty + 1 } : l))
            : [...prev.lines, { itemId: item.id, qty: 1 }],
        };
      });
      return { replaced };
    },
    remove: (itemId) =>
      setState((prev) => {
        const lines = prev.lines
          .map((l) => (l.itemId === itemId ? { ...l, qty: l.qty - 1 } : l))
          .filter((l) => l.qty > 0);
        return { ...prev, lines, kitchenSlug: lines.length ? prev.kitchenSlug : null };
      }),
    clear: () => setState((prev) => ({ ...EMPTY, addressId: prev.addressId, customAddresses: prev.customAddresses })),
    setAddress: (id) => setState((prev) => ({ ...prev, addressId: id })),
    applyPromo: (code) => {
      const found = offers.find((o) => o.code === code);
      if (code && !found) return false;
      setState((prev) => ({ ...prev, promoCode: code }));
      return true;
    },
    setTip: (n) => setState((prev) => ({ ...prev, tipAmount: n })),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
