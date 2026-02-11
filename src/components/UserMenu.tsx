"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/types";

export default function UserMenu() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  if (loading) {
    return <div className="text-sm text-muted">...</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
        <Link
          href="/register"
          className="px-3 py-1 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="h-8 w-8 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-xs font-semibold text-sky-300">
        {user.email?.[0]?.toUpperCase() ?? "U"}
      </div>
      <button
        onClick={handleSignOut}
        className="px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}


