"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/types";

interface Props {
  children: React.ReactNode;
}

export default function AppShell({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null);
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
      }
    };
    load();
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  return (
    <div className="min-h-screen">
      {user && (
        <header className="flex items-center justify-between px-6 py-4 bg-white/0">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-semibold text-white"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-white text-teal-600 font-bold">
              T
            </span>
            <span>TaskFlow</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/activity" className="text-white/90 hover:text-white text-sm">
              Activity
            </Link>
            <button
              onClick={handleSignOut}
              className="text-white hover:underline text-sm"
            >
              Sign out &gt;
            </button>
          </div>
        </header>
      )}

      <main className="pb-10">
        {children}
      </main>
    </div>
  );
}

