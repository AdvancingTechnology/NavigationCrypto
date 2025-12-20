import Link from "next/link";

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

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <GlobeIcon className="w-10 h-10" />
              <span className="text-white font-bold text-xl">Navigating Crypto</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/faq" className="text-gray-400 hover:text-cyan-400 transition">FAQ</Link>
              <Link href="/support" className="text-gray-400 hover:text-cyan-400 transition">Support</Link>
              <Link href="/login" className="text-white hover:text-cyan-400 transition">Sign In</Link>
              <Link href="/signup" className="bg-cyan-500 text-black px-6 py-2 rounded-full font-semibold hover:bg-cyan-400 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {children}
      </main>

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
                <li><Link href="/dashboard/signals" className="hover:text-cyan-400 transition">Trading Signals</Link></li>
                <li><Link href="/dashboard/courses" className="hover:text-cyan-400 transition">Courses</Link></li>
                <li><Link href="/dashboard" className="hover:text-cyan-400 transition">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><Link href="/faq" className="hover:text-cyan-400 transition">FAQ</Link></li>
                <li><Link href="/support" className="hover:text-cyan-400 transition">Contact Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><Link href="/terms" className="hover:text-cyan-400 transition">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-cyan-400 transition">Privacy Policy</Link></li>
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
