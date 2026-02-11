"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error ||
            (data.details?.email && data.details.email[0]) ||
            "Failed to sign up"
        );
        return;
      }
      router.push("/");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Create your workspace</h1>
      <p className="auth-subtitle">
        Join TaskFlow and start tracking your projects with clarity.
      </p>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="auth-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />
        </div>
        <div>
          <label className="auth-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="auth-button-primary w-full"
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>
      <p className="auth-link mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-sky-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}


