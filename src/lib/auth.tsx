import * as React from "react";
import { endSession, getSessionUser, type AuthUser } from "./auth-store";

type AuthCtx = { user: AuthUser | null; loading: boolean; refresh: () => void; signOut: () => Promise<void> };
const Ctx = React.createContext<AuthCtx>({ user: null, loading: true, refresh: () => {}, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(() => {
    setUser(getSessionUser());
    setLoading(false);
  }, []);

  React.useEffect(() => {
    refresh();
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const signOut = React.useCallback(async () => {
    endSession();
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, loading, refresh, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => React.useContext(Ctx);
