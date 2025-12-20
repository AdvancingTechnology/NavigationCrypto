import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back, Admin</h2>
        <p className="text-gray-500">Here&apos;s what&apos;s happening with Navigating Crypto today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: "2,847", change: "+12%", icon: "👥", color: "cyan" },
          { label: "Active Signals", value: "24", change: "+3", icon: "📈", color: "green" },
          { label: "Revenue (MTD)", value: "$18,420", change: "+8%", icon: "💰", color: "yellow" },
          { label: "Course Completions", value: "156", change: "+24%", icon: "🎓", color: "purple" },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions & AI Agents */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Manage Signals", href: "/admin/signals", icon: "📈" },
              { label: "Manage Content", href: "/admin/content", icon: "📚" },
              { label: "View Users", href: "/admin/users", icon: "👥" },
              { label: "AI Agents", href: "/admin/ai-agents", icon: "🤖" },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-white">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Agent Status */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">AI Agent Team</h3>
            <Link href="/admin/ai-agents" className="text-cyan-400 text-sm hover:underline">
              Manage →
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { name: "Content Creator", status: "active", task: "Writing blog post..." },
              { name: "Signal Analyst", status: "idle", task: "Awaiting market data" },
              { name: "Social Manager", status: "active", task: "Scheduling tweets..." },
              { name: "Course Builder", status: "idle", task: "Ready for tasks" },
            ].map((agent, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                  <span className="text-white">{agent.name}</span>
                </div>
                <span className="text-gray-500 text-sm">{agent.task}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Signals */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Signals */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Signals</h3>
            <Link href="/admin/signals" className="text-cyan-400 text-sm hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { pair: "BTC/USDT", action: "LONG", status: "Active", profit: "+6.7%" },
              { pair: "ETH/USDT", action: "LONG", status: "Active", profit: "+9.4%" },
              { pair: "XRP/USDT", action: "SHORT", status: "Closed", profit: "+10.2%" },
            ].map((signal, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${signal.action === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {signal.action}
                  </span>
                  <span className="text-white">{signal.pair}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs ${signal.status === 'Active' ? 'text-cyan-400' : 'text-gray-500'}`}>
                    {signal.status}
                  </span>
                  <span className="text-green-400 font-semibold">{signal.profit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">New Users</h3>
            <Link href="/admin/users" className="text-cyan-400 text-sm hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { name: "John D.", email: "john@example.com", plan: "Pro", time: "2m ago" },
              { name: "Sarah M.", email: "sarah@example.com", plan: "Free", time: "15m ago" },
              { name: "Mike R.", email: "mike@example.com", plan: "Pro", time: "1h ago" },
            ].map((user, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 text-sm">
                    {user.name[0]}
                  </div>
                  <div>
                    <div className="text-white text-sm">{user.name}</div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs ${user.plan === 'Pro' ? 'text-cyan-400' : 'text-gray-500'}`}>
                    {user.plan}
                  </div>
                  <div className="text-gray-600 text-xs">{user.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
