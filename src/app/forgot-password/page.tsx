"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start reset");
        return;
      }
      setSuccess(
        "If an account exists, a reset link has been generated. For this demo, copy the token from the response or console and open the reset page."
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Forgot password</h1>
      <p className="auth-subtitle">
        Enter the email you use for TaskFlow. We&apos;ll help you get back in.
      </p>
      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}
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
        <button
          type="submit"
          disabled={loading}
          className="auth-button-primary w-full"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <Link
        href="/login"
        className="auth-link mt-4 block text-center"
      >
        Back to login
      </Link>
    </div>
  );
}


