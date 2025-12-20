"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

// Globe Icon Component
function GlobeIcon({ className = "w-8 h-8" }: { className?: string }) {
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

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/signals", label: "Signals", icon: "📈" },
  { href: "/dashboard/courses", label: "Courses", icon: "📚" },
  { href: "/dashboard/progress", label: "Progress", icon: "🎯" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // Memoize the Supabase client to avoid recreating on every render
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          email: user.email,
          full_name: user.user_metadata?.full_name,
        });
      }
    };
    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-3">
            <GlobeIcon className="w-8 h-8" />
            <div>
              <div className="text-white font-bold">Navigating Crypto</div>
              <div className="text-xs text-gray-500">Dashboard</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                        : "text-gray-400 hover:bg-gray-900 hover:text-white"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Back to site */}
        <div className="p-4 border-t border-gray-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-900 hover:text-white transition"
          >
            <span>←</span>
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto" id="main-content">
        {/* Top Bar */}
        <header className="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6">
          <h1 className="text-white font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button
              className="text-gray-400 hover:text-white transition"
              aria-label="View notifications"
            >
              🔔
            </button>
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 hover:bg-gray-800 rounded-lg px-2 py-1 transition"
                aria-label="User menu"
                aria-expanded={showMenu}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                  {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-gray-400 text-sm hidden md:block">
                  {user?.full_name || user?.email || "User"}
                </span>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-12 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50">
                  <div className="p-3 border-b border-gray-800">
                    <div className="text-white text-sm font-medium truncate">
                      {user?.full_name || "User"}
                    </div>
                    <div className="text-gray-500 text-xs truncate">
                      {user?.email}
                    </div>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/dashboard/settings"
                      className="w-full text-left px-3 py-2 text-gray-400 hover:bg-gray-800 rounded-lg transition text-sm block"
                      onClick={() => setShowMenu(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-800 rounded-lg transition text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
