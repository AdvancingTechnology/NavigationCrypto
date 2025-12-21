"use client";

import Link from "next/link";
import Newsletter from "@/components/Newsletter";
import { useState, useEffect, useRef } from "react";

// Globe Icon Component (matching the logo)
function GlobeIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="#00B4D8" strokeWidth="4" fill="none"/>
      <ellipse cx="50" cy="50" rx="45" ry="20" stroke="#00B4D8" strokeWidth="3" fill="none"/>
      <ellipse cx="50" cy="50" rx="20" ry="45" stroke="#00B4D8" strokeWidth="3" fill="none"/>
      <line x1="5" y1="50" x2="95" y2="50" stroke="#00B4D8" strokeWidth="3"/>
      <line x1="50" y1="5" x2="50" y2="95" stroke="#00B4D8" strokeWidth="3"/>
    </svg>
  );
}

// Circuit Board Decorative Component
function CircuitLines({ position }: { position: "top" | "bottom" }) {
  return (
    <div className={`absolute ${position === "top" ? "top-0" : "bottom-0"} left-0 right-0 h-32 overflow-hidden pointer-events-none opacity-30`}>
      <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
        {position === "top" ? (
          <>
            <path d="M0 60 H200 L220 40 H300 L320 60 H450 L470 30 H550" stroke="#666" strokeWidth="2" fill="none"/>
            <path d="M600 80 H750 L770 50 H850 L870 80 H1000 L1020 40 H1200" stroke="#666" strokeWidth="2" fill="none"/>
            <circle cx="200" cy="60" r="4" fill="#666"/>
            <circle cx="320" cy="60" r="4" fill="#666"/>
            <circle cx="470" cy="30" r="4" fill="#666"/>
            <circle cx="770" cy="50" r="4" fill="#666"/>
            <circle cx="1020" cy="40" r="4" fill="#666"/>
            <path d="M100 20 V50 L120 70 H180" stroke="#666" strokeWidth="2" fill="none"/>
            <path d="M900 10 V40 L920 60 H980" stroke="#666" strokeWidth="2" fill="none"/>
            <circle cx="100" cy="20" r="3" fill="#666"/>
            <circle cx="900" cy="10" r="3" fill="#666"/>
          </>
        ) : (
          <>
            <path d="M0 40 H150 L170 70 H280 L300 40 H400" stroke="#666" strokeWidth="2" fill="none"/>
            <path d="M500 60 H650 L670 30 H780 L800 60 H950 L970 90 H1200" stroke="#666" strokeWidth="2" fill="none"/>
            <circle cx="170" cy="70" r="4" fill="#666"/>
            <circle cx="300" cy="40" r="4" fill="#666"/>
            <circle cx="670" cy="30" r="4" fill="#666"/>
            <circle cx="970" cy="90" r="4" fill="#666"/>
            <path d="M1100 100 V70 L1080 50 H1020" stroke="#666" strokeWidth="2" fill="none"/>
            <circle cx="1100" cy="100" r="3" fill="#666"/>
          </>
        )}
      </svg>
    </div>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-black relative">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <GlobeIcon className="w-10 h-10" />
              <span className="text-white font-bold text-xl">Navigating Crypto</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-400 hover:text-cyan-400 transition">Features</Link>
              <Link href="#education" className="text-gray-400 hover:text-cyan-400 transition">Education</Link>
              <Link href="#signals" className="text-gray-400 hover:text-cyan-400 transition">Signals</Link>
              <Link href="/pricing" className="text-gray-400 hover:text-cyan-400 transition">Pricing</Link>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-white hover:text-cyan-400 transition">Sign In</Link>
              <Link href="/signup" className="bg-cyan-500 text-black px-6 py-2 rounded-full font-semibold hover:bg-cyan-400 transition">
                Get Started
              </Link>
            </div>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-black/95 backdrop-blur-md" ref={mobileMenuRef}>
            <div className="px-4 py-4 space-y-3">
              <Link
                href="#features"
                className="block text-gray-400 hover:text-cyan-400 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#education"
                className="block text-gray-400 hover:text-cyan-400 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Education
              </Link>
              <Link
                href="#signals"
                className="block text-gray-400 hover:text-cyan-400 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Signals
              </Link>
              <Link
                href="/pricing"
                className="block text-gray-400 hover:text-cyan-400 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="pt-4 border-t border-gray-800 space-y-3">
                <Link
                  href="/login"
                  className="block text-white hover:text-cyan-400 transition py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block bg-cyan-500 text-black px-6 py-3 rounded-full font-semibold hover:bg-cyan-400 transition text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <CircuitLines position="top" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            <span className="text-gray-400 text-sm">Live Trading Signals Active</span>
          </div>

          {/* Logo Display */}
          <div className="flex justify-center mb-8">
            <GlobeIcon className="w-24 h-24" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Navigating
            <span className="text-cyan-400"> Crypto</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            Your all-in-one platform for crypto education, copy trading, live signals, and portfolio management.
            Learn from experts. Trade with confidence. Grow your wealth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-cyan-500 text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/25 text-center">
              Start Trading Free
            </Link>
            <button className="bg-gray-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition border border-gray-700">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {[
              { value: "$2.5M+", label: "Trading Volume" },
              { value: "15K+", label: "Active Traders" },
              { value: "89%", label: "Win Rate" },
              { value: "24/7", label: "Live Support" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Everything You Need</h2>
          <p className="text-gray-500 text-center mb-16 max-w-2xl mx-auto">
            From beginner tutorials to advanced trading signals, we&apos;ve got you covered.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "📊",
                title: "Portfolio Tracking",
                description: "Real-time portfolio analytics with live price updates and performance charts."
              },
              {
                icon: "📈",
                title: "Copy Trading",
                description: "Follow top traders and automatically mirror their trades in your portfolio."
              },
              {
                icon: "🔔",
                title: "Trading Signals",
                description: "Get instant alerts for high-probability trades from our expert analysts."
              },
              {
                icon: "🎓",
                title: "Education Hub",
                description: "Comprehensive courses from crypto basics to advanced trading strategies."
              },
              {
                icon: "🎥",
                title: "Live Streams",
                description: "Daily market analysis and trading sessions with professional traders."
              },
              {
                icon: "💼",
                title: "Wallet Tutorials",
                description: "Step-by-step guides for setting up and securing your crypto wallets."
              },
            ].map((feature, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-cyan-500/50 transition group">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="py-20 px-4 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Learn Crypto Trading the Right Way
              </h2>
              <p className="text-gray-500 text-lg mb-8">
                Our structured courses take you from complete beginner to confident trader.
                Learn at your own pace with video tutorials, live sessions, and hands-on practice.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Crypto fundamentals & blockchain basics",
                  "Technical analysis & chart patterns",
                  "Risk management & position sizing",
                  "DeFi, NFTs & emerging trends",
                  "Wallet security & best practices",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-400">
                    <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-black text-xs font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/courses" className="bg-cyan-500 text-black px-8 py-4 rounded-full font-semibold hover:bg-cyan-400 transition inline-block text-center">
                Explore Courses
              </Link>
            </div>
            <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800">
              <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
                <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-500/30 transition border border-cyan-500/50">
                  <span className="text-cyan-400 text-4xl">▶</span>
                </div>
              </div>
              <p className="text-gray-500 text-center mt-4">Watch: Introduction to Crypto Trading</p>
            </div>
          </div>
        </div>
      </section>

      {/* Signals Section */}
      <section id="signals" className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Live Trading Signals</h2>
          <p className="text-gray-500 mb-12 max-w-2xl mx-auto">
            Get real-time trading signals from our team of professional analysts.
            Entry, take profit, and stop loss levels included.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { pair: "BTC/USDT", action: "LONG", entry: "$67,450", tp: "$72,000", status: "Active", profit: "+6.7%" },
              { pair: "ETH/USDT", action: "LONG", entry: "$3,520", tp: "$3,850", status: "Active", profit: "+9.4%" },
              { pair: "XRP/USDT", action: "SHORT", entry: "$2.45", tp: "$2.20", status: "Hit TP", profit: "+10.2%" },
            ].map((signal, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white font-bold text-lg">{signal.pair}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${signal.action === 'LONG' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {signal.action}
                  </span>
                </div>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Entry:</span>
                    <span className="text-white">{signal.entry}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Take Profit:</span>
                    <span className="text-white">{signal.tp}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className="text-cyan-400">{signal.status}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <span className="text-green-400 font-bold text-xl">{signal.profit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section id="app" className="py-20 px-4 relative">
        <CircuitLines position="bottom" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-gray-900 rounded-3xl p-12 border border-gray-800">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Trade Anywhere with Our Mobile App
                </h2>
                <p className="text-gray-500 text-lg mb-8">
                  Download the Navigating Crypto app for iOS and Android.
                  Get instant notifications, execute trades, and never miss an opportunity.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-900 transition border border-gray-700">
                    <span className="text-2xl">🍎</span>
                    <div className="text-left">
                      <div className="text-xs text-gray-500">Download on the</div>
                      <div className="font-semibold">App Store</div>
                    </div>
                  </button>
                  <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-900 transition border border-gray-700">
                    <span className="text-2xl">▶️</span>
                    <div className="text-left">
                      <div className="text-xs text-gray-500">Get it on</div>
                      <div className="font-semibold">Google Play</div>
                    </div>
                  </button>
                </div>
                <p className="text-gray-600 text-sm mt-4">Coming Soon - Join the waitlist</p>
              </div>
              <div className="flex justify-center">
                <div className="w-64 h-[500px] bg-black rounded-[3rem] border-4 border-gray-800 shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <GlobeIcon className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-white font-semibold">Navigating Crypto</p>
                    <p className="text-gray-500 text-sm">Coming Soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <Newsletter showName={true} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Crypto Journey?
          </h2>
          <p className="text-gray-500 text-lg mb-10">
            Join thousands of traders who are already navigating the crypto markets with confidence.
          </p>
          <Link href="/signup" className="bg-cyan-500 text-black px-12 py-5 rounded-full font-semibold text-xl hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/25 inline-block">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <GlobeIcon className="w-10 h-10" />
                <span className="text-white font-bold text-xl">Navigating Crypto</span>
              </div>
              <p className="text-gray-500 text-sm">
                Your trusted partner in cryptocurrency education and trading.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><Link href="/dashboard/signals" className="hover:text-cyan-400 transition">Trading</Link></li>
                <li><Link href="/dashboard/signals" className="hover:text-cyan-400 transition">Signals</Link></li>
                <li><Link href="/dashboard/courses" className="hover:text-cyan-400 transition">Education</Link></li>
                <li><Link href="#" className="hover:text-cyan-400 transition">Mobile App</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><Link href="/pricing" className="hover:text-cyan-400 transition">Pricing</Link></li>
                <li><Link href="/dashboard/courses" className="hover:text-cyan-400 transition">Tutorials</Link></li>
                <li><Link href="/faq" className="hover:text-cyan-400 transition">FAQ</Link></li>
                <li><Link href="/support" className="hover:text-cyan-400 transition">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><Link href="/terms" className="hover:text-cyan-400 transition">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-cyan-400 transition">Privacy Policy</Link></li>
                <li><Link href="/terms#risk" className="hover:text-cyan-400 transition">Risk Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2025 Navigating Crypto. All rights reserved.</p>
            <p className="mt-2 text-xs">Trading cryptocurrencies involves significant risk. Past performance is not indicative of future results.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
