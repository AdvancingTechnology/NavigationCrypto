'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Period = '7d' | '30d' | '90d' | '1y';

interface Analytics {
  totalUsers: number;
  newUsers: number;
  userGrowth: number;
  activeSignals: number;
  totalSignals: number;
  signalGrowth: number;
  winRate: number;
  winRateChange: number;
  courseCompletions: number;
  completionGrowth: number;
  topSignals: Array<{
    pair: string;
    profit: number;
    trades: number;
  }>;
  topCourses: Array<{
    title: string;
    completions: number;
    rating: number;
  }>;
  revenueData: number[];
  userGrowthData: number[];
}

const PERIOD_DAYS: Record<Period, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadAnalytics = async (selectedPeriod: Period) => {
    try {
      setLoading(true);
      const days = PERIOD_DAYS[selectedPeriod];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateISO = startDate.toISOString();

      // Calculate previous period for growth comparison
      const prevStartDate = new Date();
      prevStartDate.setDate(prevStartDate.getDate() - (days * 2));
      const prevEndDate = new Date();
      prevEndDate.setDate(prevEndDate.getDate() - days);
      const prevStartDateISO = prevStartDate.toISOString();
      const prevEndDateISO = prevEndDate.toISOString();

      // Fetch total and new users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDateISO);

      const { count: prevNewUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', prevStartDateISO)
        .lt('created_at', prevEndDateISO);

      // Fetch signals data
      const { count: totalSignals } = await supabase
        .from('signals')
        .select('*', { count: 'exact', head: true });

      const { count: activeSignals } = await supabase
        .from('signals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const { count: periodSignals } = await supabase
        .from('signals')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDateISO);

      const { count: prevPeriodSignals } = await supabase
        .from('signals')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', prevStartDateISO)
        .lt('created_at', prevEndDateISO);

      // Calculate win rate from closed signals
      const { data: closedSignals } = await supabase
        .from('signals')
        .select('profit_loss')
        .eq('status', 'closed')
        .gte('created_at', startDateISO);

      const { data: prevClosedSignals } = await supabase
        .from('signals')
        .select('profit_loss')
        .eq('status', 'closed')
        .gte('created_at', prevStartDateISO)
        .lt('created_at', prevEndDateISO);

      const winRate = calculateWinRate(closedSignals || []);
      const prevWinRate = calculateWinRate(prevClosedSignals || []);
      const winRateChange = prevWinRate > 0 ? ((winRate - prevWinRate) / prevWinRate) * 100 : 0;

      // Fetch course completions
      const { count: courseCompletions } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('completed', true)
        .gte('updated_at', startDateISO);

      const { count: prevCompletions } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('completed', true)
        .gte('updated_at', prevStartDateISO)
        .lt('updated_at', prevEndDateISO);

      // Fetch top performing signals
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: topSignalsData } = await (supabase.from('signals') as any)
        .select('pair, profit_loss')
        .eq('status', 'closed')
        .gte('created_at', startDateISO)
        .not('profit_loss', 'is', null)
        .order('profit_loss', { ascending: false })
        .limit(5);

      const topSignals = (topSignalsData || []).map((s: { pair: string; profit_loss: number | null }) => ({
        pair: s.pair,
        profit: s.profit_loss || 0,
        trades: 1, // Would need a separate trades tracking table for accurate count
      }));

      // Fetch top courses (placeholder - would need course_id in user_progress)
      const topCourses = [
        { title: "Crypto Trading for Beginners", completions: 0, rating: 4.9 },
        { title: "Technical Analysis Masterclass", completions: 0, rating: 4.8 },
        { title: "DeFi Deep Dive", completions: 0, rating: 4.7 },
        { title: "Risk Management Essentials", completions: 0, rating: 4.9 },
        { title: "NFT Trading Strategies", completions: 0, rating: 4.6 },
      ];

      // Calculate growth percentages
      const userGrowth = calculateGrowth(newUsers || 0, prevNewUsers || 0);
      const signalGrowth = calculateGrowth(periodSignals || 0, prevPeriodSignals || 0);
      const completionGrowth = calculateGrowth(courseCompletions || 0, prevCompletions || 0);

      setAnalytics({
        totalUsers: totalUsers || 0,
        newUsers: newUsers || 0,
        userGrowth,
        activeSignals: activeSignals || 0,
        totalSignals: totalSignals || 0,
        signalGrowth,
        winRate,
        winRateChange,
        courseCompletions: courseCompletions || 0,
        completionGrowth,
        topSignals,
        topCourses,
        revenueData: [45, 62, 58, 71, 68, 82, 78, 91, 85, 98, 92, 105], // Placeholder
        userGrowthData: Array(12).fill(0), // Placeholder
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWinRate = (signals: Array<{ profit_loss: number | null }>): number => {
    if (signals.length === 0) return 0;
    const wins = signals.filter(s => (s.profit_loss || 0) > 0).length;
    return (wins / signals.length) * 100;
  };

  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    loadAnalytics(newPeriod);
  };

  useEffect(() => {
    loadAnalytics(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Analytics</h2>
          <p className="text-gray-500">Track performance, revenue, and user engagement.</p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d", "1y"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition disabled:opacity-50 ${
                period === p
                  ? "bg-cyan-500 text-black font-semibold"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Users",
            value: analytics.totalUsers.toString(),
            change: `${analytics.userGrowth >= 0 ? '+' : ''}${analytics.userGrowth.toFixed(1)}%`,
            positive: analytics.userGrowth >= 0,
            icon: "👥"
          },
          {
            label: "Active Signals",
            value: analytics.activeSignals.toString(),
            change: `${analytics.signalGrowth >= 0 ? '+' : ''}${analytics.signalGrowth.toFixed(1)}%`,
            positive: analytics.signalGrowth >= 0,
            icon: "📈"
          },
          {
            label: "Signal Win Rate",
            value: `${analytics.winRate.toFixed(1)}%`,
            change: `${analytics.winRateChange >= 0 ? '+' : ''}${analytics.winRateChange.toFixed(1)}%`,
            positive: analytics.winRateChange >= 0,
            icon: "🎯"
          },
          {
            label: "Course Completions",
            value: analytics.courseCompletions.toString(),
            change: `${analytics.completionGrowth >= 0 ? '+' : ''}${analytics.completionGrowth.toFixed(1)}%`,
            positive: analytics.completionGrowth >= 0,
            icon: "🎓"
          },
        ].map((metric, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{metric.icon}</span>
              <span className={`text-sm font-medium ${metric.positive ? "text-green-400" : "text-red-400"}`}>
                {metric.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
            <div className="text-gray-500">{metric.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Overview</h3>
          <div className="text-sm text-gray-500 mb-4">Stripe integration required for live data</div>
          <div className="h-64 flex items-end gap-2">
            {analytics.revenueData.map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-cyan-500/20 rounded-t hover:bg-cyan-500/30 transition"
                  style={{ height: `${(value / 110) * 100}%` }}
                >
                  <div
                    className="w-full bg-cyan-500 rounded-t"
                    style={{ height: `${(value * 0.7 / 110) * 100}%` }}
                  />
                </div>
                <span className="text-gray-600 text-xs">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
          <div className="text-sm text-gray-500 mb-4">
            Total: {analytics.totalUsers} users | New: {analytics.newUsers} this period
          </div>
          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <path
                d="M 0 180 Q 50 160, 80 150 T 160 120 T 240 90 T 320 50 T 400 20"
                fill="none"
                stroke="#00B4D8"
                strokeWidth="3"
              />
              <path
                d="M 0 180 Q 50 160, 80 150 T 160 120 T 240 90 T 320 50 T 400 20 L 400 200 L 0 200 Z"
                fill="url(#gradient)"
                opacity="0.2"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00B4D8" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Breakdown Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Signals */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Top Performing Signals</h3>
          {analytics.topSignals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No closed signals in this period
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.topSignals.map((signal, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium w-8">{i + 1}</span>
                    <span className="text-white">{signal.pair}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500 text-sm">{signal.trades} trades</span>
                    <span className={`font-semibold ${signal.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {signal.profit >= 0 ? '+' : ''}{signal.profit.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Courses */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Top Courses</h3>
          <div className="text-sm text-gray-500 mb-4">Course tracking system in development</div>
          <div className="space-y-3">
            {analytics.topCourses.map((course, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium w-8">{i + 1}</span>
                  <span className="text-white truncate max-w-[200px]">{course.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 text-sm">{course.completions} completed</span>
                  <span className="text-yellow-400">⭐ {course.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Traffic Sources</h3>
        <div className="text-sm text-gray-500 mb-4">Analytics tracking integration required</div>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { source: "Organic Search", value: 42, textClass: "text-cyan-400", bgClass: "bg-cyan-500" },
            { source: "Social Media", value: 28, textClass: "text-purple-400", bgClass: "bg-purple-500" },
            { source: "Direct", value: 15, textClass: "text-green-400", bgClass: "bg-green-500" },
            { source: "Referral", value: 10, textClass: "text-yellow-400", bgClass: "bg-yellow-500" },
            { source: "Email", value: 5, textClass: "text-red-400", bgClass: "bg-red-500" },
          ].map((source, i) => (
            <div key={i} className="text-center">
              <div className={`text-3xl font-bold ${source.textClass} mb-1`}>{source.value}%</div>
              <div className="text-gray-500 text-sm">{source.source}</div>
              <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${source.bgClass}`}
                  style={{ width: `${source.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
