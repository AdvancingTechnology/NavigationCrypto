"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Signal, Course } from "@/lib/supabase/types";

export default function DashboardOverview() {
  // Memoize the Supabase client to avoid recreating on every render
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<any>(null);
  const [activeSignals, setActiveSignals] = useState<Signal[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({
    activeSignals: 0,
    coursesEnrolled: 0,
    progress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        // Parallelize independent queries using Promise.all
        const [
          { data: signalsData },
          { data: progressData },
          { data: completedLessons }
        ] = await Promise.all([
          // Fetch active signals
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase.from('signals') as any)
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(3),

          // Fetch user's enrolled courses (via user_progress)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase.from('user_progress') as any)
            .select('course_id')
            .eq('user_id', user.id),

          // Calculate completed lessons in parallel
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase.from('user_progress') as any)
            .select('id')
            .eq('user_id', user.id)
            .eq('completed', true)
        ]);

        // Update signals state
        if (signalsData) {
          setActiveSignals(signalsData);
          setStats(prev => ({ ...prev, activeSignals: signalsData.length }));
        }

        // Process progress data and fetch courses
        if (progressData) {
          const courseIds = [...new Set<string>(progressData.map((p: { course_id: string }) => p.course_id))];

          if (courseIds.length > 0) {
            // Fetch courses for enrolled course IDs
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: coursesData } = await (supabase.from('courses') as any)
              .select('*')
              .in('id', courseIds)
              .eq('status', 'published')
              .limit(3);

            if (coursesData) {
              setEnrolledCourses(coursesData);
            }
            setStats(prev => ({ ...prev, coursesEnrolled: courseIds.length }));
          }

          // Calculate overall progress
          const totalLessons = progressData.length;
          const completed = completedLessons?.length || 0;
          const progressPercent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
          setStats(prev => ({ ...prev, progress: progressPercent }));
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.user_metadata?.full_name || 'Trader'}
        </h2>
        <p className="text-gray-500">Here&apos;s your crypto trading overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">📈</span>
            <span className="text-cyan-400 text-sm font-semibold">Live</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.activeSignals}</div>
          <div className="text-gray-500 text-sm">Active Signals</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">📚</span>
            <span className="text-green-400 text-sm font-semibold">Learning</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.coursesEnrolled}</div>
          <div className="text-gray-500 text-sm">Courses Enrolled</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">🎯</span>
            <span className="text-purple-400 text-sm font-semibold">Progress</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.progress}%</div>
          <div className="text-gray-500 text-sm">Overall Completion</div>
        </div>
      </div>

      {/* Recent Signals & Continue Learning */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Signals */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Active Signals</h3>
            <Link href="/dashboard/signals" className="text-cyan-400 text-sm hover:underline">
              View All →
            </Link>
          </div>
          {activeSignals.length > 0 ? (
            <div className="space-y-3">
              {activeSignals.map((signal) => (
                <div key={signal.id} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        signal.action === 'LONG'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {signal.action}
                      </span>
                      <span className="text-white font-medium">{signal.pair}</span>
                    </div>
                    <span className="text-cyan-400 text-xs">Active</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">Entry</div>
                      <div className="text-gray-400">${signal.entry_price.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">TP</div>
                      <div className="text-green-400">${signal.take_profit.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">SL</div>
                      <div className="text-red-400">${signal.stop_loss.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No active signals at the moment</p>
              <p className="text-sm mt-2">Check back soon for new opportunities!</p>
            </div>
          )}
        </div>

        {/* Continue Learning */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Continue Learning</h3>
            <Link href="/dashboard/courses" className="text-cyan-400 text-sm hover:underline">
              Browse All →
            </Link>
          </div>
          {enrolledCourses.length > 0 ? (
            <div className="space-y-3">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium mb-1">{course.title}</h4>
                      <p className="text-gray-500 text-xs line-clamp-2">{course.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      course.difficulty === 'beginner'
                        ? 'bg-green-500/20 text-green-400'
                        : course.difficulty === 'intermediate'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                    </span>
                    <span className="text-gray-500 text-xs">{course.lessons_count} lessons</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>You haven&apos;t enrolled in any courses yet</p>
              <Link
                href="/dashboard/courses"
                className="inline-block mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition text-sm"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="text-white font-semibold mb-2">Pro Tip</h3>
            <p className="text-gray-400 text-sm">
              Always set stop-loss orders to manage your risk. Never invest more than you can afford to lose.
              Check our courses to learn more about risk management strategies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
