"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/lib/supabase/types";

export default function CoursesPage() {
  // Memoize the Supabase client to avoid recreating on every render
  const supabase = useMemo(() => createClient(), []);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all published courses
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: coursesData, error: coursesError } = await (supabase.from('courses') as any)
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (coursesError) {
          setError('Failed to load courses. Please try refreshing the page.');
          setLoading(false);
          return;
        }

        if (coursesData) {
          setCourses(coursesData);
        }

        // Fetch user's enrolled courses
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: progressData, error: progressError } = await (supabase.from('user_progress') as any)
          .select('course_id')
          .eq('user_id', user.id);

        if (progressError) {
          console.error('Error loading progress:', progressError);
        } else if (progressData) {
          const enrolled = new Set<string>(progressData.map((p: { course_id: string }) => p.course_id));
          setEnrolledCourseIds(enrolled);
        }
      } catch (err) {
        console.error('Error loading courses:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [supabase]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all lessons for this course
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: lessons } = await (supabase.from('course_lessons') as any)
        .select('id')
        .eq('course_id', courseId)
        .order('order_index');

      if (lessons && lessons.length > 0) {
        // Create progress entries for all lessons
        const progressEntries = lessons.map((lesson: { id: string }) => ({
          user_id: user.id,
          course_id: courseId,
          lesson_id: lesson.id,
          completed: false,
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('user_progress') as any)
          .insert(progressEntries);

        if (!error) {
          setEnrolledCourseIds(prev => new Set([...prev, courseId]));
          setToast({
            type: 'success',
            message: 'Successfully enrolled! Check your Progress page to start learning.'
          });
        } else {
          setToast({
            type: 'error',
            message: 'Failed to enroll. Please try again.'
          });
        }
      }
    } catch (err) {
      console.error('Error enrolling:', err);
      setToast({
        type: 'error',
        message: 'Failed to enroll. Please try again.'
      });
    } finally {
      setEnrolling(null);
    }
  };

  const filteredCourses = selectedDifficulty === "all"
    ? courses
    : courses.filter(c => c.difficulty === selectedDifficulty);

  const getDifficultyBadge = (difficulty: string) => {
    const styles = {
      beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
      intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[difficulty as keyof typeof styles] || styles.beginner;
  };

  const getProgressPercent = (courseId: string) => {
    // This would need to be calculated from user_progress data
    // For now, return 0 for enrolled courses
    return enrolledCourseIds.has(courseId) ? 0 : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400" role="status" aria-live="polite">
          Loading courses...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Courses</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border transition-all ${
            toast.type === 'success'
              ? 'bg-green-500/20 border-green-500/50 text-green-400'
              : 'bg-red-500/20 border-red-500/50 text-red-400'
          }`}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{toast.type === 'success' ? '✓' : '⚠️'}</span>
            <p className="font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-4 hover:opacity-70"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Course Catalog</h2>
        <p className="text-gray-500">
          Master crypto trading with expert-led courses
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-gray-400 text-sm">Filter by difficulty:</span>
        {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
          <button
            key={level}
            onClick={() => setSelectedDifficulty(level)}
            className={`px-3 py-1.5 rounded-lg text-sm transition capitalize ${
              selectedDifficulty === level
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {level === 'all' ? 'All Levels' : level}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            const progress = getProgressPercent(course.id);

            return (
              <div
                key={course.id}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition group"
              >
                {/* Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center relative overflow-hidden">
                  {course.thumbnail_url ? (
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                      priority={false}
                    />
                  ) : (
                    <div className="text-6xl">📚</div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getDifficultyBadge(course.difficulty)}`}>
                      {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition">
                    {course.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {course.description || 'Learn essential crypto trading concepts and strategies.'}
                  </p>

                  {/* Course Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <span>📖</span>
                      <span>{course.lessons_count} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{course.duration_minutes} min</span>
                    </div>
                  </div>

                  {/* Progress Bar (if enrolled) */}
                  {isEnrolled && progress !== null && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Price & Action */}
                  <div className="flex items-center justify-between">
                    {course.price > 0 ? (
                      <div className="text-white font-bold">${course.price}</div>
                    ) : (
                      <div className="text-green-400 font-bold">Free</div>
                    )}
                    <button
                      onClick={() => !isEnrolled && handleEnroll(course.id)}
                      disabled={isEnrolled || enrolling === course.id}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                        isEnrolled
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : enrolling === course.id
                          ? 'bg-gray-700 text-gray-400 cursor-wait'
                          : 'bg-cyan-500 text-white hover:bg-cyan-600'
                      }`}
                    >
                      {isEnrolled ? 'Enrolled ✓' : enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-white mb-2">No Courses Found</h3>
          <p className="text-gray-500 mb-4">
            {selectedDifficulty === "all"
              ? "No courses are available at the moment. Check back soon!"
              : `No ${selectedDifficulty} courses available. Try a different difficulty level.`}
          </p>
          {selectedDifficulty !== "all" && (
            <button
              onClick={() => setSelectedDifficulty("all")}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
            >
              View All Courses
            </button>
          )}
        </div>
      )}

      {/* Learning Path Info */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🎓</div>
          <div>
            <h3 className="text-white font-semibold mb-2">Recommended Learning Path</h3>
            <p className="text-gray-400 text-sm mb-3">
              Start with beginner courses to build a strong foundation, then progress to intermediate
              and advanced topics. Track your progress in the Progress page.
            </p>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">1. Beginner</span>
              <span className="text-gray-500">→</span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">2. Intermediate</span>
              <span className="text-gray-500">→</span>
              <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">3. Advanced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
