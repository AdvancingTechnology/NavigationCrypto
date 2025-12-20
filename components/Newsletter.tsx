"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

interface NewsletterProps {
  variant?: "default" | "compact";
  showName?: boolean;
}

export default function Newsletter({ variant = "default", showName = false }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("newsletter_subscribers") as any)
        .insert([
          {
            email: email.toLowerCase().trim(),
            name: name.trim() || null,
            source: "website",
          },
        ])
        .select();

      if (error) {
        if (error.code === "23505") {
          setStatus("error");
          setMessage("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        setStatus("success");
        setMessage("Thanks for subscribing! Check your inbox for updates.");
        setEmail("");
        setName("");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "..." : "Subscribe"}
          </button>
        </form>
        {status !== "idle" && (
          <p
            className={`mt-2 text-sm ${
              status === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-gray-900 rounded-2xl p-8 border border-gray-800">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          Stay Updated
        </h3>
        <p className="text-gray-400">
          Get the latest trading signals, market insights, and exclusive content delivered to your inbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {showName && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
              Name (optional)
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Subscribing..." : "Subscribe to Newsletter"}
        </button>
      </form>

      {status !== "idle" && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            status === "success"
              ? "bg-green-500/10 border border-green-500/30"
              : "bg-red-500/10 border border-red-500/30"
          }`}
        >
          <p
            className={`text-sm ${
              status === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-600 text-center">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
}
