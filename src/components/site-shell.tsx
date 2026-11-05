import * as React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Compass, Home, LogIn, LogOut, MapPin, Search, ShoppingBag, Tag, Truck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Wordmark } from "./brand";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/browse", label: "Discover", icon: Compass },
  { to: "/offers", label: "Offers", icon: Tag },
  { to: "/track", label: "Track", icon: Truck },
] as const;

export function SiteHeader() {
  const { count, address, addresses, setAddress } = useCart();
  const [openAddr, setOpenAddr] = React.useState(false);
  const [q, setQ] = React.useState("");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Wordmark />

        <div className="relative hidden sm:block">
          <button
            onClick={() => setOpenAddr((v) => !v)}
            className="flex max-w-[220px] items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-left text-xs hover:bg-muted"
          >
            <span className="font-bold text-primary">{address.label}</span>
            <span className="truncate text-muted-foreground">{address.line}</span>
            <ChevronDown className="size-3.5 shrink-0" />
          </button>
          {openAddr && (
            <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl border border-border bg-popover p-2 shadow-lift">
              {addresses.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setAddress(a.id);
                    setOpenAddr(false);
                  }}
                  className={cn(
                    "w-full rounded-xl px-3 py-2 text-left hover:bg-muted",
                    a.id === address.id && "bg-muted",
                  )}
                >
                  <p className="text-sm font-semibold">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.line}</p>
                </button>
              ))}
              <Link
                to="/checkout"
                onClick={() => setOpenAddr(false)}
                className="mt-1 block rounded-xl px-3 py-2 text-sm font-semibold text-primary hover:bg-muted"
              >
                Manage addresses
              </Link>
            </div>
          )}
        </div>

        <form
          className="relative ml-auto hidden max-w-xs flex-1 md:block"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/browse", search: (prev) => ({ ...prev, q, page: 1 }) });
          }}
        >
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search dishes or kitchens"
            aria-label="Search dishes or kitchens"
            className="w-full rounded-full border border-border bg-card py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
          />
        </form>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {user ? (
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/", replace: true });
            }}
            title={user.email ?? "Account"}
            className="ml-auto flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium hover:bg-muted md:ml-0"
          >
            <LogOut className="size-4" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        ) : (
          <Link
            to="/auth"
            className="ml-auto flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-semibold hover:bg-muted md:ml-0"
          >
            <LogIn className="size-4" /> <span className="hidden sm:inline">Log in</span>
          </Link>
        )}

        <Link
          to="/cart"
          className="relative flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-ink-foreground md:ml-0"
        >
          <ShoppingBag className="size-4" />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] text-primary-foreground">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { count } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tabs = [
    { to: "/", label: "Home", icon: Home },
    { to: "/browse", label: "Discover", icon: Search },
    { to: "/offers", label: "Offers", icon: Tag },
    { to: "/track", label: "Orders", icon: Truck },
    { to: "/cart", label: "Cart", icon: ShoppingBag },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md">
        {tabs.map((t) => {
          const active = t.to === "/" ? pathname === "/" : pathname.startsWith(t.to);
          return (
            <li key={t.to} className="flex-1">
              <Link
                to={t.to}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <t.icon className="size-5" />
                {t.label}
                {t.to === "/cart" && count > 0 && (
                  <span className="absolute top-1.5 right-1/2 mr-2 grid size-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const footerLinkClass =
  "text-sm text-ink-foreground/65 transition-colors duration-200 hover:text-primary";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-border bg-ink pb-24 text-ink-foreground md:pb-0">
      {/* subtle top glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pt-14 pb-10 sm:grid-cols-2 lg:grid-cols-5">
        {/* Brand + developer credit */}
        <div className="sm:col-span-2 lg:col-span-2">
          <p className="font-display text-2xl font-extrabold tracking-tight">
            Yum<span className="text-primary">2</span>MyTum
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-foreground/65">
            Mumbai restaurants, cloud kitchens and the Vidyalankar campus canteen — straight to your tum.
          </p>

          <div className="mt-6 rounded-2xl border border-ink-foreground/10 bg-ink-foreground/5 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-ink-foreground/45 uppercase">
              Developed by
            </p>
            <p className="mt-1.5 font-display text-base font-bold">Akshata Ghadigaonkar</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-foreground/60">
              <MapPin className="size-3.5 text-primary" />
              Mumbai, Maharashtra, India
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <a
                href="https://www.linkedin.com/in/akshata-ghadigaonkar-378513283"
                target="_blank"
                rel="noreferrer"
                aria-label="Akshata Ghadigaonkar on LinkedIn"
                className="grid size-9 place-items-center rounded-full border border-ink-foreground/15 text-ink-foreground/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <LinkedinIcon className="size-4" />
              </a>
              <a
                href="https://github.com/Akshata2808"
                target="_blank"
                rel="noreferrer"
                aria-label="Akshata2808 on GitHub"
                className="grid size-9 place-items-center rounded-full border border-ink-foreground/15 text-ink-foreground/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <GithubIcon className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-bold tracking-[0.18em] text-ink-foreground/45 uppercase">
            Explore
          </h4>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to="/browse" className={footerLinkClass}>
                All kitchens
              </Link>
            </li>
            <li>
              <Link to="/offers" className={footerLinkClass}>
                Offers
              </Link>
            </li>
            <li>
              <Link to="/track" className={footerLinkClass}>
                Track an order
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-bold tracking-[0.18em] text-ink-foreground/45 uppercase">
            For partners
          </h4>
          <ul className="mt-4 space-y-2.5">
            <li>
              <span className={footerLinkClass}>List your restaurant</span>
            </li>
            <li>
              <span className={footerLinkClass}>Open a cloud kitchen</span>
            </li>
            <li>
              <span className={footerLinkClass}>Campus partnerships</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-bold tracking-[0.18em] text-ink-foreground/45 uppercase">
            Support
          </h4>
          <ul className="mt-4 space-y-2.5">
            <li>
              <span className={footerLinkClass}>Help centre</span>
            </li>
            <li>
              <span className={footerLinkClass}>Delivery areas</span>
            </li>
            <li>
              <span className={footerLinkClass}>Refund policy</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-ink-foreground/10 px-6 py-5">
        <p className="mx-auto max-w-6xl text-center text-xs leading-relaxed text-ink-foreground/50">
          © 2026 Yum2MyTum. All rights reserved.{" "}
          <span className="text-ink-foreground/30">|</span> Designed &amp; Developed by{" "}
          <span className="font-semibold text-ink-foreground/75">Akshata Ghadigaonkar</span>
        </p>
      </div>
    </footer>
  );
}
