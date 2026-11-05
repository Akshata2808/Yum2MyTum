import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-yum.png";

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2">
      <img
        src={logo}
        alt="Yum2MyTum logo"
        width={44}
        height={44}
        className="size-11 transition-transform group-hover:-rotate-6"
      />
      {!compact && (
        <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
          Yum<span className="text-primary">2</span>MyTum
        </span>
      )}
    </Link>
  );
}
