"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      // Insert support ticket
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("support_tickets")
        .insert({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          user_id: user?.id || null,
          status: "open"
        });

      if (error) throw error;

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      setStatus("error");
      setErrorMessage("Failed to submit your request. Please try again or email us directly.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Support
          </h1>
          <p className="text-gray-400 text-lg">
            We&apos;re here to help. Get in touch with our support team.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>

              {status === "success" && (
                <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <p className="text-green-400 font-semibold">✓ Message sent successfully!</p>
                  <p className="text-green-400/80 text-sm mt-1">
                    We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-red-400 font-semibold">✗ Error</p>
                  <p className="text-red-400/80 text-sm mt-1">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-white font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-white font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-white font-medium mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                  >
                    <option value="">Select a subject</option>
                    <option value="Account Issue">Account Issue</option>
                    <option value="Billing Question">Billing Question</option>
                    <option value="Signal Inquiry">Signal Inquiry</option>
                    <option value="Course Support">Course Support</option>
                    <option value="Technical Problem">Technical Problem</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-white font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full bg-black text-white border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition resize-none"
                    placeholder="Please describe your issue or question..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-cyan-500 text-black px-8 py-4 rounded-xl font-semibold hover:bg-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Response Time */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="text-white font-bold text-lg mb-2">Response Time</h3>
              <p className="text-gray-400 text-sm">
                We typically respond within 24 hours. Enterprise customers receive priority support with response times under 4 hours.
              </p>
            </div>

            {/* Email Contact */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="text-white font-bold text-lg mb-2">Email Us</h3>
              <p className="text-gray-400 text-sm mb-3">
                Prefer email? Send us a message directly:
              </p>
              <a
                href="mailto:support@navigatingcrypto.com"
                className="text-cyan-400 hover:text-cyan-300 transition break-all"
              >
                support@navigatingcrypto.com
              </a>
            </div>

            {/* Resources */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-white font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/faq" className="text-gray-400 hover:text-cyan-400 transition text-sm">
                    → Frequently Asked Questions
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-400 hover:text-cyan-400 transition text-sm">
                    → Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-400 hover:text-cyan-400 transition text-sm">
                    → Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/dashboard/courses" className="text-gray-400 hover:text-cyan-400 transition text-sm">
                    → Help Center & Tutorials
                  </a>
                </li>
              </ul>
            </div>

            {/* Live Chat (Coming Soon) */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="text-white font-bold text-lg mb-2">Live Chat</h3>
              <p className="text-gray-400 text-sm mb-3">
                24/7 live chat support coming soon for Pro and Enterprise members.
              </p>
              <div className="text-xs text-gray-600">
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
